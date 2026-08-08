import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  AlertCircle,
  Award,
  Briefcase,
  Calendar,
  Camera,
  Check,
  Eye,
  Globe2,
  Home,
  Languages,
  Loader2,
  Mail,
  MapPin,
  MessageCircle,
  Pencil,
  Phone,
  Radar,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import PageWrapper from '../../components/layout/PageWrapper';
import { Button } from '../../components/ui/button';
import { agentsApi } from '../../api/agents.api';
import { useAgentOwnProfile, useUpdateAgentProfile } from '../../hooks/useAgent';
import { useAuthStore } from '../../store/auth.store';
import { agentProfileSchema } from '../../lib/validators';

// ---------------------------------------------------------------------------
// NOTE: the client-side `agent.types.ts` / `agents.api.ts` types haven't been
// re-shared with me since the last backend change, so the shape below is
// built directly from the confirmed backend work (Agent.model.ts fields +
// the new `performanceSnapshot`/`profileStrength` from agents.controller.ts).
// If the real client types differ once you check them, adjust this local
// type rather than the component logic.
// ---------------------------------------------------------------------------

type AgentType = 'independent' | 'agency';
type PreferredContactMethod = 'email' | 'phone' | 'whatsapp' | 'any';
type ExpertiseArea = 'buying' | 'selling' | 'renting' | 'investment' | 'relocation';

interface PerformanceSnapshot {
  audience: 'own' | 'public';
  tier?: string;
  kycStatus?: string;
  totalListings?: number;
  activeListings?: number;
  totalViews?: number;
  totalEnquiries?: number; // only ever render when audience === 'own'
  profileStrength?: number;
}

interface OwnAgentProfilePayload {
  agent: {
    _id: string;
    businessName?: string;
    phone?: string;
    bio?: string;
    businessAddress?: string;
    website?: string;
    city?: string;
    state?: string;
    country?: string;
    preferredContactMethod?: PreferredContactMethod;
    agentType?: AgentType;
    licenseNumber?: string;
    yearsOfExperience?: number;
    specializations?: string[];
    languages?: string[];
    availability?: string;
    serviceAreas?: string[];
    expertiseAreas?: ExpertiseArea[];
    isPhoneVerified?: boolean;
    kycStatus?: string;
    verifiedAt?: string;
    tier?: string;
    createdAt?: string;
  };
  user: {
    _id: string;
    fullName?: string;
    email?: string;
    avatarUrl?: string;
    isEmailVerified?: boolean; // may not be returned yet — guarded below
    createdAt?: string;
  };
  performanceSnapshot?: PerformanceSnapshot;
}

type FormValues = {
  fullName?: string;
  avatarUrl?: string;
  businessName?: string;
  phone?: string;
  bio?: string;
  businessAddress?: string;
  website?: string;
  city?: string;
  state?: string;
  country?: string;
  preferredContactMethod?: PreferredContactMethod;
  agentType?: AgentType;
  licenseNumber?: string;
  yearsOfExperience?: number;
  specializations?: string[];
  languages?: string[];
  availability?: string;
  serviceAreas?: string[];
  expertiseAreas?: ExpertiseArea[];
};

const SPECIALIZATION_OPTIONS = ['Residential', 'Commercial', 'Land', 'Luxury', 'Rental', 'Property management'];
const EXPERTISE_OPTIONS: { value: ExpertiseArea; label: string }[] = [
  { value: 'buying', label: 'Buying' },
  { value: 'selling', label: 'Selling' },
  { value: 'renting', label: 'Renting' },
  { value: 'investment', label: 'Investment' },
  { value: 'relocation', label: 'Relocation' },
];
const CONTACT_METHOD_OPTIONS: { value: PreferredContactMethod; label: string }[] = [
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone call' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'any', label: 'Any' },
];

const TABS = [
  { key: 'personal', label: 'Personal info', icon: Mail },
  { key: 'professional', label: 'Professional', icon: Briefcase },
  { key: 'areas', label: 'Service areas', icon: MapPin },
  { key: 'about', label: 'About', icon: Sparkles },
  { key: 'verification', label: 'Verification', icon: ShieldCheck },
  { key: 'performance', label: 'Performance', icon: Award },
] as const;
type TabKey = (typeof TABS)[number]['key'];

// -----------------------------------------------------------------------------
// One-time global keyframes for this page. Scoped by the `kx-` prefix so
// nothing here collides with the rest of the app's styles.
// -----------------------------------------------------------------------------

function ProfilePageStyles() {
  return (
    <style>{`
      @keyframes kx-fade-up {
        from { opacity: 0; transform: translateY(14px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes kx-scale-in {
        from { opacity: 0; transform: scale(0.92); }
        to { opacity: 1; transform: scale(1); }
      }
      @keyframes kx-pop-in {
        0% { opacity: 0; transform: scale(0.5); }
        70% { opacity: 1; transform: scale(1.08); }
        100% { opacity: 1; transform: scale(1); }
      }
      @keyframes kx-pulse-ring {
        0% { box-shadow: 0 0 0 0 rgba(0, 168, 140, 0.35); }
        70% { box-shadow: 0 0 0 10px rgba(0, 168, 140, 0); }
        100% { box-shadow: 0 0 0 0 rgba(0, 168, 140, 0); }
      }
      @keyframes kx-bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-6px); }
      }
      @keyframes kx-shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
      @keyframes kx-sheen {
        0% { transform: translateX(-120%) skewX(-12deg); }
        100% { transform: translateX(220%) skewX(-12deg); }
      }
      .kx-fade-up { animation: kx-fade-up 0.55s cubic-bezier(0.16, 1, 0.3, 1) both; }
      .kx-scale-in { animation: kx-scale-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) both; }
      .kx-pop-in { animation: kx-pop-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) both; }
      .kx-pulse-ring { animation: kx-pulse-ring 2.4s ease-out infinite; }
      .kx-bounce { animation: kx-bounce 1.8s ease-in-out infinite; }
      .kx-hero-banner {
        background:
          radial-gradient(120% 140% at 8% -10%, rgba(0, 201, 167, 0.35), transparent 55%),
          radial-gradient(90% 120% at 95% 0%, rgba(0, 168, 140, 0.28), transparent 60%),
          linear-gradient(120deg, #0F172A 0%, #0F1F38 45%, #0B2A2A 100%);
        background-size: 200% 200%;
      }
      .kx-hero-banner::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: linear-gradient(120deg, transparent 40%, rgba(255,255,255,0.06) 50%, transparent 60%);
        background-size: 220% 100%;
        animation: kx-sheen 6s ease-in-out infinite;
      }
      .kx-chip {
        transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
      }
      .kx-chip:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 10px rgba(15, 23, 42, 0.08);
      }
      .kx-stat-card {
        transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s ease, border-color 0.25s ease;
      }
      .kx-stat-card:hover {
        transform: translateY(-3px);
        box-shadow: 0 12px 24px -12px rgba(15, 23, 42, 0.25);
        border-color: rgba(0, 168, 140, 0.35);
      }
      .kx-tab-btn {
        position: relative;
        transition: color 0.25s ease, transform 0.15s ease;
      }
      .kx-tab-btn:active { transform: scale(0.97); }
      .kx-avatar-ring {
        transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
      }
      .kx-avatar-wrap:hover .kx-avatar-ring {
        transform: scale(1.035);
      }
      .kx-camera-btn {
        transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.2s ease;
      }
      .kx-camera-btn:hover {
        transform: rotate(-12deg) scale(1.08);
      }
      .kx-save-btn {
        transition: transform 0.15s ease;
      }
      .kx-save-btn:active {
        transform: scale(0.97);
      }
      .kx-edit-link {
        transition: gap 0.2s ease, color 0.2s ease;
      }
      .kx-edit-link:hover {
        gap: 0.55rem;
      }
      .kx-skeleton {
        background-image: linear-gradient(90deg, #EEF2F6 25%, #F8FAFC 37%, #EEF2F6 63%);
        background-size: 400% 100%;
        animation: kx-shimmer 1.6s ease-in-out infinite;
      }
      @media (prefers-reduced-motion: reduce) {
        .kx-fade-up, .kx-scale-in, .kx-pop-in, .kx-pulse-ring, .kx-bounce, .kx-sheen, .kx-hero-banner::before, .kx-skeleton {
          animation: none !important;
        }
      }
    `}</style>
  );
}

// -- small shared bits -------------------------------------------------------

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="mb-2 block text-sm font-medium text-slate-700">{children}</label>;
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition-all duration-200 focus:border-[#00A88C] focus:ring-4 focus:ring-[#00A88C]/15"
    />
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="kx-scale-in mt-2 flex items-center gap-2 text-sm text-red-600">
      <AlertCircle className="h-4 w-4" />
      {message}
    </p>
  );
}

/** Simple add/remove chip editor for string[] fields (languages, service areas, specializations). */
function ChipListEditor({
  values,
  onChange,
  placeholder,
}: {
  values: string[];
  onChange: (next: string[]) => void;
  placeholder: string;
}) {
  const [draft, setDraft] = useState('');

  const add = () => {
    const v = draft.trim();
    if (v && !values.includes(v)) onChange([...values, v]);
    setDraft('');
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {values.map((v, i) => (
          <span
            key={v}
            style={{ animationDelay: `${i * 35}ms` }}
            className="kx-chip kx-scale-in inline-flex items-center gap-1.5 rounded-full bg-[#00A88C]/10 px-3 py-1.5 text-xs font-medium text-[#00A88C]"
          >
            {v}
            <button
              type="button"
              onClick={() => onChange(values.filter((x) => x !== v))}
              aria-label={`Remove ${v}`}
              className="rounded-full transition-transform duration-150 hover:rotate-90"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="mt-2 flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder}
          className="w-full max-w-xs rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition-all duration-200 focus:border-[#00A88C] focus:ring-4 focus:ring-[#00A88C]/15"
        />
        <Button type="button" variant="outline" onClick={add} className="transition-transform duration-150 active:scale-95">
          Add
        </Button>
      </div>
    </div>
  );
}

function CompletionRing({ percent }: { percent: number }) {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;
  return (
    <div className="relative flex h-20 w-20 shrink-0 items-center justify-center">
      <svg className="h-20 w-20 -rotate-90" viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={radius} fill="none" stroke="#E2E8F0" strokeWidth="7" />
        <circle
          cx="36"
          cy="36"
          r={radius}
          fill="none"
          stroke="#00A88C"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-500"
        />
      </svg>
      <span className="absolute text-sm font-bold text-[#0F172A]">{percent}%</span>
    </div>
  );
}

/** Purely presentational: eases a stat's numeral upward on mount/update. */
function useCountUp(target: number | undefined, duration = 900) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (target == null) {
      setValue(0);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

// -----------------------------------------------------------------------------

export default function AgentProfilePage() {
  const setUser = useAuthStore((s) => s.setUser);
  const { data, isLoading, isError, refetch } = useAgentOwnProfile();
  const updateProfile = useUpdateAgentProfile();

  const [activeTab, setActiveTab] = useState<TabKey>('personal');
  const [editingTab, setEditingTab] = useState<TabKey | null>(null);
  const [editingPhoto, setEditingPhoto] = useState(false);

  // Local-device photo upload. `avatarFile` holds the picked file for preview;
  // it's turned into a hosted URL (via `uploadAvatarFile`) only when the user
  // hits Save, and that URL is what actually goes into the form/payload.
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const avatarPreviewRef = useRef<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarPickError, setAvatarPickError] = useState<string | null>(null);
  const [avatarUploadError, setAvatarUploadError] = useState<string | null>(null);

  // Tracks whether the current avatar src actually loaded. A saved photo can
  // fail to render (e.g. a stale/expired local link — see the TODO below)
  // and we want to fall back to initials instead of a broken-image icon.
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);

  useEffect(() => {
    setAvatarLoadFailed(false);
  }, [avatarPreview]);

  useEffect(() => {
    return () => {
      if (avatarPreviewRef.current) {
        URL.revokeObjectURL(avatarPreviewRef.current);
      }
    };
  }, []);

  const handleAvatarFilePick = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setAvatarPickError('Please choose an image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setAvatarPickError('Image must be under 5MB.');
      return;
    }
    setAvatarPickError(null);
    if (avatarPreviewRef.current) {
      URL.revokeObjectURL(avatarPreviewRef.current);
    }
    const previewUrl = URL.createObjectURL(file);
    avatarPreviewRef.current = previewUrl;
    setAvatarFile(file);
    setAvatarPreview(previewUrl);
  };

  const clearAvatarPick = () => {
    if (avatarPreviewRef.current) {
      URL.revokeObjectURL(avatarPreviewRef.current);
      avatarPreviewRef.current = null;
    }
    setAvatarFile(null);
    setAvatarPreview(null);
    setAvatarPickError(null);
    if (avatarInputRef.current) avatarInputRef.current.value = '';
  };

  // Uploads the selected file to the backend and returns the hosted Cloudinary URL.
  const uploadAvatarFile = async (file: File): Promise<string> => {
    const response = await agentsApi.uploadAgentAvatar(file);
    return response.data.avatarUrl;
  };

  const savePhoto = async () => {
    if (avatarFile) {
      setAvatarUploading(true);
      setAvatarUploadError(null);

      try {
        const hostedUrl = await uploadAvatarFile(avatarFile);
        setValue('avatarUrl', hostedUrl);
      } catch (error) {
        console.error(error);
        setAvatarUploadError('Unable to upload that photo. Please try again.');
        return;
      } finally {
        setAvatarUploading(false);
      }

      await submitAll(FIELD_GROUPS.photo, () => {
        setEditingPhoto(false);
        clearAvatarPick();
      });
    } else {
      await submitAll(FIELD_GROUPS.photo, () => setEditingPhoto(false));
    }
  };

  // purely presentational: measures the active tab button so the sliding
  // pill indicator can glide to it instead of snapping.
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null);

  useEffect(() => {
    const el = tabRefs.current[activeTab];
    if (el) setIndicator({ left: el.offsetLeft, width: el.offsetWidth });
  }, [activeTab]);

  const form = useForm<FormValues>({
    resolver: zodResolver(
      z.object({
        businessName: agentProfileSchema.shape.businessName,
        phone: agentProfileSchema.shape.phone,
        bio: agentProfileSchema.shape.bio,
        fullName: z.string().min(2, 'Full name must be at least 2 characters').optional(),
        avatarUrl: z.string().url('Please enter a valid image link').optional().or(z.literal('')),
        businessAddress: z.string().optional(),
        website: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
        city: z.string().optional(),
        state: z.string().optional(),
        country: z.string().optional(),
        preferredContactMethod: z.enum(['email', 'phone', 'whatsapp', 'any']).optional(),
        agentType: z.enum(['independent', 'agency']).optional(),
        licenseNumber: z.string().optional(),
        yearsOfExperience: z.coerce.number().int().min(0).max(100).optional(),
        specializations: z.array(z.string()).optional(),
        languages: z.array(z.string()).optional(),
        availability: z.string().optional(),
        serviceAreas: z.array(z.string()).optional(),
        expertiseAreas: z.array(z.enum(['buying', 'selling', 'renting', 'investment', 'relocation'])).optional(),
      })
    ),
    defaultValues: {},
  });

  const { register, reset, watch, setValue, formState: { errors, isSubmitting } } = form;
  const values = watch();

  useEffect(() => {
    const payload = data?.data as OwnAgentProfilePayload | undefined;
    if (payload?.user) {
      reset({
        fullName: payload.user.fullName ?? '',
        avatarUrl: payload.user.avatarUrl ?? '',
        businessName: payload.agent?.businessName ?? '',
        phone: payload.agent?.phone ?? '',
        bio: payload.agent?.bio ?? '',
        businessAddress: payload.agent?.businessAddress ?? '',
        website: payload.agent?.website ?? '',
        city: payload.agent?.city ?? '',
        state: payload.agent?.state ?? '',
        country: payload.agent?.country ?? '',
        preferredContactMethod: payload.agent?.preferredContactMethod,
        agentType: payload.agent?.agentType,
        licenseNumber: payload.agent?.licenseNumber ?? '',
        yearsOfExperience: payload.agent?.yearsOfExperience,
        specializations: payload.agent?.specializations ?? [],
        languages: payload.agent?.languages ?? [],
        availability: payload.agent?.availability ?? '',
        serviceAreas: payload.agent?.serviceAreas ?? [],
        expertiseAreas: payload.agent?.expertiseAreas ?? [],
      });
    }
  }, [data, reset]);

  const payload = data?.data as OwnAgentProfilePayload | undefined;
  const snapshot = payload?.performanceSnapshot;
  const profileStrength = snapshot?.profileStrength ?? 0;

  const location = useMemo(() => {
    return [values.city, values.state, values.country].filter(Boolean).join(', ');
  }, [values.city, values.state, values.country]);

  const memberSince = payload?.user?.createdAt
    ? new Date(payload.user.createdAt).toLocaleDateString('en-NG', { month: 'long', year: 'numeric' })
    : null;

  const busy = isSubmitting || updateProfile.isPending;

  // Field groups per tab, so saving one tab never touches the others' data.
  const FIELD_GROUPS = {
    personal: ['fullName', 'phone', 'businessName', 'businessAddress', 'website', 'city', 'state', 'country', 'preferredContactMethod'],
    professional: ['agentType', 'licenseNumber', 'yearsOfExperience', 'specializations', 'languages', 'availability'],
    areas: ['serviceAreas'],
    about: ['bio', 'expertiseAreas'],
    photo: ['avatarUrl'],
  } as const satisfies Record<string, (keyof FormValues)[]>;

  /**
   * Builds a payload containing only `fields` from the current form state,
   * and drops any optional string field that's empty. That second part is
   * what fixes the 400 — the backend validator treats an empty string as
   * "must not be empty" rather than as an omitted optional field, so a
   * field you haven't touched on another tab must never be sent as ''.
   */
  const buildPayload = (fields: (keyof FormValues)[]) => {
    const v = form.getValues();
    const payload: Partial<FormValues> = {};
    for (const key of fields) {
      const val = v[key];
      if (typeof val === 'string') {
        if (val.trim() === '') continue;
        (payload as any)[key] = val;
      } else if (val !== undefined) {
        (payload as any)[key] = val;
      }
    }
    return payload;
  };

  const submitAll = async (fields: (keyof FormValues)[], closeEditors: () => void) => {
    try {
      const response = await updateProfile.mutateAsync(
        buildPayload(fields) as Parameters<typeof updateProfile.mutateAsync>[0]
      );

      if (response?.data?.user) {
        setUser({
          _id: response.data.user._id,
          fullName: response.data.user.fullName ?? '',
          email: response.data.user.email ?? '',
          role: 'agent',
          avatarUrl: response.data.user.avatarUrl,
          isEmailVerified: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

      toast.success('Profile updated successfully.');
      closeEditors();
    } catch {
      toast.error('Unable to update your profile right now.');
    }
  };

  if (isLoading) {
    return (
      <PageWrapper className="py-8">
        <ProfilePageStyles />
        <div className="flex min-h-[280px] flex-col items-center justify-center gap-4 rounded-3xl border border-slate-200 bg-white">
          <div className="relative flex h-14 w-14 items-center justify-center">
            <span className="kx-pulse-ring absolute inset-0 rounded-full" />
            <Radar className="h-6 w-6 text-[#00A88C]" />
          </div>
          <p className="text-sm font-medium text-slate-400">Loading your profile…</p>
        </div>
      </PageWrapper>
    );
  }

  if (isError || !payload?.agent) {
    return (
      <PageWrapper className="py-8">
        <ProfilePageStyles />
        <div className="kx-fade-up rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          <p className="font-semibold">We could not load your profile.</p>
          <button
            className="mt-3 font-medium text-red-700 underline decoration-red-300 underline-offset-2 transition-colors hover:text-red-800"
            onClick={() => void refetch()}
          >
            Try again
          </button>
        </div>
      </PageWrapper>
    );
  }

  const isVerified = payload.agent.kycStatus === 'approved';

  return (
    <PageWrapper className="py-8">
      <ProfilePageStyles />
      <div className="mx-auto max-w-5xl">
        {/* Hero */}
        <div className="kx-fade-up relative mb-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="kx-hero-banner relative h-24 w-full sm:h-28" />
          <div className="relative px-6 pb-6 sm:px-8 sm:pb-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end">
              <div className="kx-avatar-wrap relative -mt-12 shrink-0 sm:-mt-14">
                <div className="kx-avatar-ring relative">
                  {(avatarPreview || values.avatarUrl) && !avatarLoadFailed ? (
                    <img
                      src={avatarPreview || values.avatarUrl}
                      alt={values.fullName || 'Profile photo'}
                      onError={() => setAvatarLoadFailed(true)}
                      className="h-24 w-24 rounded-full border-4 border-white object-cover shadow-lg sm:h-28 sm:w-28"
                    />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-[#00C9A7] to-[#00A88C] text-2xl font-bold text-white shadow-lg sm:h-28 sm:w-28">
                      {(values.fullName || 'A').slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  {isVerified && (
                    <span className="kx-pop-in absolute -bottom-0.5 -left-0.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-[#00A88C] text-white shadow-sm">
                      <ShieldCheck className="h-3 w-3" />
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setEditingPhoto((v) => !v)}
                  className="kx-camera-btn absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#0F172A] text-white shadow-sm hover:bg-[#0F172A]/85"
                  aria-label="Change photo"
                >
                  <Camera className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="flex-1 pt-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">
                    {values.fullName || 'Your name'}
                  </h1>
                  {isVerified && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#00A88C]/10 px-2.5 py-1 text-xs font-semibold text-[#00A88C]">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Verified
                    </span>
                  )}
                </div>
                {values.businessName && <p className="mt-1 text-sm font-medium text-slate-600">{values.businessName}</p>}

                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-slate-500">
                  {location && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      {location}
                    </span>
                  )}
                  {memberSince && (
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      Member since {memberSince}
                    </span>
                  )}
                </div>

                {/* NOTE: only "Verified" is shown here. "Top Agent" / "Responds
                    Quickly" badges are intentionally left out — there's no real
                    data behind them yet (deferred per our earlier scoping). */}

                <Link
                  to={`/agents/${payload.agent._id}`}
                  className="kx-edit-link mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#00A88C] hover:text-[#00A88C]/80"
                >
                  <Eye className="h-4 w-4" />
                  Preview public profile
                </Link>
              </div>

              {typeof snapshot?.profileStrength === 'number' && (
                <div className="kx-bounce flex flex-col items-center gap-1 sm:items-end">
                  <CompletionRing percent={profileStrength} />
                  <span className="text-xs font-medium text-slate-400">Profile strength</span>
                </div>
              )}
            </div>

            {editingPhoto && (
              <div className="kx-fade-up mt-5 space-y-4 border-t border-slate-100 pt-5">
                <div>
                  <FieldLabel>Profile photo</FieldLabel>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleAvatarFilePick(e.target.files?.[0])}
                  />
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full border border-slate-200 bg-slate-50">
                      {(avatarPreview || values.avatarUrl) && !avatarLoadFailed && (
                        <img
                          src={avatarPreview || values.avatarUrl}
                          alt=""
                          onError={() => setAvatarLoadFailed(true)}
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => avatarInputRef.current?.click()}
                      className="transition-transform duration-150 active:scale-95"
                    >
                      Choose photo from device
                    </Button>
                    {avatarFile && (
                      <span className="flex items-center gap-2 text-xs text-slate-500">
                        {avatarFile.name}
                        <button type="button" onClick={clearAvatarPick} className="text-slate-400 hover:text-slate-600" aria-label="Remove chosen photo">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    )}
                  </div>
                  {(avatarPickError || avatarUploadError) && (
                    <FieldError message={avatarUploadError ?? avatarPickError} />
                  )}
                  {avatarUploading && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Uploading avatar…
                    </div>
                  )}
                  <p className="mt-1.5 text-xs text-slate-400">JPG or PNG, up to 5MB.</p>
                </div>

                <div>
                  <FieldLabel>Or paste an image link</FieldLabel>
                  <div className="flex flex-wrap gap-2">
                    <input
                      {...register('avatarUrl')}
                      placeholder="https://example.com/photo.jpg"
                      disabled={!!avatarFile}
                      className="w-full max-w-sm rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition-all duration-200 focus:border-[#00A88C] focus:ring-4 focus:ring-[#00A88C]/15 disabled:bg-slate-50 disabled:text-slate-400"
                    />
                  </div>
                  <FieldError message={errors.avatarUrl?.message} />
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    disabled={busy || avatarUploading}
                    onClick={savePhoto}
                    className="kx-save-btn bg-[#00A88C] text-white hover:bg-[#00A88C]/90"
                  >
                    {busy || avatarUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    {avatarUploading ? 'Uploading…' : 'Save'}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setEditingPhoto(false);
                      clearAvatarPick();
                    }}
                    className="transition-transform duration-150 active:scale-95"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="kx-fade-up relative mb-6 flex flex-wrap gap-1 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm">
          {indicator && (
            <span
              className="absolute inset-y-1.5 rounded-xl bg-[#0F172A] transition-all duration-300 ease-out"
              style={{ left: indicator.left, width: indicator.width }}
            />
          )}
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                ref={(el) => { tabRefs.current[tab.key] = el; }}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`kx-tab-btn z-10 flex items-center gap-1.5 whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold ${
                  isActive ? 'text-white' : 'text-slate-500 hover:text-[#0F172A]'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 transition-opacity ${isActive ? 'opacity-100' : 'opacity-60'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab panels */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div key={activeTab} className="kx-fade-up">
            {activeTab === 'personal' && (
              <TabSection
                title="Personal info"
                icon={<Mail className="h-4 w-4" />}
                editing={editingTab === 'personal'}
                onEdit={() => setEditingTab('personal')}
                onCancel={() => setEditingTab(null)}
                onSave={() => submitAll(FIELD_GROUPS.personal, () => setEditingTab(null))}
                busy={busy}
                editForm={
                  <div className="space-y-5">
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <FieldLabel>Full name</FieldLabel>
                        <TextInput {...register('fullName')} />
                        <FieldError message={errors.fullName?.message} />
                      </div>
                      <div>
                        <FieldLabel>Email</FieldLabel>
                        <input disabled value={payload.user.email ?? ''} className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-500" />
                        <p className="mt-1.5 text-xs text-slate-400">Contact support to change your email.</p>
                      </div>
                      <div>
                        <FieldLabel>Phone</FieldLabel>
                        <TextInput {...register('phone')} placeholder="08012345678" />
                        <FieldError message={errors.phone?.message} />
                      </div>
                      <div>
                        <FieldLabel>Business name</FieldLabel>
                        <TextInput {...register('businessName')} placeholder="Your agency or business name" />
                        <FieldError message={errors.businessName?.message} />
                      </div>
                      <div>
                        <FieldLabel>Business address</FieldLabel>
                        <TextInput {...register('businessAddress')} />
                      </div>
                      <div>
                        <FieldLabel>Website</FieldLabel>
                        <TextInput {...register('website')} placeholder="https://" />
                        <FieldError message={errors.website?.message} />
                      </div>
                      <div>
                        <FieldLabel>City</FieldLabel>
                        <TextInput {...register('city')} />
                      </div>
                      <div>
                        <FieldLabel>State</FieldLabel>
                        <TextInput {...register('state')} />
                      </div>
                      <div>
                        <FieldLabel>Country</FieldLabel>
                        <TextInput {...register('country')} />
                      </div>
                      <div>
                        <FieldLabel>Preferred contact method</FieldLabel>
                        <select
                          {...register('preferredContactMethod')}
                          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition-all duration-200 focus:border-[#00A88C] focus:ring-4 focus:ring-[#00A88C]/15"
                        >
                          <option value="">Select...</option>
                          {CONTACT_METHOD_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                }
                readView={
                  <dl className="grid gap-5 sm:grid-cols-3">
                    <Info label="Full name" value={values.fullName} />
                    <Info label="Email" value={payload.user.email} />
                    <Info label="Phone" value={values.phone} />
                    <Info label="Business name" value={values.businessName} className="sm:col-span-3" />
                    <Info label="Business address" value={values.businessAddress} className="sm:col-span-3" />
                    <Info label="Website" value={values.website} />
                    <Info label="Location" value={location} />
                    <Info
                      label="Preferred contact"
                      value={CONTACT_METHOD_OPTIONS.find((o) => o.value === values.preferredContactMethod)?.label}
                    />
                  </dl>
                }
              />
            )}

            {activeTab === 'professional' && (
              <TabSection
                title="Professional details"
                icon={<Briefcase className="h-4 w-4" />}
                editing={editingTab === 'professional'}
                onEdit={() => setEditingTab('professional')}
                onCancel={() => setEditingTab(null)}
                onSave={() => submitAll(FIELD_GROUPS.professional, () => setEditingTab(null))}
                busy={busy}
                editForm={
                  <div className="space-y-5">
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <FieldLabel>Agent type</FieldLabel>
                        <select {...register('agentType')} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition-all duration-200 focus:border-[#00A88C] focus:ring-4 focus:ring-[#00A88C]/15">
                          <option value="">Select...</option>
                          <option value="independent">Independent</option>
                          <option value="agency">Agency</option>
                        </select>
                      </div>
                      <div>
                        <FieldLabel>License number</FieldLabel>
                        <TextInput {...register('licenseNumber')} />
                      </div>
                      <div>
                        <FieldLabel>Years of experience</FieldLabel>
                        <TextInput type="number" min={0} max={100} {...register('yearsOfExperience')} />
                        <FieldError message={errors.yearsOfExperience?.message} />
                      </div>
                      <div>
                        <FieldLabel>Availability</FieldLabel>
                        <TextInput {...register('availability')} placeholder="e.g. Mon - Sat" />
                      </div>
                    </div>
                    <div>
                      <FieldLabel>Specializations</FieldLabel>
                      <div className="flex flex-wrap gap-2">
                        {SPECIALIZATION_OPTIONS.map((opt) => {
                          const checked = (values.specializations ?? []).includes(opt);
                          return (
                            <button
                              type="button"
                              key={opt}
                              onClick={() => {
                                const current = values.specializations ?? [];
                                setValue('specializations', checked ? current.filter((v) => v !== opt) : [...current, opt]);
                              }}
                              className={`kx-chip rounded-full border px-3 py-1.5 text-xs font-medium ${
                                checked ? 'border-[#00A88C] bg-[#00A88C]/10 text-[#00A88C]' : 'border-slate-200 text-slate-500 hover:border-slate-300'
                              }`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <FieldLabel>Languages</FieldLabel>
                      <ChipListEditor
                        values={values.languages ?? []}
                        onChange={(next) => setValue('languages', next)}
                        placeholder="e.g. English"
                      />
                    </div>
                  </div>
                }
                readView={
                  <div className="space-y-5">
                    <dl className="grid gap-5 sm:grid-cols-2">
                      <Info label="Agent type" value={values.agentType === 'agency' ? 'Agency' : values.agentType === 'independent' ? 'Independent' : undefined} />
                      <Info label="License number" value={values.licenseNumber} />
                      <Info label="Years of experience" value={values.yearsOfExperience != null ? `${values.yearsOfExperience} years` : undefined} />
                      <Info label="Availability" value={values.availability} />
                    </dl>
                    <ChipRow label="Specializations" items={values.specializations} icon={<Home className="h-3 w-3" />} />
                    <ChipRow label="Languages" items={values.languages} icon={<Languages className="h-3 w-3" />} />
                  </div>
                }
              />
            )}

            {activeTab === 'areas' && (
              <TabSection
                title="Service areas"
                icon={<MapPin className="h-4 w-4" />}
                editing={editingTab === 'areas'}
                onEdit={() => setEditingTab('areas')}
                onCancel={() => setEditingTab(null)}
                onSave={() => submitAll(FIELD_GROUPS.areas, () => setEditingTab(null))}
                busy={busy}
                editForm={
                  <div>
                    <FieldLabel>Neighborhoods you cover</FieldLabel>
                    <ChipListEditor
                      values={values.serviceAreas ?? []}
                      onChange={(next) => setValue('serviceAreas', next)}
                      placeholder="e.g. Lekki"
                    />
                  </div>
                }
                readView={<ChipRow label="Service areas" items={values.serviceAreas} icon={<MapPin className="h-3 w-3" />} empty="No service areas added yet." />}
              />
            )}

            {activeTab === 'about' && (
              <TabSection
                title="About"
                icon={<Sparkles className="h-4 w-4" />}
                editing={editingTab === 'about'}
                onEdit={() => setEditingTab('about')}
                onCancel={() => setEditingTab(null)}
                onSave={() => submitAll(FIELD_GROUPS.about, () => setEditingTab(null))}
                busy={busy}
                editForm={
                  <div className="space-y-5">
                    <div>
                      <FieldLabel>Bio</FieldLabel>
                      <textarea
                        {...register('bio')}
                        rows={5}
                        placeholder="Tell clients what makes your service stand out."
                        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition-all duration-200 focus:border-[#00A88C] focus:ring-4 focus:ring-[#00A88C]/15"
                      />
                      <FieldError message={errors.bio?.message} />
                    </div>
                    <div>
                      <FieldLabel>Areas of expertise</FieldLabel>
                      <div className="flex flex-wrap gap-2">
                        {EXPERTISE_OPTIONS.map((opt) => {
                          const checked = (values.expertiseAreas ?? []).includes(opt.value);
                          return (
                            <button
                              type="button"
                              key={opt.value}
                              onClick={() => {
                                const current = values.expertiseAreas ?? [];
                                setValue(
                                  'expertiseAreas',
                                  checked ? current.filter((v) => v !== opt.value) : [...current, opt.value]
                                );
                              }}
                              className={`kx-chip rounded-full border px-3 py-1.5 text-xs font-medium ${
                                checked ? 'border-[#00A88C] bg-[#00A88C]/10 text-[#00A88C]' : 'border-slate-200 text-slate-500 hover:border-slate-300'
                              }`}
                            >
                              {opt.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                }
                readView={
                  <div className="space-y-5">
                    <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600">
                      {values.bio || "You haven't added a bio yet — clients see this on your public profile."}
                    </p>
                    <ChipRow
                      label="Areas of expertise"
                      items={(values.expertiseAreas ?? []).map((v) => EXPERTISE_OPTIONS.find((o) => o.value === v)?.label ?? v)}
                      icon={<Sparkles className="h-3 w-3" />}
                    />
                  </div>
                }
              />
            )}

            {activeTab === 'verification' && (
              <div>
                <h2 className="mb-5 flex items-center gap-2 text-base font-semibold text-[#0F172A]">
                  <ShieldCheck className="h-4 w-4" />
                  Verification
                </h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  <VerificationRow label="Identity / KYC" done={payload.agent.kycStatus === 'approved'} detail={payload.agent.kycStatus} delay={0} />
                  <VerificationRow label="Email" done={!!payload.user.isEmailVerified} detail={payload.user.isEmailVerified == null ? 'Unknown — check client type' : undefined} delay={60} />
                  <VerificationRow label="Phone" done={!!payload.agent.isPhoneVerified} delay={120} />
                  <VerificationRow label="Business registration (CAC)" done={false} detail="Coming soon" muted delay={180} />
                </div>
              </div>
            )}

            {activeTab === 'performance' && (
              <div>
                <h2 className="mb-5 flex items-center gap-2 text-base font-semibold text-[#0F172A]">
                  <Award className="h-4 w-4" />
                  Performance
                </h2>
                {snapshot ? (
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <StatCard label="Listings" value={snapshot.totalListings} icon={<Home className="h-4 w-4" />} delay={0} />
                    <StatCard label="Active listings" value={snapshot.activeListings} icon={<Briefcase className="h-4 w-4" />} delay={60} />
                    <StatCard label="Total views" value={snapshot.totalViews} icon={<Eye className="h-4 w-4" />} delay={120} />
                    {snapshot.audience === 'own' && snapshot.totalEnquiries != null && (
                      <StatCard label="Enquiries" value={snapshot.totalEnquiries} icon={<MessageCircle className="h-4 w-4" />} delay={180} />
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">Performance data isn't available yet.</p>
                )}
                <p className="mt-4 text-xs text-slate-400">
                  Ratings aren't shown yet — there's no review system in place, so we're not displaying a placeholder number.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

// -- shared subcomponents -----------------------------------------------------

function TabSection({
  title,
  icon,
  editing,
  onEdit,
  onCancel,
  onSave,
  busy,
  editForm,
  readView,
}: {
  title: string;
  icon: React.ReactNode;
  editing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  busy: boolean;
  editForm: React.ReactNode;
  readView: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-base font-semibold text-[#0F172A]">
          {icon}
          {title}
        </h2>
        {!editing && (
          <button type="button" onClick={onEdit} className="kx-edit-link inline-flex items-center gap-1.5 text-sm font-semibold text-[#00A88C] hover:text-[#00A88C]/80">
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </button>
        )}
      </div>

      {editing ? (
        <div key="editing" className="kx-fade-up space-y-5">
          {editForm}
          <div className="flex gap-2">
            <Button type="button" disabled={busy} onClick={onSave} className="kx-save-btn bg-[#00A88C] text-white hover:bg-[#00A88C]/90">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              Save changes
            </Button>
            <Button type="button" variant="ghost" onClick={onCancel} className="transition-transform duration-150 active:scale-95">
              <X className="h-4 w-4" />
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div key="reading" className="kx-fade-up">
          {readView}
        </div>
      )}
    </div>
  );
}

function Info({ label, value, className = '' }: { label: string; value?: string | null; className?: string }) {
  return (
    <div className={className}>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-[#0F172A]">{value || '—'}</dd>
    </div>
  );
}

function ChipRow({ label, items, icon, empty }: { label: string; items?: string[]; icon: React.ReactNode; empty?: string }) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      {items && items.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {items.map((item, i) => (
            <span
              key={item}
              style={{ animationDelay: `${i * 35}ms` }}
              className="kx-chip kx-scale-in inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600"
            >
              {icon}
              {item}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-400">{empty || 'Not added yet.'}</p>
      )}
    </div>
  );
}

function VerificationRow({
  label,
  done,
  detail,
  muted,
  delay = 0,
}: {
  label: string;
  done: boolean;
  detail?: string;
  muted?: boolean;
  delay?: number;
}) {
  return (
    <div
      style={{ animationDelay: `${delay}ms` }}
      className={`kx-fade-up flex items-center justify-between rounded-xl border px-4 py-3 transition-colors duration-200 ${
        done ? 'border-[#00A88C]/25 bg-[#00A88C]/5' : 'border-slate-200'
      }`}
    >
      <span className={`text-sm font-medium ${muted ? 'text-slate-400' : 'text-[#0F172A]'}`}>{label}</span>
      {muted ? (
        <span className="text-xs font-medium text-slate-400">{detail}</span>
      ) : (
        <span className={`flex items-center gap-1.5 text-xs font-semibold ${done ? 'text-[#00A88C]' : 'text-slate-400'}`}>
          {done ? (
            <span className="kx-pop-in flex h-4 w-4 items-center justify-center rounded-full bg-[#00A88C] text-white">
              <Check className="h-2.5 w-2.5" />
            </span>
          ) : (
            <X className="h-3.5 w-3.5" />
          )}
          {done ? (detail || 'Verified') : detail || 'Not verified'}
        </span>
      )}
    </div>
  );
}

function StatCard({ label, value, icon, delay = 0 }: { label: string; value?: number; icon: React.ReactNode; delay?: number }) {
  const animated = useCountUp(value);
  return (
    <div
      style={{ animationDelay: `${delay}ms` }}
      className="kx-stat-card kx-fade-up rounded-2xl border border-slate-200 p-4 text-center"
    >
      <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#00C9A7]/20 to-[#00A88C]/10 text-[#00A88C]">
        {icon}
      </div>
      <p className="text-xl font-bold tabular-nums text-[#0F172A]">{value != null ? animated : '—'}</p>
      <p className="mt-0.5 text-xs font-medium text-slate-500">{label}</p>
    </div>
  );
}