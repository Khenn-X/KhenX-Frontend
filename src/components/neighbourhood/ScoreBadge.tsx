import { cn } from '../../lib/utils';

interface ScoreBadgeProps {
  score?: number | null;
  label: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const getScoreColor = (score: number) => {
  if (score >= 7.5) return { ring: 'stroke-[#00C9A7]', text: 'text-[#00C9A7]', bg: 'bg-[#00C9A7]/10' };
  if (score >= 5)   return { ring: 'stroke-[#F59E0B]', text: 'text-[#F59E0B]', bg: 'bg-[#F59E0B]/10' };
  return              { ring: 'stroke-[#DC2626]',  text: 'text-[#DC2626]',  bg: 'bg-[#DC2626]/10'  };
};

const sizeMap = {
  sm: { wrap: 'w-14 h-14', r: 20, stroke: 3,  fontSize: 'text-xs',  label: 'text-[10px]' },
  md: { wrap: 'w-20 h-20', r: 28, stroke: 4,  fontSize: 'text-sm',  label: 'text-xs'     },
  lg: { wrap: 'w-28 h-28', r: 40, stroke: 5,  fontSize: 'text-xl',  label: 'text-sm'     },
};

const ScoreBadge = ({ score, label, size = 'md', className }: ScoreBadgeProps) => {
  const { wrap, r, stroke, fontSize, label: labelSize } = sizeMap[size];

  if (score === undefined || score === null) {
    return (
      <div className={cn('flex flex-col items-center gap-1.5', className)}>
        <div className={cn('rounded-full bg-slate-100 flex items-center justify-center', wrap)}>
          <span className={cn('font-bold text-slate-400', fontSize)}>—</span>
        </div>
        <span className={cn('text-center text-slate-500 font-medium', labelSize)}>{label}</span>
      </div>
    );
  }

  const colors = getScoreColor(score);
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (score / 10) * circumference;
  const viewSize = (r + stroke + 2) * 2;

  return (
    <div className={cn('flex flex-col items-center gap-1.5', className)}>
      <div className={cn('relative flex items-center justify-center', wrap)}>
        <svg
          width={viewSize}
          height={viewSize}
          viewBox={`0 0 ${viewSize} ${viewSize}`}
          className="absolute inset-0 -rotate-90"
        >
          {/* Track */}
          <circle
            cx={viewSize / 2}
            cy={viewSize / 2}
            r={r}
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke}
            className="text-slate-200"
          />
          {/* Progress */}
          <circle
            cx={viewSize / 2}
            cy={viewSize / 2}
            r={r}
            fill="none"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={colors.ring}
          />
        </svg>
        <span className={cn('relative font-bold z-10', fontSize, colors.text)}>
          {score.toFixed(1)}
        </span>
      </div>
      <span className={cn('text-center text-slate-600 font-medium', labelSize)}>{label}</span>
    </div>
  );
};

export default ScoreBadge;
