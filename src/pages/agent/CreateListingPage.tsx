import { useState } from 'react';
import ListingForm from '../../components/listings/ListingForm';
import KYCStatusBanner from '../../components/agent/KYCStatusBanner';
import ListingPlanPaywall from '../../components/agent/ListingPlanPaywall';
import { useKYCStatus } from '../../hooks/useKYC';
import { useCreateListing } from '../../hooks/useListings';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { normalizeListingSubmissionData, type ListingFormData } from '../../lib/validators';
import { listingsApi } from '../../api/listings.api';
import type { CreateListingPayload } from '../../types/listing.types';

const DRAFT_STORAGE_KEY = 'listing-plan-draft';

const CreateListingPage = () => {
  const [draftValues, setDraftValues] = useState<Partial<ListingFormData> | undefined>(() => {
    if (typeof window === 'undefined') return undefined;
    const params = new URLSearchParams(window.location.search);
    if (params.get('flow') !== 'listing-plan') return undefined;
    const savedDraft = window.sessionStorage.getItem(DRAFT_STORAGE_KEY);
    if (!savedDraft) return undefined;
    try {
      return JSON.parse(savedDraft) as Partial<ListingFormData>;
    } catch {
      return undefined;
    }
  });
  const { data: kycData, isLoading } = useKYCStatus();
  const [showPaywall, setShowPaywall] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const { mutate: createListing, isPending } = useCreateListing({
    onPlanLimit: () => setShowPaywall(true),
    onError: () => undefined,
    onSuccess: () => {
      if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem(DRAFT_STORAGE_KEY);
      }
    },
  });
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

  const saveDraft = (draft: Partial<ListingFormData>) => {
    setDraftValues(draft);
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
    }
  };

  const handleCreateListing = (data: ListingFormData, photos: File[]) => {
    const sanitizedData = normalizeListingSubmissionData(data);
    const normalizedPayload: CreateListingPayload = {
      ...sanitizedData,
      propertyCategory: sanitizedData.propertyCategory ?? 'building',
      serviceCharge: sanitizedData.serviceCharge ?? 0,
      neighbourhoodId: sanitizedData.neighbourhoodId ?? undefined,
    };

    createListing({ payload: normalizedPayload, photos });
  };

  const handleUpgrade = async (plan: string) => {
    setUpgrading(true);
    try {
      if (draftValues && typeof window !== 'undefined') {
        window.sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftValues));
      }

      const currentPath = window.location.pathname + window.location.search;
      const returnUrl = `${currentPath}`;
      const data = await listingsApi.initializeListingPlanSubscription(plan, returnUrl);
      window.location.href = data.authorizationUrl;
    } catch (err) {
      console.error(err);
      setUpgrading(false);
    }
  };

  const draftRestored = Boolean(draftValues);

  return (
    <div className="max-w-6xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Create Listing</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          Fill in the details below. Your listing will be reviewed before going live.
        </p>
        {draftRestored && (
          <div className="mt-4 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 text-sm text-slate-700 shadow-sm">
            <strong>Your text was restored.</strong> Please re-add your photos before submitting.
          </div>
        )}
      </div>
      <ListingForm
        mode="create"
        onSubmit={handleCreateListing}
        onDraft={saveDraft}
        defaultValues={draftValues}
        isPending={isPending}
      />
      {showPaywall && (
        <ListingPlanPaywall
          onClose={() => setShowPaywall(false)}
          onUpgrade={handleUpgrade}
          isSubmitting={upgrading}
        />
      )}
    </div>
  );
};

export default CreateListingPage;
