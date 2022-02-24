import React from 'react';
import MoreMenu from '../MoreMenu';
import MenuRightIcon from '@components/Icons/MenuRightArrowIcon';
import MenuLeftIcon from '@components/Icons/MenuLeftArrowIcon';
import './index.scss';

interface getNavModeChange {
    (mode: string): void;
}

interface HeaderProps {
    navStatus?: string;
    navMode?: string;
    getNavModeChange?: getNavModeChange;
}

interface HeaderState {
    mode?: string;
    moreMenuVisible?: boolean;
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
            moreMenuVisible: false
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
            mode: _mode,
        });

        if (typeof getNavModeChange === 'function') {
            getNavModeChange(_mode);
        }
    };

    toggleMoreMenu = () => this.setState({ moreMenuVisible: !this.state.moreMenuVisible });

    render(): React.ReactNode {
        const { navStatus } = this.props;
        const { mode, moreMenuVisible } = this.state;

        return (
            <div className="header-wrap">
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
                    ) */null : (
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
                <MoreMenu visible={moreMenuVisible} afterClose={this.toggleMoreMenu} />
            </div>
        );
    }
}
