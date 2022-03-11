import React from 'react';
import { cls } from '@/utils/dom';
import { PopupInitialValues, PopupOptions, Pos, /* PopupInfo */ } from "@editorType/ui";
import { HeadingPopupBody } from './Components/HeadingPopupBody';
import { ImagePopupBody } from './Components/ImagePopupBody';
import { LinkPopupBody } from './Components/LinkPopupBody';
import { TablePopupBody } from './Components/TablePopupBody';
import { CustomPopupBody } from './Components/CustomPopupBody';

interface Payload {
    el: HTMLElement,
    pos: Pos,
    popup?: PopupOptions;
    initialValues?: PopupInitialValues;
}

interface PopupInfo {
    className?: string;
    style?: Record<string, any>;
    fromEl: HTMLElement;
    pos: Pos;
    // TODO: 这里的类型需要使用具体类型
    render: (props: any) => React.ReactNode | React.ReactNode[];
    initialValues?: PopupInitialValues;
  }

export function createPopupInfo (type: string, payload: Payload): PopupInfo | null {
    const { el, pos, popup, initialValues } = payload;

    switch (type) {
        case 'heading':
            return {
                className: cls('popup-add-heading'),
                fromEl: el,
                pos,
                render: (props) => {
                    return (
                        <HeadingPopupBody {...props} />
                    );
                }
            };
        case 'link':
            return {
                render: (props) => {
                    return (
                        <LinkPopupBody {...props} />
                    )
                },
                className: cls('popup-add-link'),
                fromEl: el,
                pos,
                initialValues
            };
        case 'image':
            return {
                render: (props) => {
                    return (
                        <ImagePopupBody {...props} />
                    )
                },
                className: cls('popup-add-image'),
                fromEl: el,
                pos
            };
        case 'table':
            return {
                render: (props) => {
                    return (
                        <TablePopupBody {...props} />
                    )
                },
                className: cls('popup-add-table'),
                fromEl: el,
                pos
            };
        case 'customPopupBody':
            if (!popup) {
                return null;
            }
            return {
                render: (props) => {
                    return (
                        <CustomPopupBody {...props} body={popup!.body} />
                    )
                },
                fromEl: el,
                pos,
                ...popup!
            };
        default:
            return null;
    }
}
