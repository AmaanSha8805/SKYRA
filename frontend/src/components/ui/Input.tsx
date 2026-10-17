import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-[10px] border px-3 py-2 text-sm text-white ring-offset-background',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium',
          'placeholder:text-[rgba(255,255,255,0.25)]',
          'focus-visible:outline-none focus-visible:ring-0 focus-visible:border-[rgba(233,30,140,0.4)]',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'transition-all duration-150',
          'bg-[rgba(255,255,255,0.04)] border-[rgba(139,92,246,0.2)]',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

export { Input };
