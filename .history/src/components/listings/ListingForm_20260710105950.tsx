import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  BadgeCheck,
  Banknote,
  BedDouble,
  FileText,
  Image as ImageIcon,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { listingSchema, type ListingFormData } from '../../lib/validators';
import { BEDROOM_OPTIONS, LISTING_TYPES, PRICE_PERIODS, PROPERTY_TYPES } from '../../types/listing.types';
import { LAGOS_AREAS } from '../../constants/lagos-areas';
import { FeaturesCheckbox } from './FeaturesCheckbox';
import PhotoUploader from './PhotoUploader';
import { capitalize, cn } from '../../lib/utils';

interface ListingFormProps {
  defaultValues?: Partial<ListingFormData>;
  existingPhotos?: string[];
  onSubmit: (data: ListingFormData, photos: File[]) => void;
  isPending?: boolean;
  submitLabel?: string;
}

const DEFAULT_FEATURES = {
  generator: false,
  borehole: false,
  security: false,
  parking: false,
  gym: false,
  pool: false,
  cctv: false,
  internet: false,
};

const formatNaira = (value: number | undefined) => {
  if (!value || Number.isNaN(value)) return null;
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(
    value,
  );
};

const ListingForm = ({ defaultValues, onSubmit, isPending, submitLabel = 'Submit listing' }: ListingFormProps) => {
  const [photos, setPhotos] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    control,
    watch,
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

  const watched = watch();

  // Lightweight completion indicator — purely visual, doesn't affect validation.
  const sectionsComplete = useMemo(() => {
    const checks = [
      Boolean(watched.title) && Boolean(watched.description) && Boolean(watched.propertyType),
      Boolean(watched.areaName),
      Boolean(watched.bedrooms) && Boolean(watched.bathrooms),
      Boolean(watched.price) && Boolean(watched.pricePeriod),
      photos.length > 0,
    ];
    return checks.filter(Boolean).length;
  }, [watched, photos.length]);
  const totalSections = 5;
  const progressPct = Math.round((sectionsComplete / totalSections) * 100);

  const inputClass = (hasError: boolean) =>
    cn(
      'w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition-colors',
      hasError
        ? 'border-rose-300 focus:ring-2 focus:ring-rose-200'
        : 'border-slate-200 focus:border-[#00C9A7] focus:ring-2 focus:ring-[#00C9A7]/20',
    );

  const onFormSubmit = (data: ListingFormData) => onSubmit(data, photos);

  const Section = ({
    title,
    icon: Icon,
    done,
    children,
  }: {
    title: string;
    icon: typeof FileText;
    done?: boolean;
    children: React.ReactNode;
  }) => (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/60">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#00C9A7]/10 text-[#00A88C]">
            <Icon className="h-4.5 w-4.5" />
          </div>
          <h3 className="font-semibold text-[#0F172A]">{title}</h3>
        </div>
        {done && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">
            <BadgeCheck className="h-3 w-3" /> Done
          </span>
        )}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );

  const Field = ({
    label,
    error,
    required,
    hint,
    children,
  }: {
    label: string;
    error?: string;
    required?: boolean;
    hint?: string;
    children: React.ReactNode;
  }) => (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
      {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-5 pb-24">
      {/* Progress header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0A1628] to-[#0F172A] p-6">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#00C9A7]/20 blur-3xl" />
        <div className="relative flex items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#00C9A7]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#00C9A7] ring-1 ring-inset ring-[#00C9A7]/20">
              <Sparkles className="h-3 w-3" />
              New listing
            </span>
            <p className="mt-2 text-sm text-slate-300">Fill in the details below to publish your listing.</p>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <span className="text-sm font-semibold text-white">{progressPct}% complete</span>
            <div className="h-1.5 w-28 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#00C9A7] to-[#00E0BA] transition-all"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Basic info */}
      <Section
        title="Basic information"
        icon={FileText}
        done={Boolean(watched.title && watched.description && watched.propertyType)}
      >
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

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Property type" error={errors.propertyType?.message} required>
            <select {...register('propertyType')} className={inputClass(!!errors.propertyType)}>
              <option value="">Select type</option>
              {PROPERTY_TYPES.map((t) => (
                <option key={t} value={t}>
                  {capitalize(t)}
                </option>
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
      <Section title="Location" icon={MapPin} done={Boolean(watched.areaName)}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Area" error={errors.areaName?.message} required>
            <select {...register('areaName')} className={inputClass(!!errors.areaName)}>
              <option value="">Select area</option>
              {LAGOS_AREAS.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
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
      <Section title="Rooms" icon={BedDouble} done={Boolean(watched.bedrooms && watched.bathrooms)}>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Bedrooms" error={errors.bedrooms?.message} required>
            <select {...register('bedrooms', { valueAsNumber: true })} className={inputClass(!!errors.bedrooms)}>
              {BEDROOM_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n === 0 ? 'Self-contained' : `${n} bedroom${n > 1 ? 's' : ''}`}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Bathrooms" error={errors.bathrooms?.message} required>
            <select {...register('bathrooms', { valueAsNumber: true })} className={inputClass(!!errors.bathrooms)}>
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>
                  {n} bathroom{n > 1 ? 's' : ''}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </Section>

      {/* Pricing */}
      <Section title="Pricing" icon={Banknote} done={Boolean(watched.price && watched.pricePeriod)}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field
            label="Asking price (₦)"
            error={errors.price?.message}
            required
            hint={formatNaira(watched.price) ?? undefined}
          >
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
                <option key={p} value={p}>
                  {capitalize(p)}
                </option>
              ))}
            </select>
          </Field>

          <Field
            label="Service charge (₦, optional)"
            error={errors.serviceCharge?.message}
            hint={formatNaira(watched.serviceCharge) ?? undefined}
          >
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
      <Section title="Amenities & features" icon={Sparkles}>
        <Controller
          control={control}
          name="features"
          render={({ field }) => <FeaturesCheckbox value={field.value} onChange={field.onChange} />}
        />
      </Section>

      {/* Photos */}
      <Section title="Photos" icon={ImageIcon} done={photos.length > 0}>
        <PhotoUploader files={photos} onChange={setPhotos} maxFiles={10} />
        <p className="text-xs text-slate-400">
          {photos.length} of 10 photos added{photos.length === 0 && ' — add at least one to help this listing stand out'}
        </p>
      </Section>

      {/* Sticky submit bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur-sm sm:px-6">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
          <p className="hidden text-xs text-slate-400 sm:block">{progressPct}% of the form is filled in</p>
          <button
            type="submit"
            disabled={isPending}
            className="ml-auto w-full rounded-full bg-[#0A1628] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0A1628]/90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-8"
          >
            {isPending ? 'Submitting...' : submitLabel}
          </button>
        </div>
      </div>
    </form>
  );
};

export default ListingForm;