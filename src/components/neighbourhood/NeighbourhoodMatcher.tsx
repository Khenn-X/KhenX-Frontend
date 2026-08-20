import { useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  ArrowLeft, MapPin, ArrowUpRight, Zap, Shield, Car, Droplets,
  Trophy, Sparkles, Image as ImageIcon, Target, Compass, CheckCircle2,
} from 'lucide-react';
import { useAllAreas, useNeighbourhoodMatch } from '../../hooks/useNeighbourhood';
import PageWrapper from '../../components/layout/PageWrapper';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { cn } from '../../lib/utils';
import type { INeighbourhoodIntelligence, NeighbourhoodMatchCandidate } from '../../types/neighbourhood.types';
import { useNeighbourhoodQuizStore } from '../../store/neighbourhoodQuiz.store';

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

// Maps the commute hub choice to the actual area names that count as "exact match"
// for that hub — i.e. literally being in/near the location they picked.
const commuteAreaNames: Record<string, string[]> = {
  VI:    ['victoria island', 'ikoyi'],
  Ikeja: ['ikeja', 'maryland'],
  Lekki: ['lekki', 'lekki phase 1', 'ajah'],
  Yaba:  ['yaba', 'surulere'],
};

// Returns true if the area IS one of the areas the user actually picked / near it
const isExactLocationMatch = (area: INeighbourhoodIntelligence, commute: string): boolean => {
  const targets = commuteAreaNames[commute] ?? [];
  const name = area.areaName?.toLowerCase() ?? '';
  return targets.some((t) => name.includes(t) || t.includes(name));
};

// Commute hub filter — keeps areas with a reasonable travel time to chosen hub
const matchesCommute = (area: INeighbourhoodIntelligence, commute: string): boolean => {
  const times = area.travelTimesToHubs;
  if (!times) return true;
  const MAX_MINUTES = 60;
  if (commute === 'VI')    return (times.victoriaIsland ?? 999) <= MAX_MINUTES;
  if (commute === 'Ikeja') return (times.ikeja          ?? 999) <= MAX_MINUTES;
  if (commute === 'Lekki') return (times.lekki          ?? 999) <= MAX_MINUTES;
  if (commute === 'Yaba')  return (times.maryland        ?? 999) <= MAX_MINUTES;
  return true;
};

const priorityLabels: Record<string, string> = {
  power:    'Reliable Power',
  security: 'High Security',
  commute:  'Short Commute',
  flood:    'Low Flood Risk',
};

const priorityIcons: Record<string, React.ElementType> = {
  power: Zap, security: Shield, commute: Car, flood: Droplets,
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

// ─── Score pill ───────────────────────────────────────────────────────────────

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

// ─── Result card ─────────────────────────────────────────────────────────────

const ResultCard = ({
  area,
  rank,
  isExactMatch,
}: {
  area: INeighbourhoodIntelligence;
  rank: number;
  isExactMatch?: boolean;
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

        {/* Exact location match badge */}
        {isExactMatch && !isTop && (
          <div className="absolute top-3 left-14 inline-flex items-center gap-1 rounded-full bg-white/90 backdrop-blur px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#0A1628]">
            <CheckCircle2 className="h-3 w-3 text-[#00C9A7]" /> Your area
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

// ─── Preference summary card (visual recap of exact picks) ──────────────────

const PreferenceChip = ({
  icon: Icon,
  eyebrow,
  value,
}: {
  icon: React.ElementType;
  eyebrow: string;
  value: string;
}) => (
  <div className="flex items-center gap-3 rounded-2xl bg-white/8 border border-white/10 px-4 py-3 backdrop-blur-sm">
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#00C9A7]/15">
      <Icon className="h-4 w-4 text-[#00C9A7]" />
    </div>
    <div className="min-w-0">
      <p className="text-[10px] uppercase tracking-wide text-slate-500 font-semibold">{eyebrow}</p>
      <p className="text-sm font-semibold text-white truncate">{value}</p>
    </div>
  </div>
);

const BackendResultCard = ({ candidate, rank }: { candidate: NeighbourhoodMatchCandidate; rank: number }) => (
  <div className="rounded-2xl border border-[#00C9A7] bg-white overflow-hidden shadow-lg shadow-[#00C9A7]/10">
    <div className="relative h-32 overflow-hidden bg-gradient-to-br from-[#0A1628] via-[#103a52] to-[#00C9A7]/40">
      <div className="absolute top-3 left-3 flex h-9 w-9 items-center justify-center rounded-full bg-[#00C9A7] text-[#0A1628] text-sm font-bold">
        #{rank}
      </div>
      <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-3">
        <div className="flex items-center gap-1.5 min-w-0">
          <MapPin className="h-3.5 w-3.5 text-[#00C9A7] shrink-0" />
          <span className="text-base font-bold text-white truncate">{candidate.areaName}</span>
        </div>
        <span className="shrink-0 text-lg font-bold text-[#00C9A7]">{candidate.matchScore}%</span>
      </div>
    </div>
    <div className="p-4">
      <div className="flex flex-wrap gap-2 text-xs text-slate-500">
        {candidate.commuteMinutes != null && <span>{candidate.commuteMinutes} min commute</span>}
        {candidate.securityScore != null && <span>{candidate.securityScore.toFixed(1)}/10 security</span>}
        {candidate.rentAvg != null && <span>{formatRent(candidate.rentAvg, candidate.rentAvg)}</span>}
      </div>
      {candidate.reason && <p className="mt-2 text-xs text-slate-500 line-clamp-2">{candidate.reason}</p>}
      <Link
        to={`/neighbourhood/${encodeURIComponent(candidate.areaName)}`}
        className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#00C9A7]"
      >
        View profile <ArrowUpRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  </div>
);

// ─── Section header ──────────────────────────────────────────────────────────

const SectionHeader = ({
  icon: Icon,
  title,
  subtitle,
  count,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  count?: number;
}) => (
  <div className="flex items-center gap-3 mb-5">
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#00C9A7]/10">
      <Icon className="h-5 w-5 text-[#00C9A7]" />
    </div>
    <div>
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-bold text-[#0F172A]">{title}</h2>
        {count != null && (
          <span className="rounded-full bg-[#00C9A7]/10 text-[#00C9A7] text-xs font-bold px-2 py-0.5">
            {count}
          </span>
        )}
      </div>
      <p className="text-xs text-slate-400">{subtitle}</p>
    </div>
  </div>
);

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NeighbourhoodMatchPage() {
  const [params] = useSearchParams();
  const budget   = params.get('budget')   ?? '';
  const priority = params.get('priority') ?? '';
  const commute  = params.get('commute')  ?? '';
  const setQuizInputs = useNeighbourhoodQuizStore((state) => state.setInputs);

  const { data, isLoading, isError } = useAllAreas();
  const backendMatch = useNeighbourhoodMatch();
  const allAreas: INeighbourhoodIntelligence[] = (data as any)?.data?.areas ?? [];

  const workplace = commute === 'VI'
    ? 'Victoria Island'
    : commute === 'Ikeja'
      ? 'Ikeja'
      : commute === 'Lekki'
        ? 'Lekki'
        : commute === 'Yaba'
          ? 'Yaba'
          : undefined;

  useEffect(() => {
    setQuizInputs({ budget, priority, commute, workLocation: workplace ?? '' });
    if (budget || priority || workplace) {
      backendMatch.mutate({ budget: budget || undefined, priority: priority || undefined, workplace, currentArea: undefined });
    }
  }, [budget, priority, commute, workplace, setQuizInputs]);

  const backendResult = backendMatch.data?.data;
  const backendCandidates = backendResult
    ? [backendResult.matchedArea, ...backendResult.alternates]
    : [];

  // ── The core logic: split results into "exact location matches" (user's literal
  // pick) shown first, then "other good options" that fit budget + priority but
  // aren't the exact area/hub they chose. Both groups are sorted internally by
  // the priority score they picked. ──────────────────────────────────────────
  const { exactMatches, otherMatches } = useMemo(() => {
    const budgetFiltered = allAreas.filter((a) => matchesBudget(a, budget));

    const exact = budgetFiltered
      .filter((a) => isExactLocationMatch(a, commute))
      .sort((a, b) => getPriorityScore(b, priority) - getPriorityScore(a, priority));

    const exactNames = new Set(exact.map((a) => a.areaName));

    const other = budgetFiltered
      .filter((a) => !exactNames.has(a.areaName) && matchesCommute(a, commute))
      .sort((a, b) => getPriorityScore(b, priority) - getPriorityScore(a, priority))
      .slice(0, 6);

    return { exactMatches: exact, otherMatches: other };
  }, [allAreas, budget, priority, commute]);

  // Backend results are authoritative once loaded; client-side results are shown only during the loading gap.
  const totalResults = backendResult ? backendCandidates.length : exactMatches.length + otherMatches.length;
  const PriorityIcon = priorityIcons[priority] ?? Target;

  return (
    <div className="min-h-screen bg-slate-50">
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* ── HEADER ────────────────────────────────────────────────────────── */}
      <div className="relative bg-[#0A1628] pt-12 pb-20 overflow-hidden">
        {/* Ambient accent glows */}
        <div className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-[#00C9A7]/10 blur-3xl pointer-events-none" />
        <div className="absolute top-40 -left-24 h-72 w-72 rounded-full bg-[#00C9A7]/5 blur-3xl pointer-events-none" />

        {/* Subtle grid texture */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
          }}
        />

        <PageWrapper className="relative">
          <Link to="/neighbourhood" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-8">
            <ArrowLeft className="h-4 w-4" /> Back to Neighbourhoods
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#00C9A7]/10 border border-[#00C9A7]/20 px-3 py-1.5 mb-4">
                <Trophy className="h-3.5 w-3.5 text-[#00C9A7]" />
                <span className="text-xs font-semibold text-[#00C9A7] uppercase tracking-wide">
                  Personalised Match
                </span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-bold text-white mb-3 leading-tight">
                Your perfect<br />
                <span className="text-[#00C9A7]">Lagos match.</span>
              </h1>
              <p className="text-slate-400 text-sm leading-relaxed">
                Ranked exactly the way you asked — your chosen area first,
                then the best alternatives that fit your budget and priorities.
              </p>
            </div>

            {/* Result count badge */}
            {!isLoading && (
              <div className="flex items-center gap-4 rounded-2xl bg-white/5 border border-white/10 px-6 py-4 backdrop-blur-sm shrink-0">
                <div className="text-center">
                  <p className="text-3xl font-bold text-[#00C9A7]">{totalResults}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide">Matches found</p>
                </div>
              </div>
            )}
          </div>

          {/* Preference recap — visual chips of exact picks */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl">
            {budget && (
              <PreferenceChip icon={Compass} eyebrow="Budget" value={budgetLabels[budget] ?? budget} />
            )}
            {priority && (
              <PreferenceChip icon={PriorityIcon} eyebrow="Top priority" value={priorityLabels[priority] ?? priority} />
            )}
            {commute && (
              <PreferenceChip icon={MapPin} eyebrow="Wants to be near" value={commuteLabels[commute] ?? commute} />
            )}
          </div>

          <Link
            to="/neighbourhood"
            className="mt-4 inline-flex items-center gap-1.5 text-xs text-[#00C9A7] hover:underline"
          >
            ✏️ Change preferences
          </Link>
        </PageWrapper>
      </div>

      {/* ── BODY ──────────────────────────────────────────────────────────── */}
      <PageWrapper className="py-12 -mt-8">
        {isLoading ? (
          <LoadingSpinner label="Finding your best matches…" className="py-16" />
        ) : isError ? (
          <div className="text-center py-16">
            <p className="text-slate-500">Couldn't load neighbourhood data. Please try again.</p>
          </div>
        ) : totalResults === 0 ? (
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
          <div className="space-y-12">
            {backendMatch.isPending && (
              <div className="rounded-xl border border-[#00C9A7]/20 bg-[#00C9A7]/5 px-4 py-3 text-sm text-slate-600">
                Quick results are ready. Confirming them with the live neighbourhood matcher...
              </div>
            )}
            {backendMatch.isError && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Live matching is unavailable right now. Showing quick results instead.
              </div>
            )}

            {backendResult && (
              <section>
                <SectionHeader
                  icon={Sparkles}
                  title="Live backend matches"
                  subtitle="These results are ranked by the shared neighbourhood matching service"
                  count={backendCandidates.length}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {backendCandidates.map((candidate, index) => (
                    <BackendResultCard key={`${candidate.areaName}-${index}`} candidate={candidate} rank={index + 1} />
                  ))}
                </div>
                {backendResult.summary && (
                  <p className="mt-5 rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-600">
                    {backendResult.summary}
                  </p>
                )}
              </section>
            )}

            {!backendResult && (
              <>

            {/* ── Exact location matches — shown FIRST, always ───────────── */}
            {exactMatches.length > 0 && (
              <section>
                <SectionHeader
                  icon={Target}
                  title={`Best in ${commuteLabels[commute] ?? commute}`}
                  subtitle="These are the exact areas you chose, ranked by your top priority"
                  count={exactMatches.length}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {exactMatches.map((area, i) => (
                    <ResultCard key={area._id} area={area} rank={i + 1} isExactMatch />
                  ))}
                </div>
              </section>
            )}

            {/* ── Other good options — secondary section ──────────────────── */}
            {otherMatches.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-5">
                  <div className="h-px flex-1 bg-slate-200" />
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest px-2">
                    {exactMatches.length > 0 ? 'Also worth considering' : 'Top results'}
                  </span>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>
                <SectionHeader
                  icon={Sparkles}
                  title="Other neighbourhoods that fit"
                  subtitle="Matched your budget and priority, just outside your chosen area"
                  count={otherMatches.length}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {otherMatches.map((area, i) => (
                    <ResultCard key={area._id} area={area} rank={exactMatches.length + i + 1} />
                  ))}
                </div>
              </section>
            )}

            {/* Compare CTA */}
            {totalResults >= 2 && (
              <section className="rounded-2xl border border-[#00C9A7]/20 bg-gradient-to-br from-[#00C9A7]/5 to-transparent p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <p className="font-bold text-[#0F172A]">Not sure which to pick?</p>
                  <p className="text-sm text-slate-500 mt-0.5">
                    Compare your top 2 matches side by side.
                  </p>
                </div>
                <Link
                  to={`/neighbourhood/compare?a=${encodeURIComponent([...exactMatches, ...otherMatches][0]?.areaName ?? '')}&b=${encodeURIComponent([...exactMatches, ...otherMatches][1]?.areaName ?? '')}`}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#0A1628] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0A1628]/90 transition-colors shrink-0"
                >
                  Compare top matches
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </section>
            )}
              </>
            )}
          </div>
        )}
      </PageWrapper>
    </div>
  );
}