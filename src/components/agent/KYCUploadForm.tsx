import { useRef, useState } from 'react';
import { Upload, FileCheck, AlertCircle, CheckCircle, X, Lock, ShieldCheck, IdCard, ScanFace, Check } from 'lucide-react';
import { useSubmitKYC } from '../../hooks/useKYC';
import SelfieCaptureWidget from './SelfieCaptureWidget';
import { cn } from '../../lib/utils';

const ID_TYPES = [
  { value: 'NIN', label: 'National Identity Number (NIN)' },
  { value: 'DRIVERS_LICENSE', label: "Driver's Licence" },
  { value: 'INTERNATIONAL_PASSPORT', label: 'International Passport' },
];

/* ------------------------------------------------------------------ */
/*  File dropzone                                                      */
/* ------------------------------------------------------------------ */

interface FileDropzoneProps {
  label: string;
  hint: string;
  file: File | null;
  onFile: (f: File) => void;
  onClear: () => void;
}

const FileDropzone = ({ label, hint, file, onFile, onClear }: FileDropzoneProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) onFile(dropped);
  };

  if (file) {
    return (
      <div className="group flex items-center justify-between rounded-xl border border-[#00C9A7]/25 bg-[#00C9A7]/[0.04] px-4 py-3 transition-all hover:shadow-sm hover:shadow-[#00C9A7]/10">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#00C9A7]/12">
            <FileCheck className="h-4 w-4 text-[#00A88C]" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-[#0F172A]">{file.name}</p>
            <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(0)} KB</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClear}
          aria-label="Remove file"
          className="ml-2 shrink-0 rounded-full p-2 text-slate-400 transition-all hover:bg-white hover:text-slate-600 hover:shadow-sm"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click(); }}
      role="button"
      tabIndex={0}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={cn(
        'cursor-pointer rounded-xl border-2 border-dashed px-4 py-8 text-center transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00C9A7]/40 sm:py-7',
        dragging
          ? 'scale-[1.01] border-[#00C9A7] bg-[#00C9A7]/[0.06]'
          : 'border-slate-200 hover:border-[#00C9A7]/40 hover:bg-slate-50/80'
      )}
    >
      <div
        className={cn(
          'mx-auto mb-2.5 flex h-11 w-11 items-center justify-center rounded-full transition-colors',
          dragging ? 'bg-[#00C9A7]/15' : 'bg-slate-100'
        )}
      >
        <Upload className={cn('h-5 w-5', dragging ? 'text-[#00A88C]' : 'text-slate-400')} />
      </div>
      <p className="text-sm font-medium text-slate-600">{label}</p>
      <p className="mt-1 text-xs text-slate-400">{hint}</p>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }}
      />
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Section shell + step progress                                      */
/* ------------------------------------------------------------------ */

interface SectionProps {
  index: number;
  title: string;
  description: string;
  icon: React.ElementType;
  complete: boolean;
  children: React.ReactNode;
}

const Section = ({ index, title, description, icon: Icon, complete, children }: SectionProps) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/[0.02] sm:p-6 lg:p-7">
    <div className="mb-5 flex items-start gap-3">
      <div
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors',
          complete ? 'bg-[#00C9A7] text-[#0A1628]' : 'bg-[#0A1628]/[0.06] text-[#0A1628]/50'
        )}
      >
        {complete ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
      </div>
      <div className="min-w-0 pt-0.5">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-[#00A88C]">Step {index}</p>
        <h3 className="text-sm font-semibold text-[#0F172A] sm:text-base">{title}</h3>
        <p className="mt-0.5 text-xs text-slate-400 sm:text-sm">{description}</p>
      </div>
    </div>
    {children}
  </div>
);

const ProgressRail = ({ steps }: { steps: { label: string; complete: boolean }[] }) => (
  <div className="mb-6 flex items-center">
    {steps.map((step, i) => (
      <div key={step.label} className="flex flex-1 items-center last:flex-none">
        <div className="flex flex-col items-center gap-1.5">
          <div
            className={cn(
              'flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-semibold transition-colors',
              step.complete ? 'bg-[#00C9A7] text-[#0A1628]' : 'bg-slate-100 text-slate-400'
            )}
          >
            {step.complete ? <Check className="h-3.5 w-3.5" /> : i + 1}
          </div>
          <span className="hidden text-[11px] font-medium text-slate-500 sm:block">{step.label}</span>
        </div>
        {i < steps.length - 1 && (
          <div
            className={cn(
              'mx-2 h-px flex-1 transition-colors',
              step.complete ? 'bg-[#00C9A7]/50' : 'bg-slate-200'
            )}
          />
        )}
      </div>
    ))}
  </div>
);

/* ------------------------------------------------------------------ */
/*  Main form                                                           */
/* ------------------------------------------------------------------ */

const KYCUploadForm = () => {
  const { mutate: submitKYC, isPending, isSuccess, error } = useSubmitKYC();

  const [idType, setIdType] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [selfieNeutralFile, setSelfieNeutralFile] = useState<File | null>(null);
  const [selfieSmilingFile, setSelfieSmilingFile] = useState<File | null>(null);
  const [formError, setFormError] = useState('');

  const inputClass = (hasError = false) => cn(
    'w-full rounded-xl border px-3.5 py-2.5 text-sm text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-colors',
    hasError
      ? 'border-red-300 focus:ring-red-200'
      : 'border-slate-200 focus:border-[#00C9A7] focus:ring-[#00C9A7]/15'
  );

  const detailsComplete = Boolean(firstName && lastName && idType && idNumber);
  const documentComplete = Boolean(documentFile);
  const selfieComplete = Boolean(selfieNeutralFile && selfieSmilingFile);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!idType || !idNumber || !firstName || !lastName) {
      return setFormError('Please fill in all required fields.');
    }
    if (!documentFile) return setFormError('Please upload your identity document.');
    if (!selfieNeutralFile || !selfieSmilingFile) return setFormError('Please capture both neutral and smiling selfie photos.');

    submitKYC({
      document: documentFile,
      selfieNeutral: selfieNeutralFile,
      selfieSmiling: selfieSmilingFile,
      idType,
      idNumber,
      firstName,
      lastName,
    });
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-[#00C9A7]/20 bg-[#00C9A7]/[0.04] p-8 text-center shadow-sm shadow-[#00C9A7]/5 sm:p-10">
        <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#00C9A7]/10">
          <CheckCircle className="h-7 w-7 text-[#00A88C]" />
        </div>
        <div>
          <p className="text-lg font-semibold text-[#0F172A]">Documents submitted</p>
          <p className="mx-auto mt-1.5 max-w-xs text-sm leading-relaxed text-slate-500">
            Your KYC application is under review. We'll notify you by email once it's processed — usually within 1–2 business days.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-5">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#0A1628]">
          <ShieldCheck className="h-4.5 w-4.5 text-[#00C9A7]" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-[#0F172A] sm:text-lg">Identity verification</h2>
          <p className="text-xs text-slate-400 sm:text-sm">Complete all three steps to activate your account</p>
        </div>
      </div>

      <ProgressRail
        steps={[
          { label: 'Details', complete: detailsComplete },
          { label: 'Document', complete: documentComplete },
          { label: 'Selfie', complete: selfieComplete },
        ]}
      />

      {/* Error */}
      {(formError || error) && (
        <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
          <p className="text-sm text-red-600">{formError || error?.message}</p>
        </div>
      )}

      {/* Step 1 — Personal details */}
      <Section
        index={1}
        title="Personal details"
        description="Enter your name and ID number exactly as they appear on your document"
        icon={IdCard}
        complete={detailsComplete}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                First name <span className="text-red-500">*</span>
              </label>
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="As on your ID"
                className={inputClass()}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Last name <span className="text-red-500">*</span>
              </label>
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="As on your ID"
                className={inputClass()}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                ID type <span className="text-red-500">*</span>
              </label>
              <select value={idType} onChange={(e) => setIdType(e.target.value)} className={inputClass()}>
                <option value="">Select ID type</option>
                {ID_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                ID number <span className="text-red-500">*</span>
              </label>
              <input
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                placeholder="Enter your ID number"
                className={inputClass()}
              />
            </div>
          </div>
        </div>
      </Section>

      {/* Step 2 — Identity document */}
      <Section
        index={2}
        title="Identity document"
        description="A clear photo of the front of your ID card or your passport bio page"
        icon={FileCheck}
        complete={documentComplete}
      >
        <FileDropzone
          label="Upload document photo"
          hint="JPG, PNG or PDF, up to 10MB"
          file={documentFile}
          onFile={setDocumentFile}
          onClear={() => setDocumentFile(null)}
        />
      </Section>

      {/* Step 3 — Selfie */}
      <Section
        index={3}
        title="Selfie verification"
        description="Two quick photos so we can match your face to your document"
        icon={ScanFace}
        complete={selfieComplete}
      >
        <SelfieCaptureWidget
          onChange={(neutral, smiling) => {
            setSelfieNeutralFile(neutral);
            setSelfieSmilingFile(smiling);
          }}
          initialNeutral={selfieNeutralFile}
          initialSmiling={selfieSmilingFile}
        />
      </Section>

      {/* Privacy note */}
      <div className="flex items-start gap-2 rounded-xl bg-slate-50 px-3.5 py-3">
        <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
        <p className="text-xs leading-relaxed text-slate-400">
          Your documents are encrypted and stored securely. They are only accessible to KhenX admins for verification and are never shared with third parties.
        </p>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="sticky bottom-4 w-full rounded-xl bg-[#00C9A7] py-3.5 text-sm font-semibold text-[#0A1628] shadow-lg shadow-[#00C9A7]/25 transition-all hover:-translate-y-0.5 hover:bg-[#00b396] disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 sm:static sm:shadow-sm"
      >
        {isPending ? 'Submitting…' : 'Submit for verification'}
      </button>
    </form>
  );
};

export default KYCUploadForm;