import React from 'react';
import Prism from 'prismjs';
import codeSyntaxHighlightPlugin from '../../editorPlugins/code-syntax-highlight/indexAll';
import Header from './Components/Header/index';
import Nav from './Components/Nav/index';
// import Vidtor from '../../editor/index';
import Editor from '../../editor/index';
import 'prismjs/themes/prism.css';
import './index.scss';

export default class EditorPage extends React.Component {
    rootEl = React.createRef<HTMLDivElement>();

    editorInst!: Editor;

    getRootElement() {
        return this.rootEl.current;
    }

    componentDidMount(): void {
        this.editorInst = new Editor({
            el: this.rootEl.current,
            previewStyle: 'vertical',
            height: '500px',
            initialValue: '',
            plugins: [[codeSyntaxHighlightPlugin, { highlighter: Prism }]]
        });
    }
    /* componentDidMount() {
        const vditor = new Vidtor('vditor', {
            height: '100%',
            toolbarConfig: {
                pin: true,
            },
            cache: {
                enable: false,
            },
            after () {
                vditor.setValue('Hello, Vditor + React!')
            },
        })
    } */

    /*
    <div className="editor-wrap">
        <div className="editor-edit-area">
            这里是编辑区域
        </div>
        <div className="button-bar-wrap">

        </div>
        <div className="editor-preview-area">
            这里是预览区域
        </div>
    </div>
    */
    render() {
        return (
            <div className="editor-wrap moka--default">
                <Header />
                <div className="editor-content">
                    <div className="editor-nav-wrap">
                        <Nav />
                    </div>
                    <div className="editor">
                        <div id="editor-inst" ref={this.rootEl}></div>
                    </div>
                </div>
            </div>
        );
    }
}
