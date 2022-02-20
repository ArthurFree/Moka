import React from 'react';
import './index.scss';

interface getNavModeChange {
    (mode: string): void;
}

interface HeaderProps {
    navStatus?: string;
    navMode?: string;
    getNavModeChange?: getNavModeChange,
};

const navStatusClassName = {
    'close': 'icon-menu',
    'expand': 'icon-expand-menu icon-animate',
};

export default class Header extends React.Component<HeaderProps, any> {
    constructor(props) {
        super(props);
        this.state = {
            mode: props.navMode,
        };
    }

    componentDidUpdate(): void {
        const { navMode } = this.props;
        const { mode} = this.state;

        if (navMode !== mode) {
            this.setState({
                mode: navMode,
            });
        }
    }

    changeNavMode = () => {
        const { getNavModeChange } = this.props;

        this.setState({
            mode: 'fixed',
        });

        if (typeof getNavModeChange === 'function') {
            getNavModeChange('fixed');
        }
    }

    render(): React.ReactNode {
        const { navStatus, } = this.props;
        const { mode } = this.state;

        console.log('--- header navStatus ---', navStatus);
        return (
            <div className="header-wrap">
                <div className="left-btn-group">
                    {mode === 'float' ? (
                        <div
                            className="header-toggle-nav header-float-nav icon-wrap"
                            onClick={this.changeNavMode}
                        >
                            <i className={`icon ${navStatusClassName[navStatus]}`} />
                        </div>
                    ): (
                        <div
                            className="header-toggle-nav header-fixed-nav icon-wrap"
                            onClick={this.changeNavMode}
                            style={{ display: 'none' }}
                        >
                            <i className="icon icon-left-arrow" />
                        </div>
                    )}
                </div>
                <div className="header-doc-path">Tech / Git / Git Commit 规范</div>
                <div className="right-btn-group">
                    <div className="header-more-btn">
                        <i className="icon icon-more" />
                    </div>
                </div>
            </div>
        );
    }
}
