import React from 'react';
import Prism from 'prismjs';
import codeSyntaxHighlightPlugin from '@editorPlugins/code-syntax-highlight/indexAll';
import chart from '@editorPlugins/chart';
import colorSyntax from '@editorPlugins/color-syntax';
import tableMergedCell from '@editorPlugins/table-merged-cell';
import content from './content';
// import Vidtor from '../../editor/index';
import Editor from '../../editor/index';
import '../../editor/i18n/zh-cn';
import 'prismjs/themes/prism.css';
import './index.scss';

export default class EditorPage extends React.Component {
    rootEl = React.createRef<HTMLDivElement>();

    editorInst!: Editor;

    static editor: Editor;

    getRootElement() {
        return this.rootEl.current;
    }

    componentDidMount(): void {
        this.editorInst = new Editor({
            el: this.rootEl.current,
            previewStyle: 'vertical',
            height: '100%',
            initialValue: content,
            initialEditType: 'wysiwyg',
            language: 'zh-CN',
            // 隐藏底部的模式切换按钮
            hideModeSwitch: true,
            placeholder: '欢迎使用',
            plugins: [
                [
                    chart,
                    {
                        minWidth: 100,
                        maxWidth: 600,
                        minHeight: 100,
                        maxHeight: 300
                    }
                ],
                [
                    codeSyntaxHighlightPlugin,
                    {
                        highlighter: Prism
                    }
                ],
                colorSyntax,
                tableMergedCell
            ]
        });

        EditorPage.editor = this.editorInst;
    }

    render() {
        return (
            <div className="editor">
                <div id="editor-inst" ref={this.rootEl}></div>
            </div>
        );
    }
}
