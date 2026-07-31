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

const FormSection = ({ title, children }: { title: string; children: ReactNode }) => (
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

interface BuildingDetailsSectionProps {
  register: UseFormRegister<ListingFormData>;
  control: Control<ListingFormData>;
  errors: FieldErrors<ListingFormData>;
}

type NearbyAmenitiesCategory =
  | 'schools'
  | 'hospitals'
  | 'malls'
  | 'markets'
  | 'supermarkets'
  | 'churches'
  | 'mosques'
  | 'banks'
  | 'fuelStations'
  | 'pharmacies';

type NearbyItemDraft = {
  name: string;
  distanceKm: string;
  notes: string;
};

const NEARBY_AMENITIES_CATEGORIES: Array<{ key: NearbyAmenitiesCategory; label: string }> = [
  { key: 'schools', label: 'Schools' },
  { key: 'hospitals', label: 'Hospitals' },
  { key: 'malls', label: 'Malls' },
  { key: 'markets', label: 'Markets' },
  { key: 'supermarkets', label: 'Supermarkets' },
  { key: 'churches', label: 'Churches' },
  { key: 'mosques', label: 'Mosques' },
  { key: 'banks', label: 'Banks' },
  { key: 'fuelStations', label: 'Fuel stations' },
  { key: 'pharmacies', label: 'Pharmacies' },
];

const emptyNearbyItemDraft: NearbyItemDraft = {
  name: '',
  distanceKm: '',
  notes: '',
};

const NearbyAmenitiesCategoryEditor = ({
  categoryKey,
  label,
  control,
}: {
  categoryKey: NearbyAmenitiesCategory;
  label: string;
  control: Control<ListingFormData>;
}) => {
  const arrayName = `nearbyAmenities.${categoryKey}` as const;
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
};

const BuildingDetailsSection = ({ register, control, errors }: BuildingDetailsSectionProps) => (
  <div className="space-y-5">
    <FormSection title="Building profile">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Toilets" error={errors.buildingDetails?.toilets?.message}>
          <input
            {...register('buildingDetails.toilets', { valueAsNumber: true })}
            type="number"
            placeholder="e.g. 2"
            className={inputClass(!!errors.buildingDetails?.toilets)}
          />
        </FormField>

        <FormField label="Floors" error={errors.buildingDetails?.floors?.message}>
          <input
            {...register('buildingDetails.floors', { valueAsNumber: true })}
            type="number"
            placeholder="e.g. 3"
            className={inputClass(!!errors.buildingDetails?.floors)}
          />
        </FormField>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Living rooms" error={errors.buildingDetails?.livingRooms?.message}>
          <input
            {...register('buildingDetails.livingRooms', { valueAsNumber: true })}
            type="number"
            placeholder="e.g. 1"
            className={inputClass(!!errors.buildingDetails?.livingRooms)}
          />
        </FormField>

        <FormField label="Dining area" error={errors.buildingDetails?.diningArea?.message}>
          <input type="checkbox" {...register('buildingDetails.diningArea')} />
        </FormField>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Kitchen" error={errors.buildingDetails?.kitchen?.message}>
          <input type="checkbox" {...register('buildingDetails.kitchen')} />
        </FormField>

        <FormField label="Balcony" error={errors.buildingDetails?.balcony?.message}>
          <input type="checkbox" {...register('buildingDetails.balcony')} />
        </FormField>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Study room" error={errors.buildingDetails?.studyRoom?.message}>
          <input type="checkbox" {...register('buildingDetails.studyRoom')} />
        </FormField>

        <FormField label="Maid's room" error={errors.buildingDetails?.maidsRoom?.message}>
          <input type="checkbox" {...register('buildingDetails.maidsRoom')} />
        </FormField>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Store room" error={errors.buildingDetails?.storeRoom?.message}>
          <input type="checkbox" {...register('buildingDetails.storeRoom')} />
        </FormField>

        <FormField label="Laundry room" error={errors.buildingDetails?.laundryRoom?.message}>
          <input type="checkbox" {...register('buildingDetails.laundryRoom')} />
        </FormField>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Walk-in closet" error={errors.buildingDetails?.walkInCloset?.message}>
          <input type="checkbox" {...register('buildingDetails.walkInCloset')} />
        </FormField>

        <FormField label="Terrace" error={errors.buildingDetails?.terrace?.message}>
          <input type="checkbox" {...register('buildingDetails.terrace')} />
        </FormField>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Penthouse level" error={errors.buildingDetails?.penthouseLevel?.message}>
          <input
            {...register('buildingDetails.penthouseLevel', { valueAsNumber: true })}
            type="number"
            placeholder="e.g. 1"
            className={inputClass(!!errors.buildingDetails?.penthouseLevel)}
          />
        </FormField>

        <FormField label="Total floor area (sqm)" error={errors.buildingDetails?.totalFloorAreaSqm?.message}>
          <input
            {...register('buildingDetails.totalFloorAreaSqm', { valueAsNumber: true })}
            type="number"
            placeholder="e.g. 240"
            className={inputClass(!!errors.buildingDetails?.totalFloorAreaSqm)}
          />
        </FormField>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Land size (sqm)" error={errors.buildingDetails?.landSizeSqm?.message}>
          <input
            {...register('buildingDetails.landSizeSqm', { valueAsNumber: true })}
            type="number"
            placeholder="e.g. 400"
            className={inputClass(!!errors.buildingDetails?.landSizeSqm)}
          />
        </FormField>

        <FormField label="Year built" error={errors.buildingDetails?.yearBuilt?.message}>
          <input
            {...register('buildingDetails.yearBuilt', { valueAsNumber: true })}
            type="number"
            placeholder="e.g. 2018"
            className={inputClass(!!errors.buildingDetails?.yearBuilt)}
          />
        </FormField>
      </div>

      <FormField label="Last renovated" error={errors.buildingDetails?.lastRenovated?.message}>
        <input
          {...register('buildingDetails.lastRenovated')}
          placeholder="e.g. 2024"
          className={inputClass(!!errors.buildingDetails?.lastRenovated)}
        />
      </FormField>
    </FormSection>

    <FormSection title="Interior features">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: 'POP ceiling', name: 'buildingDetails.interiorFeatures.popCeiling' },
          { label: 'Tiles', name: 'buildingDetails.interiorFeatures.tiles' },
          { label: 'Marble flooring', name: 'buildingDetails.interiorFeatures.marbleFlooring' },
          { label: 'Wooden floor', name: 'buildingDetails.interiorFeatures.woodenFloor' },
          { label: 'Air conditioning', name: 'buildingDetails.interiorFeatures.airConditioning' },
          { label: 'Water heater', name: 'buildingDetails.interiorFeatures.waterHeater' },
          { label: 'Fitted kitchen', name: 'buildingDetails.interiorFeatures.fittedKitchen' },
          { label: 'Kitchen cabinets', name: 'buildingDetails.interiorFeatures.kitchenCabinets' },
          { label: 'Oven', name: 'buildingDetails.interiorFeatures.oven' },
          { label: 'Microwave', name: 'buildingDetails.interiorFeatures.microwave' },
          { label: 'Refrigerator', name: 'buildingDetails.interiorFeatures.refrigerator' },
          { label: 'Smart home', name: 'buildingDetails.interiorFeatures.smartHomeFeatures' },
          { label: 'Intercom', name: 'buildingDetails.interiorFeatures.intercom' },
          { label: 'Smoke detector', name: 'buildingDetails.interiorFeatures.smokeDetector' },
          { label: 'Fire alarm', name: 'buildingDetails.interiorFeatures.fireAlarm' },
        ].map((field) => (
          <FormField key={field.name} label={field.label} error={errors.buildingDetails?.interiorFeatures?.[field.name.split('.').pop() ?? '']?.message}>
            <input type="checkbox" {...register(field.name as const)} />
          </FormField>
        ))}
      </div>
    </FormSection>

    <FormSection title="Exterior features">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: 'Garden', name: 'buildingDetails.exteriorFeatures.garden' },
          { label: 'Playground', name: 'buildingDetails.exteriorFeatures.playground' },
          { label: 'Carport', name: 'buildingDetails.exteriorFeatures.carport' },
          { label: 'Security house', name: 'buildingDetails.exteriorFeatures.securityHouse' },
          { label: 'Fence', name: 'buildingDetails.exteriorFeatures.fence' },
          { label: 'Gate', name: 'buildingDetails.exteriorFeatures.gate' },
          { label: 'Water tank', name: 'buildingDetails.exteriorFeatures.waterTank' },
          { label: 'Solar power', name: 'buildingDetails.exteriorFeatures.solarPower' },
          { label: 'Elevator', name: 'buildingDetails.exteriorFeatures.elevator' },
          { label: 'Rooftop lounge', name: 'buildingDetails.exteriorFeatures.rooftopLounge' },
        ].map((field) => (
          <FormField key={field.name} label={field.label} error={errors.buildingDetails?.exteriorFeatures?.[field.name.split('.').pop() ?? '']?.message}>
            <input type="checkbox" {...register(field.name as const)} />
          </FormField>
        ))}
      </div>

      <FormField label="Parking spaces" error={errors.buildingDetails?.exteriorFeatures?.parkingSpaces?.message}>
        <input
          {...register('buildingDetails.exteriorFeatures.parkingSpaces', { valueAsNumber: true })}
          type="number"
          placeholder="e.g. 2"
          className={inputClass(!!errors.buildingDetails?.exteriorFeatures?.parkingSpaces)}
        />
      </FormField>
    </FormSection>

    <FormSection title="Utilities">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: 'Electricity', name: 'buildingDetails.utilities.electricity' },
          { label: 'Water supply', name: 'buildingDetails.utilities.waterSupply' },
          
          { label: 'Cable TV', name: 'buildingDetails.utilities.cableTv' },
          { label: 'Sewage', name: 'buildingDetails.utilities.sewage' },
          { label: 'Drainage', name: 'buildingDetails.utilities.drainage' },
          { label: 'Waste disposal', name: 'buildingDetails.utilities.wasteDisposal' },
        ].map((field) => (
          <FormField key={field.name} label={field.label} error={errors.buildingDetails?.utilities?.[field.name.split('.').pop() ?? '']?.message}>
            <input type="checkbox" {...register(field.name as const)} />
          </FormField>
        ))}
      </div>
    </FormSection>

    <FormSection title="Security features">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: 'Estate security', name: 'buildingDetails.securityFeatures.estateSecurity' },
          { label: 'Gated community', name: 'buildingDetails.securityFeatures.gatedCommunity' },
          { label: 'Access control', name: 'buildingDetails.securityFeatures.accessControl' },
          { label: 'Security guards', name: 'buildingDetails.securityFeatures.securityGuards' },
          { label: 'Electric fence', name: 'buildingDetails.securityFeatures.electricFence' },
        ].map((field) => (
          <FormField key={field.name} label={field.label} error={errors.buildingDetails?.securityFeatures?.[field.name.split('.').pop() ?? '']?.message}>
            <input type="checkbox" {...register(field.name as const)} />
          </FormField>
        ))}
      </div>
    </FormSection>

    <FormSection title="Nearby amenities">
      <div className="space-y-4">
        {NEARBY_AMENITIES_CATEGORIES.map((category) => (
          <NearbyAmenitiesCategoryEditor
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

export default BuildingDetailsSection;
