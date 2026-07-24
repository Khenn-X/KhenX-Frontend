import { Link } from 'react-router-dom';
import { Plus, ArrowRight } from 'lucide-react';
// import  { useAgentDashboard } from '../../hooks/useAgent';
import { useKYCStatus } from '../../hooks/useKYC';
import DashboardStats from '../../components/agent/DashboardStats';
import KYCStatusBanner from '../../components/agent/KYCStatusBanner';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import ErrorMessage from '../../components/shared/ErrorMessage';
import { ROUTES } from '../../constants/routes';

const AgentDashboardPage = () => {
  const { data: dashData, isLoading: dashLoading, isError: dashError, error: dashErr, refetch } = useAgentDashboard();
  const { data: kycData } = useKYCStatus();

  const stats = dashData?.data;
  const kycStatus = kycData?.data?.kycStatus ?? 'pending';
  const kycRejectionReason = kycData?.data?.kycRejectionReason;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Dashboard</h1>
          <p className="mt-0.5 text-sm text-slate-500">Your KhenX agent overview</p>
        </div>
        {kycStatus === 'approved' && (
          <Link
            to={ROUTES.AGENT.CREATE_LISTING}
            className="inline-flex items-center gap-2 rounded-lg bg-[#00C9A7] px-4 py-2.5 text-sm font-semibold text-[#0A1628] hover:bg-[#00b396] transition-colors"
          >
            <Plus className="h-4 w-4" />
            New listing
          </Link>
        )}
      </div>

      {/* KYC banner (hidden when approved) */}
      <KYCStatusBanner status={kycStatus} rejectionReason={kycRejectionReason} />

      {/* Stats */}
      {dashLoading ? (
        <LoadingSpinner />
      ) : dashError ? (
        <ErrorMessage message={dashErr?.message} onRetry={refetch} />
      ) : stats ? (
        <DashboardStats
          listings={stats.listings}
          totalEnquiries={stats.totalEnquiries}
          totalViews={stats.totalViews}
        />
      ) : null}

      {/* Quick links */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {[
          { label: 'Manage listings', description: 'Edit, pause or delete your listings', href: ROUTES.AGENT.LISTINGS },
          { label: 'View enquiries', description: 'See messages from seekers', href: ROUTES.AGENT.ENQUIRIES },
          { label: 'KYC status', description: 'Check your verification status', href: ROUTES.AGENT.KYC },
          { label: 'Edit profile', description: 'Update your business details', href: ROUTES.AGENT.PROFILE },
        ].map((link) => (
          <Link
            key={link.href}
            to={link.href}
            className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-5 py-4 hover:shadow-sm transition-shadow"
          >
            <div>
              <p className="font-semibold text-[#0F172A] text-sm">{link.label}</p>
              <p className="text-xs text-slate-400 mt-0.5">{link.description}</p>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-300" />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AgentDashboardPage;
