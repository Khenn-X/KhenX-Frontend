import {
  MapPin, Clock, Database, ArrowUpRight,
  Zap, Shield, Car, Droplets, AlertTriangle,
  TrendingUp, Users, CheckCircle2, XCircle, MinusCircle,
} from 'lucide-react';
import type { INeighbourhoodIntelligence } from '../../types/neighbourhood.types';
import { timeAgo, cn } from '../../lib/utils';

interface IntelligenceCardProps {
  data: INeighbourhoodIntelligence;
  className?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const scoreColor = (s?: number | null) =>
  s == null ? 'text-slate-400' : s >= 7.5 ? 'text-[#00C9A7]' : s >= 5 ? 'text-amber-400' : 'text-red-400';

const scoreBg = (s?: number | null) =>
  s == null ? 'bg-white/10' : s >= 7.5 ? 'bg-[#00C9A7]/15' : s >= 5 ? 'bg-amber-400/15' : 'bg-red-400/15';

const scoreBorder = (s?: number | null) =>
  s == null ? 'border-white/10' : s >= 7.5 ? 'border-[#00C9A7]/30' : s >= 5 ? 'border-amber-400/30' : 'border-red-400/30';

const floodConfig = {
  low:    { label: 'Low Risk',    icon: CheckCircle2,  color: 'text-[#00C9A7]', bg: 'bg-[#00C9A7]/15 border-[#00C9A7]/30' },
  medium: { label: 'Medium Risk', icon: MinusCircle,   color: 'text-amber-400', bg: 'bg-amber-400/15 border-amber-400/30' },
  high:   { label: 'High Risk',   icon: XCircle,       color: 'text-red-400',   bg: 'bg-red-400/15 border-red-400/30'     },
};

const confidenceDot = {
  low:    'bg-red-400',
  medium: 'bg-amber-400',
  high:   'bg-[#00C9A7]',
};

const formatRent = (min?: number | null, max?: number | null) => {
  if (!min || !max) return null;
  const fmt = (n: number) =>
    n >= 1_000_000 ? `₦${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
    : `₦${Math.round(n / 1_000)}K`;
  return `${fmt(min)} – ${fmt(max)}/yr`;
};

// ─── Score pill ───────────────────────────────────────────────────────────────

const ScorePill = ({
  icon: Icon,
  label,
  score,
  sub,
}: {
  icon: React.ElementType;
  label: string;
  score?: number | null;
  sub?: string;
}) => (
  <div className={cn(
    'flex flex-col gap-1 rounded-xl border px-3 py-2.5',
    scoreBg(score), scoreBorder(score)
  )}>
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1.5">
        <Icon className={cn('h-3.5 w-3.5', scoreColor(score))} />
        <span className="text-[11px] font-semibold text-white/70 uppercase tracking-wide">{label}</span>
      </div>
      <span className={cn('text-base font-bold tabular-nums', scoreColor(score))}>
        {score != null ? score.toFixed(1) : '—'}
      </span>
    </div>
    {/* mini bar */}
    <div className="h-0.5 w-full rounded-full bg-white/10">
      <div
        className={cn('h-full rounded-full', score == null ? '' : score >= 7.5 ? 'bg-[#00C9A7]' : score >= 5 ? 'bg-amber-400' : 'bg-red-400')}
        style={{ width: score != null ? `${(score / 10) * 100}%` : '0%' }}
      />
    </div>
    {sub && <p className="text-[10px] text-white/40 leading-tight">{sub}</p>}
  </div>
);

// ─── Travel chip ──────────────────────────────────────────────────────────────

const TravelChip = ({ label, minutes }: { label: string; minutes?: number | null }) => (
  <div className="flex items-center justify-between rounded-lg bg-white/8 border border-white/10 px-2.5 py-1.5">
    <span className="text-[10px] text-white/50">{label}</span>
    <span className="text-[11px] font-bold text-white">
      {minutes != null ? `${minutes}m` : '—'}
    </span>
  </div>
);

// ─── Empty state ──────────────────────────────────────────────────────────────

const EmptyState = ({ areaName }: { areaName: string }) => (
  <div className="relative rounded-2xl overflow-hidden min-h-[340px] bg-[#0A1628]">
    {/* Subtle grid pattern */}
    <div
      className="absolute inset-0 opacity-5"
      style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px)`,
        backgroundSize: '40px 40px',
      }}
    />

    <div className="relative z-10 flex flex-col items-center justify-center h-full min-h-[340px] px-8 text-center">
      <div className="relative mb-6">
        <div className="h-20 w-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
          <MapPin className="h-8 w-8 text-slate-500" />
        </div>
        <span className="absolute -top-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-amber-500/20 border border-amber-500/30">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
        </span>
      </div>

      <h3 className="text-xl font-bold text-white mb-2">
        No data for <span className="text-[#00C9A7]">{areaName}</span> yet
      </h3>
      <p className="text-sm text-slate-400 max-w-xs leading-relaxed mb-8">
        We're collecting verified intelligence for this area. Be the first to contribute.
      </p>

      <div className="grid grid-cols-4 gap-3 w-full max-w-sm mb-2">
        {[
          { icon: Zap,      label: 'Power'    },
          { icon: Droplets, label: 'Flood'    },
          { icon: Shield,   label: 'Security' },
          { icon: Car,      label: 'Commute'  },
        ].map(({ icon: Icon, label }) => (
          <div key={label} className="flex flex-col items-center gap-1.5 rounded-xl border border-dashed border-white/10 bg-white/3 py-3">
            <Icon className="h-4 w-4 text-slate-600" />
            <span className="text-[10px] text-slate-600 font-medium">{label}</span>
            <span className="text-sm font-bold text-slate-700">—</span>
          </div>
        ))}
      </div>
      <p className="text-[11px] text-slate-600">Data collection in progress</p>
    </div>
  </div>
);

// ─── Main card ────────────────────────────────────────────────────────────────

const IntelligenceCard = ({ data, className }: IntelligenceCardProps) => {
  const flood  = data.floodRisk ? floodConfig[data.floodRisk] : null;
  const rent   = formatRent(data.avgRentMin, data.avgRentMax);

  const hasAnyScore =
    data.powerScore    != null ||
    data.floodRisk     != null ||
    data.securityScore != null ||
    data.commuteScore  != null;

  const hasTravelTimes =
    data.travelTimesToHubs &&
    Object.values(data.travelTimesToHubs).some((v) => v != null);

  if (!hasAnyScore) return <EmptyState areaName={data.areaName} />;

  return (
    <div className={cn('relative rounded-2xl overflow-hidden shadow-xl', className)}>

      {/* ── Hero image ──────────────────────────────────────────────────── */}
      <div className="relative">
        <img
          src={data.imageUrl || '/images/area-placeholder.jpg'}
          alt={data.areaName}
          className="w-full h-56 sm:h-64 object-cover"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = '/images/area-placeholder.jpg';
          }}
        />

        {/* Dark overlay so text is readable */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/70" />

        {/* Top row: location + overall score */}
        <div className="absolute top-0 inset-x-0 p-4 flex items-start justify-between">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-black/30 backdrop-blur border border-white/10 px-3 py-1.5">
            <MapPin className="h-3 w-3 text-[#00C9A7]" />
            <span className="text-xs font-semibold text-white">{data.areaName}</span>
            <span className="text-xs text-slate-400">· Lagos</span>
          </div>

          {data.overallScore != null && (
            <div className="flex flex-col items-center justify-center h-12 w-12 rounded-full bg-black/40 backdrop-blur border-2 border-[#00C9A7]/50">
              <span className="text-base font-bold text-[#00C9A7] leading-none">
                {data.overallScore.toFixed(1)}
              </span>
              <span className="text-[8px] text-slate-400 uppercase tracking-wide">Score</span>
            </div>
          )}
        </div>

        {/* Bottom of image: name + rent + confidence */}
        <div className="absolute bottom-0 inset-x-0 p-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-white leading-tight">{data.areaName}</h2>
              {rent && (
                <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-white/10 backdrop-blur border border-white/15 px-2.5 py-1">
                  <TrendingUp className="h-3 w-3 text-[#00C9A7]" />
                  <span className="text-xs text-white/80 font-medium">{rent}</span>
                </div>
              )}
            </div>

            {/* Confidence + report count */}
            <div className="flex flex-col items-end gap-1 shrink-0">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-black/30 backdrop-blur border border-white/10 px-2.5 py-1">
                <span className={cn('h-1.5 w-1.5 rounded-full', confidenceDot[data.dataConfidence])} />
                <span className="text-[10px] font-semibold text-white/70 capitalize">
                  {data.dataConfidence} confidence
                </span>
              </div>
              {data.totalReportsUsed != null && (
                <div className="inline-flex items-center gap-1 text-[10px] text-white/40">
                  <Users className="h-2.5 w-2.5" />
                  {data.totalReportsUsed} reports
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Intelligence body ────────────────────────────────────────────── */}
      <div className="bg-[#0A1628]">

        {/* Score pills grid */}
        <div className="px-4 pt-4 pb-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
          <ScorePill icon={Zap}   label="Power"    score={data.powerScore}
            sub={data.powerAvgHoursDaily != null ? `~${data.powerAvgHoursDaily}h/day` : undefined} />
          <ScorePill icon={Shield} label="Security" score={data.securityScore} />
          <ScorePill icon={Car}    label="Commute"  score={data.commuteScore} />

          {/* Flood risk pill */}
          {flood ? (
            <div className={cn('flex flex-col gap-1.5 rounded-xl border px-3 py-2.5', flood.bg)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Droplets className={cn('h-3.5 w-3.5', flood.color)} />
                  <span className="text-[11px] font-semibold text-white/70 uppercase tracking-wide">Flood</span>
                </div>
                <flood.icon className={cn('h-4 w-4', flood.color)} />
              </div>
              <p className={cn('text-xs font-bold', flood.color)}>{flood.label}</p>
              {data.floodNotes && (
                <p className="text-[10px] text-white/40 leading-tight line-clamp-2">{data.floodNotes}</p>
              )}
            </div>
          ) : (
            <ScorePill icon={Droplets} label="Flood" score={null} />
          )}
        </div>

        {/* Travel times */}
        {hasTravelTimes && (
          <div className="px-4 pb-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-2">
              Commute to hubs
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              <TravelChip label="Victoria Island" minutes={data.travelTimesToHubs?.victoriaIsland} />
              <TravelChip label="Ikeja"           minutes={data.travelTimesToHubs?.ikeja} />
              <TravelChip label="Lekki"           minutes={data.travelTimesToHubs?.lekki} />
              <TravelChip label="Maryland"        minutes={data.travelTimesToHubs?.maryland} />
            </div>
          </div>
        )}

        {/* Notes */}
        {data.notes && (
          <div className="px-4 pb-3 border-t border-white/5 pt-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-1">
              Intelligence Notes
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">{data.notes}</p>
          </div>
        )}

        {/* Active listings */}
        {data.propertiesCount != null && (
          <div className="mx-4 mb-3 flex items-center justify-between rounded-xl bg-white/4 border border-white/8 px-3 py-2">
            <span className="text-xs text-slate-400">Active verified listings</span>
            <span className="text-sm font-bold text-white">{data.propertiesCount.toLocaleString()}</span>
          </div>
        )}

        {/* Footer: metadata + CTA */}
        <div className="border-t border-white/8 px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            {data.lastUpdated && (
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                <Clock className="h-3 w-3" />
                Updated {timeAgo(data.lastUpdated)}
              </div>
            )}
            {data.dataSources?.length > 0 && (
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                <Database className="h-3 w-3" />
                {data.dataSources.join(', ')}
              </div>
            )}
          </div>

          <a
            href={`/neighbourhoods/${encodeURIComponent(data.areaName)}`}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#00C9A7] px-4 py-2 text-xs font-bold text-[#0A1628] hover:bg-[#00b396] transition-colors self-start sm:self-auto shrink-0"
          >
            Full neighbourhood profile
            <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </div>

      </div>
    </div>
  );
};

export default IntelligenceCard;