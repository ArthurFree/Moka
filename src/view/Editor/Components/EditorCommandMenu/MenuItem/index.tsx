import React from 'react';
import './index.scss';

export interface MenuItemData {
    img: string;
    name: string;
    desc: string;
    command: string;
}

interface MenuItemProps {
    data: Partial<MenuItemData>;
}

class MenuItem extends React.Component<MenuItemProps> {
    render() {
        const { data } = this.props;

        return (
            <div className="menu-item-wrap">
                <div className="menu-item">
                    <div className="menu-item-image-wrap">
                        <img src="http://www.notion.so/images/blocks/text.9fdb530b.png" alt="" />
                    </div>
                    <div className="menu-item-content">
                        <div className="menu-item-name">{data.name}</div>
                        <div className="menu-item-desc">{data.desc}</div>
                    </div>
                </div>
            </div>
        );
    }
}

export default MenuItem;
