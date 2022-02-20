import React from 'react';
import Prism from 'prismjs';
import EditorComp from '@components/Editor'
import codeSyntaxHighlightPlugin from '../../editorPlugins/code-syntax-highlight/indexAll';
import chart from '../../editorPlugins/chart';
import colorSyntax from '../../editorPlugins/color-syntax';
import tableMergedCell from '../../editorPlugins/table-merged-cell';
import Header from './Components/Header/index';
import Nav from './Components/Nav/index';
// import Vidtor from '../../editor/index';
import Editor from '../../editor/index';
import 'prismjs/themes/prism.css';
import './index.scss';

interface EditorPageState {
    [propName: string]: string
}

export default class EditorPage extends React.Component<any, EditorPageState> {
    constructor(props) {
        super(props);
        this.state = {
            navMode: 'float',
            navStatus: 'close',
        };
    }

    getNavStatus = (status: string) => {
        console.log('---- status ---', status);

        this.setState({
            navStatus: status,
        });
    }

    getNavMode = (mode: string) => {
        console.log('--- mode ---', mode);

        this.setState({
            navMode: mode,
        });
    }

    getNavModeChange = (mode) => {
        this.setState({
            navMode: mode,
        });
    }

    render() {
        const { navMode, navStatus } = this.state;
        console.log('----- page navStatus ---', navStatus);
        return (
            <div className="editor-wrap moka--default">
                <Header
                    navStatus={navStatus}
                    navMode={navMode}
                    getNavModeChange={this.getNavModeChange}
                />
                <div className="editor-content">
                    <div className="editor-nav-wrap">
                        <Nav
                            mode={navMode}
                            getNavStatus={this.getNavStatus}
                            getNavMode={this.getNavMode}
                        />
                    </div>
                    <div className="editor-opreate-content">
                        <EditorComp />
                    </div>
                </div>
            </div>
        );
    }
}
