import { Emitter } from '@editorType/event';
import { ExecCommand, HidePopup } from '@editorType/ui';
import React from 'react';

interface CustomPopupBodyProps {
    body: HTMLElement;
    show: boolean;
    eventEmitter: Emitter;
    execCommand: ExecCommand;
    hidePopup: HidePopup;
}

export class CustomPopupBody extends React.Component<CustomPopupBodyProps> {
    el = React.createRef<HTMLDivElement>();

    componentDidMount() {
        this.el.current.append(this.props.body);
    }

    componentDidUpdate(prevProps) {
        this.el.current.replaceChild(this.props.body, prevProps.body);
    }

    render() {
        return (
            <div ref={this.el}></div>
        );
    }
}
