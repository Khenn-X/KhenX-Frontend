import { useState } from 'react';
import { Search, MapPin } from 'lucide-react';
import { useNeighbourhood } from '../../hooks/useNeighbourhood';
import IntelligenceCard from '../../components/neighbourhood/IntelligenceCard';
import WaitlistForm from '../../components/neighbourhood/WaitlistForm';
import ResidentReportForm from '../../components/neighbourhood/ResidentReportForm';
import PageWrapper from '../../components/layout/PageWrapper';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { LAGOS_AREAS } from '../../constants/lagos-areas';
import { cn } from '../../lib/utils';

const NeighbourhoodPage = () => {
  const [searchInput, setSearchInput] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const { data, isLoading } = useNeighbourhood(selectedArea);
  const intelligence = data?.data.area;

  const filtered = LAGOS_AREAS.filter((a) =>
    a.toLowerCase().includes(searchInput.toLowerCase())
  ).slice(0, 8);

  const handleSelect = (area: string) => {
    setSelectedArea(area);
    setSearchInput(area);
    setShowSuggestions(false);
  };

  const handleSearch = () => {
    const match = LAGOS_AREAS.find(
      (a) => a.toLowerCase() === searchInput.toLowerCase()
    );
    if (match) handleSelect(match);
    else if (searchInput.trim()) setSelectedArea(searchInput.trim());
    setShowSuggestions(false);
  };

  return (
    <PageWrapper className="py-12 space-y-10">

      {/* Hero */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#00C9A7]/10 px-4 py-1.5 mb-4">
          <MapPin className="h-3.5 w-3.5 text-[#00C9A7]" />
          <span className="text-xs font-semibold text-[#00C9A7] uppercase tracking-wide">
            Neighbourhood Intelligence
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-[#0F172A] leading-tight">
          Know the area before you pay
        </h1>
        <p className="mt-3 text-slate-500 leading-relaxed">
          Get verified data on power supply, flood risk, security, and commute scores for any Lagos neighbourhood.
        </p>
      </div>

      {/* Search */}
      <div className="max-w-xl mx-auto">
        <div className="relative">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setShowSuggestions(true);
                  if (!e.target.value) setSelectedArea('');
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search any Lagos area e.g. Lekki Phase 1"
                className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-3.5 text-sm shadow-sm focus:border-[#00C9A7] focus:outline-none focus:ring-2 focus:ring-[#00C9A7]/20"
              />
              {/* Suggestions dropdown */}
              {showSuggestions && searchInput && filtered.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-20 mt-1 rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden">
                  {filtered.map((area) => (
                    <button
                      key={area}
                      onMouseDown={() => handleSelect(area)}
                      className={cn(
                        'flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-left hover:bg-slate-50 transition-colors',
                        area === selectedArea && 'bg-[#00C9A7]/5 text-[#00C9A7]'
                      )}
                    >
                      <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      {area}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={handleSearch}
              disabled={!searchInput.trim()}
              className="rounded-xl bg-[#0A1628] px-5 py-3.5 text-sm font-semibold text-white hover:bg-[#0A1628]/90 disabled:opacity-50 transition-colors"
            >
              Search
            </button>
          </div>
        </div>

        {/* Popular areas */}
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="text-xs text-slate-400">Popular:</span>
          {['Lekki Phase 1', 'Yaba', 'Ikeja', 'Surulere', 'Victoria Island'].map((area) => (
            <button
              key={area}
              onClick={() => handleSelect(area)}
              className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600 hover:border-[#00C9A7] hover:text-[#00C9A7] transition-colors"
            >
              {area}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {isLoading && selectedArea && (
        <LoadingSpinner label={`Loading intelligence for ${selectedArea}...`} className="py-12" />
      )}

      {selectedArea && !isLoading && (
        <div className="space-y-8">
          {intelligence ? (
            <>
              <IntelligenceCard data={intelligence} />

              {/* If data confidence is low, show waitlist */}
              {intelligence.dataConfidence === 'low' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <WaitlistForm defaultArea={selectedArea} />
                  <ResidentReportForm defaultArea={selectedArea} />
                </div>
              )}
            </>
          ) : (
            /* No data exists for this area yet */
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
              <MapPin className="mx-auto h-10 w-10 text-slate-300 mb-3" />
              <p className="font-semibold text-slate-600">
                No intelligence data for <span className="text-[#0F172A]">{selectedArea}</span> yet
              </p>
              <p className="mt-2 text-sm text-slate-400 max-w-sm mx-auto">
                We haven't collected verified data for this area. Join the waitlist or share what you know as a resident.
              </p>
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-lg mx-auto text-left">
                <WaitlistForm defaultArea={selectedArea} />
                <ResidentReportForm defaultArea={selectedArea} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty state — no search yet */}
      {!selectedArea && !isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-3xl mx-auto">
          {[
            { emoji: '⚡', label: 'Power score', desc: 'Average daily hours of electricity supply' },
            { emoji: '🌊', label: 'Flood risk', desc: 'Low / medium / high risk of flooding' },
            { emoji: '🔒', label: 'Security score', desc: 'Resident-reported safety rating' },
          ].map(({ emoji, label, desc }) => (
            <div key={label} className="rounded-xl border border-slate-200 bg-white p-5 text-center shadow-sm">
              <div className="text-3xl mb-3">{emoji}</div>
              <p className="font-semibold text-[#0F172A] text-sm">{label}</p>
              <p className="text-xs text-slate-400 mt-1">{desc}</p>
            </div>
          ))}
        </div>
      )}
    </PageWrapper>
  );
};

export default NeighbourhoodPage;