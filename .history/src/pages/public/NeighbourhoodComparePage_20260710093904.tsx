import { useSearchParams, Link } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Zap, Shield, Car, Droplets,
  Clock, Database, TrendingUp,
  MinusCircle, ArrowUpRight, RefreshCw,
} from 'lucide-react';
import { useNeighbourhood } from '../../hooks/useNeighbourhood';
import PageWrapper from '../../components/layout/PageWrapper';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { timeAgo, cn } from '../../lib/utils';
import type { INeighbourhoodIntelligence } from '../../types/neighbourhood.types';
import { LAGOS_AREAS } from '../../constants/lagos-areas';
import { useState } from 'react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const scoreColor = (s?: number | null) =>
  s == null ? 'text-slate-400' : s >= 7.5 ? 'text-[#00C9A7]' : s >= 5 ? 'text-amber-400' : 'text-red-400';

const barColor = (s?: number | null) =>
  s == null ? 'bg-slate-200' : s >= 7.5 ? 'bg-[#00C9A7]' : s >= 5 ? 'bg-amber-400' : 'bg-red-400';


const formatRent = (min?: number | null, max?: number | null) => {
  if (!min || !max) return '—';
  const fmt = (n: number) =>
    n >= 1_000_000 ? `₦${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M` : `₦${Math.round(n / 1_000)}K`;
  return `${fmt(min)} – ${fmt(max)}/yr`;
};

// Winner highlight — which side is better for a given score
const winner = (a?: number | null, b?: number | null): 'a' | 'b' | 'tie' => {
  if (a == null && b == null) return 'tie';
  if (a == null) return 'b';
  if (b == null) return 'a';
  if (a > b) return 'a';
  if (b > a) return 'b';
  return 'tie';
};

const floodScore = (r?: string | null) =>
  r === 'low' ? 10 : r === 'medium' ? 5 : r === 'high' ? 0 : null;

// ─── Score comparison row ─────────────────────────────────────────────────────

const CompareRow = ({
  icon: Icon,
  label,
  scoreA,
  scoreB,
  sub,
}: {
  icon: React.ElementType;
  label: string;
  scoreA?: number | null;
  scoreB?: number | null;
  sub?: string;
}) => {
  const w = winner(scoreA, scoreB);

  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 py-4 border-b border-slate-100 last:border-0">
      {/* Left score */}
      <div className={cn('space-y-1.5', w === 'b' && 'opacity-50')}>
        <div className="flex items-center justify-between">
          <span className={cn('text-sm font-bold tabular-nums', scoreColor(scoreA))}>
            {scoreA != null ? scoreA.toFixed(1) : '—'}
          </span>
          {w === 'a' && <span className="text-[10px] font-bold text-[#00C9A7]">WINNER</span>}
        </div>
        <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden flex justify-end">
          <div
            className={cn('h-full rounded-full', barColor(scoreA))}
            style={{ width: scoreA != null ? `${(scoreA / 10) * 100}%` : '0%' }}
          />
        </div>
      </div>

      {/* Centre label */}
      <div className="flex flex-col items-center gap-1 shrink-0 w-24">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100">
          <Icon className="h-4 w-4 text-slate-500" />
        </div>
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide text-center leading-tight">{label}</span>
        {sub && <span className="text-[9px] text-slate-300 text-center">{sub}</span>}
      </div>

      {/* Right score */}
      <div className={cn('space-y-1.5', w === 'a' && 'opacity-50')}>
        <div className="flex items-center justify-between">
          {w === 'b' && <span className="text-[10px] font-bold text-[#00C9A7]">WINNER</span>}
          <span className={cn('text-sm font-bold tabular-nums ml-auto', scoreColor(scoreB))}>
            {scoreB != null ? scoreB.toFixed(1) : '—'}
          </span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
          <div
            className={cn('h-full rounded-full', barColor(scoreB))}
            style={{ width: scoreB != null ? `${(scoreB / 10) * 100}%` : '0%' }}
          />
        </div>
      </div>
    </div>
  );
};

// ─── Area header card ─────────────────────────────────────────────────────────

const AreaHeader = ({ area, side }: { area: INeighbourhoodIntelligence; side: 'a' | 'b' }) => {
  const rent = formatRent(area.avgRentMin, area.avgRentMax);
  return (
    <div className="relative rounded-xl overflow-hidden h-40">
      {area.imageUrl ? (
        <img src={area.imageUrl} alt={area.areaName} className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A1628] to-[#1a3a5c]" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628] via-[#0A1628]/40 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-4">
        <div className="flex items-center gap-1.5 mb-0.5">
          <MapPin className="h-3 w-3 text-[#00C9A7]" />
          <span className="text-xs text-slate-400">Lagos</span>
        </div>
        <h3 className="text-lg font-bold text-white">{area.areaName}</h3>
        <div className="flex items-center gap-2 mt-1">
          {area.overallScore != null && (
            <span className="rounded-full bg-[#00C9A7]/20 border border-[#00C9A7]/30 px-2 py-0.5 text-xs font-bold text-[#00C9A7]">
              {area.overallScore.toFixed(1)} overall
            </span>
          )}
          {rent !== '—' && (
            <span className="text-[10px] text-slate-300 flex items-center gap-1">
              <TrendingUp className="h-2.5 w-2.5" /> {rent}
            </span>
          )}
        </div>
      </div>
      <Link
        to={`/neighbourhood/${encodeURIComponent(area.areaName)}`}
        className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
      >
        <ArrowUpRight className="h-3.5 w-3.5 text-white" />
      </Link>
    </div>
  );
};

// ─── Area selector (swap areas) ───────────────────────────────────────────────

const AreaSelector = ({
  value,
  onChange,
  exclude,
}: {
  value: string;
  onChange: (v: string) => void;
  exclude: string;
}) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-[#0F172A] focus:border-[#00C9A7] focus:outline-none focus:ring-2 focus:ring-[#00C9A7]/20"
  >
    {LAGOS_AREAS.filter((a) => a.toLowerCase() !== exclude.toLowerCase()).map((a) => (
      <option key={a} value={a}>{a}</option>
    ))}
  </select>
);

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NeighbourhoodComparePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [areaA, setAreaA] = useState(searchParams.get('a') ?? 'Yaba');
  const [areaB, setAreaB] = useState(searchParams.get('b') ?? 'Lekki Phase 1');

  const { data: dataA, isLoading: loadingA } = useNeighbourhood(areaA);
  const { data: dataB, isLoading: loadingB } = useNeighbourhood(areaB);

  const intelA = dataA?.data?.area;
  const intelB = dataB?.data?.area;

  const isLoading = loadingA || loadingB;

  const handleSwap = () => {
    const newA = areaB;
    const newB = areaA;
    setAreaA(newA);
    setAreaB(newB);
    setSearchParams({ a: newA, b: newB });
  };

  const handleChangeA = (v: string) => {
    setAreaA(v);
    setSearchParams({ a: v, b: areaB });
  };

  const handleChangeB = (v: string) => {
    setAreaB(v);
    setSearchParams({ a: areaA, b: v });
  };

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Header */}
      <div className="bg-[#0A1628] pt-12 pb-16">
        <PageWrapper>
          <Link to="/neighbourhood" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-6">
            <ArrowLeft className="h-4 w-4" /> All Neighbourhoods
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Compare Neighbourhoods</h1>
          <p className="text-slate-400 text-sm">Side-by-side intelligence scores for any two Lagos areas.</p>

          {/* Selectors */}
          <div className="mt-6 grid grid-cols-[1fr_auto_1fr] items-end gap-3 max-w-xl">
            <div>
              <label className="text-xs font-semibold text-slate-400 mb-1.5 block uppercase tracking-wide">Area A</label>
              <AreaSelector value={areaA} onChange={handleChangeA} exclude={areaB} />
            </div>
            <button
              onClick={handleSwap}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/8 border border-white/10 hover:bg-white/15 transition-colors mb-0.5"
              title="Swap areas"
            >
              <RefreshCw className="h-4 w-4 text-slate-400" />
            </button>
            <div>
              <label className="text-xs font-semibold text-slate-400 mb-1.5 block uppercase tracking-wide">Area B</label>
              <AreaSelector value={areaB} onChange={handleChangeB} exclude={areaA} />
            </div>
          </div>
        </PageWrapper>
      </div>

      <PageWrapper className="py-10 -mt-6">
        {isLoading ? (
          <LoadingSpinner label="Fetching intelligence data…" className="py-16" />
        ) : (
          <div className="space-y-6">

            {/* Area headers */}
            <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-stretch">
              <div>{intelA ? <AreaHeader area={intelA} side="a" /> : (
                <div className="rounded-xl border border-dashed border-slate-300 h-40 flex items-center justify-center">
                  <p className="text-sm text-slate-400">No data for {areaA}</p>
                </div>
              )}</div>
              <div className="flex items-center justify-center w-12">
                <span className="text-xs font-bold text-slate-400 bg-slate-100 rounded-full px-3 py-1.5">VS</span>
              </div>
              <div>{intelB ? <AreaHeader area={intelB} side="b" /> : (
                <div className="rounded-xl border border-dashed border-slate-300 h-40 flex items-center justify-center">
                  <p className="text-sm text-slate-400">No data for {areaB}</p>
                </div>
              )}</div>
            </div>

            {/* Score comparisons */}
            {(intelA || intelB) && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Intelligence Scores</h2>

                <CompareRow
                  icon={Zap}
                  label="Power Supply"
                  scoreA={intelA?.powerScore}
                  scoreB={intelB?.powerScore}
                  sub={[
                    intelA?.powerAvgHoursDaily != null ? `${intelA.powerAvgHoursDaily}h` : null,
                    intelB?.powerAvgHoursDaily != null ? `${intelB.powerAvgHoursDaily}h` : null,
                  ].filter(Boolean).join(' vs ') || undefined}
                />
                <CompareRow icon={Shield}   label="Security"      scoreA={intelA?.securityScore}          scoreB={intelB?.securityScore} />
                <CompareRow icon={Car}      label="Commute"       scoreA={intelA?.commuteScore}           scoreB={intelB?.commuteScore} />
                <CompareRow icon={Droplets} label="Flood Safety"  scoreA={floodScore(intelA?.floodRisk)}  scoreB={floodScore(intelB?.floodRisk)} />
              </div>
            )}

            {/* Travel times side by side */}
            {(intelA?.travelTimesToHubs || intelB?.travelTimesToHubs) && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Commute Times (minutes)</h2>
                <div className="space-y-0">
                  {[
                    { label: 'Victoria Island', keyA: intelA?.travelTimesToHubs?.victoriaIsland, keyB: intelB?.travelTimesToHubs?.victoriaIsland },
                    { label: 'Ikeja',           keyA: intelA?.travelTimesToHubs?.ikeja,          keyB: intelB?.travelTimesToHubs?.ikeja },
                    { label: 'Lekki',           keyA: intelA?.travelTimesToHubs?.lekki,          keyB: intelB?.travelTimesToHubs?.lekki },
                    { label: 'Maryland',        keyA: intelA?.travelTimesToHubs?.maryland,        keyB: intelB?.travelTimesToHubs?.maryland },
                  ].map(({ label, keyA, keyB }) => {
                    const w = winner(
                      keyA != null ? -keyA : null,  // lower = better for commute
                      keyB != null ? -keyB : null
                    );
                    return (
                      <div key={label} className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 py-3 border-b border-slate-100 last:border-0">
                        <span className={cn('text-sm font-bold text-right', w === 'a' ? 'text-[#00C9A7]' : 'text-slate-600', w === 'b' && 'opacity-50')}>
                          {keyA != null ? `${keyA} min` : '—'}
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wide text-center w-20 shrink-0">{label}</span>
                        <span className={cn('text-sm font-bold', w === 'b' ? 'text-[#00C9A7]' : 'text-slate-600', w === 'a' && 'opacity-50')}>
                          {keyB != null ? `${keyB} min` : '—'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Metadata footer */}
            <div className="grid grid-cols-2 gap-4">
              {[intelA, intelB].map((area, i) => area && (
                <div key={i} className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">{area.areaName}</p>
                  {area.lastUpdated && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <Clock className="h-3 w-3" /> Updated {timeAgo(area.lastUpdated)}
                    </div>
                  )}
                  {area.dataSources?.length > 0 && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <Database className="h-3 w-3" /> {area.dataSources.join(', ')}
                    </div>
                  )}
                  {area.totalReportsUsed != null && (
                    <div className="text-xs text-slate-400">{area.totalReportsUsed} reports used</div>
                  )}
                  <Link
                    to={`/neighbourhood/${encodeURIComponent(area.areaName)}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#00C9A7] hover:underline pt-1"
                  >
                    Full profile <ArrowUpRight className="h-3 w-3" />
                  </Link>
                </div>
              ))}
            </div>

          </div>
        )}
      </PageWrapper>
    </div>
  );
}