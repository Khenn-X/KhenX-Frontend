import { useParams, Navigate, useNavigate } from 'react-router-dom';
import ListingForm from '../../components/listings/ListingForm';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import ErrorMessage from '../../components/shared/ErrorMessage';
import { useListing, useUpdateListing } from '../../hooks/useListings';
import { ROUTES } from '../../constants/routes';
import type { ListingFormData } from '../../lib/validators';
import type { UpdateListingPayload } from '../../types/listing.types';

const EditListingPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, isError, error, refetch } = useListing(id!);
  const { mutate: updateListing, isPending } = useUpdateListing(id!);

  const listing = data?.data?.listing;

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorMessage message={error?.message} onRetry={refetch} />;
  if (!listing) return <Navigate to={ROUTES.AGENT_LISTINGS} replace />;

  const handleEditListing = (data: ListingFormData, photos: File[]) => {
    const normalizedPayload: UpdateListingPayload = {
      ...data,
      propertyCategory: data.propertyCategory ?? 'building',
      bedrooms: data.propertyCategory === 'building' ? data.bedrooms : undefined,
      bathrooms: data.propertyCategory === 'building' ? data.bathrooms : undefined,
      serviceCharge: data.serviceCharge ?? 0,
      neighbourhoodId: data.neighbourhoodId ?? undefined,
    };

    updateListing(
      { payload: normalizedPayload, photos },
      {
        onSuccess: () => {
          navigate(ROUTES.AGENT_LISTINGS, { replace: true });
        },
      }
    );
  };

  const defaultValues = listing
    ? {
        ...listing,
        propertyCategory: listing.propertyCategory ?? 'building',
        neighbourhoodId: listing.neighbourhoodId ?? undefined,
      }
    : undefined;

  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Edit Listing</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          Changes will be resubmitted for admin review before going live.
        </p>
      </div>
      <ListingForm mode="edit" defaultValues={defaultValues} onSubmit={handleEditListing} isPending={isPending} />
    </div>
  );
};

export default EditListingPage;
