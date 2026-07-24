import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import { useFeaturedAreas } from '../../hooks/useNeighbourhood';
import type { INeighbourhoodIntelligence } from '../../types/neighbourhood.types';

// ─── Helpers ────────────────────────────────────────────────────────────────
const formatRent = (min?: number, max?: number) => {
  if (!min || !max) return null;
  const fmt = (n: number) => {
    if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
    if (n >= 1_000) return `₦${Math.round(n / 1_000)}K`;
    return `₦${n}`;
  };
  return `Avg. Rent: ${fmt(min)} - ${fmt(max)} / yr`;
};

const scoreColor = (score?: number | null) => {
  if (score === undefined || score === null) return 'bg-slate-400';
  if (score >= 7.5) return 'bg-[#00C9A7]';
  if (score >= 5) return 'bg-[#F59E0B]';
  return 'bg-[#DC2626]';
};

// ─── Card ───────────────────────────────────────────────────────────────────
interface AreaCardProps {
  area: INeighbourhoodIntelligence;
  size: 'hero' | 'medium' | 'small';
}

const AreaCard = ({ area, size }: AreaCardProps) => {
  const rent = formatRent(area.avgRentMin, area.avgRentMax);
  const heightClass = size === 'hero' ? 'h-72 sm:h-80' : 'h-48 sm:h-56';

  return (
    <a
      href={`/neighbourhoods/${encodeURIComponent(area.areaName)}`}
      className={`group relative block overflow-hidden rounded-2xl ${heightClass}`}
    >
      <img
        src={area.imageUrl || '/images/area-placeholder.jpg'}
        alt={area.areaName}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628] via-[#0A1628]/35 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
        <h4 className="text-white font-bold text-base sm:text-lg leading-tight">
          {area.areaName}
        </h4>
        <p className="text-slate-200 text-xs sm:text-sm mt-0.5">
          {rent ?? 'Luxury Hub'}
        </p>

        <div className="mt-3 flex items-center gap-2">
          {area.propertiesCount ? (
            <>
              <span className={`inline-flex items-center rounded-full ${scoreColor(area.overallScore)} px-2.5 py-1 text-xs font-bold text-white`}>
                {area.overallScore?.toFixed(1) ?? '—'}
              </span>
              <span className="inline-flex items-center rounded-full bg-white/15 backdrop-blur px-2.5 py-1 text-xs font-medium text-white">
                {area.propertiesCount.toLocaleString()} Properties
              </span>
            </>
          ) : (
            <span className={`inline-flex items-center rounded-full ${scoreColor(area.overallScore)} px-2.5 py-1 text-xs font-bold text-white`}>
              {area.overallScore?.toFixed(1) ?? '—'} Score
            </span>
          )}
        </div>
      </div>

      {size === 'hero' && (
        <span className="absolute bottom-4 right-4 sm:bottom-5 sm:right-5 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#0A1628] transition-transform group-hover:translate-x-0.5">
          <ArrowUpRight className="h-4 w-4" />
        </span>
      )}
    </a>
  );
};

// ─── Skeleton ───────────────────────────────────────────────────────────────

const SkeletonCard = ({ tall }: { tall?: boolean }) => (
  <div className={`animate-pulse rounded-2xl bg-slate-200 ${tall ? 'h-72 sm:h-80' : 'h-48 sm:h-56'}`} />
);

// ─── Section ────────────────────────────────────────────────────────────────

export default function NeighbourhoodGrid() {
  const { data, isLoading, isError } = useFeaturedAreas();
  const areas = data?.data?.areas ?? [];

  // Nothing to show and no error/loading state — don't render an empty section
  if (!isLoading && !isError && areas.length === 0) return null;

  // Fixed 3-row layout: [big+medium] / [medium, medium, medium] / [medium+big]
  const [heroTop, medTop, m1, m2, m3, medBottom, heroBottom] = areas;

  return (
    <section className="py-12 bg-white">
      <PageWrapper>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-[#0F172A]">Neighbourhood Intelligence</h3>
            <p className="text-sm text-slate-500">Explore neighbourhood insights and verified data</p>
          </div>
          <a href="/neighbourhood" className="text-sm text-[#00C9A7] font-semibold hover:underline">
            Browse 
          </a>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="sm:col-span-2">
                <SkeletonCard tall />
              </div>
              <SkeletonCard tall />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          </div>
        ) : isError ? (
          <p className="text-sm text-slate-500">
            Couldn't load neighbourhood data right now. Please try again shortly.
          </p>
        ) : (
          <div className="space-y-6">
            {/* Row 1 — big + medium */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {heroTop && (
                <div className="sm:col-span-2">
                  <AreaCard area={heroTop} size="hero" />
                </div>
              )}
              {medTop && <AreaCard area={medTop} size="medium" />}
            </div>

            {/* Row 2 — three medium */}
            {(m1 || m2 || m3) && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {m1 && <AreaCard area={m1} size="small" />}
                {m2 && <AreaCard area={m2} size="small" />}
                {m3 && <AreaCard area={m3} size="small" />}
              </div>
            )}

            {/* Row 3 — medium + big */}
            {(medBottom || heroBottom) && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {medBottom && <AreaCard area={medBottom} size="medium" />}
                {heroBottom && (
                  <div className="sm:col-span-2">
                    <AreaCard area={heroBottom} size="hero" />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </PageWrapper>
    </section>
  );
}