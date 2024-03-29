import { DOMOutputSpecArray, ProsemirrorNode } from 'prosemirror-model';
import { wrapIn } from 'prosemirror-commands';

import NodeSchema from '@/spec/node';
import {
    createDOMInfoParsedRawHTML,
    getCustomAttrs,
    getDefaultCustomAttrs
} from '@/wysiwyg/helper/node';

import { EditorCommand } from '@editorType/spec';

export class BlockQuote extends NodeSchema {
    get name() {
        return 'blockQuote';
    }

    get schema() {
        return {
            attrs: {
                rawHTML: { default: null },
                ...getDefaultCustomAttrs()
            },
            content: 'block+',
            group: 'block',
            parseDOM: [createDOMInfoParsedRawHTML('blockquote')],
            toDOM({ attrs }: ProsemirrorNode): DOMOutputSpecArray {
                return ['blockquote', getCustomAttrs(attrs), 0];
            }
        };
    }

    commands(): EditorCommand {
        // wrapIn(NodeType, attrs)(EditorState, dispatch) - 用带有给定 attributes 的给定类型的节点来包裹选区。
        return () => (state, dispatch) => wrapIn(state.schema.nodes.blockQuote)(state, dispatch);
    }

    keymaps() {
        const blockQutoeCommand = this.commands()();

        return {
            'Alt-q': blockQutoeCommand,
            'Alt-Q': blockQutoeCommand
        };
    }
}
