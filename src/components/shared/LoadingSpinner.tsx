import { cn } from '../../lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

const sizeMap = {
  sm: 'h-4 w-4 border-2',
  md: 'h-7 w-7 border-2',
  lg: 'h-12 w-12 border-3',
};

const LoadingSpinner = ({ size = 'md', className, label }: LoadingSpinnerProps) => {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <div
        className={cn(
          'rounded-full border-slate-200 border-t-[#00C9A7] animate-spin',
          sizeMap[size]
        )}
        role="status"
        aria-label={label || 'Loading'}
      />
      {label && (
        <p className="text-sm text-slate-500">{label}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;
