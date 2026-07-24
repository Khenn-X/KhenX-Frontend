'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import ImageWithFallback from '../shared/ImageWithFallback';

interface NeighbourhoodImageGalleryProps {
  areaName: string;
  imageUrl?: string | null;
  imageUrlSchool?: string | null;
  imageUrlStreet?: string | null;
  imageUrlBank?: string | null;
  imageUrlMarket?: string | null;
}

const IMAGE_CARDS: Array<{
  key: keyof Omit<NeighbourhoodImageGalleryProps, 'areaName'>;
  label: string;
}> = [
  { key: 'imageUrl', label: 'Area hero' },
  { key: 'imageUrlSchool', label: 'Nearby school' },
  { key: 'imageUrlStreet', label: 'Street view' },
  { key: 'imageUrlBank', label: 'Bank / ATM' },
  { key: 'imageUrlMarket', label: 'Market' },
];

const NeighbourhoodImageGallery = ({
  areaName,
  imageUrl,
  imageUrlSchool,
  imageUrlStreet,
  imageUrlBank,
  imageUrlMarket,
}: NeighbourhoodImageGalleryProps) => {
  const images = IMAGE_CARDS.map((item) => ({
    src: {
      imageUrl,
      imageUrlSchool,
      imageUrlStreet,
      imageUrlBank,
      imageUrlMarket,
    }[item.key],
    label: item.label,
    key: item.key,
  })).filter((item) => !!item.src);

  const [active, setActive] = useState(0);

  if (images.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-bold text-[#0F172A] mb-3">Life in {areaName}</p>
        <p className="text-sm text-slate-500">
          There aren’t any photos uploaded for this area yet.
        </p>
      </div>
    );
  }

  const goTo = (index: number) => {
    setActive((index + images.length) % images.length);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-bold text-[#0F172A]">Life in {areaName}</p>
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
          {images.length} {images.length === 1 ? 'photo' : 'photos'}
        </span>
      </div>

      {/* ── Stage ─────────────────────────────────────────────── */}
      <div className="group/stage relative h-72 sm:h-80 w-full overflow-hidden rounded-2xl bg-slate-100">
        {images.map((image, index) => (
          <div
            key={image.key}
            className={`absolute inset-0 transition-opacity duration-700 ease-out ${
              index === active ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <ImageWithFallback
              src={image.src ?? undefined}
              alt={`${image.label} for ${areaName}`}
              className={`h-full w-full object-cover transition-transform duration-[6000ms] ease-out ${
                index === active ? 'scale-105' : 'scale-100'
              }`}
            />
          </div>
        ))}

        {/* Bottom scrim for caption legibility */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 to-transparent" />

        {/* Caption tag, slides in on change */}
        <div
          key={`caption-${active}`}
          className="absolute bottom-4 left-4 flex items-center gap-1.5 rounded-full bg-white/95 backdrop-blur-sm px-3 py-1.5 shadow-sm animate-[slideIn_0.45s_ease-out]"
        >
          <MapPin className="h-3 w-3 text-[#00C9A7]" />
          <span className="text-[11px] font-semibold text-[#0F172A]">
            {images[active].label}
          </span>
        </div>

        {/* Counter, top right */}
        <div className="absolute top-4 right-4 rounded-full bg-black/40 backdrop-blur-sm px-2.5 py-1 text-[10px] font-semibold text-white">
          {active + 1} / {images.length}
        </div>

        {/* Prev / Next arrows, appear on hover of stage */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => goTo(active - 1)}
              aria-label="Previous photo"
              className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#0F172A] opacity-0 shadow-sm transition-all duration-300 group-hover/stage:opacity-100 hover:scale-110"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => goTo(active + 1)}
              aria-label="Next photo"
              className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#0F172A] opacity-0 shadow-sm transition-all duration-300 group-hover/stage:opacity-100 hover:scale-110"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}
      </div>

      {/* ── Filmstrip ─────────────────────────────────────────── */}
      {images.length > 1 && (
        <div className="relative mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.map((image, index) => (
            <button
              key={image.key}
              type="button"
              onClick={() => goTo(index)}
              className="group relative flex-shrink-0 overflow-hidden rounded-lg"
              style={{ width: 76, height: 56 }}
            >
              <ImageWithFallback
                src={image.src ?? undefined}
                alt={`${image.label} thumbnail`}
                className={`h-full w-full object-cover transition-all duration-300 ${
                  index === active
                    ? 'opacity-100'
                    : 'opacity-50 group-hover:opacity-80'
                }`}
              />
              {/* Moving underline indicator */}
              <div
                className={`absolute bottom-0 left-0 right-0 h-0.75 bg-[#00C9A7] transition-transform duration-300 ${
                  index === active ? 'scale-x-100' : 'scale-x-0'
                }`}
              />
            </button>
          ))}
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-8px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};

export default NeighbourhoodImageGallery;
