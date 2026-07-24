import { useState } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import type { ParsedListingFilters } from '../../types/search.types';
import { PROPERTY_TYPES, LISTING_TYPES, BEDROOM_OPTIONS } from '../../types/listing.types';
import { LAGOS_AREAS } from '../../constants/lagos-areas';
import { cn, capitalize } from '../../lib/utils';

interface FilterContentProps {
  filters: ParsedListingFilters;
  update: (key: keyof ParsedListingFilters, value: unknown) => void;
  clear: () => void;
  inputClass: string;
  activeCount: number;
}

const FilterContent = ({ filters, update, clear, inputClass, activeCount }: FilterContentProps) => (
  <div className="space-y-5">
    {/* Area */}
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-slate-500 uppercase tracking-wide">
        Area
      </label>
      <select
        value={filters.areaName || ''}
        onChange={(e) => update('areaName', e.target.value)}
        className={inputClass}
      >
        <option value="">All areas</option>
        {LAGOS_AREAS.map((area) => (
          <option key={area} value={area}>{area}</option>
        ))}
      </select>
    </div>

    {/* Listing Type */}
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-slate-500 uppercase tracking-wide">
        Type
      </label>
      <div className="flex flex-wrap gap-2">
        {LISTING_TYPES.map((type) => (
          <button
            key={type}
            onClick={() => update('listingType', filters.listingType === type ? '' : type)}
            className={cn(
              'rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors',
              filters.listingType === type
                ? 'border-[#00C9A7] bg-[#00C9A7]/10 text-[#00C9A7]'
                : 'border-slate-200 text-slate-600 hover:border-slate-300'
            )}
          >
            {type === 'short-let' ? 'Short Let' : capitalize(type)}
          </button>
        ))}
      </div>
    </div>

    {/* Property Type */}
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-slate-500 uppercase tracking-wide">
        Property
      </label>
      <select
        value={filters.propertyType || ''}
        onChange={(e) => update('propertyType', e.target.value)}
        className={inputClass}
      >
        <option value="">Any type</option>
        {PROPERTY_TYPES.map((type) => (
          <option key={type} value={type}>{capitalize(type)}</option>
        ))}
      </select>
    </div>

    {/* Bedrooms */}
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-slate-500 uppercase tracking-wide">
        Bedrooms
      </label>
      <div className="flex flex-wrap gap-2">
        {BEDROOM_OPTIONS.map((num) => (
          <button
            key={num}
            onClick={() => update('bedrooms', filters.bedrooms === num ? undefined : num)}
            className={cn(
              'h-9 w-9 rounded-lg border text-sm font-medium transition-colors',
              filters.bedrooms === num
                ? 'border-[#00C9A7] bg-[#00C9A7]/10 text-[#00C9A7]'
                : 'border-slate-200 text-slate-600 hover:border-slate-300'
            )}
          >
            {num === 0 ? 'S/C' : num}
          </button>
        ))}
      </div>
    </div>

    {/* Price range */}
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-slate-500 uppercase tracking-wide">
        Price range (₦)
      </label>
      <div className="flex gap-2">
        <input
          type="number"
          placeholder="Min"
          value={filters.minPrice || ''}
          onChange={(e) => update('minPrice', e.target.value ? Number(e.target.value) : undefined)}
          className={inputClass}
        />
        <input
          type="number"
          placeholder="Max"
          value={filters.maxPrice || ''}
          onChange={(e) => update('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
          className={inputClass}
        />
      </div>
    </div>

    {/* Clear */}
    {activeCount > 0 && (
      <button
        onClick={clear}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
      >
        <X className="h-3.5 w-3.5" />
        Clear all filters
      </button>
    )}
  </div>
);

interface ListingFiltersProps {
  filters: ParsedListingFilters;
  onChange: (filters: ParsedListingFilters) => void;
  className?: string;
}

const ListingFilters = ({ filters, onChange, className }: ListingFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const update = (key: keyof ParsedListingFilters, value: unknown) => {
    onChange({ ...filters, [key]: value || undefined });
  };

  const clear = () => onChange({});

  const activeCount = Object.values(filters).filter(Boolean).length;

  const inputClass =
    'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-[#00C9A7] focus:outline-none focus:ring-2 focus:ring-[#00C9A7]/20';

  // FilterContent moved to top-level component to avoid creating components during render

  return (
    <>
      {/* Desktop sidebar */}
      <aside className={cn('hidden lg:block w-64 shrink-0', className)}>
        <div className="sticky top-24 rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="mb-4 font-semibold text-[#0F172A]">Filters</h3>
          <FilterContent
            filters={filters}
            update={update}
            clear={clear}
            inputClass={inputClass}
            activeCount={activeCount}
          />
        </div>
      </aside>

      {/* Mobile drawer trigger */}
      <div className="lg:hidden">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeCount > 0 && (
            <span className="rounded-full bg-[#00C9A7] px-1.5 py-0.5 text-[10px] font-bold text-[#0A1628]">
              {activeCount}
            </span>
          )}
        </button>

        {/* Mobile drawer */}
        {isOpen && (
          <div className="fixed inset-0 z-50 flex">
            <div className="absolute inset-0 bg-black/40" onClick={() => setIsOpen(false)} />
            <div className="relative ml-auto flex h-full w-80 flex-col bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <h3 className="font-semibold text-[#0F172A]">Filters</h3>
                <button onClick={() => setIsOpen(false)} className="rounded-lg p-1 hover:bg-slate-100 transition-colors">
                  <X className="h-4 w-4 text-slate-500" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-5">
                <FilterContent
                  filters={filters}
                  update={update}
                  clear={clear}
                  inputClass={inputClass}
                  activeCount={activeCount}
                />
              </div>
              <div className="border-t border-slate-100 p-4">
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full rounded-lg bg-[#0A1628] py-2.5 text-sm font-semibold text-white hover:bg-[#0A1628]/90 transition-colors"
                >
                  Show results
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ListingFilters;
