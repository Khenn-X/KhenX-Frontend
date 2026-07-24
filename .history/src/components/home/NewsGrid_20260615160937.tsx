import React from 'react';
import PageWrapper from '../../components/layout/PageWrapper';

const posts = [
  { id: '1', title: 'Lagos State Housing: New trends', excerpt: 'Market update and what it means for renters.' },
  { id: '2', title: '5 Red Flags to Check When Buying', excerpt: 'Avoid common pitfalls when buying property.' },
  { id: '3', title: 'Understanding security ratings in Lagos', excerpt: 'How ratings are calculated and verified.' },
];

export default function NewsGrid() {
  return (
    <section className="py-12 bg-white">
      <PageWrapper>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-[#0F172A]">News & Market Updates</h3>
            <p className="text-sm text-slate-500">Latest articles and verified insights</p>
          </div>
          <a className="text-sm text-[#00C9A7] font-semibold">Read all</a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {posts.map((p) => (
            <div key={p.id} className="rounded-lg border p-4">
              <div className="h-28 bg-slate-100 rounded mb-3" />
              <h4 className="font-semibold text-[#0F172A]">{p.title}</h4>
              <p className="text-sm text-slate-500 mt-2">{p.excerpt}</p>
            </div>
          ))}
        </div>
      </PageWrapper>
    </section>
  );
}
