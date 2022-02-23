import React from 'react';
import './index.scss';

interface MoreMenuProps {
    visible?: boolean;
    maskClosable?: boolean;
    afterClose?: () => void;
}

interface MoreMenuState {
    visible?: boolean;
}

export default class MoreMenu extends React.Component<MoreMenuProps, MoreMenuState> {
    constructor(props) {
        super(props);
        this.state = {
            visible: props.visible
        };
    }

    static defaultProps = {
        visible: false,
        maskClosable: true
    };

    static getDerivedStateFromProps(props, state) {
        if (props.visible !== state.visible) {
            return {
                ...state,
                visible: props.visible
            };
        }

        return state;
    }

    hide = () => {
        const { afterClose } = this.props;

        this.setState({ visible: false });

        console.log('--- close ---');

        if (typeof afterClose === 'function') {
            afterClose();
        }
    };

    render() {
        const { visible } = this.state;
        /* return (
            visible && (
                <div className="more-menu-wrap">
                    <div className="more-menu-mask" onClick={this.hide}></div>
                    <div className={`more-menu${visible ? '' : ' more-menu-hidden'}`}>123</div>
                </div>
            )
        ); */

        return (
            <div className="more-menu-wrap">
                {visible && <div className="more-menu-mask" onClick={this.hide}></div>}
                <div className={`more-menu ${visible ? 'more-menu-show' : 'more-menu-hidden'}`}>
                    123
                </div>
            </div>
        );
    }
}
