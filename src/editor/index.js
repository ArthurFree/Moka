import markdownConversion from "./markdownConversion";
import moka from './editor';

export default {
    init(editorElt, previewElt) {
        console.log('--- editor init ---');

        markdownConversion.init();

        this.editorElt = editorElt;
        this.previewElt = previewElt;

        this.createEditor(editorElt);

        this.editor.on('contentChanged', (content, diffs, sectionList) => {
            this.parsingCtx = {
                ...this.parsingCtx,
                sectionList,
            };
        });
    },

    createEditor(editorElt) {
        this.editor = moka(editorElt, editorElt.parentNode, true);
    },
};
