import React from 'react';
import MenuIcon from './Components/MenuIcon';
import Switch from '@components/Switch';
import './index.scss';

export default class Material extends React.Component {
    render() {
        return (
            <div className="material-wrap">
                <MenuIcon />
                <Switch
                    defaultChecked
                />
            </div>
        );
    }
}
