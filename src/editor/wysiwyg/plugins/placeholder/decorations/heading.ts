import { EditorState } from 'prosemirror-state';
import { Decoration } from 'prosemirror-view';
import { isEmpty, isTopLevel, getParentNodeByTypeName } from '../utils';

export default function headingDecorations(state: EditorState) {
    const parentNode = getParentNodeByTypeName(state, 'heading');

    if (isTopLevel(state) && isEmpty(parentNode)) {
        return Decoration.node(parentNode.pos, parentNode.pos + parentNode.node.nodeSize, {
            class: 'empty-placeholder',
            'data-placeholder': `Heading ${parentNode.node.attrs.level}`
        });
    }

    return null;
}
