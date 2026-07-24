import { useState } from 'react';
import {
  Search, MapPin, Zap, Shield, Car,
  Droplets, ChevronRight, Users, Database, ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useNeighbourhood, useFeaturedAreas } from '../../hooks/useNeighbourhood';
import IntelligenceCard from '../../components/neighbourhood/IntelligenceCard';
import WaitlistForm from '../../components/neighbourhood/WaitlistForm';
import ResidentReportForm from '../../components/neighbourhood/ResidentReportForm';
import ScoreBadge from '../../components/neighbourhood/ScoreBadge';
import FloodRiskBadge from '../../components/neighbourhood/FloodRiskBadge';
import PageWrapper from '../../components/layout/PageWrapper';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { LAGOS_AREAS } from '../../constants/lagos-areas';
import { cn } from '../../lib/utils';
import NeighbourhoodGrid from '@/components/home/NeighbourhoodGrid';

// ─── Intelligence stat pills shown in hero ────────────────────
const HERO_STATS = [
  { icon: Zap,      label: 'Power Supply Scores' },
  { icon: Droplets, label: 'Flood Risk Ratings' },
  { icon: Shield,   label: 'Security Ratings' },
  { icon: Car,      label: 'Commute Estimates' },
];

// ─── How it works steps ───────────────────────────────────────
const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Search your area',
    desc:  'Type any Lagos neighbourhood name to pull up verified intelligence data for that area.',
  },
  {
    step: '02',
    title: 'Review the scores',
    desc:  'See power supply reliability, flood risk, security rating, and commute access — all in one place.',
  },
  {
    step: '03',
    title: 'Make your decision',
    desc:  'Contact verified agents only after you understand whether the area fits your lifestyle and needs.',
  },
];

const NeighbourhoodPage = () => {
  const [searchInput, setSearchInput]     = useState('');
  const [selectedArea, setSelectedArea]   = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const { data, isLoading } = useNeighbourhood(selectedArea);
  const intelligence        = data?.data?.area;

  const { data: featuredData, isLoading: featuredLoading } = useFeaturedAreas(6);
  const featuredAreas = featuredData?.data?.areas ?? [];

  const filtered = LAGOS_AREAS.filter((a) =>
    a.toLowerCase().includes(searchInput.toLowerCase())
  ).slice(0, 8);

  const handleSelect = (area: string) => {
    setSelectedArea(area);
    setSearchInput(area);
    setShowSuggestions(false);
    // Scroll to results
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

      {/* ── HERO ─────────────────────────────────────────────── */}
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
              Know the area{' '}
              <span className="text-[#00C9A7]">before you pay</span>
            </h1>

            <p className="mt-4 text-slate-400 leading-relaxed text-base max-w-lg mx-auto">
              Verified data on power supply, flood risk, security, and commute scores
              for every Lagos neighbourhood — before you commit to anything.
            </p>

            {/* Stat pills */}
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

            {/* Search bar */}
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
                  Search
                </button>
              </div>

              {/* Popular quick picks */}
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
          </div>
        </PageWrapper>
      </section>

      <PageWrapper className="space-y-16 py-14">

        {/* ── SEARCH RESULTS ───────────────────────────────────── */}
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

                  {/* Low confidence — invite the user to improve the data */}
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
                /* No data at all for this area */
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10">
                  <div className="text-center mb-8">
                    <MapPin className="mx-auto h-10 w-10 text-slate-300 mb-3" />
                    <p className="font-semibold text-slate-700 text-lg">
                      No intelligence data for{' '}
                      <span className="text-[#0A1628]">{selectedArea}</span> yet
                    </p>
                    <p className="mt-2 text-sm text-slate-400 max-w-sm mx-auto">
                      We haven't collected verified data for this area.
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

        {/* ── FEATURED AREAS GRID ───────────────────────────────── */}
        {featuredAreas.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-[#0F172A]">
                  Featured Neighbourhoods
                </h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  Well-documented areas with verified intelligence scores
                </p>
              </div>
              <Link
                to="/intelligence"
                className="hidden sm:flex items-center gap-1 text-sm font-semibold text-[#00C9A7] hover:underline"
              >
                View all <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            {featuredLoading ? (
              <LoadingSpinner className="py-8" />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {featuredAreas.map((area) => (
                  <button
                    key={area._id}
                    onClick={() => handleSelect(area.areaName)}
                    className="group text-left rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-[#00C9A7] hover:shadow-md transition-all"
                  >
                    {/* Area header */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="font-bold text-[#0F172A] group-hover:text-[#00C9A7] transition-colors">
                          {area.areaName}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">Lagos, Nigeria</p>
                      </div>
                      {area.overallScore !== undefined && area.overallScore !== null && (
                        <ScoreBadge score={area.overallScore} label="" size="sm" />
                      )}
                    </div>

                    {/* Score chips row */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {area.powerScore !== undefined && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                          <Zap className="h-3 w-3 text-[#00C9A7]" />
                          Power {area.powerScore?.toFixed(1)}
                        </span>
                      )}
                      {area.securityScore !== undefined && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                          <Shield className="h-3 w-3 text-[#00C9A7]" />
                          Security {area.securityScore?.toFixed(1)}
                        </span>
                      )}
                      {area.floodRisk && (
                        <FloodRiskBadge risk={area.floodRisk} size="sm" showLabel={false} />
                      )}
                    </div>

                    {/* Rent range + property count */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      {area.avgRentMin && area.avgRentMax ? (
                        <p className="text-xs text-slate-500">
                          ₦{(area.avgRentMin / 1000).toFixed(0)}k –{' '}
                          ₦{(area.avgRentMax / 1000000).toFixed(1)}M/yr
                        </p>
                      ) : (
                        <span />
                      )}
                      {area.propertiesCount !== undefined && area.propertiesCount !== null && (
                        <p className="text-xs text-slate-400">
                          {area.propertiesCount} listings
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>
        )}

        <NeighbourhoodGrid />
        

        {/* ── HOW IT WORKS ─────────────────────────────────────── */}
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

        {/* ── CONTRIBUTE CTA BANNER ─────────────────────────────── */}
        <section className="rounded-2xl border border-[#00C9A7]/20 bg-[#00C9A7]/5 p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
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
            Submit a report <ArrowRight className="h-4 w-4" />
          </Link>
        </section>

      </PageWrapper>
    </div>
  );
};

export default NeighbourhoodPage;