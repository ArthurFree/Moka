import { Plugin } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';
import { findParentNode } from 'prosemirror-utils';
import { selectTable, getCellsInColumn, isTableSelected, isRowSelected, select } from './utils';

export function tableCellPlugin(editor) {
    return new Plugin({
        props: {
            decorations: (state) => {
                const { doc, selection } = state;
                const decorations: Decoration[] = [];
                const cells = getCellsInColumn(0)(selection);

                if (cells) {
                    cells.forEach(({ pos, node }, index) => {
                        if (index === 0) {
                            decorations.push(
                                Decoration.widget(pos + 1, () => {
                                    let className = 'grip-table';
                                    const selected = isTableSelected(selection);
                                    if (selected) {
                                        className += ' selected';
                                    }
                                    const grip = document.createElement('div');
                                    grip.className = className;
                                    grip.addEventListener('mousedown', (event) => {
                                        event.preventDefault();
                                        event.stopImmediatePropagation();
                                        editor.view.dispatch(selectTable(state.tr));
                                    });
                                    return grip;
                                })
                            );
                        }
                        let position = pos;
                        const table = findParentNode((node) => node.type.name === 'table')(
                            selection
                        );
                        const tableRect = editor.view.coordsAtPos(table.pos);
                        // TODO: 临时处理，getCellsInColumn 对于 tbody thead 的计算目前不正确
                        if (index === 0) {
                            position += 1;
                        } else {
                            // position += 4;
                            position += 3;
                        }
                        decorations.push(
                            Decoration.widget(position, (view) => {
                                const rowSelected = isRowSelected(index)(selection);
                                const trEl = view.domAtPos(position)?.node as HTMLElement;
                                const trElRect = trEl?.getBoundingClientRect();

                                let className = 'grip-row';
                                if (rowSelected) {
                                    className += ' selected';
                                }
                                if (index === 0) {
                                    className += ' first';
                                }
                                if (index === cells.length - 1) {
                                    className += ' last';
                                }
                                const grip = document.createElement('div');
                                grip.className = className;
                                grip.style.height = trElRect.height + 'px';
                                grip.style.top = trElRect.top - tableRect.top + 'px';
                                grip.addEventListener('mousedown', (event) => {
                                    event.preventDefault();
                                    event.stopImmediatePropagation();
                                    editor.view.dispatch(select('row')(index, null)(state.tr));
                                });
                                return grip;
                            })
                        );
                    });
                }

                return DecorationSet.create(doc, decorations);
            }
        }
    });
}
