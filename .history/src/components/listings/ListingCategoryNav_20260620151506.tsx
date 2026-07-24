import { cn } from '../../lib/utils';

// NOTE: 'Land' and 'Commercial' aren't valid PropertyType values in the current
// schema (PROPERTY_TYPES only covers residential types). Selecting them is
// cosmetic-only until those property types exist on the backend.
const TABS = [
  { label: 'All Properties', value: '' },
  { label: 'Apartments', value: 'apartment' },
  { label: 'Houses', value: 'bungalow' },
  { label: 'Duplexes', value: 'duplex' },
  { label: 'Self Contain', value: 'self-con' },
  { label: 'Land', value: 'land' },
  { label: 'Commercial', value: 'commercial' },
  { label: 'Short Lets', value: 'short-let-tab' },
];

// NOTE: these lifestyle tags (Luxury, Budget Friendly, Newly Built, Gated Estate)
// don't correspond to any field on IListing today — they're cosmetic quick
// filters. Wiring them up for real would need a `tags`/`category` field on
// the listing schema.
const QUICK_FILTERS = ['Family Homes', 'Luxury', 'Budget Friendly', 'Newly Built', 'Gated Estate'];

interface ListingCategoryNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  activeQuickFilter: string | null;
  onQuickFilterChange: (filter: string | null) => void;
}

const ListingCategoryNav = ({
  activeTab,
  onTabChange,
  activeQuickFilter,
  onQuickFilterChange,
}: ListingCategoryNavProps) => {
  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex items-center gap-6 overflow-x-auto border-b border-slate-200 pb-px">
        {TABS.map((tab) => (
          <button
            key={tab.label}
            onClick={() => onTabChange(tab.value)}
            className={cn(
              'shrink-0 border-b-2 pb-3 text-sm font-medium transition-colors whitespace-nowrap',
              activeTab === tab.value
                ? 'border-[#0A1628] text-[#0F172A] font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Quick filter pills */}
      <div className="flex flex-wrap gap-2">
        {QUICK_FILTERS.map((filter) => (
          <button
            key={filter}
            onClick={() => onQuickFilterChange(activeQuickFilter === filter ? null : filter)}
            className={cn(
              'rounded-lg border px-3.5 py-1.5 text-sm font-medium transition-colors',
              activeQuickFilter === filter
                ? 'border-[#0A1628] bg-[#0A1628] text-white'
                : 'border-slate-200 text-slate-600 hover:border-slate-300'
            )}
          >
            {filter}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ListingCategoryNav;