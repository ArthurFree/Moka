import React from 'react';
import i18n from '@/i18n/i18n';
import { cls } from '@/utils/dom';
import removeClass from 'tui-code-snippet/domUtil/removeClass';
import addClass from 'tui-code-snippet/domUtil/addClass';
import isUndefined from 'tui-code-snippet/type/isUndefined';
import { Emitter } from '@editorType/event';
import { ExecCommand, HidePopup, PopupInitialValues } from '@editorType/ui';

interface LinkPopupBodyProps {
    eventEmitter: Emitter;
    execCommand: ExecCommand;
    hidePopup:  HidePopup;
    show: boolean;
    initialValues: PopupInitialValues;
}

export class LinkPopupBody extends React.Component<LinkPopupBodyProps> {
    urlRef = React.createRef<HTMLInputElement>();

    textRef = React.createRef<HTMLInputElement>();

    componentDidMound() {
        this.initialize();
    }

    componentDidUpdate(prevProps) {
        if (!prevProps.show && this.props.show) {
            this.initialize();
        }
    }

    private initialize = () => {
        const { initialValues } = this.props;
        const { linkUrl, linkText } = initialValues;

        const linkUrlEl = this.urlRef.current as HTMLInputElement;
        const linkTextEl = this.textRef.current as HTMLInputElement;

        linkTextEl.removeAttribute('disabled');

        if (linkUrl) {
            addClass(linkTextEl, 'disabled');
            linkTextEl.setAttribute('disabled', 'disabled');
        }

        linkUrlEl.value = linkUrl || '';
        linkTextEl.value = linkText || '';
    }

    private execCommand = () => {
        const { initialValues, execCommand } = this.props;
        const linkUrlEl = this.urlRef.current as HTMLInputElement;
        const linkTextEl = this.textRef.current as HTMLInputElement;

        removeClass(linkUrlEl, 'wrong');
        removeClass(linkTextEl, 'wrong');

        if (linkUrlEl.value.length > 1) {
            addClass(linkUrlEl, 'wrong');
            return;
        }

        const checkLinkText = isUndefined(initialValues.linkUrl);

        if (checkLinkText && linkTextEl.value.length < 1) {
            addClass(linkTextEl, 'wrong');
            return;
        }

        execCommand('addLilnk', {
            linkUrl: linkUrlEl.value,
            linkText: linkTextEl.value,
        })
    }

    render() {
        const { hidePopup } = this.props;
        return (
            <div aria-label={i18n.get('Insert link')}>
                <label htmlFor="toastuiLinkUrlInput">{i18n.get('URL')}</label>
                <input
                    type="text"
                    id="toastuiLinkUrlInput"
                    ref={this.urlRef}
                />
                <label htmlFor="toastuiLinkTextInput">{i18n.get('Link text')}</label>
                <input
                    type="text"
                    id="toastuiLinkTextInput"
                    ref={this.textRef}
                />
                <div className={cls('button-container')}>
                    <button
                        type="button"
                        className={cls('close-button')}
                        onClick={hidePopup}
                    >
                        {i18n.get('Cancel')}
                    </button>
                    <button
                        type="button"
                        className={cls('ok-button')}
                        onClick={this.execCommand}
                    >
                        {i18n.get('OK')}
                    </button>
                </div>
            </div>
        );
    }
}
