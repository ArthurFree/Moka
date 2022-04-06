import { textblockTypeInputRule, InputRule } from 'prosemirror-inputrules';
import { NodeType } from 'prosemirror-model';

const levels = [1, 2, 3, 4, 5, 6];

export function headingInputRules({ type }: { type: NodeType }): InputRule[] {
    return levels.map((level) => {
        return textblockTypeInputRule(new RegExp(`^(#{1,${level}})\\s$`), type, () => ({
            level
        }));
    });
}
