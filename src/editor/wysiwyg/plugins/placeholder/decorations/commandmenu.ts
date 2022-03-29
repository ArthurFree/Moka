import { EditorState } from 'prosemirror-state';
import { Decoration } from 'prosemirror-view';
import { isEmpty, isTopLevel, getParentNodeByTypeName } from '../utils';

export default function commandMenuDecorations(state: EditorState) {
    const parentNode = getParentNodeByTypeName(state, 'paragraph');
    const isSlash = parentNode && parentNode.node.textContent === '/';

    if (isTopLevel(state) && parentNode) {
        const from = parentNode.pos;
        const to = parentNode.pos + parentNode.node.nodeSize;

        if (isEmpty(parentNode)) {
            return Decoration.node(from, to, {
                class: 'command-placeholder',
                // TODO: 增加文案可配置
                // TODO: i18n
                'data-empty-text': `Type '/' for commands`
            });
        }

        if (isSlash) {
            return Decoration.node(from, to, {
                class: 'command-placeholder',
                'data-empty-text': ' Keep typing to filter... '
            });
        }

        return null;
    }

    return null;
}
