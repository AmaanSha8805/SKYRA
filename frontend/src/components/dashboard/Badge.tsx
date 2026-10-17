import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'error';
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-[20px] border px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 focus:outline-none',
          {
            'bg-[rgba(139,92,246,0.15)] text-[#a78bfa] border-[rgba(139,92,246,0.3)] hover:bg-[rgba(139,92,246,0.25)]':
              variant === 'default',
            'glass text-white/80 hover:text-white':
              variant === 'secondary',
            'bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30':
              variant === 'destructive',
            'bg-[rgba(139,92,246,0.15)] text-[#a78bfa] border-[rgba(139,92,246,0.3)]':
              variant === 'outline',
            'bg-[rgba(16,185,129,0.15)] text-[#10b981] border-[rgba(16,185,129,0.3)] hover:bg-[rgba(16,185,129,0.25)]':
              variant === 'success',
            'bg-[rgba(245,158,11,0.15)] text-[#f59e0b] border-[rgba(245,158,11,0.3)] hover:bg-[rgba(245,158,11,0.25)]':
              variant === 'warning',
            'bg-[rgba(233,30,140,0.15)] text-[#E91E8C] border-[rgba(233,30,140,0.3)] hover:bg-[rgba(233,30,140,0.25)]':
              variant === 'error',
          },
          className
        )}
        {...props}
      />
    );
  }
);

Badge.displayName = 'Badge';

export { Badge };
