import React from 'react';
import ColorPicker from 'tui-color-picker';
import i18n from '@/i18n/i18n';
// import { cls } from '@/utils/dom';
import { Emitter } from '@editorType/event';
import { ExecCommand, HidePopup, PopupInitialValues } from '@editorType/ui';
import { addLangs } from './i18n/langs';
import './index.scss';

interface ColorPopupBodyProps {
    eventEmitter: Emitter;
    execCommand: ExecCommand;
    hidePopup: HidePopup;
    show: boolean;
    initialValues: PopupInitialValues;
}

addLangs(i18n);

export class ColorPopupBody extends React.Component<ColorPopupBodyProps> {
    el = React.createRef<HTMLDivElement>();

    colorPicker = null;

    currentEditorEl: HTMLElement = null;

    componentDidMount() {
        const { eventEmitter } = this.props;
        const PREFIX = 'toastui-editor-';
        const colorPickerOption = {
            container: this.el.current
        };

        this.colorPicker = ColorPicker.create(colorPickerOption);
        this.colorPicker.slider.toggle(true);
        eventEmitter.listen('focus', (editType) => {
            const containerClassName = `${PREFIX}${
                editType === 'markdown' ? 'md' : 'ww'
            }-container`;

            // 可编辑元素，即属性 contenteditable=true 的元素
            this.currentEditorEl = document.querySelector<HTMLElement>(
                `.${containerClassName} .ProseMirror`
            );
        });

        const okBtnEl = this.createButton(i18n.get('OK'));
        okBtnEl.addEventListener('click', () => {
            this.handleSelectColor();
        });

        this.el.current.appendChild(okBtnEl);
    }

    createButton = (text: string) => {
        const buttonEl = document.createElement('button');

        buttonEl.setAttribute('type', 'button');
        buttonEl.textContent = text;

        return buttonEl;
    };

    handleSelectColor = () => {
        const { eventEmitter } = this.props;
        const selectedColor = this.colorPicker.getColor();

        // 与现有的 color 指令区分开，之后再进行替换
        eventEmitter.emit('command', 'colors', { selectedColor });
        eventEmitter.emit('closePopup');
        // force the current editor to focus for preventing to lose focus
        this.currentEditorEl.focus();
    };

    render() {
        return (
            <div aria-label={i18n.get('Text color')}>
                <div className="color-picker-wrap" ref={this.el}></div>
                {/* <button type="button" onClick={this.handleSelectColor}>
                    {i18n.get('OK')}
                </button> */}
            </div>
        );
    }
}
