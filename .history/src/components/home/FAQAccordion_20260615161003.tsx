import React from 'react';
import PageWrapper from '../../components/layout/PageWrapper';

const faqs = [
  { q: 'How do you verify property listings?', a: 'We verify listings through agent KYC and on-site checks where possible.' },
  { q: 'What does the intelligence score mean?', a: 'A composite score combining power, security, flood risk, and community feedback.' },
  { q: 'Can I list my property for free?', a: 'Yes — you can create a free listing from your dashboard.' },
];

export default function FAQAccordion() {
  return (
    <section className="py-12 bg-slate-50">
      <PageWrapper>
        <div className="max-w-3xl mx-auto">
          <h3 className="text-2xl font-bold text-[#0F172A] mb-4">Common Questions</h3>
          <div className="space-y-3">
            {faqs.map((f, i) => (
              <details key={i} className="bg-white rounded-lg p-4 border">
                <summary className="font-semibold text-[#0F172A] cursor-pointer">{f.q}</summary>
                <div className="mt-2 text-sm text-slate-600">{f.a}</div>
              </details>
            ))}
          </div>
        </div>
      </PageWrapper>
    </section>
  );
}
