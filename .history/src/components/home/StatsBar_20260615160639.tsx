import React from 'react';
import PageWrapper from '../../components/layout/PageWrapper';

const stats = [
  { label: 'Verified listings', value: '1,200+' },
  { label: 'Verified agents', value: '450+' },
  { label: 'Neighbourhoods', value: '32' },
  { label: '24/7 data updates', value: 'Yes' },
];

export default function StatsBar() {
  return (
    <section className="bg-white py-6">
      <PageWrapper>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          {stats.map((s) => (
            <div key={s.label} className="py-3">
              <div className="text-xl font-bold text-[#0F172A]">{s.value}</div>
              <div className="text-sm text-slate-500">{s.label}</div>
            </div>
          ))}
        </div>
      </PageWrapper>
    </section>
  );
}
