import React from 'react';
import Vidtor from '../../editor/index';
import './index.scss';

export default class Editor extends React.Component {
    componentDidMount() {
        const vditor = new Vidtor('vditor', {
            height: 360,
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
    }

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
            <div id="vditor"></div>
        );
    }
}
