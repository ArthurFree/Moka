import React, { useState, useEffect } from 'react';
import classNames from 'classnames';
import './index.scss';

interface SwitchProps {
    className?: string;
    disabled?: boolean;
    checked?: boolean;
    defaultChecked?: boolean;
    checkedChildren?: React.ReactNode;
    unCheckedChildren?: React.ReactNode;
    onChange?: SwitchChangeEventHandler;
    onClick?: SwitchClickEventHandler;
    style?: React.CSSProperties;
};

export type SwitchChangeEventHandler = (
    checked: boolean,
    event: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLButtonElement>,
  ) => void;
export type SwitchClickEventHandler = SwitchChangeEventHandler;

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
    (
        {
            className,
            defaultChecked,
            checked,
            disabled,
            checkedChildren,
            unCheckedChildren,
            onClick,
            onChange,
        },
        ref
    ) => {
        const [innerChecked, setInnerChecked] = useState(defaultChecked);

        useEffect(() => {
            setInnerChecked(checked);
        }, [checked]);

        function triggerChange(
            newChecked: boolean,
            event: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLButtonElement>,
          ) {
            let mergedChecked = innerChecked;

            if (!disabled) {
                mergedChecked = newChecked;
                setInnerChecked(mergedChecked);
                onChange?.(mergedChecked, event);
            }

            return mergedChecked;
        }

        function onInternalClick(e: React.MouseEvent<HTMLButtonElement>) {
            const ret = triggerChange(!innerChecked, e);
            onClick?.(ret, e);
        }

        const switchClassName = classNames('switch-wrap', className, {
            'switch-checked': innerChecked,
            'switch-disabled': disabled,
        });

        return (
            <button
                type="button"
                role="switch"
                aria-checked={innerChecked}
                disabled={disabled}
                className={switchClassName}
                ref={ref}
                onClick={onInternalClick}
            >
                <span className="switch-inner">
                    {innerChecked ? checkedChildren : unCheckedChildren}
                </span>
            </button>
        );
    }
);

export default Switch;
