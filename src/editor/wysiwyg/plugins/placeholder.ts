import { nodeTypeWriters } from '@/convertors/toMarkdown/toMdNodeTypeWriters';
import { EditorState, Plugin } from 'prosemirror-state';
import { findParentNode } from 'prosemirror-utils';
import { Decoration, DecorationSet, EditorView } from 'prosemirror-view';

const typeMap = ['heading', 'paragraph'];

const getParentNode = (state, typeName: string) => {
    return findParentNode((node) => node.type.name === typeName)(state.selection);
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
        obj[`${type}Parent`] = getParentNode(state, type);
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
                const { headingParent, paragraphParent } = parents;

                if (hasAllNodeNoExist(typeMap, parents)) {
                    return;
                }

                const decorations: Decoration[] = [];
                const isTopLevel = state.selection.$from.depth === 1;
                const isSlash = paragraphParent && paragraphParent.node.textContent === '/';

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
