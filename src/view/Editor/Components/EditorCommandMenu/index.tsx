import React from 'react';
import './index.scss';

interface EditorCommandMenuProps {
    editor?: any;
}

interface EditorCommandMeunState {
    isActive: boolean;
}

export default class EditorCommandMenu extends React.Component<
    EditorCommandMenuProps,
    EditorCommandMeunState
> {
    state = {
        isActive: false
    };

    componentDidMount() {
        const { editor } = this.props;

        editor.eventEmitter.listen('openCommandMenu', () => {
            this.setState({
                isActive: true
            });
        });

        editor.eventEmitter.listen('closeCommandMenu', () => {
            this.setState({
                isActive: false
            });
        });
    }

    render() {
        const { isActive } = this.state;
        const wrapStyle = { display: isActive ? 'block' : 'none' };

        return (
            <div className="editor-command-menu-wrap" style={wrapStyle}>
                <span>hello, world</span>
            </div>
        );
    }
}
