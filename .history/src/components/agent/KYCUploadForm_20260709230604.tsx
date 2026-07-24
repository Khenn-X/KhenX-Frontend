import { useRef, useState } from 'react';
import { Upload, FileCheck, AlertCircle, CheckCircle, X, Lock } from 'lucide-react';
import { useSubmitKYC } from '../../hooks/useKYC';
import { cn } from '../../lib/utils';

const ID_TYPES = [
  { value: 'NIN', label: 'National Identity Number (NIN)' },
  { value: 'DRIVERS_LICENSE', label: "Driver's Licence" },
  { value: 'INTERNATIONAL_PASSPORT', label: 'International Passport' },
];

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
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#00C9A7]/12">
            <FileCheck className="h-4 w-4 text-[#00A88C]" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-[#0F172A] truncate max-w-[200px]">{file.name}</p>
            <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(0)} KB</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="ml-2 shrink-0 rounded-full p-1.5 text-slate-400 hover:bg-white hover:text-slate-600 hover:shadow-sm transition-all"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={cn(
        'cursor-pointer rounded-xl border-2 border-dashed px-4 py-7 text-center transition-all duration-150',
        dragging
          ? 'border-[#00C9A7] bg-[#00C9A7]/[0.06] scale-[1.01]'
          : 'border-slate-200 hover:border-[#00C9A7]/40 hover:bg-slate-50/80'
      )}
    >
      <div className={cn(
        'mx-auto mb-2.5 flex h-10 w-10 items-center justify-center rounded-full transition-colors',
        dragging ? 'bg-[#00C9A7]/15' : 'bg-slate-100'
      )}>
        <Upload className={cn('h-4.5 w-4.5', dragging ? 'text-[#00A88C]' : 'text-slate-400')} />
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

const KYCUploadForm = () => {
  const { mutate: submitKYC, isPending, isSuccess, error } = useSubmitKYC();

  const [idType, setIdType] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [formError, setFormError] = useState('');

  const inputClass = (hasError = false) => cn(
    'w-full rounded-xl border px-3 py-2.5 text-sm text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-colors',
    hasError
      ? 'border-red-300 focus:ring-red-200'
      : 'border-slate-200 focus:border-[#00C9A7] focus:ring-[#00C9A7]/15'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!idType || !idNumber || !firstName || !lastName) {
      return setFormError('Please fill in all required fields.');
    }
    if (!documentFile) return setFormError('Please upload your identity document.');
    if (!selfieFile) return setFormError('Please upload a selfie photo.');

    submitKYC({
      document: documentFile,
      selfie: selfieFile,
      idType,
      idNumber,
      firstName,
      lastName,
    });
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl bg-[#00C9A7]/[0.04] border border-[#00C9A7]/20 p-10 text-center shadow-sm shadow-[#00C9A7]/5">
        <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#00C9A7]/10">
          <CheckCircle className="h-7 w-7 text-[#00A88C]" />
        </div>
        <div>
          <p className="text-lg font-semibold text-[#0F172A]">Documents submitted</p>
          <p className="mt-1.5 text-sm text-slate-500 max-w-xs mx-auto leading-relaxed">
            Your KYC application is under review. We'll notify you by email once it's processed — usually within 1–2 business days.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Error */}
      {(formError || error) && (
        <div className="flex items-start gap-2.5 rounded-xl bg-red-50 border border-red-200 px-4 py-3">
          <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
          <p className="text-sm text-red-600">{formError || error?.message}</p>
        </div>
      )}

      {/* Name row */}
      <div className="grid grid-cols-2 gap-3">
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
      </div>

      {/* ID type */}
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

      {/* ID number */}
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

      {/* Document upload */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          Identity document <span className="text-red-500">*</span>
        </label>
        <FileDropzone
          label="Upload document photo"
          hint="JPG, PNG or PDF — front of your ID card or passport bio page"
          file={documentFile}
          onFile={setDocumentFile}
          onClear={() => setDocumentFile(null)}
        />
      </div>

      {/* Selfie upload */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          Selfie photo <span className="text-red-500">*</span>
        </label>
        <FileDropzone
          label="Upload a selfie"
          hint="Clear photo of your face — no sunglasses, good lighting"
          file={selfieFile}
          onFile={setSelfieFile}
          onClear={() => setSelfieFile(null)}
        />
      </div>

      {/* Privacy note */}
      <div className="flex items-start gap-2 rounded-xl bg-slate-50 px-3.5 py-3">
        <Lock className="h-3.5 w-3.5 text-slate-400 mt-0.5 shrink-0" />
        <p className="text-xs text-slate-400 leading-relaxed">
          Your documents are encrypted and stored securely. They are only accessible to KhenX admins for verification and are never shared with third parties.
        </p>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-xl bg-[#00C9A7] py-3 text-sm font-semibold text-[#0A1628] shadow-sm shadow-[#00C9A7]/30 hover:bg-[#00b396] hover:-translate-y-0.5 disabled:opacity-60 disabled:translate-y-0 transition-all"
      >
        {isPending ? 'Submitting…' : 'Submit for verification'}
      </button>
    </form>
  );
};

export default KYCUploadForm;