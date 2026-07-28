import { Link } from 'react-router-dom';
import { BadgeCheck } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import ErrorMessage from '../../components/shared/ErrorMessage';
import { useAgents } from '../../hooks/useAgent';
import { ROUTES } from '../../constants/routes';
import AgentCard from '../../components/agent/AgentCard';

export default function AgentsPage() {
  const { data, isLoading, isError, refetch } = useAgents({ limit: 24 });
  const profiles = data?.data?.agents ?? [];

  return (
    <PageWrapper className="py-16 sm:py-20">
      <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#00C9A7]">Verified professionals</p>
          <h1 className="text-3xl font-bold text-[#0F172A]">Browse approved agents</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            Every profile below is KYC-approved and ready to help you shortlist the right property.
          </p>
        </div>
        <Link to={ROUTES.LANDLORDS} className="inline-flex items-center gap-2 text-sm font-semibold text-[#0F172A]">
          Explore landlords
          <BadgeCheck className="h-4 w-4 text-[#00C9A7]" />
        </Link>
      </div>

      {isLoading ? (
        <div className="flex min-h-[280px] items-center justify-center rounded-3xl border border-slate-200 bg-white">
          <LoadingSpinner size="lg" label="Loading verified agents..." />
        </div>
      ) : isError ? (
        <ErrorMessage message="We could not load these profiles right now." onRetry={refetch} />
      ) : profiles.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
          There are no verified agents available yet.
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {profiles.map((profile) => (
            <AgentCard key={profile.agent?._id ?? profile.user?._id} profile={profile} />
          ))}
        </div>
      )}
    </PageWrapper>
  );
}
