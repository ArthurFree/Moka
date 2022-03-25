import React from 'react';
import Editor from '@/index';
import './index.scss';
import { EditorView } from 'prosemirror-view';
import { findDomRefAtPos, findParentNode } from 'prosemirror-utils';
import ControlShow from '@components/ControlShow';
import MenuBlock from './MenuBlock';
import { MenuItemData } from './MenuItem';
import getCommandMenuList from './meun';

interface CommandMenuBlock {
    title?: string;
    list?: Partial<MenuItemData>[];
}

interface EditorCommandMenuProps {
    editor?: Editor & { getCurrentEditorView: () => EditorView };
    wrapEl: React.RefObject<HTMLDivElement>;
}

interface EditorCommandMeunState {
    isActive: boolean;
    left?: number;
    top?: number;
    bottom?: number;
    menuList?: CommandMenuBlock[];
}

const defaultPosition = {
    left: -1000,
    top: 0,
    bottom: undefined
    // isAbove: false
};

export default class EditorCommandMenu extends React.Component<
    EditorCommandMenuProps,
    EditorCommandMeunState
> {
    state = {
        isActive: false,
        left: -1000,
        top: 0,
        bottom: undefined,
        menuList: []
    };

    el = React.createRef<HTMLDivElement>();

    componentDidMount() {
        const { editor } = this.props;
        const { eventEmitter } = editor;

        this.initEvent();
        this.calculatePosition();
        this.setState({
            menuList: getCommandMenuList(eventEmitter)
        });
    }

    componentDidUpdate(
        prevProps: Readonly<EditorCommandMenuProps>,
        prevState: Readonly<EditorCommandMeunState>
    ): void {
        if (prevState.isActive !== this.state.isActive && this.state.isActive) {
            const position = this.calculatePosition();

            this.setState({
                ...position
            });
        }
    }

    get caretPosition(): { top: number; left: number } {
        const selection = window.document.getSelection();
        if (!selection || !selection.anchorNode || !selection.focusNode) {
            return {
                top: 0,
                left: 0
            };
        }

        const range = window.document.createRange();
        range.setStart(selection.anchorNode, selection.anchorOffset);
        range.setEnd(selection.focusNode, selection.focusOffset);

        // This is a workaround for an edgecase where getBoundingClientRect will
        // return zero values if the selection is collapsed at the start of a newline
        // see reference here: https://stackoverflow.com/a/59780954
        const rects = range.getClientRects();
        if (rects.length === 0) {
            // probably buggy newline behavior, explicitly select the node contents
            if (range.startContainer && range.collapsed) {
                range.selectNodeContents(range.startContainer);
            }
        }

        const rect = range.getBoundingClientRect();
        return {
            top: rect.top,
            left: rect.left
        };
    }

    calculatePosition = () => {
        const { editor, wrapEl } = this.props;
        const { isActive } = this.state;
        const view = editor.getCurrentEditorView();
        const { selection } = view.state;
        const editorWrapEl = editor.getEditorElements().wwEditor;
        let startPos;

        try {
            startPos = view.coordsAtPos(selection.from);
        } catch (err) {
            console.warn(err);
            return defaultPosition;
        }

        const domAtPos = view.domAtPos.bind(view);
        const menuEl = this.el.current;
        const offsetHeight = menuEl ? menuEl.offsetHeight : 0;
        const node = findDomRefAtPos(selection.from, domAtPos);
        const paragraph: any = { node };

        if (!isActive || !paragraph.node || !paragraph.node.getBoundingClientRect) {
            return defaultPosition;
        }

        // const { left } = this.caretPosition;
        const { top, bottom, left, right, height } = paragraph.node.getBoundingClientRect();
        // const margin = 24;
        // Header + Toolbar 的高度
        const margin = 83;
        const leftPos = left + window.scrollX;
        /* if (props.rtl && menuEl) {
            leftPos = right - menuEl.scrollWidth;
        } */

        if (startPos.bottom - margin < offsetHeight) {
            return {
                left: leftPos,
                top: undefined,
                // bottom: editorWrapEl.offsetHeight - top - editorWrapEl.offsetTop
                bottom: document.body.offsetHeight - bottom - offsetHeight - 3
            };
        } else {
            return {
                left: leftPos,
                // 5 - 向上弹窗偏移量
                top: top - margin - offsetHeight - 3,
                bottom: undefined
            };
        }

        /* if (startPos.top - offsetHeight > margin) {
            return {
                left: leftPos,
                top: undefined,
                // bottom: editorWrapEl.offsetHeight - top - editorWrapEl.offsetTop
                bottom: document.body.offsetHeight - bottom - offsetHeight
                // isAbove: false
            };
        } else {
            return {
                left: leftPos,
                top: bottom - margin,
                bottom: undefined
                // isAbove: true
            };
        } */
    };

    initEvent() {
        const { editor } = this.props;
        const { isActive } = this.state;

        // 监听打开 command menu 命令
        editor.eventEmitter.listen('openCommandMenu', () => {
            this.toggleMenu(true);
        });

        // 监听关闭 command menu 命令
        editor.eventEmitter.listen('closeCommandMenu', () => {
            if (isActive) {
                this.toggleMenu(false);
            }
        });
    }

    toggleMenu = (isActive: boolean) => {
        this.setState({
            isActive
        });

        if (!isActive) {
            this.clearSearch();
        }
    };

    clearSearch = () => {
        const { editor } = this.props;
        const view = editor.getCurrentEditorView();
        const { state, dispatch } = view;
        const parent = findParentNode((node) => !!node)(state.selection);

        if (parent) {
            // dispatch 触发更改
            dispatch(state.tr.insertText('', parent.start, state.selection.to));
        }
    };

    render() {
        const { isActive, left, top, bottom, menuList } = this.state;
        const displayStyle = { display: isActive ? 'block' : 'none' };
        const wrapStyle = {
            ...displayStyle,
            left,
            top,
            bottom
        };

        /* return (
            <ControlShow
                visible={isActive}
                wrapClassName="editor-command-menu-wrap"
                style={wrapStyle}
                fadeIn={{
                    className: 'active',
                    duration: 100
                }}
                fadeOut={{
                    className: 'hide',
                    duration: 100
                }}
            >
                <div className="editor-command-menu" ref={this.el}>
                    <span>hello, world</span>
                </div>
            </ControlShow>
        ); */
        return (
            <div className="editor-command-menu-wrap" ref={this.el} style={wrapStyle}>
                <div className="editor-command-menu">
                    {(menuList || []).map((block, index) => {
                        return (
                            <MenuBlock
                                title={block.title}
                                list={block.list}
                                key={index}
                                onClose={this.toggleMenu}
                            />
                        );
                    })}
                </div>
            </div>
        );
    }
}
