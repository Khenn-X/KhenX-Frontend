import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight, BarChart3, CheckCircle2, ChevronDown, MapPin, Sparkles } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import EmptyState from '../../components/shared/EmptyState';
import ErrorMessage from '../../components/shared/ErrorMessage';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import PageWrapper from '../../components/layout/PageWrapper';
import NotFoundPage from './NotFoundPage';
import { lifestylesApi } from '../../api/lifestyles.api';
import { useLifestyleRecommendations } from '../../hooks/useLifestyleRecommendations';

interface LifestyleFitData {
  percentage: number;
  factors: Array<{ name: string; percentage: number }>;
}

interface LifestyleFitScoreProps {
  data?: LifestyleFitData;
  areaName?: string;
}

/** Reveals a container's children once, the first time it scrolls into view. Respects reduced motion.
 *  Uses a callback ref (via state) rather than useRef so it still attaches correctly if the target
 *  node mounts after the component's first render — e.g. once a loading state resolves. */
function useRevealOnScroll<T extends HTMLElement>() {
  const [node, setNode] = useState<T | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!node) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [node]);

  return { ref: setNode, isVisible };
}

/** Small delay flag so ring/bar widths animate in on mount rather than snapping to their final value. */
function useMountedAfter(delayMs = 60) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), delayMs);
    return () => clearTimeout(timer);
  }, [delayMs]);
  return mounted;
}

const RADIUS = 52;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const LifestyleFitScore = ({ data, areaName }: LifestyleFitScoreProps) => {
  const mounted = useMountedAfter();

  if (!data) {
    return (
      <EmptyState
        icon={BarChart3}
        title="No lifestyle fit scores available yet."
        description="There is not enough neighbourhood data to calculate a representative fit score yet."
      />
    );
  }

  const offset = CIRCUMFERENCE * (1 - (mounted ? data.percentage : 0) / 100);

  return (
    <div className="grid gap-8 rounded-2xl border border-slate-200 bg-white p-6 sm:grid-cols-[auto,1fr] sm:p-8">
      <div className="flex flex-col items-center justify-center gap-3">
        <div className="relative h-32 w-32 shrink-0">
          <svg viewBox="0 0 120 120" className="h-32 w-32 -rotate-90">
            <circle cx="60" cy="60" r={RADIUS} fill="none" stroke="#EEF2F6" strokeWidth="10" />
            <circle
              cx="60"
              cy="60"
              r={RADIUS}
              fill="none"
              stroke="#00C9A7"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={offset}
              style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.22, 1, 0.36, 1)' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-[#0A1628]">{data.percentage}%</span>
          </div>
        </div>
        <p className="text-center text-xs font-medium text-slate-500">
          {areaName ? `Top match: ${areaName}` : 'Lifestyle fit'}
        </p>
      </div>

      <div className="space-y-4 self-center">
        {data.factors.map((factor, index) => (
          <div key={factor.name}>
            <div className="mb-1.5 flex justify-between text-xs text-slate-500">
              <span className="font-medium text-slate-600">{factor.name}</span>
              <span>{factor.percentage}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-[#00C9A7] to-[#00E0BA]"
                style={{
                  width: `${mounted ? factor.percentage : 0}%`,
                  transition: `width 0.8s cubic-bezier(0.22, 1, 0.36, 1) ${index * 70}ms`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface RecommendedNeighbourhoodsProps {
  neighbourhoods: Array<{
    neighbourhoodId: string;
    name: string;
    slug: string | null;
    score: number;
    factorBreakdown: Array<{ factor: string; score: number; weight: number }>;
    explanation: string;
    matchingPropertyCount: number;
  }>;
}

const RecommendedNeighbourhoods = ({ neighbourhoods, lifestyleSlug }: RecommendedNeighbourhoodsProps & { lifestyleSlug: string }) => {
  const { ref, isVisible } = useRevealOnScroll<HTMLDivElement>();

  if (!neighbourhoods?.length) {
    return (
      <EmptyState
        icon={MapPin}
        title="We don't have enough neighbourhood data yet to recommend matches for this lifestyle."
        description="As more neighbourhood intelligence becomes available, this list will become more useful."
      />
    );
  }

  return (
    <div ref={ref} className="grid gap-5 lg:grid-cols-2">
      {neighbourhoods.map((neighbourhood, index) => (
        <NeighbourhoodRecommendationCard
          key={neighbourhood.neighbourhoodId}
          neighbourhood={neighbourhood}
          lifestyleSlug={lifestyleSlug}
          revealed={isVisible}
          delayMs={index * 80}
        />
      ))}
    </div>
  );
};

const NeighbourhoodRecommendationCard = ({
  neighbourhood,
  lifestyleSlug,
  revealed,
  delayMs,
}: {
  neighbourhood: RecommendedNeighbourhoodsProps['neighbourhoods'][number];
  lifestyleSlug: string;
  revealed: boolean;
  delayMs: number;
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const areaPath = neighbourhood.slug
    ? `/neighbourhood/${encodeURIComponent(neighbourhood.slug)}`
    : `/neighbourhood/${encodeURIComponent(neighbourhood.name)}`;
  const listingsPath = `/listings?area=${encodeURIComponent(neighbourhood.name)}&sourceLifestyle=${encodeURIComponent(lifestyleSlug)}`;

  return (
    <article
      className={`group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-500 hover:border-[#00C9A7]/40 hover:shadow-md ${revealed ? 'khenx-card-reveal khenx-visible' : 'khenx-card-reveal'}`}
      style={{ animationDelay: `${delayMs}ms` }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#00C9A7]/10 px-2.5 py-1 text-xs font-semibold text-[#00A88C]">
            <MapPin className="h-3 w-3" /> Recommended area
          </span>
          <h3 className="mt-2.5 text-xl font-bold text-[#0F172A]">{neighbourhood.name}</h3>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-2xl font-bold text-[#0A1628]">{neighbourhood.score.toFixed(1)}%</p>
          <p className="text-[11px] font-medium text-slate-400">fit</p>
        </div>
      </div>

      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#00C9A7] to-[#00E0BA] transition-[width] duration-700 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, neighbourhood.score))}%` }}
        />
      </div>

      <p className="mt-4 text-sm leading-relaxed text-slate-600">{neighbourhood.explanation}</p>

      {neighbourhood.matchingPropertyCount > 0 ? (
        <span className="mt-3 inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
          {neighbourhood.matchingPropertyCount} matching {neighbourhood.matchingPropertyCount === 1 ? 'property' : 'properties'}
        </span>
      ) : (
        <span className="mt-3 inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
          No properties currently listed here
        </span>
      )}

      <button
        type="button"
        onClick={() => setShowDetails((visible) => !visible)}
        className="mt-4 flex min-h-11 items-center gap-2 text-sm font-semibold text-[#00A88C]"
        aria-expanded={showDetails}
      >
        Why this score?
        <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${showDetails ? 'rotate-180' : ''}`} />
      </button>

      <div
        className="grid transition-[grid-template-rows] duration-300 ease-out"
        style={{ gridTemplateRows: showDetails ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <div className="space-y-3 border-t border-slate-100 pt-4">
            {neighbourhood.factorBreakdown.map((factor) => (
              <div key={factor.factor}>
                <div className="mb-1 flex justify-between text-xs text-slate-500">
                  <span>{formatFactorName(factor.factor)}</span>
                  <span>{factor.score.toFixed(1)}% · {(factor.weight * 100).toFixed(0)}% weight</span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-100">
                  <div className="h-1.5 rounded-full bg-[#00C9A7]" style={{ width: `${factor.score}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
        <Link
          to={areaPath}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0A1628] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0A1628]/90"
        >
          Explore {neighbourhood.name}
          <ArrowRight className="h-4 w-4 text-[#00C9A7]" />
        </Link>
        <Link
          to={listingsPath}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-[#0F172A] transition-colors hover:border-[#00C9A7] hover:text-[#00A88C]"
        >
          View matching homes
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
};

const formatFactorName = (factor: string) => factor.replace(/([A-Z])/g, ' $1').replace(/^./, (value) => value.toUpperCase());

export default function LifestyleDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const profileQuery = useQuery({
    queryKey: ['lifestyle', slug],
    queryFn: () => lifestylesApi.getBySlug(slug ?? ''),
    enabled: Boolean(slug),
    staleTime: 1000 * 60 * 10,
    retry: false,
  });
  const recommendationsQuery = useLifestyleRecommendations(slug, { limit: 10 });
  const errorResponse = (profileQuery.error as Error & { response?: { status?: number } } | null)?.response;
  const { ref: factorsRef, isVisible: factorsVisible } = useRevealOnScroll<HTMLDivElement>();

  useEffect(() => {
    const previousTitle = document.title;
    const description = document.querySelector('meta[name="description"]');
    const previousDescription = description?.getAttribute('content');
    const profile = profileQuery.data?.data;
    document.title = profile ? `${profile.name} Neighbourhoods | KhenX` : 'Lifestyle Neighbourhoods | KhenX';
    if (profile) description?.setAttribute('content', `${profile.description} Explore ${profile.name} neighbourhood recommendations with KhenX.`);

    return () => {
      document.title = previousTitle;
      if (description && previousDescription != null) description.setAttribute('content', previousDescription);
    };
  }, [profileQuery.data]);

  if (profileQuery.isLoading) {
    return <LoadingSpinner size="lg" label="Loading lifestyle profile..." className="min-h-[70vh]" />;
  }

  if (profileQuery.isError && errorResponse?.status !== 404) {
    return <ErrorMessage message="We could not load this lifestyle profile right now." onRetry={profileQuery.refetch} />;
  }

  if (profileQuery.isError || !profileQuery.data?.data) {
    return <NotFoundPage />;
  }

  const profile = profileQuery.data.data;
  const recommendations = recommendationsQuery.data?.data?.recommendations ?? [];
  const topRecommendation = recommendations[0];
  const fitData: LifestyleFitData | undefined = topRecommendation
    ? {
        percentage: topRecommendation.score,
        factors: topRecommendation.factorBreakdown.map((factor) => ({ name: formatFactorName(factor.factor), percentage: factor.score })),
      }
    : undefined;

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      <style>{`
        @keyframes khenx-fade-up {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes khenx-drift {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(3%, -4%) scale(1.05); }
        }
        .khenx-hero-in { animation: khenx-fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) both; }
        .khenx-card-reveal { opacity: 0; transform: translateY(20px); }
        .khenx-card-reveal.khenx-visible { animation: khenx-fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) both; }
        @media (prefers-reduced-motion: reduce) {
          .khenx-hero-in, .khenx-card-reveal { animation: none !important; opacity: 1 !important; transform: none !important; }
          .khenx-blob { animation: none !important; }
        }
      `}</style>

      {/* HERO */}
      <section className="relative isolate overflow-hidden bg-[#0A1628] py-20 sm:py-28">
        <img src={profile.heroImage} alt="" aria-hidden="true" className="absolute inset-0 -z-20 h-full w-full object-cover opacity-30" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#0A1628] via-[#0A1628]/95 to-[#0A1628]/70" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#0A1628] via-transparent to-[#0A1628]/50" />
        <div
          aria-hidden="true"
          className="khenx-blob pointer-events-none absolute -left-20 -top-16 -z-10 h-[380px] w-[380px] rounded-full opacity-25 blur-3xl"
          style={{ background: 'radial-gradient(circle, #00C9A7 0%, transparent 70%)', animation: 'khenx-drift 16s ease-in-out infinite' }}
        />
        <PageWrapper>
          <Link to="/lifestyles" className="khenx-hero-in inline-flex items-center gap-2 text-sm text-slate-300 transition-colors hover:text-white">
            <ArrowLeft className="h-4 w-4" /> Back to lifestyles
          </Link>
          <div className="mt-12 max-w-3xl">
            <div className="khenx-hero-in mb-5 inline-flex items-center gap-2 rounded-full border border-[#00C9A7]/25 bg-[#00C9A7]/10 px-3 py-1.5 text-xs font-semibold text-[#00C9A7]">
              <Sparkles className="h-3.5 w-3.5" /> {profile.name}
            </div>
            <h1 className="khenx-hero-in max-w-2xl text-4xl font-bold leading-tight text-white sm:text-6xl" style={{ animationDelay: '0.08s' }}>
              {profile.heroHeadline}
            </h1>
            <p className="khenx-hero-in mt-6 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg" style={{ animationDelay: '0.16s' }}>
              {profile.heroSubtext}
            </p>
            <Link
              to="/neighbourhood/match"
              className="khenx-hero-in mt-9 inline-flex items-center gap-2 rounded-lg bg-[#00C9A7] px-6 py-3.5 text-sm font-semibold text-[#0A1628] transition-colors hover:bg-[#00E0BA]"
              style={{ animationDelay: '0.24s' }}
            >
              Find my match <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </PageWrapper>
      </section>

      <PageWrapper className="py-14 sm:py-20">
        {/* WHAT MATTERS */}
        <section aria-labelledby="criteria-heading">
          <div className="max-w-2xl">
            <h2 id="criteria-heading" className="text-2xl font-bold text-[#0F172A] sm:text-3xl">What matters for {profile.name}</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">{profile.description}</p>
          </div>
          <div ref={factorsRef} className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Object.keys(profile.weights).map((factor, index) => (
              <div
                key={factor}
                className={`rounded-xl border border-slate-200 bg-white p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#00C9A7]/40 hover:shadow-md ${factorsVisible ? 'khenx-card-reveal khenx-visible' : 'khenx-card-reveal'}`}
                style={{ animationDelay: `${index * 70}ms` }}
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#00C9A7]/10">
                    <CheckCircle2 className="h-4 w-4 text-[#00A88C]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#0F172A]">{formatFactorName(factor)}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{profile.factorDescriptions[factor]}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FIT SCORE */}
        <section className="mt-16" aria-labelledby="fit-heading">
          <div className="mb-6">
            <h2 id="fit-heading" className="text-2xl font-bold text-[#0F172A] sm:text-3xl">Lifestyle fit score</h2>
            {topRecommendation && <p className="mt-2 text-sm text-slate-500">A representative score, based on the current top-ranked area.</p>}
          </div>
          {recommendationsQuery.isLoading ? (
            <div className="grid gap-8 rounded-2xl border border-slate-200 bg-white p-6 sm:grid-cols-[auto,1fr] sm:p-8" aria-busy="true">
              <div className="mx-auto h-32 w-32 animate-pulse rounded-full bg-slate-100" />
              <div className="space-y-4 self-center">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="h-3 w-1/3 animate-pulse rounded bg-slate-100" />
                    <div className="h-2 w-full animate-pulse rounded-full bg-slate-100" />
                  </div>
                ))}
              </div>
            </div>
          ) : recommendationsQuery.isError ? (
            <ErrorMessage message="We could not load lifestyle fit scores right now." onRetry={recommendationsQuery.refetch} />
          ) : (
            <LifestyleFitScore data={fitData} areaName={topRecommendation?.name} />
          )}
        </section>

        {/* RECOMMENDATIONS */}
        <section className="mt-16" aria-labelledby="recommendations-heading">
          <div className="mb-6">
            <h2 id="recommendations-heading" className="text-2xl font-bold text-[#0F172A] sm:text-3xl">Recommended neighbourhoods</h2>
            <p className="mt-2 text-sm text-slate-500">Ranked from live neighbourhood intelligence.</p>
          </div>
          {recommendationsQuery.isLoading ? (
            <div className="grid gap-5 lg:grid-cols-2" aria-busy="true">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="h-3 w-1/3 animate-pulse rounded bg-slate-100" />
                  <div className="mt-3 h-5 w-1/2 animate-pulse rounded bg-slate-200" />
                  <div className="mt-4 h-1.5 w-full animate-pulse rounded-full bg-slate-100" />
                  <div className="mt-4 h-3 w-full animate-pulse rounded bg-slate-100" />
                  <div className="mt-2 h-3 w-4/5 animate-pulse rounded bg-slate-100" />
                </div>
              ))}
            </div>
          ) : recommendationsQuery.isError ? (
            <ErrorMessage message="We could not load recommended neighbourhoods right now." onRetry={recommendationsQuery.refetch} />
          ) : (
            <RecommendedNeighbourhoods neighbourhoods={recommendations} lifestyleSlug={slug ?? ''} />
          )}
        </section>

        {/* CTA */}
        <section className="relative mt-16 flex flex-col items-start justify-between gap-5 overflow-hidden rounded-2xl border border-[#00C9A7]/20 bg-[#00C9A7]/5 p-8 sm:flex-row sm:items-center">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-10 -bottom-14 h-40 w-40 rounded-full opacity-40 blur-2xl"
            style={{ background: 'radial-gradient(circle, #E8B04B 0%, transparent 70%)' }}
          />
          <div className="relative">
            <h2 className="text-xl font-bold text-[#0F172A]">Want a more personal answer?</h2>
            <p className="mt-2 text-sm text-slate-600">Use the existing matcher to start with your budget, priority, and commute.</p>
          </div>
          <Link to="/neighbourhood/match" className="relative inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#0A1628] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0A1628]/90">
            Find my match <ArrowRight className="h-4 w-4 text-[#00C9A7]" />
          </Link>
        </section>
      </PageWrapper>
    </div>
  );
}