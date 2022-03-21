import toArray from 'tui-code-snippet/collection/toArray';
import {
    Mark as ProsemirrorMark,
    Node as ProsemirrorNode,
    DOMOutputSpecArray
} from 'prosemirror-model';
import { registerTagWhitelistIfPossible } from '@/sanitizer/htmlSanitizer';
import { Sanitizer, HTMLSchemaMap, CustomHTMLRenderer } from '@editorType/editor';
import { ToDOMAdaptor } from '@editorType/convertor';
import { sanitizeDOM } from '../nodes/html';
import { getCustomAttrs, getDefaultCustomAttrs } from '@/wysiwyg/helper/node';
import Mark from '@/spec/mark';
import { EditorCommand, DefaultPayload, EditorCommandMap } from '@editorType/spec';

/**
 * 获取 dom 元素属性集合
 * @param {HTMLElement} dom 元素
 * @returns {Array} => { [attrKey]: attrValue }
 */
function getHTMLAttrs(dom: HTMLElement) {
    return toArray(dom.attributes).reduce<Record<string, string | null>>((acc, attr) => {
        acc[attr.nodeName] = attr.nodeValue;
        return acc;
    }, {});
}

export class Colors extends Mark {
    get name() {
        return 'colors';
    }

    get schema() {
        return {
            attrs: {
                htmlAttrs: { default: {} },
                htmlInline: { default: true }
            },
            parseDOM: [
                {
                    tag: 'span',
                    getAttrs(dom: Node | string) {
                        return {
                            htmlAttrs: getHTMLAttrs(dom as HTMLElement)
                        };
                    }
                }
            ],
            toDOM(node: ProsemirrorMark): DOMOutputSpecArray {
                return ['span', getCustomAttrs(node.attrs), 0];
            }
        };
    }

    private colors(): EditorCommand {
        // (payload) => (state, dispatch)
        return ({ selectedColor }) =>
            ({ tr, selection, schema }, dispatch) => {
                if (selectedColor) {
                    const { from, to } = selection;
                    const attrs = { htmlAttrs: { style: `color: ${selectedColor}` } };
                    const mark = schema.marks.span.create(attrs);

                    tr.addMark(from, to, mark);
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
