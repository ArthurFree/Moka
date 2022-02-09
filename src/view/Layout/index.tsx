import React from 'react';
import { Outlet } from 'react-router-dom';
import Nav from '../Nav/index';
import Header from '../Header/index';
import './index.scss';

export default class Layout extends React.Component {
    render() {
        return (
            <div className="layout-wrap">
                <Header />
                <Nav />
                这里是 layout
                <Outlet />
            </div>
        );
    }
}
