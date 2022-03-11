import React from 'react';
import {
    ExecCommand,
    SetPopupInfo,
    SetItemWidth,
    GetBound,
    HideTooltip,
    ShowTooltip,
    ToolbarCustomOptions
} from '@editorType/ui';
import { Emitter } from '@editorType/event';
import { getOuterWidth } from '@/utils/dom';
import { createPopupInfo } from '../../toolbarItemFactory';
import { connectHOC } from '../ButtonHoc';

interface CustomToolbarItemProps {
    disabled: boolean;
    eventEmitter: Emitter;
    item: ToolbarCustomOptions;
    active: boolean;
    execCommand: ExecCommand;
    setPopupInfo: SetPopupInfo;
    showTooltip: ShowTooltip;
    hideTooltip: HideTooltip;
    getBound: GetBound;
    setItemWidth?: SetItemWidth;
}

class CustomToolbarItemComp extends React.Component<CustomToolbarItemProps> {
    el = React.createRef<HTMLDivElement>()

    componentDidMound() {
        const { setItemWidth, item, execCommand } = this.props;

        this.el.current.appendChild(item.el!);

        if (setItemWidth) {
            setItemWidth(item.name, getOuterWidth(this.el.current));
        }

        if (item.onMounted) {
            item.onMounted(execCommand);
        }
    }

    componnetDidUpdate(prevProps) {
        const { item, active, disabled } = this.props;

        if (prevProps.active !== active || prevProps.disabled !== disabled) {
            item.onUpdated?.({ active, disabled });
        }
    }

    private showTooltip = () => {
        const { showTooltip } = this.props;

        showTooltip(this.el.current);
    }

    private showPopup = () => {
        const { getBound, item, setPopupInfo } = this.props;
        const info = createPopupInfo('customPopupBody', {
            el: this.el.current,
            pos: getBound(this.el.current),
            popup: item.popup!,
        });

        if (info) {
            setPopupInfo(info);
        }
    }

    render() {
        const { disabled, item, hideTooltip } = this.props;
        const style = { display: item.hidden ? 'none' : 'inline-block' };
        const getListener = (listener) => (disabled ? null : listener);

        return (
            <div
                ref={this.el}
                className="toastui-editor-toolbar-item-wrapper"
                style={style}
                onClick={getListener(this.showPopup)}
                onMouseOver={getListener(this.showTooltip)}
                onMouseOut={getListener(hideTooltip)}
            ></div>
        )
    }
}

export const CustomToolbarItem = connectHOC(CustomToolbarItemComp);
