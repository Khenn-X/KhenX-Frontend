import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Users, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { residentReportSchema } from '../../lib/validators';
import { useSubmitResidentReport } from '../../hooks/useNeighbourhood';
import { LAGOS_AREAS } from '../../constants/lagos-areas';
import { cn } from '../../lib/utils';

interface ResidentReportFormProps {
  defaultArea?: string;
  className?: string;
}

const ResidentReportForm = ({ defaultArea = '', className }: ResidentReportFormProps) => {
  const [submitted, setSubmitted] = useState(false);
  const { mutate: submitReport, isPending, error } = useSubmitResidentReport();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResidentReportFormData>({
    resolver: zodResolver(residentReportSchema),
    defaultValues: { areaName: defaultArea },
  });

  const flooded = watch('floodedLastSeason');

  const onSubmit = (data: ResidentReportFormData) => {
    submitReport(data, { onSuccess: () => setSubmitted(true) });
  };

  const inputClass = (hasError: boolean) => cn(
    'w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition-colors',
    hasError
      ? 'border-red-300 focus:ring-red-200'
      : 'border-slate-200 focus:border-[#00C9A7] focus:ring-[#00C9A7]/20'
  );

  const Label = ({ children }: { children: React.ReactNode }) => (
    <label className="mb-1.5 block text-sm font-medium text-slate-700">{children}</label>
  );

  if (submitted) {
    return (
      <div className={cn('flex flex-col items-center gap-3 rounded-xl bg-[#00C9A7]/5 border border-[#00C9A7]/20 p-6 text-center', className)}>
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#00C9A7]/10">
          <CheckCircle className="h-6 w-6 text-[#00C9A7]" />
        </div>
        <div>
          <p className="font-semibold text-[#0F172A]">Thank you for your report</p>
          <p className="mt-1 text-sm text-slate-500">
            Your data helps other Lagosians make better housing decisions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('rounded-xl border border-slate-200 bg-white p-6', className)}>
      <div className="flex items-center gap-3 mb-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0A1628]">
          <Users className="h-5 w-5 text-[#00C9A7]" />
        </div>
        <div>
          <p className="font-semibold text-[#0F172A]">Share what you know</p>
          <p className="text-xs text-slate-400">Help fellow Lagosians — report on your area</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2">
          <p className="text-xs text-red-600">{error.message}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Area */}
        <div>
          <Label>Area <span className="text-red-500">*</span></Label>
          <select {...register('areaName')} className={inputClass(!!errors.areaName)}>
            <option value="">Select your area</option>
            {LAGOS_AREAS.map((area) => (
              <option key={area} value={area}>{area}</option>
            ))}
          </select>
          {errors.areaName && <p className="mt-1 text-xs text-red-500">{errors.areaName.message}</p>}
        </div>

        {/* Power */}
        <div>
          <Label>Average daily power supply (hours)</Label>
          <input
            {...register('powerHoursDaily', { valueAsNumber: true })}
            type="number"
            min={0}
            max={24}
            placeholder="e.g. 4"
            className={inputClass(!!errors.powerHoursDaily)}
          />
          {errors.powerHoursDaily && <p className="mt-1 text-xs text-red-500">{errors.powerHoursDaily.message}</p>}
        </div>

        {/* Flooding */}
        <div>
          <Label>Did your area flood last rainy season?</Label>
          <div className="flex gap-3">
            {[
              { value: 'true', label: 'Yes' },
              { value: 'false', label: 'No' },
            ].map(({ value, label }) => (
              <label
                key={value}
                className={cn(
                  'flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors',
                  String(flooded) === value
                    ? 'border-[#00C9A7] bg-[#00C9A7]/10 text-[#00C9A7]'
                    : 'border-slate-200 text-slate-500 hover:border-slate-300'
                )}
              >
                <input
                  {...register('floodedLastSeason')}
                  type="radio"
                  value={value}
                  className="sr-only"
                />
                {label}
              </label>
            ))}
          </div>
        </div>

        {/* Flood severity — only shown if flooded */}
        {flooded === true && (
          <div>
            <Label>How severe was the flooding?</Label>
            <select {...register('floodSeverity')} className={inputClass(false)}>
              <option value="">Select severity</option>
              <option value="minor">Minor — streets wet, passable</option>
              <option value="moderate">Moderate — streets flooded, difficult to pass</option>
              <option value="severe">Severe — homes flooded, very dangerous</option>
            </select>
          </div>
        )}

        {/* Security */}
        <div>
          <Label>Security rating (1 = unsafe, 5 = very safe)</Label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <label key={n} className="flex-1">
                <input {...register('securityRating', { valueAsNumber: true })} type="radio" value={n} className="sr-only" />
                <span className={cn(
                  'flex h-10 w-full cursor-pointer items-center justify-center rounded-lg border text-sm font-semibold transition-colors',
                  'border-slate-200 text-slate-500 hover:border-[#00C9A7] hover:text-[#00C9A7]'
                )}>
                  {n}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Optional email */}
        <div>
          <Label>Your email (optional)</Label>
          <input
            {...register('reporterEmail')}
            type="email"
            placeholder="For follow-up questions only"
            className={inputClass(!!errors.reporterEmail)}
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-lg bg-[#00C9A7] py-2.5 text-sm font-semibold text-[#0A1628] hover:bg-[#00b396] disabled:opacity-60 transition-colors"
        >
          {isPending ? 'Submitting...' : 'Submit report'}
        </button>
      </form>
    </div>
  );
};

export default ResidentReportForm;
