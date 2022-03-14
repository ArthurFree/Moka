import isFunction from 'tui-code-snippet/type/isFunction';
import {
    HTMLConvertorMap,
    MdNode,
    ListItemMdNode,
    CodeMdNode,
    CodeBlockMdNode,
    CustomInlineMdNode,
    OpenTagToken,
    Context,
    HTMLConvertor
} from '@toastmarkType/index';
import { LinkAttributes, CustomHTMLRenderer } from '@editorType/editor';
import { HTMLMdNode } from '@editorType/markdown';
import { getWidgetContent, widgetToDOM } from '@/widget/rules';
import { getChildrenHTML, getHTMLAttrsByHTMLString } from '@/wysiwyg/nodes/html';
import { includes } from '@/utils/common';
import { reHTMLTag } from '@/utils/constants';

type TokenAttrs = Record<string, any>;

const reCloseTag = /^\s*<\s*\//;

// 基础转换器 Map
const baseConvertors: HTMLConvertorMap = {
    paragraph(_, { entering, origin, options }: Context) {
        if (options.nodeId) {
            return {
                type: entering ? 'openTag' : 'closeTag',
                outerNewLine: true,
                tagName: 'p'
            };
        }

        return origin!();
    },

    softbreak(node: MdNode) {
        const isPrevNodeHTML = node.prev && node.prev.type === 'htmlInline';
        const isPrevBR = isPrevNodeHTML && /<br ?\/?>/.test(node.prev!.literal!);
        const content = isPrevBR ? '\n' : '<br>\n';

        return { type: 'html', content };
    },

    item(node: MdNode, { entering }: Context) {
        if (entering) {
            const attributes: TokenAttrs = {};
            const classNames = [];

            if ((node as ListItemMdNode).listData.task) {
                attributes['data-task'] = '';
                classNames.push('task-list-item');
                if ((node as ListItemMdNode).listData.checked) {
                    classNames.push('checked');
                    attributes['data-task-checked'] = '';
                }
            }

            return {
                type: 'openTag',
                tagName: 'li',
                classNames,
                attributes,
                outerNewLine: true
            };
        }

        return {
            type: 'closeTag',
            tagName: 'li',
            outerNewLine: true
        };
    },

    code(node: MdNode) {
        const attributes = { 'data-backticks': String((node as CodeMdNode).tickCount) };

        return [
            { type: 'openTag', tagName: 'code', attributes },
            { type: 'text', content: node.literal! },
            { type: 'closeTag', tagName: 'code' }
        ];
    },

    codeBlock(node: MdNode) {
        const { fenceLength, info } = node as CodeBlockMdNode;
        const infoWords = info ? info.split(/\s+/) : [];
        const preClasses = [];
        const codeAttrs: TokenAttrs = {};

        if (fenceLength > 3) {
            codeAttrs['data-backticks'] = fenceLength;
        }
        if (infoWords.length > 0 && infoWords[0].length > 0) {
            const [lang] = infoWords;

            preClasses.push(`lang-${lang}`);
            codeAttrs['data-language'] = lang;
        }

        return [
            { type: 'openTag', tagName: 'pre', classNames: preClasses },
            { type: 'openTag', tagName: 'code', attributes: codeAttrs },
            { type: 'text', content: node.literal! },
            { type: 'closeTag', tagName: 'code' },
            { type: 'closeTag', tagName: 'pre' }
        ];
    },

    customInline(node: MdNode, { origin, entering, skipChildren }: Context) {
        const { info } = node as CustomInlineMdNode;

        if (info.indexOf('widget') !== -1 && entering) {
            skipChildren();
            const content = getWidgetContent(node as CustomInlineMdNode);
            const htmlInline = widgetToDOM(info, content).outerHTML;

            return [
                { type: 'openTag', tagName: 'span', classNames: ['tui-widget'] },
                { type: 'html', content: htmlInline },
                { type: 'closeTag', tagName: 'span' }
            ];
        }
        return origin!();
    }
};

/**
 * 获取 HTML 渲染转换器
 * @param linkAttributes
 * @param customConvertors
 * @returns
 */
export function getHTMLRenderConvertors(
    linkAttributes: LinkAttributes | null,
    customConvertors: CustomHTMLRenderer
) {
    const convertors = { ...baseConvertors };

    if (linkAttributes) {
        // 如果设置了链接的属性，比如 target 等，对标签赋予 attributes 后挂到 convertors 转换器上
        convertors.link = (_, { entering, origin }: Context) => {
            const result = origin!();

            if (entering) {
                (result as OpenTagToken).attributes = {
                    ...(result as OpenTagToken).attributes,
                    ...linkAttributes
                } as TokenAttrs;
            }
            return result;
        };
    }

    if (customConvertors) {
        // Object.keys(customConvertors) => nodeType => [chart / codeBlock / htmlIine / tableCell / tableRow]
        Object.keys(customConvertors).forEach((nodeType: string) => {
            // base 基础类型中读取对应的转换器，没有为 undefined
            const orgConvertor = convertors[nodeType];
            // 从 Plugin 中读取的转换器
            const customConvertor = customConvertors[nodeType]!;

            // 基础类型中存在，并且 plugin 中读取的转换器是函数类型
            if (orgConvertor && isFunction(customConvertor)) {
                convertors[nodeType] = (node, context) => {
                    const newContext = { ...context };

                    newContext.origin = () => orgConvertor(node, context);
                    return customConvertor(node, newContext);
                };
            } else if (
                // 基础类型中不存在，或者 plugin 中的转换器不是函数类型的
                // 判断类型是否是 htmlBlock / htmlInline
                // 且 plugin 中的转换器不是函数类型
                includes(['htmlBlock', 'htmlInline'], nodeType) &&
                !isFunction(customConvertor)
            ) {
                // 将 nodeType 挂载到 convertors 上
                convertors[nodeType] = (node, context) => {
                    // 正则:
                    // OPEN_TAG = `<(${TAG_NAME})(${ATTRIBUTE})*\\s*/?>`;
                    // CLOSE_TAG = `</(${TAG_NAME})\\s*[>]`;
                    // HTML_TAG = `(?:${OPEN_TAG}|${CLOSE_TAG})`;
                    // reHTMLTag = new RegExp(`^${HTML_TAG}`, 'i');
                    // 变量说明:
                    // node: MdNode 类型
                    // literal - 文字 - string 类型
                    const matched = node.literal!.match(reHTMLTag);

                    // 判断节点是否符合正则
                    if (matched) {
                        // 取出匹配内容
                        const [rootHTML, openTagName, , closeTagName] = matched;
                        // 标签转小写
                        // typename - 标签名称 span / p 这种
                        const typeName = (openTagName || closeTagName).toLowerCase();
                        const htmlConvertor = customConvertor[typeName];
                        const childrenHTML = getChildrenHTML(node, typeName);

                        if (htmlConvertor) {
                            // copy for preventing to overwrite the originial property
                            const newNode: HTMLMdNode = { ...node };

                            newNode.attrs = getHTMLAttrsByHTMLString(rootHTML);
                            newNode.childrenHTML = childrenHTML;
                            newNode.type = typeName;
                            // reCloseTag = /^\s*<\s*\//;
                            context.entering = !reCloseTag.test(node.literal!);

                            return htmlConvertor(newNode, context);
                        }
                    }
                    return context.origin!();
                };
            } else {
                // 基础类型中不存在，或者 plugin 中的转换器不是函数
                // 且不是 htmlBlock / htmlInline 类型 或者 plugin 转换器是个函数
                // 直接将 plugin 的转换器挂载到 convertors 上
                convertors[nodeType] = customConvertor as HTMLConvertor;
            }
        });
    }

    return convertors;
}
