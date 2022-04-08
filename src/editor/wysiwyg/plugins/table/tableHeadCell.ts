import { Plugin } from 'prosemirror-state';
import { DecorationSet, Decoration } from 'prosemirror-view';
import { getCellsInRow, isColumnSelected, select } from './utils';

export function tableHeadCellPlugin(editor) {
    return new Plugin({
        props: {
            decorations: (state) => {
                const { doc, selection } = state;
                const decorations: Decoration[] = [];
                const cells = getCellsInRow(0)(selection);

                if (cells) {
                    cells.forEach(({ pos }, index) => {
                        decorations.push(
                            Decoration.widget(pos + 2, () => {
                                const colSelected = isColumnSelected(index)(selection);
                                let className = 'grip-column';
                                if (colSelected) {
                                    className += ' selected';
                                }
                                if (index === 0) {
                                    className += ' first';
                                } else if (index === cells.length - 1) {
                                    className += ' last';
                                }
                                const grip = document.createElement('a');
                                grip.className = className;
                                grip.addEventListener('mousedown', (event) => {
                                    event.preventDefault();
                                    event.stopImmediatePropagation();
                                    editor.view.dispatch(select('column')(index, null)(state.tr));
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
