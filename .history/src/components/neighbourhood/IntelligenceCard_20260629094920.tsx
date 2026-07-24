import { MapPin, Clock, Database, ArrowUpRight, Zap, Shield, Car, Droplets, AlertTriangle, TrendingUp, Users } from 'lucide-react';
import type { INeighbourhoodIntelligence } from '../../types/neighbourhood.types';
import ScoreBadge from './ScoreBadge';
import FloodRiskBadge from './FloodRiskBadge';
import { timeAgo, cn } from '../../lib/utils';

interface IntelligenceCardProps {
  data: INeighbourhoodIntelligence;
  className?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const confidenceConfig = {
  low:    { label: 'Low confidence',    bar: 'w-1/3',  color: 'bg-red-400',     text: 'text-red-600',     bg: 'bg-red-50 border-red-200'     },
  medium: { label: 'Medium confidence', bar: 'w-2/3',  color: 'bg-amber-400',   text: 'text-amber-600',   bg: 'bg-amber-50 border-amber-200'  },
  high:   { label: 'High confidence',   bar: 'w-full', color: 'bg-[#00C9A7]',   text: 'text-[#00C9A7]',   bg: 'bg-[#00C9A7]/5 border-[#00C9A7]/20' },
};

const floodColors = {
  low:    { pill: 'bg-[#00C9A7]/10 text-[#00C9A7]',  dot: 'bg-[#00C9A7]',  label: 'Low Risk'    },
  medium: { pill: 'bg-amber-100 text-amber-700',       dot: 'bg-amber-400',  label: 'Medium Risk' },
  high:   { pill: 'bg-red-100 text-red-600',           dot: 'bg-red-500',    label: 'High Risk'   },
};

const formatRent = (min?: number | null, max?: number | null) => {
  if (!min || !max) return null;
  const fmt = (n: number) =>
    n >= 1_000_000 ? `₦${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
    : n >= 1_000   ? `₦${Math.round(n / 1_000)}K`
    : `₦${n}`;
  return `${fmt(min)} – ${fmt(max)} / yr`;
};

// ─── Score meter bar ──────────────────────────────────────────────────────────

const ScoreMeter = ({
  icon: Icon,
  label,
  score,
  sub,
}: {
  icon: React.ElementType;
  label: string;
  score?: number | null;
  sub?: string;
}) => {
  const pct = score != null ? (score / 10) * 100 : 0;
  const color =
    score == null    ? 'bg-slate-200'   :
    score >= 7.5     ? 'bg-[#00C9A7]'  :
    score >= 5       ? 'bg-amber-400'   :
                       'bg-red-400';
  const textColor =
    score == null    ? 'text-slate-400' :
    score >= 7.5     ? 'text-[#00C9A7]':
    score >= 5       ? 'text-amber-500' :
                       'text-red-500';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Icon className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-xs font-medium text-slate-500">{label}</span>
        </div>
        <span className={cn('text-sm font-bold tabular-nums', textColor)}>
          {score != null ? `${score.toFixed(1)}/10` : '—'}
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all', color)}
          style={{ width: `${pct}%` }}
        />
      </div>
      {sub && <p className="text-[10px] text-slate-400">{sub}</p>}
    </div>
  );
};

// ─── Travel time chip ─────────────────────────────────────────────────────────

const TravelChip = ({ label, minutes }: { label: string; minutes?: number | null }) => (
  <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
    <span className="text-xs text-slate-500">{label}</span>
    <span className="text-xs font-semibold text-[#0F172A]">
      {minutes != null ? `${minutes} min` : '—'}
    </span>
  </div>
);

// ─── Empty state ──────────────────────────────────────────────────────────────

const EmptyState = ({ areaName }: { areaName: string }) => (
  <div className="rounded-2xl border border-dashed border-slate-200 bg-white overflow-hidden">
    {/* Top accent */}
    <div className="h-1 w-full bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200" />

    <div className="px-6 py-12 text-center">
      {/* Icon cluster */}
      <div className="relative inline-flex items-center justify-center mb-6">
        <div className="h-20 w-20 rounded-full bg-slate-100 flex items-center justify-center">
          <MapPin className="h-8 w-8 text-slate-300" />
        </div>
        <span className="absolute -top-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 border-2 border-white">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
        </span>
      </div>

      <h3 className="text-lg font-bold text-[#0F172A]">
        No data for <span className="text-[#00C9A7]">{areaName}</span> yet
      </h3>
      <p className="mt-2 text-sm text-slate-400 max-w-xs mx-auto leading-relaxed">
        We're working on collecting verified intelligence for this area.
        Be the first to contribute — it helps everyone.
      </p>

      {/* Data points we'll eventually show */}
      <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-md mx-auto">
        {[
          { icon: Zap,      label: 'Power Supply'  },
          { icon: Droplets, label: 'Flood Risk'     },
          { icon: Shield,   label: 'Security'       },
          { icon: Car,      label: 'Commute'        },
        ].map(({ icon: Icon, label }) => (
          <div key={label} className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-3 flex flex-col items-center gap-1.5">
            <Icon className="h-4 w-4 text-slate-300" />
            <span className="text-[10px] font-medium text-slate-400">{label}</span>
            <span className="text-xs font-bold text-slate-300">—</span>
          </div>
        ))}
      </div>

      <div className="mt-3 text-xs text-slate-400">
        Data collection in progress for this neighbourhood
      </div>
    </div>
  </div>
);

// ─── Main card ────────────────────────────────────────────────────────────────

const IntelligenceCard = ({ data, className }: IntelligenceCardProps) => {
  const confidence = confidenceConfig[data.dataConfidence];
  const flood      = data.floodRisk ? floodColors[data.floodRisk] : null;
  const rent       = formatRent(data.avgRentMin, data.avgRentMax);

  const hasAnyScore =
    data.powerScore     != null ||
    data.floodRisk      != null ||
    data.securityScore  != null ||
    data.commuteScore   != null;

  const hasTravelTimes = data.travelTimesToHubs &&
    Object.values(data.travelTimesToHubs).some((v) => v != null);

  // Empty state
  if (!hasAnyScore) {
    return <EmptyState areaName={data.areaName} />;
  }

  return (
    <div className={cn('rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm', className)}>

      {/* ── Top accent bar ───────────────────────────────────────────────── */}
      <div className="h-1 w-full bg-gradient-to-r from-[#0A1628] via-[#00C9A7] to-[#0A1628]" />

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="bg-[#0A1628] px-6 py-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="h-4 w-4 text-[#00C9A7]" />
              <h2 className="text-xl font-bold text-white">{data.areaName}</h2>
            </div>
            <p className="text-sm text-slate-400">Lagos, Nigeria</p>

            {/* Rent range */}
            {rent && (
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/8 border border-white/10 px-3 py-1">
                <TrendingUp className="h-3 w-3 text-[#00C9A7]" />
                <span className="text-xs text-slate-300 font-medium">{rent}</span>
              </div>
            )}
          </div>

          <div className="flex flex-col items-end gap-2 shrink-0">
            {/* Overall score badge */}
            {data.overallScore != null && (
              <div className="flex flex-col items-center justify-center h-14 w-14 rounded-full border-2 border-[#00C9A7]/40 bg-[#00C9A7]/10">
                <span className="text-lg font-bold text-[#00C9A7] leading-none">
                  {data.overallScore.toFixed(1)}
                </span>
                <span className="text-[9px] text-slate-400 uppercase tracking-wide">Score</span>
              </div>
            )}
            {/* Confidence badge */}
            <span className={cn('rounded-full border px-2.5 py-1 text-xs font-semibold', confidence.bg, confidence.text)}>
              {confidence.label}
            </span>
          </div>
        </div>

        {/* Confidence bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-slate-500 uppercase tracking-wide">Data confidence</span>
            {data.totalReportsUsed != null && (
              <span className="text-[10px] text-slate-500 flex items-center gap-1">
                <Users className="h-2.5 w-2.5" />
                {data.totalReportsUsed} reports used
              </span>
            )}
          </div>
          <div className="h-1 w-full rounded-full bg-white/10">
            <div className={cn('h-full rounded-full transition-all', confidence.color, confidence.bar)} />
          </div>
        </div>
      </div>

      {/* ── Score meters ─────────────────────────────────────────────────── */}
      <div className="px-6 py-6 space-y-4 border-b border-slate-100">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">
          Intelligence Scores
        </p>
        <ScoreMeter
          icon={Zap}
          label="Power Supply"
          score={data.powerScore}
          sub={data.powerAvgHoursDaily != null ? `~${data.powerAvgHoursDaily}h NEPA daily average` : undefined}
        />
        <ScoreMeter
          icon={Shield}
          label="Security"
          score={data.securityScore}
        />
        <ScoreMeter
          icon={Car}
          label="Commute Access"
          score={data.commuteScore}
        />

        {/* Flood risk — custom treatment */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Droplets className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-xs font-medium text-slate-500">Flood Risk</span>
            </div>
            {flood ? (
              <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold', flood.pill)}>
                <span className={cn('h-1.5 w-1.5 rounded-full', flood.dot)} />
                {flood.label}
              </span>
            ) : (
              <span className="text-sm font-bold text-slate-400">—</span>
            )}
          </div>
          {data.floodNotes && (
            <p className="text-[11px] text-slate-400 pl-5 leading-relaxed">{data.floodNotes}</p>
          )}
        </div>
      </div>

      {/* ── Travel times ─────────────────────────────────────────────────── */}
      {hasTravelTimes && (
        <div className="px-6 py-5 border-b border-slate-100">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">
            Commute Times to Key Hubs
          </p>
          <div className="grid grid-cols-2 gap-2">
            <TravelChip label="Victoria Island" minutes={data.travelTimesToHubs?.victoriaIsland} />
            <TravelChip label="Ikeja"           minutes={data.travelTimesToHubs?.ikeja} />
            <TravelChip label="Lekki"           minutes={data.travelTimesToHubs?.lekki} />
            <TravelChip label="Maryland"        minutes={data.travelTimesToHubs?.maryland} />
          </div>
        </div>
      )}

      {/* ── Notes ────────────────────────────────────────────────────────── */}
      {data.notes && (
        <div className="px-6 py-4 border-b border-slate-100">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1.5">
            Intelligence Notes
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">{data.notes}</p>
        </div>
      )}

      {/* ── Properties count ─────────────────────────────────────────────── */}
      {data.propertiesCount != null && (
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <span className="text-sm text-slate-500">Active verified listings</span>
          <span className="text-sm font-bold text-[#0F172A]">{data.propertiesCount.toLocaleString()} properties</span>
        </div>
      )}

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <div className="bg-slate-50 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex flex-wrap items-center gap-4">
          {data.lastUpdated && (
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Clock className="h-3.5 w-3.5" />
              Updated {timeAgo(data.lastUpdated)}
            </div>
          )}
          {data.dataSources?.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Database className="h-3.5 w-3.5" />
              {data.dataSources.join(', ')}
            </div>
          )}
        </div>

        {/* View full detail page */}
        <a
          href={`/neighbourhoods/${encodeURIComponent(data.areaName)}`}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#0A1628] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0A1628]/90 transition-colors self-start sm:self-auto"
        >
          Full neighbourhood profile
          <ArrowUpRight className="h-3.5 w-3.5" />
        </a>
      </div>

    </div>
  );
};

export default IntelligenceCard;