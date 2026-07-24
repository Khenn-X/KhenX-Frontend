import { useState } from 'react';
import { Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { useSearchStore } from '../../store/search.store';
import type { ParsedListingFilters } from '../../types/search.types';
import { LISTING_TYPES, PROPERTY_TYPES, BEDROOM_OPTIONS } from '../../types/listing.types';
import { LAGOS_AREAS } from '../../constants/lagos-areas';
import { capitalize, cn } from '../../lib/utils';

/**
 * Manual filter panel — used alongside NaturalSearchBar on ListingsPage.
 * Syncs directly into the Zustand search store filters.
 */
const FilterPanel = () => {
  const { filters, setFilters } = useSearchStore();
  const [isExpanded, setIsExpanded] = useState(false);

  const update = (key: keyof ParsedListingFilters, value: unknown) => {
    setFilters({ ...filters, [key]: value || undefined });
  };

  const activeCount = Object.values(filters).filter((v) => v !== undefined && v !== '').length;

  const selectClass =
    'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-[#00C9A7] focus:outline-none focus:ring-2 focus:ring-[#00C9A7]/20';

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between px-4 py-3"
      >
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-500" />
          <span className="text-sm font-medium text-slate-700">Manual filters</span>
          {activeCount > 0 && (
            <span className="rounded-full bg-[#00C9A7] px-1.5 py-0.5 text-[10px] font-bold text-[#0A1628]">
              {activeCount}
            </span>
          )}
        </div>
        {isExpanded
          ? <ChevronUp className="h-4 w-4 text-slate-400" />
          : <ChevronDown className="h-4 w-4 text-slate-400" />
        }
      </button>

      {/* Filter fields */}
      {isExpanded && (
        <div className="border-t border-slate-100 px-4 pb-4 pt-3 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* Area */}
          <select
            value={filters.areaName || ''}
            onChange={(e) => update('areaName', e.target.value)}
            className={selectClass}
          >
            <option value="">All areas</option>
            {LAGOS_AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>

          {/* Type */}
          <select
            value={filters.listingType || ''}
            onChange={(e) => update('listingType', e.target.value)}
            className={selectClass}
          >
            <option value="">Any type</option>
            {LISTING_TYPES.map((t) => (
              <option key={t} value={t}>{t === 'short-let' ? 'Short Let' : capitalize(t)}</option>
            ))}
          </select>

          {/* Property */}
          <select
            value={filters.propertyType || ''}
            onChange={(e) => update('propertyType', e.target.value)}
            className={selectClass}
          >
            <option value="">Any property</option>
            {PROPERTY_TYPES.map((t) => (
              <option key={t} value={t}>{capitalize(t)}</option>
            ))}
          </select>

          {/* Bedrooms */}
          <select
            value={filters.bedrooms ?? ''}
            onChange={(e) => update('bedrooms', e.target.value ? Number(e.target.value) : undefined)}
            className={selectClass}
          >
            <option value="">Any bedrooms</option>
            {BEDROOM_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n === 0 ? 'Self-con' : `${n} bed`}
              </option>
            ))}
          </select>

          {/* Max price */}
          <input
            type="number"
            placeholder="Max price (₦)"
            value={filters.maxPrice || ''}
            onChange={(e) => update('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
            className={selectClass}
          />

          {/* Clear */}
          {activeCount > 0 && (
            <button
              onClick={() => setFilters({})}
              className={cn(
                'rounded-lg border border-red-200 text-sm text-red-500 hover:bg-red-50 transition-colors px-3 py-2',
                'col-span-2 md:col-span-1'
              )}
            >
              Clear filters
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterPanel;
