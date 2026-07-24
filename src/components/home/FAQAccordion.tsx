import React, { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';

const faqs = [
  {
    q: 'How do you verify property listings?',
    a: 'We verify listings through agent KYC and on-site checks where possible, so every listing you see has been confirmed against real documentation, not just an agent\'s word.',
  },
  {
    q: 'What does the intelligence score mean?',
    a: 'It\'s a composite score combining power uptime, security patrol frequency, flood risk, and verified community feedback — a quick read on what living there actually feels like.',
  },
  {
    q: 'Can I list my property for free?',
    a: 'Yes — you can create a free listing from your dashboard in minutes. Verification badges are added once our team confirms your documentation.',
  },
  {
    q: 'How often is neighbourhood data updated?',
    a: 'Infrastructure and safety data is refreshed monthly, with live updates pulled in whenever new verified reports come in from residents and agents in that area.',
  },
];

export default function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (i: number) => {
    setOpenIndex((prev) => (prev === i ? null : i));
  };

  return (
    <section className="py-20 bg-green-100">
      <PageWrapper>
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#00C9A7]/10 px-4 py-1.5 mb-4">
              <ShieldCheck className="h-3.5 w-3.5 text-[#00B396]" />
              <span className="text-xs font-semibold text-[#00B396] uppercase tracking-wide">
                Know before you ask
              </span>
            </div>
            <h3 className="text-3xl font-bold text-[#0F172A]">Common questions</h3>
            <p className="mt-3 text-slate-500 text-sm max-w-md mx-auto leading-relaxed">
              Everything you need to know about how we verify, score, and update the data behind every listing.
            </p>
          </div>

          <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden">
            {faqs.map((f, i) => {
              const isOpen = openIndex === i;
              return (
                <div
                  key={f.q}
                  className={`border-b border-slate-100 last:border-b-0 transition-colors ${
                    isOpen ? 'bg-[#00C9A7]/[0.04]' : ''
                  }`}
                  style={isOpen ? { borderLeft: '3px solid #00C9A7' } : { borderLeft: '3px solid transparent' }}
                >
                  <button
                    onClick={() => toggle(i)}
                    className="w-full flex items-center justify-between gap-4 text-left px-6 py-5"
                    aria-expanded={isOpen}
                  >
                    <span
                      className={`text-[15px] font-semibold transition-colors ${
                        isOpen ? 'text-[#0F172A]' : 'text-[#0F172A]/90'
                      }`}
                    >
                      {f.q}
                    </span>

                    <span
                      className={`relative shrink-0 h-6 w-6 rounded-full flex items-center justify-center transition-colors ${
                        isOpen ? 'bg-[#00C9A7] text-white' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <span className="absolute h-[1.5px] w-2.5 bg-current rounded-full" />
                      <span
                        className={`absolute h-2.5 w-[1.5px] bg-current rounded-full transition-transform duration-200 ${
                          isOpen ? 'scale-y-0' : 'scale-y-100'
                        }`}
                      />
                    </span>
                  </button>

                  <div
                    className="overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out"
                    style={{
                      maxHeight: isOpen ? '200px' : '0px',
                      opacity: isOpen ? 1 : 0,
                    }}
                  >
                    <p className="px-6 pb-5 text-sm text-slate-600 leading-relaxed max-w-2xl">
                      {f.a}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-center text-sm text-slate-500 mt-8">
            Still have questions?{' '}
            <a href="/contact" className="font-semibold text-[#00B396] hover:underline">
              Talk to our team
            </a>
          </p>
        </div>
      </PageWrapper>
    </section>
  );
}