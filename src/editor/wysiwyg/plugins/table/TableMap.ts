// Because working with row and column-spanning cells is not quite
// trivial, this code builds up a descriptive structure for a given
// table node. The structures are cached with the (persistent) table
// nodes as key, so that they only have to be recomputed when the
// content of the table changes.
//
// This does mean that they have to store table-relative, not
// document-relative positions. So code that uses them will typically
// compute the start position of the table and offset positions passed
// to or gotten from this structure by that amount.

let readFromCache, addToCache;
// Prefer using a weak map to cache table maps. Fall back on a
// fixed-size cache if that's not supported.
if (typeof WeakMap != 'undefined') {
    let cache = new WeakMap();
    readFromCache = (key) => cache.get(key);
    addToCache = (key, value) => {
        cache.set(key, value);
        return value;
    };
} else {
    let cache = [],
        cacheSize = 10,
        cachePos = 0;
    readFromCache = (key) => {
        for (let i = 0; i < cache.length; i += 2) if (cache[i] == key) return cache[i + 1];
    };
    addToCache = (key, value) => {
        if (cachePos == cacheSize) cachePos = 0;
        cache[cachePos++] = key;
        return (cache[cachePos++] = value);
    };
}

export class Rect {
    left: any;
    top: any;
    right: any;
    bottom: any;

    constructor(left, top, right, bottom) {
        this.left = left;
        this.top = top;
        this.right = right;
        this.bottom = bottom;
    }
}

// ::- A table map describes the structore of a given table. To avoid
// recomputing them all the time, they are cached per table node. To
// be able to do that, positions saved in the map are relative to the
// start of the table, rather than the start of the document.
export class TableMap {
    width: any;
    height: any;
    map: any;
    problems: any;

    constructor(width, height, map, problems) {
        // :: number The width of the table
        this.width = width;
        // :: number The table's height
        this.height = height;
        // :: [number] A width * height array with the start position of
        // the cell covering that part of the table in each slot
        this.map = map;
        // An optional array of problems (cell overlap or non-rectangular
        // shape) for the table, used by the table normalizer.
        this.problems = problems;
    }

    // :: (number) → Rect
    // Find the dimensions of the cell at the given position.
    findCell(pos) {
        for (let i = 0; i < this.map.length; i++) {
            let curPos = this.map[i];
            // 这里做了兼容，当手动选中时，节点的 pos 会有 -1 / -3 的误差，
            // 导致在预定的 map 中无法解析出单元格
            // 最终的结果是，手动选中后，无法触发，表格控制条的选中效果
            if (curPos != pos && curPos != pos - 1 && curPos !== pos - 3) continue;
            let left = i % this.width,
                top = (i / this.width) | 0;
            let right = left + 1,
                bottom = top + 1;
            for (let j = 1; right < this.width && this.map[i + j] == curPos; j++) right++;
            for (let j = 1; bottom < this.height && this.map[i + this.width * j] == curPos; j++)
                bottom++;
            return new Rect(left, top, right, bottom);
        }

        return null;
        // throw new RangeError('No cell with offset ' + pos + ' found');
    }

    // :: (number) → number
    // Find the left side of the cell at the given position.
    colCount(pos) {
        for (let i = 0; i < this.map.length; i++) if (this.map[i] == pos) return i % this.width;
        throw new RangeError('No cell with offset ' + pos + ' found');
    }

    // :: (number, string, number) → ?number
    // Find the next cell in the given direction, starting from the cell
    // at `pos`, if any.
    nextCell(pos, axis, dir) {
        const cellRect = this.findCell(pos);

        if (!cellRect) return null;

        let { left, right, top, bottom } = cellRect;
        if (axis == 'horiz') {
            if (dir < 0 ? left == 0 : right == this.width) return null;
            return this.map[top * this.width + (dir < 0 ? left - 1 : right)];
        } else {
            if (dir < 0 ? top == 0 : bottom == this.height) return null;
            return this.map[left + this.width * (dir < 0 ? top - 1 : bottom)];
        }
    }

    // :: (number, number) → Rect
    // Get the rectangle spanning the two given cells.
    rectBetween(a, b) {
        const aRect = this.findCell(a);
        const bRect = this.findCell(b);

        if (!aRect || !bRect) return null;

        let { left: leftA, right: rightA, top: topA, bottom: bottomA } = aRect;
        let { left: leftB, right: rightB, top: topB, bottom: bottomB } = bRect;
        return new Rect(
            Math.min(leftA, leftB),
            Math.min(topA, topB),
            Math.max(rightA, rightB),
            Math.max(bottomA, bottomB)
        );
    }

    // :: (Rect) → [number]
    // Return the position of all cells that have the top left corner in
    // the given rectangle.
    cellsInRect(rect) {
        let result = [],
            seen = {};

        if (!rect) return result;

        for (let row = rect.top; row < rect.bottom; row++) {
            for (let col = rect.left; col < rect.right; col++) {
                let index = row * this.width + col,
                    pos = this.map[index];
                if (seen[pos]) continue;
                seen[pos] = true;
                if (
                    (col != rect.left || !col || this.map[index - 1] != pos) &&
                    (row != rect.top || !row || this.map[index - this.width] != pos)
                )
                    result.push(pos);
            }
        }
        return result;
    }

    // :: (number, number, Node) → number
    // Return the position at which the cell at the given row and column
    // starts, or would start, if a cell started there.
    positionAt(row, col, table) {
        for (let i = 0, rowStart = 0; ; i++) {
            let rowEnd = rowStart + table.child(i).nodeSize;
            if (i == row) {
                let index = col + row * this.width,
                    rowEndIndex = (row + 1) * this.width;
                // Skip past cells from previous rows (via rowspan)
                while (index < rowEndIndex && this.map[index] < rowStart) index++;
                return index == rowEndIndex ? rowEnd - 1 : this.map[index];
            }
            rowStart = rowEnd;
        }
    }

    // :: (Node) → TableMap
    // Find the table map for the given table node.
    static get(table) {
        // 这里缓存的 key 是一个 ProsemirrorNode 所以采取了 Array 的方式缓存, 而不是 Map
        return readFromCache(table) || addToCache(table, computeMap(table));
    }
}

// Compute a table map.
// 计算 table 中的每一个位置, 应该是由单元格的起始点组成的数组
function computeMap(table) {
    if (table.type.spec.tableRole != 'table')
        throw new RangeError('Not a table node: ' + table.type.name);
    let width = findWidth(table),
        // TODO: 这里的高度不准，table 的 childCount 是 thead 和 tbody 永远最多只有两个
        height = table.childCount;
    let map = [],
        mapPos = 0,
        problems = null,
        colWidths = [];
    // 初始化 map
    for (let i = 0, e = width * height; i < e; i++) {
        map[i] = 0;
    }

    // 常规无合并表格 width = 4, height = 3
    //  ____________________________
    // |      |      |      |      |
    // |  A1  |  B1  |  C1  |  D1  |   row: 0
    // |______|______|______|______|
    // |      |      |      |      |
    // |  A2  |  B2  |  C2  |  D2  |   row: 1
    // |______|______|______|______|
    // |      |      |      |      |
    // |  A3  |  B3  |  C3  |  D3  |   row: 2
    // |______|______|______|______|
    //
    // DOM:
    // <table>
    //     <thead>
    //         <tr>
    //             <td></td>
    //         </tr>
    //     </thead>
    //     <tbody>
    //         <tr>
    //             <td></td>
    //         </tr>
    //     </tbody>
    // </table>

    for (let row = 0, pos = 0; row < height; row++) {
        let rowNode = table.child(row);

        if (rowNode.type.name === 'tableHead' || rowNode.type.name === 'tableBody') {
            // 如果 rowNode 是 thead 则向下查找一次
            rowNode = rowNode.child(0);
        }
        pos++;
        for (let i = 0; ; i++) {
            // map.length 是表格的 width * height
            // 初始 map 中均是 0
            while (mapPos < map.length && map[mapPos] != 0) {
                mapPos++;
            }
            // 当 i 是 rowNode.childCount 时，代表当前行中的单元格已经遍历完成了
            if (i == rowNode.childCount) break;
            let cellNode = rowNode.child(i),
                { colspan = 0, rowspan = 0, colwidth } = cellNode.attrs;

            for (let h = 0; h < (rowspan || 1); h++) {
                // row - 当前行的行号
                // rowspan - 单元格横跨了几行
                // ```
                //  ____________________________
                // |      |      |             |
                // |  A1  |  B1  |     C1      |
                // |______|______|______ ______|
                // |      |             |      |
                // |  A2  |     B2      |      |
                // |______|______ ______|      |
                // |      |      |      |  D1  |
                // |  A3  |  B3  |  C2  |      |
                // |______|______|______|______|
                // ```
                // map: width = 3, height = 3
                // D1: rowspan = 2
                // 当 row = 2, i = 3, h = 0 -> 不会触发条件
                // 当 row = 2, i = 3, h = 1 -> 触发条件 pos: 3, n: 2
                if (h + row >= height) {
                    (problems || (problems = [])).push({
                        type: 'overlong_rowspan',
                        pos,
                        n: (rowspan || 1) - h
                    });
                    break;
                }
                let start = mapPos + h * width;
                for (let w = 0; w < (colspan || 1); w++) {
                    if (map[start + w] == 0) {
                        map[start + w] = pos;
                    } else {
                        (problems || (problems = [])).push({
                            type: 'collision',
                            row,
                            pos,
                            n: (colspan || 1) - w
                        });
                    }

                    let colW = colwidth && colwidth[w];
                    if (colW) {
                        let widthIndex = ((start + w) % width) * 2,
                            prev = colWidths[widthIndex];
                        if (prev == null || (prev != colW && colWidths[widthIndex + 1] == 1)) {
                            colWidths[widthIndex] = colW;
                            colWidths[widthIndex + 1] = 1;
                        } else if (prev == colW) {
                            colWidths[widthIndex + 1]++;
                        }
                    }
                }
            }
            mapPos += colspan || 1;
            pos += cellNode.nodeSize;
        }
        let expectedPos = (row + 1) * width,
            missing = 0;
        while (mapPos < expectedPos) if (map[mapPos++] == 0) missing++;
        if (missing) (problems || (problems = [])).push({ type: 'missing', row, n: missing });
        pos++;
    }

    let tableMap = new TableMap(width, height, map, problems),
        badWidths = false;

    // For columns that have defined widths, but whose widths disagree
    // between rows, fix up the cells whose width doesn't match the
    // computed one.
    for (let i = 0; !badWidths && i < colWidths.length; i += 2)
        if (colWidths[i] != null && colWidths[i + 1] < height) badWidths = true;
    if (badWidths) findBadColWidths(tableMap, colWidths, table);

    return tableMap;
}

// 获取表格的宽度
// 处理了行合并，列合并的情况
function findWidth(table) {
    let width = -1,
        hasRowSpan = false;
    // 这里 table 的 childCount 是 thead 和 tbody
    for (let row = 0; row < table.childCount; row++) {
        // 这里 rowNode 取到的是 thead / tbody
        let rowNode = table.child(row),
            rowWidth = 0;

        if (rowNode.type.name === 'tableHead' || rowNode.type.name === 'tableBody') {
            // 如果 rowNode 是 thead 则向下查找一次
            rowNode = rowNode.child(0);
        }
        // 这里初始是 false
        // 第二行有合并单元格的在这里执行
        if (hasRowSpan) {
            // 遍历当前行之前的行元素
            // j 是行数
            for (let j = 0; j < row; j++) {
                let prevRow = table.child(j);
                if (prevRow.type.name === 'tableHead' || prevRow.type.name === 'tableBody') {
                    // 如果 prevRow 是 thead 则向下查找一次
                    prevRow = prevRow.child(0);
                }

                // 遍历 tr 中的 th 或者 td
                for (let i = 0; i < prevRow.childCount; i++) {
                    let cell = prevRow.child(i);
                    if (j + (cell.attrs.rowspan || 0) > row) {
                        // 这里宽度算上了合并之前的单元格的宽度
                        rowWidth += cell.attrs.colspan || 0;
                    }
                }
            }
        }

        for (let i = 0; i < rowNode.childCount; i++) {
            let cell = rowNode.child(i);
            rowWidth += cell.attrs.colspan || 0;
            if ((cell.attrs.rowspan || 0) > 1) hasRowSpan = true;
        }
        if (width == -1) width = rowWidth;
        // 按行遍历，对比行中单元格数多的，即是表格的宽度
        else if (width != rowWidth) width = Math.max(width, rowWidth);
    }
    return width;
}

function findBadColWidths(map, colWidths, table) {
    if (!map.problems) map.problems = [];
    for (let i = 0, seen = {}; i < map.map.length; i++) {
        let pos = map.map[i];
        if (seen[pos]) continue;
        seen[pos] = true;
        let node = table.nodeAt(pos),
            updated = null;
        for (let j = 0; j < (node.attrs.colspan || 1); j++) {
            let col = (i + j) % map.width,
                colWidth = colWidths[col * 2];
            if (colWidth != null && (!node.attrs.colwidth || node.attrs.colwidth[j] != colWidth))
                (updated || (updated = freshColWidth(node.attrs)))[j] = colWidth;
        }
        if (updated) map.problems.unshift({ type: 'colwidth mismatch', pos, colwidth: updated });
    }
}

function freshColWidth(attrs) {
    if (attrs.colwidth) return attrs.colwidth.slice();
    let result = [];
    for (let i = 0; i < attrs.colspan || 0; i++) result.push(0);
    return result;
}
