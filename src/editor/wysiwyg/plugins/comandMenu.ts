import { EditorState, Plugin } from 'prosemirror-state';
import { Decoration, DecorationSet, EditorView } from 'prosemirror-view';
import { findParentNode } from 'prosemirror-utils';
import { Emitter } from '@editorType/event';

const MAX_MATCH = 500;
const OPEN_REGEX = /^\/(\w+)?$/;

function run(
    view: EditorView,
    from: number,
    to: number,
    regex: RegExp,
    handler: (
        state: EditorState,
        match: RegExpExecArray | null,
        from?: number,
        to?: number
    ) => boolean | null
) {
    if (view.composing) {
        return false;
    }

    const state = view.state;
    const $from = state.doc.resolve(from);

    if ($from.parent.type.spec.code) {
        return false;
    }

    const textBefore = $from.parent.textBetween(
        Math.max(0, $from.parentOffset - MAX_MATCH),
        $from.parentOffset,
        undefined,
        '\ufffc'
    );

    const match = regex.exec(textBefore);
    const tr = handler(state, match, match ? from - match[0].length : from, to);
    if (!tr) {
        return false;
    }
    return true;
}

export function commandMenuPlugin(eventEmitter: Emitter) {
    return new Plugin({
        props: {
            handleClick: () => {
                console.log('--- handleClick ---');
                eventEmitter.emit('closeCommandMenu');
                return false;
            },
            // 完整的 event.key 参考:
            // https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values
            handleKeyDown: (view, event) => {
                // Prosemirror input rules are not triggered on backspace, however
                // we need them to be evaluted for the filter trigger to work
                // correctly. This additional handler adds inputrules-like handling.
                if (event.key === 'Backspace') {
                    // timeout ensures that the delete has been handled by prosemirror
                    // and any characters removed, before we evaluate the rule.
                    setTimeout(() => {
                        const { pos } = view.state.selection.$from;
                        return run(view, pos, pos, OPEN_REGEX, (state, match) => {
                            if (match) {
                                // this.options.onOpen(match[1]);
                                eventEmitter.emit('openCommandMenu');
                            } else {
                                // this.options.onClose();
                                eventEmitter.emit('closeCommandMenu');
                            }
                            return null;
                        });
                    });
                    console.log('--- handleKeyDown Backspace ---');
                }

                if (event.key === 'Escape') {
                    eventEmitter.emit('closeCommandMenu');
                }
                // If the query is active and we're navigating the block menu then
                // just ignore the key events in the editor itself until we're done
                if (
                    event.key === 'Enter' ||
                    event.key === 'ArrowUp' ||
                    event.key === 'ArrowDown' ||
                    event.key === 'Tab'
                ) {
                    /* const { pos } = view.state.selection.$from;

                    return run(view, pos, pos, OPEN_REGEX, (state, match) => {
                        // just tell Prosemirror we handled it and not to do anything
                        return match ? true : null;
                    }); */
                    console.log('--- handleKeyDown Enter ArrowUp ArrowDown Tab');
                    const { pos } = view.state.selection.$from;

                    return run(view, pos, pos, OPEN_REGEX, (state, match) => {
                        // just tell Prosemirror we handled it and not to do anything
                        return match ? true : null;
                    });
                }

                return false;
            },
            decorations: (state) => {
                const parent = findParentNode((node) => node.type.name === 'paragraph')(
                    state.selection
                );

                if (!parent) {
                    return;
                }

                const decorations: Decoration[] = [];
                const isEmpty = parent && parent.node.content.size === 0;
                const isSlash = parent && parent.node.textContent === '/';
                const isTopLevel = state.selection.$from.depth === 1;

                if (isTopLevel) {
                    if (isEmpty) {
                        /* decorations.push(
                            Decoration.widget(parent.pos, () => {
                                button.addEventListener('click', () => {
                                    this.options.onOpen('');
                                });
                                return button;
                            })
                        ); */

                        decorations.push(
                            Decoration.node(parent.pos, parent.pos + parent.node.nodeSize, {
                                class: 'command-placeholder',
                                // 'data-empty-text': this.options.dictionary.newLineEmpty
                                'data-empty-text': `Type '/' for commands`
                            })
                        );
                    }

                    if (isSlash) {
                        decorations.push(
                            Decoration.node(parent.pos, parent.pos + parent.node.nodeSize, {
                                class: 'command-placeholder',
                                // 'data-empty-text': `  ${this.options.dictionary.newLineWithSlash}`
                                'data-empty-text': ' Keep typing to filter... '
                            })
                        );
                    }

                    return DecorationSet.create(state.doc, decorations);
                }

                return;
            }
        }
    });
}
