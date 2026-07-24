import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FileText, MapPin, BedDouble, Wallet, Sparkles, ImageIcon, Send, type LucideIcon } from 'lucide-react';
import { listingSchema, type ListingFormData } from '../../lib/validators';
import { isResidentialPropertyType } from '../../lib/listingPropertyTypes';
import { PROPERTY_TYPES, LISTING_TYPES, PRICE_PERIODS, BEDROOM_OPTIONS } from '../../types/listing.types';
import { LAGOS_AREAS } from '../../constants/lagos-areas';
import { neighbourhoodApi } from '../../api/neighbourhood.api';
import { FeaturesCheckbox } from './FeaturesCheckbox';
import PhotoUploader from './PhotoUploader';
import { capitalize, cn } from '../../lib/utils';

interface ListingFormProps {
  defaultValues?: Partial<ListingFormData>;
  existingPhotos?: string[];
  onSubmit?: (data: ListingFormData, photos: File[]) => void;
  onDraft?: (data: ListingFormData) => void;
  isPending?: boolean;
  submitLabel?: string;
  mode?: 'create' | 'edit';
}

const DEFAULT_FEATURES = {
  generator: false, borehole: false, security: false, parking: false,
  gym: false, pool: false, cctv: false, internet: false,
};

type FormSectionProps = {
  title: string;
  icon: LucideIcon;
  children: ReactNode;
};

const FormSection = ({ title, icon: Icon, children }: FormSectionProps) => (
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

type FormFieldProps = {
  label: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
};

const FormField = ({ label, error, required, children }: FormFieldProps) => (
  <div>
    <label className="mb-1.5 block text-sm font-medium text-slate-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
  </div>
);

const ListingForm = ({
  defaultValues,
  onSubmit,
  onDraft,
  isPending,
  submitLabel = 'Submit listing',
  mode = 'create',
}: ListingFormProps) => {
  const [photos, setPhotos] = useState<File[]>([]);
  const [neighbourhoodOptions, setNeighbourhoodOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [isLoadingNeighbourhoods, setIsLoadingNeighbourhoods] = useState(false);
  const isEditing = Boolean(defaultValues);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<ListingFormData>({
    resolver: zodResolver(listingSchema) as never,
    defaultValues: {
      features: DEFAULT_FEATURES,
      pricePeriod: 'yearly',
      listingType: 'rent',
      bedrooms: 1,
      bathrooms: 1,
      ...defaultValues,
    },
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const selectedPropertyType = watch('propertyType') as ListingFormData['propertyType'] | undefined;
  const watchedValues = watch();
  const onDraftRef = useRef(onDraft);
  const isResidential = isResidentialPropertyType(selectedPropertyType ?? 'apartment');

  const inputClass = (hasError: boolean) =>
    cn(
      'w-full rounded-xl border px-3 py-2.5 text-sm text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-colors',
      hasError
        ? 'border-red-300 focus:ring-red-200'
        : 'border-slate-200 focus:border-[#00C9A7] focus:ring-[#00C9A7]/15'
    );

  useEffect(() => {
    let isMounted = true;

    const loadNeighbourhoodOptions = async () => {
      try {
        setIsLoadingNeighbourhoods(true);
        const response = await neighbourhoodApi.getAllAreas();
        if (!isMounted) return;

        const areas = Array.isArray(response.data?.areas)
          ? response.data.areas
          : [];

        setNeighbourhoodOptions(
          areas.map((area: { _id?: string; areaName?: string; displayName?: string }) => ({
            value: area._id ?? '',
            label: area.displayName || area.areaName || 'Unnamed neighbourhood',
          })).filter((option: { value: string; label: string }) => option.value)
        );
      } catch {
        if (isMounted) setNeighbourhoodOptions([]);
      } finally {
        if (isMounted) setIsLoadingNeighbourhoods(false);
      }
    };

    loadNeighbourhoodOptions();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    onDraftRef.current = onDraft;
  });

  useEffect(() => {
    if (!onDraftRef.current) return undefined;

    const timeoutId = window.setTimeout(() => {
      onDraftRef.current?.(watchedValues as ListingFormData);
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [watchedValues]);

  const onFormSubmit = (data: ListingFormData) => {
    const normalizedData = {
      ...data,
      bedrooms: isResidential ? (data.bedrooms ?? 0) : 0,
      bathrooms: isResidential ? (data.bathrooms ?? 0) : 0,
      serviceCharge: data.serviceCharge ?? 0,
    };

    onSubmit?.(normalizedData, photos);
  };

  return (
    <div className="space-y-6">
      {/* Header — same dark gradient hero pattern used on the admin neighbourhoods page */}
      <div className="flex flex-col gap-4 rounded-3xl bg-linear-to-br from-[#0A1628] to-[#0F172A] p-6 sm:p-8">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#00C9A7]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#00C9A7]">
            {mode === 'edit' ? 'Editing listing' : 'New listing'}
          </span>
          <h1 className="mt-3 text-2xl font-bold text-white sm:text-3xl">
            {isEditing ? 'Update your listing' : 'Create a new listing'}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-300">
            {mode === 'edit'
              ? 'Make changes below — updates to price, photos, or details may be reviewed again before going live.'
              : 'Fill in accurate details and clear photos. Well-described listings get reviewed and approved faster.'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-5">

        {/* Basic info */}
        <FormSection title="Basic information" icon={FileText}>
          <FormField label="Listing title" error={errors.title?.message} required>
            <input
              {...register('title')}
              placeholder="e.g. Spacious 3-bedroom flat with generator in Lekki Phase 1"
              className={inputClass(!!errors.title)}
            />
          </FormField>

          <FormField label="Description" error={errors.description?.message} required>
            <textarea
              {...register('description')}
              rows={5}
              placeholder="Describe the property — condition, surroundings, access to amenities, terms..."
              className={cn(inputClass(!!errors.description), 'resize-none')}
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Property type" error={errors.propertyType?.message} required>
              <select {...register('propertyType')} className={inputClass(!!errors.propertyType)}>
                <option value="">Select type</option>
                {PROPERTY_TYPES.map((t) => (
                  <option key={t} value={t}>{capitalize(t)}</option>
                ))}
              </select>
            </FormField>

            <FormField label="Listing type" error={errors.listingType?.message} required>
              <select {...register('listingType')} className={inputClass(!!errors.listingType)}>
                {LISTING_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t === 'short-let' ? 'Short Let' : `For ${capitalize(t)}`}
                  </option>
                ))}
              </select>
            </FormField>
          </div>
        </FormSection>

        {/* Location */}
        <FormSection title="Location" icon={MapPin}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Area" error={errors.areaName?.message} required>
              <select {...register('areaName')} className={inputClass(!!errors.areaName)}>
                <option value="">Select area</option>
                {LAGOS_AREAS.map((area) => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            </FormField>

            <FormField label="Neighbourhood" error={errors.neighbourhoodId?.message}>
              <select {...register('neighbourhoodId')} className={inputClass(!!errors.neighbourhoodId)} disabled={isLoadingNeighbourhoods}>
                <option value="">{isLoadingNeighbourhoods ? 'Loading neighbourhoods…' : 'Select neighbourhood (optional)'}</option>
                {neighbourhoodOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </FormField>
          </div>

          <FormField label="Estate name (optional)" error={errors.estateName?.message}>
            <input
              {...register('estateName')}
              placeholder="e.g. Chevron Estate"
              className={inputClass(!!errors.estateName)}
            />
          </FormField>
        </FormSection>

        {/* Rooms */}
        {isResidential && (
          <FormSection title="Rooms" icon={BedDouble}>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Bedrooms" error={errors.bedrooms?.message} required>
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
              </FormField>

              <FormField label="Bathrooms" error={errors.bathrooms?.message} required>
                <select
                  {...register('bathrooms', { valueAsNumber: true })}
                  className={inputClass(!!errors.bathrooms)}
                >
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={n}>{n} bathroom{n > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </FormField>
            </div>
          </FormSection>
        )}

        {/* Pricing */}
        <FormSection title="Pricing" icon={Wallet}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField label="Asking price (₦)" error={errors.price?.message} required>
              <input
                {...register('price', { valueAsNumber: true })}
                type="number"
                placeholder="e.g. 1500000"
                className={inputClass(!!errors.price)}
              />
            </FormField>

            <FormField label="Price period" error={errors.pricePeriod?.message} required>
              <select {...register('pricePeriod')} className={inputClass(!!errors.pricePeriod)}>
                {PRICE_PERIODS.map((p) => (
                  <option key={p} value={p}>{capitalize(p)}</option>
                ))}
              </select>
            </FormField>

            <FormField label="Service charge (₦, optional)" error={errors.serviceCharge?.message}>
              <input
                {...register('serviceCharge', { valueAsNumber: true })}
                type="number"
                placeholder="e.g. 200000"
                className={inputClass(!!errors.serviceCharge)}
              />
            </FormField>
          </div>
        </FormSection>

        {/* Features */}
        <FormSection title="Amenities & features" icon={Sparkles}>
          <Controller
            control={control}
            name="features"
            render={({ field }) => (
              <FeaturesCheckbox value={field.value} onChange={field.onChange} />
            )}
          />
        </FormSection>

        {/* Photos */}
        <FormSection title="Photos" icon={ImageIcon}>
          <PhotoUploader files={photos} onChange={setPhotos} maxFiles={10} />
        </FormSection>

        {/* Submit — rounded-full pill, matching the header CTA convention */}
        <div className="flex justify-end">
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
