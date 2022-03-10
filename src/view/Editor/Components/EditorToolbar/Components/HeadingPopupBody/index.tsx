import i18n from '@/i18n/i18n';
import { closest } from '@/utils/dom';
import { Emitter } from '@editorType/event';
import { ExecCommand } from '@editorType/ui';
import React from 'react';

interface HeadingPopupBodyProps {
    eventEmitter: Emitter;
    execCommand: ExecCommand;
}

const HEADING_LIST = [1, 2, 3, 4, 5, 6];

export class HeadingPopupBody extends React.Component<HeadingPopupBodyProps> {
    execCommand = (ev) => {
        const { execCommand } = this.props;
        const el = closest(ev.target as HTMLElement, 'li')! as HTMLElement;

        execCommand('heading', {
            level: Number(el.getAttribute('data-level'))
        });
    }

    renderHeading = (level) => {
        const content = `${i18n.get('Heading')} ${level}`;
        switch (level) {
            case 1:
                return (
                    <h1 data-level={level}>{content}</h1>
                );
            case 2:
                return (
                    <h2 data-level={level}>{content}</h2>
                );
            case 3:
                return (
                    <h3 data-level={level}>{content}</h3>
                );
            case 4:
                return (
                    <h4 data-level={level}>{content}</h4>
                );
            case 5:
                return (
                    <h5 data-level={level}>{content}</h5>
                );
            case 6:
                return (
                    <h6 data-level={level}>{content}</h6>
                );
            default:
                break;
        }
    }

    render() {
        return (
            <ul
                onClick={this.execCommand}
                aria-role="menu"
                aria-label={`${i18n.get('Headings')}`}
            >
                {HEADING_LIST.map(level => (
                    <li>
                        {this.renderHeading(level)}
                    </li>
                ))}
                <li
                    data-type="Paragraph"
                    aria-role="menuitem"
                >
                    <div>{i18n.get('Paragraph')}</div>
                </li>
            </ul>
        )
    }
}
