import { useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, ArrowUpRight, Zap, Shield, Car, Droplets, Trophy, Sparkles, Image as ImageIcon } from 'lucide-react';
import { useAllAreas } from '../../hooks/useNeighbourhood';
import PageWrapper from '../../components/layout/PageWrapper';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { cn } from '../../lib/utils';
import type { INeighbourhoodIntelligence } from '../../types/neighbourhood.types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const scoreColor = (s?: number | null) =>
  s == null ? 'text-slate-400' : s >= 7.5 ? 'text-[#00C9A7]' : s >= 5 ? 'text-amber-400' : 'text-red-400';

const barColor = (s?: number | null) =>
  s == null ? 'bg-slate-200' : s >= 7.5 ? 'bg-[#00C9A7]' : s >= 5 ? 'bg-amber-400' : 'bg-red-400';

const floodScore = (risk?: string | null) =>
  risk === 'low' ? 10 : risk === 'medium' ? 5 : risk === 'high' ? 1 : null;

const formatRent = (min?: number | null, max?: number | null) => {
  if (!min || !max) return null;
  const fmt = (n: number) =>
    n >= 1_000_000 ? `₦${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M` : `₦${Math.round(n / 1_000)}K`;
  return `${fmt(min)} – ${fmt(max)}/yr`;
};

// Budget filter — returns true if area rent falls within the band
const matchesBudget = (area: INeighbourhoodIntelligence, budget: string): boolean => {
  const max = area.avgRentMax;
  if (!max) return true; // no rent data — include it
  if (budget === 'under-200k')  return max <= 200_000;
  if (budget === '200k-600k')   return max >= 200_000 && max <= 600_000;
  if (budget === 'above-600k')  return max >= 600_000;
  return true;
};

// Primary sort score based on priority choice
const getPriorityScore = (area: INeighbourhoodIntelligence, priority: string): number => {
  if (priority === 'power')    return area.powerScore    ?? 0;
  if (priority === 'security') return area.securityScore ?? 0;
  if (priority === 'commute')  return area.commuteScore  ?? 0;
  if (priority === 'flood')    return floodScore(area.floodRisk) ?? 0;
  return area.overallScore ?? 0;
};

// Commute hub filter — keeps areas with a reasonable travel time to chosen hub
const matchesCommute = (area: INeighbourhoodIntelligence, commute: string): boolean => {
  const times = area.travelTimesToHubs;
  if (!times) return true;
  const MAX_MINUTES = 60;
  if (commute === 'VI')    return (times.victoriaIsland ?? 999) <= MAX_MINUTES;
  if (commute === 'Ikeja') return (times.ikeja          ?? 999) <= MAX_MINUTES;
  if (commute === 'Lekki') return (times.lekki          ?? 999) <= MAX_MINUTES;
  if (commute === 'Yaba')  return (times.maryland        ?? 999) <= MAX_MINUTES; // Maryland is closest hub for Yaba
  return true;
};

const priorityLabels: Record<string, string> = {
  power:    'Reliable Power',
  security: 'High Security',
  commute:  'Short Commute',
  flood:    'Low Flood Risk',
};

const commuteLabels: Record<string, string> = {
  VI:    'Victoria Island / Ikoyi',
  Ikeja: 'Ikeja / Maryland',
  Lekki: 'Lekki / Ajah',
  Yaba:  'Yaba / Surulere',
};

const budgetLabels: Record<string, string> = {
  'under-200k': 'Under ₦200K/mo',
  '200k-600k':  '₦200K – ₦600K/mo',
  'above-600k': 'Above ₦600K/mo',
};

// Deterministic fallback gradient per area so cards without a photo still feel designed
const fallbackGradients = [
  'from-[#0A1628] via-[#103a52] to-[#00C9A7]/40',
  'from-[#1c1547] via-[#3a1f5e] to-[#00C9A7]/30',
  'from-[#0A1628] via-[#1f2f52] to-[#274b6e]',
  'from-[#13202e] via-[#0f3d3a] to-[#00C9A7]/40',
];
const gradientFor = (key: string) => {
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  return fallbackGradients[hash % fallbackGradients.length];
};

// ─── Result card ─────────────────────────────────────────────────────────────

const ScorePill = ({ icon: Icon, label, score }: { icon: React.ElementType; label: string; score?: number | null }) => (
  <div className="flex flex-col gap-1.5">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1.5">
        <Icon className={cn('h-3.5 w-3.5', scoreColor(score))} />
        <span className="text-[11px] font-medium text-slate-500">{label}</span>
      </div>
      <span className={cn('text-xs font-bold tabular-nums', scoreColor(score))}>
        {score != null ? score.toFixed(1) : '—'}
      </span>
    </div>
    <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
      <div
        className={cn('h-full rounded-full transition-all duration-500', barColor(score))}
        style={{ width: score != null ? `${(score / 10) * 100}%` : '0%' }}
      />
    </div>
  </div>
);

const ResultCard = ({
  area,
  rank,
}: {
  area: INeighbourhoodIntelligence;
  rank: number;
}) => {
  const rent = formatRent(area.avgRentMin, area.avgRentMax);
  const isTop = rank === 1;
  const gradient = gradientFor(area.areaName ?? String(rank));

  return (
    <div
      className={cn(
        'group relative rounded-2xl border bg-white overflow-hidden transition-all duration-300',
        'hover:shadow-xl hover:-translate-y-1',
        isTop ? 'border-[#00C9A7] shadow-lg shadow-[#00C9A7]/10' : 'border-slate-200 shadow-sm'
      )}
      style={{ animation: 'fadeInUp .45s ease both', animationDelay: `${rank * 60}ms` }}
    >
      {isTop && (
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#00C9A7] via-[#00e0bb] to-[#0A1628] z-10" />
      )}

      {/* Image / gradient hero */}
      <div className={cn('relative h-44 overflow-hidden bg-gradient-to-br', gradient)}>
        {area.imageUrl ? (
          <img
            src={area.imageUrl}
            alt={area.areaName}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <ImageIcon className="h-8 w-8 text-white/15" />
          </div>
        )}

        {/* Layered gradient for legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628]/90 via-[#0A1628]/10 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A1628]/40 via-transparent to-transparent" />

        {/* Rank badge */}
        <div
          className={cn(
            'absolute top-3 left-3 flex h-9 w-9 items-center justify-center rounded-full border-2 text-xs font-bold backdrop-blur-md shadow-sm',
            isTop
              ? 'bg-[#00C9A7] border-[#00C9A7] text-[#0A1628]'
              : 'bg-white/15 border-white/25 text-white'
          )}
        >
          {isTop ? <Trophy className="h-4.5 w-4.5" /> : `#${rank}`}
        </div>

        {isTop && (
          <div className="absolute top-3 left-14 inline-flex items-center gap-1 rounded-full bg-[#00C9A7]/90 backdrop-blur px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#0A1628]">
            <Sparkles className="h-3 w-3" /> Best match
          </div>
        )}

        {area.overallScore != null && (
          <div className="absolute top-3 right-3 flex flex-col items-center justify-center h-12 w-12 rounded-full bg-black/35 backdrop-blur-md border border-white/25 shadow-sm">
            <span className="text-base font-bold text-white leading-none">{area.overallScore.toFixed(1)}</span>
            <span className="text-[8px] uppercase tracking-wide text-slate-300 leading-none mt-0.5">score</span>
          </div>
        )}

        <div className="absolute bottom-3 left-4 right-4">
          <div className="flex items-center gap-1.5 mb-0.5">
            <MapPin className="h-3.5 w-3.5 text-[#00C9A7] shrink-0" />
            <span className="text-base font-bold text-white truncate">{area.areaName}</span>
          </div>
          {rent && (
            <p className="text-xs font-medium text-[#00C9A7]/90">{rent}</p>
          )}
        </div>
      </div>

      {/* Scores */}
      <div className="p-4 grid grid-cols-2 gap-x-4 gap-y-3 border-b border-slate-100">
        <ScorePill icon={Zap}      label="Power"    score={area.powerScore} />
        <ScorePill icon={Shield}   label="Security" score={area.securityScore} />
        <ScorePill icon={Car}      label="Commute"  score={area.commuteScore} />
        <ScorePill icon={Droplets} label="Flood"    score={floodScore(area.floodRisk)} />
      </div>

      {/* Footer */}
      <div className="px-4 py-3 flex items-center justify-between bg-slate-50/60">
        {area.propertiesCount != null ? (
          <span className="text-xs text-slate-400 font-medium">{area.propertiesCount.toLocaleString()} listings</span>
        ) : <span />}
        <Link
          to={`/neighbourhood/${encodeURIComponent(area.areaName)}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#00C9A7] hover:text-[#0A1628] transition-colors"
        >
          View profile
          <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>
    </div>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NeighbourhoodMatchPage() {
  const [params] = useSearchParams();
  const budget   = params.get('budget')   ?? '';
  const priority = params.get('priority') ?? '';
  const commute  = params.get('commute')  ?? '';

  const { data, isLoading, isError } = useAllAreas();
  const allAreas: INeighbourhoodIntelligence[] = (data as any)?.data?.areas ?? [];

  const results = useMemo(() => {
    return allAreas
      .filter((a) => matchesBudget(a, budget) && matchesCommute(a, commute))
      .sort((a, b) => getPriorityScore(b, priority) - getPriorityScore(a, priority))
      .slice(0, 6);
  }, [allAreas, budget, priority, commute]);

  return (
    <div className="min-h-screen bg-slate-50">
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Header */}
      <div className="relative bg-[#0A1628] pt-12 pb-16 overflow-hidden">
        {/* Ambient accent glow */}
        <div className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-[#00C9A7]/10 blur-3xl pointer-events-none" />

        <PageWrapper className="relative">
          <Link to="/neighbourhood" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-6">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>

          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#00C9A7]/10 border border-[#00C9A7]/20 px-3 py-1.5 mb-4">
              <Trophy className="h-3.5 w-3.5 text-[#00C9A7]" />
              <span className="text-xs font-semibold text-[#00C9A7] uppercase tracking-wide">
                Personalised Match
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
              Your best neighbourhoods
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              Based on your preferences — ranked by what matters most to you.
            </p>
          </div>

          {/* Preference summary pills */}
          <div className="mt-6 flex flex-wrap gap-2">
            {budget && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/8 border border-white/10 px-3 py-1.5 text-xs text-slate-300">
                💰 {budgetLabels[budget] ?? budget}
              </span>
            )}
            {priority && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/8 border border-white/10 px-3 py-1.5 text-xs text-slate-300">
                ⭐ Priority: {priorityLabels[priority] ?? priority}
              </span>
            )}
            {commute && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/8 border border-white/10 px-3 py-1.5 text-xs text-slate-300">
                🚗 Near {commuteLabels[commute] ?? commute}
              </span>
            )}
            <Link
              to="/neighbourhood"
              className="inline-flex items-center gap-1.5 rounded-full border border-[#00C9A7]/30 bg-[#00C9A7]/10 px-3 py-1.5 text-xs text-[#00C9A7] hover:bg-[#00C9A7]/20 transition-colors"
            >
              ✏️ Change preferences
            </Link>
          </div>
        </PageWrapper>
      </div>

      <PageWrapper className="py-10 -mt-6">
        {isLoading ? (
          <LoadingSpinner label="Finding your best matches…" className="py-16" />
        ) : isError ? (
          <div className="text-center py-16">
            <p className="text-slate-500">Couldn't load neighbourhood data. Please try again.</p>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-16 max-w-sm mx-auto">
            <MapPin className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-[#0F172A] mb-2">No matches found</h2>
            <p className="text-sm text-slate-500 mb-6">
              No neighbourhoods matched all your filters. Try relaxing your budget or commute preference.
            </p>
            <Link
              to="/neighbourhood"
              className="inline-flex items-center gap-2 rounded-xl bg-[#0A1628] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0A1628]/90 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Adjust preferences
            </Link>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-slate-500">
                <span className="font-bold text-[#0F172A]">{results.length}</span> neighbourhoods matched your profile
              </p>
              <Link
                to={`/neighbourhood/compare?a=${encodeURIComponent(results[0]?.areaName ?? '')}&b=${encodeURIComponent(results[1]?.areaName ?? '')}`}
                className="text-xs font-semibold text-[#00C9A7] hover:underline"
              >
                Compare top 2 →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {results.map((area, i) => (
                <ResultCard key={area._id} area={area} rank={i + 1} />
              ))}
            </div>
          </>
        )}
      </PageWrapper>
    </div>
  );
}