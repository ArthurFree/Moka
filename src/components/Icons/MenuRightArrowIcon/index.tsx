import React from 'react';
import './index.scss';

interface MenuIconProps {
    isArrow?: boolean;
    isMouseOverChange: boolean;
    onClick: () => void
}

interface MenuIconState {
    expand: boolean;
}

export default class MenuIcon extends React.Component<MenuIconProps, MenuIconState> {
    static defaultProps = {
        isMouseOverChange: false,
        isArrow: false,
    }

    state = {
        expand: false,
    }

    toggleMouseEnter = () => {
        const { isMouseOverChange } = this.props;

        if (isMouseOverChange) {
            this.setState({
                expand: !this.state.expand,
            });
        }
    }

    handleClick = () => {
        const { onClick } = this.props;

        if (typeof onClick === 'function') {
            onClick();
        }
    }

    render() {
        const { isArrow, } = this.props;
        const { expand } = this.state;

        return (
            <div
                className={`menu-right-icon-wrap ${(isArrow || expand) ? 'menu-arrow-status' : ''}`}
                onMouseEnter={this.toggleMouseEnter}
                onMouseLeave={this.toggleMouseEnter}
                onClick={this.handleClick}
            >
                <div className="menu-icon">
                    <span className="menu-center-right-line"></span>
                </div>
                <div className="menu-icon-double"></div>
            </div>
        );
    }
}
