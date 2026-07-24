import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  MapPin,
  ShieldCheck,
  // Zap,
  // Droplets,
  Star,
} from "lucide-react";
import { useListings } from "../../hooks/useListings";
import NaturalSearchBar from "../../components/search/NaturalSearchBar";
import ListingCard from "../../components/listings/ListingCard";
import LoadingSpinner from "../../components/shared/LoadingSpinner";
import PageWrapper from "../../components/layout/PageWrapper";
import { ROUTES } from "../../constants/routes";
import StatsBar from "../../components/home/StatsBar";
import QuickDiscovery from "../../components/home/QuickDiscovery";
import NeighbourhoodGrid from "../../components/home/NeighbourhoodGrid";
import MarketInsights from "../../components/home/MarketInsights";
import AgentGrid from "../../components/home/AgentGrid";
import NewsGrid from "../../components/home/NewsGrid";
import FAQAccordion from "../../components/home/FAQAccordion";
import SubscribeBar from "../../components/home/SubscribeBar";
import NextGenSearch from "@/components/home/NextGenSearch";
import hero from "../../assets/download.jfif";

// ─── Hero ─────────────────────────────────────────────────────────────────────
const Hero = () => {
  const navigate = useNavigate();
  return (
    <section className="relative z-10 overflow-hidden pt-20 pb-28 px-4">
      {/* Background */}
      <div className="absolute inset-0 bg-[#0A1628]" />
      <div
        className="absolute inset-0 bg-cover bg-center opacity-40"
        style={{ backgroundImage: `url(${hero})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0A1628] via-[#0A1628]/95 to-[#0A1628]/60" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628] via-transparent to-[#0A1628]/60" />

      {/* Ambient glow behind the intelligence card */}
      <div className="absolute top-1/3 right-[8%] h-72 w-72 rounded-full bg-[#00C9A7]/10 blur-[100px]" />

      <PageWrapper className="relative z-10">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-16 items-center">
          {/* ── Left: copy ── */}
          <div className="text-left">
            <div className="inline-flex items-center gap-2 mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00C9A7]" />
              <span className="text-xs font-semibold text-[#00C9A7] uppercase tracking-[0.2em]">
                Lagos neighbourhood intelligence
              </span>
            </div>

            <h1 className="text-5xl sm:text-6xl font-bold text-white leading-[1.08] tracking-tight">
              Before you pay,
              <br />
              <span className="text-[#00C9A7]">know the area.</span>
            </h1>

            <p className="mt-6 text-slate-300 text-lg leading-relaxed max-w-md">
              Every listing on KhenX comes with a verified read on the
              neighbourhood — power supply, flood risk, security, commute —
              so you find out what a place is really like before you commit
              to it.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <button
                onClick={() => navigate(ROUTES.LISTINGS)}
                className="inline-flex items-center gap-2 rounded-lg bg-[#00C9A7] px-7 py-3.5 font-semibold text-[#0A1628] transition-transform hover:scale-[1.03] hover:bg-[#00E0BA] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00C9A7]"
              >
                Browse listings
                <ArrowRight className="h-4 w-4" />
              </button>
              <span className="text-sm text-slate-400">
                No account needed to look around
              </span>
            </div>

            {/* Trust badges */}
            <div className="mt-12 flex flex-wrap gap-x-8 gap-y-3 text-sm text-slate-400">
              {[
                { icon: ShieldCheck, label: "Verified agents" },
                { icon: MapPin, label: "Lagos-focused" },
                { icon: Star, label: "Neighbourhood data" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <Icon className="h-4 w-4 text-[#00C9A7]" />
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: hero image + floating intelligence card ── */}
          <div className="relative hidden lg:block">
            <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
              <img
                src={hero}
                alt="A Lagos neighbourhood street"
                className="w-full h-[420px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628]/60 via-transparent to-transparent" />
            </div>

            {/* Pin marker on the image, tethering the card to a location */}
            <div className="absolute top-[38%] left-[42%]">
              <span className="absolute inline-flex h-3 w-3 rounded-full bg-[#00C9A7] animate-ping" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-[#00C9A7] ring-4 ring-[#00C9A7]/20" />
            </div>

            {/* The signature element: a live-feeling intelligence card */}
            <div className="absolute -bottom-8 -left-8 w-72 rounded-xl bg-[#0F1F35]/95 backdrop-blur-md border border-white/10 shadow-2xl p-5 animate-[fadeUp_0.6s_ease-out]">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                  Lekki Phase 1
                </span>
                <span className="flex items-center gap-1.5 text-[10px] font-semibold text-[#00C9A7] uppercase tracking-wide">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-[#00C9A7] animate-ping" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#00C9A7]" />
                  </span>
                  Live
                </span>
              </div>

              <div className="space-y-3">
                {[
                  { label: "Power supply", value: "92%", color: "#F5B155" },
                  { label: "Flood risk", value: "Low", color: "#5B9BD5" },
                  { label: "Security", value: "8.4 / 10", color: "#00C9A7" },
                  { label: "Commute to Island", value: "24 min", color: "#A78BFA" },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: row.color }}
                      />
                      <span className="text-xs text-slate-300">{row.label}</span>
                    </div>
                    <span className="text-xs font-semibold text-white">
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </PageWrapper>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
};
// ─── Featured listings ─────────────────────────────────────────────────────────
const FeaturedListings = () => {
  const { data, isLoading } = useListings({ limit: 8 });
  const listings = Array.isArray(data?.data) ? data.data : [];

  return (
    <section className="py-16">
      <PageWrapper>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-[#0F172A]">
              Latest properties
            </h2>
            <p className="text-slate-500 mt-1 text-sm">
              Freshly listed across Lagos
            </p>
          </div>
          <Link
            to={ROUTES.LISTINGS}
            className="flex items-center gap-1.5 text-sm font-semibold text-[#00C9A7] hover:underline"
          >
            View all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {isLoading ? (
          <LoadingSpinner label="Loading listings..." className="py-16" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {listings.map((listing) => (
              <ListingCard key={listing._id} listing={listing} />
            ))}
          </div>
        )}
      </PageWrapper>
    </section>
  );
};

// ─── How it works ──────────────────────────────────────────────────────────────
const HowItWorks = () => {
  const steps = [
    {
      step: "01",
      title: "Search naturally",
      desc: "Type what you want in plain English. Our AI understands bedrooms, area, budget, and features all at once.",
    },
    {
      step: "02",
      title: "Check the area",
      desc: "Every listing shows neighbourhood intelligence — power supply, flood risk, security and commute score before you contact anyone.",
    },
    {
      step: "03",
      title: "Contact verified agents",
      desc: "Every agent on KhenX is KYC-verified. Send an enquiry directly — no middlemen, no mystery fees.",
    },
  ];

  return (
    <section className="py-16 bg-slate-50">
      <PageWrapper>
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-[#0F172A]">How KhenX works</h2>
          <p className="mt-2 text-slate-500 text-sm">
            Three steps to finding a home you can trust
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {steps.map(({ step, title, desc }) => (
            <div key={step} className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0A1628]">
                <span className="text-lg font-bold text-[#00C9A7]">{step}</span>
              </div>
              <h3 className="font-semibold text-[#0F172A] mb-2">{title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </PageWrapper>
    </section>
  );
};

// ─── CTA ──────────────────────────────────────────────────────────────────────
const CTA = () => (
  <section className="py-16 px-4">
    <PageWrapper>
      <div className="relative overflow-hidden rounded-2xl bg-[#0A1628] px-8 py-14 text-center">
        {/* Ambient glow — top-right, echoes the teal accent without a literal image */}
        <div
          className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-[#00C9A7]/20 blur-3xl pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-[#00C9A7]/10 blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        <div className="relative">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Ready to find your next home in Lagos?
          </h2>
          <p className="mt-3 text-slate-400 max-w-md mx-auto text-sm leading-relaxed">
            Join thousands of Lagosians who check KhenX before they pay.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to={ROUTES.LISTINGS}
              className="w-full sm:w-auto rounded-lg bg-[#00C9A7] px-7 py-3 text-sm font-semibold text-[#0A1628] hover:bg-[#00b396] transition-colors"
            >
              Browse properties
            </Link>
            <Link
              to={ROUTES.SIGNUP}
              className="w-full sm:w-auto rounded-lg border border-white/20 px-7 py-3 text-sm font-semibold text-white hover:bg-white/5 transition-colors"
            >
              Create free account
            </Link>
          </div>

          <p className="mt-6 text-xs text-slate-500">
            No credit card required — browsing and basic listings are always
            free.
          </p>
        </div>
      </div>
    </PageWrapper>
  </section>
);
// ─── Page ─────────────────────────────────────────────────────────────────────
const HomePage = () => (
  <div>
    <Hero />
    <StatsBar />
    <QuickDiscovery />
    <NextGenSearch />
    <FeaturedListings />
    {/* <IntelligenceTeaser /> */}
    <NeighbourhoodGrid />
    <MarketInsights />
    <HowItWorks />
    <AgentGrid />
    <NewsGrid />
    <FAQAccordion />
    <SubscribeBar />
    <CTA />
  </div>
);

export default HomePage;
