/**
 * Goal is to have segmented control with 3 options
 * Data gets picked up by the form
 * Can have a react component in the content
 * Can have a default value
 * Passes through classes and styles
 */

import React, { useState } from 'react';
import clsx from 'clsx';

interface SegmentedControlProps {
  //   options: string[];
  options: {
    name: string;
    content: string | React.ReactNode | any;
    disabled?: boolean;
  }[];
  defaultValue?: string;
  onChange?: (value: string) => void;
  className?: React.HTMLProps<HTMLElement>['className'];
  activeClass?: string;
  name?: string;
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({
  options,
  defaultValue,
  onChange,
  className,
  name,
}) => {
  const [selectedOption, setSelectedOption] = useState<string>(
    defaultValue || options[0].name
  );

  const handleOptionChange = (optionName: string) => {
    setSelectedOption(optionName);
    onChange?.(optionName);
  };

  return (
    <div
      className={clsx(
        'inline-flex flex-row items-center justify-center rounded-xl bg-muted p-2 text-muted-foreground',
        className
      )}
    >
      <input type='hidden' name={name || ''} value={selectedOption} />
      {options.map((option) => (
        <button
          type='button'
          disabled={option.disabled}
          key={option.name}
          onClick={() => handleOptionChange(option.name)}
          className={clsx(
            // 'border-2',

            'inline-flex items-center justify-center whitespace-nowrap rounded-xl px-2 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
            {
              'bg-background text-foreground shadow':
                selectedOption === option.name,
            }
          )}
        >
          {option.content}
        </button>
      ))}
    </div>
  );
};
