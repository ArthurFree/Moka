import i18n from '@/i18n/i18n';
import { cls } from '@/utils/dom';
import { HookCallback } from '@editorType/editor';
import { Emitter } from '@editorType/event';
import { ExecCommand, HidePopup, TabInfo } from '@editorType/ui';
import React from 'react';
import addClass from 'tui-code-snippet/domUtil/addClass';
import removeClass from 'tui-code-snippet/domUtil/removeClass';
import { Tabs } from '../Tabs';

const TYPE_UI = 'ui';
type TabType = 'url' | 'file';

interface ImagePopupBodyProps {
    show: boolean;
    eventEmitter: Emitter;
    execCommand: ExecCommand;
    hidePopup: HidePopup;
}

interface ImagePopupBodyState {
    activeTab: TabType;
    file: File | null;
    fileNameElClassName: string;
}


export class ImagePopupBody extends React.Component<ImagePopupBodyProps, ImagePopupBodyState> {
    private tabs: TabInfo[];

    urlRef = React.createRef<HTMLInputElement>()

    fileRef = React.createRef<HTMLInputElement>()

    altTextRef = React.createRef<HTMLInputElement>();

    constructor(props) {
        super(props);
        this.state = {
            activeTab: 'file',
            file: null,
            fileNameElClassName: '',
        };
        this.tabs = [
            { name: 'file', text: 'File' },
            { name: 'url', text: 'URL' }
        ];
    }

    componentDidUpdate(): void {
        if (!this.props.show) {
            this.initialize();
        }
    }

    private initialize = (activeTab: TabType = 'file') => {
        const urlEl = this.urlRef.current as HTMLInputElement;

        urlEl.value = '';
        (this.altTextRef.current as HTMLInputElement).value = '';
        (this.fileRef.current as HTMLInputElement).value = '';

        removeClass(urlEl, 'wrong');

        this.setState({
            activeTab,
            file: null,
            fileNameElClassName: '',
        });
    }

    private emitAddImageBlob() {
        const { execCommand, eventEmitter } = this.props;
        const { files } = this.fileRef.current as HTMLInputElement;
        const altTextEl = this.altTextRef.current as HTMLInputElement;
        let fileNameElClassName = ' wrong';

        if (files?.length) {
            fileNameElClassName = '';
            const imageFile = files.item(0);
            const hookCallback: HookCallback = (url, text) => {
                execCommand('addImage', {
                    imageUrl: url,
                    altText: text || altTextEl.value,
                })
            }

            eventEmitter.emit('addImageBlobHook', imageFile, hookCallback, TYPE_UI);
        }

        this.setState({ fileNameElClassName });
    }

    private emitAddImage() {
        const { execCommand } = this.props;
        const imageUrlEl = this.urlRef.current as HTMLInputElement;
        const altTextEl = this.altTextRef.current as HTMLInputElement;
        const imageUrl = imageUrlEl.value;
        const altText = altTextEl.value || 'image';

        removeClass(imageUrlEl, 'wrong');

        if (!imageUrl.length) {
            addClass(imageUrlEl, 'wrong');
        }

        if (imageUrl) {
            execCommand('addImage', { imageUrl, altText });
        }
    }

    private execCommand = () => {
        const { activeTab } = this.state;
        if (activeTab === 'file') {
            this.emitAddImageBlob();
        } else {
            this.emitAddImage();
        }
    }

    private toggleTab = (_: MouseEvent, activeTab: TabType) => {
        if (activeTab !== this.state.activeTab) {
            this.initialize(activeTab);
        }
    }

    private showFileSelectBox = () => {
        this.fileRef.current.click();
    }

    private changeFile = (ev) => {
        const { files } = ev.target as HTMLInputElement;

        if (files?.length) {
            this.setState({
                file: files[0],
            });
        }
    }

    private preventSelectStart(ev) {
        ev.preventDefault();
    }

    render() {
        const { hidePopup } = this.props;
        const { activeTab, file, fileNameElClassName } = this.state;

        return (
            <div aria-label={i18n.get('Insert image')}>
                {/* TODO: Tab Component */}
                <Tabs
                    tabs={this.tabs}
                    activeTab={activeTab}
                    onClick={this.toggleTab}
                />
                <div style={{ display: activeTab === 'url' ? 'block' : 'none' }}>
                    <label htmlFor="toastuiImageUrlInput">{i18n.get('Image URL')}</label>
                    <input id="toastuiImageUrlInput" type="text" ref={this.urlRef} />
                </div>
                <div style={{ display: activeTab === 'file' ? 'block' : 'none', position: 'relative' }}>
                    <label htmlFor="toastuiImageFileInput">{i18n.get('Select image file')}</label>
                    <span
                        className={`toastui-editor-file-name${file ? ' has-file' : fileNameElClassName}`}
                        onClick={this.showFileSelectBox}
                        // TODO: 使用 ref 解决 React 中没有 selectstart 事件的问题
                        // onSelectStart={}
                    >
                        {file ? file.name : i18n.get('No file')}
                    </span>
                    <button
                        className={cls('file-select-button')}
                        type="button"
                        onClick={this.showFileSelectBox}
                    >
                        {i18n.get('Choose a file')}
                    </button>
                    <input
                        id="toastuiImageFileInput"
                        type="file"
                        accept="image/*"
                        onChange={this.changeFile}
                        ref={this.fileRef}
                    />
                </div>
                <label htmlFor="toastAltTextInput">{i18n.get('Description')}</label>
                <input type="text" id="toastuiAltTextInput" ref={this.altTextRef} />
                <div className={cls('button-container')}>
                    <button
                        className={cls('close-button')}
                        type="button"
                        onClick={hidePopup}
                    >
                        {i18n.get('Cancel')}
                    </button>
                    <button
                        className={cls('ok-button')}
                        type="button"
                        onClick={this.execCommand}
                    >
                        {i18n.get('OK')}
                    </button>
                </div>
            </div>
        );
    }
}
