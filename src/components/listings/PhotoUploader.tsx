import { useCallback, useState } from 'react';
import { Upload, X, ImagePlus } from 'lucide-react';
import { cn } from '../../lib/utils';

interface PhotoUploaderProps {
  files: File[];
  onChange: (files: File[]) => void;
  maxFiles?: number;
  className?: string;
}

const PhotoUploader = ({ files, onChange, maxFiles = 10, className }: PhotoUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const addFiles = useCallback(
    (newFiles: FileList | null) => {
      if (!newFiles) return;
      const valid = Array.from(newFiles).filter((f) =>
        ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(f.type)
      );
      const merged = [...files, ...valid].slice(0, maxFiles);
      onChange(merged);
    },
    [files, maxFiles, onChange]
  );

  const removeFile = (index: number) => {
    onChange(files.filter((_, i) => i !== index));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const previews = files.map((f) => URL.createObjectURL(f));

  return (
    <div className={cn('space-y-3', className)}>
      {/* Drop zone */}
      <label
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed py-10 transition-colors',
          isDragging
            ? 'border-[#00C9A7] bg-[#00C9A7]/5'
            : 'border-slate-300 bg-slate-50 hover:border-slate-400 hover:bg-slate-100',
          files.length >= maxFiles && 'pointer-events-none opacity-50'
        )}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-200">
          {isDragging ? (
            <Upload className="h-6 w-6 text-[#00C9A7]" />
          ) : (
            <ImagePlus className="h-6 w-6 text-slate-400" />
          )}
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-slate-700">
            {isDragging ? 'Drop photos here' : 'Drag photos here or click to browse'}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            JPEG, PNG, WebP · Max 5MB each · Up to {maxFiles} photos
          </p>
        </div>
        <input
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          multiple
          className="sr-only"
          onChange={(e) => addFiles(e.target.files)}
          disabled={files.length >= maxFiles}
        />
      </label>

      {/* Preview grid */}
      {files.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {previews.map((src, i) => (
            <div key={i} className="group relative aspect-square overflow-hidden rounded-lg">
              <img src={src} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
                aria-label={`Remove photo ${i + 1}`}
              >
                <X className="h-5 w-5 text-white" />
              </button>
              {i === 0 && (
                <span className="absolute bottom-1 left-1 rounded bg-black/50 px-1 py-0.5 text-[10px] text-white">
                  Cover
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-slate-400">
        {files.length}/{maxFiles} photos added
        {files.length === 0 && ' — first photo will be the cover image'}
      </p>
    </div>
  );
};

export default PhotoUploader;
