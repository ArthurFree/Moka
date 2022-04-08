import { Plugin } from 'prosemirror-state';
import { DecorationSet, Decoration } from 'prosemirror-view';
import { TableMap } from './TableMap';
import { convertArrayOfRowsToTableNode, findParentNode } from 'prosemirror-utils';
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
        if (table) {
            const map = TableMap.get(table.node);
            const indexes = Array.isArray(rowIndex) ? rowIndex : Array.from([rowIndex]);
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
const isCellSelection = function isCellSelection(selection) {
    return selection instanceof CellSelection;
};

// (rect: {left: number, right: number, top: number, bottom: number}) → (selection: Selection) → boolean
// Checks if a given CellSelection rect is selected
const isRectSelected = function isRectSelected(rect) {
    return function (selection) {
        const tableNode = findTable(selection);
        const map = TableMap.get(tableNode.node);
        // start(depth: ?⁠number) → number
        // 给定深度的祖先节点的开始位置（绝对位置）。
        // const start = selection.startCell.start(-1);
        const start = tableNode.start;
        const cells = map.cellsInRect(rect);
        const selectedCells = map.cellsInRect(
            map.rectBetween(selection.startCell.pos - start, selection.endCell.pos - start)
        );

        for (let i = 0, count = cells.length; i < count; i++) {
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
const isColumnSelected = function isColumnSelected(columnIndex) {
    return function (selection) {
        if (isCellSelection(selection)) {
            const tableNode = findTable(selection);
            const map = TableMap.get(tableNode.node);
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

// :: ($pos: ResolvedPos, predicate: (node: ProseMirrorNode) → boolean) → ?{pos: number, start: number, depth: number, node: ProseMirrorNode}
// Iterates over parent nodes starting from the given `$pos`, returning the closest node and its start position `predicate` returns truthy for. `start` points to the start position of the node, `pos` points directly before the node.
//
// ```javascript
// const predicate = node => node.type === schema.nodes.blockquote;
// const parent = findParentNodeClosestToPos(state.doc.resolve(5), predicate);
// ```
const findParentNodeClosestToPos = function findParentNodeClosestToPos($pos, predicate) {
    for (let i = $pos.depth; i > 0; i--) {
        const node = $pos.node(i);
        if (predicate(node)) {
            return {
                pos: i > 0 ? $pos.before(i) : 0,
                start: $pos.start(i),
                depth: i,
                node: node
            };
        }
    }
};

// :: ($pos: ResolvedPos) → ?{pos: number, start: number, node: ProseMirrorNode}
// Iterates over parent nodes, returning a table cell or a table header node closest to a given `$pos`.
//
// ```javascript
// const cell = findCellClosestToPos(state.selection.$from);
// ```
const findCellClosestToPos = function findCellClosestToPos($pos) {
    const predicate = function predicate(node) {
        return node.type.spec.tableRole && /cell/i.test(node.type.spec.tableRole);
    };
    return findParentNodeClosestToPos($pos, predicate);
};

// (tr: Transaction) → Transaction
// Creates a new transaction object from a given transaction
const cloneTr = function cloneTr(tr) {
    return Object.assign(Object.create(tr), tr).setTime(Date.now());
};

const select = function select(type) {
    return function (index, expand) {
        return function (tr) {
            const table = findTable(tr.selection);
            const isRowSelection = type === 'row';
            if (table) {
                const map = TableMap.get(table.node);

                // Check if the index is valid
                if (index >= 0 && index < (isRowSelection ? map.height : map.width)) {
                    let left = isRowSelection ? 0 : index;
                    let top = isRowSelection ? index : 0;
                    let right = isRowSelection ? map.width : index + 1;
                    let bottom = isRowSelection ? index + 1 : map.height;

                    if (expand) {
                        const cell = findCellClosestToPos(tr.selection.$from);
                        if (!cell) {
                            return tr;
                        }

                        const selRect = map.findCell(cell.pos - table.start);
                        if (isRowSelection) {
                            top = Math.min(top, selRect.top);
                            bottom = Math.max(bottom, selRect.bottom);
                        } else {
                            left = Math.min(left, selRect.left);
                            right = Math.max(right, selRect.right);
                        }
                    }

                    const cellsInFirstRow = map.cellsInRect({
                        left: left,
                        top: top,
                        right: isRowSelection ? right : left + 1,
                        bottom: isRowSelection ? top + 1 : bottom
                    });

                    const cellsInLastRow =
                        bottom - top === 1
                            ? cellsInFirstRow
                            : map.cellsInRect({
                                  left: isRowSelection ? left : right - 1,
                                  top: isRowSelection ? bottom - 1 : top,
                                  right: right,
                                  bottom: bottom
                              });

                    const head = table.start + cellsInFirstRow[0];
                    const anchor = table.start + cellsInLastRow[cellsInLastRow.length - 1];
                    const $head = tr.doc.resolve(head);
                    const $anchor = tr.doc.resolve(anchor);

                    return cloneTr(tr.setSelection(new CellSelection($anchor, $head)));
                }
            }
            return tr;
        };
    };
};

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
