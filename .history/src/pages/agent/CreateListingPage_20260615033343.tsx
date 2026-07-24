import { Navigate } from 'react-router-dom';
import ListingForm from '../../components/listings/ListingForm';
import KYCStatusBanner from '../../components/agent/KYCStatusBanner';
import { useKYCStatus } from '../../hooks/useKYC';
import { ROUTES } from '../../constants/routes';
import LoadingSpinner from '../../components/shared/LoadingSpinner';

const CreateListingPage = () => {
  const { data: kycData, isLoading } = useKYCStatus();
  const kycStatus = kycData?.data?.kycStatus;

  if (isLoading) return <LoadingSpinner />;

  // Hard block — redirect if KYC not approved
  if (kycStatus && kycStatus !== 'approved') {
    return (
      <div className="space-y-5 max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Create Listing</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            You must complete KYC verification before listing a property.
          </p>
        </div>
        <KYCStatusBanner
          status={kycStatus}
          rejectionReason={kycData?.data?.kycRejectionReason}
        />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Create Listing</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          Fill in the details below. Your listing will be reviewed before going live.
        </p>
      </div>
      <ListingForm mode="create" />
    </div>
  );
};

export default CreateListingPage;
