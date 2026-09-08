import { ChangeEvent, useRef } from 'react';
import { Paperclip, X } from 'lucide-react';

const MAX_ATTACHMENT_SIZE = 5 * 1024 * 1024;
const ACCEPTED_ATTACHMENT_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

interface SupportAttachmentPickerProps {
  file: File | null;
  previewUrl: string | null;
  disabled?: boolean;
  onChange: (file: File | null, error: string | null) => void;
}

const SupportAttachmentPicker = ({ file, previewUrl, disabled, onChange }: SupportAttachmentPickerProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] ?? null;
    event.target.value = '';
    if (!selectedFile) return;
    if (!ACCEPTED_ATTACHMENT_TYPES.includes(selectedFile.type)) {
      onChange(null, 'Choose a JPEG, PNG, WebP, or GIF image.');
      return;
    }
    if (selectedFile.size > MAX_ATTACHMENT_SIZE) {
      onChange(null, 'Images must be 5 MB or smaller.');
      return;
    }
    onChange(selectedFile, null);
  };

  return (
    <div className="flex shrink-0 items-end">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleChange}
        className="hidden"
        aria-label="Choose an image attachment"
      />
      {file && previewUrl ? (
        <div className="relative mb-1">
          <img src={previewUrl} alt={file.name} className="h-12 w-12 rounded-lg object-cover" />
          <button
            type="button"
            onClick={() => onChange(null, null)}
            disabled={disabled}
            className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-slate-700 text-white shadow disabled:opacity-50"
            aria-label="Remove selected image"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-[#006A61] disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Attach an image"
          title="Attach an image"
        >
          <Paperclip className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default SupportAttachmentPicker;