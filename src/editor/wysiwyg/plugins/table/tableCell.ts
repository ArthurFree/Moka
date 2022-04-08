import { Plugin } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';
import { selectTable, getCellsInColumn, isTableSelected, isRowSelected, select } from './utils';

export function tableCellPlugin(editor) {
    return new Plugin({
        props: {
            decorations: (state) => {
                const { doc, selection } = state;
                const decorations: Decoration[] = [];
                const cells = getCellsInColumn(0)(selection);

                console.log('--- cells ---', cells);

                if (cells) {
                    cells.forEach(({ pos, node }, index) => {
                        if (index === 0) {
                            decorations.push(
                                Decoration.widget(pos + 2, () => {
                                    let className = 'grip-table';
                                    const selected = isTableSelected(selection);
                                    if (selected) {
                                        className += ' selected';
                                    }
                                    const grip = document.createElement('a');
                                    grip.className = className;
                                    grip.addEventListener('mousedown', (event) => {
                                        event.preventDefault();
                                        event.stopImmediatePropagation();
                                        this.editor.view.dispatch(selectTable(state.tr));
                                    });
                                    return grip;
                                })
                            );
                        }
                        console.log('--- node ----', node, pos, doc.nodeAt(pos + 2));
                        let position = pos;
                        // TODO: 临时处理，getCellsInColumn 对于 tbody thead 的计算目前不正确
                        if (index === 0) {
                            position += 2;
                        } else {
                            position += 4;
                        }
                        decorations.push(
                            Decoration.widget(position, () => {
                                const rowSelected = isRowSelected(index)(selection);

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
                                const grip = document.createElement('a');
                                grip.className = className;
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
