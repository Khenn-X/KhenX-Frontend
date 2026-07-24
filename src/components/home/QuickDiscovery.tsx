import React from 'react';
import { Building2, Home, BedDouble, PiggyBank, Landmark, Gem } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';

const items = [
  { title: 'Rent', icon: Building2 },
  { title: 'Buy', icon: Home },
  { title: 'Short-let', icon: BedDouble },
  { title: 'Affordable', icon: PiggyBank },
  { title: 'Mid-range', icon: Landmark },
  { title: 'Premium', icon: Gem },
];

export default function QuickDiscovery() {
  return (
    <section className="py-20">
      <PageWrapper>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-[#0F172A]">Quick Discovery</h3>
          <a className="flex items-center gap-1 text-sm font-medium text-[#0F9D8D] hover:underline">
            View All Properties <span aria-hidden="true">→</span>
          </a>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
          {items.map((it) => {
            const Icon = it.icon;
            return (
              <button
                key={it.title}
                className="flex flex-col items-center justify-center gap-2 rounded-xl bg-[#EAF7F3] px-4 py-5 text-sm font-medium text-[#0F172A] transition-all duration-200 hover:bg-[#D9F0E9] hover:shadow-md hover:-translate-y-0.5"
              >
                <Icon className="h-6 w-6 text-[#0F9D8D]" strokeWidth={2} />
                {it.title}
              </button>
            );
          })}
        </div>
      </PageWrapper>
    </section>
  );
}