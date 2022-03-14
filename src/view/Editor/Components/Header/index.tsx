import React from 'react';
import MoreMenu from '../MoreMenu';
import MenuRightIcon from '@components/Icons/MenuRightArrowIcon';
import MenuLeftIcon from '@components/Icons/MenuLeftArrowIcon';
import './index.scss';
import { EditorType } from '@editorType/editor';

interface getNavModeChange {
    (mode: string): void;
}

interface HeaderProps {
    navStatus?: string;
    navMode?: string;
    editor?: any;
    getNavModeChange?: getNavModeChange;
    onChangeMode?: (mode: EditorType) => void;
}

interface HeaderState {
    mode?: string;
    moreMenuVisible?: boolean;
    visible?: boolean;
}

const navStatusClassName = {
    close: 'icon-menu',
    expand: 'icon-expand-menu icon-animate'
};

export default class Header extends React.Component<HeaderProps, HeaderState> {
    constructor(props) {
        super(props);
        this.state = {
            mode: props.navMode,
            moreMenuVisible: false,
            visible: true,
        };
    }

    componentDidUpdate(): void {
        const { navMode } = this.props;
        const { mode } = this.state;

        if (navMode !== mode) {
            this.setState({
                mode: navMode
            });
        }
    }

    changeNavMode = () => {
        const { getNavModeChange } = this.props;
        const { mode } = this.state;
        const _mode = mode === 'fixed' ? 'float' : 'fixed';

        this.setState({
            mode: _mode
        });

        if (typeof getNavModeChange === 'function') {
            getNavModeChange(_mode);
        }
    };

    toggleMoreMenu = () => this.setState({ moreMenuVisible: !this.state.moreMenuVisible });

    toggleHeader = () => this.setState({ visible: !this.state.visible })

    handleChangeMode = (mode) => {
        const { onChangeMode } = this.props;

        if (typeof onChangeMode === 'function') {
            onChangeMode(mode);
        }
    }

    render(): React.ReactNode {
        const { navStatus, editor, } = this.props;
        const { mode, moreMenuVisible, visible } = this.state;

        return (
            <div className={`header-wrap ${visible ? '' : 'header-wrap-hidden'}`}>
                <div className="left-btn-group">
                    {/* {mode === 'float' ? (
                        <div
                            className="header-toggle-nav header-float-nav icon-wrap"
                            onClick={this.changeNavMode}
                        >
                            <i className={`icon ${navStatusClassName[navStatus]}`} />
                        </div>
                    ) : (
                        <div
                            className="header-toggle-nav header-fixed-nav icon-wrap"
                            onClick={this.changeNavMode}
                            style={{ display: 'none' }}
                        >
                            <i className="icon icon-left-arrow" />
                        </div>
                    )} */}
                    {/* {mode === 'float' && (
                        <MenuIcon
                            isMouseOverChange
                            // isArrow={mode === 'fixed'}
                            onClick={this.changeNavMode}
                        />
                    )} */}
                    {mode === 'fixed' ? /* (
                        <MenuLeftIcon
                            isMouseOverChange
                            isArrow={navStatus === 'expand'}
                            onClick={this.changeNavMode}
                        />
                    ) */ null : (
                        <MenuRightIcon
                            isMouseOverChange
                            isArrow={navStatus === 'expand'}
                            onClick={this.changeNavMode}
                        />
                    )}
                </div>
                <div className="header-doc-path">Tech / Git / Git Commit 规范</div>
                <div className="right-btn-group">
                    <div className="header-more-btn">
                        <i className="icon icon-more" onClick={this.toggleMoreMenu} />
                    </div>
                </div>
                <MoreMenu
                    visible={moreMenuVisible}
                    editor={editor}
                    afterClose={this.toggleMoreMenu}
                    toggleHeader={this.toggleHeader}
                    onChangeMode={this.handleChangeMode}
                />
            </div>
        );
    }
}
