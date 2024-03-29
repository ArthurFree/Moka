import { DOMOutputSpecArray } from 'prosemirror-model';
import { exitCode } from 'prosemirror-commands';

import NodeSchema from '@/spec/node';

import { EditorCommand } from '@editorType/spec';

export class HTMLComment extends NodeSchema {
    get name() {
        return 'htmlComment';
    }

    get schema() {
        return {
            content: 'text*',
            group: 'block',
            code: true,
            defining: true,
            parseDOM: [{ preserveWhitespace: 'full' as const, tag: 'div[data-html-comment]' }],
            toDOM(): DOMOutputSpecArray {
                return ['div', { 'data-html-comment': 'true' }, 0];
            }
        };
    }

    commands(): EditorCommand {
        return () => (state, dispatch, view) => {
            const { $from } = state.selection;

            if (view!.endOfTextblock('down') && $from.node().type.name === 'htmlComment') {
                return exitCode(state, dispatch);
            }

            return false;
        };
    }

    keymaps() {
        return {
            Enter: this.commands()()
        };
    }
}
