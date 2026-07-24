import { useState } from 'react';
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';
import ImageWithFallback from '../shared/ImageWithFallback';
import { cn } from '../../lib/utils';

interface ListingPhotosProps {
  photos: string[];
  title: string;
}

const ListingPhotos = ({ photos, title }: ListingPhotosProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (!photos || photos.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center rounded-xl bg-slate-100">
        <ImageWithFallback src={undefined} alt={title} className="h-full w-full rounded-xl" />
      </div>
    );
  }

  const prev = () => setActiveIndex((i) => (i === 0 ? photos.length - 1 : i - 1));
  const next = () => setActiveIndex((i) => (i === photos.length - 1 ? 0 : i + 1));

  return (
    <>
      {/* Main photo area */}
      <div className="relative overflow-hidden rounded-xl bg-slate-100">
        <ImageWithFallback
          src={photos[activeIndex]}
          alt={`${title} — photo ${activeIndex + 1}`}
          className="h-72 md:h-96 w-full rounded-xl"
        />

        {/* Zoom button */}
        <button
          onClick={() => setLightboxOpen(true)}
          className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm hover:bg-black/60 transition-colors"
          aria-label="Open fullscreen"
        >
          <ZoomIn className="h-4 w-4" />
        </button>

        {/* Counter */}
        <span className="absolute bottom-3 right-3 rounded-full bg-black/40 px-2.5 py-1 text-xs text-white backdrop-blur-sm">
          {activeIndex + 1} / {photos.length}
        </span>

        {/* Nav arrows */}
        {photos.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm hover:bg-black/60 transition-colors"
              aria-label="Previous photo"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm hover:bg-black/60 transition-colors"
              aria-label="Next photo"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {photos.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {photos.map((photo, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={cn(
                'shrink-0 overflow-hidden rounded-lg border-2 transition-colors',
                i === activeIndex ? 'border-[#00C9A7]' : 'border-transparent hover:border-slate-300'
              )}
            >
              <ImageWithFallback
                src={photo}
                alt={`Thumbnail ${i + 1}`}
                className="h-14 w-20 rounded-md"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>

          <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors">
            <ChevronLeft className="h-6 w-6" />
          </button>

          <img
            src={photos[activeIndex]}
            alt={`${title} — photo ${activeIndex + 1}`}
            className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain"
          />

          <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors">
            <ChevronRight className="h-6 w-6" />
          </button>

          <span className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-sm text-white">
            {activeIndex + 1} / {photos.length}
          </span>
        </div>
      )}
    </>
  );
};

export default ListingPhotos;
