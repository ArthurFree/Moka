import React from 'react';
import ControlShow from '@components/ControlShow';
import './index.scss';

interface MoreMenuProps {
    editor?: any;
    visible?: boolean;
    maskClosable?: boolean;
    afterClose?: () => void;
    toggleHeader: () => void;
}

interface MoreMenuState {
    visible?: boolean;
    isHideToolbar?: boolean;
    // TODO: 使用已声明过的类型 editorType
    mode?: 'markdown' | 'wysiwyg';
}

export default class MoreMenu extends React.Component<MoreMenuProps, MoreMenuState> {
    constructor(props) {
        super(props);
        this.state = {
            visible: props.visible,
            mode: 'wysiwyg',
            isHideToolbar: false
        };
    }

    static defaultProps = {
        visible: false,
        maskClosable: true
    };

    static getDerivedStateFromProps(props, state) {
        if (
            props.visible !== state.visible ||
            props.editor?.options?.hideToolbar !== state.isHideToolbar
        ) {
            return {
                ...state,
                visible: props.visible,
                isHideToolbar: props.editor?.options?.hideToolbar || false
            };
        }

        return state;
    }

    hide = () => {
        const { afterClose } = this.props;

        this.setState({ visible: false });

        if (typeof afterClose === 'function') {
            afterClose();
        }
    };

    changeMode = (type) => () => {
        const { editor } = this.props;

        if (editor) {
            editor.changeMode(type);
            this.setState({
                mode: type
            });
        }
    };

    toggleToolbar = (isHide) => () => {
        const { editor } = this.props;

        this.setState({
            isHideToolbar: isHide
        });

        editor.eventEmitter.emit('hideToolbar', isHide);
        this.hide();
    };

    toggleHeader = () => {
        const { toggleHeader } = this.props;

        if (typeof toggleHeader === 'function') {
            toggleHeader();
        }
    }

    render() {
        const { visible, mode, isHideToolbar } = this.state;

        return (
            <div className="more-menu-wrap">
                {visible && <div className="more-menu-mask" onClick={this.hide}></div>}
                <ControlShow
                    visible={visible}
                    wrapClassName="more-menu-wrap"
                    fadeIn={{
                        className: 'more-menu more-menu-show',
                        duration: 30
                    }}
                    fadeOut={{
                        className: 'more-menu more-menu-hidden',
                        duration: 30
                    }}
                >
                    <div className="menu-list">
                        {mode === 'wysiwyg' ? (
                            <div className="menu-item-group">
                                <div className="menu-item" onClick={this.changeMode('markdown')}>
                                    <div className="menu-item-icon icon-split"></div>
                                    <div className="menu-item-content">分屏模式</div>
                                </div>
                            </div>
                        ) : (
                            <div className="menu-item-group">
                                <div className="menu-item" onClick={this.changeMode('wysiwyg')}>
                                    <div className="menu-item-icon icon-view"></div>
                                    <div className="menu-item-content">所见即所得模式</div>
                                </div>
                            </div>
                        )}
                        {isHideToolbar ? (
                            <div className="menu-item-group">
                                <div className="menu-item" onClick={this.toggleToolbar(false)}>
                                    <div className="menu-item-icon icon-split"></div>
                                    <div className="menu-item-content">显示 Toolbar</div>
                                </div>
                            </div>
                        ) : (
                            <div className="menu-item-group">
                                <div className="menu-item" onClick={this.toggleToolbar(true)}>
                                    <div className="menu-item-icon icon-view"></div>
                                    <div className="menu-item-content">隐藏 Toolbar</div>
                                </div>
                            </div>
                        )}
                        <div className="menu-item-group">
                            <div className="menu-item" onClick={this.toggleHeader}>
                                <div className="menu-item-icon icon-split"></div>
                                <div className="menu-item-content">隐藏顶部状态栏</div>
                            </div>
                        </div>
                        <div className="menu-item-group">
                            <div className="menu-item" onClick={this.hide}>
                                <div className="menu-item-icon icon-view"></div>
                                <div className="menu-item-content">关闭菜单测试</div>
                            </div>
                        </div>
                    </div>
                </ControlShow>
            </div>
        );
    }
}
