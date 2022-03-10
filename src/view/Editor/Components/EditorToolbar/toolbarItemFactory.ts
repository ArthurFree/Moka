import React from 'react';
import { PopupInitialValues, PopupOptions, Pos, PopupInfo } from "@editorType/ui";
import { HeadingPopupBody } from './Components/HeadingPopupBody';
import { ImagePopupBody } from './Components/ImagePopupBody';
import { LinkPopupBody } from './Components/LinkPopupBody';
import { TablePopupBody } from './Components/TablePopupBody';
// import { CustomPopupBody } from './Components/CustomPopupBody';

interface Payload {
    el: HTMLElement,
    pos: Pos,
    popup?: PopupOptions;
    initialValues?: PopupInitialValues;
}

export function createPopupInfo (type: string, payload: Payload): PopupInfo | null {
    const { el, pos, popup, initialValues } = payload;

    switch (type) {
        case 'heading':
            return {
                render: (props) => html`<${HeadingPopupBody} ...${props} />`,
                className: cls('popup-add-heading'),
                fromEl: el,
                pos
            };
        case 'link':
            return {
                render: (props) => html`<${LinkPopupBody} ...${props} />`,
                className: cls('popup-add-link'),
                fromEl: el,
                pos,
                initialValues
            };
        case 'image':
            return {
                render: (props) => html`<${ImagePopupBody} ...${props} />`,
                className: cls('popup-add-image'),
                fromEl: el,
                pos
            };
        case 'table':
            return {
                render: (props) => html`<${TablePopupBody} ...${props} />`,
                className: cls('popup-add-table'),
                fromEl: el,
                pos
            };
        case 'customPopupBody':
            if (!popup) {
                return null;
            }
            return {
                render: (props) => html`<${CustomPopupBody} ...${props} body=${popup!.body} />`,
                fromEl: el,
                pos,
                ...popup!
            };
        default:
            return null;
    }
}
