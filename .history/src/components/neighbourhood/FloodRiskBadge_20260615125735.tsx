import { Droplets, AlertTriangle, CheckCircle } from 'lucide-react';
import type { FloodRisk } from '../../types/neighbourhood.types';
import { cn } from '../../lib/utils';

interface FloodRiskBadgeProps {
  risk?: FloodRisk | null;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const riskConfig: Record<FloodRisk, {
  label: string;
  description: string;
  className: string;
  icon: React.ElementType;
}> = {
  low: {
    label: 'Low flood risk',
    description: 'Area rarely experiences flooding.',
    className: 'bg-[#00C9A7]/10 text-[#00C9A7] border-[#00C9A7]/20',
    icon: CheckCircle,
  },
  medium: {
    label: 'Moderate flood risk',
    description: 'Area occasionally floods during heavy rain.',
    className: 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20',
    icon: AlertTriangle,
  },
  high: {
    label: 'High flood risk',
    description: 'Area frequently floods. Verify before committing.',
    className: 'bg-[#DC2626]/10 text-[#DC2626] border-[#DC2626]/20',
    icon: Droplets,
  },
};

const sizeMap = {
  sm: { badge: 'px-2 py-1 text-xs gap-1', icon: 'h-3 w-3' },
  md: { badge: 'px-3 py-1.5 text-sm gap-1.5', icon: 'h-4 w-4' },
  lg: { badge: 'px-4 py-2 text-sm gap-2', icon: 'h-4 w-4' },
};

const FloodRiskBadge = ({ risk, size = 'md', showLabel = true, className }: FloodRiskBadgeProps) => {
  if (!risk) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full border bg-slate-100 text-slate-400 border-slate-200',
          sizeMap[size].badge,
          className
        )}
      >
        <Droplets className={sizeMap[size].icon} />
        {showLabel && 'Flood data unavailable'}
      </span>
    );
  }

  const config = riskConfig[risk];
  const Icon = config.icon;

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <span
        className={cn(
          'inline-flex items-center rounded-full border font-medium',
          config.className,
          sizeMap[size].badge
        )}
      >
        <Icon className={sizeMap[size].icon} />
        {showLabel && config.label}
      </span>
      {size === 'lg' && (
        <p className="text-xs text-slate-500 pl-1">{config.description}</p>
      )}
    </div>
  );
};

export default FloodRiskBadge;
