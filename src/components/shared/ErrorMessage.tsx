import { AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ErrorMessageProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
  compact?: boolean;
}

const ErrorMessage = ({
  message = 'Something went wrong. Please try again.',
  onRetry,
  className,
  compact = false,
}: ErrorMessageProps) => {
  if (compact) {
    return (
      <div className={cn('flex items-center gap-2 text-red-600', className)}>
        <AlertCircle className="h-4 w-4 shrink-0" />
        <p className="text-sm">{message}</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-xl border border-red-100 bg-red-50 p-8 text-center',
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
        <AlertCircle className="h-6 w-6 text-red-500" />
      </div>
      <div>
        <p className="font-medium text-red-700">Something went wrong</p>
        <p className="mt-1 text-sm text-red-500">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Try again
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
