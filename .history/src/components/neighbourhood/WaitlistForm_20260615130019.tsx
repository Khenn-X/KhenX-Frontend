import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Bell, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { waitlistSchema } from '../../lib/validators';
import type { WaitlistFormData } from '../../lib/validators';
import { useJoinWaitlist } from '../../hooks/useNeighbourhood';
import { LAGOS_AREAS } from '../../constants/lagos-areas';
import { cn } from '../../lib/utils';

interface WaitlistFormProps {
  defaultArea?: string;
  className?: string;
}

const WaitlistForm = ({ defaultArea = '', className }: WaitlistFormProps) => {
  const [submitted, setSubmitted] = useState(false);
  const { mutate: joinWaitlist, isPending, error } = useJoinWaitlist();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<WaitlistFormData>({
    resolver: zodResolver(waitlistSchema),
    defaultValues: { areaName: defaultArea },
  });

  const onSubmit = (data: WaitlistFormData) => {
    joinWaitlist(data, {
      onSuccess: () => setSubmitted(true),
    });
  };

  const inputClass = (hasError: boolean) => cn(
    'w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition-colors',
    hasError
      ? 'border-red-300 focus:ring-red-200'
      : 'border-slate-200 focus:border-[#00C9A7] focus:ring-[#00C9A7]/20'
  );

  if (submitted) {
    return (
      <div className={cn('flex flex-col items-center gap-3 rounded-xl bg-[#00C9A7]/5 border border-[#00C9A7]/20 p-6 text-center', className)}>
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#00C9A7]/10">
          <CheckCircle className="h-6 w-6 text-[#00C9A7]" />
        </div>
        <div>
          <p className="font-semibold text-[#0F172A]">You're on the list</p>
          <p className="mt-1 text-sm text-slate-500">
            We'll notify you as soon as intelligence data is available for this area.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('rounded-xl border border-slate-200 bg-white p-5', className)}>
      <div className="flex items-center gap-2.5 mb-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0A1628]">
          <Bell className="h-4 w-4 text-[#00C9A7]" />
        </div>
        <div>
          <p className="font-semibold text-[#0F172A] text-sm">Get notified when data is ready</p>
          <p className="text-xs text-slate-400">Join the waitlist for your area</p>
        </div>
      </div>

      {error && (
        <div className="mb-3 rounded-lg bg-red-50 border border-red-200 px-3 py-2">
          <p className="text-xs text-red-600">{error.message}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div>
          <select {...register('areaName')} className={inputClass(!!errors.areaName)}>
            <option value="">Select area</option>
            {LAGOS_AREAS.map((area) => (
              <option key={area} value={area}>{area}</option>
            ))}
          </select>
          {errors.areaName && <p className="mt-1 text-xs text-red-500">{errors.areaName.message}</p>}
        </div>

        <div>
          <input
            {...register('email')}
            type="email"
            placeholder="your@email.com"
            className={inputClass(!!errors.email)}
          />
          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-lg bg-[#0A1628] py-2.5 text-sm font-semibold text-white hover:bg-[#0A1628]/90 disabled:opacity-60 transition-colors"
        >
          {isPending ? 'Joining...' : 'Notify me'}
        </button>
      </form>
    </div>
  );
};

export default WaitlistForm;
