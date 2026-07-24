import { useMemo, useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MapPin, Shield, Zap, Droplets, Truck, School2, Building2, ShoppingBag, Sparkles, CurrencyDolla } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { neighbourhoodFormSchema } from '../../../lib/neighbourhood-validators';
import type { INeighbourhoodIntelligence } from '../../../types/neighbourhood.types';
import toast from 'react-hot-toast';

type NeighbourhoodFormData = z.infer<typeof neighbourhoodFormSchema>;

const sectionData = [
  {
    title: 'Power',
    icon: Zap,
    fields: [
      { name: 'powerScore', label: 'Power score (0–10)', type: 'number', step: 0.1, min: 0, max: 10 },
      { name: 'powerAvgHoursDaily', label: 'Average power hours daily', type: 'number', step: 0.1, min: 0 },
    ],
  },
  {
    title: 'Flood',
    icon: Droplets,
    fields: [
      { name: 'floodRisk', label: 'Flood risk', type: 'select', options: ['low', 'medium', 'high'] },
      { name: 'floodNotes', label: 'Flood notes', type: 'textarea' },
    ],
  },
  {
    title: 'Security',
    icon: Shield,
    fields: [
      { name: 'securityScore', label: 'Security score (0–10)', type: 'number', step: 0.1, min: 0, max: 10 },
    ],
  },
  {
    title: 'Transit',
    icon: Truck,
    fields: [
      { name: 'commuteScore', label: 'Commute score (0–10)', type: 'number', step: 0.1, min: 0, max: 10 },
      { name: 'transitSafetyScore', label: 'Transit safety score (0–10)', type: 'number', step: 0.1, min: 0, max: 10 },
      { name: 'motoristCoverageKm', label: 'Motorist coverage (km)', type: 'number', min: 0 },
      { name: 'transitNotes', label: 'Transit notes', type: 'textarea' },
    ],
  },
  {
    title: 'Education',
    icon: School2,
    fields: [
      { name: 'schoolCounts.primary', label: 'Primary school count', type: 'number', min: 0 },
      { name: 'schoolCounts.secondary', label: 'Secondary school count', type: 'number', min: 0 },
      { name: 'schoolCounts.tertiary', label: 'Tertiary school count', type: 'number', min: 0 },
      { name: 'schoolCounts.total', label: 'Total school count', type: 'number', min: 0 },
    ],
  },
  {
    title: 'Finance',
    icon: Building2,
    fields: [
      { name: 'bankCount', label: 'Bank count', type: 'number', min: 0 },
      { name: 'dataSources', label: 'Data sources', type: 'text', placeholder: 'resident_reports,partner' },
      { name: 'dataConfidence', label: 'Data confidence', type: 'select', options: ['low', 'medium', 'high'] },
      { name: 'totalReportsUsed', label: 'Total reports used', type: 'number', min: 0, helper: 'System-computed report count; enter only if known.' },
    ],
  },
  {
    title: 'Retail',
    icon: ShoppingBag,
    fields: [
      { name: 'marketCount', label: 'Market count', type: 'number', min: 0 },
    ],
  },
  {
    title: 'Lifestyle',
    icon: Sparkles,
    fields: [
      { name: 'amenities.hospitals', label: 'Hospitals', type: 'text', placeholder: 'Hospital A, Hospital B' },
      { name: 'amenities.schools', label: 'Schools', type: 'text', placeholder: 'School A, School B' },
      { name: 'amenities.markets', label: 'Markets', type: 'text', placeholder: 'Market A, Market B' },
      { name: 'amenities.malls', label: 'Malls', type: 'text', placeholder: 'Mall A, Mall B' },
    ],
  },
  {
    title: 'Cost of Living',
    icon: CurrencyNaira,
    fields: [
      { name: 'typicalRentRange.min', label: 'Typical rent min', type: 'number', min: 0 },
      { name: 'typicalRentRange.max', label: 'Typical rent max', type: 'number', min: 0 },
    ],
  },
  {
    title: 'Summary',
    icon: MapPin,
    fields: [
      { name: 'displayName', label: 'Display name', type: 'text', required: true },
      { name: 'lga', label: 'LGA', type: 'text' },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'imageUrl', label: 'Image URL', type: 'text' },
      { name: 'overallScore', label: 'Overall score (0–10)', type: 'number', step: 0.1, min: 0, max: 10 },
      { name: 'avgRentMin', label: 'Average rent min', type: 'number', min: 0 },
      { name: 'avgRentMax', label: 'Average rent max', type: 'number', min: 0 },
      { name: 'rentCurrency', label: 'Rent currency', type: 'text', placeholder: 'NGN' },
      { name: 'propertiesCount', label: 'Properties count', type: 'number', min: 0 },
      { name: 'isFeatured', label: 'Featured', type: 'checkbox' },
      { name: 'travelTimesToHubs.victoriaIsland', label: 'Victoria Island travel time', type: 'number', min: 0 },
      { name: 'travelTimesToHubs.ikeja', label: 'Ikeja travel time', type: 'number', min: 0 },
      { name: 'travelTimesToHubs.lekki', label: 'Lekki travel time', type: 'number', min: 0 },
      { name: 'travelTimesToHubs.maryland', label: 'Maryland travel time', type: 'number', min: 0 },
    ],
  },
];

interface NeighbourhoodDataFormProps {
  areas: INeighbourhoodIntelligence[];
}

const NeighbourhoodDataForm = ({ areas }: NeighbourhoodDataFormProps) => {
  const [selectedAreaId, setSelectedAreaId] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  const defaultValues: NeighbourhoodFormData = {
    areaName: '',
    displayName: '',
    lga: '',
    powerScore: null,
    powerAvgHoursDaily: null,
    floodRisk: null,
    floodNotes: null,
    securityScore: null,
    commuteScore: null,
    dataConfidence: 'low',
    totalReportsUsed: null,
    dataSources: '',
    description: '',
    amenities: { hospitals: '', schools: '', markets: '', malls: '' },
    schoolCounts: { primary: null, secondary: null, tertiary: null, total: null },
    bankCount: null,
    marketCount: null,
    transitSafetyScore: null,
    motoristCoverageKm: null,
    transitNotes: '',
    typicalRentRange: { min: null, max: null },
    imageUrl: '',
    overallScore: null,
    avgRentMin: null,
    avgRentMax: null,
    rentCurrency: 'NGN',
    propertiesCount: null,
    isFeatured: false,
    travelTimesToHubs: { victoriaIsland: null, ikeja: null, lekki: null, maryland: null },
  };

  const {
    register,
    handleSubmit,
    watch,
    control,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<NeighbourhoodFormData>({
    resolver: zodResolver(neighbourhoodFormSchema),
    defaultValues,
  });

  const areaOptions = useMemo(
    () => [{ label: 'Create new neighbourhood', value: '' },
      ...areas.map((area) => ({ label: area.displayName, value: area.areaName }))],
    [areas]
  );

  const selectedArea = watch('areaName');

  const onSelectArea = (areaName: string) => {
    setSelectedAreaId(areaName);
    const area = areas.find((item) => item.areaName === areaName);
    if (area) {
      reset({
        ...defaultValues,
        ...area,
        dataSources: area.dataSources?.join(', ') ?? '',
        amenities: {
          hospitals: area.amenities?.hospitals?.join(', ') ?? '',
          schools: area.amenities?.schools?.join(', ') ?? '',
          markets: area.amenities?.markets?.join(', ') ?? '',
          malls: area.amenities?.malls?.join(', ') ?? '',
        },
        schoolCounts: {
          primary: area.schoolCounts?.primary ?? null,
          secondary: area.schoolCounts?.secondary ?? null,
          tertiary: area.schoolCounts?.tertiary ?? null,
          total: area.schoolCounts?.total ?? null,
        },
        typicalRentRange: {
          min: area.typicalRentRange?.min ?? null,
          max: area.typicalRentRange?.max ?? null,
        },
        travelTimesToHubs: {
          victoriaIsland: area.travelTimesToHubs?.victoriaIsland ?? null,
          ikeja: area.travelTimesToHubs?.ikeja ?? null,
          lekki: area.travelTimesToHubs?.lekki ?? null,
          maryland: area.travelTimesToHubs?.maryland ?? null,
        },
      });
    } else {
      reset(defaultValues);
    }
  };

  const onSubmit: SubmitHandler<NeighbourhoodFormData> = async (data) => {
    setIsSaved(false);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsSaved(true);
    toast.success(`Neighbourhood ${data.areaName || data.displayName} saved successfully`);
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[#0F172A]">Create or edit a neighbourhood</h2>
          <p className="mt-1 text-sm text-slate-500">
            Select an existing neighbourhood or start a new one, then fill the intelligence fields.
          </p>
        </div>
      </div>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Existing neighbourhood</label>
          <select
            value={selectedAreaId}
            onChange={(e) => onSelectArea(e.target.value)}
            className={inputClass(false)}
          >
            {areaOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        <div className="grid gap-4">
          {sectionData.map((section) => (
            <div key={section.title} className="rounded-3xl border border-slate-200 p-5 bg-slate-50">
              <div className="mb-5 flex items-center gap-3">
                <section.icon className="h-5 w-5 text-[#00C9A7]" />
                <h3 className="text-lg font-semibold text-[#0F172A]">{section.title}</h3>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {section.fields.map((field) => {
                  const error = field.name.includes('.')
                    ? (field.name.split('.').reduce((obj: any, key) => obj?.[key], errors as any) as any)
                    : (errors as any)[field.name];

                  return (
                    <div key={field.name}>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        {field.label}
                        {field.required && <span className="text-red-500">*</span>}
                      </label>
                      {field.type === 'textarea' ? (
                        <textarea
                          {...register(field.name as any)}
                          rows={4}
                          className={inputClass(Boolean(error))}
                          placeholder={field.placeholder || ''}
                        />
                      ) : field.type === 'select' ? (
                        <select {...register(field.name as any)} className={inputClass(Boolean(error))}>
                          <option value="">Select</option>
                          {field.options?.map((option) => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      ) : field.type === 'checkbox' ? (
                        <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                          <input
                            type="checkbox"
                            {...register(field.name as any)}
                            className="h-4 w-4 rounded border-slate-300 text-[#00C9A7] focus:ring-[#00C9A7]"
                          />
                          {field.label}
                        </label>
                      ) : (
                        <input
                          type={field.type}
                          step={field.step}
                          min={field.min}
                          max={field.max}
                          placeholder={field.placeholder || ''}
                          {...register(field.name as any)}
                          className={inputClass(Boolean(error))}
                        />
                      )}
                      {field.helper && <p className="mt-1 text-xs text-slate-500">{field.helper}</p>}
                      {error && <p className="mt-1 text-xs text-red-500">{error.message}</p>}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-slate-500">Saves are currently mocked. When backend endpoints are ready, this will become a real create/update request.</p>
            <p className="text-sm text-slate-500">Note: totalReportsUsed is a system-computed report count, not a free-entry field.</p>
            {isSaved && <p className="mt-2 text-sm text-[#0F172A]">Saved locally in the UI as a mock success.</p>}
          </div>
          <button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="inline-flex items-center justify-center rounded-full bg-[#0A1628] px-6 py-3 text-sm font-semibold text-white hover:bg-[#0A1628]/90 disabled:opacity-60 transition-colors"
          >
            Save neighbourhood
          </button>
        </div>
      </div>
    </div>
  );
};

const inputClass = (hasError: boolean) => cn(
  'w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition-colors',
  hasError
    ? 'border-red-300 focus:ring-red-200'
    : 'border-slate-200 focus:border-[#00C9A7] focus:ring-[#00C9A7]/20'
);

export default NeighbourhoodDataForm;
