import { DOMOutputSpecArray, Node as ProsemirrorNode } from 'prosemirror-model';

import NodeSchema from '@/spec/node';
import {
    createCellAttrs,
    createParsedCellDOM,
    getCustomAttrs,
    getDefaultCustomAttrs
} from '@/wysiwyg/helper/node';

export class TableHeadCell extends NodeSchema {
    get name() {
        return 'tableHeadCell';
    }

    get schema() {
        return {
            content: 'paragraph+',
            attrs: {
                align: { default: null },
                className: { default: null },
                rawHTML: { default: null },
                rowspan: { default: 1 },
                colspan: { default: 1 },
                extended: { default: null },
                ...getDefaultCustomAttrs()
            },
            tableRole: 'header_cell',
            selectable: false,
            isolating: true,
            parseDOM: [createParsedCellDOM('th')],
            toDOM({ attrs }: ProsemirrorNode): DOMOutputSpecArray {
                const cellAttrs = createCellAttrs(attrs);

                return ['th', { ...cellAttrs, ...getCustomAttrs(attrs) }, 0];
            }
        };
    }
}
