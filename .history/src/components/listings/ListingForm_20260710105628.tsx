import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { listingSchema, ListingFormData } from '../../lib/validators';
import { type IListing, PROPERTY_TYPES, LISTING_TYPES, PRICE_PERIODS, BEDROOM_OPTIONS } from '../../types/listing.types';
import { LAGOS_AREAS } from '../../constants/lagos-areas';
import { FeaturesCheckbox } from './FeaturesCheckbox';
import PhotoUploader from './PhotoUploader';
import { capitalize, cn } from '../../lib/utils';
import { useState } from 'react';

interface ListingFormProps {
  defaultValues?: Partial<ListingFormData>;
  existingPhotos?: string[];
  onSubmit: (data: ListingFormData, photos: File[]) => void;
  isPending?: boolean;
  submitLabel?: string;
}

const DEFAULT_FEATURES = {
  generator: false, borehole: false, security: false, parking: false,
  gym: false, pool: false, cctv: false, internet: false,
};

const ListingForm = ({
  defaultValues,
  onSubmit,
  isPending,
  submitLabel = 'Submit listing',
}: ListingFormProps) => {
  const [photos, setPhotos] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ListingFormData>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      features: DEFAULT_FEATURES,
      pricePeriod: 'yearly',
      listingType: 'rent',
      bedrooms: 1,
      bathrooms: 1,
      ...defaultValues,
    },
  });

  const inputClass = (hasError: boolean) =>
    cn(
      'w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition-colors',
      hasError
        ? 'border-red-300 focus:ring-red-200'
        : 'border-slate-200 focus:border-[#00C9A7] focus:ring-[#00C9A7]/20'
    );

  const onFormSubmit = (data: ListingFormData) => onSubmit(data, photos);

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <h3 className="mb-5 font-semibold text-[#0F172A]">{title}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  );

  const Field = ({ label, error, required, children }: {
    label: string; error?: string; required?: boolean; children: React.ReactNode;
  }) => (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-5">

      {/* Basic info */}
      <Section title="Basic information">
        <Field label="Listing title" error={errors.title?.message} required>
          <input
            {...register('title')}
            placeholder="e.g. Spacious 3-bedroom flat with generator in Lekki Phase 1"
            className={inputClass(!!errors.title)}
          />
        </Field>

        <Field label="Description" error={errors.description?.message} required>
          <textarea
            {...register('description')}
            rows={5}
            placeholder="Describe the property — condition, surroundings, access to amenities, terms..."
            className={cn(inputClass(!!errors.description), 'resize-none')}
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Property type" error={errors.propertyType?.message} required>
            <select {...register('propertyType')} className={inputClass(!!errors.propertyType)}>
              <option value="">Select type</option>
              {PROPERTY_TYPES.map((t) => (
                <option key={t} value={t}>{capitalize(t)}</option>
              ))}
            </select>
          </Field>

          <Field label="Listing type" error={errors.listingType?.message} required>
            <select {...register('listingType')} className={inputClass(!!errors.listingType)}>
              {LISTING_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t === 'short-let' ? 'Short Let' : `For ${capitalize(t)}`}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </Section>

      {/* Location */}
      <Section title="Location">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Area" error={errors.areaName?.message} required>
            <select {...register('areaName')} className={inputClass(!!errors.areaName)}>
              <option value="">Select area</option>
              {LAGOS_AREAS.map((area) => (
                <option key={area} value={area}>{area}</option>
              ))}
            </select>
          </Field>

          <Field label="Estate name (optional)" error={errors.estateName?.message}>
            <input
              {...register('estateName')}
              placeholder="e.g. Chevron Estate"
              className={inputClass(!!errors.estateName)}
            />
          </Field>
        </div>
      </Section>

      {/* Rooms */}
      <Section title="Rooms">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Bedrooms" error={errors.bedrooms?.message} required>
            <select
              {...register('bedrooms', { valueAsNumber: true })}
              className={inputClass(!!errors.bedrooms)}
            >
              {BEDROOM_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n === 0 ? 'Self-contained' : `${n} bedroom${n > 1 ? 's' : ''}`}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Bathrooms" error={errors.bathrooms?.message} required>
            <select
              {...register('bathrooms', { valueAsNumber: true })}
              className={inputClass(!!errors.bathrooms)}
            >
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>{n} bathroom{n > 1 ? 's' : ''}</option>
              ))}
            </select>
          </Field>
        </div>
      </Section>

      {/* Pricing */}
      <Section title="Pricing">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Asking price (₦)" error={errors.price?.message} required>
            <input
              {...register('price', { valueAsNumber: true })}
              type="number"
              placeholder="e.g. 1500000"
              className={inputClass(!!errors.price)}
            />
          </Field>

          <Field label="Price period" error={errors.pricePeriod?.message} required>
            <select {...register('pricePeriod')} className={inputClass(!!errors.pricePeriod)}>
              {PRICE_PERIODS.map((p) => (
                <option key={p} value={p}>{capitalize(p)}</option>
              ))}
            </select>
          </Field>

          <Field label="Service charge (₦, optional)" error={errors.serviceCharge?.message}>
            <input
              {...register('serviceCharge', { valueAsNumber: true })}
              type="number"
              placeholder="e.g. 200000"
              className={inputClass(!!errors.serviceCharge)}
            />
          </Field>
        </div>
      </Section>

      {/* Features */}
      <Section title="Amenities & features">
        <Controller
          control={control}
          name="features"
          render={({ field }) => (
            <FeaturesCheckbox value={field.value} onChange={field.onChange} />
          )}
        />
      </Section>

      {/* Photos */}
      <Section title="Photos">
        <PhotoUploader files={photos} onChange={setPhotos} maxFiles={10} />
      </Section>

      {/* Submit */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-[#0A1628] py-3 text-sm font-semibold text-white hover:bg-[#0A1628]/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        {isPending ? 'Submitting...' : submitLabel}
      </button>
    </form>
  );
};

export default ListingForm;
