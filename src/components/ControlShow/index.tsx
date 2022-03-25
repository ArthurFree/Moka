import React from 'react';

interface ControlShowObj {
    className: string;
    duration: number;
}

interface ControlShowProps {
    wrapClassName?: string;
    fadeIn: ControlShowObj;
    fadeOut: ControlShowObj;
    visible: boolean;
    children: React.ReactElement;
    style?: object;
}

interface ControlShowState {
    visible: boolean;
    renderEl: React.ReactNode;
}

export default class ControlShow extends React.Component<ControlShowProps, ControlShowState> {
    static defaultProps = {
        wrapClassName: ''
    };

    static getDerivedStateFromProps(props: ControlShowProps, state: ControlShowState) {
        if (props.visible !== state.visible) {
            return {
                ...state,
                visible: props.visible
            };
        }

        return state;
    }

    time = null;

    constructor(props) {
        super(props);
        this.state = {
            visible: props.visible,
            renderEl: props.visible ? props.children : null
        };
    }

    componentDidUpdate(
        prevProps: Readonly<ControlShowProps>,
        prevState: Readonly<ControlShowState>
    ) {
        const { wrapClassName, fadeIn, fadeOut, visible, children, style = {} } = this.props;
        const el = (
            <div className={`${wrapClassName}`} style={style || {}}>
                <div style={{ display: 'none' }}>{children}</div>
            </div>
        );
        const animationEl = (
            <div
                className={`${wrapClassName} ${visible ? fadeIn.className : fadeOut.className}`}
                style={style || {}}
            >
                {children}
            </div>
        );

        // 控制 children 中的 state 变化时，重新渲染
        if (this.props.children !== prevProps.children || this.props.style !== prevProps.style) {
            this.setState({
                renderEl: this.props.visible ? animationEl : el
            });
        }

        if (prevState.visible !== this.props.visible) {
            if (visible) {
                // first step: 渲染节点
                this.setState({
                    renderEl: el
                });

                // second step: 对节点增加动效 className
                setTimeout(() => {
                    this.setState({
                        renderEl: animationEl
                    });
                }, 0);
            } else {
                const { fadeOut } = this.props;

                this.setState(
                    {
                        renderEl: animationEl
                    },
                    () => {
                        this.time = setTimeout(() => {
                            this.setState({
                                renderEl: null
                            });
                        }, fadeOut.duration);
                    }
                );
            }
        }
    }

    componentWillUnmount(): void {
        clearTimeout(this.time);
        this.time = null;
    }

    render() {
        const { visible, renderEl } = this.state;

        return renderEl;
    }
}
