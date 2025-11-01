import * as React from 'react';

import { cn } from '@/lib/utils';

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<'textarea'>
>(({ className, onChange, ...props }, ref) => {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const combinedRef = React.useCallback(
    (node: HTMLTextAreaElement | null) => {
      textareaRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    },
    [ref]
  );

  const adjustHeight = React.useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.max(textarea.scrollHeight, 60)}px`;
    }
  }, []);

  // Adjust height on mount and when value changes externally
  React.useLayoutEffect(() => {
    adjustHeight();
  }, [adjustHeight, props.value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    adjustHeight();
    onChange?.(e);
  };

  return (
    <textarea
      className={cn(
        'flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm resize-none overflow-hidden',
        className
      )}
      ref={combinedRef}
      onChange={handleChange}
      {...props}
    />
  );
});
Textarea.displayName = 'Textarea';

export { Textarea };
