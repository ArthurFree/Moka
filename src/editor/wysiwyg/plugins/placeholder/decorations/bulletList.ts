import { EditorState } from 'prosemirror-state';
import { Decoration } from 'prosemirror-view';
import { getParentNodeByAttrs } from '../utils';

export default function bulletListDecorations(state: EditorState) {
    const parentNode = getParentNodeByAttrs(state, 'bulletList', true);

    if (parentNode && parentNode.node?.firstChild.content.size === 0) {
        const childNode = parentNode.node.firstChild;

        return Decoration.node(
            // parentNode.start = parentNode.pos + 1
            parentNode.start,
            // childNode.nodeSize = 2
            parentNode.start + childNode.nodeSize,
            {
                class: 'empty-placeholder',
                'data-placeholder': 'List'
            }
        );
    }

    return null;
}
