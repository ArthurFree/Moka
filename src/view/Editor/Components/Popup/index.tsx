import React from 'react';
import { ExecCommand, HidePopup, PopupInfo, Pos } from '@editorType/ui';
import { Emitter } from '@editorType/event';
import { closest, cls } from '@/utils/dom';
import { shallowEqual } from '@/utils/common';


type PopupStyle = {
    display: 'none' | 'block';
} & Partial<Pos>;

interface PopupProps {
    show: boolean;
    info: PopupInfo;
    eventEmitter: Emitter;
    hidePopup: HidePopup;
    execCommand: ExecCommand;
}

interface PopupState {
    popupPos: Pos | null;
}

const MARGIN_FROM_RIGHT_SIDE = 20;

export class Popup extends React.Component<PopupProps, PopupState> {
    el = React.createRef<HTMLDivElement>();

    private handleMousedown = (ev) => {
        if (!closest(ev.target as HTMLElement, `.${cls('popup')}`) && !closest(ev.target as HTMLElement, this.props.info.fromEl)) {
            this.props.hidePopup();
        }
    }

    componentDidMount(): void {
        document.addEventListener('mousedown', this.handleMousedown);
        this.props.eventEmitter.listen('closePopup', this.props.hidePopup);
    }

    componentDidUpdate(prevProps: Readonly<PopupProps>): void {
        const { show, info } = this.props;

        if (show && info.pos && prevProps.show !== show) {
            const popupPos = { ...info.pos };
            const { offsetWidth } = this.el.current;
            const toolbarEl = closest(this.el.current, `.${cls('toolbar')}`) as HTMLElement;
            const { offsetWidth: toolbarOffsetWidth } = toolbarEl;

            if (popupPos.left + offsetWidth >= toolbarOffsetWidth) {
                popupPos.left = toolbarOffsetWidth - offsetWidth - MARGIN_FROM_RIGHT_SIDE;
            }

            if (!shallowEqual(this.state.popupPos, popupPos)) {
                this.setState({ popupPos });
            }
        }
    }

    componentWillUnmount(): void {
        document.removeEventListener('mousedown', this.handleMousedown);
    }

    render() {
        const { info, show, hidePopup, eventEmitter, execCommand } = this.props;
        const { className = '', style, render, initialValues = {} } = info;
        const popupStyle: PopupStyle = {
            display: show ? 'block' : 'none',
            ...style,
            ...this.state.popupPos
        };

        return (
            <div
                className={cls('popup-body')}
                style={popupStyle}
                ref={this.el}
                aria-role="dialog"
            >
                <div className={cls('popup-body')}>
                    {render && render({ eventEmitter, show, hidePopup, execCommand, initialValues })}
                </div>
            </div>
        );
    }
}
