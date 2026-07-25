import { useState, useEffect } from 'react';
import { SlidersHorizontal, X, Search, ChevronDown } from 'lucide-react';
import type { ParsedListingFilters } from '../../types/search.types';
import { PROPERTY_TYPES, LISTING_TYPES } from '../../types/listing.types';
import type { IListingFeatures } from '../../types/listing.types';
import { LAGOS_AREAS } from '../../constants/lagos-areas';
import { cn } from '../../lib/utils';

// ── NOTE: these fields don't exist on ParsedListingFilters yet.
// Add them there (all optional) for this component's onChange to type-check cleanly:
//   areaNames?: string[];
//   minPowerScore?: number;
//   minSecurityScore?: number;
//   maxFloodRisk?: 'low' | 'medium' | 'high';
//   features?: Partial<IListingFeatures>;
export interface ExtendedListingFilters extends Omit<ParsedListingFilters, 'features'> {
  areaNames?: string[];
  minPowerScore?: number;
  minSecurityScore?: number;
  maxFloodRisk?: 'low' | 'medium' | 'high';
  features?: Partial<IListingFeatures>;
}

const BEDROOM_DISPLAY = [
  { value: 0, label: 'Studio' },
  { value: 1, label: '1' },
  { value: 2, label: '2' },
  { value: 3, label: '3' },
  { value: 4, label: '4' },
  { value: 5, label: '5+' },
];

const PROPERTY_LABELS: Record<string, string> = {
  apartment: 'Apartment/Flat',
  duplex: 'Duplex',
  bungalow: 'Bungalow',
  'self-con': 'Self-Con',
  'mini-flat': 'Mini Flat',
  terrace: 'Terrace',
  detached: 'Detached',
};

const FEATURE_OPTIONS: { key: keyof IListingFeatures; label: string }[] = [
  { key: 'generator', label: 'Generator' },
  { key: 'borehole', label: 'Borehole' },
  { key: 'security', label: 'Estate Security' },
  { key: 'parking', label: 'Parking' },
  { key: 'pool', label: 'Swimming Pool' },
  { key: 'cctv', label: 'CCTV' },
];

interface FilterContentProps {
  draft: ExtendedListingFilters;
  setDraft: React.Dispatch<React.SetStateAction<ExtendedListingFilters>>;
  onApply: () => void;
  onReset: () => void;
  activeCount: number;
}

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="mb-3 text-xs font-bold text-slate-500 uppercase tracking-wide">{children}</p>
);

const FilterContent = ({ draft, setDraft, onApply, onReset, activeCount }: FilterContentProps) => {
  const [areaSearch, setAreaSearch] = useState('');

  const visibleAreas = LAGOS_AREAS.filter((a) =>
    a.toLowerCase().includes(areaSearch.toLowerCase())
  ).slice(0, 8);

  const toggleArea = (area: string) => {
    setDraft((d) => {
      const current = d.areaNames ?? [];
      const next = current.includes(area)
        ? current.filter((a) => a !== area)
        : [...current, area];
      return { ...d, areaNames: next.length ? next : undefined };
    });
  };

  const toggleFeature = (key: keyof IListingFeatures) => {
    setDraft((d) => ({
      ...d,
      features: { ...d.features, [key]: !d.features?.[key] || undefined },
    }));
  };

  const inputClass =
    'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-[#00C9A7] focus:outline-none focus:ring-2 focus:ring-[#00C9A7]/20';

  return (
    <div className="space-y-7">
      {/* Area / Neighbourhood */}
      <div>
        <SectionLabel>Area / Neighbourhood</SectionLabel>
        <div className="relative mb-3">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            value={areaSearch}
            onChange={(e) => setAreaSearch(e.target.value)}
            placeholder="Search area..."
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-8 pr-3 text-sm focus:border-[#00C9A7] focus:outline-none focus:ring-2 focus:ring-[#00C9A7]/20"
          />
        </div>
        <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
          {visibleAreas.map((area) => (
            <label key={area} className="flex items-center justify-between cursor-pointer group">
              <span className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={(draft.areaNames ?? []).includes(area)}
                  onChange={() => toggleArea(area)}
                  className="h-4 w-4 rounded border-slate-300 text-[#00C9A7] focus:ring-[#00C9A7]"
                />
                <span className="text-sm text-slate-600 group-hover:text-[#0F172A]">{area}</span>
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Listing Type */}
      <div>
        <SectionLabel>Listing Type</SectionLabel>
        <div className="grid grid-cols-3 gap-2">
          {LISTING_TYPES.map((type) => (
            <button
              key={type}
              onClick={() =>
                setDraft((d) => ({ ...d, listingType: d.listingType === type ? undefined : type }))
              }
              className={cn(
                'rounded-lg px-2 py-2 text-xs font-semibold transition-colors',
                draft.listingType === type
                  ? 'bg-[#0A1628] text-white'
                  : 'border border-slate-200 text-slate-600 hover:border-slate-300'
              )}
            >
              {type === 'rent' ? 'For Rent' : type === 'sale' ? 'For Sale' : 'Short Let'}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <SectionLabel>Price Range (₦ / Year)</SectionLabel>
        <div className="flex gap-2 mb-3">
          <input
            type="number"
            placeholder="Min"
            value={draft.minPrice ?? ''}
            onChange={(e) =>
              setDraft((d) => ({ ...d, minPrice: e.target.value ? Number(e.target.value) : undefined }))
            }
            className={inputClass}
          />
          <input
            type="number"
            placeholder="Max"
            value={draft.maxPrice ?? ''}
            onChange={(e) =>
              setDraft((d) => ({ ...d, maxPrice: e.target.value ? Number(e.target.value) : undefined }))
            }
            className={inputClass}
          />
        </div>
        <input
          type="range"
          min={0}
          max={10000000}
          step={50000}
          value={draft.maxPrice ?? 10000000}
          onChange={(e) => setDraft((d) => ({ ...d, maxPrice: Number(e.target.value) }))}
          className="w-full accent-[#00C9A7]"
        />
      </div>

      {/* Bedrooms */}
      <div>
        <SectionLabel>Bedrooms</SectionLabel>
        <div className="grid grid-cols-3 gap-2">
          {BEDROOM_DISPLAY.map(({ value, label }) => (
            <button
              key={value}
              onClick={() =>
                setDraft((d) => ({ ...d, bedrooms: d.bedrooms === value ? undefined : value }))
              }
              className={cn(
                'h-9 rounded-lg border text-sm font-medium transition-colors',
                draft.bedrooms === value
                  ? 'border-[#0A1628] bg-[#0A1628] text-white'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Property Type */}
      <div>
        <SectionLabel>Property Type</SectionLabel>
        <div className="grid grid-cols-2 gap-2">
          {PROPERTY_TYPES.map((type) => (
            <button
              key={type}
              onClick={() =>
                setDraft((d) => ({ ...d, propertyType: d.propertyType === type ? undefined : type }))
              }
              className={cn(
                'rounded-lg border px-3 py-2 text-xs font-semibold transition-colors text-left',
                draft.propertyType === type
                  ? 'border-[#00C9A7] bg-[#00C9A7]/10 text-[#00C9A7]'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300'
              )}
            >
              {PROPERTY_LABELS[type] ?? type}
            </button>
          ))}
        </div>
      </div>

      {/* Intel Scores */}
      <div>
        <SectionLabel>Intel Scores (Min)</SectionLabel>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm text-slate-600">Power Supply</span>
            <span className="text-sm font-semibold text-[#00C9A7]">
              {draft.minPowerScore ? `${draft.minPowerScore}+` : 'Any'}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={10}
            step={0.5}
            value={draft.minPowerScore ?? 0}
            onChange={(e) =>
              setDraft((d) => ({
                ...d,
                minPowerScore: Number(e.target.value) || undefined,
              }))
            }
            className="w-full accent-[#00C9A7]"
          />
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm text-slate-600">Security Score</span>
            <span className="text-sm font-semibold text-[#00C9A7]">
              {draft.minSecurityScore ? `${draft.minSecurityScore}+` : 'Any'}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={10}
            step={0.5}
            value={draft.minSecurityScore ?? 0}
            onChange={(e) =>
              setDraft((d) => ({
                ...d,
                minSecurityScore: Number(e.target.value) || undefined,
              }))
            }
            className="w-full accent-[#00C9A7]"
          />
        </div>

        <div>
          <span className="text-sm text-slate-600 block mb-1.5">Flood Risk</span>
          <div className="relative">
            <select
              value={draft.maxFloodRisk ?? ''}
              onChange={(e) =>
                setDraft((d) => ({
                  ...d,
                  maxFloodRisk: (e.target.value || undefined) as ExtendedListingFilters['maxFloodRisk'],
                }))
              }
              className={cn(inputClass, 'appearance-none pr-8')}
            >
              <option value="">Any</option>
              <option value="low">Low only</option>
              <option value="medium">Medium or below</option>
              <option value="high">High or below</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          </div>
        </div>
      </div>

      {/* Features */}
      <div>
        <SectionLabel>Features</SectionLabel>
        <div className="grid grid-cols-2 gap-y-3 gap-x-2">
          {FEATURE_OPTIONS.map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={!!draft.features?.[key]}
                onChange={() => toggleFeature(key)}
                className="h-4 w-4 rounded border-slate-300 text-[#00C9A7] focus:ring-[#00C9A7]"
              />
              <span className="text-sm text-slate-600">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {activeCount > 0 && (
        <button
          onClick={onReset}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
        >
          <X className="h-3.5 w-3.5" />
          Clear all filters
        </button>
      )}

      <button
        onClick={onApply}
        className="w-full rounded-lg bg-[#00C9A7] py-3 text-sm font-bold text-[#0A1628] hover:bg-[#00b396] transition-colors"
      >
        Apply Filters
      </button>
    </div>
  );
};

interface ListingFiltersProps {
  filters: ExtendedListingFilters;
  onChange: (filters: ExtendedListingFilters) => void;
  className?: string;
}

const ListingFilters = ({ filters, onChange, className }: ListingFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState<ExtendedListingFilters>(filters);

  // Keep draft in sync if filters are cleared/changed externally
  useEffect(() => {
    setDraft(filters);
  }, [filters]);

  const activeCount = Object.values(draft).filter((v) =>
    Array.isArray(v) ? v.length > 0 : typeof v === 'object' && v !== null ? Object.values(v).some(Boolean) : Boolean(v)
  ).length;

  const handleApply = () => {
    onChange(draft);
    setIsOpen(false);
  };

  const handleReset = () => {
    setDraft({});
    onChange({});
  };

  return (
    <>
      {/* Desktop sidebar */}
      <aside className={cn('hidden lg:block w-72 shrink-0', className)}>
        <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white overflow-hidden">
          <div className="flex items-center justify-between bg-[#0A1628] px-5 py-3.5">
            <span className="flex items-center gap-2 text-sm font-semibold text-white">
              <SlidersHorizontal className="h-4 w-4 text-[#00C9A7]" />
              Filter Properties
            </span>
            {activeCount > 0 && (
              <button onClick={handleReset} className="text-xs text-[#00C9A7] hover:underline">
                Reset all
              </button>
            )}
          </div>
          <div className="p-5">
            <FilterContent
              draft={draft}
              setDraft={setDraft}
              onApply={handleApply}
              onReset={handleReset}
              activeCount={activeCount}
            />
          </div>
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

        {isOpen && (
          <div className="fixed inset-0 z-50 flex">
            <div className="absolute inset-0 bg-black/40" onClick={() => setIsOpen(false)} />
            <div className="relative ml-auto flex h-full w-80 flex-col bg-white shadow-xl">
              <div className="flex items-center justify-between bg-[#0A1628] px-5 py-4">
                <span className="flex items-center gap-2 text-sm font-semibold text-white">
                  <SlidersHorizontal className="h-4 w-4 text-[#00C9A7]" />
                  Filter Properties
                </span>
                <button onClick={() => setIsOpen(false)} className="rounded-lg p-1 hover:bg-white/10 transition-colors">
                  <X className="h-4 w-4 text-white" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-5">
                <FilterContent
                  draft={draft}
                  setDraft={setDraft}
                  onApply={handleApply}
                  onReset={handleReset}
                  activeCount={activeCount}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ListingFilters;