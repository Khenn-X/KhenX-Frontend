import { useState } from "react";
import { ArrowUpRight, ChevronDown, Loader2 } from "lucide-react";
import type { INeighbourhoodIntelligence } from "../../types/neighbourhood.types";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatRent = (
  min?: number | null,
  max?: number | null,
): string | null => {
  if (!min || !max) return null;
  const fmt = (n: number) => {
    if (n >= 1_000_000)
      return `₦${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
    if (n >= 1_000) return `₦${Math.round(n / 1_000)}K`;
    return `₦${n}`;
  };
  return `${fmt(min)} – ${fmt(max)}/yr`;
};

const scoreColor = (score?: number | null) => {
  if (score == null) return "bg-slate-500";
  if (score >= 7.5) return "bg-[#00C9A7]";
  if (score >= 5) return "bg-amber-500";
  return "bg-red-500";
};

// ─── Card variants ───────────────────────────────────────────────────────────

interface CardProps {
  area: INeighbourhoodIntelligence;
  variant: "wide" | "tall" | "small";
}

const AreaCard = ({ area, variant }: CardProps) => {
  const rent = formatRent(area.avgRentMin, area.avgRentMax);

  const heightClass =
    variant === "wide"
      ? "h-64 sm:h-72"
      : variant === "tall"
        ? "h-64 sm:h-72"
        : "h-48 sm:h-52";

  return (
    <a
      href={`/neighbourhood/${encodeURIComponent(area.areaName)}`}
      className={`group relative block overflow-hidden rounded-2xl w-full ${heightClass}`}
    >
      {/* Image */}
      <img
        src={area.imageUrl || "/images/area-placeholder.jpg"}
        alt={area.areaName}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628] via-[#0A1628]/30 to-transparent" />

      {/* Score badge top-right */}
      {area.overallScore != null && (
        <span
          className={`absolute top-4 right-4 inline-flex items-center rounded-full ${scoreColor(area.overallScore)} px-2.5 py-1 text-xs font-bold text-white shadow`}
        >
          {area.overallScore.toFixed(1)}
        </span>
      )}

      {/* Bottom content */}
      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
        <h4 className="text-white font-bold leading-tight text-base sm:text-lg">
          {area.areaName}
        </h4>

        {rent ? (
          <p className="text-slate-300 text-xs mt-0.5">Avg. Rent: {rent}</p>
        ) : area.propertiesCount ? (
          <p className="text-slate-300 text-xs mt-0.5">
            {area.propertiesCount.toLocaleString()} Properties
          </p>
        ) : (
          <p className="text-slate-300 text-xs mt-0.5">Luxury Hub</p>
        )}

        {/* Tags row */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {area.floodRisk && (
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold text-white ${
                area.floodRisk === "low"
                  ? "bg-[#00C9A7]/80"
                  : area.floodRisk === "medium"
                    ? "bg-amber-500/80"
                    : "bg-red-500/80"
              }`}
            >
              {area.floodRisk === "low"
                ? "Low Flood Risk"
                : area.floodRisk === "medium"
                  ? "Medium Flood Risk"
                  : "High Flood Risk"}
            </span>
          )}
          {area.powerScore != null && area.powerScore >= 7 && (
            <span className="rounded-full bg-white/15 backdrop-blur px-2 py-0.5 text-[10px] font-medium text-white">
              Reliable Power
            </span>
          )}
        </div>
      </div>

      {/* Arrow on wide/hero cards */}
      {variant === "wide" && (
        <span className="absolute bottom-4 right-4 sm:bottom-5 sm:right-5 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-[#0A1628] opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0.5">
          <ArrowUpRight className="h-4 w-4" />
        </span>
      )}
    </a>
  );
};

// ─── Skeleton ────────────────────────────────────────────────────────────────

const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse rounded-2xl bg-slate-200 ${className}`} />
);

// ─── Row layouts — alternates between two patterns ───────────────────────────
// Pattern A: [wide 2-col] + [small 1-col]   → 3 areas
// Pattern B: [small] + [small] + [small]     → 3 areas

interface RowProps {
  areas: INeighbourhoodIntelligence[];
  pattern: "A" | "B";
}

const GridRow = ({ areas, pattern }: RowProps) => {
  if (pattern === "A") {
    const [wide, small] = areas;
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {wide && (
          <div className="sm:col-span-2">
            <AreaCard area={wide} variant="wide" />
          </div>
        )}
        {small && <AreaCard area={small} variant="tall" />}
      </div>
    );
  }

  // Pattern B — but make middle card taller for visual rhythm
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
      {areas[0] && <AreaCard area={areas[0]} variant="small" />}
      {areas[1] && <AreaCard area={areas[1]} variant="small" />}
      {areas[2] && <AreaCard area={areas[2]} variant="small" />}
    </div>
  );
};

// ─── Skeleton row ─────────────────────────────────────────────────────────────

const SkeletonRow = ({ pattern }: { pattern: "A" | "B" }) => {
  if (pattern === "A") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="sm:col-span-2">
          <Skeleton className="h-64 sm:h-72" />
        </div>
        <Skeleton className="h-64 sm:h-72" />
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
      <Skeleton className="h-48 sm:h-52" />
      <Skeleton className="h-48 sm:h-52" />
      <Skeleton className="h-48 sm:h-52" />
    </div>
  );
};

// ─── Main component ──────────────────────────────────────────────────────────

interface NeighbourhoodBrowseGridProps {
  areas: INeighbourhoodIntelligence[];
  isLoading: boolean;
  isError: boolean;
  hasMore: boolean;
  isFetchingMore: boolean;
  onLoadMore: () => void;
}

const PAGE_SIZE = 6; // 2 rows of 3

export default function NeighbourhoodBrowseGrid({
  areas,
  isLoading,
  isError,
  hasMore,
  isFetchingMore,
  onLoadMore,
}: NeighbourhoodBrowseGridProps) {
  // Chunk areas into rows of 3, alternating A/B layout
  const rows: { areas: INeighbourhoodIntelligence[]; pattern: "A" | "B" }[] =
    [];
  for (let i = 0; i < areas.length; i += 3) {
    rows.push({
      areas: areas.slice(i, i + 3),
      pattern: Math.floor(i / 3) % 2 === 0 ? "A" : "B",
    });
  }

  if (isError) {
    return (
      <p className="text-center text-sm text-slate-500 py-10">
        Couldn't load neighbourhood right now. Please try again shortly.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      {/* Section header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#00C9A7] mb-1">
            Intelligence Highlights
          </p>
          <h3 className="text-2xl sm:text-3xl font-bold text-[#0F172A]">
            Top Locales
          </h3>
        </div>
        <a
          href="/neighbourhood/compare"
          className="text-sm font-semibold text-[#00C9A7] hover:underline hidden sm:block"
        >
          Compare areas →
        </a>
      </div>

      {/* Grid rows */}
      {isLoading ? (
        <div className="space-y-5">
          <SkeletonRow pattern="A" />
          <SkeletonRow pattern="B" />
        </div>
      ) : (
        <div className="space-y-5">
          {rows.map((row, i) => (
            <GridRow key={i} areas={row.areas} pattern={row.pattern} />
          ))}
        </div>
      )}

      {/* Load More */}
      {!isLoading && (hasMore || isFetchingMore) && (
        <div className="flex justify-center pt-4">
          <button
            onClick={onLoadMore}
            disabled={isFetchingMore}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:border-[#00C9A7] hover:text-[#00C9A7] transition-colors disabled:opacity-60"
          >
            {isFetchingMore ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading more…
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                Load More
              </>
            )}
          </button>
        </div>
      )}

      {!isLoading && !hasMore && areas.length > 0 && (
        <p className="text-center text-xs text-slate-400 pt-2">
          All {areas.length} neighbourhood loaded
        </p>
      )}
    </div>
  );
}
