import { Keymap } from 'prosemirror-commands';
import { MarkSpec } from 'prosemirror-model';
import { SpecContext, EditorCommand, EditorCommandMap } from '@editorType/spec';

export default abstract class Mark {
    context!: SpecContext;

    // 区分是 mark 还是 node
    get type() {
        return 'mark';
    }

    setContext(context: SpecContext) {
        this.context = context;
    }

    /**
     * 返回定义当前 Mark 的名字
     */
    abstract get name(): string;

    abstract get schema(): MarkSpec;

    commands?(): EditorCommand | EditorCommandMap;

    keymaps?(): Keymap<any>;
}
