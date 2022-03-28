import { nodeTypeWriters } from '@/convertors/toMarkdown/toMdNodeTypeWriters';
import { Node } from 'prosemirror-model';
import { EditorState, Plugin } from 'prosemirror-state';
import { findParentNode } from 'prosemirror-utils';
import { Decoration, DecorationSet, EditorView } from 'prosemirror-view';

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

const hasAllNodeNoExist = (types, nodes) => {
    return types.every((type) => !nodes[`${type}Parent`]);
};

export function placeholderPlugin() {
    return new Plugin({
        props: {
            decorations: (state) => {
                const parents = getTotalParentNode(state, typeMap);
                console.log('--- state.selection ---', state.selection);
                console.log('--- total parents ---', parents);
                const { headingParent, paragraphParent, taskItemParent } = parents;

                console.log(
                    '--- parents ---',
                    // findParentNode((node) => !!node.attrs.task)(state.selection)
                    getParentNodeByAttrs(state, 'task', true)
                );

                if (hasAllNodeNoExist(typeMap, parents)) {
                    return;
                }

                const decorations: Decoration[] = [];
                const isTopLevel = state.selection.$from.depth === 1;
                const isSlash = paragraphParent && paragraphParent.node.textContent === '/';

                // Task List 时触发
                console.log(
                    '--- taskItemParent ---',
                    isEmpty(taskItemParent),
                    taskItemParent,
                    taskItemParent?.node.child(0)
                );

                if (taskItemParent && taskItemParent?.node?.firstChild.content.size === 0) {
                    console.log('---- taskItemParent true ----');
                    const taskItemChildNode = taskItemParent.node.firstChild;
                    decorations.push(
                        Decoration.node(
                            taskItemChildNode.pos,
                            taskItemChildNode.pos + taskItemChildNode.node.nodeSize,
                            {
                                class: 'empty-placeholder',
                                'data-placeholder': 'To-Do'
                            }
                        )
                    );
                }

                if (isTopLevel) {
                    if (isEmpty(headingParent)) {
                        decorations.push(
                            Decoration.node(
                                headingParent.pos,
                                headingParent.pos + headingParent.node.nodeSize,
                                {
                                    class: 'empty-placeholder',
                                    'data-placeholder': `Heading ${headingParent.node.attrs.level}`
                                }
                            )
                        );
                    }

                    // command menu 待触发时显示的 placeholder
                    if (isEmpty(paragraphParent)) {
                        decorations.push(
                            Decoration.node(
                                paragraphParent.pos,
                                paragraphParent.pos + paragraphParent.node.nodeSize,
                                {
                                    class: 'command-placeholder',
                                    // TODO: 增加文案可配置
                                    'data-empty-text': `Type '/' for commands`
                                }
                            )
                        );
                    }

                    // command menu 触发后显示的 placeholder
                    if (isSlash) {
                        decorations.push(
                            Decoration.node(
                                paragraphParent.pos,
                                paragraphParent.pos + paragraphParent.node.nodeSize,
                                {
                                    class: 'command-placeholder',
                                    'data-empty-text': ' Keep typing to filter... '
                                }
                            )
                        );
                    }
                }

                return DecorationSet.create(state.doc, decorations);
            }
        }
    });
}
