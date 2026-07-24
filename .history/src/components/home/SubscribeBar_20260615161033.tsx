import React from 'react';
import PageWrapper from '../../components/layout/PageWrapper';

export default function SubscribeBar() {
  return (
    <section className="py-10 bg-[#0A1628]">
      <PageWrapper>
        <div className="max-w-3xl mx-auto text-center">
          <h4 className="text-xl font-bold text-white">Stay Informed</h4>
          <p className="text-sm text-slate-300 mt-2">Get weekly Lagos real estate insights and verified listings delivered to you.</p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <input aria-label="email" placeholder="Enter your email" className="rounded-l-lg px-4 py-2 w-64" />
            <button className="rounded-r-lg bg-[#00C9A7] px-4 py-2 font-semibold text-[#0A1628]">Subscribe</button>
          </div>
        </div>
      </PageWrapper>
    </section>
  );
}
