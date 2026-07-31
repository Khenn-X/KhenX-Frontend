import { useState, type KeyboardEvent, type ReactNode } from 'react';
import {
  type Control,
  type FieldErrors,
  type UseFormRegister,
  useFieldArray,
} from 'react-hook-form';
import { type ListingFormData } from '../../lib/validators';

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

type FormSectionProps = {
  title: string;
  children: ReactNode;
};

const FormSection = ({ title, children }: FormSectionProps) => (
  <div className="rounded-3xl border border-slate-200/80 bg-white p-6 transition-shadow duration-200 hover:shadow-sm hover:shadow-slate-200/60">
    <div className="mb-5">
      <h3 className="font-semibold text-[#0F172A]">{title}</h3>
    </div>
    <div className="space-y-4">{children}</div>
  </div>
);

const inputClass = (hasError: boolean) =>
  `w-full rounded-xl border px-3 py-2.5 text-sm text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-colors ${
    hasError
      ? 'border-red-300 focus:ring-red-200'
      : 'border-slate-200 focus:border-[#00C9A7] focus:ring-[#00C9A7]/15'
  }`;

interface LandDetailsSectionProps {
  register: UseFormRegister<ListingFormData>;
  control: Control<ListingFormData>;
  errors: FieldErrors<ListingFormData>;
}

type NearbyPlacesCategory =
  | 'schools'
  | 'hospitals'
  | 'shoppingMalls'
  | 'markets'
  | 'churches'
  | 'mosques'
  | 'fuelStations'
  | 'policeStations';

type NearbyItemDraft = {
  name: string;
  distanceKm: string;
  notes: string;
};

const NEARBY_PLACES_CATEGORIES: Array<{ key: NearbyPlacesCategory; label: string }> = [
  { key: 'schools', label: 'Schools' },
  { key: 'hospitals', label: 'Hospitals' },
  { key: 'shoppingMalls', label: 'Shopping malls' },
  { key: 'markets', label: 'Markets' },
  { key: 'churches', label: 'Churches' },
  { key: 'mosques', label: 'Mosques' },
  { key: 'fuelStations', label: 'Fuel stations' },
  { key: 'policeStations', label: 'Police stations' },
];

const emptyNearbyItemDraft: NearbyItemDraft = {
  name: '',
  distanceKm: '',
  notes: '',
};

const NearbyPlacesCategoryEditor = ({
  categoryKey,
  label,
  control,
}: {
  categoryKey: NearbyPlacesCategory;
  label: string;
  control: Control<ListingFormData>;
}) => {
  const arrayName = `nearbyPlaces.${categoryKey}` as const;
  const { fields, append, remove } = useFieldArray<ListingFormData>({
    control,
    name: arrayName,
  });
  const [draft, setDraft] = useState<NearbyItemDraft>(emptyNearbyItemDraft);
  const [isAdding, setIsAdding] = useState(false);

  const resetDraft = () => setDraft(emptyNearbyItemDraft);

  const handleSave = () => {
    if (!draft.name.trim() && !draft.distanceKm.trim() && !draft.notes.trim()) {
      setIsAdding(false);
      resetDraft();
      return;
    }

    append({
      name: draft.name.trim() || undefined,
      distanceKm: draft.distanceKm.trim() ? Number(draft.distanceKm) : undefined,
      notes: draft.notes.trim() || undefined,
    });

    setIsAdding(false);
    resetDraft();
  };

  const handleCancel = () => {
    setIsAdding(false);
    resetDraft();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSave();
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      handleCancel();
    }
  };

  const singularLabel = label.replace(/s$/, '');

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-slate-50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="font-medium text-slate-900">{label}</p>
        <button
          type="button"
          className="rounded-full px-3 py-1.5 text-sm font-medium text-[#0F766E] hover:bg-[#D1FAE5]"
          onClick={() => setIsAdding(true)}
        >
          Add
        </button>
      </div>

      {fields.length === 0 && !isAdding ? (
        <p className="mb-4 text-sm text-slate-600">
          No {label.toLowerCase()} added — Add {label.toLowerCase()}
        </p>
      ) : null}

      {fields.map((field, index) => (
        <div
          key={field.id}
          className="mb-3 rounded-2xl border border-slate-200 bg-white p-4"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium text-slate-900">{field.name || 'Untitled'}</p>
              <p className="text-sm text-slate-500">
                {field.distanceKm != null ? `${field.distanceKm} km` : 'Distance not set'}
              </p>
            </div>
            <button
              type="button"
              className="text-sm font-medium text-red-600 hover:text-red-700"
              onClick={() => {
                if (window.confirm(`Delete this ${singularLabel} entry?`)) remove(index);
              }}
            >
              Delete
            </button>
          </div>
          {field.notes ? <p className="mt-3 text-sm text-slate-600">{field.notes}</p> : null}
        </div>
      ))}

      {isAdding ? (
        <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <label className="text-sm text-slate-700">
              Name
              <input
                type="text"
                value={draft.name}
                onChange={(event) => setDraft((prev) => ({ ...prev, name: event.target.value }))}
                onKeyDown={handleKeyDown}
                placeholder={`Add ${singularLabel} name`}
                className={inputClass(false)}
              />
            </label>
            <label className="text-sm text-slate-700">
              Distance (km)
              <input
                type="number"
                min="0"
                step="0.01"
                value={draft.distanceKm}
                onChange={(event) => setDraft((prev) => ({ ...prev, distanceKm: event.target.value }))}
                onKeyDown={handleKeyDown}
                placeholder="e.g. 1.2"
                className={inputClass(false)}
              />
            </label>
            <label className="text-sm text-slate-700">
              Notes
              <input
                type="text"
                value={draft.notes}
                onChange={(event) => setDraft((prev) => ({ ...prev, notes: event.target.value }))}
                onKeyDown={handleKeyDown}
                placeholder="Optional notes"
                className={inputClass(false)}
              />
            </label>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="rounded-xl bg-[#00C9A7] px-4 py-2 text-sm font-medium text-white hover:bg-[#0f766e]"
              onClick={handleSave}
            >
              Save
            </button>
            <button
              type="button"
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

const TITLE_TYPES = [
  { value: 'certificate_of_occupancy', label: 'Certificate of Occupancy (C of O)' },
  { value: 'governors_consent', label: "Governor's Consent" },
  { value: 'gazette', label: 'Gazette' },
  { value: 'registered_survey', label: 'Registered Survey' },
  { value: 'excision', label: 'Excision' },
  { value: 'deed_of_assignment', label: 'Deed of Assignment' },
  { value: 'allocation_letter', label: 'Allocation Letter' },
  { value: 'registered_deed', label: 'Registered Deed' },
  { value: 'family_receipt', label: 'Family Receipt' },
  { value: 'receipt_and_survey', label: 'Receipt & Survey' },
  { value: 'freehold', label: 'Freehold' },
];

const LandDetailsSection = ({ register, control, errors }: LandDetailsSectionProps) => (
  <div className="space-y-5">
    <FormSection title="Land profile">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Purpose" error={errors.landDetails?.purpose?.message}>
          <select
            {...(register('landDetails.purpose') as unknown as any)}
            className={inputClass(!!errors.landDetails?.purpose)}
          >
            <option value="">Select purpose</option>
            <option value="sale">Sale</option>
            <option value="lease">Lease</option>
          </select>
        </FormField>

        <FormField label="Price per sqm (₦)" error={errors.landDetails?.pricePerSquareMeter?.message}>
          <input
            {...register('landDetails.pricePerSquareMeter', { valueAsNumber: true })}
            type="number"
            placeholder="e.g. 50000"
            className={inputClass(!!errors.landDetails?.pricePerSquareMeter)}
          />
        </FormField>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <FormField label="Plot size (sqm)" error={errors.landDetails?.plotSizeSqm?.message}>
          <input
            {...register('landDetails.plotSizeSqm', { valueAsNumber: true })}
            type="number"
            placeholder="e.g. 450"
            className={inputClass(!!errors.landDetails?.plotSizeSqm)}
          />
        </FormField>

        <FormField label="Total land area (sqm)" error={errors.landDetails?.totalLandAreaSqm?.message}>
          <input
            {...register('landDetails.totalLandAreaSqm', { valueAsNumber: true })}
            type="number"
            placeholder="e.g. 900"
            className={inputClass(!!errors.landDetails?.totalLandAreaSqm)}
          />
        </FormField>

        <FormField label="Number of plots" error={errors.landDetails?.numberOfPlots?.message}>
          <input
            {...register('landDetails.numberOfPlots', { valueAsNumber: true })}
            type="number"
            placeholder="e.g. 2"
            className={inputClass(!!errors.landDetails?.numberOfPlots)}
          />
        </FormField>
      </div>
    </FormSection>

    <FormSection title="Land characteristics">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Land shape" error={errors.landDetails?.landShape?.message}>
          <select
            {...register('landDetails.landShape')}
            className={inputClass(!!errors.landDetails?.landShape)}
          >
            <option value="">Select shape</option>
            <option value="rectangular">Rectangular</option>
            <option value="square">Square</option>
            <option value="irregular">Irregular</option>
          </select>
        </FormField>

        <FormField label="Topography" error={errors.landDetails?.topography?.message}>
          <select
            {...register('landDetails.topography')}
            className={inputClass(!!errors.landDetails?.topography)}
          >
            <option value="">Select topography</option>
            <option value="flat">Flat</option>
            <option value="sloping">Sloping</option>
          </select>
        </FormField>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Land condition" error={errors.landDetails?.landCondition?.message}>
          <select
            {...register('landDetails.landCondition')}
            className={inputClass(!!errors.landDetails?.landCondition)}
          >
            <option value="">Select condition</option>
            <option value="dry_land">Dry land</option>
            <option value="swampy_land">Swampy land</option>
            <option value="sand_filled">Sand-filled</option>
            <option value="reclaimed_land">Reclaimed land</option>
            <option value="rocky_land">Rocky land</option>
          </select>
        </FormField>

        <FormField label="Soil type" error={errors.landDetails?.soilType?.message}>
          <input
            {...register('landDetails.soilType')}
            placeholder="e.g. loam"
            className={inputClass(!!errors.landDetails?.soilType)}
          />
        </FormField>
      </div>
    </FormSection>

    <FormSection title="Boundaries & access">
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Fenced" error={errors.landDetails?.fenced?.message}>
          <input type="checkbox" {...register('landDetails.fenced')} />
        </FormField>

        <FormField label="Gated" error={errors.landDetails?.gated?.message}>
          <input type="checkbox" {...register('landDetails.gated')} />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Surveyed" error={errors.landDetails?.surveyed?.message}>
          <input type="checkbox" {...register('landDetails.surveyed')} />
        </FormField>

        <FormField label="Corner piece" error={errors.landDetails?.cornerPiece?.message}>
          <input type="checkbox" {...register('landDetails.cornerPiece')} />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Waterfront" error={errors.landDetails?.waterfront?.message}>
          <input type="checkbox" {...register('landDetails.waterfront')} />
        </FormField>

        <FormField label="Facing major road" error={errors.landDetails?.facingMajorRoad?.message}>
          <input type="checkbox" {...register('landDetails.facingMajorRoad')} />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Inside estate" error={errors.landDetails?.insideEstate?.message}>
          <input type="checkbox" {...register('landDetails.insideEstate')} />
        </FormField>

        <FormField label="Orientation" error={errors.landDetails?.orientation?.message}>
          <input
            {...register('landDetails.orientation')}
            placeholder="e.g. North"
            className={inputClass(!!errors.landDetails?.orientation)}
          />
        </FormField>
      </div>
    </FormSection>

    <FormSection title="Title documents">
      <FormField label="Title type(s)" error={errors.landDetails?.titleTypes?.message}>
        <select
          {...register('landDetails.titleTypes')}
          multiple
          className={inputClass(!!errors.landDetails?.titleTypes)}
          size={4}
        >
          {TITLE_TYPES.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </FormField>

      <FormField label="Title status" error={errors.landDetails?.titleStatus?.message}>
        <select
          {...register('landDetails.titleStatus')}
          className={inputClass(!!errors.landDetails?.titleStatus)}
        >
          <option value="">Select status</option>
          <option value="verified">Verified</option>
          <option value="pending">Pending</option>
          <option value="unverified">Unverified</option>
        </select>
      </FormField>
    </FormSection>

    <FormSection title="Infrastructure & utilities">
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Electricity nearby" error={errors.landDetails?.utilities?.electricityNearby?.message}>
          <input type="checkbox" {...register('landDetails.utilities.electricityNearby')} />
        </FormField>

        <FormField label="Water supply" error={errors.landDetails?.utilities?.waterSupply?.message}>
          <input type="checkbox" {...register('landDetails.utilities.waterSupply')} />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Borehole access" error={errors.landDetails?.utilities?.boreholeAccess?.message}>
          <input type="checkbox" {...register('landDetails.utilities.boreholeAccess')} />
        </FormField>

        <FormField label="Drainage" error={errors.landDetails?.utilities?.drainage?.message}>
          <input type="checkbox" {...register('landDetails.utilities.drainage')} />
        </FormField>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Road type" error={errors.landDetails?.roadType?.message}>
          <select
            {...register('landDetails.roadType')}
            className={inputClass(!!errors.landDetails?.roadType)}
          >
            <option value="">Select road type</option>
            <option value="tarred_road">Tarred road</option>
            <option value="untarred_road">Untarred road</option>
          </select>
        </FormField>

        <FormField label="Public transport access" error={errors.landDetails?.publicTransportAccess?.message}>
          <input
            {...register('landDetails.publicTransportAccess')}
            placeholder="e.g. Bus stop nearby"
            className={inputClass(!!errors.landDetails?.publicTransportAccess)}
          />
        </FormField>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <FormField label="Distance to expressway (km)" error={errors.landDetails?.distanceToExpresswayKm?.message}>
          <input
            {...register('landDetails.distanceToExpresswayKm', { valueAsNumber: true })}
            type="number"
            placeholder="e.g. 5"
            className={inputClass(!!errors.landDetails?.distanceToExpresswayKm)}
          />
        </FormField>

        <FormField label="Distance to major road (km)" error={errors.landDetails?.distanceToMajorRoadKm?.message}>
          <input
            {...register('landDetails.distanceToMajorRoadKm', { valueAsNumber: true })}
            type="number"
            placeholder="e.g. 1.2"
            className={inputClass(!!errors.landDetails?.distanceToMajorRoadKm)}
          />
        </FormField>
      </div>
    </FormSection>

    <FormSection title="Estate details">
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Gated estate" error={errors.landDetails?.estateInfo?.gatedEstate?.message}>
          <input type="checkbox" {...register('landDetails.estateInfo.gatedEstate')} />
        </FormField>

        <FormField label="Security" error={errors.landDetails?.estateInfo?.security?.message}>
          <input type="checkbox" {...register('landDetails.estateInfo.security')} />
        </FormField>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Estate fees (₦)" error={errors.landDetails?.estateInfo?.estateFees?.message}>
          <input
            {...register('landDetails.estateInfo.estateFees', { valueAsNumber: true })}
            type="number"
            placeholder="e.g. 200000"
            className={inputClass(!!errors.landDetails?.estateInfo?.estateFees)}
          />
        </FormField>

        <FormField label="Building restrictions" error={errors.landDetails?.estateInfo?.buildingRestrictions?.message}>
          <input
            {...register('landDetails.estateInfo.buildingRestrictions')}
            placeholder="e.g. No commercial buildings"
            className={inputClass(!!errors.landDetails?.estateInfo?.buildingRestrictions)}
          />
        </FormField>
      </div>

      <FormField label="Development stage" error={errors.landDetails?.estateInfo?.developmentStage?.message}>
        <input
          {...register('landDetails.estateInfo.developmentStage')}
          placeholder="e.g. Completed / Ongoing"
          className={inputClass(!!errors.landDetails?.estateInfo?.developmentStage)}
        />
      </FormField>
    </FormSection>

    <FormSection title="Nearby places">
      <div className="space-y-4">
        {NEARBY_PLACES_CATEGORIES.map((category) => (
          <NearbyPlacesCategoryEditor
            key={category.key}
            categoryKey={category.key}
            label={category.label}
            control={control}
          />
        ))}
      </div>
    </FormSection>
  </div>
);

export default LandDetailsSection;
