import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  Compass,
  FileSearch,
  Search,
  ShieldCheck,
} from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import heroImage from '../../assets/Lagos.jfif';

const HOW_IT_WORKS = [
  {
    icon: Search,
    title: 'Search properties',
    description: 'Start with the homes and land currently available on KhenX.',
  },
  {
    icon: Compass,
    title: 'Understand the neighbourhood',
    description: 'Review the area intelligence before deciding whether a viewing is worth your time.',
  },
  {
    icon: BadgeCheck,
    title: 'Check agent verification',
    description: 'Look for the KhenX Verified Agent signal on the person representing the listing.',
  },
  {
    icon: ClipboardCheck,
    title: 'Compare your options',
    description: 'Put neighbourhoods and listings side by side while you narrow your shortlist.',
  },
  {
    icon: CheckCircle2,
    title: 'Connect with confidence',
    description: 'Send a focused enquiry and tell the agent how and where you are buying from.',
  },
];

export default function DiasporaPage() {
  useEffect(() => {
    const previousTitle = document.title;
    const description = document.querySelector('meta[name="description"]');
    const previousDescription = description?.getAttribute('content');
    document.title = 'Buy Property in Nigeria from Abroad | KhenX';
    description?.setAttribute('content', 'Find properties, understand neighbourhoods, and connect with verified agents to buy Nigerian property from anywhere. Trusted diaspora buying guide with due diligence checklists.');

    return () => {
      document.title = previousTitle;
      if (description && previousDescription != null) description.setAttribute('content', previousDescription);
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="relative isolate overflow-hidden bg-[#0A1628] py-20 sm:py-28">
        <img
          src={heroImage}
          alt="Lagos city neighbourhood"
          className="absolute inset-0 -z-20 h-full w-full object-cover opacity-30"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#0A1628] via-[#0A1628]/95 to-[#0A1628]/70" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#0A1628] via-transparent to-[#0A1628]/60" />

        <PageWrapper>
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#00C9A7]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00C9A7]" />
              A clearer way to buy from abroad
            </div>
            <h1 className="max-w-2xl text-4xl font-bold leading-tight text-white sm:text-6xl">
              Looking for property in Nigeria from abroad?
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
              Find properties, understand the neighbourhood, and connect with verified agents so you can make a more informed decision without being there in person.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/listings"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#00C9A7] px-6 py-3.5 text-sm font-semibold text-[#0A1628] transition-colors hover:bg-[#00E0BA]"
              >
                Explore Properties
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/neighbourhood"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                Understand a Neighbourhood
                <Compass className="h-4 w-4 text-[#00C9A7]" />
              </Link>
            </div>
          </div>
        </PageWrapper>
      </section>

      <PageWrapper className="py-10 sm:py-14">
        <section className="mb-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#00C9A7]">Quick shortlist</p>
              <h2 className="mt-2 text-2xl font-bold text-[#0F172A]">Compare neighbourhoods before you commit</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Start with a side-by-side view of Yaba and Lekki Phase 1 to compare the key signals that matter for a first property decision.
              </p>
            </div>

            <Link
              to="/neighbourhood/compare?areas=Yaba,Lekki%20Phase%201"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0A1628] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#132744]"
            >
              Compare neighbourhoods
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        <section className="mt-16 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8" aria-labelledby="due-diligence-heading">
          <div className="mb-6 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#00C9A7]">Before you pay</p>
            <h2 id="due-diligence-heading" className="mt-2 text-2xl font-bold text-[#0F172A] sm:text-3xl">
              Before you pay, here&apos;s what to verify
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              This is general buyer guidance only and is not legal advice. Always do your own checks and seek a qualified professional before making a commitment.
            </p>
            <p className="mt-3 text-xs leading-relaxed text-slate-500">
              This is general guidance, not legal advice. Property laws and requirements can vary — always confirm with a qualified lawyer or licensed professional before making any payment.
            </p>
          </div>

          <ol className="grid gap-4 md:grid-cols-2">
            <li className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-[#00C9A7]/10 text-sm font-bold text-[#006A61]">1</div>
              <h3 className="font-semibold text-[#0F172A]">Land title / Certificate of Occupancy (C of O)</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Confirm the land title, Certificate of Occupancy (C of O), and any related records match the seller and the property before paying.
              </p>
            </li>
            <li className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-[#00C9A7]/10 text-sm font-bold text-[#006A61]">2</div>
              <h3 className="font-semibold text-[#0F172A]">Governor&apos;s Consent</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Check whether Governor&apos;s Consent is required for the transfer and confirm the documentation is complete before a purchase is finalised.
              </p>
            </li>
            <li className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-[#00C9A7]/10 text-sm font-bold text-[#006A61]">3</div>
              <h3 className="font-semibold text-[#0F172A]">Physical inspection recommendation</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                If possible, arrange a physical inspection of the land before making payment. If you cannot be there in person, use a trusted local representative to check the site, access, and surroundings.
              </p>
            </li>
            <li className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-[#00C9A7]/10 text-sm font-bold text-[#006A61]">4</div>
              <h3 className="font-semibold text-[#0F172A]">Independent legal verification</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Ask a qualified lawyer or property professional to review the title, deed of assignment, survey plan, and transfer paperwork before you commit.
              </p>
            </li>
          </ol>
        </section>

        <section aria-labelledby="diaspora-process-heading">
          <div className="mb-9 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#00C9A7]">Your decision, made clearer</p>
            <h2 id="diaspora-process-heading" className="mt-2 text-2xl font-bold text-[#0F172A] sm:text-3xl">
              How it works
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              Use the same property, agent, and neighbourhood tools whether you are nearby or several time zones away.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
            {HOW_IT_WORKS.map(({ icon: Icon, title, description }, index) => (
              <div key={title} className="relative">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full border border-[#00C9A7]/25 bg-[#00C9A7]/10">
                  <Icon className="h-5 w-5 text-[#00A88C]" />
                </div>
                <span className="text-xs font-bold tracking-widest text-slate-400">0{index + 1}</span>
                <h3 className="mt-2 font-semibold text-[#0F172A]">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16 grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start" aria-labelledby="trust-heading">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#00C9A7]">Know what the signal means</p>
            <h2 id="trust-heading" className="mt-2 text-2xl font-bold text-[#0F172A] sm:text-3xl">
              Trust, with clear boundaries
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-600">
              KhenX helps you understand who you are speaking with and what the area is like. That is useful context, not a substitute for independent property due diligence.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#00C9A7]/10">
                <ShieldCheck className="h-5 w-5 text-[#00A88C]" />
              </div>
              <div>
                <h3 className="font-semibold text-[#0F172A]">What KhenX verifies today</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                  Agent identity through KhenX KYC. Approved agents are marked as KhenX Verified Agents.
                </p>
              </div>
            </div>

            <div className="my-6 border-t border-slate-100" />

            <div className="space-y-4 text-sm leading-relaxed text-slate-600">
              <div className="flex items-start gap-3">
                <FileSearch className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <p><span className="font-semibold text-[#0F172A]">Listing details:</span> provided by the agent and not independently confirmed by KhenX.</p>
              </div>
              <div className="flex items-start gap-3">
                <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <p><span className="font-semibold text-[#0F172A]">Property ownership and legal documents:</span> not verified by KhenX. Arrange independent verification before paying or committing.</p>
              </div>
            </div>

            <Link
              to="/neighbourhood"
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-[#008A72] hover:text-[#006A61]"
            >
              Explore neighbourhood intelligence
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </PageWrapper>
    </div>
  );
}
