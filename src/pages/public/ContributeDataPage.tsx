import { useState } from 'react';
import {
  Zap, Droplets, Shield, CheckCircle,
  ArrowRight, Database, Clock, MapPin,
  Waves, Route, Wifi, ChevronDown,
} from 'lucide-react';
import logo from '../../assets/kgreen.png';
import ResidentReportForm from '../../components/neighbourhood/ResidentReportForm';
import WaitlistForm from '../../components/neighbourhood/WaitlistForm';
import PageWrapper from '../../components/layout/PageWrapper';
import { cn } from '../../lib/utils';

// What we collect, why it matters, and what it means for the person reading the score
const DATA_POINTS = [
  {
    icon: Zap,
    color: 'text-amber-400',
    title: 'Power supply',
    ask:   'On average, how many hours of electricity does your area get each day?',
    why:   'It is the number one question Lagos renters ask, and the hardest to get an honest answer to. Light decides how much you spend on fuel, whether you can work from home, and how comfortable daily life is.',
    helps: ['Estimate real monthly energy costs', 'Compare areas by actual supply', 'Avoid areas that rarely get light'],
  },
  {
    icon: Droplets,
    color: 'text-blue-400',
    title: 'Flood history',
    ask:   'Did your area flood during the last rainy season?',
    why:   'Agents almost never disclose flooding, so people usually discover it after moving in. It affects damaged belongings, blocked roads and repair costs.',
    helps: ['Spot flood-prone streets before renting', 'Plan ahead for the rainy season', 'Avoid expensive surprises after moving in'],
  },
  {
    icon: Shield,
    color: 'text-green-400',
    title: 'Security rating',
    ask:   'How safe do you feel in your neighbourhood?',
    why:   'Safety shapes everything from when you can get home to where you can park. We only collect a general community rating, with no personal details and no incident specifics.',
    helps: ['Get a general sense of how safe an area feels', 'Compare neighbourhoods side by side', 'Decide with more confidence'],
  },
  {
    icon: Waves,
    color: 'text-cyan-400',
    title: 'Water supply',
    ask:   'How reliable is water in your area, from the tap, borehole or other sources?',
    why:   'Running water is easy to assume and expensive to replace. Areas without reliable supply mean buying water, running pumps and planning your week around it.',
    helps: ['Estimate extra monthly water costs', 'Check if a borehole is really needed', 'Avoid areas with constant shortages'],
  },
  {
    icon: Route,
    color: 'text-violet-400',
    title: 'Roads and traffic',
    ask:   'What are the roads like, and how bad is traffic getting in and out of your area?',
    why:   'A home that looks close on the map can mean hours in traffic every day. Bad roads also affect how easily you get home during the rainy season.',
    helps: ['Judge the real daily commute', 'Spot areas with poor access', 'Choose a location that fits your routine'],
  },
  {
    icon: Wifi,
    color: 'text-indigo-400',
    title: 'Internet and network',
    ask:   'How strong and reliable are internet and mobile network where you live?',
    why:   'For remote workers, students and small businesses, a weak connection can be a dealbreaker. Providers differ a lot from one street to the next.',
    helps: ['Check if an area suits remote work', 'See which providers work well locally', 'Avoid paying for service that does not deliver'],
  },
];

// How submitted data is processed
const PROCESS_STEPS = [
  {
    icon: Users,
    title: 'Community submits reports',
    desc:  'Residents across Lagos fill in the form below — power, water, flooding, security, roads and internet for their specific area.',
  },
  {
    icon: Database,
    title: 'Reports are reviewed and verified',
    desc:  'Our data team cross-references submissions against satellite data, DisCo records, and other sources before accepting them.',
  },
  {
    icon: Clock,
    title: 'Scores are calculated and published',
    desc:  'Verified reports are processed into neighbourhood scores. The more reports for an area, the more confident and accurate the score.',
  },
  {
    icon: MapPin,
    title: 'Seekers make better decisions',
    desc:  'Future renters and buyers in Lagos see these scores before contacting any agent — and make decisions they won\'t regret.',
  },
];

// Areas that currently have limited data and need more reports
const AREAS_NEEDING_DATA = [
  'Festac', 'Isale Eko', 'Ikorodu', 'Ketu',
  'Mushin', 'Oshodi', 'Shomolu', 'Ojota',
];

type DataPoint = (typeof DATA_POINTS)[number];

const DataPointCard = ({ point }: { point: DataPoint }) => {
  const [open, setOpen] = useState(false);
  const { icon: Icon, color, title, ask, why, helps } = point;

  return (
    <div className="rounded-2xl border border-white/15 bg-white/[0.07] p-5 shadow-lg shadow-black/10 backdrop-blur-xl transition-colors hover:bg-white/10">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/10">
          <Icon className={cn('h-5 w-5', color)} />
        </div>
        <p className="font-semibold text-white">{title}</p>
      </div>

      <p className="mt-4 text-sm text-slate-300 leading-snug">{ask}</p>

      {/* Expandable details */}
      <div
        className={cn(
          'grid transition-[grid-template-rows] duration-300 ease-out',
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        )}
      >
        <div className="overflow-hidden">
          <div className="pt-4">
            <p className="text-xs font-semibold text-slate-400 mb-1">Why it matters</p>
            <p className="text-sm text-slate-300 leading-relaxed mb-4">{why}</p>

            <p className="text-xs font-semibold text-slate-400 mb-2">It helps people</p>
            <ul className="space-y-2">
              {helps.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <CheckCircle className="h-3.5 w-3.5 text-[#00C9A7] shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-300 leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="mt-4 inline-flex items-center gap-1.5 rounded text-xs font-medium text-[#00C9A7] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00C9A7]"
      >
        {open ? 'Show less' : 'Read more'}
        <ChevronDown className={cn('h-3.5 w-3.5 transition-transform duration-300', open && 'rotate-180')} />
      </button>
    </div>
  );
};

const ContributeDataPage = () => {
  const [activeTab, setActiveTab] = useState<'report' | 'waitlist'>('report');

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="bg-[#0A1628] pb-16 pt-14">
        <PageWrapper>
          <div className="max-w-2xl mx-auto text-center">

            <div className="inline-flex items-center gap-2 rounded-full bg-[#00C9A7]/10 border border-[#00C9A7]/20 px-4 py-1.5 mb-5">
              <img src={logo} alt="KhenX logo" className="h-5 w-5 object-contain" />
              <span className="text-xs font-semibold text-[#00C9A7] uppercase tracking-wide">
                Community Data Contribution
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
              Help your community.{' '}
              <span className="text-[#00C9A7]">Share what you know.</span>
            </h1>

            <p className="mt-4 text-slate-300 leading-relaxed max-w-xl mx-auto">
              KhenX is a neighbourhood intelligence platform for Lagos. We turn real
              reports from residents into clear scores for power, flooding and
              security, so renters and buyers can see what an area is really like
              before they commit.
            </p>

            <p className="mt-3 text-slate-400 leading-relaxed max-w-xl mx-auto">
              Agents rarely share these things, so people usually find out after
              they have paid. Your report is what changes that for the next person.
              Please answer honestly, because every report feeds a score someone
              will use to decide where to live.
            </p>

            <a
              href="#submit-report"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#00C9A7] px-5 py-2.5 text-sm font-semibold text-[#0A1628] hover:bg-[#00C9A7]/90 transition-colors"
            >
              Submit your report
              <ArrowRight className="h-4 w-4" />
            </a>

            {/* Impact statement */}
            <div className="mt-8 grid grid-cols-3 gap-4 max-w-sm mx-auto">
              {[
                { value: '100%', label: 'Anonymous' },
                { value: 'Verified', label: 'Before use' },
                { value: 'Free', label: 'Always' },
              ].map(({ value, label }) => (
                <div key={label} className="rounded-xl bg-white/5 border border-white/10 p-3">
                  <p className="text-base font-bold text-[#00C9A7]">{value}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </PageWrapper>
      </section>

      <PageWrapper className="py-14 space-y-14">

        {/* ── WHY YOUR DATA MATTERS ─────────────────────────────── */}
        <section className="relative overflow-hidden rounded-3xl bg-[#0A1628] px-6 py-10 sm:px-10">
          {/* Colour blobs behind the glass cards */}
          <div aria-hidden className="pointer-events-none absolute -top-24 -left-20 h-72 w-72 rounded-full bg-[#00C9A7]/30 blur-3xl" />
          <div aria-hidden className="pointer-events-none absolute top-1/3 -right-24 h-72 w-72 rounded-full bg-blue-500/25 blur-3xl" />
          <div aria-hidden className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl" />

          <div className="relative">
            <div className="text-center mb-8">
              <h2 className="text-xl font-bold text-white">
                What you tell us, and what it means for others
              </h2>
              <p className="text-sm text-slate-400 mt-1.5 max-w-lg mx-auto">
                Each answer becomes part of a neighbourhood score. Tap any card to
                see why it matters and how it helps the next renter or buyer.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 items-start">
              {DATA_POINTS.map((point) => (
                <DataPointCard key={point.title} point={point} />
              ))}
            </div>
          </div>
        </section>

        {/* ── MAIN FORM SECTION ────────────────────────────────── */}
        <section id="submit-report" className="scroll-mt-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-[#0F172A]">Submit your report</h2>
              <p className="text-sm text-slate-500 mt-0.5">
                Takes less than 2 minutes. Completely anonymous.
              </p>
            </div>

            {/* Tab switcher */}
            <div className="hidden sm:flex rounded-lg border border-slate-200 bg-white p-1 gap-1">
              <button
                onClick={() => setActiveTab('report')}
                className={cn(
                  'rounded-md px-4 py-1.5 text-sm font-medium transition-colors',
                  activeTab === 'report'
                    ? 'bg-[#0A1628] text-white'
                    : 'text-slate-500 hover:text-slate-700'
                )}
              >
                Submit data
              </button>
              <button
                onClick={() => setActiveTab('waitlist')}
                className={cn(
                  'rounded-md px-4 py-1.5 text-sm font-medium transition-colors',
                  activeTab === 'waitlist'
                    ? 'bg-[#0A1628] text-white'
                    : 'text-slate-500 hover:text-slate-700'
                )}
              >
                Get notified
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

            {/* Form — takes more space */}
            <div className="lg:col-span-3">
              {activeTab === 'report' ? (
                <ResidentReportForm />
              ) : (
                <WaitlistForm />
              )}

              {/* Mobile tab switcher */}
              <div className="mt-4 sm:hidden">
                <button
                  onClick={() =>
                    setActiveTab(activeTab === 'report' ? 'waitlist' : 'report')
                  }
                  className="text-sm text-[#00C9A7] font-medium hover:underline"
                >
                  {activeTab === 'report'
                    ? 'Rather get notified when data is ready? →'
                    : '← Submit your own data report'}
                </button>
              </div>
            </div>

            {/* Sidebar — areas needing data + trust notes */}
            <div className="lg:col-span-2 space-y-5">

              {/* Areas needing reports */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Database className="h-4 w-4 text-[#00C9A7]" />
                  <p className="font-semibold text-[#0F172A] text-sm">
                    Areas that need your help most
                  </p>
                </div>
                <p className="text-xs text-slate-400 mb-3">
                  These areas have limited data. If you live here, your report has the highest impact.
                </p>
                <div className="flex flex-wrap gap-2">
                  {AREAS_NEEDING_DATA.map((area) => (
                    <span
                      key={area}
                      className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-1 text-xs font-medium text-amber-700"
                    >
                      <MapPin className="h-2.5 w-2.5" />
                      {area}
                    </span>
                  ))}
                </div>
              </div>

              {/* Trust commitments */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="font-semibold text-[#0F172A] text-sm mb-4">
                  Our commitment to you
                </p>
                <ul className="space-y-3">
                  {[
                    'Your report is completely anonymous — we never share your identity',
                    'Your email (if given) is only used to notify you of area updates',
                    'Reports are reviewed before being used in any score calculation',
                    'You can request deletion of your submission at any time',
                  ].map((point) => (
                    <li key={point} className="flex items-start gap-2.5">
                      <CheckCircle className="h-4 w-4 text-[#00C9A7] shrink-0 mt-0.5" />
                      <span className="text-xs text-slate-500 leading-relaxed">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ── HOW DATA IS PROCESSED ────────────────────────────── */}
        <section className="rounded-2xl bg-white border border-slate-200 p-8 shadow-sm">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-[#0F172A]">
              What happens after you submit
            </h2>
            <p className="text-sm text-slate-500 mt-1.5">
              Your report does not go directly into scores. Here is what happens.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PROCESS_STEPS.map(({ icon: Icon, title, desc }, i) => (
              <div key={title} className="relative">
                {/* Connector arrow — hidden on last item */}
                {i < PROCESS_STEPS.length - 1 && (
                  <ArrowRight className="absolute -right-3 top-5 h-4 w-4 text-slate-300 hidden lg:block" />
                )}
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0A1628] mb-3">
                  <Icon className="h-4 w-4 text-[#00C9A7]" />
                </div>
                <p className="font-semibold text-[#0F172A] text-sm mb-1.5">{title}</p>
                <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

      </PageWrapper>
    </div>
  );
};

export default ContributeDataPage;