import React from 'react';
import { closest, cls } from '@/utils/dom';
import ToolbarGroup from '../ToolbarGroup';
import { ExecCommand, GetBound, HideTooltip, SetPopupInfo, ShowTooltip, ToolbarButtonInfo, ToolbarGroupInfo, ToolbarItemInfo } from '@editorType/ui';
import { Emitter } from '@editorType/event';
import { connectHOC } from '../ButtonHoc';

interface DropdownToolbarButtonCompProps {
    disabled: boolean;
    hidden: boolean;
    eventEmitter: Emitter;
    item: ToolbarButtonInfo;
    items: ToolbarGroupInfo[];
    execCommand: ExecCommand;
    setPopupInfo: SetPopupInfo;
    showTooltip: ShowTooltip;
    hideTooltip: HideTooltip;
    getBound: GetBound;
    tooltipRef: { current: HTMLElement };
}

interface DropdownToolbarButtonCompState {
    dropdownPos: { right: number; top: number } | null;
    showDropdown: boolean;
}

const POPUP_INDENT = 4;

class DropdownToolbarButtonComp extends React.Component<DropdownToolbarButtonCompProps, DropdownToolbarButtonCompState> {
    el = React.createRef<HTMLButtonElement>();

    dropdownRef = React.createRef<HTMLDivElement>();

    constructor(props) {
        super(props);
        this.state = {
            showDropdown: false,
            dropdownPos: null,
        };
    }

    componentDidMount(): void {
        document.addEventListener('click', this.handleClickDocument);
    }

    componentDidUpdate(): void {
        if (this.state.showDropdown && !this.state.dropdownPos) {
            this.setState({
                dropdownPos: this.getBound(),
            });
        }
    }

    componentWillUnmount(): void {
        document.removeEventListener('click', this.handleClickDocument);
    }

    private getBound() {
        const rect = this.props.getBound(this.el.current);

        rect.top += POPUP_INDENT;

        return {
            ...rect,
            left: null,
            right: 10,
        }
    }

    private handleClickDocument = ({ target }) => {
        if (!closest(target as HTMLElement, `.${cls('dropdown-toolbar')}`) && !closest(target as HTMLElement, '.more')) {
            this.setState({
                showDropdown: false,
                dropdownPos: null,
            });
        }
    }

    private showTooltip = () => {
        this.props.showTooltip(this.el.current);
    }

    render() {
        const { showDropdown, dropdownPos } = this.state;
        const { disabled, item, items, hideTooltip } = this.props;
        const visibleItems = items.filter((dropdownItem) => !dropdownItem.hidden);
        const groupStyle = visibleItems.length ? null : { display: 'none' };
        const dropdownStyle = showDropdown ? null : { display: 'none' };

        return (
            <div className={cls('toolbar-group')} style={groupStyle}>
                <button
                    ref={this.el}
                    type="button"
                    className={item.className}
                    onClick={() => this.setState({ showDropdown: true })}
                    onMouseOver={this.showTooltip}
                    onMouseOut={hideTooltip}
                    disabled={disabled}
                ></button>
                <div
                    className={cls('dropdown-toolbar')}
                    style={{ ...dropdownStyle, ...dropdownPos }}
                    ref={this.dropdownRef}
                >
                    {visibleItems.length ? visibleItems.map((group, index) => (
                        <ToolbarGroup
                            group={group}
                            hiddenDivider={index === visibleItems.length - 1 || (visibleItems as ToolbarGroupInfo[])[index + 1]?.hidden}
                            {...this.props}
                        />
                    )) : null}
                </div>
            </div>
        );
    }
}

export const DropdownToolbarButton = connectHOC(DropdownToolbarButtonComp);
