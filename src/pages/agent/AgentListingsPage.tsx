import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import ListingManager from '../../components/agent/ListingManager';
import KYCStatusBanner from '../../components/agent/KYCStatusBanner';
import { useKYCStatus } from '../../hooks/useKYC';
import { useListingUsage } from '../../hooks/useListings';
import { ROUTES } from '../../constants/routes';

const AgentListingsPage = () => {
  const { data: kycData } = useKYCStatus();
  const { data: usageData } = useListingUsage();

  // Backend returns: { data: { kycStatus, kycRejectionReason, verifiedAt } }
  const kycStatus = kycData?.data?.kycStatus ?? 'not_submitted';
  const kycRejectionReason = kycData?.data?.kycRejectionReason;
  const usage = usageData?.data?.usage;
  const usageLabel = usage?.isUnlimited ? 'Unlimited' : usage ? `${usage.used}/${usage.quotaLimit}` : 'Loading...';
  const expiresAt = usage?.listingPlanExpiresAt ? new Date(usage.listingPlanExpiresAt).toLocaleDateString() : 'N/A';

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">My Listings</h1>
          <p className="mt-0.5 text-sm text-slate-500">Manage your property listings</p>
        </div>
        {kycStatus === 'approved' && (
          <Link
            to={ROUTES.AGENT_LISTINGS_NEW}
            className="inline-flex items-center gap-2 rounded-lg bg-[#00C9A7] px-4 py-2.5 text-sm font-semibold text-[#0A1628] hover:bg-[#00b396] transition-colors"
          >
            <Plus className="h-4 w-4" />
            New listing
          </Link>
        )}
      </div>

      {kycStatus !== 'approved' && (
        <KYCStatusBanner status={kycStatus} rejectionReason={kycRejectionReason} />
      )}

      {usage && (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-[#0F172A]">Listing quota</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Plan</p>
              <p className="mt-1 text-lg font-semibold text-[#0F172A]">{usage.listingPlan}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Usage</p>
              <p className="mt-1 text-lg font-semibold text-[#0F172A]">{usageLabel}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Expires</p>
              <p className="mt-1 text-lg font-semibold text-[#0F172A]">{expiresAt}</p>
            </div>
          </div>
        </div>
      )}

      <ListingManager />
    </div>
  );
};

export default AgentListingsPage;