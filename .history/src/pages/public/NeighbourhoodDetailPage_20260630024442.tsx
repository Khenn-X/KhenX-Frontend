import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Zap, Shield, Car, Droplets,
  Clock, Database, Users, TrendingUp, AlertTriangle,
  CheckCircle2, XCircle, MinusCircle, ArrowUpRight,
} from 'lucide-react';
import { useNeighbourhood } from '../../hooks/useNeighbourhood';
import WaitlistForm from '../../components/neighbourhood/WaitlistForm';
import ResidentReportForm from '../../components/neighbourhood/ResidentReportForm';
import PageWrapper from '../../components/layout/PageWrapper';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { timeAgo, cn } from '../../lib/utils';
import type { INeighbourhoodIntelligence } from '../../types/neighbourhood.types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const scoreColor = (s?: number | null) =>
  s == null ? 'text-slate-400' : s >= 7.5 ? 'text-[#00C9A7]' : s >= 5 ? 'text-amber-400' : 'text-red-400';

const barColor = (s?: number | null) =>
  s == null ? 'bg-slate-200' : s >= 7.5 ? 'bg-[#00C9A7]' : s >= 5 ? 'bg-amber-400' : 'bg-red-400';

const floodConfig = {
  low:    { label: 'Low Risk',    Icon: CheckCircle2, color: 'text-[#00C9A7]', pill: 'bg-[#00C9A7]/10 border-[#00C9A7]/20 text-[#00C9A7]' },
  medium: { label: 'Medium Risk', Icon: MinusCircle,  color: 'text-amber-400', pill: 'bg-amber-50 border-amber-200 text-amber-700'         },
  high:   { label: 'High Risk',   Icon: XCircle,      color: 'text-red-400',   pill: 'bg-red-50 border-red-200 text-red-600'                },
};

const confidenceMap = {
  low:    { label: 'Low confidence',    bar: 'w-1/3',  color: 'bg-red-400',   text: 'text-red-600',   bg: 'bg-red-50 border-red-200'        },
  medium: { label: 'Medium confidence', bar: 'w-2/3',  color: 'bg-amber-400', text: 'text-amber-600', bg: 'bg-amber-50 border-amber-200'     },
  high:   { label: 'High confidence',   bar: 'w-full', color: 'bg-[#00C9A7]', text: 'text-[#00C9A7]', bg: 'bg-[#00C9A7]/5 border-[#00C9A7]/20' },
};

const formatRent = (min?: number | null, max?: number | null) => {
  if (!min || !max) return null;
  const fmt = (n: number) =>
    n >= 1_000_000 ? `₦${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M` : `₦${Math.round(n / 1_000)}K`;
  return `${fmt(min)} – ${fmt(max)} / yr`;
};

// ─── Score row ────────────────────────────────────────────────────────────────

const ScoreRow = ({
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
  <div className="flex items-center gap-4 py-4 border-b border-slate-100 last:border-0">
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50">
      <Icon className={cn('h-5 w-5', scoreColor(score))} />
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-semibold text-[#0F172A]">{label}</span>
        <span className={cn('text-lg font-bold tabular-nums', scoreColor(score))}>
          {score != null ? `${score.toFixed(1)}/10` : '—'}
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all', barColor(score))}
          style={{ width: score != null ? `${(score / 10) * 100}%` : '0%' }}
        />
      </div>
      {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
    </div>
  </div>
);

// ─── Travel time row ─────────────────────────────────────────────────────────

const TravelRow = ({ label, minutes }: { label: string; minutes?: number | null }) => (
  <div className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0">
    <div className="flex items-center gap-2">
      <div className="h-2 w-2 rounded-full bg-[#00C9A7]" />
      <span className="text-sm text-slate-600">{label}</span>
    </div>
    <span className="text-sm font-bold text-[#0F172A]">
      {minutes != null ? `${minutes} min` : '—'}
    </span>
  </div>
);

// ─── Not found state ──────────────────────────────────────────────────────────

const AreaNotFound = ({ areaName }: { areaName: string }) => (
  <div className="min-h-screen bg-slate-50">
    <div className="bg-[#0A1628] py-12">
      <PageWrapper>
        <Link to="/neighbourhood" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Neighbourhoods
        </Link>
      </PageWrapper>
    </div>
    <PageWrapper className="py-16">
      <div className="max-w-lg mx-auto text-center">
        <div className="relative inline-flex mb-6">
          <div className="h-20 w-20 rounded-full bg-slate-100 flex items-center justify-center">
            <MapPin className="h-8 w-8 text-slate-300" />
          </div>
          <span className="absolute -top-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 border-2 border-white">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
          </span>
        </div>
        <h2 className="text-2xl font-bold text-[#0F172A] mb-2">
          No data for <span className="text-[#00C9A7]">{areaName}</span> yet
        </h2>
        <p className="text-slate-500 text-sm mb-8 leading-relaxed">
          We haven't collected verified intelligence for this area yet.
          Join the waitlist to be notified, or be the first to share what you know.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <WaitlistForm defaultArea={areaName} />
          <ResidentReportForm defaultArea={areaName} />
        </div>
      </div>
    </PageWrapper>
  </div>
);

// ─── Main page ────────────────────────────────────────────────────────────────

export default function NeighbourhoodDetailPage() {
  const { areaName } = useParams<{ areaName: string }>();
  const decoded = decodeURIComponent(areaName ?? '');

  const { data, isLoading, isError } = useNeighbourhood(decoded);
  const area       = data?.data?.area;
  const waitlist   = (data as any)?.data?.waitlistCount;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <LoadingSpinner label={`Loading ${decoded}…`} />
      </div>
    );
  }

  if (isError || !area) return <AreaNotFound areaName={decoded} />;

  const confidence = confidenceMap[area.dataConfidence];
  const flood      = area.floodRisk ? floodConfig[area.floodRisk] : null;
  const rent       = formatRent(area.avgRentMin, area.avgRentMax);

  const hasTravelTimes =
    area.travelTimesToHubs &&
    Object.values(area.travelTimesToHubs).some((v) => v != null);

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div className="relative h-72 sm:h-96 bg-[#0A1628] overflow-hidden">
        {area.imageUrl && (
          <img
            src={area.imageUrl}
            alt={area.areaName}
            className="absolute inset-0 h-full w-full object-cover opacity-40"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628] via-[#0A1628]/60 to-transparent" />

        <PageWrapper className="relative z-10 h-full flex flex-col justify-end pb-8">
          <Link
            to="/neighbourhood"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-6 self-start"
          >
            <ArrowLeft className="h-4 w-4" /> All Neighbourhoods
          </Link>

          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-4 w-4 text-[#00C9A7]" />
                <span className="text-sm text-slate-400">Lagos, Nigeria</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
                {area.areaName}
              </h1>
              {rent && (
                <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/15 px-3 py-1.5">
                  <TrendingUp className="h-3.5 w-3.5 text-[#00C9A7]" />
                  <span className="text-sm text-white/80 font-medium">{rent}</span>
                </div>
              )}
            </div>

            <div className="flex flex-col items-end gap-2 shrink-0">
              {area.overallScore != null && (
                <div className="flex flex-col items-center justify-center h-16 w-16 rounded-full border-2 border-[#00C9A7]/50 bg-[#00C9A7]/10">
                  <span className="text-xl font-bold text-[#00C9A7] leading-none">
                    {area.overallScore.toFixed(1)}
                  </span>
                  <span className="text-[9px] text-slate-400 uppercase tracking-wide mt-0.5">Score</span>
                </div>
              )}
              <span className={cn('rounded-full border px-2.5 py-1 text-xs font-semibold', confidence.bg, confidence.text)}>
                {confidence.label}
              </span>
            </div>
          </div>
        </PageWrapper>
      </div>

      {/* ── Body ──────────────────────────────────────────────────────────── */}
      <PageWrapper className="py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Left column (main) ──────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Description */}
            {area.description && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-3">About</h2>
                <p className="text-slate-600 leading-relaxed">{area.description}</p>
              </div>
            )}

            {/* Intelligence scores */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-1">
                Intelligence Scores
              </h2>
              <p className="text-xs text-slate-400 mb-4">Verified data from {area.totalReportsUsed ?? 0} community reports</p>

              <ScoreRow
                icon={Zap}
                label="Power Supply"
                score={area.powerScore}
                sub={area.powerAvgHoursDaily != null ? `~${area.powerAvgHoursDaily} hours of NEPA daily` : undefined}
              />
              <ScoreRow icon={Shield} label="Security" score={area.securityScore} />
              <ScoreRow icon={Car}    label="Commute Access" score={area.commuteScore} />

              {/* Flood risk */}
              <div className="flex items-center gap-4 pt-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50">
                  <Droplets className={cn('h-5 w-5', flood ? flood.color : 'text-slate-400')} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-[#0F172A]">Flood Risk</span>
                    {flood ? (
                      <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold', flood.pill)}>
                        <flood.Icon className="h-3 w-3" />
                        {flood.label}
                      </span>
                    ) : (
                      <span className="text-slate-400 text-sm font-bold">—</span>
                    )}
                  </div>
                  {area.floodNotes && (
                    <p className="text-xs text-slate-400 leading-relaxed">{area.floodNotes}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Commute times */}
            {hasTravelTimes && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">
                  Commute Times to Key Hubs
                </h2>
                <TravelRow label="Victoria Island" minutes={area.travelTimesToHubs?.victoriaIsland} />
                <TravelRow label="Ikeja"           minutes={area.travelTimesToHubs?.ikeja} />
                <TravelRow label="Lekki"           minutes={area.travelTimesToHubs?.lekki} />
                <TravelRow label="Maryland"        minutes={area.travelTimesToHubs?.maryland} />
              </div>
            )}

            {/* Notes */}
            {area.notes && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-3">
                  Intelligence Notes
                </h2>
                <p className="text-slate-600 leading-relaxed text-sm">{area.notes}</p>
              </div>
            )}

            {/* Low confidence — invite contributions */}
            {area.dataConfidence === 'low' && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
                <div className="flex items-start gap-3 mb-5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-amber-900">Limited data for {area.areaName}</p>
                    <p className="text-sm text-amber-700 mt-0.5">
                      Help improve these scores by sharing what you know about this area.
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <WaitlistForm defaultArea={area.areaName} />
                  <ResidentReportForm defaultArea={area.areaName} />
                </div>
              </div>
            )}
          </div>

          {/* ── Right column (sidebar) ──────────────────────────────────── */}
          <div className="space-y-5">

            {/* Quick stats */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                {area.propertiesCount != null && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">Active listings</span>
                    <span className="text-sm font-bold text-[#0F172A]">{area.propertiesCount.toLocaleString()}</span>
                  </div>
                )}
                {area.totalReportsUsed != null && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">Reports used</span>
                    <span className="text-sm font-bold text-[#0F172A]">{area.totalReportsUsed}</span>
                  </div>
                )}
                {waitlist != null && waitlist > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">On waitlist</span>
                    <div className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5 text-[#00C9A7]" />
                      <span className="text-sm font-bold text-[#0F172A]">{waitlist}</span>
                    </div>
                  </div>
                )}
                {area.lastUpdated && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">Last updated</span>
                    <div className="flex items-center gap-1 text-sm text-slate-500">
                      <Clock className="h-3.5 w-3.5" />
                      {timeAgo(area.lastUpdated)}
                    </div>
                  </div>
                )}
                {area.dataSources?.length > 0 && (
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm text-slate-500 shrink-0">Sources</span>
                    <div className="flex items-center gap-1 text-right">
                      <Database className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="text-xs text-slate-400">{area.dataSources.join(', ')}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Compare CTA */}
            <div className="rounded-2xl border border-[#00C9A7]/20 bg-[#00C9A7]/5 p-5">
              <h3 className="text-sm font-bold text-[#0F172A] mb-1">Compare this area</h3>
              <p className="text-xs text-slate-500 mb-4">See how {area.areaName} stacks up against another neighbourhood.</p>
              <Link
                to={`/neighbourhood/compare?a=${encodeURIComponent(area.areaName)}&b=Lekki`}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#0A1628] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#0A1628]/90 transition-colors w-full justify-center"
              >
                Compare neighbourhoods
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Contribute */}
            {area.dataConfidence !== 'low' && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <h3 className="text-sm font-bold text-[#0F172A] mb-1">Live here?</h3>
                <p className="text-xs text-slate-500 mb-4">
                  Share what you know about {area.areaName} and help improve these scores for future residents.
                </p>
                <ResidentReportForm defaultArea={area.areaName} />
              </div>
            )}
          </div>

        </div>
      </PageWrapper>
    </div>
  );
}