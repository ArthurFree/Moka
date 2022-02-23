import React from 'react';

interface AnimationObj {
    className: string;
    duration: number;
}

interface AnimationProps {
    wrapClassName: string;
    before: AnimationObj;
    after: AnimationObj;
    visible: boolean;
}

interface AnimationState {
    visible: boolean;
    renderEl: React.ReactNode;
}

export default class Animation extends React.Component<AnimationProps, AnimationState> {
    static defaultProps = {
        wrapClassName: ''
    };

    static getDerivedStateFromProps(props: AnimationProps, state: AnimationState) {
        if (props.visible !== state.visible) {
            return {
                ...state,
                visible: props.visible
            };
        }

        return state;
    }

    constructor(props) {
        super(props);
        this.state = {
            visible: props.visible,
            renderEl: props.visible ? props.children : null
        };
    }

    componentDidUpdate(
        prevProps: Readonly<AnimationProps>,
        prevState: Readonly<AnimationState>
    ): void {
        if (prevState.visible !== this.props.visible) {
            this.setState({});
        }
    }

    render() {
        const { wrapClassName, before, after, children } = this.props;
        const { visible } = this.state;

        return (
            <div className={`${wrapClassName} ${!visible ? before.className : after.className}`}>
                {children}
            </div>
        );
    }
}
