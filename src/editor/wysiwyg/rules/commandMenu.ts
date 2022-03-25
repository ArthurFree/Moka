import { Emitter } from '@editorType/event';
import { InputRule } from 'prosemirror-inputrules';

const OPEN_REGEX = /^\/(\w+)?$/;
const CLOSE_REGEX = /(^(?!\/(\w+)?)(.*)$|^\/(([\w\W]+)\s.*|\s)$|^\/((\W)+)$)/;

/**
 * 当前光标所在位置是否在表格中
 * @param state
 * @returns
 */
function isInTable(state) {
    let $head = state.selection.$head;
    for (let d = $head.depth; d > 0; d--) {
        if ($head.node(d).type.name == 'table') return true;
    }

    return false;
}

export function commandMenuRules(eventEmitter: Emitter) {
    return [
        // main regex should match only:
        // /word
        new InputRule(OPEN_REGEX, (state, match) => {
            if (
                match &&
                state.selection.$from.parent.type.name === 'paragraph' &&
                !isInTable(state)
            ) {
                // this.options.onOpen(match[1]);
                eventEmitter.emit('openCommandMenu');
            }
            return null;
        }),
        // invert regex should match some of these scenarios:
        // /<space>word
        // /<space>
        // /word<space>
        new InputRule(CLOSE_REGEX, (state, match) => {
            if (match) {
                // this.options.onClose();
                eventEmitter.emit('closeCommandMenu');
            }
            return null;
        })
    ];
}
