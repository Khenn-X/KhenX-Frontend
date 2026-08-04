import { useEffect, useState, useCallback, useRef } from "react";

interface PropertyGalleryProps {
  photos: string[];
  title: string;
  isFeatured?: boolean;
  isVerified?: boolean;
}

const ImagesIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M14 8h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);
const VerifiedBadge = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="#fff" stroke="none">
    <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);
const X = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
);
const ChevronLeft = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
);
const ChevronRight = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
);

const PropertyGallery = ({ photos, title, isFeatured, isVerified }: PropertyGalleryProps) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const hasPhotos = photos && photos.length > 0;
  const gridPhotos = photos.slice(1, 5); // up to 4 secondary photos
  const remaining = photos.length > 5 ? photos.length - 5 : 0;

  const openLightbox = (index: number) => {
    setActiveIndex(index);
    setLightboxOpen(true);
  };

  const prev = useCallback(
    () => setActiveIndex((i) => (i === 0 ? photos.length - 1 : i - 1)),
    [photos.length]
  );
  const next = useCallback(
    () => setActiveIndex((i) => (i === photos.length - 1 ? 0 : i + 1)),
    [photos.length]
  );

  // Keyboard navigation in lightbox
  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightboxOpen, prev, next]);

  // Touch swipe navigation for the lightbox (mobile)
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    const SWIPE_THRESHOLD = 45;
    if (diff > SWIPE_THRESHOLD) prev();
    else if (diff < -SWIPE_THRESHOLD) next();
    touchStartX.current = null;
  };

  if (!hasPhotos) {
    return (
      <div
        className="khenx-gallery-empty"
        style={{
          borderRadius: 18,
          height: 460,
          background: "#E2E8F0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#94A3B8",
          fontSize: 14,
        }}
      >
        No photos available
      </div>
    );
  }

  return (
    <>
      <div className="khenx-gallery">
        {/* Hero image — full width on top */}
        <div
          className="khenx-gallery-hero"
          onClick={() => openLightbox(0)}
          style={{
            position: "relative",
            borderRadius: 18,
            overflow: "hidden",
            cursor: "pointer",
            background: "#CBD5E1",
            height: 420,
          }}
        >
            
          <img
            src={photos[0]}
            alt={title}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to bottom, rgba(0,0,0,0.18) 0%, transparent 35%, transparent 65%, rgba(0,0,0,0.38) 100%)",
              pointerEvents: "none",
            }}
          />
          <div className="khenx-gallery-badges" style={{ position: "absolute", top: 16, left: 16, display: "flex", gap: 8, flexWrap: "wrap", maxWidth: "calc(100% - 32px)" }}>
            {isVerified && (
              <span
                style={{
                  background: "#00C9A7",
                  color: "#fff",
                  borderRadius: 20,
                  padding: "5px 12px",
                  fontSize: 10,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  letterSpacing: "0.3px",
                  whiteSpace: "nowrap",
                }}
              >
                <VerifiedBadge /> Verified Listing
              </span>
            )}
            {isFeatured && (
              <span
                style={{
                  background: "rgba(15,23,42,0.85)",
                  backdropFilter: "blur(6px)",
                  color: "#fff",
                  borderRadius: 20,
                  padding: "5px 12px",
                  fontSize: 10,
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                }}
              >
                ✦ Featured
              </span>
            )}
          </div>
        </div>

        {/* Secondary photos — row below the hero */}
        {gridPhotos.length > 0 && (
          <div className="khenx-gallery-row">
            {Array.from({ length: 4 }).map((_, i) => {
              const photo = gridPhotos[i];
              const isLastCell = i === 3;
              const showOverlay = isLastCell && remaining > 0;
              if (!photo) {
                return <div key={i} style={{ borderRadius: 14, background: "#F1F5F9", aspectRatio: "1.3" }} />;
              }
              return (
                <div
                  key={i}
                  onClick={() => openLightbox(i + 1)}
                  style={{
                    position: "relative",
                    borderRadius: 14,
                    overflow: "hidden",
                    cursor: "pointer",
                    background: "#CBD5E1",
                    aspectRatio: "1.3",
                  }}
                >
                  <img
                    src={photo}
                    alt={`${title} photo ${i + 2}`}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                  {showOverlay && (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        openLightbox(0);
                      }}
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: "rgba(15,23,42,0.6)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                        color: "#fff",
                      }}
                    >
                      <ImagesIcon />
                      <span style={{ fontSize: 13, fontWeight: 700 }}>+{remaining} photos</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* View all photos button */}
      {photos.length > 1 && (
        <button
          onClick={() => openLightbox(0)}
          className="khenx-gallery-view-all"
          style={{
            marginTop: 10,
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            background: "#fff",
            border: "1.5px solid #E2E8F0",
            borderRadius: 10,
            padding: "8px 14px",
            fontSize: 12.5,
            fontWeight: 600,
            color: "#0F172A",
            cursor: "pointer",
          }}
        >
          <ImagesIcon /> View all {photos.length} photos
        </button>
      )}

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            background: "rgba(15,23,42,0.95)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            touchAction: "pan-y",
          }}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            aria-label="Close"
            className="khenx-lightbox-close"
            style={{
              position: "absolute",
              top: 20,
              right: 20,
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.1)",
              border: "none",
              color: "#fff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <X />
          </button>

          {photos.length > 1 && (
            <button
              onClick={prev}
              aria-label="Previous photo"
              className="khenx-lightbox-nav khenx-lightbox-prev"
              style={{
                position: "absolute",
                left: 20,
                top: "50%",
                transform: "translateY(-50%)",
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.1)",
                border: "none",
                color: "#fff",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <ChevronLeft />
            </button>
          )}

          <img
            src={photos[activeIndex]}
            alt={`${title} photo ${activeIndex + 1}`}
            className="khenx-lightbox-img"
            style={{ maxHeight: "85vh", maxWidth: "88vw", objectFit: "contain", borderRadius: 10 }}
          />

          {photos.length > 1 && (
            <button
              onClick={next}
              aria-label="Next photo"
              className="khenx-lightbox-nav khenx-lightbox-next"
              style={{
                position: "absolute",
                right: 20,
                top: "50%",
                transform: "translateY(-50%)",
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.1)",
                border: "none",
                color: "#fff",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <ChevronRight />
            </button>
          )}

          <span
            className="khenx-lightbox-counter"
            style={{
              position: "absolute",
              bottom: 24,
              left: "50%",
              transform: "translateX(-50%)",
              background: "rgba(255,255,255,0.1)",
              color: "#fff",
              borderRadius: 20,
              padding: "6px 16px",
              fontSize: 12.5,
              fontWeight: 600,
              whiteSpace: "nowrap",
            }}
          >
            {activeIndex + 1} / {photos.length}
          </span>
        </div>
      )}

      <style>{`
        .khenx-gallery-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
          margin-top: 8px;
        }

        /* ── Tablet ──────────────────────────────────────────────────────── */
        @media (max-width: 860px) {
          .khenx-gallery-hero {
            height: 280px !important;
          }
          .khenx-gallery-row {
            grid-template-columns: repeat(2, 1fr);
          }
          .khenx-lightbox-nav {
            width: 38px !important;
            height: 38px !important;
          }
          .khenx-lightbox-prev { left: 10px !important; }
          .khenx-lightbox-next { right: 10px !important; }
          .khenx-lightbox-close {
            top: 12px !important;
            right: 12px !important;
            width: 36px !important;
            height: 36px !important;
          }
        }

        /* ── Phones ──────────────────────────────────────────────────────── */
        @media (max-width: 480px) {
          .khenx-gallery-hero {
            height: 220px !important;
            border-radius: 14px !important;
          }
          .khenx-gallery-empty {
            height: 220px !important;
          }
          .khenx-gallery-row {
            gap: 6px !important;
          }
          .khenx-gallery-badges span {
            font-size: 9px !important;
            padding: 4px 9px !important;
          }
          .khenx-gallery-view-all {
            width: 100%;
            justify-content: center;
          }
          .khenx-lightbox-img {
            max-width: 94vw !important;
            max-height: 72vh !important;
          }
          .khenx-lightbox-counter {
            bottom: max(16px, env(safe-area-inset-bottom)) !important;
            font-size: 11.5px !important;
            padding: 5px 13px !important;
          }
        }
      `}</style>
    </>
  );
};

export default PropertyGallery;