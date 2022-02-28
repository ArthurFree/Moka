import React from 'react';

interface ControlShowObj {
    className: string;
    duration: number;
}

interface ControlShowProps {
    wrapClassName: string;
    fadeIn: ControlShowObj;
    fadeOut: ControlShowObj;
    visible: boolean;
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
        if (prevState.visible !== this.props.visible) {
            const { wrapClassName, fadeIn, fadeOut, visible, children } = this.props;
            const el = <div className={`${wrapClassName}`}></div>;
            const animationEl = (
                <div
                    className={`${wrapClassName} ${visible ? fadeIn.className : fadeOut.className}`}
                >
                    {children}
                </div>
            );

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
        const { wrapClassName, fadeIn, fadeOut } = this.props;
        const { visible, renderEl } = this.state;

        return renderEl;
    }
}
