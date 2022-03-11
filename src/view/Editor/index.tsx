import React from 'react';
import Prism from 'prismjs';
import EditorComp from '@components/Editor';
import codeSyntaxHighlightPlugin from '../../editorPlugins/code-syntax-highlight/indexAll';
import chart from '../../editorPlugins/chart';
import colorSyntax from '../../editorPlugins/color-syntax';
import tableMergedCell from '../../editorPlugins/table-merged-cell';
import Header from './Components/Header/index';
import Nav from './Components/Nav/index';
import EditorToolbar from './Components/EditorToolbar';
// import Vidtor from '../../editor/index';
// import Editor from '../../editor/index';
import 'prismjs/themes/prism.css';
import './index.scss';

interface EditorPageState {
    [propName: string]: any;
}

export default class EditorPage extends React.Component<unknown, EditorPageState> {
    constructor(props) {
        super(props);
        this.state = {
            navMode: 'float',
            navStatus: 'close',
            editor: null
        };
    }

    componentDidMount(): void {
        if (EditorComp.editor) {
            this.setState({
                editor: EditorComp.editor
            });
        }
    }

    getNavStatus = (status: string) => {
        this.setState({
            navStatus: status
        });
    };

    getNavMode = (mode: string) => {
        this.setState({
            navMode: mode
        });
    };

    getNavModeChange = (mode) => {
        this.setState({
            navMode: mode
        });
    };

    render() {
        const { navMode, navStatus, editor } = this.state;
        return (
            <div className="editor-wrap moka--default">
                {/* <div className="editor-nav-wrap">
                    <Nav
                        mode={navMode}
                        getNavStatus={this.getNavStatus}
                        getNavMode={this.getNavMode}
                    />
                </div> */}
                <Nav mode={navMode} getNavStatus={this.getNavStatus} getNavMode={this.getNavMode} />
                <div className="editor-content">
                    <Header
                        editor={editor}
                        navStatus={navStatus}
                        navMode={navMode}
                        getNavModeChange={this.getNavModeChange}
                    />
                    {editor && (
                        <EditorToolbar
                            eventEmitter={editor.eventEmitter}
                            previewStyle="tab"
                            toolbarItems={[
                                ['heading', 'bold', 'italic', 'strike'],
                                ['hr', 'quote'],
                                ['ul', 'ol', 'task', 'indent', 'outdent'],
                                ['table', 'image', 'link'],
                                ['code', 'codeblock'],
                                ['scrollSync']
                            ]}
                            editorType="wysiwyg"
                            hideToolbar={false}
                        />
                    )}

                    {/* <div className="editor-nav-wrap">
                        <Nav
                            mode={navMode}
                            getNavStatus={this.getNavStatus}
                            getNavMode={this.getNavMode}
                        />
                    </div> */}
                    <div className="editor-opreate-content">
                        <EditorComp />
                    </div>
                </div>
            </div>
        );
    }
}
