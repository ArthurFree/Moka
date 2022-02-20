import React from 'react';
import './index.scss';


interface getNavStatus {
    (status: string): void
}

interface getNavMode {
    (mode: string): void
}
interface NavProps {
    getNavStatus?: getNavStatus;
    getNavMode?: getNavMode;
};

export default class Nav extends React.Component<NavProps> {
    constructor(props) {
        super(props);
        this.state = {
            // 侧边栏展示模式 'float' or 'fixed'
            mode: 'float',
            // 浮窗模式(float)下，当前侧边栏展开(expand)或者收缩(close)的状态
            status: 'expand'
        };
    }

    navWrapEl = React.createRef<HTMLDivElement>();

    navFloatEl = React.createRef<HTMLDivElement>();

    handleChangeNavStatus = (status) => {
        const { getNavStatus } = this.props;

        this.setState({
            status,
        });

        if (typeof getNavStatus === 'function') {
            getNavStatus(status);
        }
    }

    componentDidMount(): void {
        this.navWrapEl.current.addEventListener('mouseenter', () => {
            console.log('--- mouseenter ---');
            this.handleChangeNavStatus('expand');
        }, false);

        this.navWrapEl.current.addEventListener('mouseleave', () => {
            console.log('--- mouseleave ---');
            this.handleChangeNavStatus('close');
        }, false);
    }

    render(): React.ReactNode {
        return (
            <div className="nav-wrap" ref={this.navWrapEl}>
                <div className="nav-menu-float nav-emnu-float-show" ref ={this.navFloatEl}>123123</div>
            </div>
        );
    }
}
