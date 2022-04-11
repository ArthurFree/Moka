import React from 'react';
import './index.scss';

export default class TestPage extends React.Component {
    render() {
        return (
            <div className="test-page-wrap">
                <div className="box">
                    box
                    <div className="parent">
                        parent
                        <div className="child-wrap">
                            <div className="child">
                                child-wrap
                                <div className="child-1">child-1</div>
                                <div className="child-2">child-2</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
