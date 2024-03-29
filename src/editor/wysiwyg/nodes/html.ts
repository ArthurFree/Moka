import {
    Node as ProsemirrorNode,
    Mark as ProsemirrorMark,
    DOMOutputSpecArray,
    NodeSpec,
    MarkSpec
} from 'prosemirror-model';
import { MdNode } from '@toastmarkType/index';
import toArray from 'tui-code-snippet/collection/toArray';
import { Sanitizer, HTMLSchemaMap, CustomHTMLRenderer } from '@editorType/editor';
import { ToDOMAdaptor } from '@editorType/convertor';
import { registerTagWhitelistIfPossible } from '@/sanitizer/htmlSanitizer';
import { reHTMLTag, ATTRIBUTE } from '@/utils/constants';

export function getChildrenHTML(node: MdNode, typeName: string) {
    return node
        .literal!.replace(new RegExp(`(<\\s*${typeName}[^>]*>)|(</${typeName}\\s*[>])`, 'ig'), '')
        .trim();
}

export function getHTMLAttrsByHTMLString(html: string) {
    html = html.match(reHTMLTag)![0];
    const attrs = html.match(new RegExp(ATTRIBUTE, 'g'));

    return attrs
        ? attrs.reduce<Record<string, string | null>>((acc, attr) => {
              const [name, ...values] = attr.trim().split('=');

              if (values.length) {
                  acc[name] = values.join('=').replace(/'|"/g, '').trim();
              }

              return acc;
          }, {})
        : {};
}

/**
 * 获取 dom 元素属性集合
 * @param {HTMLElement} dom 元素
 * @returns {Array} => { [attrKey]: attrValue }
 */
function getHTMLAttrs(dom: HTMLElement) {
    return toArray(dom.attributes).reduce<Record<string, string | null>>((acc, attr) => {
        acc[attr.nodeName] = attr.nodeValue;
        return acc;
    }, {});
}

export function sanitizeDOM(
    node: ProsemirrorNode | ProsemirrorMark,
    typeName: string,
    sanitizer: Sanitizer,
    wwToDOMAdaptor: ToDOMAdaptor
) {
    let dom = wwToDOMAdaptor.getToDOMNode(typeName)!(node) as HTMLElement;
    const html = sanitizer(dom.outerHTML);
    const container = document.createElement('div');

    container.innerHTML = html;
    dom = container.firstChild as HTMLElement;

    const htmlAttrs = getHTMLAttrs(dom);

    return { dom, htmlAttrs };
}

const schemaFactory = {
    htmlBlock(typeName: string, sanitizeHTML: Sanitizer, wwToDOMAdaptor: ToDOMAdaptor): NodeSpec {
        return {
            atom: true,
            content: 'block+',
            group: 'block',
            attrs: {
                htmlAttrs: { default: {} },
                childrenHTML: { default: '' },
                htmlBlock: { default: true }
            },
            parseDOM: [
                {
                    tag: typeName,
                    getAttrs(dom: Node | string) {
                        return {
                            htmlAttrs: getHTMLAttrs(dom as HTMLElement),
                            childrenHTML: (dom as HTMLElement).innerHTML
                        };
                    }
                }
            ],
            toDOM(node: ProsemirrorNode): DOMOutputSpecArray {
                const { dom, htmlAttrs } = sanitizeDOM(
                    node,
                    typeName,
                    sanitizeHTML,
                    wwToDOMAdaptor
                );

                htmlAttrs.class = htmlAttrs.class ? `${htmlAttrs.class} html-block` : 'html-block';

                return [typeName, htmlAttrs, ...toArray(dom.childNodes)];
            }
        };
    },
    htmlInline(typeName: string, sanitizeHTML: Sanitizer, wwToDOMAdaptor: ToDOMAdaptor): MarkSpec {
        return {
            attrs: {
                htmlAttrs: { default: {} },
                htmlInline: { default: true }
            },
            parseDOM: [
                {
                    // colors: typeName = 'span'
                    tag: typeName,
                    getAttrs(dom: Node | string) {
                        return {
                            htmlAttrs: getHTMLAttrs(dom as HTMLElement)
                        };
                    }
                }
            ],
            toDOM(node: ProsemirrorMark): DOMOutputSpecArray {
                const { htmlAttrs } = sanitizeDOM(node, typeName, sanitizeHTML, wwToDOMAdaptor);

                return [typeName, htmlAttrs, 0];
            }
        };
    }
};

export function createHTMLSchemaMap(
    convertorMap: CustomHTMLRenderer,
    sanitizeHTML: Sanitizer,
    wwToDOMAdaptor: ToDOMAdaptor
): HTMLSchemaMap {
    const htmlSchemaMap: HTMLSchemaMap = { nodes: {}, marks: {} };

    (['htmlBlock', 'htmlInline'] as const).forEach((htmlType) => {
        // htmlType => htmlInline
        // convertorMap[htmlType] => span() => {}
        if (convertorMap[htmlType]) {
            // type => 'span'
            Object.keys(convertorMap[htmlType]!).forEach((type) => {
                // colors: targetType => marks
                const targetType = htmlType === 'htmlBlock' ? 'nodes' : 'marks';

                // register tag white list for preventing to remove the html in sanitizer
                registerTagWhitelistIfPossible(type);
                // colors: htmlSchemaMap['marks']['span'] = {}
                htmlSchemaMap[targetType][type] = schemaFactory[htmlType](
                    type,
                    sanitizeHTML,
                    wwToDOMAdaptor
                );
            });
        }
    });

    return htmlSchemaMap;
}
