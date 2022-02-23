import React from 'react';
import ControlShow from '@components/ControlShow';
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

        if (typeof afterClose === 'function') {
            afterClose();
        }
    };

    render() {
        const { visible } = this.state;

        return (
            <div className="more-menu-wrap">
                {visible && <div className="more-menu-mask" onClick={this.hide}></div>}
                <ControlShow
                    visible={visible}
                    wrapClassName="more-menu-wrap"
                    fadeIn={{
                        className: 'more-menu more-menu-show',
                        duration: 300,
                    }}
                    fadeOut={{
                        className: 'more-menu more-menu-hidden',
                        duration: 300,
                    }}
                >
                    123
                </ControlShow>
            </div>
        );
    }
}
