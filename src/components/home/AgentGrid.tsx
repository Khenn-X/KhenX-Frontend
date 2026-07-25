import { Link } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import AgentCard from '../agent/AgentCard';
import { useAgents } from '../../hooks/useAgent';

function AgentCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-5 flex flex-col items-center animate-pulse">
      <div className="w-16 h-16 rounded-full bg-slate-100 mb-3" />
      <div className="h-4 bg-slate-100 rounded w-3/4 mb-2" />
      <div className="h-3 bg-slate-100 rounded w-1/2 mb-4" />
      <div className="w-full border-t border-slate-100 pt-3 mb-4 flex justify-around">
        <div className="h-8 bg-slate-100 rounded w-1/3" />
        <div className="h-8 bg-slate-100 rounded w-1/3" />
      </div>
      <div className="h-9 bg-slate-100 rounded-lg w-full" />
    </div>
  );
}

export default function AgentGrid() {
  const { data, isLoading, isError } = useAgents({ limit: 4 });
  const profiles = data?.data?.agents?.filter((profile) => profile.agent != null) ?? [];

  return (
    <section className="py-16" style={{ backgroundColor: '#EEF2F7' }}>
      <PageWrapper>
        {/* Header — centered */}
        <div className="text-center mb-10">
          <h3 className="text-2xl font-bold text-[#0F172A]">
            Work with Verified Professionals
          </h3>
          <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto">
            Connect with vetted agents for secure, transparent, and data-backed real estate
            transactions.
          </p>
        </div>

        {/* Grid */}
        {isError ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            Could not load agents. Please try again later.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => <AgentCardSkeleton key={i} />)
              : profiles.map((profile) => (
                  profile.agent && <AgentCard key={profile.agent._id} profile={profile} />
                ))}
          </div>
        )}

        {!isLoading && !isError && profiles.length === 0 && (
          <div className="text-center py-12 text-slate-400 text-sm">
            No verified agents yet.
          </div>
        )}

        {/* View All button — centered below grid */}
        <div className="flex justify-center mt-8">
          <Link
            to="/agents"
            className="px-8 py-3 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#0F172A' }}
          >
            View All Verified Agents
          </Link>
        </div>
      </PageWrapper>
    </section>
  );
}