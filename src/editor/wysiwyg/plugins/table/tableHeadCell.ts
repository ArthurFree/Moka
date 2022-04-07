import { Plugin } from 'prosemirror-state';
import { DecorationSet, Decoration } from 'prosemirror-view';
import { TableMap } from './TableMap';
import { findParentNode } from 'prosemirror-utils';
import CellSelection from '../selection/cellSelection';

// :: (selection: Selection) → ?{pos: number, start: number, node: ProseMirrorNode}
// Iterates over parent nodes, returning the closest table node.
//
// ```javascript
// const table = findTable(selection);
// ```
const findTable = function findTable(selection) {
    return findParentNode(function (node) {
        return node.type.spec.tableRole && node.type.spec.tableRole === 'table';
    })(selection);
};

// :: (rowIndex: union<number, [number]>) → (selection: Selection) → ?[{pos: number, start: number, node: ProseMirrorNode}]
// Returns an array of cells in a row(s), where `rowIndex` could be a row index or an array of row indexes.
//
// ```javascript
// const cells = getCellsInRow(i)(selection); // [{node, pos}, {node, pos}]
// ```
const getCellsInRow = function getCellsInRow(rowIndex) {
    return function (selection) {
        const table = findTable(selection);
        console.log('--- table ---', table);
        if (table) {
            const map = TableMap.get(table.node);
            console.log('---- map ----', map);
            const indexes = Array.isArray(rowIndex) ? rowIndex : Array.from([rowIndex]);
            console.log('--- indexes ---', indexes);
            return indexes.reduce(function (acc, index) {
                if (index >= 0 && index <= map.height - 1) {
                    const cells = map.cellsInRect({
                        left: 0,
                        right: map.width,
                        top: index,
                        bottom: index + 1
                    });
                    return acc.concat(
                        cells.map(function (nodePos) {
                            const node = table.node.nodeAt(nodePos);
                            const pos = nodePos + table.start;
                            return { pos: pos, start: pos + 1, node: node };
                        })
                    );
                }
            }, []);
        }
    };
};

// :: (selection: Selection) → boolean
// Checks if current selection is a `CellSelection`.
//
// ```javascript
// if (isCellSelection(selection)) {
//   // ...
// }
// ```
var isCellSelection = function isCellSelection(selection) {
    return selection instanceof CellSelection;
};

// (rect: {left: number, right: number, top: number, bottom: number}) → (selection: Selection) → boolean
// Checks if a given CellSelection rect is selected
var isRectSelected = function isRectSelected(rect) {
    return function (selection) {
        var map = TableMap.get(selection.$anchorCell.node(-1));
        var start = selection.$anchorCell.start(-1);
        var cells = map.cellsInRect(rect);
        var selectedCells = map.cellsInRect(
            map.rectBetween(selection.$anchorCell.pos - start, selection.$headCell.pos - start)
        );

        for (var i = 0, count = cells.length; i < count; i++) {
            if (selectedCells.indexOf(cells[i]) === -1) {
                return false;
            }
        }

        return true;
    };
};

// :: (columnIndex: number) → (selection: Selection) → boolean
// Checks if entire column at index `columnIndex` is selected.
//
// ```javascript
// const className = isColumnSelected(i)(selection) ? 'selected' : '';
// ```
var isColumnSelected = function isColumnSelected(columnIndex) {
    return function (selection) {
        if (isCellSelection(selection)) {
            var map = TableMap.get(selection.$anchorCell.node(-1));
            return isRectSelected({
                left: columnIndex,
                right: columnIndex + 1,
                top: 0,
                bottom: map.height
            })(selection);
        }

        return false;
    };
};

export function tableHeadCellPlugin() {
    return new Plugin({
        props: {
            decorations: (state) => {
                const { doc, selection } = state;
                const decorations: Decoration[] = [];
                const cells = getCellsInRow(0)(selection);

                console.log('---- cells ---', cells);

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
                                    console.log('---- grip mousedown ----');
                                    //   this.editor.view.dispatch(selectColumn(index)(state.tr));
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
