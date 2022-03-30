import { Plugin } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';

import commandMenuDecorations from './decorations/commandmenu';
import taskListDecorations from './decorations/taskList';
import headingDecorations from './decorations/heading';
import bulletListDecorations from './decorations/bulletList';
import orderedListDecorations from './decorations/orderedList';
import quoteDecorations from './decorations/blockQuote';

export function placeholderPlugin() {
    return new Plugin({
        props: {
            decorations: (state) => {
                let decorations: Decoration[] = [];

                decorations.push(commandMenuDecorations(state));
                decorations.push(taskListDecorations(state));
                decorations.push(headingDecorations(state));
                decorations.push(bulletListDecorations(state));
                decorations.push(orderedListDecorations(state));
                decorations.push(quoteDecorations(state));

                if (decorations.every((decoration) => !decoration)) {
                    return;
                }

                decorations = decorations.filter((decoration) => !!decoration);

                return DecorationSet.create(state.doc, decorations);
            }
        }
    });
}
