import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Zap,
  Shield,
  Car,
  Droplets,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
  Bookmark,
  Share2,
  GitCompareArrows,
  FileDown,
  Search,
  Truck,
  Star,
  Quote,
  BadgeCheck,
  TrendingUp,
} from "lucide-react";
import { useNeighbourhood } from "../../hooks/useNeighbourhood";
import WaitlistForm from "../../components/neighbourhood/WaitlistForm";
import ResidentReportForm from "../../components/neighbourhood/ResidentReportForm";
import IntelligenceChat from "../../components/neighbourhood/IntelligenceChat";
import PageWrapper from "../../components/layout/PageWrapper";
import LoadingSpinner from "../../components/shared/LoadingSpinner";
import { cn, formatNaira } from "../../lib/utils";

// ─── Static reference data ────────────────────────────────────────────────────

const COMPARE_OPTIONS = [
  "Surulere",
  "Lekki Phase 1",
  "Ikeja",
  "Gbagada",
  "Ajah",
];

const SAMPLE_LISTINGS = [
  {
    id: "1",
    title: "Modern 3-Bedroom Apartment",
    price: 4500000,
    period: "yr",
    beds: 3,
    baths: 3,
    type: "Apartment",
    power: "22h",
    flood: "Low",
    safety: 8.0,
  },
  {
    id: "2",
    title: "4-Bedroom Gated Duplex",
    price: 8000000,
    period: "yr",
    beds: 4,
    baths: 4,
    type: "Duplex",
    power: "20h",
    flood: "Low",
    safety: 8.5,
  },
  {
    id: "3",
    title: "Premium Studio Apartment",
    price: 3800000,
    period: "yr",
    beds: 1,
    baths: 1,
    type: "Studio",
    power: "22h",
    flood: "Low",
    safety: 8.0,
  },
];

const RESIDENT_FEEDBACK = [
  {
    initials: "TO",
    name: "Tolu O.",
    tag: "Verified Resident",
    text: "The power reliability here is unmatched on the mainland. Perfect for my remote tech job, though Sobo traffic can be a pain at 5PM.",
  },
  {
    initials: "AJ",
    name: "Adesua J.",
    tag: "Investor",
    text: "Rental yields are solid. The influx of tech startups is driving up demand for high-quality 1-bed apartments.",
  },
];

const LIFE_PHOTOS = [
  "https://images.unsplash.com/photo-1577415124269-fc1140a69e91?w=300",
  "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=300",
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=300",
  "https://images.unsplash.com/photo-1542838132-92c53300491e?w=300",
];

const TOP_AGENTS = [
  {
    name: "Chinwe Obi",
    spec: "Mid-tier Luxury Apartments",
    rating: 4.9,
    reviews: 42,
  },
  {
    name: "Emeka Daniel",
    spec: "Real Estate Specialist",
    rating: 5.0,
    reviews: 28,
  },
  { name: "Fola Bakare", spec: "Relocation Housing", rating: 4.8, reviews: 65 },
];

// ─── Suitability bar ──────────────────────────────────────────────────────────

const SuitabilityBar = ({ label, score }: { label: string; score: number }) => (
  <div>
    <div className="flex items-center justify-between mb-1.5">
      <span className="text-xs text-white/70">{label}</span>
      <span className="text-xs font-bold text-white">{score.toFixed(1)}</span>
    </div>
    <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
      <div
        className="h-full rounded-full bg-[#00C9A7]"
        style={{ width: `${(score / 10) * 100}%` }}
      />
    </div>
  </div>
);

// ─── Dashboard stat card ──────────────────────────────────────────────────────

const DashboardStat = ({
  icon: Icon,
  label,
  value,
  sub,
  subColor = "text-slate-400",
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  subColor?: string;
}) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 mb-3">
      <Icon className="h-4 w-4 text-[#0A1628]" />
    </div>
    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
      {label}
    </p>
    <p className="text-2xl font-bold text-[#0F172A] mt-1">{value}</p>
    {sub && <p className={cn("text-xs mt-1", subColor)}>{sub}</p>}
  </div>
);

// ─── Listing card ─────────────────────────────────────────────────────────────

const ListingCard = ({
  listing,
}: {
  listing: (typeof SAMPLE_LISTINGS)[number];
}) => (
  <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
    <div className="h-36 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center relative">
      <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-[#00C9A7] px-2.5 py-1 text-[10px] font-bold text-[#0A1628]">
        <BadgeCheck className="h-3 w-3" /> Verified Listing
      </span>
      <Bookmark className="absolute top-3 right-3 h-4 w-4 text-white drop-shadow" />
    </div>
    <div className="p-4">
      <p className="font-bold text-[#0F172A] text-sm">{listing.title}</p>
      <p className="text-[#00C9A7] font-bold text-sm mt-0.5">
        {formatNaira(listing.price)}/{listing.period}
      </p>
      <p className="text-xs text-slate-400 mt-1">
        {listing.beds} Beds · {listing.baths} Baths · {listing.type}
      </p>
      <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-100">
        <div className="text-center">
          <p className="text-[9px] text-slate-400 uppercase">Power</p>
          <p className="text-xs font-bold text-[#0F172A]">{listing.power}</p>
        </div>
        <div className="text-center">
          <p className="text-[9px] text-slate-400 uppercase">Flood</p>
          <p className="text-xs font-bold text-[#00C9A7]">{listing.flood}</p>
        </div>
        <div className="text-center">
          <p className="text-[9px] text-slate-400 uppercase">Safety</p>
          <p className="text-xs font-bold text-[#0F172A]">{listing.safety}</p>
        </div>
      </div>
      <button className="w-full mt-3 rounded-lg border border-slate-200 py-2 text-xs font-semibold text-[#0A1628] hover:border-[#00C9A7] hover:text-[#00C9A7] transition-colors">
        View Property Details
      </button>
    </div>
  </div>
);

// ─── Not found state ──────────────────────────────────────────────────────────

const AreaNotFound = ({ areaName }: { areaName: string }) => (
  <PageWrapper className="py-16">
    <Link
      to="/neighbourhood"
      className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-[#0F172A] transition-colors mb-8"
    >
      <ArrowLeft className="h-4 w-4" /> Back to Neighbourhoods
    </Link>
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
        We haven't collected verified intelligence for this area yet. Join the
        waitlist to be notified, or be the first to share what you know.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <WaitlistForm defaultArea={areaName} />
        <ResidentReportForm defaultArea={areaName} />
      </div>
    </div>
  </PageWrapper>
);

// ─── Main page ────────────────────────────────────────────────────────────────

export default function NeighbourhoodDetailPage() {
  const { areaName } = useParams<{ areaName: string }>();
  const decoded = decodeURIComponent(areaName ?? "");

  const [compareB, setCompareB] = useState("Surulere");
  const [budget, setBudget] = useState("");
  const [workLocation, setWorkLocation] = useState("");

  const { data, isLoading, isError } = useNeighbourhood(decoded);
  const area = data?.data?.area;
  const waitlist = (data as any)?.data?.waitlistCount;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner label={`Loading ${decoded}…`} />
      </div>
    );
  }

  if (isError || !area) return <AreaNotFound areaName={decoded} />;

  const floodLabel = area.floodRisk
    ? area.floodRisk.charAt(0).toUpperCase() + area.floodRisk.slice(1)
    : "—";

  const rent =
    area.avgRentMin && area.avgRentMax
      ? `${formatNaira(area.avgRentMin)} – ${formatNaira(area.avgRentMax)} / yr`
      : null;

  const confidenceMap: Record<
    string,
    { label: string; bg: string; text: string }
  > = {
    low: {
      label: "Low confidence",
      bg: "bg-red-500/10 border-red-400/20",
      text: "text-red-300",
    },
    medium: {
      label: "Medium confidence",
      bg: "bg-amber-500/10 border-amber-400/20",
      text: "text-amber-300",
    },
    high: {
      label: "High confidence",
      bg: "bg-[#00C9A7]/10 border-[#00C9A7]/25",
      text: "text-[#00C9A7]",
    },
  };
  const confidence = confidenceMap[area.dataConfidence];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <div className="relative min-h-[95vh] flex flex-col justify-end overflow-hidden bg-[#0A1628]">
        {area.imageUrl && (
          <img
            src={area.imageUrl}
            alt={area.areaName}
            className="absolute inset-0 h-full w-full object-cover scale-105"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628] via-[#0A1628]/55 to-[#0A1628]/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A1628]/40 via-transparent to-transparent" />
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-[#00C9A7]/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 h-64 w-64 rounded-full bg-[#00C9A7]/5 blur-3xl pointer-events-none" />

        <PageWrapper className="relative z-10 w-full pb-12 pt-28">
          <Link
            to="/neighbourhood"
            className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors mb-10"
          >
            <ArrowLeft className="h-4 w-4" /> All Neighbourhoods
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="h-4 w-4 text-[#00C9A7]" />
                <span className="text-sm text-slate-300 tracking-wide">
                  Lagos, Nigeria
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.05] tracking-tight">
                {area.areaName}
              </h1>
              <div className="flex flex-wrap items-center gap-3 mt-5">
                {rent && (
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 px-4 py-2">
                    <TrendingUp className="h-3.5 w-3.5 text-[#00C9A7]" />
                    <span className="text-sm text-white/85 font-medium">
                      {rent}
                    </span>
                  </div>
                )}
                {area.propertiesCount != null && (
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 px-4 py-2">
                    <span className="text-sm text-white/85 font-medium">
                      {area.propertiesCount.toLocaleString()} active listings
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end gap-3 shrink-0">
              {area.overallScore != null && (
                <div className="flex flex-col items-center justify-center h-24 w-24 rounded-full border-2 border-[#00C9A7]/50 bg-white/5 backdrop-blur-sm shadow-[0_0_30px_rgba(0,201,167,0.15)]">
                  <span className="text-3xl font-bold text-[#00C9A7] leading-none">
                    {area.overallScore.toFixed(1)}
                  </span>
                  <span className="text-[9px] text-slate-300 uppercase tracking-widest mt-1">
                    Overall
                  </span>
                </div>
              )}
              <span
                className={cn(
                  "rounded-full border backdrop-blur-sm px-3 py-1.5 text-xs font-semibold",
                  confidence.bg,
                  confidence.text,
                )}
              >
                {confidence.label}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5 mt-10">
            <Link
              to={`/neighbourhood/compare?a=${encodeURIComponent(area.areaName)}&b=${encodeURIComponent(compareB)}`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 backdrop-blur-sm border border-white/15 px-4 py-2.5 text-xs font-semibold text-white hover:bg-white/15 transition-colors"
            >
              <GitCompareArrows className="h-3.5 w-3.5" /> Compare
            </Link>
            <button className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 backdrop-blur-sm border border-white/15 px-4 py-2.5 text-xs font-semibold text-white hover:bg-white/15 transition-colors">
              <Bookmark className="h-3.5 w-3.5" /> Save Area
            </button>
            <button className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 backdrop-blur-sm border border-white/15 px-4 py-2.5 text-xs font-semibold text-white hover:bg-white/15 transition-colors">
              <Share2 className="h-3.5 w-3.5" /> Share Report
            </button>
          </div>
        </PageWrapper>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
          <div className="h-9 w-5 rounded-full border-2 border-white/25 flex items-start justify-center p-1">
            <div className="h-1.5 w-1.5 rounded-full bg-white/60 animate-bounce" />
          </div>
        </div>
      </div>

      <PageWrapper className="py-10 space-y-10">
        {/* ── About + Suitability ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-5 w-5 rounded-full bg-[#00C9A7]/10 flex items-center justify-center">
                <span className="text-[10px] text-[#00C9A7]">i</span>
              </div>
              <h2 className="text-sm font-bold text-[#0F172A]">
                About This Area
              </h2>
            </div>
            {area.description && (
              <div className="rounded-xl bg-[#00C9A7]/5 border-l-4 border-[#00C9A7] px-4 py-3 mb-4">
                <Quote className="h-3.5 w-3.5 text-[#00C9A7] mb-1" />
                <p className="text-sm text-slate-600 italic leading-relaxed">
                  {area.description}
                </p>
                <p className="text-xs text-[#00C9A7] font-semibold mt-2">
                  — KhenX AI Insight
                </p>
              </div>
            )}
            <p className="text-sm text-slate-500 leading-relaxed">
              Known for its central proximity, {area.areaName} has become a hub
              for young professionals, students, and real estate investors —
              offering a strategic gateway between the mainland and key business
              districts.
            </p>
          </div>

          <div className="rounded-2xl bg-[#0A1628] p-6">
            <h2 className="text-sm font-bold text-white mb-5">
              Suitability Analysis
            </h2>
            <div className="space-y-4">
              <SuitabilityBar label="Young Professionals" score={9.5} />
              <SuitabilityBar label="Students" score={9.8} />
              <SuitabilityBar label="Real Estate Investors" score={8.5} />
            </div>
            <button className="w-full mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-[#00C9A7] py-2.5 text-xs font-bold text-[#0A1628]">
              <FileDown className="h-3.5 w-3.5" /> Download PDF Report
            </button>
          </div>
        </div>

        {/* ── Intelligence Dashboard ───────────────────────────────────────── */}
        <div>
          <h2 className="text-lg font-bold text-[#0F172A] mb-4">
            Intelligence Dashboard
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <DashboardStat
              icon={Zap}
              label="Power Stability"
              value={
                area.powerAvgHoursDaily != null
                  ? `${area.powerAvgHoursDaily} hrs/day`
                  : "—"
              }
              sub="+4% vs last month"
              subColor="text-[#00C9A7]"
            />
            <DashboardStat
              icon={Droplets}
              label="Flood Risk"
              value={floodLabel}
              sub="Optimised drainage network"
              subColor="text-[#00C9A7]"
            />
            <DashboardStat
              icon={Shield}
              label="Safety Index"
              value={
                area.securityScore != null
                  ? `${area.securityScore.toFixed(1)}/10`
                  : "—"
              }
              sub="3 Private patrol zones"
            />
            <DashboardStat
              icon={Car}
              label="Peak Commute"
              value={
                area.travelTimesToHubs?.victoriaIsland != null
                  ? `${area.travelTimesToHubs.victoriaIsland} min to Island`
                  : "—"
              }
              sub="High traffic (8AM–10AM)"
              subColor="text-amber-500"
            />
          </div>
        </div>

        {/* ── AI Intelligence Suite ────────────────────────────────────────── */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#00C9A7] mb-1">
            Powered by KhenX Intelligence
          </p>
          <h2 className="text-2xl font-bold text-[#0F172A] mb-1">
            AI Intelligence Suite
          </h2>
          <p className="text-sm text-slate-500 mb-6">
            Get real-time answers based on verified data, resident reports, and
            live listings — all from one chat.
          </p>

          {/* ── Intelligence Chat (replaces TalkToAdvisor) ──────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* LEFT — the chat */}
            <div className="flex flex-col">
              <IntelligenceChat areaName={area.areaName} />
            </div>

            {/* RIGHT — Compare + Recommendations (unchanged) */}
            <div className="space-y-6">
              {/* Compare Areas */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <GitCompareArrows className="h-4 w-4 text-[#00C9A7]" />
                  <p className="text-sm font-bold text-[#0F172A]">
                    Compare Areas
                  </p>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="flex-1 rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-center text-[#0F172A]">
                    {area.areaName}
                  </span>
                  <span className="text-xs font-bold text-slate-400">VS</span>
                  <select
                    value={compareB}
                    onChange={(e) => setCompareB(e.target.value)}
                    className="flex-1 rounded-lg border border-slate-200 px-2 py-2 text-xs font-semibold text-center focus:outline-none focus:border-[#00C9A7]"
                  >
                    {COMPARE_OPTIONS.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-400">Power Stability</span>
                    <div className="flex gap-6">
                      <span className="font-bold text-[#00C9A7]">22h/day</span>
                      <span className="font-bold text-slate-400">14h/day</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-400">Security Score</span>
                    <div className="flex gap-6">
                      <span className="font-bold text-[#0F172A]">8.0/10</span>
                      <span className="font-bold text-slate-400">7.2/10</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-slate-400">Avg 2BR Rent</span>
                    <div className="flex gap-6">
                      <span className="font-bold text-[#0F172A]">₦2.5M</span>
                      <span className="font-bold text-slate-400">₦2.2M</span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 rounded-lg bg-[#00C9A7]/5 px-3 py-2">
                  <p className="text-[11px] text-slate-600">
                    <strong className="text-[#00C9A7]">AI Summary:</strong>{" "}
                    {area.areaName} offers better infrastructure for remote
                    work, while {compareB} is more central for mainland social
                    life.
                  </p>
                </div>
                <Link
                  to={`/neighbourhood/compare?a=${encodeURIComponent(area.areaName)}&b=${encodeURIComponent(compareB)}`}
                  className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#0A1628] py-2.5 text-xs font-bold text-white"
                >
                  Full Comparison <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {/* Personalized Recommendations */}
              <div className="rounded-2xl bg-[#0A1628] p-5">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="h-4 w-4 text-[#00C9A7]" />
                  <p className="text-sm font-bold text-white">
                    Personalized Area Recommendations
                  </p>
                </div>
                <div className="space-y-3 mb-4">
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase tracking-wide mb-1 block">
                      Your Budget (Annual)
                    </label>
                    <input
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      placeholder="e.g. 1.5M – 3M"
                      className="w-full rounded-lg bg-white/10 border border-white/15 px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#00C9A7]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase tracking-wide mb-1 block">
                      Workplace Location
                    </label>
                    <input
                      value={workLocation}
                      onChange={(e) => setWorkLocation(e.target.value)}
                      placeholder="e.g. Victoria Island"
                      className="w-full rounded-lg bg-white/10 border border-white/15 px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#00C9A7]"
                    />
                  </div>
                </div>
                <div className="rounded-xl bg-white/5 border border-white/10 p-3.5 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-0.5">
                      Top Match for You
                    </p>
                    <p className="text-sm font-bold text-white">
                      Maryland, Lagos
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      35-min commute to VI and fits 2.5M budget for a luxury
                      1-bed
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-[#00C9A7]/15 px-2.5 py-1 text-[10px] font-bold text-[#00C9A7]">
                    92% Match
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Generate Report + AI Property Discovery ──────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-[#0F172A] mb-4">
              Generate Area Report
            </p>
            <div className="rounded-xl border border-dashed border-slate-200 p-5 text-center mb-4">
              <FileDown className="h-6 w-6 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-600">
                {area.areaName} Full Intel Report 2024
              </p>
              <p className="text-[11px] text-slate-400">
                Power, Security, Traffic & Flood Analysis
              </p>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 rounded-lg border border-slate-200 py-2 text-xs font-semibold text-[#0A1628] hover:border-[#00C9A7]">
                Preview
              </button>
              <button className="flex-1 rounded-lg bg-[#0A1628] py-2 text-xs font-semibold text-white">
                PDF Report
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-[#0F172A] mb-4">
              AI Property Discovery
            </p>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                placeholder="e.g. Show me 3-bed under 2M with good power"
                className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-2.5 text-xs focus:outline-none focus:border-[#00C9A7]"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg border border-slate-200 p-2.5">
                <p className="text-[11px] font-semibold text-[#0F172A]">
                  Herbert Macaulay Apt
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  85M · 24hr Power Match
                </p>
              </div>
              <div className="rounded-lg border border-dashed border-slate-200 flex items-center justify-center text-[10px] text-slate-300">
                More matches
              </div>
            </div>
          </div>
        </div>

        {/* ── Relocation Assistant Banner ──────────────────────────────────── */}
        <div className="rounded-2xl bg-slate-100 border border-slate-200 p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#00C9A7]/15">
              <Truck className="h-5 w-5 text-[#00C9A7]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-[#0F172A]">
                  AI Relocation Assistant
                </p>
                <span className="rounded-full bg-amber-100 text-amber-700 text-[9px] font-bold px-2 py-0.5">
                  COMING SOON
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Full-service automated moving, packing, and internet setup
                specialized for tech hubs.
              </p>
            </div>
          </div>
          <button className="shrink-0 rounded-lg bg-white border border-slate-200 px-4 py-2 text-xs font-semibold text-[#0A1628]">
            Join Waitlist
          </button>
        </div>

        {/* ── Listings row ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {SAMPLE_LISTINGS.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>

        {/* ── Market snapshot ──────────────────────────────────────────────── */}
        <div className="rounded-2xl bg-[#0A1628] p-6">
          <div className="grid grid-cols-3 gap-4 text-center sm:text-left">
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest">
                Avg. Rent (3BR)
              </p>
              <p className="text-lg font-bold text-white mt-1">₦4.2M</p>
              <p className="text-[10px] text-[#00C9A7] mt-0.5">+12% YoY</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest">
                Rental Demand
              </p>
              <p className="text-lg font-bold text-white mt-1">9.4/10</p>
              <p className="text-[10px] text-[#00C9A7] mt-0.5">High Velocity</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest">
                Active Listings
              </p>
              <p className="text-lg font-bold text-white mt-1">
                {area.propertiesCount ?? 142}
              </p>
              <p className="text-[10px] text-[#00C9A7] mt-0.5">85% Verified</p>
            </div>
          </div>
          <p className="text-center mt-4 text-xs font-semibold text-[#00C9A7]">
            {area.areaName} Market Snapshot
          </p>
        </div>

        {/* ── Resident Feedback ────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold text-[#0F172A] mb-5">
            Resident Feedback
          </p>
          <div className="space-y-5">
            {RESIDENT_FEEDBACK.map((f) => (
              <div key={f.name} className="flex gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                  {f.initials}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-[#0F172A]">
                      {f.name}
                    </p>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-[#00C9A7]" />{" "}
                      {f.tag}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                    {f.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── CTA Banner ───────────────────────────────────────────────────── */}
        <div className="rounded-2xl bg-[#0A1628] p-10 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">
            Before You Pay, Know The Area
          </h2>
          <p className="text-slate-400 text-sm mb-6">
            Access deep intelligence on every property listing in{" "}
            {area.areaName}.
          </p>
          <Link
            to="/listings"
            className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-bold text-[#0A1628]"
          >
            Browse All {area.areaName} Properties
          </Link>
        </div>

        {/* ── Life in Area + Flood Intel ───────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <p className="text-sm font-bold text-[#0F172A] mb-4">
              Life in {area.areaName}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {LIFE_PHOTOS.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt=""
                  className="rounded-xl h-28 w-full object-cover"
                />
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-bold text-[#0F172A]">
                Flood & Drainage Intel
              </p>
              <span className="rounded-full bg-[#00C9A7]/10 text-[#00C9A7] text-[10px] font-bold px-2.5 py-1">
                {floodLabel} Risk
              </span>
            </div>
            <div className="h-40 rounded-xl bg-gradient-to-br from-blue-50 via-slate-50 to-green-50 flex items-center justify-center relative overflow-hidden">
              <Droplets className="h-10 w-10 text-slate-300" />
              <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-[10px] font-semibold text-red-500 bg-white/80 rounded-full px-2 py-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500" /> High
                Risk
              </div>
              <div className="absolute bottom-3 right-3 flex items-center gap-1.5 text-[10px] font-semibold text-[#00C9A7] bg-white/80 rounded-full px-2 py-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#00C9A7]" />{" "}
                Drainage Optimal
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Map visualization based on historical rain data (2018–2024) and
              municipal drainage path analysis.
            </p>
          </div>
        </div>

        {/* ── Top Verified Agents ──────────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-bold text-[#0F172A]">
              Top Verified Agents in {area.areaName}
            </p>
            <Link
              to="/agents"
              className="text-xs font-semibold text-[#00C9A7] hover:underline flex items-center gap-1"
            >
              View All <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {TOP_AGENTS.map((agent) => (
              <div
                key={agent.name}
                className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="h-12 w-12 rounded-full bg-[#0A1628] flex items-center justify-center text-sm font-bold text-[#00C9A7]">
                  {agent.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#0F172A]">
                    {agent.name}
                  </p>
                  <p className="text-xs text-slate-400">{agent.spec}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-semibold text-[#0F172A]">
                      {agent.rating}
                    </span>
                    <span className="text-xs text-slate-400">
                      ({agent.reviews} reviews)
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Low-confidence prompt ────────────────────────────────────────── */}
        {area.dataConfidence === "low" && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
            <div className="flex items-start gap-3 mb-5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <p className="font-semibold text-amber-900">
                  Limited data for {area.areaName}
                </p>
                <p className="text-sm text-amber-700 mt-0.5">
                  Help improve these scores by sharing what you know about this
                  area.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <WaitlistForm defaultArea={area.areaName} />
              <ResidentReportForm defaultArea={area.areaName} />
            </div>
          </div>
        )}
      </PageWrapper>
    </div>
  );
}
