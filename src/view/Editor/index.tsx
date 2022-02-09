import React from 'react';
import './index.scss';

export default class Editor extends React.Component {
    render() {
        return (
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
        );
    }
}
