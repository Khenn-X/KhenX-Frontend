import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useListing } from '../../hooks/useListings';
import { useNeighbourhood } from '../../hooks/useNeighbourhood';
import { useSubmitEnquiry } from '../../hooks/useEnquiries';
import ListingDetail from '../../components/listings/ListingDetail';
import IntelligenceCard from '../../components/neighbourhood/IntelligenceCard';
import WaitlistForm from '../../components/neighbourhood/WaitlistForm';
import PageWrapper from '../../components/layout/PageWrapper';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import ErrorMessage from '../../components/shared/ErrorMessage';
import { enquirySchema } from '../../lib/validators';

import { cn } from '../../lib/utils';

const ListingDetailPage = () => {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [enquirySent, setEnquirySent] = useState(false);

  const { data: listingData, isLoading, isError, refetch } = useListing(id);
  const listing = listingData?.data.listing;

  const { data: neighbourhoodData } = useNeighbourhood(listing?.areaName ?? '');
  const intelligence = neighbourhoodData?.data.intelligence;

  const { mutate: submitEnquiry, isPending: isSendingEnquiry } = useSubmitEnquiry();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EnquiryFormData>({
    resolver: zodResolver(enquirySchema),
  });

  const onEnquirySubmit = (data: EnquiryFormData) => {
    if (!listing) return;
    submitEnquiry(
      { ...data, listingId: listing._id },
      {
        onSuccess: () => {
          setEnquirySent(true);
          reset();
        },
      }
    );
  };

  const inputClass = (hasError: boolean) => cn(
    'w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition-colors',
    hasError
      ? 'border-red-300 focus:ring-red-200'
      : 'border-slate-200 focus:border-[#00C9A7] focus:ring-[#00C9A7]/20'
  );

  if (isLoading) {
    return (
      <PageWrapper className="flex min-h-[60vh] items-center justify-center py-20">
        <LoadingSpinner size="lg" label="Loading listing..." />
      </PageWrapper>
    );
  }

  if (isError || !listing) {
    return (
      <PageWrapper className="py-20">
        <ErrorMessage
          message="This listing could not be found or may have been removed."
          onRetry={refetch}
        />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper className="py-8 space-y-10">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-[#0F172A] transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to listings
      </button>

      {/* Listing detail */}
      <ListingDetail listing={listing} />

      {/* Enquiry form */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-[#0F172A] mb-1">Contact the agent</h2>
        <p className="text-sm text-slate-500 mb-6">
          Send a message directly to the agent about this property.
        </p>

        {enquirySent ? (
          <div className="flex flex-col items-center gap-3 rounded-xl bg-[#00C9A7]/5 border border-[#00C9A7]/20 p-8 text-center">
            <Send className="h-8 w-8 text-[#00C9A7]" />
            <div>
              <p className="font-semibold text-[#0F172A]">Enquiry sent!</p>
              <p className="mt-1 text-sm text-slate-500">
                The agent has been notified and will contact you directly.
              </p>
            </div>
            <button
              onClick={() => setEnquirySent(false)}
              className="text-sm text-[#00C9A7] hover:underline"
            >
              Send another message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onEnquirySubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Your name <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('seekerName')}
                  placeholder="Chidi Okafor"
                  className={inputClass(!!errors.seekerName)}
                />
                {errors.seekerName && (
                  <p className="mt-1 text-xs text-red-500">{errors.seekerName.message}</p>
                )}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Email address <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('seekerEmail')}
                  type="email"
                  placeholder="you@example.com"
                  className={inputClass(!!errors.seekerEmail)}
                />
                {errors.seekerEmail && (
                  <p className="mt-1 text-xs text-red-500">{errors.seekerEmail.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Phone number (optional)
              </label>
              <input
                {...register('seekerPhone')}
                type="tel"
                placeholder="08012345678"
                className={inputClass(!!errors.seekerPhone)}
              />
              {errors.seekerPhone && (
                <p className="mt-1 text-xs text-red-500">{errors.seekerPhone.message}</p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Message <span className="text-red-500">*</span>
              </label>
              <textarea
                {...register('message')}
                rows={4}
                placeholder="Hi, I'm interested in this property. Is it still available? When can I schedule a viewing?"
                className={cn(inputClass(!!errors.message), 'resize-none')}
              />
              {errors.message && (
                <p className="mt-1 text-xs text-red-500">{errors.message.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSendingEnquiry}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#0A1628] py-3 text-sm font-semibold text-white hover:bg-[#0A1628]/90 disabled:opacity-60 transition-colors"
            >
              <Send className="h-4 w-4" />
              {isSendingEnquiry ? 'Sending...' : 'Send enquiry'}
            </button>

            <p className="text-center text-xs text-slate-400">
              Your message will be emailed directly to the agent. No account required.
            </p>
          </form>
        )}
      </div>

      {/* Neighbourhood intelligence */}
      <div>
        <div className="mb-4">
          <h2 className="text-lg font-bold text-[#0F172A]">Neighbourhood intelligence</h2>
          <p className="text-sm text-slate-500 mt-1">
            Verified data about <strong>{listing.areaName}</strong> — before you pay.
          </p>
        </div>

        {intelligence ? (
          <IntelligenceCard data={intelligence} />
        ) : (
          <WaitlistForm defaultArea={listing.areaName} />
        )}
      </div>
    </PageWrapper>
  );
};

export default ListingDetailPage;
