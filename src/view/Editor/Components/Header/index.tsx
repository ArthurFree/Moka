import React from 'react';
import './index.scss';

export default class Header extends React.Component {
    render(): React.ReactNode {
        return (
            <div className="header-wrap">
                <div className="header-toggle-nav header-float-nav">
                    <i className="icon-menu" />
                </div>
                <div className="header-doc-path">Tech / Git / Git Commit 规范</div>
            </div>
        );
    }
}
