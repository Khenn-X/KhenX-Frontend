import { useState } from 'react';
import {
  Users, Zap, Droplets, Shield, CheckCircle,
  ArrowRight, Database, Clock, MapPin,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import ResidentReportForm from '../../components/neighbourhood/ResidentReportForm';
import WaitlistForm from '../../components/neighbourhood/WaitlistForm';
import PageWrapper from '../../components/layout/PageWrapper';
import { cn } from '../../lib/utils';

// Why each data point matters
const DATA_POINTS = [
  {
    icon: Zap,
    color: 'text-amber-500',
    bg:    'bg-amber-50',
    title: 'Power Supply',
    desc:  'How many hours of electricity does your area get daily? This is the number one question Lagos renters ask — and no one answers it honestly.',
  },
  {
    icon: Droplets,
    color: 'text-blue-500',
    bg:    'bg-blue-50',
    title: 'Flood History',
    desc:  'Did your area flood last rainy season? This information is almost never disclosed by agents and is discovered only after moving in.',
  },
  {
    icon: Shield,
    color: 'text-green-500',
    bg:    'bg-green-50',
    title: 'Security Rating',
    desc:  'How safe do you feel in your neighbourhood? General community ratings — no personal details, no incident specifics.',
  },
];

// How submitted data is processed
const PROCESS_STEPS = [
  {
    icon: Users,
    title: 'Community submits reports',
    desc:  'Residents across Lagos fill in the form below — power hours, flood history, security rating for their specific area.',
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

const ContributeDataPage = () => {
  const [activeTab, setActiveTab] = useState<'report' | 'waitlist'>('report');

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="bg-[#0A1628] pb-16 pt-14">
        <PageWrapper>
          <div className="max-w-2xl mx-auto text-center">

            <div className="inline-flex items-center gap-2 rounded-full bg-[#00C9A7]/10 border border-[#00C9A7]/20 px-4 py-1.5 mb-5">
              <Users className="h-3.5 w-3.5 text-[#00C9A7]" />
              <span className="text-xs font-semibold text-[#00C9A7] uppercase tracking-wide">
                Community Data Contribution
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
              Help your community.{' '}
              <span className="text-[#00C9A7]">Share what you know.</span>
            </h1>

            <p className="mt-4 text-slate-400 leading-relaxed max-w-lg mx-auto">
              Every report you submit helps a future Lagos resident make a better housing
              decision. Power supply, flood history, security — your knowledge matters.
            </p>

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
        <section>
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-[#0F172A]">
              What information we need and why
            </h2>
            <p className="text-sm text-slate-500 mt-1.5 max-w-md mx-auto">
              These are the three things Lagos renters need to know most —
              and the three things agents almost never tell them.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {DATA_POINTS.map(({ icon: Icon, color, bg, title, desc }) => (
              <div
                key={title}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className={cn('inline-flex h-10 w-10 items-center justify-center rounded-xl mb-4', bg)}>
                  <Icon className={cn('h-5 w-5', color)} />
                </div>
                <p className="font-semibold text-[#0F172A] mb-2">{title}</p>
                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── MAIN FORM SECTION ────────────────────────────────── */}
        <section>
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

        {/* ── BOTTOM CTA — link back to intelligence page ──────── */}
        <section className="text-center">
          <p className="text-slate-500 text-sm mb-4">
            Want to see the intelligence data we already have for Lagos areas?
          </p>
          <Link
            to="/neighbourhood"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-[#0A1628] hover:border-[#00C9A7] hover:text-[#00C9A7] transition-colors shadow-sm"
          >
            <MapPin className="h-4 w-4" />
            Explore Neighbourhood Intelligence
          </Link>
        </section>

      </PageWrapper>
    </div>
  );
};

export default ContributeDataPage;