import { SegmentedControl } from '@/components/ui/segmented-control';
import { Logo } from '@/components/NBA/Logo';
import clsx from 'clsx';

export function TeamPicker({
  name,
  home_code,
  away_code,
  logoClass,
  defaultValue,
  className,
  disabled,
}: {
  /** input field name */
  name: string;
  home_code: string;
  away_code: string;
  logoClass?: string;
  defaultValue?: string;
  className?: string;
  disabled?: boolean;
}) {
  const options = [
    {
      name: away_code,
      content: <Logo className={logoClass} tricode={away_code} />,
    },

    {
      name: 'indeterminate',
      content: (
        <h1
          className={clsx(
            logoClass,
            'flex justify-center items-center text-center text-lg font-extrabold'
          )}
        >
          VS
        </h1>
      ),
    },
    {
      name: home_code,
      content: <Logo className={logoClass} tricode={home_code} />,
    },
  ];

  return (
    <SegmentedControl
      className={className}
      options={options}
      defaultValue={defaultValue || 'indeterminate'}
      name={name || 'win_prediction'}
      disabled={disabled}
    />
  );
}
