import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import ListingManager from '../../components/agent/ListingManager';
import KYCStatusBanner from '../../components/agent/KYCStatusBanner';
import { useKYCStatus } from '../../hooks/useKYC';
import { ROUTES } from '../../constants/routes';

const AgentListingsPage = () => {
  const { data: kycData } = useKYCStatus();
  const kycStatus = kycData?.data?.kycStatus ?? 'pending';
  const kycRejectionReason = kycData?.data?.kycRejectionReason;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">My Listings</h1>
          <p className="mt-0.5 text-sm text-slate-500">Manage your property listings</p>
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

      {/* KYC banner blocks submission — not browsing */}
      {kycStatus !== 'approved' && (
        <KYCStatusBanner status={kycStatus} rejectionReason={kycRejectionReason} />
      )}

      <ListingManager />
    </div>
  );
};

export default AgentListingsPage;
