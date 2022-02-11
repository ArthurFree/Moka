import DiffMatchPatch from 'diff-match-patch';

const moka = function (contentElt, scrollEltOpt, isMarkdown = false) {
    console.log('--- This is Moka ---');

    const scrollElt = scrollEltOpt || contentElt;
    const editor = {
        $contentElt: contentElt,
    };
    moka.Utils.createEventHooks(editor);

    let noContentFix = false;

    editor.toggleEditable = (isEditable) => {
        contentElt.contentEditable = isEditable === null ? !contentElt.contentEditable : isEditable;
    };
    editor.toggleEditable(true);

    function getTextContent() {
        // Markdown-it sanitization (Mac/DOS to Unix)
        let textContent = contentElt.textContent.replace(/\r[\n\u0085]?|[\u2424\u2028\u0085]/g, '\n');
        if (textContent.slice(-1) !== '\n') {
          textContent += '\n';
        }
        return textContent;
    }

    let lastTextContent = getTextContent();
    const highlighter = new moka.Highlighter(editor);
    const diffMatchPatch = new DiffMatchPatch();

    let watcher;
    function checkContentChange (mutations) {
        console.log('--- check content change ---');

        watcher.noWatch(() => {
            const removedSections = [];
            const modifiedSections = [];

            function markModifiedSection(node) {
                let currentNode = nodd;

                while (currentNode && currentNode !== contentElt) {
                    if (currentNode.section) {
                        const array = currentNode.parentNode ? modifiedSections : removedSections;

                        if (array.indexOf(currentNode.section) === -1) {
                            array.push(currentNode.section);
                        }

                        return;
                    }

                    currentNode = currentNode.parentNode;
                }
            }

            mutations.m_each((mutation) => {
                markModifiedSection(mutation.target);
                mutation.addedNodes.m_each(markModifiedSection);
                mutation.removedNodes.m_each(markModifiedSection);
            });

            highlighter.fixContent(modifiedSections, removedSections, noContentFix);
            noContentFix = false;
        });

        const newTextContent = getTextContent();
        const diffs = diffMatchPatch.diff_main(lastTextContent, newTextContent);

        const sectionList = highlighter.parseSections(newTextContent);
        // TODO:
        // editor.$trigger('contentChanged', nextTextContent, diffs, sectionList);

        lastTextContent = newTextContent;
    }

    watcher = new moka.Watcher(editor, checkContentChange);
    watcher.startWatching();

    editor.watcher = watcher;
    editor.highlighter = highlighter;


    return editor;
};

export default moka;
