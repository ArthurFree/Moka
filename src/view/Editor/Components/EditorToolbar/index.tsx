import { cls } from '@/utils/dom';
import React from 'react';
import ToolbarGroup from './Components/ToolbarGroup';
import './index.scss';

class EditorToolbar extends React.Component {
    el = React.createRef<HTMLDivElement>();

    render() {
        const { previewStyle, eventEmitter, editorType, hideToolbar } = this.props;
        const { popupInfo, showPopup, activeTab, items, dropdownItems } = this.state;
        const props = {
            eventEmitter,
            tooltipRef: this.tooltipRef,
            disabled: editorType === 'markdown' && previewStyle === 'tab' && activeTab === 'preview',
            execCommand: this.execCommand,
            setPopupInfo: this.setPopupInfo,
        };
        const toolbarStyle = previewStyle === 'tab' ? { borderTopLeftRadius: 0 } : null;

        return (
            <div
                className={cls('toolbar')}
                style={hideToolbar ? { 'opacity': 0, marginTop: '-46px', zIndex: '-1' } : {}}
            >
                <div
                    className={cls('defaultUI-toolbar')}
                    ref={this.el}
                    style={toolbarStyle}
                >
                    {items.map((group, index) => (
                        <ToolbarGroup
                            group={group}
                            hiddenDivider={index === items.length - 1 || items[index + 1]?.hidden}
                            setItemWdith={this.setItemWidth}
                            {...props}
                        />
                    ))}
                </div>
            </div>
        );
    }
}

export default EditorToolbar;
