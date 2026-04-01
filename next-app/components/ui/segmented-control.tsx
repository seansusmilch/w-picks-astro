'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface SegmentedControlProps {
  options: {
    name: string;
    content: string | React.ReactNode;
    disabled?: boolean;
  }[];
  defaultValue?: string;
  onChange?: (value: string) => void;
  className?: string;
  activeClass?: string;
  name?: string;
  disabled?: boolean;
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({
  options,
  defaultValue,
  onChange,
  className,
  name,
  disabled,
}) => {
  const [selectedOption, setSelectedOption] = useState<string>(
    defaultValue || options[0]?.name || ''
  );

  const handleOptionChange = (optionName: string) => {
    if (disabled) return;
    setSelectedOption(optionName);
    onChange?.(optionName);
  };

  return (
    <div
      className={cn(
        'inline-flex flex-row items-center justify-center rounded-xl bg-muted p-2 text-muted-foreground',
        { 'opacity-70': disabled },
        className
      )}
    >
      <input type='hidden' name={name || ''} value={selectedOption} />
      {options.map((option) => (
        <button
          type='button'
          disabled={option.disabled || disabled}
          key={option.name}
          onClick={() => handleOptionChange(option.name)}
          className={cn(
            'inline-flex items-center justify-center whitespace-nowrap rounded-xl px-2 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
            {
              'bg-background text-foreground shadow-sm':
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

