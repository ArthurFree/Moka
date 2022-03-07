import React from 'react';
import './index.scss';

export default class NavFooter extends React.Component {
    render() {
        return (
            <div className="nav-footer-wrap">
                <div className="nav-footer-add-page">
                    <div className="nav-footer-icon">
                        <svg viewBox="0 0 16 16" className="nav-footer-plus-icon">
                            <path d="M7.977 14.963c.407 0 .747-.324.747-.723V8.72h5.362c.399 0 .74-.34.74-.747a.746.746 0 00-.74-.738H8.724V1.706c0-.398-.34-.722-.747-.722a.732.732 0 00-.739.722v5.529h-5.37a.746.746 0 00-.74.738c0 .407.341.747.74.747h5.37v5.52c0 .399.332.723.739.723z"></path>
                        </svg>
                    </div>
                    <span>New Page</span>
                </div>
            </div>
        );
    }
}
