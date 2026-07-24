import React from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import AgentCard from '../agent/AgentCard';

const agents = [
  { name: 'Tunde Adenuga', id: '1' },
  { name: 'Sarah Okonjo', id: '2' },
  { name: 'Femi Ebuta', id: '3' },
  { name: 'Chidi James', id: '4' },
];

export default function AgentGrid() {
  return (
    <section className="py-12 bg-white">
      <PageWrapper>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-[#0F172A]">Work with Verified Professionals</h3>
            <p className="text-sm text-slate-500">Connect with vetted agents for secure, transparent real estate transactions.</p>
          </div>
          <a className="text-sm text-[#00C9A7] font-semibold">View all verified agents</a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {agents.map((a) => (
            <div key={a.id}>
              <AgentCard agent={{ name: a.name, _id: a.id }} />
            </div>
          ))}
        </div>
      </PageWrapper>
    </section>
  );
}
