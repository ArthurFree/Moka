import { EditorState } from 'prosemirror-state';
import { Decoration } from 'prosemirror-view';
import { isEmpty, isTopLevel, getParentNodeByTypeName } from '../utils';

export default function quoteDecorations(state: EditorState) {
    /**
     * 3<blockquote>4<p>5<br class="ProseMirror-trailingBreak">6</p>7</blockquote>8
     */

    const parentNode = getParentNodeByTypeName(state, 'blockQuote');
    if (parentNode && parentNode.node?.firstChild.content.size === 0) {
        const childNode = parentNode.node.firstChild;
        return Decoration.node(parentNode.start, parentNode.start + childNode.nodeSize, {
            class: 'empty-placeholder',
            'data-placeholder': 'Empty quote'
        });
    }

    return null;
}
