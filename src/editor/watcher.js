import moka from './core';

moka.Watcher = (editor, listener) => {
    this.isWatching = false;
    let contentObserver;

    this.startWatching = () => {
        this.stopWatching();
        
        this.isWatching = true;

        contentObserver = new window.MutationObserver(listener);

        contentObserver.observe(editor.$contentElt, {
            childList: true,
            subtree: true,
            characterData: true,
        });
    };

    this.stopWatching = () => {
        if (contentObserver) {
            contentObserver.disconnect();
            contentObserver = undefined;
        }

        this.isWatching = false;
    };

    this.noWatch = (cb) => {
        if (this.isWatching) {
            this.stopWatching();
            cb();
            this.startWatching();
        } else {
            cb();
        }
    };
};
