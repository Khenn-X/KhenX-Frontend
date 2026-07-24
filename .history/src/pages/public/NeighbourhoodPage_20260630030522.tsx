import { useState } from 'react';
import {
  Search, MapPin, Zap, Shield, Car, Droplets,
  ArrowRight, Users, Database,
} from 'lucide-react';
import { Link } from 'react-router-dom';

// ── Existing components ────────────────────────────────────────────────────
import { useNeighbourhood }     from '../../hooks/useNeighbourhood';
import {  } from '../../hooks/useAllNeighbourhoods';
import IntelligenceCard         from '../../components/neighbourhood/IntelligenceCard';
import WaitlistForm             from '../../components/neighbourhood/WaitlistForm';
import ResidentReportForm       from '../../components/neighbourhood/ResidentReportForm';
import PageWrapper              from '../../components/layout/PageWrapper';
import LoadingSpinner           from '../../components/shared/LoadingSpinner';
import { LAGOS_AREAS }          from '../../constants/lagos-areas';
import { cn }                   from '../../lib/utils';

// ── New neighbourhood-page components ──────────────────────────────────────
import NeighbourhoodPriorityFilter from '../../components/neighbourhood/NeighbourhoodPriorityFilter';
import NeighbourhoodBrowseGrid     from '../../components/neighbourhood/NeighbourhoodBrowseGrid';
import DiscoverByLifestyle         from '../../components/neighbourhood/DiscoverByLifestyle';
import NeighbourhoodMatcher        from '../../components/neighbourhood/NeighbourhoodMatcher';
import LagoMarketInsights          from '../../components/neighbourhood/LagoMarketInsights';
import TalkToAdvisor               from '../../components/neighbourhood/TalkToAdvisor';

// ─── Hero stat pills ───────────────────────────────────────────────────────
const HERO_STATS = [
  { icon: Zap,      label: 'Power Supply Scores'  },
  { icon: Droplets, label: 'Flood Risk Ratings'   },
  { icon: Shield,   label: 'Security Ratings'     },
  { icon: Car,      label: 'Commute Estimates'    },
];

// ─── How it works ──────────────────────────────────────────────────────────
const HOW_IT_WORKS = [
  {
    step:  '01',
    title: 'Search your area',
    desc:  'Type any Lagos neighbourhood name to pull up verified intelligence data for that area.',
  },
  {
    step:  '02',
    title: 'Review the scores',
    desc:  'See power supply reliability, flood risk, security rating, and commute access — all in one place.',
  },
  {
    step:  '03',
    title: 'Make your decision',
    desc:  'Contact verified agents only after you understand whether the area fits your lifestyle and needs.',
  },
];

// ──────────────────────────────────────────────────────────────────────────

const NeighbourhoodPage = () => {
  const [searchInput,     setSearchInput]     = useState('');
  const [selectedArea,    setSelectedArea]    = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Single-area lookup
  const { data, isLoading } = useNeighbourhood(selectedArea);
  const intelligence        = data?.data?.area;

  // Paginated browse
  const {
    areas,
    isLoading:      areasLoading,
    isError:        areasError,
    hasMore,
    isFetchingMore,
    loadMore,
  } = useAllNeighbourhoods();

  const filtered = LAGOS_AREAS.filter((a) =>
    a.toLowerCase().includes(searchInput.toLowerCase())
  ).slice(0, 8);

  const handleSelect = (area: string) => {
    setSelectedArea(area);
    setSearchInput(area);
    setShowSuggestions(false);
    setTimeout(() => {
      document.getElementById('results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleSearch = () => {
    const match = LAGOS_AREAS.find(
      (a) => a.toLowerCase() === searchInput.toLowerCase()
    );
    if (match) handleSelect(match);
    else if (searchInput.trim()) {
      setSelectedArea(searchInput.trim());
      setShowSuggestions(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <section className="bg-[#0A1628] pb-20 pt-16">
        <PageWrapper>
          <div className="text-center max-w-2xl mx-auto">

            <div className="inline-flex items-center gap-2 rounded-full bg-[#00C9A7]/10 border border-[#00C9A7]/20 px-4 py-1.5 mb-5">
              <MapPin className="h-3.5 w-3.5 text-[#00C9A7]" />
              <span className="text-xs font-semibold text-[#00C9A7] uppercase tracking-wide">
                Neighbourhood Intelligence
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
              Find your{' '}
              <span className="text-[#00C9A7]">perfect</span>
              <br />Lagos neighbourhood.
            </h1>

            <p className="mt-4 text-slate-400 leading-relaxed text-base max-w-lg mx-auto">
              Compare neighbourhoods by power supply, security, flood risk,
              commute, and more — before you commit to a single viewing.
            </p>

            {/* Stats row */}
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {HERO_STATS.map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 px-3 py-1.5 text-xs text-slate-300 font-medium"
                >
                  <Icon className="h-3 w-3 text-[#00C9A7]" />
                  {label}
                </span>
              ))}
            </div>

            {/* Search */}
            <div className="mt-8 max-w-lg mx-auto">
              <div className="relative flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
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
                    placeholder="Search any Lagos area…"
                    className="w-full rounded-xl border border-white/10 bg-white/8 pl-10 pr-4 py-3.5 text-sm text-white placeholder:text-slate-500 focus:border-[#00C9A7] focus:outline-none focus:ring-2 focus:ring-[#00C9A7]/20"
                  />
                  {showSuggestions && searchInput && filtered.length > 0 && (
                    <div className="absolute top-full left-0 right-0 z-30 mt-1 rounded-xl border border-slate-200 bg-white shadow-xl overflow-hidden">
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
                  className="rounded-xl bg-[#00C9A7] px-5 py-3.5 text-sm font-semibold text-[#0A1628] hover:bg-[#00b396] disabled:opacity-50 transition-colors"
                >
                  Explore
                </button>
              </div>

              {/* Quick picks */}
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                <span className="text-xs text-slate-500">Popular:</span>
                {['Lekki Phase 1', 'Yaba', 'Ikeja', 'Surulere', 'Victoria Island'].map((area) => (
                  <button
                    key={area}
                    onClick={() => handleSelect(area)}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-400 hover:border-[#00C9A7] hover:text-[#00C9A7] transition-colors"
                  >
                    {area}
                  </button>
                ))}
              </div>
            </div>

            {/* Hero metrics */}
            <div className="mt-10 flex flex-wrap justify-center gap-8">
              {[
                { value: '32+',   label: 'Neighbourhoods Mapped' },
                { value: '6',     label: 'Intelligence Dimensions' },
                { value: '1,200', label: 'Resident Reports' },
                { value: '24h',   label: 'Data Refresh Cycle' },
              ].map(({ value, label }) => (
                <div key={label} className="text-center">
                  <p className="text-2xl font-bold text-white">{value}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{label}</p>
                </div>
              ))}
            </div>

          </div>
        </PageWrapper>
      </section>

      <PageWrapper className="space-y-16 py-14">

        {/* ── SEARCH RESULTS ─────────────────────────────────────────────── */}
        <div id="results">
          {isLoading && selectedArea && (
            <LoadingSpinner
              label={`Loading intelligence for ${selectedArea}…`}
              className="py-12"
            />
          )}

          {selectedArea && !isLoading && (
            <div className="space-y-8">
              {intelligence ? (
                <>
                  <IntelligenceCard data={intelligence} />

                  {intelligence.dataConfidence === 'low' && (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
                      <div className="flex items-start gap-3 mb-5">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100">
                          <Database className="h-4 w-4 text-amber-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-amber-900">
                            Limited data for {selectedArea}
                          </p>
                          <p className="text-sm text-amber-700 mt-0.5">
                            We have some data but not enough to be fully confident in these scores.
                            You can help by sharing what you know or joining the waitlist.
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <WaitlistForm defaultArea={selectedArea} />
                        <ResidentReportForm defaultArea={selectedArea} />
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10">
                  <div className="text-center mb-8">
                    <MapPin className="mx-auto h-10 w-10 text-slate-300 mb-3" />
                    <p className="font-semibold text-slate-700 text-lg">
                      No intelligence data for{' '}
                      <span className="text-[#0A1628]">{selectedArea}</span> yet
                    </p>
                    <p className="mt-2 text-sm text-slate-400 max-w-sm mx-auto">
                      We haven't collected verified data for this area yet.
                      Join the waitlist or be the first to share what you know.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-lg mx-auto">
                    <WaitlistForm defaultArea={selectedArea} />
                    <ResidentReportForm defaultArea={selectedArea} />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── PRIORITY FILTER ────────────────────────────────────────────── */}
        <NeighbourhoodPriorityFilter totalAreas={areas.length} />

        {/* ── INTELLIGENCE BROWSE GRID (paginated) ───────────────────────── */}
        <NeighbourhoodBrowseGrid
          areas={areas}
          isLoading={areasLoading}
          isError={areasError}
          hasMore={hasMore}
          isFetchingMore={isFetchingMore}
          onLoadMore={loadMore}
        />

        {/* ── DISCOVER BY LIFESTYLE ───────────────────────────────────────── */}
        <DiscoverByLifestyle />

        {/* ── NEIGHBOURHOOD MATCHER ───────────────────────────────────────── */}
        <NeighbourhoodMatcher />

        {/* ── MARKET INSIGHTS ────────────────────────────────────────────── */}
        <LagoMarketInsights />

        {/* ── TALK TO AN ADVISOR ─────────────────────────────────────────── */}
        <TalkToAdvisor />

        {/* ── HOW IT WORKS ───────────────────────────────────────────────── */}
        <section className="rounded-2xl bg-[#0A1628] p-8 lg:p-12">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-white">How it works</h2>
            <p className="text-slate-400 text-sm mt-2">
              Three steps between you and a housing decision you won't regret
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#00C9A7]/10 border border-[#00C9A7]/20 mb-4">
                  <span className="text-sm font-bold text-[#00C9A7]">{step}</span>
                </div>
                <p className="font-semibold text-white mb-2">{title}</p>
                <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CONTRIBUTE CTA (preserved — improved visual) ────────────────── */}
        <section className="rounded-2xl border border-[#00C9A7]/20 bg-gradient-to-br from-[#00C9A7]/5 to-transparent p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#00C9A7]/10">
              <Users className="h-5 w-5 text-[#00C9A7]" />
            </div>
            <div>
              <p className="font-bold text-[#0F172A] text-lg">
                Do you live in Lagos? Share what you know.
              </p>
              <p className="text-sm text-slate-500 mt-1 max-w-md">
                Every report you submit about your area helps future residents make
                better decisions. Power hours, flood history, security — it all matters.
              </p>
            </div>
          </div>
          <Link
            to="/neighbourhood/contribute"
            className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-[#0A1628] px-6 py-3 text-sm font-semibold text-white hover:bg-[#0A1628]/90 transition-colors"
          >
            Submit a report
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>

        {/* ── FOOTER CTA BANNER ───────────────────────────────────────────── */}
        <section className="rounded-2xl bg-[#0A1628] p-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#00C9A7] mb-3">
            Before You Pay, Know The Area.
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Join 10,000+ Lagosians using KhenX Intelligence
          </h2>
          <p className="text-slate-400 text-sm max-w-sm mx-auto mb-7">
            to find their perfect home base.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/neighbourhood"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#00C9A7] px-6 py-3 text-sm font-semibold text-[#0A1628] hover:bg-[#00b396] transition-colors"
            >
              Start Free Explore
            </Link>
            <a
              href="/guides/neighbourhood-guide.pdf"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
            >
              Download Guide
            </a>
          </div>
        </section>

      </PageWrapper>
    </div>
  );
};

export default NeighbourhoodPage;