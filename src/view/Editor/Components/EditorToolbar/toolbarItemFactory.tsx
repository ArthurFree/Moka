import React from 'react';
import isString from 'tui-code-snippet/type/isString';
import addClass from 'tui-code-snippet/domUtil/addClass';
import removeClass from 'tui-code-snippet/domUtil/removeClass';
import { cls } from '@/utils/dom';
import {
    PopupInfo,
    PopupOptions,
    Pos,
    ToolbarButtonInfo,
    ToolbarGroupInfo,
    ToolbarItem,
    ToolbarItemInfo,
    ToolbarItemOptions,
    PopupInitialValues,
    ToolbarCustomOptions,
    ExecCommand
} from '@editorType/ui';
import i18n from '@/i18n/i18n';
import { HeadingPopupBody } from './Components/HeadingPopupBody';
import { ImagePopupBody } from './Components/ImagePopupBody';
import { LinkPopupBody } from './Components/LinkPopupBody';
import { TablePopupBody } from './Components/TablePopupBody';
import { CustomPopupBody } from './Components/CustomPopupBody';
import { ColorPopupBody } from './Components/ColorPopupBody';

interface Payload {
    el: HTMLElement;
    pos: Pos;
    popup?: PopupOptions;
    initialValues?: PopupInitialValues;
}

// interface PopupInfo {
//     className?: string;
//     style?: Record<string, any>;
//     fromEl: HTMLElement;
//     pos: Pos;
//     // TODO: 这里的类型需要使用具体类型
//     render: (props: any) => React.ReactNode | React.ReactNode[];
//     initialValues?: PopupInitialValues;
// }

export function createToolbarItemInfo(type: string | ToolbarItemOptions): ToolbarItemInfo {
    return isString(type) ? createDefaultToolbarItemInfo(type) : type;
}

function createScrollSyncToolbarItem(): ToolbarItemInfo {
    const label = document.createElement('label');
    const checkbox = document.createElement('input');
    const toggleSwitch = document.createElement('span');

    label.className = 'scroll-sync active';
    checkbox.type = 'checkbox';
    checkbox.checked = true;
    toggleSwitch.className = 'switch';

    const onMounted = (execCommand: ExecCommand) =>
        checkbox.addEventListener('change', (ev: Event) => {
            const { checked } = ev.target as HTMLInputElement;

            if (checked) {
                addClass(label, 'active');
            } else {
                removeClass(label, 'active');
            }
            execCommand('toggleScrollSync', { active: checked });
        });

    label.appendChild(checkbox);
    label.appendChild(toggleSwitch);

    return {
        name: 'scrollSync',
        el: label,
        onMounted
    };
}

// 创建默认的 Toolbar 信息
function createDefaultToolbarItemInfo(type: string) {
    let info!: ToolbarButtonInfo | ToolbarCustomOptions;

    switch (type) {
        case 'heading':
            info = {
                name: 'heading',
                // 编辑文本节点的 className
                className: 'heading',
                // 按钮的 tooltip
                tooltip: i18n.get('Headings'),
                state: 'heading'
            };
            break;
        case 'bold':
            info = {
                name: 'bold',
                className: 'bold',
                // 按钮触发的执行命令
                command: 'bold',
                tooltip: i18n.get('Bold'),
                state: 'strong'
            };
            break;
        case 'italic':
            info = {
                name: 'italic',
                className: 'italic',
                command: 'italic',
                tooltip: i18n.get('Italic'),
                state: 'emph'
            };
            break;
        case 'strike':
            info = {
                name: 'strike',
                className: 'strike',
                command: 'strike',
                tooltip: i18n.get('Strike'),
                state: 'strike'
            };
            break;
        case 'colors':
            info = {
                name: 'colors',
                className: 'color',
                // TODO: 略坑
                // 是否有 command 字段，代表了是否有 popup 弹窗形式
                // command: 'colors',
                tooltip: i18n.get('Text color'),
                state: 'color'
            };
            break;
        case 'hr':
            info = {
                name: 'hr',
                className: 'hrline',
                command: 'hr',
                tooltip: i18n.get('Line'),
                state: 'thematicBreak'
            };
            break;
        case 'quote':
            info = {
                name: 'quote',
                className: 'quote',
                command: 'blockQuote',
                tooltip: i18n.get('Blockquote'),
                state: 'blockQuote'
            };
            break;
        case 'ul':
            info = {
                name: 'ul',
                className: 'bullet-list',
                command: 'bulletList',
                tooltip: i18n.get('Unordered list'),
                state: 'bulletList'
            };
            break;
        case 'ol':
            info = {
                name: 'ol',
                className: 'ordered-list',
                command: 'orderedList',
                tooltip: i18n.get('Ordered list'),
                state: 'orderedList'
            };
            break;
        case 'task':
            info = {
                name: 'task',
                className: 'task-list',
                command: 'taskList',
                tooltip: i18n.get('Task'),
                state: 'taskList'
            };
            break;
        case 'table':
            info = {
                name: 'table',
                className: 'table',
                tooltip: i18n.get('Insert table'),
                state: 'table'
            };
            break;

        case 'image':
            info = {
                name: 'image',
                className: 'image',
                tooltip: i18n.get('Insert image')
            };
            break;
        case 'link':
            info = {
                name: 'link',
                className: 'link',
                tooltip: i18n.get('Insert link')
            };
            break;
        case 'code':
            info = {
                name: 'code',
                className: 'code',
                command: 'code',
                tooltip: i18n.get('Code'),
                state: 'code'
            };
            break;
        case 'codeblock':
            info = {
                name: 'codeblock',
                className: 'codeblock',
                command: 'codeBlock',
                tooltip: i18n.get('Insert CodeBlock'),
                state: 'codeBlock'
            };
            break;
        case 'indent':
            info = {
                name: 'indent',
                className: 'indent',
                command: 'indent',
                tooltip: i18n.get('Indent'),
                state: 'indent'
            };
            break;
        case 'outdent':
            info = {
                name: 'outdent',
                className: 'outdent',
                command: 'outdent',
                tooltip: i18n.get('Outdent'),
                state: 'outdent'
            };
            break;
        case 'scrollSync':
            info = createScrollSyncToolbarItem();
            break;
        case 'more':
            info = {
                name: 'more',
                className: 'more',
                tooltip: i18n.get('More')
            };
            break;

        default:
        // do nothing
    }

    if (info.name !== 'scrollSync') {
        (info as ToolbarButtonInfo).className += ` ${cls('toolbar-icons')}`;
    }

    return info;
}

// 创建 toolbar 弹窗
export function createPopupInfo(type: string, payload: Payload): PopupInfo | null {
    const { el, pos, popup, initialValues } = payload;

    switch (type) {
        case 'heading':
            return {
                // 弹窗外层 className
                className: cls('popup-add-heading'),
                fromEl: el,
                // 位置
                pos,
                render: (props) => {
                    return <HeadingPopupBody {...props} />;
                }
            };
        case 'link':
            return {
                render: (props) => {
                    return <LinkPopupBody {...props} />;
                },
                className: cls('popup-add-link'),
                fromEl: el,
                pos,
                initialValues
            };
        case 'image':
            return {
                render: (props) => {
                    return <ImagePopupBody {...props} />;
                },
                className: cls('popup-add-image'),
                fromEl: el,
                pos
            };
        case 'table':
            return {
                render: (props) => {
                    return <TablePopupBody {...props} />;
                },
                className: cls('popup-add-table'),
                fromEl: el,
                pos
            };
        case 'colors':
            return {
                render: (props) => {
                    return <ColorPopupBody {...props} />;
                },
                className: cls('popup-color'),
                style: {
                    width: 'auto'
                },
                fromEl: el,
                pos
            };
        case 'customPopupBody':
            if (!popup) {
                return null;
            }
            return {
                render: (props) => {
                    return <CustomPopupBody {...props} body={popup!.body} />;
                },
                fromEl: el,
                pos,
                ...popup!
            };
        default:
            return null;
    }
}

export function setGroupState(group: ToolbarGroupInfo) {
    group.hidden = group.length === group.filter((info: ToolbarButtonInfo) => info.hidden).length;
}

export function groupToolbarItems(toolbarItems: ToolbarItem[], hiddenScrollSync: boolean) {
    const toggleScrollSyncState = (item: ToolbarButtonInfo) => {
        item.hidden = item.name === 'scrollSync' && hiddenScrollSync;
        return item;
    };

    return toolbarItems.reduce((acc: ToolbarGroupInfo[], item) => {
        acc.push(item.map((type) => toggleScrollSyncState(createToolbarItemInfo(type))));
        const group = acc[(acc.length || 1) - 1];

        if (group) {
            setGroupState(group);
        }
        return acc;
    }, []);
}

export function toggleScrollSync(toolbarItems: ToolbarGroupInfo[], hiddenScrollSync: boolean) {
    toolbarItems.forEach((group) => {
        group.forEach(
            (item: ToolbarButtonInfo) =>
                (item.hidden = item.name === 'scrollSync' && hiddenScrollSync)
        );
        setGroupState(group);
    });
}
