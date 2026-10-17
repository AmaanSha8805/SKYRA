import { cn } from '@/lib/utils';

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export function LoadingState({ message = 'Loading...', className }: LoadingStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12', className)}>
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-skyra-pink border-t-transparent" />
      {message && (
        <p className="mt-4 text-sm text-white/60">{message}</p>
      )}
    </div>
  );
}
