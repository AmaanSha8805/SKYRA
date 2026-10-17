import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'error';
}

export function ProgressBar({
  value,
  max = 100,
  label,
  className,
  size = 'md',
  variant = 'default',
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);

  const sizeClasses = {
    sm: 'h-1',
    md: 'h-[5px]',
    lg: 'h-3',
  };

  const getVariant = (): 'success' | 'warning' | 'error' | 'default' => {
    if (variant !== 'default') return variant;
    if (value >= 80) return 'success';
    if (value >= 60) return 'warning';
    return 'error';
  };

  const currentVariant = getVariant();

  const variantStyles = {
    default: 'linear-gradient(90deg, #E91E8C, #8b5cf6)',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#E91E8C',
  };

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">{label}</span>
          <span className="text-sm text-white/60">{Math.round(percentage)}%</span>
        </div>
      )}
      <div
        className={cn(
          'w-full rounded-[4px] overflow-hidden',
          sizeClasses[size]
        )}
        style={{
          background: 'rgba(255,255,255,0.06)'
        }}
      >
        <div
          className="h-full transition-all duration-500 ease-out"
          style={{ 
            width: `${percentage}%`,
            background: variantStyles[currentVariant]
          }}
        />
      </div>
    </div>
  );
}
