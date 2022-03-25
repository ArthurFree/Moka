import React from 'react';
import './index.scss';

export interface MenuItemData {
    img: string;
    name: string;
    desc: string;
    command: string;
    onSelect: () => void;
    onBeforeClose?: () => void;
}

interface MenuItemProps {
    data: Partial<MenuItemData>;
    onClose?: (isActive: boolean) => void;
}

class MenuItem extends React.Component<MenuItemProps> {
    handleSelect = () => {
        const { data, onClose } = this.props;

        if (data.onSelect && typeof data.onSelect === 'function') {
            data.onSelect();
        }

        if (data.onBeforeClose && typeof data.onBeforeClose === 'function') {
            data.onBeforeClose();
        }

        if (onClose && typeof onClose === 'function') {
            onClose(false);
        }
    };

    render() {
        const { data } = this.props;

        return (
            <div className="menu-item-wrap" onClick={this.handleSelect}>
                <div className="menu-item">
                    <div className="menu-item-image-wrap">
                        <img src={data.img} alt="" />
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
