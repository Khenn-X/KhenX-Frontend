import { CheckCircle2, ArrowRight } from 'lucide-react';

const PERKS = [
  'Verified infrastructure data',
  'Historical flood reports',
  'Utility uptime verification',
];

export default function TalkToAdvisor() {
  return (
    <section className="rounded-2xl overflow-hidden">
      <div className="grid grid-cols-1 sm:grid-cols-2">

        {/* Photo / illustration side */}
        <div className="relative h-56 sm:h-auto min-h-[260px] bg-[#0A1628]">
          <img
            src="/images/advisor.jpg"
            alt="KhenX Area Specialist"
            className="absolute inset-0 h-full w-full object-cover object-top opacity-80"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
          />
          {/* Fallback gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#0A1628] to-[#1a3a5c]" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0A1628]/30 sm:to-[#0A1628]/60" />
        </div>

        {/* Content side */}
        <div className="bg-[#0A1628] p-8 sm:p-10 flex flex-col justify-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#00C9A7] mb-3">
            Expert Guidance
          </p>
          <h3 className="text-xl sm:text-2xl font-bold text-white leading-snug">
            Need help deciding<br />where to live?
          </h3>
          <p className="mt-3 text-sm text-slate-400 leading-relaxed">
            Book a 15-minute consultation with a KhenX Area Specialist to get hyper-local
            data you won't find anywhere else.
          </p>

          {/* Perks */}
          <ul className="mt-5 space-y-2">
            {PERKS.map((perk) => (
              <li key={perk} className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-[#00C9A7] shrink-0" />
                <span className="text-sm text-slate-300">{perk}</span>
              </li>
            ))}
          </ul>

          <a
            href="/advisors/book"
            className="mt-7 inline-flex items-center gap-2 self-start rounded-xl bg-[#00C9A7] px-6 py-3 text-sm font-semibold text-[#0A1628] hover:bg-[#00b396] transition-colors"
          >
            Talk to an Advisor
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>

      </div>
    </section>
  );
}