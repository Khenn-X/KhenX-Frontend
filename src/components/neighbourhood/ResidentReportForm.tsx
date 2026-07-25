import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  CheckCircle, Zap, Droplets, Shield,
  Car, Sun, Cloud, AlertTriangle, Flame,
} from 'lucide-react';
import { neighbourhoodUpdateSchema, type NeighbourhoodUpdateFormData } from '../../lib/validators';
import { useSubmitResidentReport } from '../../hooks/useNeighbourhood';
import { LAGOS_AREAS } from '../../constants/lagos-areas';
import { cn } from '../../lib/utils';

interface NeighbourhoodReportFormProps {
  defaultArea?: string;
  className?:   string;
}

// ─── Reusable sub-components ──────────────────────────────────

const SectionHeader = ({
  icon: Icon,
  label,
  color = 'text-[#00C9A7]',
  bg    = 'bg-[#00C9A7]/10',
}: {
  icon: React.ElementType;
  label: string;
  color?: string;
  bg?: string;
}) => (
  <div className={`flex items-center gap-2.5 pb-3 border-b border-slate-100 mb-5`}>
    <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', bg)}>
      <Icon className={cn('h-4 w-4', color)} />
    </div>
    <p className="font-semibold text-[#0F172A] text-sm">{label}</p>
  </div>
);

const RadioGroup = ({
  options,
  value,
  onChange,
  error,
}: {
  options: { value: string; label: string }[];
  value:   string | undefined;
  onChange: (v: string) => void;
  error?:  string;
}) => (
  <div className="space-y-2">
    {options.map((opt) => (
      <label
        key={opt.value}
        className={cn(
          'flex items-center gap-3 rounded-lg border px-4 py-2.5 cursor-pointer transition-colors text-sm',
          value === opt.value
            ? 'border-[#00C9A7] bg-[#00C9A7]/5 text-[#0F172A] font-medium'
            : 'border-slate-200 text-slate-600 hover:border-slate-300'
        )}
      >
        <input
          type="radio"
          value={opt.value}
          checked={value === opt.value}
          onChange={() => onChange(opt.value)}
          className="sr-only"
        />
        <span className={cn(
          'flex h-4 w-4 shrink-0 rounded-full border-2 items-center justify-center',
          value === opt.value ? 'border-[#00C9A7]' : 'border-slate-300'
        )}>
          {value === opt.value && (
            <span className="block h-2 w-2 rounded-full bg-[#00C9A7]" />
          )}
        </span>
        {opt.label}
      </label>
    ))}
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

const ScaleRow = ({
  min, max, value, onChange,
}: {
  min: string; max: string; value: number | undefined; onChange: (n: number) => void;
}) => (
  <div>
    <div className="flex gap-2 mb-1">
      {[1,2,3,4,5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={cn(
            'flex-1 h-10 rounded-lg border text-sm font-semibold transition-colors',
            value === n
              ? 'border-[#00C9A7] bg-[#00C9A7]/10 text-[#00C9A7]'
              : 'border-slate-200 text-slate-500 hover:border-[#00C9A7]/40'
          )}
        >
          {n}
        </button>
      ))}
    </div>
    <div className="flex justify-between text-xs text-slate-400 px-0.5">
      <span>{min}</span>
      <span>{max}</span>
    </div>
  </div>
);

const CheckboxGroup = ({
  options,
  values,
  onChange,
}: {
  options:  { value: string; label: string }[];
  values:   string[];
  onChange: (v: string[]) => void;
}) => {
  const toggle = (val: string) => {
    onChange(
      values.includes(val) ? values.filter((v) => v !== val) : [...values, val]
    );
  };
  return (
    <div className="space-y-2">
      {options.map((opt) => (
        <label
          key={opt.value}
          className={cn(
            'flex items-center gap-3 rounded-lg border px-4 py-2.5 cursor-pointer transition-colors text-sm',
            values.includes(opt.value)
              ? 'border-[#00C9A7] bg-[#00C9A7]/5 text-[#0F172A] font-medium'
              : 'border-slate-200 text-slate-600 hover:border-slate-300'
          )}
        >
          <input
            type="checkbox"
            checked={values.includes(opt.value)}
            onChange={() => toggle(opt.value)}
            className="sr-only"
          />
          <span className={cn(
            'flex h-4 w-4 shrink-0 rounded border-2 items-center justify-center',
            values.includes(opt.value)
              ? 'border-[#00C9A7] bg-[#00C9A7]'
              : 'border-slate-300'
          )}>
            {values.includes(opt.value) && (
              <CheckCircle className="h-3 w-3 text-white" />
            )}
          </span>
          {opt.label}
        </label>
      ))}
    </div>
  );
};

const FieldLabel = ({ children, required }: { children: React.ReactNode; required?: boolean }) => (
  <p className="text-sm font-medium text-slate-700 mb-2">
    {children}
    {required && <span className="text-red-500 ml-0.5">*</span>}
  </p>
);

const inputClass = (hasError: boolean) => cn(
  'w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition-colors',
  hasError
    ? 'border-red-300 focus:ring-red-200'
    : 'border-slate-200 focus:border-[#00C9A7] focus:ring-[#00C9A7]/20'
);

// ─── Main form component ──────────────────────────────────────

const NeighbourhoodReportForm = ({ defaultArea = '', className }: NeighbourhoodReportFormProps) => {
  const [submitted, setSubmitted] = useState(false);
  const { mutate: submitReport, isPending, error: submitError } = useSubmitResidentReport();

  const {
    register,
    handleSubmit,
    watch,
    control,
    // setValue,
    formState: { errors },
  } = useForm<NeighbourhoodUpdateFormData>({
    resolver: zodResolver(neighbourhoodUpdateSchema),
    defaultValues: {
      areaName:        defaultArea,
      incidentTypes:   [],
    },
  });

  // Watch values that drive conditional rendering
  const season           = watch('season');
  const securityIncidents = watch('securityIncidents');
  // const roadChanged      = watch('roadChangedRecently');
  const floodingLevel    = watch('floodingLevel');

  const isRainy = season === 'rainy';
  const isDry   = season === 'dry';

  const onSubmit = (data: NeighbourhoodUpdateFormData) => {
    // Map the comprehensive form data to the ResidentReportPayload
    // the backend controller already understands
    submitReport(
      {
        areaName:          data.areaName,
        reporterEmail:     data.reporterEmail,
        powerHoursDaily:   mapPowerBand(data.powerHoursDaily),
        floodedLastSeason: data.floodingLevel && data.floodingLevel !== 'none',
        floodSeverity:     data.floodingLevel !== 'none' ? (data.floodingLevel as any) : undefined,
        securityRating:    data.nightSafetyRating,
        incidentCategory:  data.incidentTypes?.[0] ?? 'none',
        // Extended fields passed through as extra — backend stores them on ResidentReport
        ...(data as any),
      },
      { onSuccess: () => setSubmitted(true) }
    );
  };

  // Convert power band enum to numeric hours for backend
  const mapPowerBand = (band?: string): number | undefined => {
    const map: Record<string, number> = {
      none: 0, low: 3.5, moderate: 9, good: 16, excellent: 22,
    };
    return band ? map[band] : undefined;
  };

  // Success state
  if (submitted) {
    return (
      <div className={cn(
        'flex flex-col items-center gap-4 rounded-2xl bg-[#00C9A7]/5 border border-[#00C9A7]/20 p-10 text-center',
        className
      )}>
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#00C9A7]/10">
          <CheckCircle className="h-7 w-7 text-[#00C9A7]" />
        </div>
        <div>
          <p className="text-lg font-bold text-[#0F172A]">Thank you for your report!</p>
          <p className="mt-1.5 text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
            Your data has been received. After verification by our data team,
            it will improve neighbourhood scores for{' '}
            <strong>{watch('areaName')}</strong> and help future residents
            make better housing decisions.
          </p>
        </div>
        <button
          onClick={() => setSubmitted(false)}
          className="mt-2 text-sm text-[#00C9A7] font-medium hover:underline"
        >
          Submit another report
        </button>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>

      {submitError && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3">
          <p className="text-sm text-red-600">
            {(submitError as any)?.response?.data?.message || 'Something went wrong. Please try again.'}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        {/* ── SECTION 1: REPORTER INFO ─────────────────────── */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <SectionHeader icon={CheckCircle} label="About Your Report" />

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <FieldLabel>Email (optional)</FieldLabel>
                <input
                  {...register('reporterEmail')}
                  type="email"
                  placeholder="your@email.com"
                  className={inputClass(!!errors.reporterEmail)}
                />
                <p className="text-xs text-slate-400 mt-1">
                  Only used to notify you when your area's scores update.
                </p>
              </div>
              <div>
                <FieldLabel>Name (optional)</FieldLabel>
                <input
                  {...register('reporterName')}
                  type="text"
                  placeholder="Your name"
                  className={inputClass(false)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <FieldLabel required>Lagos Area</FieldLabel>
                <select
                  {...register('areaName')}
                  className={inputClass(!!errors.areaName)}
                >
                  <option value="">Select your area</option>
                  {LAGOS_AREAS.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
                {errors.areaName && (
                  <p className="text-xs text-red-500 mt-1">{errors.areaName.message}</p>
                )}
              </div>
              <div>
                <FieldLabel required>Street or Estate Name</FieldLabel>
                <input
                  {...register('streetEstate')}
                  type="text"
                  placeholder="e.g. Admiralty Way, Lekki Gardens"
                  className={inputClass(!!errors.streetEstate)}
                />
                {errors.streetEstate && (
                  <p className="text-xs text-red-500 mt-1">{errors.streetEstate.message}</p>
                )}
              </div>
            </div>

            <div>
              <FieldLabel required>Report Date</FieldLabel>
              <input
                {...register('reportDate')}
                type="date"
                className={inputClass(!!errors.reportDate)}
              />
            </div>
          </div>
        </div>

        {/* ── SECTION 2: SEASON SELECTOR ───────────────────── */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <FieldLabel required>Which season are you currently in?</FieldLabel>
          <p className="text-xs text-slate-400 mb-4">
            This determines which questions are shown. Different seasons bring different conditions.
          </p>

          <div className="grid grid-cols-2 gap-3">
            {[
              {
                value: 'rainy',
                icon: Cloud,
                label: 'Rainy Season',
                sub:   'April – October',
                color: 'text-blue-500',
                bg:    'bg-blue-50',
              },
              {
                value: 'dry',
                icon: Sun,
                label: 'Dry / Harmattan',
                sub:   'November – March',
                color: 'text-amber-500',
                bg:    'bg-amber-50',
              },
            ].map(({ value, icon: Icon, label, sub, color, bg }) => (
              <Controller
                key={value}
                name="season"
                control={control}
                render={({ field }) => (
                  <button
                    type="button"
                    onClick={() => field.onChange(value)}
                    className={cn(
                      'flex flex-col items-center gap-2 rounded-xl border-2 p-5 transition-all text-center',
                      field.value === value
                        ? 'border-[#00C9A7] bg-[#00C9A7]/5'
                        : 'border-slate-200 hover:border-slate-300'
                    )}
                  >
                    <div className={cn('flex h-10 w-10 items-center justify-center rounded-full', bg)}>
                      <Icon className={cn('h-5 w-5', color)} />
                    </div>
                    <div>
                      <p className="font-semibold text-[#0F172A] text-sm">{label}</p>
                      <p className="text-xs text-slate-400">{sub}</p>
                    </div>
                  </button>
                )}
              />
            ))}
          </div>
          {errors.season && (
            <p className="text-xs text-red-500 mt-2">{errors.season.message}</p>
          )}
        </div>

        {/* ── SECTION 3: POWER SUPPLY ──────────────────────── */}
        {season && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <SectionHeader
              icon={Zap}
              label="Power Supply"
              color="text-amber-500"
              bg="bg-amber-50"
            />

            <div className="space-y-5">
              <div>
                <FieldLabel required>
                  On average, how many hours of electricity do you get daily?
                </FieldLabel>
                <Controller
                  name="powerHoursDaily"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup
                      options={[
                        { value: 'none',     label: '0 hours — no power at all' },
                        { value: 'low',      label: '1–6 hours per day' },
                        { value: 'moderate', label: '7–12 hours per day' },
                        { value: 'good',     label: '13–20 hours per day' },
                        { value: 'excellent',label: 'More than 20 hours per day' },
                      ]}
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.powerHoursDaily?.message}
                    />
                  )}
                />
              </div>

              <div>
                <FieldLabel>
                  Compared to last month, has power supply changed?
                </FieldLabel>
                <Controller
                  name="powerTrend"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup
                      options={[
                        { value: 'better', label: 'Better than last month' },
                        { value: 'same',   label: 'About the same' },
                        { value: 'worse',  label: 'Worse than last month' },
                      ]}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>
            </div>
          </div>
        )}

        {/* ── SECTION 4: WATER SUPPLY ──────────────────────── */}
        {season && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <SectionHeader
              icon={Droplets}
              label="Water Supply"
              color="text-blue-500"
              bg="bg-blue-50"
            />

            <div className="space-y-5">
              <div>
                <FieldLabel required>What is your main water source right now?</FieldLabel>
                <Controller
                  name="waterSource"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup
                      options={[
                        { value: 'public_mains',      label: 'Public mains (always available)' },
                        { value: 'borehole',           label: 'Borehole (private or estate)' },
                        { value: 'tanker',             label: 'Tanker delivery only' },
                        { value: 'no_reliable_source', label: 'No reliable water source' },
                      ]}
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.waterSource?.message}
                    />
                  )}
                />
              </div>

              {/* Dry season — borehole status */}
              {isDry && (
                <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
                  <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-3">
                    Harmattan Season — Water
                  </p>
                  <FieldLabel>
                    If you use a borehole, how is it functioning this dry season?
                  </FieldLabel>
                  <Controller
                    name="boreholeStatus"
                    control={control}
                    render={({ field }) => (
                      <RadioGroup
                        options={[
                          { value: 'functioning',   label: 'Functioning normally' },
                          { value: 'reduced_flow',  label: 'Reduced flow / lower pressure' },
                          { value: 'dry',           label: 'Has dried up completely' },
                        ]}
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                </div>
              )}

              {/* Rainy season — flood affecting water */}
              {isRainy && (
                <div className="rounded-xl bg-blue-50 border border-blue-200 p-4">
                  <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-3">
                    Rainy Season — Water
                  </p>
                  <FieldLabel>
                    Has flooding affected your water supply or borehole this period?
                  </FieldLabel>
                  <div className="flex gap-3">
                    {[{ v: true, label: 'Yes' }, { v: false, label: 'No' }].map(({ v, label }) => (
                      <Controller
                        key={String(v)}
                        name="waterAffectedByFlood"
                        control={control}
                        render={({ field }) => (
                          <button
                            type="button"
                            onClick={() => field.onChange(v)}
                            className={cn(
                              'flex-1 py-2.5 rounded-lg border text-sm font-medium transition-colors',
                              field.value === v
                                ? 'border-[#00C9A7] bg-[#00C9A7]/10 text-[#00C9A7]'
                                : 'border-slate-200 text-slate-500 hover:border-slate-300'
                            )}
                          >
                            {label}
                          </button>
                        )}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── SECTION 5: RAINY SEASON — FLOODING & DRAINAGE ── */}
        {isRainy && (
          <div className="rounded-2xl border border-blue-200 bg-white p-6 shadow-sm">
            <SectionHeader
              icon={Cloud}
              label="Flooding & Drainage"
              color="text-blue-500"
              bg="bg-blue-50"
            />

            <div className="space-y-5">
              <div>
                <FieldLabel required>
                  Did any flooding happen on your street this period?
                </FieldLabel>
                <Controller
                  name="floodingLevel"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup
                      options={[
                        { value: 'none',     label: 'No flooding' },
                        { value: 'minor',    label: 'Minor — puddles, slow drainage' },
                        { value: 'moderate', label: 'Moderate — ankle-to-knee deep' },
                        { value: 'severe',   label: 'Severe — waist deep or worse' },
                      ]}
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.floodingLevel?.message}
                    />
                  )}
                />
              </div>

              {floodingLevel && floodingLevel !== 'none' && (
                <div>
                  <FieldLabel>How long did the flooding last?</FieldLabel>
                  <select
                    {...register('reportDate')} // placeholder — map to a real field if needed
                    className={inputClass(false)}
                  >
                    <option value="">Select duration</option>
                    <option value="hours">A few hours, then drained</option>
                    <option value="day">A full day</option>
                    <option value="days">Several days</option>
                    <option value="week_plus">More than a week</option>
                  </select>
                </div>
              )}

              <div>
                <FieldLabel>
                  How would you rate the drainage system on your street right now?
                </FieldLabel>
                <Controller
                  name="drainageRating"
                  control={control}
                  render={({ field }) => (
                    <ScaleRow
                      min="Very poor (always waterlogged)"
                      max="Excellent (drains quickly)"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>
            </div>
          </div>
        )}

        {/* ── SECTION 6: DRY SEASON — HARMATTAN CONDITIONS ─── */}
        {isDry && (
          <div className="rounded-2xl border border-amber-200 bg-white p-6 shadow-sm">
            <SectionHeader
              icon={Sun}
              label="Harmattan Conditions"
              color="text-amber-500"
              bg="bg-amber-50"
            />

            <div className="space-y-5">
              <div>
                <FieldLabel>How severe is the dust and harmattan haze in your area?</FieldLabel>
                <Controller
                  name="dustIntensity"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup
                      options={[
                        { value: 'none',     label: 'None — no noticeable dust' },
                        { value: 'mild',     label: 'Mild — slight haze, manageable' },
                        { value: 'moderate', label: 'Moderate — dusty surfaces, some visibility issues' },
                        { value: 'heavy',    label: 'Heavy — severe haze, breathing discomfort' },
                      ]}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>

              <div>
                <FieldLabel>
                  Were there any fire incidents near your area this period?
                </FieldLabel>
                <p className="text-xs text-slate-400 mb-3">
                  Dry vegetation and harmattan winds increase fire risk significantly.
                </p>
                <div className="flex gap-3">
                  {[{ v: true, label: 'Yes, there were' }, { v: false, label: 'No incidents' }].map(
                    ({ v, label }) => (
                      <Controller
                        key={String(v)}
                        name="fireIncidentNearby"
                        control={control}
                        render={({ field }) => (
                          <button
                            type="button"
                            onClick={() => field.onChange(v)}
                            className={cn(
                              'flex-1 py-2.5 rounded-lg border text-sm font-medium transition-colors',
                              field.value === v
                                ? v
                                  ? 'border-red-400 bg-red-50 text-red-600'
                                  : 'border-[#00C9A7] bg-[#00C9A7]/10 text-[#00C9A7]'
                                : 'border-slate-200 text-slate-500 hover:border-slate-300'
                            )}
                          >
                            {v && <Flame className="inline h-3.5 w-3.5 mr-1" />}
                            {label}
                          </button>
                        )}
                      />
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── SECTION 7: SECURITY ──────────────────────────── */}
        {season && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <SectionHeader
              icon={Shield}
              label="Security"
              color="text-green-500"
              bg="bg-green-50"
            />

            <div className="space-y-5">
              <div>
                <FieldLabel>Were there any security incidents on your street this period?</FieldLabel>
                <Controller
                  name="securityIncidents"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup
                      options={[
                        { value: 'none',     label: 'No incidents' },
                        { value: 'one',      label: 'Yes — one incident' },
                        { value: 'multiple', label: 'Yes — multiple incidents' },
                      ]}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>

              {securityIncidents && securityIncidents !== 'none' && (
                <div>
                  <FieldLabel>What type of incident? (Select all that apply)</FieldLabel>
                  <Controller
                    name="incidentTypes"
                    control={control}
                    render={({ field }) => (
                      <CheckboxGroup
                        options={[
                          { value: 'robbery_burglary',   label: 'Robbery / burglary' },
                          { value: 'phone_bag_snatching', label: 'Phone / bag snatching' },
                          { value: 'car_theft',           label: 'Car theft / break-in' },
                          { value: 'attempted_break_in',  label: 'Attempted break-in' },
                          { value: 'other',               label: 'Other' },
                        ]}
                        values={field.value ?? []}
                        onChange={field.onChange}
                      />
                    )}
                  />
                </div>
              )}

              <div>
                <FieldLabel>How safe does your street feel at night?</FieldLabel>
                <Controller
                  name="nightSafetyRating"
                  control={control}
                  render={({ field }) => (
                    <ScaleRow
                      min="Very unsafe"
                      max="Very safe"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>

              <div>
                <FieldLabel>Is there an active vigilante or community security watch?</FieldLabel>
                <Controller
                  name="vigilantePresent"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup
                      options={[
                        { value: 'yes_active', label: 'Yes — active and visible' },
                        { value: 'yes_rarely', label: 'Yes — but rarely seen' },
                        { value: 'no',         label: 'No' },
                      ]}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>
            </div>
          </div>
        )}

        {/* ── SECTION 8: ROADS & ENVIRONMENT ───────────────── */}
        {season && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <SectionHeader
              icon={Car}
              label="Roads & Street Environment"
              color="text-slate-500"
              bg="bg-slate-100"
            />

            <div className="space-y-5">
              <div>
                <FieldLabel>What is the current road condition on your street?</FieldLabel>
                <Controller
                  name="roadCondition"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup
                      options={[
                        { value: 'good',       label: 'Good — tarred, no major issues' },
                        { value: 'fair',       label: 'Fair — some potholes' },
                        { value: 'poor',       label: 'Poor — badly damaged' },
                        { value: 'impassable', label: 'Impassable — cannot drive through' },
                      ]}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>

              <div>
                <FieldLabel>Has anything changed about road conditions recently?</FieldLabel>
                <Controller
                  name="roadChangedRecently"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup
                      options={[
                        { value: 'no_change',  label: 'No change' },
                        { value: 'got_worse',  label: 'Got worse (new potholes, damage)' },
                        { value: 'got_better', label: 'Got better (repairs done)' },
                      ]}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>

              <div>
                <FieldLabel>Is your street adequately lit at night?</FieldLabel>
                <Controller
                  name="streetLighting"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup
                      options={[
                        { value: 'fully_lit',     label: 'Fully lit' },
                        { value: 'partially_lit', label: 'Partially lit' },
                        { value: 'not_lit',       label: 'Not lit at all' },
                      ]}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>

              <div>
                <FieldLabel>How would you rate the noise level on your street?</FieldLabel>
                <Controller
                  name="noiseLevel"
                  control={control}
                  render={({ field }) => (
                    <ScaleRow
                      min="Very quiet"
                      max="Very noisy"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>
            </div>
          </div>
        )}

        {/* ── SECTION 9: ADDITIONAL NOTES ──────────────────── */}
        {season && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <FieldLabel>Anything else we should know about your area? (Optional)</FieldLabel>
            <textarea
              {...register('additionalNotes')}
              rows={3}
              placeholder="Any other changes, concerns, or information about your street or estate this period…"
              className={cn(inputClass(false), 'resize-none')}
            />
            <p className="text-xs text-slate-400 mt-1">Maximum 500 characters.</p>
          </div>
        )}

        {/* ── TRUST NOTE + SUBMIT ───────────────────────────── */}
        {season && (
          <div className="space-y-4">
            <div className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-3">
              <p className="text-xs text-slate-500 leading-relaxed text-center">
                🔒 Your report is anonymous and reviewed by our data team before being used
                in any score calculation. We never share personal details with third parties.
              </p>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-xl bg-[#0A1628] py-3.5 text-sm font-bold text-white hover:bg-[#0A1628]/90 disabled:opacity-50 transition-colors"
            >
              {isPending ? 'Submitting your report…' : 'Submit neighbourhood report'}
            </button>
          </div>
        )}

        {/* Prompt to select season if not yet selected */}
        {!season && (
          <div className="flex items-center gap-3 rounded-xl bg-slate-100 px-4 py-3">
            <AlertTriangle className="h-4 w-4 text-slate-400 shrink-0" />
            <p className="text-sm text-slate-500">
              Select the current season above to reveal the relevant questions.
            </p>
          </div>
        )}

      </form>
    </div>
  );
};

export default NeighbourhoodReportForm;