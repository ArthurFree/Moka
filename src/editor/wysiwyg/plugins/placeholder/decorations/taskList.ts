import { EditorState } from 'prosemirror-state';
import { Decoration } from 'prosemirror-view';
import { getParentNodeByAttrs } from '../utils';

export default function taskListDecorations(state: EditorState) {
    const parentNode = getParentNodeByAttrs(state, 'task', true);

    if (parentNode && parentNode.node?.firstChild.content.size === 0) {
        const childNode = parentNode.node.firstChild;

        /**
         * Decoration.node 创建一个 node decoration。
         * from 和 to 应该精确的指向在文档中的某个节点的前面和后面
         *
         * 这里 from 和 to 有一个示例进行参考:
         *      4
         *      <li class="task-list-item " data-task="true">
         *      5<p>
         *      6<br class="ProseMirror-trailingBreak">
         *      7</p>
         *      8</li>
         * 方法接收的 from 为 4, to 为 8 时，
         * 会在 li 元素上增加 class="empty-placeholder" 和 data-placeholder="To-Do" 属性
         *
         * 方法接收的 from 为 5, to 为 7 时，
         * 会在 p 元素上增加 class="empty-placeholder" 和 data-placeholder="To-Do" 属性
         *
         * 由此可以看出，精确的位置是指开始节点前以及结尾节点前的位置
         */
        return Decoration.node(
            // parentNode.start = parentNode.pos + 1
            parentNode.start,
            // childNode.nodeSize = 2
            parentNode.start + childNode.nodeSize,
            {
                class: 'empty-placeholder',
                'data-placeholder': 'To-Do'
            }
        );
    }

    return null;
}
