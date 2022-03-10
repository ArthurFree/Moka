import i18n from '@/i18n/i18n';
import { cls } from '@/utils/dom';
import { TabInfo } from '@editorType/ui';
import React from 'react';

interface TabsProps {
    tabs: TabInfo[];
    activeTab: string;
    onClick: (ev: MouseEvent, activeTab: string) => void
}

export class Tabs extends React.Component<TabsProps> {
    private toggleTab(ev, activeTab: string) {
        const { onClick } = this.props;

        if (typeof onClick === 'function') {
            onClick(ev, activeTab);
        }
    }
    render() {
        const { tabs, activeTab } = this.props;
        return (
            <div className={cls('tabs')} aria-role="tabpanel">
                {tabs.map(({ name, text }) => {
                    const isActive = activeTab === name;

                    return (
                        <div
                            className={`tab-item${isActive ? ' active' : ''}`}
                            onClick={ev => this.toggleTab(ev, name)}
                            aria-role="tab"
                            aria-label={i18n.get(text)}
                            aria-selected={isActive ? 'true' : 'false'}
                            // TODO:
                            // 将字符串类型修改为了数字类型，需要观察是否会出现报错
                            // 原写法：
                            // tabindex={isActive ? '0' : '-1'}
                            tabIndex={isActive ? 0 : -1}
                        >
                            {i18n.get(text)}
                        </div>
                    );
                })}
            </div>
        )
    }
}
