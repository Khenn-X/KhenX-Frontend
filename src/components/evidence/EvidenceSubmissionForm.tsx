import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FileText, MapPin, ShieldCheck, UploadCloud } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAllAreas } from '../../hooks/useNeighbourhood';
import { useSubmitEvidence } from '../../hooks/useEvidence';
import { evidenceApi } from '../../api/evidence.api';
import { useQuery } from '@tanstack/react-query';

type ClaimTypeValue = string;

type ClaimTypeOption = {
  value: string;
  label: string;
  valueType: 'number' | 'select' | 'text';
  helper: string;
  unitLabel?: string;
  options?: string[];
  isSyncConfigured: boolean;
};

type EvidenceFormValues = {
  sourceId: string;
  entityIdentifier: string;
  claimType: ClaimTypeValue;
  value: string;
  observedAt: string;
  confidence: string;
};

type NewSourceFormValues = {
  name: string;
  organization: string;
  domain: string;
  tier: string;
  sourceType: string;
  url: string;
};

const SOURCE_DOMAINS = ['power', 'flood', 'security', 'traffic', 'cost', 'lifestyle', 'amenities', 'geography', 'property'];
const SOURCE_TYPES = ['government', 'commercial', 'open_data', 'community', 'internal_submission', 'field_verification'];
const SOURCE_TIER_LABELS: Record<string, string> = {
  '1': 'Tier 1 — highest trust',
  '2': 'Tier 2 — very high trust',
  '3': 'Tier 3 — high trust',
  '4': 'Tier 4 — established open data',
  '5': 'Tier 5 — moderate trust',
  '6': 'Tier 6 — community or manual report',
  '7': 'Tier 7 — lowest trust',
};

const inputClass = (hasError: boolean) =>
  `w-full rounded-xl border bg-white px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
    hasError ? 'border-red-300 focus:ring-red-200' : 'border-slate-200 focus:border-[#00C9A7] focus:ring-[#00C9A7]/20'
  }`;

const EvidenceSubmissionForm = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isCreatingSource, setIsCreatingSource] = useState(false);
  const [newSource, setNewSource] = useState<NewSourceFormValues>({
    name: '',
    organization: '',
    domain: 'flood',
    tier: '6',
    sourceType: 'community',
    url: '',
  });
  const { data: areasData, isLoading: areasLoading } = useAllAreas();
  const { data: sourcesData, isLoading: sourcesLoading, refetch: refetchSources } = useQuery({
    queryKey: ['sources', 'evidence'],
    queryFn: () => evidenceApi.listSources(),
  });
  const { data: claimTypesData, isLoading: claimTypesLoading } = useQuery({
    queryKey: ['claim-types', 'evidence'],
    queryFn: () => evidenceApi.listClaimTypes(),
  });
  const { mutateAsync: submitEvidence, isPending } = useSubmitEvidence();

  const claimTypeOptions = useMemo<ClaimTypeOption[]>(
    () => (claimTypesData?.data ?? []) as ClaimTypeOption[],
    [claimTypesData],
  );

  const areaOptions = useMemo(
    () => ((areasData?.data?.areas ?? []) as Array<{ _id?: string; areaName?: string; displayName?: string }>).map((area) => ({
      value: area.displayName || area.areaName || '',
      label: area.displayName || area.areaName || 'Unnamed area',
    })),
    [areasData],
  );

  const sourceOptions = useMemo(
    () => (sourcesData?.data ?? []) as Array<{ _id: string; name: string; domain?: string; isActive?: boolean }>,
    [sourcesData],
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<EvidenceFormValues>({
    defaultValues: {
      sourceId: '',
      entityIdentifier: '',
      claimType: 'power_supply_hours',
      value: '',
      observedAt: new Date().toISOString().slice(0, 10),
      confidence: '0.8',
    },
  });

  const selectedClaimType = watch('claimType');
  const selectedOption = claimTypeOptions.find((option) => option.value === selectedClaimType) ?? claimTypeOptions[0] ?? {
    value: 'power_supply_hours',
    label: 'Power supply hours',
    valueType: 'number',
    helper: 'Expected in hours per day.',
    isSyncConfigured: true,
  };

  const onSubmit = async (values: EvidenceFormValues) => {
    if (!values.sourceId && !isCreatingSource) {
      toast.error('Select a trusted source before submitting.');
      return;
    }

    if (isCreatingSource && !newSource.name.trim()) {
      toast.error('Enter a name for the new source.');
      return;
    }

    if (!values.entityIdentifier.trim()) {
      toast.error('Select a neighbourhood before submitting.');
      return;
    }

    let sourceId = values.sourceId;
    const formData = new FormData();
    formData.append('sourceId', sourceId);
    formData.append('entityType', 'neighbourhood');
    formData.append('entityIdentifier', values.entityIdentifier);
    formData.append('claimType', values.claimType);

    const rawValue = values.value.trim();
    if (values.claimType === 'power_supply_hours') {
      const numericValue = Number(rawValue);
      if (!Number.isFinite(numericValue)) {
        toast.error('Power supply hours must be a valid number.');
        return;
      }
      formData.append('value', JSON.stringify({ value: numericValue, unit: 'hours/day' }));
    } else if (values.claimType === 'flood_risk') {
      if (!['low', 'moderate', 'high', 'very_high'].includes(rawValue)) {
        toast.error('Choose a valid flood severity value.');
        return;
      }
      formData.append('value', rawValue);
    } else {
      formData.append('value', rawValue);
    }

    if (isCreatingSource) {
      try {
        const sourceResponse = await evidenceApi.createSource({
          name: newSource.name.trim(),
          organization: newSource.organization.trim() || undefined,
          domain: newSource.domain,
          tier: Number(newSource.tier),
          sourceType: newSource.sourceType,
          url: newSource.url.trim() || undefined,
        });
        sourceId = sourceResponse.data?._id ?? '';
        if (!sourceId) {
          toast.error('Source was not created. Evidence was not submitted.');
          return;
        }
        await refetchSources();
      } catch (error: any) {
        toast.error(error?.response?.data?.message || 'Unable to create the new source. Evidence was not submitted.');
        return;
      }
    }

    formData.set('sourceId', sourceId);

    const finalSourceIds = formData.getAll('sourceId');
    if (finalSourceIds.length !== 1 || typeof finalSourceIds[0] !== 'string' || !finalSourceIds[0]) {
      toast.error('Unable to prepare the evidence source. Evidence was not submitted.');
      return;
    }

    formData.append('observedAt', values.observedAt || new Date().toISOString());
    formData.append('confidence', values.confidence);

    if (selectedFile) {
      formData.append('sourceDocument', selectedFile);
    }

    try {
      const response = await submitEvidence(formData);
        toast.success(response.message || 'Evidence submitted for review.');
        setSelectedFile(null);
        setValue('value', '');
        setValue('sourceId', '');
        setValue('entityIdentifier', '');
        setValue('confidence', '0.8');
        setValue('observedAt', new Date().toISOString().slice(0, 10));
        setIsCreatingSource(false);
        setNewSource({ name: '', organization: '', domain: 'flood', tier: '6', sourceType: 'community', url: '' });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Unable to submit evidence right now.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00C9A7]/10 text-[#00C9A7]">
          <FileText className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Evidence intake</p>
          <h2 className="text-xl font-bold text-[#0F172A]">Submit a neighbourhood claim</h2>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <label className="block text-sm font-medium text-slate-700">Trusted source</label>
            <button
              type="button"
              onClick={() => setIsCreatingSource((current) => !current)}
              className="text-sm font-semibold text-[#008f79] hover:text-[#006f60]"
            >
              {isCreatingSource ? 'Use existing source' : '+ Create new source'}
            </button>
          </div>
          <select
            {...register('sourceId', { required: !isCreatingSource })}
            className={inputClass(Boolean(errors.sourceId))}
            disabled={sourcesLoading || isCreatingSource}
          >
            <option value="">Select source</option>
            {sourceOptions.map((source) => (
              <option key={source._id} value={source._id}>
                {source.name} {source.domain ? `• ${source.domain}` : ''}
              </option>
            ))}
          </select>
          {errors.sourceId && !isCreatingSource && <p className="text-xs text-red-500">A source is required.</p>}

          {isCreatingSource && (
            <div className="mt-3 grid gap-3 rounded-2xl border border-[#00C9A7]/20 bg-[#00C9A7]/5 p-4 sm:grid-cols-2">
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Source name *</label>
                <input value={newSource.name} onChange={(event) => setNewSource((current) => ({ ...current, name: event.target.value }))} className={inputClass(false)} placeholder="e.g. Resident report - Ikoyi" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Organization</label>
                <input value={newSource.organization} onChange={(event) => setNewSource((current) => ({ ...current, organization: event.target.value }))} className={inputClass(false)} placeholder="Optional" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Domain *</label>
                <select value={newSource.domain} onChange={(event) => setNewSource((current) => ({ ...current, domain: event.target.value }))} className={inputClass(false)}>
                  {SOURCE_DOMAINS.map((domain) => <option key={domain} value={domain}>{domain}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Tier *</label>
                <select value={newSource.tier} onChange={(event) => setNewSource((current) => ({ ...current, tier: event.target.value }))} className={inputClass(false)}>
                  {Object.entries(SOURCE_TIER_LABELS).map(([tier, label]) => <option key={tier} value={tier}>{label}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Source type *</label>
                <select value={newSource.sourceType} onChange={(event) => setNewSource((current) => ({ ...current, sourceType: event.target.value }))} className={inputClass(false)}>
                  {SOURCE_TYPES.map((sourceType) => <option key={sourceType} value={sourceType}>{sourceType}</option>)}
                </select>
              </div>
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">URL</label>
                <input type="url" value={newSource.url} onChange={(event) => setNewSource((current) => ({ ...current, url: event.target.value }))} className={inputClass(false)} placeholder="Optional source URL" />
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="block text-sm font-medium text-slate-700">Neighbourhood</label>
          <select
            {...register('entityIdentifier', { required: true })}
            className={inputClass(Boolean(errors.entityIdentifier))}
            disabled={areasLoading}
          >
            <option value="">Select a neighbourhood</option>
            {areaOptions.map((area) => (
              <option key={area.value} value={area.value}>
                {area.label}
              </option>
            ))}
          </select>
          {errors.entityIdentifier && <p className="text-xs text-red-500">A neighbourhood is required.</p>}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">Claim type</label>
          <select {...register('claimType')} className={inputClass(false)} disabled={claimTypesLoading}>
            {claimTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}{option.isSyncConfigured ? '' : ' • review-only'}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">Confidence</label>
          <input
            type="number"
            min={0}
            max={1}
            step="0.01"
            {...register('confidence', { required: true, valueAsNumber: false })}
            className={inputClass(Boolean(errors.confidence))}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="block text-sm font-medium text-slate-700">Value</label>
          {selectedOption.valueType === 'select' ? (
            <select {...register('value')} className={inputClass(false)}>
              <option value="">Choose a value</option>
              {selectedOption.options?.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          ) : (
            <input
              type={selectedOption.valueType === 'number' ? 'number' : 'text'}
              step={selectedOption.valueType === 'number' ? 'any' : undefined}
              {...register('value', { required: true })}
              placeholder={selectedOption.valueType === 'number' ? 'e.g. 20' : 'Add supporting context'}
              className={inputClass(Boolean(errors.value))}
            />
          )}
          <p className="text-xs text-slate-500">{selectedOption.helper}</p>
          {!selectedOption.isSyncConfigured && (
            <p className="text-xs font-medium text-amber-600">Review-only claim type: this item is queued for review and is not synced to neighbourhood metrics yet.</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">Observed date</label>
          <input type="date" {...register('observedAt')} className={inputClass(false)} />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">Supporting document</label>
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-sm text-slate-600 transition hover:border-[#00C9A7] hover:bg-[#00C9A7]/5">
            <UploadCloud className="h-4 w-4" />
            <span>{selectedFile ? selectedFile.name : 'Upload PDF or image'}</span>
            <input
              type="file"
              accept=".pdf,image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
            />
          </label>
        </div>
      </div>

      <div className="rounded-2xl border border-[#00C9A7]/15 bg-[#00C9A7]/5 p-3 text-sm text-slate-600">
        <div className="flex items-start gap-2">
          <ShieldCheck className="mt-0.5 h-4 w-4 text-[#00C9A7]" />
          <p>
            Submissions enter the existing admin review queue. Claim types without a live sync rule are still reviewed for quality, but they do not change neighbourhood scores until a sync rule is configured.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-slate-200 pt-4">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <MapPin className="h-4 w-4" />
          <span>Review-first workflow</span>
        </div>

        <button
          type="submit"
          disabled={isPending || sourcesLoading || areasLoading}
          className="rounded-xl bg-[#00C9A7] px-4 py-2.5 text-sm font-semibold text-[#0A1628] transition hover:bg-[#00b396] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? 'Submitting…' : 'Submit evidence'}
        </button>
      </div>
    </form>
  );
};

export default EvidenceSubmissionForm;
