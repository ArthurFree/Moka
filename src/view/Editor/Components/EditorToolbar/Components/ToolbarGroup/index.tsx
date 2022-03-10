import { Emitter } from '@editorType/event';
import { ExecCommand, GetBound, HideTooltip, SetItemWidth, SetPopupInfo, ShowTooltip, ToolbarCustomOptions, ToolbarGroupInfo } from '@editorType/ui';
import React from 'react';
import ToolbarButton from '../ToolbarButton';
import './index.scss';

interface ToolbarGroupProps {
    tooltipEl: HTMLElement;
    disabled: boolean;
    group: ToolbarGroupInfo;
    hidden: boolean;
    hiddenDivider: boolean;
    eventEmitter: Emitter;
    execCommand: ExecCommand;
    setPopupInfo: SetPopupInfo;
    showTooltip: ShowTooltip;
    hideTooltip: HideTooltip;
    getBound: GetBound;
    setItemWdith?: SetItemWidth;
}
export default class ToolbarGroup extends React.Component<ToolbarGroupProps> {
    render(): React.ReactNode {
        const { group, hiddenDivider } = this.props;
        const groupStyle = group.hidden ? { display: 'none' } : null;
        const dividerStyle = hiddenDivider ? { display: 'none' } : null;

        return (
            <div className="toastui-editor-toolbar-group" style={groupStyle}>
                {group.map((item: ToolbarCustomOptions) => {
                    const Comp = item.el ? CustomToolbarItem : ToolbarButton;

                    return (
                        <Comp
                            {...this.props}
                            key={item.name}
                            item={item}
                        />
                    )
                })}
                <div className="toastui-editor-toolbar-divider" style={dividerStyle}></div>
            </div>
        );
    }
}
