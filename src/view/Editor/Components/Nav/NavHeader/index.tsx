import React from 'react';
import './index.scss';

export default class NavHeader extends React.Component {
    render() {
        return (
            <div className="nav-header-wrap">
                <div className="nav-header-content">
                    <div className="nav-header-sign">
                        <div className="nav-header-sign-text">A</div>
                    </div>
                    <div className="nav-header-username">
                        <div className="nav-header-username-text">Arthur's Note</div>
                    </div>
                    <div className="nav-header-controll-icon">
                        <svg viewBox="-1 -1 9 11" className="nav-header-controll-icon-expand">
                            <path id="path0_stroke" d="M 3.5 0L 3.98809 -0.569442L 3.5 -0.987808L 3.01191 -0.569442L 3.5 0ZM 3.5 9L 3.01191 9.56944L 3.5 9.98781L 3.98809 9.56944L 3.5 9ZM 0.488094 3.56944L 3.98809 0.569442L 3.01191 -0.569442L -0.488094 2.43056L 0.488094 3.56944ZM 3.01191 0.569442L 6.51191 3.56944L 7.48809 2.43056L 3.98809 -0.569442L 3.01191 0.569442ZM -0.488094 6.56944L 3.01191 9.56944L 3.98809 8.43056L 0.488094 5.43056L -0.488094 6.56944ZM 3.98809 9.56944L 7.48809 6.56944L 6.51191 5.43056L 3.01191 8.43056L 3.98809 9.56944Z"></path>
                        </svg>
                    </div>
                </div>
            </div>
        );
    }
}
