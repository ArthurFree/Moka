import { nodeTypeWriters } from '@/convertors/toMarkdown/toMdNodeTypeWriters';
import { Node } from 'prosemirror-model';
import { EditorState, Plugin } from 'prosemirror-state';
import { findParentNode, findChildren } from 'prosemirror-utils';
import { Decoration, DecorationSet, EditorView } from 'prosemirror-view';
import commandMenuDecorations from './decorations/commandmenu';
import taskListDecorations from './decorations/taskList';
import headingDecorations from './decorations/heading';
import { hasAllNodeNoExist } from './utils';

type getNodeFn = (node: Node) => boolean;

const typeMap = ['heading', 'paragraph', 'taskItem'];

/* const getParentNodeByTypeName = (state, typeName: string) => {
    return findParentNode((node) => node.type.name === typeName)(state.selection);
}; */

const getParentNode = (state, fn: getNodeFn) => {
    return findParentNode(fn)(state.selection);
};

/**
 * 根据 Node.type.name 获取节点
 * @param state ProseMirror State
 * @param typeName string
 * @returns
 */
const getParentNodeByTypeName = (state, typeName) => {
    return getParentNode(state, (node) => node.type.name === typeName);
};

/**
 * 根据 attr 获取目标节点
 * @param state
 * @param attrName attr 名称
 * @param attrValue attr 预期的值
 * @returns
 */
const getParentNodeByAttrs = (state, attrName: string, attrValue) => {
    return getParentNode(state, (node) => node.attrs[attrName] === attrValue);
};

const isEmpty = (parent) => {
    if (parent && parent.node.content.size === 0) {
        return true;
    }

    return false;
};

const getTotalParentNode = (state, types) => {
    const obj: { [key: string]: any } = {};
    types.forEach((type) => {
        if (type === 'taskItem') {
            obj[`${type}Parent`] = getParentNodeByAttrs(state, 'task', true);
        } else {
            obj[`${type}Parent`] = getParentNodeByTypeName(state, type);
        }
    });

    return obj;
};

export function placeholderPlugin() {
    return new Plugin({
        props: {
            decorations: (state) => {
                // const parents = getTotalParentNode(state, typeMap);
                // console.log('--- state.selection ---', state.selection);
                // console.log('--- total parents ---', parents);
                // const { headingParent, paragraphParent, taskItemParent } = parents;

                // console.log(
                //     '--- parents ---',
                //     // findParentNode((node) => !!node.attrs.task)(state.selection)
                //     getParentNodeByAttrs(state, 'task', true)
                // );

                // if (hasAllNodeNoExist(typeMap, parents)) {
                //     return;
                // }

                // const decorations: Decoration[] = [];
                // const isTopLevel = state.selection.$from.depth === 1;
                // const isSlash = paragraphParent && paragraphParent.node.textContent === '/';

                // // Task List 时触发
                // console.log(
                //     '--- taskItemParent ---',
                //     isEmpty(taskItemParent),
                //     taskItemParent,
                //     taskItemParent?.node.child(0)
                // );

                // if (taskItemParent && taskItemParent?.node?.firstChild.content.size === 0) {
                //     console.log(
                //         '---- taskItemParent true ----',
                //         /* findChildren(
                //             taskItemParent.node,
                //             (child) => child.type.name === 'paragraph',
                //             false
                //         ) */
                //         taskItemParent.node.toJSON()
                //     );
                //     const taskItemChildNode = taskItemParent.node.firstChild;
                //     decorations.push(
                //         /**
                //          * Decoration.node 创建一个 node decoration。
                //          * from 和 to 应该精确的指向在文档中的某个节点的前面和后面
                //          *
                //          * 这里 from 和 to 有一个示例进行参考:
                //          *      4
                //          *      <li class="task-list-item " data-task="true">
                //          *      5<p>
                //          *      6<br class="ProseMirror-trailingBreak">
                //          *      7</p>
                //          *      8</li>
                //          * 方法接收的 from 为 4, to 为 8 时，
                //          * 会在 li 元素上增加 class="empty-placeholder" 和 data-placeholder="To-Do" 属性
                //          *
                //          * 方法接收的 from 为 5, to 为 7 时，
                //          * 会在 p 元素上增加 class="empty-placeholder" 和 data-placeholder="To-Do" 属性
                //          *
                //          * 由此可以看出，精确的位置是指开始节点前以及结尾节点前的位置
                //          */
                //         Decoration.node(
                //             // taskItemParent.start = taskItemParent.pos + 1
                //             taskItemParent.start,
                //             // taskItemChildNode.nodeSize = 2
                //             taskItemParent.start + taskItemChildNode.nodeSize,
                //             {
                //                 class: 'empty-placeholder',
                //                 'data-placeholder': 'To-Do'
                //             }
                //         )
                //     );
                // }

                // if (isTopLevel) {
                //     if (isEmpty(headingParent)) {
                //         decorations.push(
                //             Decoration.node(
                //                 headingParent.pos,
                //                 headingParent.pos + headingParent.node.nodeSize,
                //                 {
                //                     class: 'empty-placeholder',
                //                     'data-placeholder': `Heading ${headingParent.node.attrs.level}`
                //                 }
                //             )
                //         );
                //     }

                //     // command menu 待触发时显示的 placeholder
                //     if (isEmpty(paragraphParent)) {
                //         console.log(
                //             '--- paragraphParent.pos ---',
                //             paragraphParent.pos,
                //             paragraphParent.node.nodeSize
                //         );
                //         decorations.push(
                //             Decoration.node(
                //                 paragraphParent.pos,
                //                 paragraphParent.pos + paragraphParent.node.nodeSize,
                //                 {
                //                     class: 'command-placeholder',
                //                     // TODO: 增加文案可配置
                //                     'data-empty-text': `Type '/' for commands`
                //                 }
                //             )
                //         );
                //     }

                //     // command menu 触发后显示的 placeholder
                //     if (isSlash) {
                //         decorations.push(
                //             Decoration.node(
                //                 paragraphParent.pos,
                //                 paragraphParent.pos + paragraphParent.node.nodeSize,
                //                 {
                //                     class: 'command-placeholder',
                //                     'data-empty-text': ' Keep typing to filter... '
                //                 }
                //             )
                //         );
                //     }
                // }

                let decorations: Decoration[] = [];

                decorations.push(commandMenuDecorations(state));
                decorations.push(taskListDecorations(state));
                decorations.push(headingDecorations(state));

                if (decorations.every((decoration) => !decoration)) {
                    return;
                }

                decorations = decorations.filter((decoration) => !!decoration);

                return DecorationSet.create(state.doc, decorations);
            }
        }
    });
}
