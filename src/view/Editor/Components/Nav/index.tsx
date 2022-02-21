import React from 'react';
import './index.scss';

interface getNavStatus {
    (status: string): void;
}

interface getNavMode {
    (mode: string): void;
}
interface NavProps {
    mode: string;
    getNavStatus?: getNavStatus;
    getNavMode?: getNavMode;
}

export default class Nav extends React.Component<NavProps, any> {
    constructor(props) {
        super(props);
        this.state = {
            // 侧边栏展示模式 'float' or 'fixed'
            mode: props.mode || 'float',
            // 浮窗模式(float)下，当前侧边栏展开(expand)或者收缩(close)的状态
            status: 'expand'
        };
    }

    componentDidUpdate(): void {
        const { mode } = this.state;
        console.log('--- this.props.mode ---', this.props.mode);
        if (mode !== this.props.mode) {
            this.setState({
                mode: this.props.mode
            });
        }
    }

    navWrapEl = React.createRef<HTMLDivElement>();

    navFloatEl = React.createRef<HTMLDivElement>();

    handleChangeNavStatus = (status) => {
        const { getNavStatus } = this.props;

        this.setState({
            status
        });

        if (typeof getNavStatus === 'function') {
            getNavStatus(status);
        }
    };

    componentDidMount(): void {
        this.navWrapEl.current.addEventListener(
            'mouseenter',
            () => {
                console.log('--- mouseenter ---');
                this.handleChangeNavStatus('expand');
            },
            false
        );

        this.navWrapEl.current.addEventListener(
            'mouseleave',
            () => {
                console.log('--- mouseleave ---');
                this.handleChangeNavStatus('close');
            },
            false
        );
    }

    handleClickPickUp = () => {
        const { getNavMode } = this.props;

        if (typeof getNavMode === 'function') {
            getNavMode('float');
        }
    };

    render(): React.ReactNode {
        const { mode } = this.state;
        return mode === 'fixed' ? (
            <div className="nav-fixed-wrap">
                <div className="nav-fixed-pickup">
                    <i className="icon icon-emnu-pickup" onClick={this.handleClickPickUp} />
                </div>
            </div>
        ) : (
            <div className="nav-wrap" ref={this.navWrapEl}>
                <div className="nav-menu-float nav-emnu-float-show" ref={this.navFloatEl}>
                    123123
                </div>
            </div>
        );
    }
}
