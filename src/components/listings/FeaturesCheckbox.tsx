import { Zap, Droplets, Shield, Car, Dumbbell, Waves, Camera, Wifi } from 'lucide-react';
import type { IListingFeatures } from '../../types/listing.types';
import { cn } from '../../lib/utils';

const FEATURE_CONFIG = [
  { key: 'generator',  label: 'Generator',  icon: Zap },
  { key: 'borehole',   label: 'Borehole',   icon: Droplets },
  { key: 'security',   label: 'Security',   icon: Shield },
  { key: 'parking',    label: 'Parking',    icon: Car },
  { key: 'gym',        label: 'Gym',        icon: Dumbbell },
  { key: 'pool',       label: 'Pool',       icon: Waves },
  { key: 'cctv',       label: 'CCTV',       icon: Camera },
  { key: 'internet',   label: 'Internet',   icon: Wifi },
] as const;

// ─── Form version (checkboxes for listing creation/edit) ─────────────────────
interface FeaturesCheckboxProps {
  value: IListingFeatures;
  onChange: (features: IListingFeatures) => void;
  className?: string;
}

export const FeaturesCheckbox = ({ value, onChange, className }: FeaturesCheckboxProps) => {
  const toggle = (key: keyof IListingFeatures) => {
    onChange({ ...value, [key]: !value[key] });
  };

  return (
    <div className={cn('grid grid-cols-2 sm:grid-cols-4 gap-2', className)}>
      {FEATURE_CONFIG.map(({ key, label, icon: Icon }) => {
        const isActive = value[key as keyof IListingFeatures];
        return (
          <button
            key={key}
            type="button"
            onClick={() => toggle(key as keyof IListingFeatures)}
            className={cn(
              'flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors',
              isActive
                ? 'border-[#00C9A7] bg-[#00C9A7]/10 text-[#00C9A7]'
                : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700'
            )}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" />
            {label}
          </button>
        );
      })}
    </div>
  );
};

// ─── Display version (read-only for listing detail) ──────────────────────────
interface FeaturesDisplayProps {
  features: IListingFeatures;
  className?: string;
}

export const FeaturesDisplay = ({ features, className }: FeaturesDisplayProps) => {
  const active = FEATURE_CONFIG.filter(({ key }) => features[key as keyof IListingFeatures]);

  if (active.length === 0) return null;

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {active.map(({ key, label, icon: Icon }) => (
        <span
          key={key}
          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-sm text-slate-700"
        >
          <Icon className="h-3.5 w-3.5 text-[#00C9A7]" />
          {label}
        </span>
      ))}
    </div>
  );
};

export default FeaturesCheckbox;
