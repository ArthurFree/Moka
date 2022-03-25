import React from 'react';
import MenuItem, { MenuItemData } from '../MenuItem';
import './index.scss';

interface MenuBlockProps {
    title?: string;
    list?: Partial<MenuItemData>[];
}

class MenuBlock extends React.Component<MenuBlockProps> {
    render() {
        const { title, list } = this.props;
        console.log('--- list ---', list);
        return (
            <div className="menu-block-wrap">
                <div className="menu-block-title">{title}</div>
                {(list || []).map((item: MenuItemData, index) => {
                    return <MenuItem data={item} key={index} />;
                })}
            </div>
        );
    }
}

export default MenuBlock;
