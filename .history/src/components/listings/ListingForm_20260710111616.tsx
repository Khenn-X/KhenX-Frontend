import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FileText, MapPin, BedDouble, Wallet, Sparkles, ImageIcon, Send } from 'lucide-react';
import { listingSchema, type ListingFormData } from '../../lib/validators';
import { PROPERTY_TYPES, LISTING_TYPES, PRICE_PERIODS, BEDROOM_OPTIONS } from '../../types/listing.types';
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
  const isEditing = Boolean(defaultValues);

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
      'w-full rounded-xl border px-3 py-2.5 text-sm text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-colors',
      hasError
        ? 'border-red-300 focus:ring-red-200'
        : 'border-slate-200 focus:border-[#00C9A7] focus:ring-[#00C9A7]/15'
    );

  const onFormSubmit = (data: ListingFormData) => onSubmit(data, photos);

  const Section = ({
    title,
    icon: Icon,
    children,
  }: {
    title: string;
    icon: React.ElementType;
    children: React.ReactNode;
  }) => (
    <div className="rounded-3xl border border-slate-200/80 bg-white p-6 transition-shadow duration-200 hover:shadow-sm hover:shadow-slate-200/60">
      <div className="mb-5 flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#00C9A7]/10 text-[#00A88C]">
          <Icon className="h-4 w-4" />
        </span>
        <h3 className="font-semibold text-[#0F172A]">{title}</h3>
      </div>
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
      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
    </div>
  );

  return (
    <div className="w-full space-y-6">
      {/* Header — full-width dark gradient hero, same pattern as the admin neighbourhoods page */}
      <div className="flex flex-col gap-4 rounded-3xl bg-gradient-to-br from-[#0A1628] to-[#0F172A] p-6 sm:p-8">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#00C9A7]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#00C9A7]">
            {isEditing ? 'Editing listing' : 'New listing'}
          </span>
          <h1 className="mt-3 text-2xl font-bold text-white sm:text-3xl">
            {isEditing ? 'Update your listing' : 'Create a new listing'}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-300">
            {isEditing
              ? 'Make changes below — updates to price, photos, or details may be reviewed again before going live.'
              : 'Fill in accurate details and clear photos. Well-described listings get reviewed and approved faster.'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onFormSubmit)} className="w-full">
        {/* Two-column layout on large screens: primary details left, features/photos right */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 lg:items-start">

          {/* Main column */}
          <div className="space-y-5 lg:col-span-2">
            <Section title="Basic information" icon={FileText}>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Section title="Location" icon={MapPin}>
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
              </Section>

              <Section title="Rooms" icon={BedDouble}>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Bedrooms" error={errors.bedrooms?.message} required>
                    <select
                      {...register('bedrooms', { valueAsNumber: true })}
                      className={inputClass(!!errors.bedrooms)}
                    >
                      {BEDROOM_OPTIONS.map((n) => (
                        <option key={n} value={n}>
                          {n === 0 ? 'Self-contained' : `${n} bed${n > 1 ? 's' : ''}`}
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
                        <option key={n} value={n}>{n} bath{n > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </Field>
                </div>
              </Section>
            </div>

            <Section title="Pricing" icon={Wallet}>
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
          </div>

          {/* Side column */}
          <div className="space-y-5 lg:col-span-1">
            <Section title="Amenities & features" icon={Sparkles}>
              <Controller
                control={control}
                name="features"
                render={({ field }) => (
                  <FeaturesCheckbox value={field.value} onChange={field.onChange} />
                )}
              />
            </Section>

            <Section title="Photos" icon={ImageIcon}>
              <PhotoUploader files={photos} onChange={setPhotos} maxFiles={10} />
            </Section>
          </div>
        </div>

        {/* Submit */}
        <div className="mt-5 flex justify-end">
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#00C9A7] px-6 py-3 text-sm font-semibold text-[#0A1628] shadow-sm shadow-[#00C9A7]/30 transition-all hover:bg-[#00E0BA] hover:-translate-y-0.5 disabled:opacity-60 disabled:translate-y-0 disabled:cursor-not-allowed sm:w-auto"
          >
            <Send className="h-4 w-4" />
            {isPending ? 'Submitting…' : submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ListingForm;