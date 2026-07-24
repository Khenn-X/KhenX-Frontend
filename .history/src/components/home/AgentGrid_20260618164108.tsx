import React from 'react';
import { Link } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import AgentCard from '../agent/AgentCard';
import { useAgents } from '../../hooks/useAgent';

// Skeleton card shown while loading
function AgentCardSkeleton() {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-5 animate-pulse">
      <div className="w-14 h-14 rounded-full bg-slate-100 mb-4" />
      <div className="h-4 bg-slate-100 rounded w-3/4 mb-2" />
      <div className="h-3 bg-slate-100 rounded w-full mb-1" />
      <div className="h-3 bg-slate-100 rounded w-5/6 mb-4" />
      <div className="h-3 bg-slate-100 rounded w-1/3" />
    </div>
  );
}

export default function AgentGrid() {
  const { data, isLoading, isError } = useAgents({ limit: 4 });

  const profiles = data?.data?.agents ?? [];

  return (
    <section className="py-12 bg-white">
      <PageWrapper>
        {/* Header */}
        <div className="flex items-start justify-between mb-6 gap-4">
          <div>
            <h3 className="text-2xl font-bold text-[#0F172A]">
              Work with Verified Professionals
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Connect with vetted agents for secure, transparent real estate transactions.
            </p>
          </div>
          <Link
            to="/agents"
            className="shrink-0 text-sm text-[#00C9A7] font-semibold hover:underline mt-1"
          >
            View all agents →
          </Link>
        </div>

        {/* Grid */}
        {isError ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            Could not load agents. Please try again later.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <AgentCardSkeleton key={i} />
                ))
              : profiles.map((profile) => (
                  <AgentCard key={profile.agent._id} profile={profile} />
                ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !isError && profiles.length === 0 && (
          <div className="text-center py-12 text-slate-400 text-sm">
            No verified agents yet.
          </div>
        )}
      </PageWrapper>
    </section>
  );
}