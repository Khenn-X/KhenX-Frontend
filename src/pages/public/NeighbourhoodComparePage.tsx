import { useSearchParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Zap, Shield, Car, Droplets, Plus, X, Check,
  Clock, Database, TrendingUp, ArrowUpRight, SlidersHorizontal, Sparkles,
} from 'lucide-react';
import { useNeighbourhood } from '../../hooks/useNeighbourhood';
import PageWrapper from '../../components/layout/PageWrapper';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { timeAgo, cn } from '../../lib/utils';
import type { INeighbourhoodIntelligence } from '../../types/neighbourhood.types';
import { LAGOS_AREAS } from '../../constants/lagos-areas';
import { useCallback, useEffect, useMemo, useState } from 'react';

// ─── Config ─────────────────────────────────────────────────────────────────

const MAX_AREAS = 5;
const MIN_AREAS = 2;
const COL_WIDTH = 260;
const LABEL_WIDTH = 160;

type Intel = INeighbourhoodIntelligence;
type ColState = { data: Intel | null; loading: boolean };

// ─── Helpers ────────────────────────────────────────────────────────────────

const scoreColor = (s?: number | null) =>
  s == null ? 'text-slate-400' : s >= 7.5 ? 'text-[#00C9A7]' : s >= 5 ? 'text-amber-500' : 'text-red-500';

const formatRent = (min?: number | null, max?: number | null) => {
  if (!min || !max) return '—';
  const fmt = (n: number) =>
    n >= 1_000_000 ? `₦${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M` : `₦${Math.round(n / 1_000)}K`;
  return `${fmt(min)} – ${fmt(max)}/yr`;
};

const floodLabel = (r?: string | null) => (r ? r.charAt(0).toUpperCase() + r.slice(1) : '—');
const floodTextColor = (r?: string | null) =>
  r === 'low' ? 'text-[#00C9A7]' : r === 'medium' ? 'text-amber-500' : r === 'high' ? 'text-red-500' : 'text-slate-400';

// ─── Silent per-area data loader (keeps hook usage clean per column) ───────

const AreaDataLoader = ({
  area, onUpdate,
}: { area: string; onUpdate: (area: string, s: ColState) => void }) => {
  const { data, isLoading } = useNeighbourhood(area);
  const intel = data?.data?.area ?? null;
  useEffect(() => {
    onUpdate(area, { data: intel, loading: isLoading });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [area, intel, isLoading]);
  return null;
};

// ─── Attribute filter pills — these decide which feature rows show ────────

const ROW_DEFS = [
  { key: 'power', label: 'Power' },
  { key: 'security', label: 'Security' },
  { key: 'commute', label: 'Commute' },
  { key: 'flood', label: 'Flood Risk' },
  { key: 'rent', label: 'Avg Rent' },
  { key: 'travel', label: 'Travel Times' },
  { key: 'sources', label: 'Data Sources' },
  { key: 'updated', label: 'Last Updated' },
] as const;

type RowKey = typeof ROW_DEFS[number]['key'];
const DEFAULT_VISIBLE: RowKey[] = ['power', 'security', 'commute', 'flood', 'rent'];

const FilterPills = ({
  visible, onToggle,
}: { visible: Set<RowKey>; onToggle: (k: RowKey) => void }) => (
  <div className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
    {ROW_DEFS.map((r) => {
      const active = visible.has(r.key);
      return (
        <button
          key={r.key}
          onClick={() => onToggle(r.key)}
          className={cn(
            'shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors',
            active
              ? 'bg-[#0A1628] border-[#0A1628] text-white'
              : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
          )}
        >
          {r.label}
        </button>
      );
    })}
  </div>
);

// ─── "Choose neighbourhoods" modal — the single control for add/remove ────

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

// ─── Row label (sticky, plain — matches the reference's flat list style) ──

const RowLabel = ({ icon: Icon, label }: { icon: React.ElementType; label: string }) => (
  <div style={{ width: LABEL_WIDTH }} className="sticky left-0 z-10 flex items-center gap-2 bg-white pr-3 py-4">
    <Icon className="h-4 w-4 shrink-0 text-slate-400" />
    <span className="text-sm font-semibold text-slate-600">{label}</span>
  </div>
);

// a hairline that spans every column, including the sticky label column
const RowDivider = () => <div style={{ gridColumn: '1 / -1' }} className="border-t border-dashed border-slate-200" />;

// ─── Card badge (Best Power / Safest / Best Commute / Cheapest) ───────────

const badgeFor = (area: string, dataMap: Record<string, ColState>, areas: string[]): { label: string; color: string } | null => {
  const entries = areas.map((a) => ({ a, intel: dataMap[a]?.data ?? null }));
  const checks: { label: string; color: string; get: (i: Intel) => number | null; lowerBetter?: boolean }[] = [
    { label: 'Featured', color: 'text-amber-500', get: (i) => i.powerScore ?? null },
    { label: 'Safest', color: 'text-sky-500', get: (i) => i.securityScore ?? null },
    { label: 'Best Commute', color: 'text-purple-500', get: (i) => i.commuteScore ?? null },
    { label: 'Cheapest', color: 'text-[#00C9A7]', get: (i) => i.avgRentMin ?? null, lowerBetter: true },
  ];
  for (const c of checks) {
    const vals = entries.filter((e) => e.intel).map((e) => ({ a: e.a, v: c.get(e.intel as Intel) })).filter((v) => v.v != null) as { a: string; v: number }[];
    if (vals.length < 2) continue;
    const best = c.lowerBetter ? Math.min(...vals.map((v) => v.v)) : Math.max(...vals.map((v) => v.v));
    const winners = vals.filter((v) => v.v === best);
    if (winners.length === 1 && winners[0].a === area) return { label: c.label, color: c.color };
  }
  return null;
};

// ─── Area card ──────────────────────────────────────────────────────────────

const AreaCard = ({
  area, state, areas, dataMap,
}: { area: string; state: ColState | undefined; areas: string[]; dataMap: Record<string, ColState> }) => {
  const intel = state?.data;

  if (state?.loading || !state) {
    return <div style={{ width: COL_WIDTH }} className="rounded-xl border border-slate-200 bg-white h-64 animate-pulse" />;
  }

  if (!intel) {
    return (
      <div style={{ width: COL_WIDTH }} className="rounded-xl border border-dashed border-slate-300 bg-white h-64 flex items-center justify-center px-4 text-center">
        <p className="text-xs text-slate-400">No data yet for {area}.</p>
      </div>
    );
  }

  const badge = badgeFor(area, dataMap, areas);
  const metaLine = [
    intel.totalReportsUsed != null ? `${intel.totalReportsUsed} reports analysed` : null,
    intel.lastUpdated ? `updated ${timeAgo(intel.lastUpdated)}` : null,
  ].filter(Boolean).join(' · ');

  return (
    <div style={{ width: COL_WIDTH }} className="rounded-xl border border-slate-200 bg-white p-3">
      <div className="relative h-32 rounded-lg overflow-hidden mb-3">
        {intel.imageUrl ? (
          <img src={intel.imageUrl} alt={intel.areaName} className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#0A1628] to-[#1a3a5c]" />
        )}
      </div>

      <h3 className="text-sm font-bold text-[#0F172A] truncate">{intel.areaName}</h3>
      {badge && <span className={cn('text-[10px] font-bold uppercase tracking-wide', badge.color)}>{badge.label}</span>}

      <div className="flex items-baseline gap-1.5 mt-2">
        {intel.overallScore != null && (
          <span className="text-lg font-bold text-[#0F172A]">{intel.overallScore.toFixed(1)}</span>
        )}
        <span className="text-[11px] text-slate-400">overall score</span>
      </div>

      {metaLine && <p className="text-xs text-slate-400 leading-snug mt-1.5 line-clamp-2">{metaLine}</p>}

      <Link
        to={`/neighbourhood/${encodeURIComponent(intel.areaName)}`}
        className="inline-flex items-center gap-1 text-xs font-semibold text-[#00C9A7] hover:underline pt-2"
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

  const handleUpdate = useCallback((area: string, s: ColState) => {
    setDataMap((prev) => ({ ...prev, [area]: s }));
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

  const hubs: { key: keyof NonNullable<Intel['travelTimesToHubs']>; label: string }[] = [
    { key: 'victoriaIsland', label: 'Victoria Island' },
    { key: 'ikeja', label: 'Ikeja' },
    { key: 'lekki', label: 'Lekki' },
    { key: 'maryland', label: 'Maryland' },
  ];

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

      {/* Header */}
      <div className="relative bg-[#0A1628] pt-12 pb-16 overflow-hidden">
        <div className="pointer-events-none absolute -top-20 -right-20 h-72 w-72 rounded-full bg-[#00C9A7]/10 blur-3xl" />
        <PageWrapper className="relative">
          <Link to="/neighbourhood" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-6">
            <ArrowLeft className="h-4 w-4" /> All Neighbourhoods
          </Link>
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

          {isLoading && !anyData ? (
            <LoadingSpinner label="Fetching intelligence data…" className="py-16" />
          ) : (
            <div className="mt-6 overflow-x-auto">
              <div
                className="grid"
                style={{ gridTemplateColumns: `${LABEL_WIDTH}px repeat(${areas.length}, ${COL_WIDTH}px)`, columnGap: 16 }}
              >
                {/* Row 0: + button and area cards */}
                <div style={{ width: LABEL_WIDTH }} className="sticky left-0 z-10 bg-white flex items-center justify-center pb-6">
                  <button
                    onClick={() => setPickerOpen(true)}
                    className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#00C9A7] text-[#00C9A7] hover:bg-[#00C9A7]/10 transition-colors"
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

                {/* Power */}
                {visible.has('power') && (
                  <>
                    <RowLabel icon={Zap} label="Power Supply" />
                    {areas.map((a) => {
                      const score = dataMap[a]?.data?.powerScore;
                      const hours = dataMap[a]?.data?.powerAvgHoursDaily;
                      return (
                        <div key={`power-${a}`} className="py-4">
                          <div className="flex items-baseline gap-1">
                            <span className={cn('text-base font-bold', scoreColor(score))}>{score != null ? score.toFixed(1) : '—'}</span>
                            <span className="text-xs text-slate-400">/10</span>
                          </div>
                          {hours != null && <div className="text-xs text-slate-400 mt-0.5">{hours}h/day avg</div>}
                        </div>
                      );
                    })}
                    <RowDivider />
                  </>
                )}

                {/* Security */}
                {visible.has('security') && (
                  <>
                    <RowLabel icon={Shield} label="Security" />
                    {areas.map((a) => {
                      const score = dataMap[a]?.data?.securityScore;
                      return (
                        <div key={`security-${a}`} className="py-4">
                          <span className={cn('text-base font-bold', scoreColor(score))}>{score != null ? score.toFixed(1) : '—'}</span>
                          <span className="text-xs text-slate-400"> /10</span>
                        </div>
                      );
                    })}
                    <RowDivider />
                  </>
                )}

                {/* Commute */}
                {visible.has('commute') && (
                  <>
                    <RowLabel icon={Car} label="Commute" />
                    {areas.map((a) => {
                      const score = dataMap[a]?.data?.commuteScore;
                      return (
                        <div key={`commute-${a}`} className="py-4">
                          <span className={cn('text-base font-bold', scoreColor(score))}>{score != null ? score.toFixed(1) : '—'}</span>
                          <span className="text-xs text-slate-400"> /10</span>
                        </div>
                      );
                    })}
                    <RowDivider />
                  </>
                )}

                {/* Flood */}
                {visible.has('flood') && (
                  <>
                    <RowLabel icon={Droplets} label="Flood Risk" />
                    {areas.map((a) => {
                      const risk = dataMap[a]?.data?.floodRisk;
                      return (
                        <div key={`flood-${a}`} className="py-4">
                          <span className={cn('text-sm font-bold', floodTextColor(risk))}>{floodLabel(risk)} risk</span>
                        </div>
                      );
                    })}
                    <RowDivider />
                  </>
                )}

                {/* Rent */}
                {visible.has('rent') && (
                  <>
                    <RowLabel icon={TrendingUp} label="Avg Rent" />
                    {areas.map((a) => (
                      <div key={`rent-${a}`} className="py-4">
                        <span className="text-sm font-bold text-[#0F172A]">
                          {formatRent(dataMap[a]?.data?.avgRentMin, dataMap[a]?.data?.avgRentMax)}
                        </span>
                      </div>
                    ))}
                    <RowDivider />
                  </>
                )}

                {/* Travel times */}
                {visible.has('travel') && hubs.map((hub, hubIdx) => (
                  <div key={hub.key} style={{ display: 'contents' }}>
                    <RowLabel icon={Car} label={hub.label} />
                    {areas.map((a) => {
                      const val = dataMap[a]?.data?.travelTimesToHubs?.[hub.key];
                      return (
                        <div key={`${hub.key}-${a}`} className="py-4">
                          <span className="text-sm font-bold text-[#0F172A] tabular-nums">{val != null ? `${val} min` : '—'}</span>
                        </div>
                      );
                    })}
                    {hubIdx === hubs.length - 1 && <RowDivider />}
                  </div>
                ))}

                {/* Data sources */}
                {visible.has('sources') && (
                  <>
                    <RowLabel icon={Database} label="Data Sources" />
                    {areas.map((a) => (
                      <div key={`sources-${a}`} className="py-4">
                        <span className="text-xs text-slate-500">{dataMap[a]?.data?.dataSources?.join(', ') || '—'}</span>
                      </div>
                    ))}
                    <RowDivider />
                  </>
                )}

                {/* Last updated */}
                {visible.has('updated') && (
                  <>
                    <RowLabel icon={Clock} label="Last Updated" />
                    {areas.map((a) => (
                      <div key={`updated-${a}`} className="py-4">
                        <span className="text-xs text-slate-500">
                          {dataMap[a]?.data?.lastUpdated ? timeAgo(dataMap[a]!.data!.lastUpdated) : '—'}
                        </span>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </PageWrapper>
    </div>
  );
}