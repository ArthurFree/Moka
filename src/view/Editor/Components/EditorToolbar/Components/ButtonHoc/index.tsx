import React from 'react';
import { closest, getTotalOffset } from '@/utils/dom';
import { Emitter } from '@editorType/event';
import { ExecCommand, SetItemWidth, SetPopupInfo, ToolbarButtonInfo, ToolbarItemInfo, ToolbarStateMap } from '@editorType/ui';
import css from 'tui-code-snippet/domUtil/css';

export interface ButtonHOCProps {
    tooltipRef: { current: HTMLElement }
    disabled: boolean;
    eventEmitter: Emitter;
    item: ToolbarItemInfo;
    execCommand: ExecCommand;
    setPopupInfo: SetPopupInfo;
    setItemWidth?: SetItemWidth;
}

export interface ButtonHOCState {
    active: boolean;
    disabled: boolean;
}

interface Payload {
    toolbarState: ToolbarStateMap;
}

const TOOLTIP_INDENT = 6;

export function connectHOC(WrappedComponent) {
    return class ButtonHOC extends React.Component<ButtonHOCProps, ButtonHOCState> {
        constructor(props: ButtonHOCProps) {
            super(props);
            this.state = {
                active: false,
                disabled: props.disabled,
            };
            this.addEvent();
        }

        addEvent() {
            const { item, eventEmitter } = this.props;

            if (item.state) {
                eventEmitter.listen('changeToolbarState', ({ toolbarState }: Payload) => {
                    const { active, disabled } = toolbarState[item.state!] ?? {};

                    this.setState({
                        active: !!active,
                        disabled: disabled ?? this.props.disabled,
                    })
                });
            }
        }

        getBound(el: HTMLElement) {
            const { offsetLeft, offsetTop} = getTotalOffset(el, closest(el, 'toastui-editor-toolbar') as HTMLElement)

            return { left: offsetLeft, top: el.offsetHeight + offsetTop };
        }

        showTooltip = (el: HTMLElement) => {
            const { item, disabled, tooltipRef } = this.props;
            const { tooltip } = item as ToolbarButtonInfo;

            if (!disabled && tooltip) {
                const bound = this.getBound(el);
                const left = `${bound.left + TOOLTIP_INDENT}px`;
                const top = `${bound.top + TOOLTIP_INDENT}px`;

                css(tooltipRef.current, { display: 'block', left, top, });
                tooltipRef.current.querySelector<HTMLElement>('.text')!.textContent = tooltip;
            }
        }

        hideTooltip = () => {
            const { tooltipRef } = this.props;
            css(tooltipRef.current, 'display', 'none');
        }

        render() {
            const { active, disabled } = this.state;
            return (
                <WrappedComponent
                    {...this.props}
                    active={active}
                    disabled={disabled}
                    showTooltip={this.showTooltip}
                    hideTooltip={this.hideTooltip}
                    getBound={this.getBound}
                />
            )
        }
    };
}
