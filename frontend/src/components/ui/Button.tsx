import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'gradient' | 'glass';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        className={cn(
          'inline-flex items-center justify-center text-sm font-medium',
          'ring-offset-background transition-all duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E91E8C] focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          'button-press',
          {
            'bg-[linear-gradient(135deg,#E91E8C,#8b5cf6)] text-white shadow-lg hover:shadow-xl button-hover': variant === 'default' || variant === 'gradient',
            'bg-red-500 text-white hover:bg-red-500/90 shadow-lg': variant === 'destructive',
            'border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] text-[rgba(255,255,255,0.7)] hover:text-white': variant === 'outline',
            'bg-[rgba(255,255,255,0.05)] text-white hover:bg-[rgba(255,255,255,0.1)]': variant === 'secondary',
            'hover:bg-[rgba(255,255,255,0.05)] hover:text-white': variant === 'ghost',
            'text-[#E91E8C] underline-offset-4 hover:underline': variant === 'link',
            'glass text-white hover:bg-white/5 border-white/10': variant === 'glass',
          },
          {
            'h-10 px-4 py-2 rounded-[10px]': size === 'default',
            'h-9 rounded-lg px-3': size === 'sm',
            'h-12 px-8 rounded-[10px]': size === 'lg',
            'h-10 w-10 rounded-lg': size === 'icon',
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export { Button };
