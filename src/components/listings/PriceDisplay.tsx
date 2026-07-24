import type { PricePeriod } from '../../types/listing.types';
import { formatNaira } from '../../lib/utils';
import { cn } from '../../lib/utils';

interface PriceDisplayProps {
  price: number;
  pricePeriod: PricePeriod;
  serviceCharge?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const periodLabel: Record<PricePeriod, string> = {
  yearly: '/yr',
  monthly: '/mo',
  nightly: '/night',
};

const sizeMap = {
  sm: { price: 'text-base font-bold', period: 'text-xs', charge: 'text-xs' },
  md: { price: 'text-xl font-bold', period: 'text-sm', charge: 'text-xs' },
  lg: { price: 'text-3xl font-bold', period: 'text-base', charge: 'text-sm' },
};

const PriceDisplay = ({
  price,
  pricePeriod,
  serviceCharge,
  size = 'md',
  className,
}: PriceDisplayProps) => {
  const styles = sizeMap[size];

  return (
    <div className={cn('flex flex-col', className)}>
      <div className="flex items-baseline gap-1">
        <span className={cn('text-[#0A1628]', styles.price)}>
          {formatNaira(price)}
        </span>
        <span className={cn('text-slate-500', styles.period)}>
          {periodLabel[pricePeriod]}
        </span>
      </div>
      {serviceCharge && (
        <span className={cn('text-slate-400 mt-0.5', styles.charge)}>
          + {formatNaira(serviceCharge)} service charge
        </span>
      )}
    </div>
  );
};

export default PriceDisplay;
