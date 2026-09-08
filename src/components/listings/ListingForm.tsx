import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useForm, useWatch, Controller, type FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FileText, MapPin, BedDouble, Wallet, Sparkles, ImageIcon, Send, ChevronDown, RotateCcw, type LucideIcon } from 'lucide-react';
import { listingSchema, normalizeListingSubmissionData, type ListingFormData } from '../../lib/validators';
import LandDetailsSection from './LandDetailsSection';
import BuildingDetailsSection from './BuildingDetailsSection';
import {
  LAND_PROPERTY_TYPES,
  BUILDING_PROPERTY_TYPES,
  LISTING_TYPES,
  PRICE_PERIODS,
  BEDROOM_OPTIONS,
} from '../../types/listing.types';

const LAND_PRICE_PERIODS = ['yearly', 'one-time'] as const;
const BUILDING_PRICE_PERIODS = PRICE_PERIODS;

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  apartment: 'Apartment',
  duplex: 'Duplex',
  bungalow: 'Bungalow',
  'self-con': 'Self-con',
  'mini-flat': 'Mini-flat',
  terrace: 'Terrace',
  detached_house: 'Detached house',
  semi_detached: 'Semi-detached',
  penthouse: 'Penthouse',
  studio: 'Studio',
  office: 'Office',
  shop: 'Shop',
  land: 'Land',
  commercial: 'Commercial',
};
import { LAGOS_AREAS } from '../../constants/lagos-areas';
import { neighbourhoodApi } from '../../api/neighbourhood.api';
import { listingsApi, type ListingCompletenessPreview } from '../../api/listings.api';
import { FeaturesCheckbox } from './FeaturesCheckbox';
import PhotoUploader from './PhotoUploader';
import { capitalize, cn } from '../../lib/utils';

interface ListingFormProps {
  defaultValues?: Partial<ListingFormData> & {
    completenessPercentage?: number;
    completenessBreakdown?: Array<{ group: string; label: string; pointsAvailable: number; earned: boolean }>;
  };
  existingPhotos?: string[];
  onSubmit?: (data: ListingFormData, photos: File[]) => void;
  onDraft?: (data: ListingFormData) => void;
  onClearDraft?: () => void;
  isPending?: boolean;
  submitLabel?: string;
  mode?: 'create' | 'edit';
}

const DEFAULT_FEATURES = {
  generator: false, borehole: false, security: false, parking: false,
  gym: false, pool: false, cctv: false, internet: false,
};

const buildFormDefaultValues = (values?: Partial<ListingFormData>): Partial<ListingFormData> => {
  const propertyCategory = values?.propertyCategory ?? 'building';
  const isBuilding = propertyCategory === 'building';
  const isLand = propertyCategory === 'land';

  const formDefaults: Partial<ListingFormData> = {
    features: {
      ...DEFAULT_FEATURES,
      ...(values?.features ?? {}),
    },
    nearbyPlaces: {
      ...(values?.nearbyPlaces ?? {}),
    },
    nearbyAmenities: {
      ...(values?.nearbyAmenities ?? {}),
    },
    pricePeriod: values?.pricePeriod ?? (values?.listingType === 'sale' ? undefined : 'yearly'),
    listingType: values?.listingType ?? 'rent',
    propertyCategory,
    propertyType: values?.propertyType ?? (isLand ? 'land' : 'apartment'),
    bedrooms: isBuilding ? (values?.bedrooms ?? 1) : undefined,
    bathrooms: isBuilding ? (values?.bathrooms ?? 1) : undefined,
    ...values,
  };

  if (isBuilding) {
    formDefaults.buildingDetails = {
      ...(values?.buildingDetails ?? {}),
      interiorFeatures: {
        ...(values?.buildingDetails?.interiorFeatures ?? {}),
      },
      exteriorFeatures: {
        ...(values?.buildingDetails?.exteriorFeatures ?? {}),
      },
      utilities: {
        ...(values?.buildingDetails?.utilities ?? {}),
      },
      securityFeatures: {
        ...(values?.buildingDetails?.securityFeatures ?? {}),
      },
    };
    formDefaults.landDetails = undefined;
  }

  if (isLand) {
    formDefaults.landDetails = {
      ...(values?.landDetails ?? {}),
      utilities: {
        ...(values?.landDetails?.utilities ?? {}),
      },
      estateInfo: {
        ...(values?.landDetails?.estateInfo ?? {}),
      },
    };
    formDefaults.buildingDetails = undefined;
  }

  return formDefaults;
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
  existingPhotos,
  onSubmit,
  onDraft,
  onClearDraft,
  isPending,
  submitLabel = 'Submit listing',
  mode = 'create',
}: ListingFormProps) => {
  const [photos, setPhotos] = useState<File[]>([]);
  const [completenessPreview, setCompletenessPreview] = useState<ListingCompletenessPreview | null>(() => {
    if (defaultValues?.completenessPercentage == null || !defaultValues.completenessBreakdown) return null;
    return {
      percentage: defaultValues.completenessPercentage,
      breakdown: defaultValues.completenessBreakdown,
    };
  });
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const previewRequestId = useRef(0);
  const skipNextDraftSave = useRef(false);
  const [isAdditionalDetailsExpanded, setIsAdditionalDetailsExpanded] = useState(() => {
    if (mode !== 'edit' || !defaultValues) return false;

    const values = defaultValues as Partial<ListingFormData> & {
      state?: string;
      lga?: string;
      nearbyLandmark?: string;
      buildingDetails?: Record<string, unknown>;
      landDetails?: Record<string, unknown>;
    };
    const hasMeaningfulValue = (value: unknown): boolean => {
      if (Array.isArray(value)) return value.length > 0;
      if (value && typeof value === 'object') return Object.values(value).some(hasMeaningfulValue);
      return value !== undefined && value !== null && value !== '' && value !== false;
    };
    const hasLocationDetails = Boolean(
      values.neighbourhoodId || values.estateName || values.state || values.lga || values.nearbyLandmark
    );
    const hasAmenities = Object.values(values.features ?? {}).some(Boolean) ||
      Object.values(values.nearbyPlaces ?? {}).some((entries) => Array.isArray(entries) && entries.length > 0) ||
      Object.values(values.nearbyAmenities ?? {}).some((entries) => Array.isArray(entries) && entries.length > 0);
    const hasPropertyDetails = Boolean(values.serviceCharge) ||
      hasMeaningfulValue(values.buildingDetails) || hasMeaningfulValue(values.landDetails);

    return hasLocationDetails || hasAmenities || hasPropertyDetails;
  });
  const [neighbourhoodOptions, setNeighbourhoodOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [isLoadingNeighbourhoods, setIsLoadingNeighbourhoods] = useState(false);
  const isEditing = Boolean(defaultValues);
  const initializedForId = useRef<string | undefined>(undefined);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    clearErrors,
    trigger,
    getValues,
    reset,
    formState: { errors },
  } = useForm<ListingFormData>({
    resolver: zodResolver(listingSchema) as never,
    shouldUnregister: true,
    defaultValues: buildFormDefaultValues(defaultValues),
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const selectedPropertyCategory = watch('propertyCategory') as ListingFormData['propertyCategory'] | undefined;
  const selectedPropertyType = watch('propertyType') as ListingFormData['propertyType'] | undefined;
  const selectedListingType = watch('listingType') as ListingFormData['listingType'] | undefined;
  const watchedValues = useWatch({ control });
  const onDraftRef = useRef(onDraft);
  const isBuildingCategory = selectedPropertyCategory === 'building';
  const isLandCategory = selectedPropertyCategory === 'land';
  const existingPhotoCount = ((defaultValues as { photos?: string[] } | undefined)?.photos?.length ?? existingPhotos?.length ?? 0);
  const propertyTypeOptions = isLandCategory ? LAND_PROPERTY_TYPES : BUILDING_PROPERTY_TYPES;
  const defaultBuildingPropertyType = BUILDING_PROPERTY_TYPES[0];
  const pricePeriodOptions = isLandCategory
    ? selectedListingType === 'sale'
      ? LAND_PRICE_PERIODS
      : ['yearly']
    : BUILDING_PRICE_PERIODS;


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
    const valuesWithIdentity = defaultValues as (Partial<ListingFormData> & {
      id?: string;
      _id?: string;
    }) | undefined;
    const currentId = valuesWithIdentity?.id ?? valuesWithIdentity?._id;

    if (initializedForId.current === currentId) return;

    initializedForId.current = currentId;
    reset(buildFormDefaultValues(defaultValues));
    if (defaultValues?.completenessPercentage != null && defaultValues.completenessBreakdown) {
      setCompletenessPreview({
        percentage: defaultValues.completenessPercentage,
        breakdown: defaultValues.completenessBreakdown,
      });
    } else {
      setCompletenessPreview(null);
    }
  }, [defaultValues, reset]);

  useEffect(() => {
    if (!isBuildingCategory) {
      clearErrors(['bedrooms', 'bathrooms']);
      return;
    }

    void trigger(['bedrooms', 'bathrooms']);
  }, [isBuildingCategory, clearErrors, trigger]);

  useEffect(() => {
    if (!isLandCategory) return;

    if (selectedListingType === 'sale') {
      setValue('pricePeriod', 'one-time', { shouldValidate: true, shouldDirty: true });
      return;
    }

    setValue('pricePeriod', 'yearly', { shouldValidate: true, shouldDirty: true });
  }, [isLandCategory, selectedListingType, setValue]);

  useEffect(() => {
    if (selectedListingType === 'sale') {
      setValue('pricePeriod', undefined, { shouldValidate: true, shouldDirty: true });
    } else if (!getValues('pricePeriod')) {
      setValue('pricePeriod', isLandCategory ? 'yearly' : 'yearly', { shouldValidate: true, shouldDirty: true });
    }
  }, [selectedListingType, isLandCategory, getValues, setValue]);

  useEffect(() => {
    if (!selectedPropertyCategory) return;

    if (selectedPropertyCategory === 'building') {
      if (getValues('bedrooms') == null) {
        setValue('bedrooms', 1, { shouldValidate: true, shouldDirty: true });
      }

      if (getValues('bathrooms') == null) {
        setValue('bathrooms', 1, { shouldValidate: true, shouldDirty: true });
      }

      setValue('buildingDetails', undefined, { shouldValidate: true, shouldDirty: true });
      setValue('landDetails', undefined, { shouldValidate: true, shouldDirty: true });
    } else {
      setValue('bedrooms', undefined, { shouldValidate: true, shouldDirty: true });
      setValue('bathrooms', undefined, { shouldValidate: true, shouldDirty: true });
      setValue('buildingDetails', undefined, { shouldValidate: true, shouldDirty: true });
      setValue('landDetails', undefined, { shouldValidate: true, shouldDirty: true });
    }

    if (selectedPropertyCategory === 'land' && selectedPropertyType !== 'land') {
      setValue('propertyType', 'land', { shouldValidate: true, shouldDirty: true });
      return;
    }

    if (selectedPropertyCategory === 'building' && selectedPropertyType === 'land') {
      setValue('propertyType', defaultBuildingPropertyType, { shouldValidate: true, shouldDirty: true });
    }
  }, [selectedPropertyCategory, selectedPropertyType, getValues, setValue, defaultBuildingPropertyType]);

  useEffect(() => {
    if (!onDraftRef.current) return undefined;

    if (skipNextDraftSave.current) {
      skipNextDraftSave.current = false;
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      onDraftRef.current?.(watchedValues as ListingFormData);
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [watchedValues]);

  const handleClearOrReset = () => {
    skipNextDraftSave.current = true;
    reset(buildFormDefaultValues(mode === 'edit' ? defaultValues : undefined));
    setPhotos([]);
    setCompletenessPreview(null);
    setIsAdditionalDetailsExpanded(mode === 'edit' ? isAdditionalDetailsExpanded : false);
    onClearDraft?.();
  };

  useEffect(() => {
    const requestId = ++previewRequestId.current;
    setIsPreviewLoading(true);
    const previewDraft = {
      ...watchedValues,
      photos: Array.from({ length: existingPhotoCount + photos.length }, () => 'draft-photo'),
    };
    const timeoutId = window.setTimeout(() => {
      void listingsApi.previewCompleteness(previewDraft as Partial<ListingFormData>)
        .then((response) => {
          if (requestId === previewRequestId.current) setCompletenessPreview(response.data);
        })
        .catch(() => undefined)
        .finally(() => {
          if (requestId === previewRequestId.current) setIsPreviewLoading(false);
        });
    }, 500);

    return () => window.clearTimeout(timeoutId);
  }, [watchedValues, photos, existingPhotoCount]);

  const onFormSubmit = (data: ListingFormData) => {
    const normalizedData = normalizeListingSubmissionData(data);
    onSubmit?.(normalizedData, photos);
  };

  const onFormError = (formErrors: FieldErrors<ListingFormData>) => {
    console.error('Listing form validation failed:', formErrors);
  };

  const completenessPercentage = completenessPreview?.percentage;
  const missingCompletenessGroups = completenessPreview?.breakdown.filter((group) => !group.earned).slice(0, 3) ?? [];

  return (
    <div className="space-y-6">
      {/* Header — same dark gradient hero pattern used on the admin neighbourhoods page */}
      <div className="flex flex-col gap-4 rounded-3xl bg-linear-to-br from-[#0A1628] to-[#0F172A] p-6 sm:flex-row sm:items-start sm:justify-between sm:p-8">
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
        <button
          type="button"
          onClick={handleClearOrReset}
          className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-full border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/20"
        >
          <RotateCcw className="h-4 w-4" />
          {mode === 'edit' ? 'Reset form' : 'Clear form'}
        </button>
      </div>

      <form onSubmit={handleSubmit(onFormSubmit, onFormError)} className="space-y-5">
        <section className="rounded-3xl border border-[#00C9A7]/20 bg-[#F0FDF9] p-5 shadow-sm sm:p-6" aria-live="polite">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#0F766E]">Listing completeness</p>
              <p className="mt-1 text-sm text-slate-600">Complete the highest-impact details to improve visibility.</p>
            </div>
            <span className="text-2xl font-bold text-[#0F766E]">
              {isPreviewLoading && completenessPreview == null ? '…' : `${completenessPreview?.percentage ?? 0}%`}
            </span>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white">
            <div className="h-full rounded-full bg-[#00C9A7] transition-all" style={{ width: `${completenessPreview?.percentage ?? 0}%` }} />
          </div>
          {missingCompletenessGroups.length > 0 && (
            <p className="mt-3 text-xs text-slate-600">
              Focus next: {missingCompletenessGroups.map((group) => `${group.label} (+${group.pointsAvailable}%)`).join(' · ')}
            </p>
          )}
        </section>

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
            <FormField label="Property category" error={errors.propertyCategory?.message} required>
              <select {...register('propertyCategory')} className={inputClass(!!errors.propertyCategory)}>
                <option value="building">Building</option>
                <option value="land">Land</option>
              </select>
            </FormField>

            <FormField label="Property type" error={errors.propertyType?.message} required>
              <select {...register('propertyType')} className={inputClass(!!errors.propertyType)}>
                {propertyTypeOptions.length > 1 && <option value="">Select type</option>}
                {propertyTypeOptions.map((t) => (
                  <option key={t} value={t}>{PROPERTY_TYPE_LABELS[t] ?? capitalize(t)}</option>
                ))}
              </select>
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            <FormField label="Neighbourhood (helps show your property on the map)" error={errors.neighbourhoodId?.message}>
              <select {...register('neighbourhoodId')} className={inputClass(!!errors.neighbourhoodId)} disabled={isLoadingNeighbourhoods}>
                <option value="">{isLoadingNeighbourhoods ? 'Loading neighbourhoods...' : 'Select neighbourhood (optional)'}</option>
                {neighbourhoodOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </FormField>
          </div>

        </FormSection>

        {/* Rooms */}
        {isBuildingCategory && (
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

        {/* Pricing core */}
        <FormSection title="Pricing" icon={Wallet}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Asking price (₦)" error={errors.price?.message} required>
              <input
                {...register('price', { valueAsNumber: true })}
                type="number"
                placeholder="e.g. 1500000"
                className={inputClass(!!errors.price)}
              />
            </FormField>

            {selectedListingType !== 'sale' && (
              <FormField label="Price period" error={errors.pricePeriod?.message} required>
                <select {...register('pricePeriod')} className={inputClass(!!errors.pricePeriod)}>
                  {pricePeriodOptions.map((p) => (
                    <option key={p} value={p}>{capitalize(p)}</option>
                  ))}
                </select>
              </FormField>
            )}

          </div>
        </FormSection>

        <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm">
          <button
            type="button"
            onClick={() => setIsAdditionalDetailsExpanded((expanded) => !expanded)}
            aria-expanded={isAdditionalDetailsExpanded}
            className="flex w-full items-center justify-between gap-4 p-5 text-left transition-colors hover:bg-slate-50 sm:p-6"
          >
            <span>
              <span className="block font-semibold text-[#0F172A]">Add more details</span>
              <span className="mt-1 block text-xs text-slate-500">
                {completenessPercentage != null ? `${completenessPercentage}% complete · ` : ''}
                {missingCompletenessGroups.length > 0
                  ? `Focus next: ${missingCompletenessGroups.map((group) => `${group.label} (+${group.pointsAvailable}%)`).join(' · ')}`
                  : 'Improve visibility with richer listing information'}
              </span>
            </span>
            <ChevronDown className={`h-5 w-5 shrink-0 text-slate-400 transition-transform ${isAdditionalDetailsExpanded ? 'rotate-180' : ''}`} />
          </button>

          <div hidden={!isAdditionalDetailsExpanded} className="space-y-5 border-t border-slate-100 p-5 sm:p-6">
            <FormSection title="More location details" icon={MapPin}>
              <FormField label="Estate name (optional)" error={errors.estateName?.message}>
                <input {...register('estateName')} placeholder="e.g. Chevron Estate" className={inputClass(!!errors.estateName)} />
              </FormField>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField label="State" error={errors.state?.message}>
                  <input {...register('state')} placeholder="e.g. Lagos" className={inputClass(!!errors.state)} />
                </FormField>
                <FormField label="LGA" error={errors.lga?.message}>
                  <input {...register('lga')} placeholder="e.g. Ikeja" className={inputClass(!!errors.lga)} />
                </FormField>
              </div>
              <FormField label="Nearby landmark" error={errors.nearbyLandmark?.message}>
                <input {...register('nearbyLandmark')} placeholder="e.g. Opposite XYZ Mall" className={inputClass(!!errors.nearbyLandmark)} />
              </FormField>
            </FormSection>

            <FormSection title="Additional pricing" icon={Wallet}>
              <FormField label="Service charge (₦, optional)" error={errors.serviceCharge?.message}>
                <input {...register('serviceCharge', { valueAsNumber: true })} type="number" placeholder="e.g. 200000" className={inputClass(!!errors.serviceCharge)} />
              </FormField>
            </FormSection>

            {isLandCategory && <LandDetailsSection register={register} control={control} errors={errors} />}
            {isBuildingCategory && <BuildingDetailsSection register={register} control={control} errors={errors} />}

            <FormSection title="Amenities & features" icon={Sparkles}>
              <Controller
                control={control}
                name="features"
                render={({ field }) => <FeaturesCheckbox value={field.value} onChange={field.onChange} />}
              />
            </FormSection>
          </div>
        </section>

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
