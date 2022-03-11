import React from 'react';
import { createPopupInfo } from '@/ui/toolbarItemFactory';
import { getOuterWidth } from '@/utils/dom';
import { Emitter } from '@editorType/event';
import { ExecCommand, GetBound, HideTooltip, SetItemWidth, SetPopupInfo, ShowTooltip, ToolbarButtonInfo } from '@editorType/ui';
import { connectHOC, } from '../ButtonHoc';
import './index.scss';

interface ToolbarButtonProps {
    active: boolean;
    disabled: boolean;
    eventEmitter: Emitter;
    item: ToolbarButtonInfo
    execCommand: ExecCommand;
    setPopupInfo: SetPopupInfo;
    showTooltip: ShowTooltip;
    hideTooltip: HideTooltip;
    getBound: GetBound;
    setItemWidth?: SetItemWidth;
}

const DEFAULT_WIDTH = 80;

class ToolbarButtonComp extends React.Component<ToolbarButtonProps> {
    el = React.createRef<HTMLButtonElement>();

    componentDidMount() {
        this.setItemWidth();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.item.name !== this.props.item.name) {
            this.setItemWidth();
        }
    }

    private setItemWidth() {
        const { setItemWidth, item } = this.props;

        if (typeof setItemWidth === 'function') {
            setItemWidth(
                item.name,
                getOuterWidth(this.el.current) + (item.hidden ? DEFAULT_WIDTH : 0)
            );
        }
    }

    private showTooltip = () => {
        const { showTooltip } = this.props;

        if (typeof showTooltip === 'function') {
            showTooltip(this.el.current);
        }
    }

    private execCommand = () => {
        const { item, execCommand, setPopupInfo, getBound, eventEmitter } = this.props;
        const { command, name, popup } = item;

        if (command) {
            execCommand(command);
        } else {
            const popupName = popup ? 'customPopupBody' : name;
            const [initialValues] = eventEmitter.emit('query', 'getPopupInitialValues', {
                popupName,
            });

            const info = createPopupInfo(popupName, {
                el: this.el.current,
                pos: getBound(this.el.current),
                popup,
                initialValues
            })

            if (info) {
                setPopupInfo(info);
            }
        }
    }

    render() {
        const { hideTooltip, disabled, item, active } = this.props;
        const style = { display: item.hidden ? 'none' : null, ...item.style };
        const classNames = `${item.className || ''}${active ? ' active' : ''}`;

        return (
            <button
                ref={this.el}
                style={style}
                className={classNames}
                onClick={this.execCommand}
                onMouseOver={this.showTooltip}
                onMouseOut={hideTooltip}
                disabled={!!disabled}
                aria-label={item.text || item.tooltip || ''}
            >
                {item.text || ''}
            </button>
        );
    }
}

const ToolbarButton = connectHOC(ToolbarButtonComp);

export default ToolbarButton;
