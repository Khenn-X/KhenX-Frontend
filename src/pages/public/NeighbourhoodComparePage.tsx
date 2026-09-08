import { useSearchParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Zap, Shield, Car, Droplets, Plus, X, Check,
  Clock, Database, TrendingUp, ArrowUpRight, SlidersHorizontal, Sparkles,
} from 'lucide-react';
import { useNeighbourhood } from '../../hooks/useNeighbourhood';
import PageWrapper from '../../components/layout/PageWrapper';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import ErrorMessage from '../../components/shared/ErrorMessage';
import { timeAgo, cn } from '../../lib/utils';
import type { INeighbourhoodIntelligence } from '../../types/neighbourhood.types';
import { LAGOS_AREAS } from '../../constants/lagos-areas';
import { isRealCompareError } from '../../lib/neighbourhoodCompareState';
import { useCallback, useEffect, useMemo, useState } from 'react';

// ─── Config ─────────────────────────────────────────────────────────────────

const MAX_AREAS = 5;
const MIN_AREAS = 2;
const COL_WIDTH = 300;
const LABEL_WIDTH = 176;

// One accent, used deliberately — not a color per metric. It also now
// doubles as the "this is the best value in this row" signal.
const ACCENT = '#00C9A7';
const NAVY = '#0F172A';

type Intel = INeighbourhoodIntelligence;
type ColState = { data: Intel | null; loading: boolean; error?: boolean; notFound?: boolean; refetch?: () => void };

// ─── Row taxonomy ───────────────────────────────────────────────────────────

const ROW_DEFS = [
  { key: 'power', label: 'Power', icon: Zap },
  { key: 'security', label: 'Security', icon: Shield },
  { key: 'commute', label: 'Commute', icon: Car },
  { key: 'flood', label: 'Flood Risk', icon: Droplets },
  { key: 'rent', label: 'Avg Rent', icon: TrendingUp },
  { key: 'travel', label: 'Travel Times', icon: Car },
  { key: 'sources', label: 'Data Sources', icon: Database },
  { key: 'updated', label: 'Last Updated', icon: Clock },
] as const;

type RowKey = typeof ROW_DEFS[number]['key'];
const DEFAULT_VISIBLE: RowKey[] = ['power', 'security', 'commute', 'flood', 'rent'];
const SCORE_KEYS: RowKey[] = ['power', 'security', 'commute'];
const DETAIL_KEYS: RowKey[] = ['flood', 'rent', 'travel', 'sources', 'updated'];

// ─── Helpers ────────────────────────────────────────────────────────────────

const formatRent = (min?: number | null, max?: number | null) => {
  if (!min || !max) return '—';
  const fmt = (n: number) =>
    n >= 1_000_000 ? `₦${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M` : `₦${Math.round(n / 1_000)}K`;
  return `${fmt(min)} – ${fmt(max)}/yr`;
};

// Flood risk is the one place a red/amber/teal read is earned — it's a
// hazard signal, not decoration.
const floodLabel = (r?: string | null) => (r ? r.charAt(0).toUpperCase() + r.slice(1) : '—');
const floodColor = (r?: string | null) =>
  r === 'low' ? ACCENT : r === 'medium' ? '#D97706' : r === 'high' ? '#DC2626' : '#E2E8F0';
const floodTextColor = (r?: string | null) =>
  r === 'low' ? 'text-[#00A88F]' : r === 'medium' ? 'text-amber-700' : r === 'high' ? 'text-red-600' : 'text-slate-400';

// Finds the single area with the best value for a row, if there's a clear
// (non-tied) winner among at least two areas that have data for it.
const bestArea = (
  areas: string[],
  dataMap: Record<string, ColState>,
  getVal: (i: Intel) => number | null,
  lowerBetter = false,
): string | null => {
  const vals = areas
    .map((a) => ({ a, v: dataMap[a]?.data ? getVal(dataMap[a]!.data as Intel) : null }))
    .filter((v): v is { a: string; v: number } => v.v != null);
  if (vals.length < 2) return null;
  const best = lowerBetter ? Math.min(...vals.map((v) => v.v)) : Math.max(...vals.map((v) => v.v));
  const winners = vals.filter((v) => v.v === best);
  return winners.length === 1 ? winners[0].a : null;
};

// ─── Silent per-area data loader ───────────────────────────────────────────

const AreaDataLoader = ({
  area, onUpdate,
}: { area: string; onUpdate: (area: string, s: ColState) => void }) => {
  const { data, isLoading, isError, isNotFound, refetch } = useNeighbourhood(area);
  const intel = data?.data?.area ?? null;
  useEffect(() => {
    onUpdate(area, { data: intel, loading: isLoading, error: isError, notFound: isNotFound, refetch });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [area, intel, isLoading, isError, refetch]);
  return null;
};

// ─── Attribute filter chips — one neutral system, not one hue per metric ──

const FilterPills = ({
  visible, onToggle,
}: { visible: Set<RowKey>; onToggle: (k: RowKey) => void }) => (
  <div className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
    {ROW_DEFS.map((r) => {
      const active = visible.has(r.key);
      const Icon = r.icon;
      return (
        <button
          key={r.key}
          onClick={() => onToggle(r.key)}
          className={cn(
            'inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-3.5 py-2 text-xs font-semibold transition-colors',
            active
              ? 'border-[#0F172A] bg-[#0F172A] text-white'
              : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
          )}
        >
          <Icon className={cn('h-3.5 w-3.5', active ? 'text-white' : 'text-slate-400')} />
          {r.label}
        </button>
      );
    })}
  </div>
);

// ─── "Choose neighbourhoods" modal ─────────────────────────────────────────

const NeighbourhoodPickerModal = ({
  currentAreas, onSave, onClose,
}: { currentAreas: string[]; onSave: (next: string[]) => void; onClose: () => void }) => {
  const [selected, setSelected] = useState<string[]>(currentAreas);
  const canSave = selected.length >= MIN_AREAS;

  const toggle = (a: string) => {
    setSelected((prev) => {
      if (prev.includes(a)) return prev.filter((x) => x !== a);
      if (prev.length >= MAX_AREAS) return prev;
      return [...prev, a];
    });
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl bg-white p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-xl font-bold text-[#0F172A]">Choose neighbourhoods</h3>
          <div className="flex items-center gap-2">
            <button
              disabled={!canSave}
              onClick={() => { onSave(selected); onClose(); }}
              className={cn(
                'rounded-full px-5 py-2 text-sm font-bold text-white transition-colors',
                canSave ? 'bg-[#00C9A7] hover:bg-[#00b596]' : 'bg-slate-300 cursor-not-allowed'
              )}
            >
              Save
            </button>
            <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Pick {MIN_AREAS}–{MAX_AREAS} areas to compare. {selected.length} selected{!canSave && ` — need at least ${MIN_AREAS}`}.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {LAGOS_AREAS.map((a) => {
            const isSelected = selected.includes(a);
            const disabled = !isSelected && selected.length >= MAX_AREAS;
            return (
              <button
                key={a}
                disabled={disabled}
                onClick={() => toggle(a)}
                className={cn(
                  'relative rounded-xl border-2 overflow-hidden text-left transition-colors',
                  isSelected ? 'border-[#00C9A7]' : disabled ? 'border-slate-100 opacity-50 cursor-not-allowed' : 'border-slate-200 hover:border-slate-300'
                )}
              >
                <div className="h-20 bg-gradient-to-br from-[#0A1628] to-[#1a3a5c]" />
                {isSelected && (
                  <span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#00C9A7]">
                    <Check className="h-3 w-3 text-white" />
                  </span>
                )}
                <div className="px-2.5 py-2">
                  <span className="text-xs font-semibold text-[#0F172A]">{a}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ─── Row label (sticky) — carries an optional "how to read this" hint ────

const RowLabel = ({
  icon: Icon, label, caption, zebra,
}: { icon: React.ElementType; label: string; caption?: string; zebra?: boolean }) => (
  <div
    style={{ width: LABEL_WIDTH }}
    className={cn('sticky left-0 z-10 flex flex-col justify-center gap-0.5 pr-4 py-5', zebra ? 'bg-slate-50' : 'bg-white')}
  >
    <div className="flex items-center gap-2.5">
      <Icon className="h-4 w-4 shrink-0 text-slate-400" />
      <span className="text-sm font-semibold text-slate-600">{label}</span>
    </div>
    {caption && <span className="pl-[26px] text-[11px] text-slate-400">{caption}</span>}
  </div>
);

const RowDivider = () => <div style={{ gridColumn: '1 / -1' }} className="border-t border-slate-100" />;

const SectionLabel = ({ children, caption }: { children: React.ReactNode; caption?: string }) => (
  <div style={{ gridColumn: '1 / -1' }} className="flex items-baseline justify-between pt-6 pb-1">
    <span className="text-sm font-semibold text-slate-700">{children}</span>
    {caption && <span className="text-xs text-slate-400">{caption}</span>}
  </div>
);

// ─── Score bar — fixed-width number, a midpoint tick for scale, and a
// teal "winner" treatment so the best value in the row is obvious ─────────

const ScoreBar = ({ score, highlight, zebra }: { score?: number | null; highlight?: boolean; zebra?: boolean }) => {
  const pct = score != null ? Math.max(4, Math.min(100, (score / 10) * 100)) : 0;
  return (
    <div className={cn('flex items-center gap-2.5 rounded-lg px-2 py-1 -mx-2', highlight ? 'bg-[#00C9A7]/10' : zebra ? 'bg-slate-50' : '')}>
      <span className={cn('w-9 shrink-0 text-lg font-bold tabular-nums', highlight ? 'text-[#00A88F]' : 'text-[#0F172A]')}>
        {score != null ? score.toFixed(1) : '—'}
      </span>
      <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
        <span className="absolute left-1/2 top-0 h-full w-px bg-slate-300/70" />
        {score != null && (
          <div
            className="absolute h-full rounded-full transition-all"
            style={{ width: `${pct}%`, backgroundColor: highlight ? ACCENT : NAVY }}
          />
        )}
      </div>
      {highlight && <Check className="h-3.5 w-3.5 shrink-0 text-[#00C9A7]" />}
    </div>
  );
};

// ─── Flood meter — the one legitimate use of a red/amber/teal read ────────

const FloodMeter = ({ risk }: { risk?: string | null }) => {
  const levels = ['low', 'medium', 'high'];
  const idx = levels.indexOf(risk ?? '');
  const color = floodColor(risk);
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex gap-1">
        {levels.map((lvl, i) => (
          <span key={lvl} className="h-1.5 w-6 rounded-full" style={{ backgroundColor: i <= idx ? color : '#E2E8F0' }} />
        ))}
      </div>
      <span className={cn('text-sm font-semibold', floodTextColor(risk))}>{floodLabel(risk)}</span>
    </div>
  );
};

// ─── Rent — figure plus a range bar vs. the other compared areas ──────────

const RentBar = ({
  min, max, range, highlight,
}: { min?: number | null; max?: number | null; range: { lo: number; hi: number } | null; highlight?: boolean }) => {
  const figure = (
    <span className={cn('inline-flex items-center gap-1 text-sm font-bold', highlight ? 'text-[#00A88F]' : 'text-[#0F172A]')}>
      {formatRent(min, max)}
      {highlight && <Check className="h-3 w-3 text-[#00C9A7]" />}
    </span>
  );
  if (min == null || max == null || !range || range.hi === range.lo) return figure;
  const left = ((min - range.lo) / (range.hi - range.lo)) * 100;
  const width = Math.max(4, ((max - min) / (range.hi - range.lo)) * 100);
  return (
    <div>
      {figure}
      <div className="relative mt-2 h-1 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="absolute h-full rounded-full"
          style={{ left: `${left}%`, width: `${width}%`, backgroundColor: highlight ? ACCENT : NAVY }}
        />
      </div>
    </div>
  );
};

// ─── Score ring on the card photo — the one bold accent moment ───────────

const ScoreRing = ({ score, className }: { score?: number | null; className?: string }) => {
  const pct = score != null ? Math.max(0, Math.min(100, (score / 10) * 100)) : 0;
  const deg = pct * 3.6;
  return (
    <div
      className={cn('relative flex h-11 w-11 items-center justify-center rounded-full', className)}
      style={{ background: `conic-gradient(${ACCENT} ${deg}deg, rgba(255,255,255,0.28) ${deg}deg)` }}
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0A1628]">
        <span className="text-xs font-bold text-white">{score != null ? score.toFixed(1) : '—'}</span>
      </div>
    </div>
  );
};

// ─── Card badge — a single unified style, differentiated by text only ────

const badgeFor = (area: string, dataMap: Record<string, ColState>, areas: string[]): string | null => {
  const entries = areas.map((a) => ({ a, intel: dataMap[a]?.data ?? null }));
  const checks: { label: string; get: (i: Intel) => number | null; lowerBetter?: boolean }[] = [
    { label: 'Best Power', get: (i) => i.powerScore ?? null },
    { label: 'Safest', get: (i) => i.securityScore ?? null },
    { label: 'Best Commute', get: (i) => i.commuteScore ?? null },
    { label: 'Cheapest', get: (i) => i.avgRentMin ?? null, lowerBetter: true },
  ];
  for (const c of checks) {
    const vals = entries.filter((e) => e.intel).map((e) => ({ a: e.a, v: c.get(e.intel as Intel) })).filter((v) => v.v != null) as { a: string; v: number }[];
    if (vals.length < 2) continue;
    const best = c.lowerBetter ? Math.min(...vals.map((v) => v.v)) : Math.max(...vals.map((v) => v.v));
    const winners = vals.filter((v) => v.v === best);
    if (winners.length === 1 && winners[0].a === area) return c.label;
  }
  return null;
};

// ─── Area card — image does most of the work, chrome kept minimal ────────

const AreaCard = ({
  area, state, areas, dataMap,
}: { area: string; state: ColState | undefined; areas: string[]; dataMap: Record<string, ColState> }) => {
  const intel = state?.data;

  if (state?.loading || !state) {
    return <div style={{ width: COL_WIDTH }} className="h-80 animate-pulse rounded-xl border border-slate-200 bg-white" />;
  }

  if (!intel) {
    return (
      <div style={{ width: COL_WIDTH }} className="flex h-80 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 text-center">
        <p className="text-sm text-slate-400">No data yet for {area}.</p>
      </div>
    );
  }

  const badge = badgeFor(area, dataMap, areas);
  const metaLine = [
    intel.totalReportsUsed != null ? `${intel.totalReportsUsed} reports analysed` : null,
    intel.lastUpdated ? `updated ${timeAgo(intel.lastUpdated)}` : null,
  ].filter(Boolean).join(' · ');

  return (
    <div style={{ width: COL_WIDTH }} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="relative h-56">
        {intel.imageUrl ? (
          <img src={intel.imageUrl} alt={intel.areaName} className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#0A1628] to-[#1a3a5c]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        {badge && (
          <span className="absolute left-3 top-3 rounded-md bg-black/40 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
            {badge}
          </span>
        )}
        <ScoreRing score={intel.overallScore} className="absolute right-3 top-3" />

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="truncate text-lg font-bold text-white">{intel.areaName}</h3>
          {metaLine && <p className="mt-0.5 truncate text-xs text-white/70">{metaLine}</p>}
        </div>
      </div>

      <Link
        to={`/neighbourhood/${encodeURIComponent(intel.areaName)}`}
        className="flex items-center justify-center gap-1.5 border-t border-slate-100 py-2.5 text-xs font-semibold text-slate-500 transition-colors hover:text-[#0F172A]"
      >
        More details <ArrowUpRight className="h-3 w-3" />
      </Link>
    </div>
  );
};

// ─── Page ────────────────────────────────────────────────────────────────────

export default function NeighbourhoodComparePage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialAreas = useMemo(() => {
    const fromUrl = searchParams.get('areas');
    if (fromUrl) {
      const list = fromUrl.split(',').map((a) => decodeURIComponent(a)).filter(Boolean);
      if (list.length >= MIN_AREAS) return list.slice(0, MAX_AREAS);
    }
    return ['Yaba', 'Lekki Phase 1'];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [areas, setAreas] = useState<string[]>(initialAreas);
  const [dataMap, setDataMap] = useState<Record<string, ColState>>({});
  const [visible, setVisible] = useState<Set<RowKey>>(new Set(DEFAULT_VISIBLE));
  const [pillsOpen, setPillsOpen] = useState(true);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [missingAreaNotice, setMissingAreaNotice] = useState<string | null>(null);

  const handleUpdate = useCallback((area: string, s: ColState) => {
    setDataMap((prev) => ({ ...prev, [area]: s }));
    if (s.notFound) setMissingAreaNotice((current) => current ?? area);
  }, []);

  const handleSaveAreas = (next: string[]) => {
    setAreas(next);
    setSearchParams({ areas: next.map(encodeURIComponent).join(',') });
  };

  const toggleRow = (k: RowKey) => {
    setVisible((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k); else next.add(k);
      return next;
    });
  };

  const isLoading = areas.some((a) => !dataMap[a] || dataMap[a].loading);
  const anyData = areas.some((a) => dataMap[a]?.data);
  const isAnyError = areas.some((a) => isRealCompareError(dataMap[a]));
  const refetchAll = () => {
    areas.forEach((a) => dataMap[a]?.refetch?.());
  };

  const rentRange = useMemo(() => {
    const mins = areas.map((a) => dataMap[a]?.data?.avgRentMin).filter((v): v is number => v != null);
    const maxs = areas.map((a) => dataMap[a]?.data?.avgRentMax).filter((v): v is number => v != null);
    if (!mins.length || !maxs.length) return null;
    return { lo: Math.min(...mins), hi: Math.max(...maxs) };
  }, [areas, dataMap]);

  const scoreRowDefs: { key: RowKey; label: string; icon: React.ElementType; get: (i: Intel) => number | null; sub?: (i: Intel) => string | null }[] = [
    { key: 'power', label: 'Power Supply', icon: Zap, get: (i) => i.powerScore ?? null, sub: (i) => (i.powerAvgHoursDaily != null ? `${i.powerAvgHoursDaily}h/day avg` : null) },
    { key: 'security', label: 'Security', icon: Shield, get: (i) => i.securityScore ?? null },
    { key: 'commute', label: 'Commute', icon: Car, get: (i) => i.commuteScore ?? null },
  ];

  const anyScoreVisible = SCORE_KEYS.some((k) => visible.has(k));
  const anyDetailVisible = DETAIL_KEYS.some((k) => visible.has(k));

  const hubs: { key: keyof NonNullable<Intel['travelTimesToHubs']>; label: string }[] = [
    { key: 'victoriaIsland', label: 'Victoria Island' },
    { key: 'ikeja', label: 'Ikeja' },
    { key: 'lekki', label: 'Lekki' },
    { key: 'maryland', label: 'Maryland' },
  ];

  // Alternating row tint, computed in the same top-to-bottom order the rows
  // actually render in — so it stays continuous no matter which filters are on.
  let stripeFlag = false;
  const nextStripe = () => { const v = stripeFlag; stripeFlag = !stripeFlag; return v; };

  return (
    <div className="min-h-screen bg-slate-50">
      {areas.map((a) => <AreaDataLoader key={a} area={a} onUpdate={handleUpdate} />)}
      {pickerOpen && (
        <NeighbourhoodPickerModal
          currentAreas={areas}
          onSave={handleSaveAreas}
          onClose={() => setPickerOpen(false)}
        />
      )}
      {missingAreaNotice && (
        <div className="fixed bottom-5 right-5 z-30 w-[min(22rem,calc(100vw-2rem))] rounded-xl border border-amber-200 bg-white p-4 shadow-xl">
          <p className="text-sm font-semibold text-[#0F172A]">No data yet for {missingAreaNotice}</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">Choose another neighbourhood or keep comparing the areas that loaded.</p>
          <div className="mt-3 flex justify-end gap-2">
            <button
              onClick={() => { setMissingAreaNotice(null); setPickerOpen(true); }}
              className="rounded-lg bg-[#0F172A] px-3 py-2 text-xs font-semibold text-white"
            >
              Choose another
            </button>
            <button
              onClick={() => setMissingAreaNotice(null)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="relative bg-[#0A1628] pt-12 pb-16 overflow-hidden">
        <div className="pointer-events-none absolute -top-20 -right-20 h-72 w-72 rounded-full bg-[#00C9A7]/10 blur-3xl" />
        <PageWrapper className="relative">
          <Link to="/neighbourhood" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-6">
            <ArrowLeft className="h-4 w-4" /> All Neighbourhoods
          </Link>
          <br />
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/8 border border-white/10 px-2.5 py-1 mb-3">
            <Sparkles className="h-3 w-3 text-[#00C9A7]" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Live comparison</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Compare Neighbourhoods</h1>
          <p className="text-slate-400 text-sm">Line up Lagos areas side by side, and pick which stats matter to you.</p>
        </PageWrapper>
      </div>

      <PageWrapper className="py-10 -mt-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          {/* Compare header row */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-[#0F172A]">Compare</h2>
            <button
              onClick={() => setPillsOpen((o) => !o)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:border-slate-300 transition-colors"
              title="Toggle attribute filters"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </button>
          </div>

          {pillsOpen && <FilterPills visible={visible} onToggle={toggleRow} />}

          {isAnyError ? (
            <div className="mt-6">
              <ErrorMessage
                message="We couldn't load one or more neighbourhood comparisons right now. Try again."
                onRetry={refetchAll}
              />
            </div>
          ) : isLoading && !anyData ? (
            <LoadingSpinner label="Fetching intelligence data…" className="py-16" />
          ) : (
            <div className="mt-6 overflow-x-auto">
              <div
                className="grid"
                style={{ gridTemplateColumns: `${LABEL_WIDTH}px repeat(${areas.length}, ${COL_WIDTH}px)`, columnGap: 20 }}
              >
                {/* Row 0: + button and area cards */}
                <div style={{ width: LABEL_WIDTH }} className="sticky left-0 z-10 bg-white flex items-center justify-center pb-6">
                  <button
                    onClick={() => setPickerOpen(true)}
                    className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#00C9A7] text-[#00C9A7] hover:bg-[#00C9A7]/10 transition-colors"
                    title="Choose neighbourhoods"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
                {areas.map((a) => (
                  <div key={`card-${a}`} className="pb-6">
                    <AreaCard area={a} state={dataMap[a]} areas={areas} dataMap={dataMap} />
                  </div>
                ))}

                <RowDivider />

                {/* At a glance: power / security / commute — winner highlighted per row */}
                {anyScoreVisible && <SectionLabel caption="Out of 10 · higher is better">At a glance</SectionLabel>}
                {scoreRowDefs.map((row) => {
                  if (!visible.has(row.key)) return null;
                  const winner = bestArea(areas, dataMap, row.get);
                  const z = nextStripe();
                  return (
                    <div key={row.key} style={{ display: 'contents' }}>
                      <RowLabel icon={row.icon} label={row.label} zebra={z} />
                      {areas.map((a) => {
                        const intel = dataMap[a]?.data;
                        const score = intel ? row.get(intel) : null;
                        const sub = intel && row.sub ? row.sub(intel) : null;
                        return (
                          <div key={`${row.key}-${a}`} className={cn('py-4 pr-2', z && 'bg-slate-50')}>
                            <ScoreBar score={score} highlight={score != null && a === winner} />
                            {sub && <div className="mt-1.5 pl-[10px] text-xs text-slate-400">{sub}</div>}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
                {anyScoreVisible && <RowDivider />}

                {/* Details */}
                {anyDetailVisible && <SectionLabel>Details</SectionLabel>}

                {/* Flood */}
                {visible.has('flood') && (() => {
                  const z = nextStripe();
                  return (
                    <>
                      <RowLabel icon={Droplets} label="Flood Risk" zebra={z} />
                      {areas.map((a) => (
                        <div key={`flood-${a}`} className={cn('py-5 pr-2', z && 'bg-slate-50')}>
                          <FloodMeter risk={dataMap[a]?.data?.floodRisk} />
                        </div>
                      ))}
                      <RowDivider />
                    </>
                  );
                })()}

                {/* Rent */}
                {visible.has('rent') && (() => {
                  const winner = bestArea(areas, dataMap, (i) => i.avgRentMin ?? null, true);
                  const z = nextStripe();
                  return (
                    <>
                      <RowLabel icon={TrendingUp} label="Avg Rent" caption="Lower is cheaper" zebra={z} />
                      {areas.map((a) => {
                        const intel = dataMap[a]?.data;
                        return (
                          <div key={`rent-${a}`} className={cn('py-5 pr-2', z && 'bg-slate-50')}>
                            <RentBar
                              min={intel?.avgRentMin}
                              max={intel?.avgRentMax}
                              range={rentRange}
                              highlight={!!intel && a === winner}
                            />
                          </div>
                        );
                      })}
                      <RowDivider />
                    </>
                  );
                })()}

                {/* Travel times */}
                {visible.has('travel') && hubs.map((hub, hubIdx) => {
                  const winner = bestArea(areas, dataMap, (i) => i.travelTimesToHubs?.[hub.key] ?? null, true);
                  const z = nextStripe();
                  return (
                    <div key={hub.key} style={{ display: 'contents' }}>
                      <RowLabel icon={Car} label={hub.label} caption={hubIdx === 0 ? 'Shorter is better' : undefined} zebra={z} />
                      {areas.map((a) => {
                        const val = dataMap[a]?.data?.travelTimesToHubs?.[hub.key];
                        const isWinner = val != null && a === winner;
                        return (
                          <div key={`${hub.key}-${a}`} className={cn('py-5 pr-2', z && 'bg-slate-50')}>
                            <span
                              className={cn(
                                'inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-sm font-semibold tabular-nums',
                                isWinner ? 'bg-[#00C9A7]/10 text-[#00A88F]' : 'bg-slate-100 text-slate-700'
                              )}
                            >
                              {val != null ? `${val} min` : '—'}
                              {isWinner && <Check className="h-3 w-3 text-[#00C9A7]" />}
                            </span>
                          </div>
                        );
                      })}
                      {hubIdx === hubs.length - 1 && <RowDivider />}
                    </div>
                  );
                })}

                {/* Data sources */}
                {visible.has('sources') && (() => {
                  const z = nextStripe();
                  return (
                    <>
                      <RowLabel icon={Database} label="Data Sources" zebra={z} />
                      {areas.map((a) => {
                        const sources = dataMap[a]?.data?.dataSources ?? [];
                        return (
                          <div key={`sources-${a}`} className={cn('flex flex-wrap gap-1.5 py-5 pr-2', z && 'bg-slate-50')}>
                            {sources.length ? sources.map((s) => (
                              <span key={s} className="rounded-md bg-white px-2 py-1 text-[11px] font-medium text-slate-500 ring-1 ring-slate-200">{s}</span>
                            )) : <span className="text-xs text-slate-400">—</span>}
                          </div>
                        );
                      })}
                      <RowDivider />
                    </>
                  );
                })()}

                {/* Last updated */}
                {visible.has('updated') && (() => {
                  const z = nextStripe();
                  return (
                    <>
                      <RowLabel icon={Clock} label="Last Updated" zebra={z} />
                      {areas.map((a) => (
                        <div key={`updated-${a}`} className={cn('py-5 pr-2', z && 'bg-slate-50')}>
                          <span className="text-xs text-slate-500">
                            {dataMap[a]?.data?.lastUpdated ? timeAgo(dataMap[a]!.data!.lastUpdated) : '—'}
                          </span>
                        </div>
                      ))}
                    </>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      </PageWrapper>
    </div>
  );
}