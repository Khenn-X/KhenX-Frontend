import { ShieldCheck } from 'lucide-react';
import { useAdminKYCSubmissions } from '../../hooks/useKYC';
import KYCReviewCard from '../../components/admin/KYCReviewCard';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import ErrorMessage from '../../components/shared/ErrorMessage';
import EmptyState from '../../components/shared/EmptyState';

const AdminKYCPage = () => {
  const { data: submissions = [], isLoading, isError, refetch } = useAdminKYCSubmissions();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">KYC Verification</h1>
          <p className="mt-1 text-sm text-slate-500">
            Review agent identity documents and approve or reject verification requests.
          </p>
        </div>
        {submissions.length > 0 && (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-700">
            {submissions.length} pending
          </span>
        )}
      </div>

      {isLoading && <LoadingSpinner label="Loading KYC submissions..." />}
      {isError && <ErrorMessage onRetry={refetch} />}

      {!isLoading && !isError && submissions.length === 0 && (
        <EmptyState
          icon={ShieldCheck}
          title="No pending KYC submissions"
          description="All agent verification requests have been reviewed."
        />
      )}

      {submissions.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {submissions.map((submission) => (
            <KYCReviewCard
              key={submission.agent._id}
              submission={submission}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminKYCPage;