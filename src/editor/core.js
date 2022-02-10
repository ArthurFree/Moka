const moka = function (contentElt) {
    console.log('--- This is Moka ---');

    const editor = {
        $contentElt: contentElt,
    };

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

    let watcher;
    function checkContentChange (mutations) {
        console.log('--- check content change ---');

        const newTextContent = getTextContent();
    }

    watcher = new moka.Watcher(editor, checkContentChange);
    watcher.startWatching();

    editor.watcher = watcher;
};

export default moka;
