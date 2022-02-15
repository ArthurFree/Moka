import React from 'react';
import { Outlet } from 'react-router-dom';
// import Nav from '../Nav/index';
// import Header from '../Header/index';
import Footer from '../Footer/index';
import './index.scss';

export default class Layout extends React.Component {
    render() {
        return (
            <div className="layout-wrap">
                {/* <Header /> */}
                <div className="layout-content">
                    {/* <div className="layout-nav">
                        <Nav />
                    </div> */}
                    <div className="layout-outlet">
                        <Outlet />
                    </div>
                </div>
                <Footer />
            </div>
        );
    }
}
