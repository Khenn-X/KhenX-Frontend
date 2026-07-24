import { useState } from 'react';
import { Zap, Droplets, Shield, Clock, Home, SlidersHorizontal, X } from 'lucide-react';
import { cn } from '../../lib/utils';

// ─── Filter definitions ───────────────────────────────────────────────────────

const FILTERS = [
  { id: 'power',    icon: Zap,      label: 'Reliable Power'   },
  { id: 'flood',    icon: Droplets, label: 'Low Flood Risk'   },
  { id: 'security', icon: Shield,   label: 'High Security'    },
  { id: 'commute',  icon: Clock,    label: 'Short Commute'    },
  { id: 'listings', icon: Home,     label: 'Market Property'  },
] as const;

type FilterId = typeof FILTERS[number]['id'];

export interface NeighbourhoodFilters {
  activeFilters: FilterId[];
}

interface Props {
  onFilterChange?: (filters: FilterId[]) => void;
  totalAreas?: number;
  filteredCount?: number;
}

export default function NeighbourhoodPriorityFilter({
  onFilterChange,
  totalAreas,
  filteredCount,
}: Props) {
  const [active, setActive] = useState<FilterId[]>([]);

  const toggle = (id: FilterId) => {
    const next = active.includes(id)
      ? active.filter((f) => f !== id)
      : [...active, id];
    setActive(next);
    onFilterChange?.(next);
  };

  const clearAll = () => {
    setActive([]);
    onFilterChange?.([]);
  };

  return (
    <div className="rounded-2xl border border-slate-100 bg-white px-5 py-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-[#0F172A]">Neighbourhood Priority</h3>
          {totalAreas != null && (
            <span className="text-xs text-slate-400">
              {filteredCount ?? totalAreas} of {totalAreas} Lagos
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {active.length > 0 && (
            <button
              onClick={clearAll}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X className="h-3 w-3" />
              Clear
            </button>
          )}
          <button className="flex items-center gap-1.5 text-xs font-medium text-[#00C9A7] hover:underline">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            See All Filters
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map(({ id, icon: Icon, label }) => {
          const isActive = active.includes(id);
          return (
            <button
              key={id}
              onClick={() => toggle(id)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all',
                isActive
                  ? 'border-[#00C9A7] bg-[#00C9A7]/10 text-[#00C9A7]'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
              )}
            >
              <Icon className={cn('h-3 w-3', isActive ? 'text-[#00C9A7]' : 'text-slate-400')} />
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}