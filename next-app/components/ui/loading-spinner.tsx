import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  /**
   * Optional message to display below the spinner
   */
  message?: string;
  /**
   * Size of the spinner icon
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Whether to show as a full-page overlay
   * @default true
   */
  fullPage?: boolean;
  /**
   * Additional className for the container
   */
  className?: string;
  /**
   * Additional className for the spinner icon
   */
  spinnerClassName?: string;
}

export function LoadingSpinner({
  message,
  size = 'md',
  fullPage = true,
  className,
  spinnerClassName,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  const content = (
    <div className="flex flex-col items-center gap-4">
      <Loader2
        className={cn(
          'animate-spin text-primary',
          sizeClasses[size],
          spinnerClassName
        )}
      />
      {message && (
        <p className="text-sm text-muted-foreground">{message}</p>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div
        className={cn(
          'fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm',
          className
        )}
      >
        {content}
      </div>
    );
  }

  return (
    <div className={cn('flex items-center justify-center', className)}>
      {content}
    </div>
  );
}

