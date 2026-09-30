import { cn } from '../../lib/utils';

interface TopProgressBarProps {
  active: boolean;
}

const TopProgressBar = ({ active }: TopProgressBarProps) => {
  return (
    <div
      className={cn(
        'pointer-events-none absolute left-0 right-0 top-0 z-80 h-0.5 w-full overflow-hidden bg-slate-200/80 transition-opacity duration-200',
        active ? 'opacity-100' : 'opacity-0',
      )}
      aria-hidden="true"
    >
      <style>{`
        @keyframes kx-progress-shimmer {
          0% { transform: translateX(-120%); }
          100% { transform: translateX(180%); }
        }
      `}</style>
      <div
        className="h-full rounded-full bg-[#00C9A7] shadow-[0_0_18px_rgba(0,201,167,0.45)]"
        style={{
          width: '32%',
          animation: active ? 'kx-progress-shimmer 1.1s ease-in-out infinite' : 'none',
        }}
      />
    </div>
  );
};

export default TopProgressBar;
