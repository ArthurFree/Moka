import React from 'react';
import './index.scss';

export default class MenuIcon extends React.Component {
    state = {
        status: false
    };

    changeStatus = () => {
        this.setState({
            status: !this.state.status
        });
    };

    render() {
        const { status } = this.state;
        return (
            <div className="MenuIcon-wrap">
                <section>
                    <nav>
                        <a
                            className={`navicon-button larr ${status ? 'open' : ''}`}
                            onClick={this.changeStatus}
                        >
                            <div className="navicon"></div>
                        </a>
                        <a className="navicon-button rarr">
                            <div className="navicon"></div>
                        </a>
                        <a className="navicon-button uarr">
                            <div className="navicon"></div>
                        </a>
                        <a className="navicon-button x">
                            <div className="navicon"></div>
                        </a>
                        <a className="navicon-button plus">
                            <div className="navicon"></div>
                        </a>
                        <a className="navicon-button">
                            <div className="navicon"></div>
                        </a>
                    </nav>
                </section>
                <div>
                    <div className="menu-icon-wrap">
                        <div className="center">
                            <div className="menu-icon">
                                <span className="menu-center-left-line"></span>
                            </div>
                            <div className="menu-icon-double"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
