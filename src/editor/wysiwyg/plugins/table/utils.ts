import { findParentNode } from 'prosemirror-utils';
import { NodeSelection, Selection } from 'prosemirror-state';
import { Fragment, Node as pmNode, NodeType, Schema } from 'prosemirror-model';
import CellSelection from '../selection/cellSelection';
import { TableMap } from './TableMap';
import { Table } from '@/markdown/marks/table';

// :: (selection: Selection) → ?{pos: number, start: number, node: ProseMirrorNode}
// Iterates over parent nodes, returning the closest table node.
//
// ```javascript
// const table = findTable(selection);
// ```
export function findTable(selection) {
    return findParentNode(function (node) {
        return node.type.spec.tableRole && node.type.spec.tableRole === 'table';
    })(selection);
}

// :: (rowIndex: union<number, [number]>) → (selection: Selection) → ?[{pos: number, start: number, node: ProseMirrorNode}]
// Returns an array of cells in a row(s), where `rowIndex` could be a row index or an array of row indexes.
//
// ```javascript
// const cells = getCellsInRow(i)(selection); // [{node, pos}, {node, pos}]
// ```
export function getCellsInRow(rowIndex) {
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
}

// :: (columnIndex: union<number, [number]>) → (selection: Selection) → ?[{pos: number, start: number, node: ProseMirrorNode}]
// Returns an array of cells in a column(s), where `columnIndex` could be a column index or an array of column indexes.
//
// ```javascript
// const cells = getCellsInColumn(i)(selection); // [{node, pos}, {node, pos}]
// ```
export function getCellsInColumn(columnIndex) {
    return function (selection) {
        const table = findTable(selection);
        if (table) {
            const map: TableMap = TableMap.get(table.node);
            const indexes = Array.isArray(columnIndex) ? columnIndex : Array.from([columnIndex]);
            return indexes.reduce(function (acc, index) {
                if (index >= 0 && index <= map.width - 1) {
                    const cells = map.cellsInRect({
                        left: index,
                        right: index + 1,
                        top: 0,
                        bottom: map.height
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
}

// :: (selection: Selection) → boolean
// Checks if current selection is a `CellSelection`.
//
// ```javascript
// if (isCellSelection(selection)) {
//   // ...
// }
// ```
export function isCellSelection(selection) {
    return selection instanceof CellSelection;
}

// (rect: {left: number, right: number, top: number, bottom: number}) → (selection: Selection) → boolean
// Checks if a given CellSelection rect is selected
export function isRectSelected(rect) {
    return function (selection) {
        const tableNode = findTable(selection);
        const map: TableMap = TableMap.get(tableNode.node);
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
}

// :: (columnIndex: number) → (selection: Selection) → boolean
// Checks if entire column at index `columnIndex` is selected.
//
// ```javascript
// const className = isColumnSelected(i)(selection) ? 'selected' : '';
// ```
export function isColumnSelected(columnIndex) {
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
}

// :: ($pos: ResolvedPos, predicate: (node: ProseMirrorNode) → boolean) → ?{pos: number, start: number, depth: number, node: ProseMirrorNode}
// Iterates over parent nodes starting from the given `$pos`, returning the closest node and its start position `predicate` returns truthy for. `start` points to the start position of the node, `pos` points directly before the node.
//
// ```javascript
// const predicate = node => node.type === schema.nodes.blockquote;
// const parent = findParentNodeClosestToPos(state.doc.resolve(5), predicate);
// ```
export function findParentNodeClosestToPos($pos, predicate) {
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
}

// :: ($pos: ResolvedPos) → ?{pos: number, start: number, node: ProseMirrorNode}
// Iterates over parent nodes, returning a table cell or a table header node closest to a given `$pos`.
//
// ```javascript
// const cell = findCellClosestToPos(state.selection.$from);
// ```
export function findCellClosestToPos($pos) {
    const predicate = function predicate(node) {
        return node.type.spec.tableRole && /cell/i.test(node.type.spec.tableRole);
    };
    return findParentNodeClosestToPos($pos, predicate);
}

// (tr: Transaction) → Transaction
// Creates a new transaction object from a given transaction
export function cloneTr(tr) {
    return Object.assign(Object.create(tr), tr).setTime(Date.now());
}

// :: (selection: Selection) → (tr: Transaction) → Transaction
// Returns a new transaction that creates a `CellSelection` on the entire table.
//
// ```javascript
// dispatch(
//   selectTable(i)(state.tr)
// );
// ```
export function selectTable(tr) {
    const table = findTable(tr.selection);
    if (table) {
        const _TableMap$get = TableMap.get(table.node),
            map = _TableMap$get.map;

        if (map && map.length) {
            var head = table.start + map[0];
            var anchor = table.start + map[map.length - 1];
            var $head = tr.doc.resolve(head);
            var $anchor = tr.doc.resolve(anchor);

            return cloneTr(tr.setSelection(new CellSelection($anchor, $head)));
        }
    }
    return tr;
}

// :: (selection: Selection) → boolean
// Checks if entire table is selected
//
// ```javascript
// const className = isTableSelected(selection) ? 'selected' : '';
// ```
export function isTableSelected(selection) {
    if (isCellSelection(selection)) {
        const table = findTable(selection);
        const map = TableMap.get(table.node);
        return isRectSelected({
            left: 0,
            right: map.width,
            top: 0,
            bottom: map.height
        })(selection);
    }

    return false;
}

// :: (rowIndex: number) → (selection: Selection) → boolean
// Checks if entire row at index `rowIndex` is selected.
//
// ```javascript
// const className = isRowSelected(i)(selection) ? 'selected' : '';
// ```
export function isRowSelected(rowIndex) {
    return function (selection) {
        if (isCellSelection(selection)) {
            const table = findTable(selection);
            var map = TableMap.get(table.node);

            return isRectSelected({
                left: 0,
                right: map.width,
                top: rowIndex,
                bottom: rowIndex + 1
            })(selection);
        }

        return false;
    };
}

type roleType = 'table' | 'table_head' | 'table_body' | 'row' | 'header_cell' | 'cell';
/**
 * 生成以 tableRole 的值为 Key，节点的 NodeType 为 Value 的对象
 * @param schema
 * @returns
 */
export function tableNodeTypes(schema: Schema) {
    // cached: 一个用于计算和缓存每个 schema 中的任何类型值的对象。（如果你想要在其上储存一些东西，要保证属性名不会冲突）
    let result = schema.cached.tableNodeTypes;
    if (!result) {
        // 创建一个 tableNodeTypes 的对象
        result = schema.cached.tableNodeTypes = {};
        // schema.nodes (Object<NodeType>) : 一个 schema 中节点名和节点类型对象的键值对映射。
        for (let name in schema.nodes) {
            let type: NodeType = schema.nodes[name],
                // role 包括: table / table_head / table_body / row / header_cell / cell
                role: roleType = type.spec.tableRole;
            if (role) result[role] = type;
        }
    }
    return result;
}

/**
 * 判断当前行是否是 thead 中的 th
 * @param map
 * @param table
 * @param row
 * @returns
 */
export function rowIsHeader(map, table, row) {
    let headerCell: NodeType = tableNodeTypes(table.type.schema).header_cell;

    for (let col = 0; col < map.width; col++) {
        const node = table.nodeAt(map.map[col + row * map.width]);
        if (node && node.type != headerCell) {
            return false;
        }
    }

    return true;
}

export function setAttr(attrs, name, value) {
    let result = {};
    for (let prop in attrs) result[prop] = attrs[prop];
    result[name] = value;
    return result;
}

/**
 * 新增行
 * @param tr
 * @param param1
 * @param row 新增的行数
 * @returns
 */
export function addRow(tr, { map, tableStart, table }, row) {
    let rowPos = tableStart;
    const theadNode = table.child(0);
    const tbodyNode = table.child(1);

    for (let i = 0; i < row; i++) {
        if (i === 0 && theadNode) {
            rowPos += theadNode.child(0).nodeSize;
        } else if (tbodyNode) {
            rowPos += tbodyNode.child(i - 1).nodeSize;
        }

        // rowPos += table.child(i).nodeSize;
    }
    let cells = [],
        refRow = row > 0 ? -1 : 0;
    // 判断上一行是否是 th
    if (rowIsHeader(map, table, row + refRow)) {
        // 重置 refRow
        refRow = row == 0 || row == map.height ? null : 0;
    }

    // debugger;

    // index 从第 row 行开始，数 map.width 个格子
    for (let col = 0, index = map.width * row; col < map.width; col++, index++) {
        // Covered by a rowspan cell
        // 处理行合并的情况
        if (row > 0 && row < map.height && map.map[index] == map.map[index - map.width]) {
            let pos = map.map[index],
                attrs = table.nodeAt(pos).attrs;
            tr.setNodeMarkup(tableStart + pos, null, setAttr(attrs, 'rowspan', attrs.rowspan + 1));
            col += attrs.colspan - 1;
        } else {
            // debugger
            let type: NodeType =
                refRow == null
                    ? tableNodeTypes(table.type.schema).cell
                    : table.nodeAt(map.map[index + refRow * map.width]).type;
            cells.push(type.createAndFill({}, Fragment.empty));
        }
    }
    // debugger
    tr.insert(rowPos, tableNodeTypes(table.type.schema).row.createAndFill(null, cells));
    return tr;
}

const filterCellsInRow = function filterCellsInRow(rowIndex, predicate) {
    return function (tr) {
        const foundCells = [];
        const cells = getCellsInRow(rowIndex)(tr.selection);
        if (cells) {
            for (let j = cells.length - 1; j >= 0; j--) {
                if (predicate(cells[j], tr)) {
                    foundCells.push(cells[j]);
                }
            }
        }

        return foundCells;
    };
};

function _toConsumableArray(arr) {
    if (Array.isArray(arr)) {
        const arr2 = Array(arr.length);
        for (let i = 0; i < arr.length; i++) {
            arr2[i] = arr[i];
        }
        return arr2;
    } else {
        return Array.from(arr);
    }
}

// :: (selection: Selection) → boolean
// Checks if current selection is a `NodeSelection`.
//
// ```javascript
// if (isNodeSelection(tr.selection)) {
//   // ...
// }
// ```
function isNodeSelection(selection) {
    return selection instanceof NodeSelection;
}

// :: (cell: {pos: number, start: number, node: ProseMirrorNode}, attrs: Object) → (tr: Transaction) → Transaction
// Returns a new transaction that sets given `attrs` to a given `cell`.
//
// ```javascript
// dispatch(
//   setCellAttrs(findCellClosestToPos($pos), { background: 'blue' })(tr);
// );
// ```
function setCellAttrs(cell, attrs) {
    return function (tr) {
        if (cell) {
            tr.setNodeMarkup(cell.pos, null, Object.assign({}, cell.node.attrs, attrs));
            return cloneTr(tr);
        }
        return tr;
    };
}
// :: (content: union<ProseMirrorNode, ProseMirrorFragment>) → (tr: Transaction) → Transaction
// Returns a new transaction that replaces selected node with a given `node`, keeping NodeSelection on the new `node`.
// It will return the original transaction if either current selection is not a NodeSelection or replacing is not possible.
//
// ```javascript
// const node = schema.nodes.paragraph.createChecked({}, schema.text('new'));
// dispatch(
//   replaceSelectedNode(node)(tr)
// );
// ```
function replaceSelectedNode(content) {
    return function (tr) {
        if (isNodeSelection(tr.selection)) {
            const _tr$selection = tr.selection,
                $from = _tr$selection.$from,
                $to = _tr$selection.$to;

            if (
                (content instanceof Fragment &&
                    $from.parent.canReplace($from.index(), $from.indexAfter(), content)) ||
                $from.parent.canReplaceWith($from.index(), $from.indexAfter(), content.type)
            ) {
                return cloneTr(
                    tr
                        .replaceWith($from.pos, $to.pos, content)
                        // restore node selection
                        .setSelection(new NodeSelection(tr.doc.resolve($from.pos)))
                );
            }
        }
        return tr;
    };
}
// (node: ProseMirrorNode) → boolean
// Checks if a given `node` is an empty paragraph
function isEmptyParagraph(node) {
    return !node || (node.type.name === 'paragraph' && node.nodeSize === 2);
}

// (nodeType: union<NodeType, [NodeType]>) → boolean
// Checks if the type a given `node` equals to a given `nodeType`.
function equalNodeType(nodeType, node) {
    return (Array.isArray(nodeType) && nodeType.indexOf(node.type) > -1) || node.type === nodeType;
}
// :: (nodeType: union<NodeType, [NodeType]>) → (selection: Selection) → ?{pos: number, start: number, depth: number, node: ProseMirrorNode}
// Iterates over parent nodes, returning closest node of a given `nodeType`. `start` points to the start position of the node, `pos` points directly before the node.
//
// ```javascript
// const parent = findParentNodeOfType(schema.nodes.paragraph)(selection);
// ```
function findParentNodeOfType(nodeType) {
    return function (selection) {
        return findParentNode(function (node) {
            return equalNodeType(nodeType, node);
        })(selection);
    };
}

// :: (position: number, dir: ?number) → (tr: Transaction) → Transaction
// Returns a new transaction that tries to find a valid cursor selection starting at the given `position`
// and searching back if `dir` is negative, and forward if positive.
// If a valid cursor position hasn't been found, it will return the original transaction.
//
// ```javascript
// dispatch(
//   setTextSelection(5)(tr)
// );
// ```
function setTextSelection(position, position2?) {
    const dir = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
    return function (tr) {
        const nextSelection = Selection.findFrom(tr.doc.resolve(position), dir, true);
        if (nextSelection) {
            return tr.setSelection(nextSelection);
        }
        return tr;
    };
}

// ($pos: ResolvedPos, doc: ProseMirrorNode, content: union<ProseMirrorNode, Fragment>, ) → boolean
// Checks if replacing a node at a given `$pos` inside of the `doc` node with the given `content` is possible.
function canReplace($pos, content) {
    const node = $pos.node($pos.depth);
    return (
        node &&
        node.type.validContent(content instanceof Fragment ? content : Fragment.from(content))
    );
}

// (position: number, content: union<ProseMirrorNode, Fragment>) → (tr: Transaction) → Transaction
// Returns a `replace` transaction that replaces a node at a given position with the given `content`.
// It will return the original transaction if replacing is not possible.
// `position` should point at the position immediately before the node.
function replaceNodeAtPos(position, content) {
    return function (tr) {
        const node = tr.doc.nodeAt(position);
        const $pos = tr.doc.resolve(position);
        if (canReplace($pos, content)) {
            tr = tr.replaceWith(position, position + node.nodeSize, content);
            const start = tr.selection.$from.pos - 1;
            // put cursor inside of the inserted node
            tr = setTextSelection(Math.max(start, 0), -1)(tr);
            // move cursor to the start of the node
            tr = setTextSelection(tr.selection.$from.start())(tr);
            return cloneTr(tr);
        }
        return tr;
    };
}

// :: (nodeType: union<NodeType, [NodeType]>, content: union<ProseMirrorNode, Fragment>) → (tr: Transaction) → Transaction
// Returns a new transaction that replaces parent node of a given `nodeType` with the given `content`. It will return an original transaction if either parent node hasn't been found or replacing is not possible.
//
// ```javascript
// const node = schema.nodes.paragraph.createChecked({}, schema.text('new'));
//
// dispatch(
//  replaceParentNodeOfType(schema.nodes.table, node)(tr)
// );
// ```
var replaceParentNodeOfType = function replaceParentNodeOfType(nodeType, content) {
    return function (tr) {
        if (!Array.isArray(nodeType)) {
            nodeType = [nodeType];
        }
        for (var i = 0, count = nodeType.length; i < count; i++) {
            var parent = findParentNodeOfType(nodeType[i])(tr.selection);
            if (parent) {
                var newTr = replaceNodeAtPos(parent.pos, content)(tr);
                if (newTr !== tr) {
                    return newTr;
                }
            }
        }
        return tr;
    };
};

function isSelectableNode(node) {
    return node.type && node.type.spec.selectable;
}

function shouldSelectNode(node) {
    return isSelectableNode(node) && node.type.isLeaf;
}

function setSelection(node, pos, tr) {
    if (shouldSelectNode(node)) {
        return tr.setSelection(new NodeSelection(tr.doc.resolve(pos)));
    }
    return setTextSelection(pos)(tr);
}

// :: ($pos: ResolvedPos, content: union<ProseMirrorNode, Fragment>) → boolean
// Checks if a given `content` can be inserted at the given `$pos`
//
// ```javascript
// const { selection: { $from } } = state;
// const node = state.schema.nodes.atom.createChecked();
// if (canInsert($from, node)) {
//   // ...
// }
// ```
function canInsert($pos, content) {
    const index = $pos.index();

    if (content instanceof Fragment) {
        return $pos.parent.canReplace(index, index, content);
    } else if (content instanceof Node) {
        return $pos.parent.canReplaceWith(index, index, content.type);
    }
    return false;
}

// :: (content: union<ProseMirrorNode, Fragment>, position: ?number, tryToReplace?: boolean) → (tr: Transaction) → Transaction
// Returns a new transaction that inserts a given `content` at the current cursor position, or at a given `position`, if it is allowed by schema. If schema restricts such nesting, it will try to find an appropriate place for a given node in the document, looping through parent nodes up until the root document node.
// If `tryToReplace` is true and current selection is a NodeSelection, it will replace selected node with inserted content if its allowed by schema.
// If cursor is inside of an empty paragraph, it will try to replace that paragraph with the given content. If insertion is successful and inserted node has content, it will set cursor inside of that content.
// It will return an original transaction if the place for insertion hasn't been found.
//
// ```javascript
// const node = schema.nodes.extension.createChecked({});
// dispatch(
//   safeInsert(node)(tr)
// );
// ```
function safeInsert(content, position, tryToReplace) {
    return function (tr) {
        const hasPosition = typeof position === 'number';
        const $from = tr.selection.$from;

        const $insertPos = hasPosition
            ? tr.doc.resolve(position)
            : isNodeSelection(tr.selection)
            ? tr.doc.resolve($from.pos + 1)
            : $from;
        const parent = $insertPos.parent;

        // try to replace selected node

        if (isNodeSelection(tr.selection) && tryToReplace) {
            const oldTr = tr;
            tr = replaceSelectedNode(content)(tr);
            if (oldTr !== tr) {
                return tr;
            }
        }

        // try to replace an empty paragraph
        if (isEmptyParagraph(parent)) {
            const _oldTr = tr;
            tr = replaceParentNodeOfType(parent.type, content)(tr);
            if (_oldTr !== tr) {
                const pos = isSelectableNode(content) // for selectable node, selection position would be the position of the replaced parent
                    ? $insertPos.before($insertPos.depth)
                    : $insertPos.pos;
                return setSelection(content, pos, tr);
            }
        }

        // given node is allowed at the current cursor position
        if (canInsert($insertPos, content)) {
            tr.insert($insertPos.pos, content);
            const _pos = hasPosition
                ? $insertPos.pos
                : isSelectableNode(content) // for atom nodes selection position after insertion is the previous pos
                ? tr.selection.$anchor.pos - 1
                : tr.selection.$anchor.pos;
            return cloneTr(setSelection(content, _pos, tr));
        }

        // looking for a place in the doc where the node is allowed
        for (let i = $insertPos.depth; i > 0; i--) {
            const _pos2 = $insertPos.after(i);
            const $pos = tr.doc.resolve(_pos2);
            if (canInsert($pos, content)) {
                tr.insert(_pos2, content);
                return cloneTr(setSelection(content, _pos2, tr));
            }
        }
        return tr;
    };
}

// :: (cloneRowIndex: number) → (tr: Transaction) → Transaction
// Returns a new transaction that adds a new row after `cloneRowIndex`, cloning the row attributes at `cloneRowIndex`.
//
// ```javascript
// dispatch(
//   cloneRowAt(i)(state.tr)
// );
// ```
function cloneRowAt(rowIndex) {
    return function (tr) {
        const table = findTable(tr.selection);
        if (table) {
            const map = TableMap.get(table.node);

            if (rowIndex >= 0 && rowIndex <= map.height) {
                const tableNode = table.node;
                const tableNodes = tableNodeTypes(tableNode.type.schema);

                let rowPos = table.start;
                for (let i = 0; i < rowIndex + 1; i++) {
                    rowPos += tableNode.child(i).nodeSize;
                }

                const cloneRow = tableNode.child(rowIndex);
                // Re-create the same nodes with same attrs, dropping the node content.
                const cells = [];
                let rowWidth = 0;
                cloneRow.forEach(function (cell) {
                    // If we're copying a row with rowspan somewhere, we dont want to copy that cell
                    // We'll increment its span below.
                    if (cell.attrs.rowspan === 1) {
                        rowWidth += cell.attrs.colspan;
                        cells.push(
                            tableNodes[cell.type.spec.tableRole].createAndFill(
                                cell.attrs,
                                cell.marks
                            )
                        );
                    }
                });

                // If a higher row spans past our clone row, bump the higher row to cover this new row too.
                if (rowWidth < map.width) {
                    const rowSpanCells = [];

                    const _loop = function _loop(_i) {
                        const foundCells = filterCellsInRow(_i, function (cell, tr) {
                            const rowspan = cell.node.attrs.rowspan;
                            const spanRange = _i + rowspan;
                            return rowspan > 1 && spanRange > rowIndex;
                        })(tr);
                        rowSpanCells.push.apply(rowSpanCells, _toConsumableArray(foundCells));
                    };

                    for (let _i = rowIndex; _i >= 0; _i--) {
                        _loop(_i);
                    }

                    if (rowSpanCells.length) {
                        rowSpanCells.forEach(function (cell) {
                            tr = setCellAttrs(cell, {
                                rowspan: cell.node.attrs.rowspan + 1
                            })(tr);
                        });
                    }
                }

                return safeInsert(tableNodes.row.create(cloneRow.attrs, cells), rowPos, false)(tr);
            }
        }
        return tr;
    };
}

export function addRowAt(rowIndex, clonePreviousRow) {
    return function (tr) {
        const table = findTable(tr.selection);
        if (table) {
            const map = TableMap.get(table.node);
            const cloneRowIndex = rowIndex - 1;

            // 是否克隆上一行
            if (clonePreviousRow && cloneRowIndex >= 0) {
                return cloneTr(cloneRowAt(cloneRowIndex)(tr));
            }

            if (rowIndex >= 0 && rowIndex <= map.height) {
                return cloneTr(
                    addRow(
                        tr,
                        {
                            map: map,
                            tableStart: table.start,
                            table: table.node
                        },
                        rowIndex
                    )
                );
            }
        }
        return tr;
    };
}

export function addRowAtLast(tableNode, tr) {
    if (tableNode) {
        const map = TableMap.get(tableNode);
        // debugger;
        return addRowAt(map.height, false)(tr);
    }
}

export function isInTable(state) {
    const $head = state.selection.$head;
    for (let d = $head.depth; d > 0; d--) {
        if ($head.node(d).type.spec.tableRole === 'row') {
            return true;
        }
    }
    return false;
}

export function cellAround($pos) {
    for (let d = $pos.depth - 1; d > 0; d--) {
        if ($pos.node(d).type.spec.tableRole == 'row') {
            return $pos.node(0).resolve($pos.before(d + 1));
        }
    }

    return null;
}

export function cellNear($pos) {
    for (let after = $pos.nodeAfter, pos = $pos.pos; after; after = after.firstChild, pos++) {
        let role = after.type.spec.tableRole;

        if (role == 'cell' || role == 'header_cell') {
            return $pos.doc.resolve(pos);
        }
    }

    for (let before = $pos.nodeBefore, pos = $pos.pos; before; before = before.lastChild, pos--) {
        let role = before.type.spec.tableRole;

        if (role == 'cell' || role == 'header_cell') {
            return $pos.doc.resolve(pos - before.nodeSize);
        }
    }
}

export function selectionCell(state) {
    let sel = state.selection;
    if (sel.startCell) {
        return sel.startCell.pos > sel.endCell.pos ? sel.startCell : sel.endCell;
    } else if (sel.node && sel.node.type.spec.tableRole == 'cell') {
        return sel.$anchor;
    }

    return cellAround(sel.$head) || cellNear(sel.$head);
}

export function selectedRect(state) {
    let sel = state.selection;
    let $pos = selectionCell(state);
    let table = $pos.node(-2);
    let tableStart = $pos.start(-2);
    let map = TableMap.get(table);
    let rect;

    if (sel instanceof CellSelection) {
        rect = map.rectBetween(sel.startCell.pos - tableStart, sel.endCell.pos - tableStart);
    } else {
        rect = map.findCell($pos.pos - tableStart);
    }

    rect.tableStart = tableStart;
    rect.map = map;
    rect.table = table;

    return rect;
}

export function addRowAfter(state, dispatch) {
    if (!isInTable(state)) {
        return false;
    }

    debugger;

    if (dispatch) {
        const rect = selectedRect(state);
        dispatch(addRow(state.tr, rect, rect.bottom));
    }

    return true;
}

export function select(type) {
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
}
