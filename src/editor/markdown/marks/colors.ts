import { DOMOutputSpecArray } from 'prosemirror-model';
import { Transaction, Selection, TextSelection } from 'prosemirror-state';
import { clsWithMdPrefix } from '@/utils/dom';
import Mark from '@/spec/mark';
// import { EditorCommand } from '@editorType/spec';
// import type { PluginContext, PluginInfo, HTMLMdNode, I18n } from '@editorType/index';

const PREFIX = 'toastui-editor-';

function createSelection(
    tr: Transaction,
    selection: Selection,
    SelectionClass: typeof TextSelection,
    openTag: string,
    closeTag: string
) {
    const { mapping, doc } = tr;
    const { from, to, empty } = selection;
    const mappedFrom = mapping.map(from) + openTag.length;
    const mappedTo = mapping.map(to) - closeTag.length;

    return empty
        ? SelectionClass.create(doc, mappedTo, mappedTo)
        : SelectionClass.create(doc, mappedFrom, mappedTo);
}

export class Colors extends Mark {
    get name() {
        return 'colors';
    }

    get schema() {
        return {
            toDOM(): DOMOutputSpecArray {
                return ['span', { class: clsWithMdPrefix('html') }, 0];
            }
        };
    }

    private colors() {
        return ({ selectedColor }) =>
            ({ tr, selection, schema }, dispatch) => {
                if (selectedColor) {
                    const slice = selection.content();
                    const textContent = slice.content.textBetween(0, slice.content.size, '\n');
                    const openTag = `<span style="color: ${selectedColor}">`;
                    const closeTag = `</span>`;
                    const colored = `${openTag}${textContent}${closeTag}`;

                    tr.replaceSelectionWith(schema.text(colored)).setSelection(
                        createSelection(tr, selection, TextSelection, openTag, closeTag)
                    );

                    dispatch(tr);

                    return true;
                }

                return false;
            };
    }

    commands() {
        return {
            colors: this.colors()
        };
    }
}
