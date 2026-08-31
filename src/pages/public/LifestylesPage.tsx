import { useEffect, useRef, useState } from 'react';
import { useQueries, useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  Briefcase,
  Compass,
  GraduationCap,
  Home,
  MapPin,
  Search,
  Sparkles,
  Gem,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import ErrorMessage from '../../components/shared/ErrorMessage';
import { lifestylesApi } from '../../api/lifestyles.api';

const LIFESTYLE_SLUGS = ['new-families', 'luxury-living', 'student-friendly', 'business-ready'];

// Icon used on each lifestyle card's badge + faint background watermark.
// Falls back to MapPin for any profile whose slug isn't in this list.
const LIFESTYLE_ICONS: Record<string, typeof Home> = {
  'new-families': Home,
  'luxury-living': Gem,
  'student-friendly': GraduationCap,
  'business-ready': Briefcase,
};

const HOW_IT_WORKS = [
  {
    icon: Compass,
    title: 'Choose your lifestyle',
    description: 'Start with the way you want your neighbourhood to feel and function.',
  },
  {
    icon: Sparkles,
    title: 'We analyse the neighbourhood',
    description: 'KhenX weighs real area intelligence against the things that matter to you.',
  },
  {
    icon: Search,
    title: 'Discover your best matches',
    description: 'Explore profiles built around your priorities before you view a property.',
  },
];

/** Reveals a container's children once, the first time it scrolls into view. Respects reduced motion. */
function useRevealOnScroll<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
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
  }, []);

  return { ref, isVisible };
}

export default function LifestylesPage() {
  useEffect(() => {
    const previousTitle = document.title;
    const description = document.querySelector('meta[name="description"]');
    const previousDescription = description?.getAttribute('content');
    document.title = 'Discover by Lifestyle | KhenX';
    description?.setAttribute('content', 'Explore Lagos neighbourhoods matched to the way you want to live with KhenX lifestyle discovery.');

    return () => {
      document.title = previousTitle;
      if (description && previousDescription != null) description.setAttribute('content', previousDescription);
    };
  }, []);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['lifestyles'],
    queryFn: lifestylesApi.getAll,
    staleTime: 1000 * 60 * 10,
  });
  const profiles = data?.data?.profiles ?? [];
  const heroImage = profiles[0]?.heroImage;
  const recommendationQueries = useQueries({
    queries: LIFESTYLE_SLUGS.map((slug) => ({
      queryKey: ['lifestyle-recommendations', slug, 1, null],
      queryFn: () => lifestylesApi.getRecommendations(slug, { limit: 1 }),
      enabled: profiles.length > 0,
      staleTime: 1000 * 60 * 5,
      retry: false,
    })),
  });
  const previewItems = recommendationQueries
    .map((query, index) => ({
      profile: profiles.find((profile) => profile.slug === LIFESTYLE_SLUGS[index]),
      recommendation: query.data?.data?.recommendations?.[0],
    }))
    .filter((item) => item.profile && item.recommendation);
  const previewLoading = profiles.length > 0 && recommendationQueries.some((query) => query.isLoading);
  const previewError = recommendationQueries.some((query) => query.isError);

  const { ref: gridRef, isVisible: gridVisible } = useRevealOnScroll<HTMLDivElement>();

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      <style>{`
        @keyframes khenx-fade-up {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes khenx-drift {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-3%, 4%) scale(1.05); }
        }
        .khenx-hero-in {
          animation: khenx-fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .khenx-card-reveal {
          opacity: 0;
          transform: translateY(20px);
        }
        .khenx-card-reveal.khenx-visible {
          animation: khenx-fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @media (prefers-reduced-motion: reduce) {
          .khenx-hero-in, .khenx-card-reveal { animation: none !important; opacity: 1 !important; transform: none !important; }
          .khenx-blob { animation: none !important; }
        }
      `}</style>

      {/* HERO */}
      <section className="relative isolate overflow-hidden bg-[#0A1628] py-24 sm:py-32">
        {heroImage && (
          <img
            src={heroImage}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 -z-20 h-full w-full object-cover opacity-20"
          />
        )}
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#0A1628] via-[#0A1628]/95 to-[#0A1628]/75" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#0A1628] via-transparent to-[#0A1628]/60" />
        <div
          aria-hidden="true"
          className="khenx-blob pointer-events-none absolute -right-24 -top-24 -z-10 h-[420px] w-[420px] rounded-full opacity-30 blur-3xl"
          style={{ background: 'radial-gradient(circle, #00C9A7 0%, transparent 70%)', animation: 'khenx-drift 14s ease-in-out infinite' }}
        />

        <PageWrapper>
          <div className="max-w-3xl">
            <h1 className="khenx-hero-in max-w-2xl text-4xl font-bold leading-tight text-white sm:text-6xl">
              Find a neighbourhood that fits your lifestyle
            </h1>
            <p
              className="khenx-hero-in mt-6 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg"
              style={{ animationDelay: '0.12s' }}
            >
              Look beyond bedrooms and price. Discover areas shaped around how you spend your days, what you value, and where you want to feel at home.
            </p>
            <div className="khenx-hero-in mt-9 flex flex-col gap-3 sm:flex-row" style={{ animationDelay: '0.22s' }}>
              <a
                href="#lifestyle-cards"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#00C9A7] px-6 py-3.5 text-sm font-semibold text-[#0A1628] transition-colors hover:bg-[#00E0BA]"
              >
                Explore lifestyles
                <ArrowRight className="h-4 w-4" />
              </a>
              <Link
                to="/neighbourhood/match"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                Find my match
                <Sparkles className="h-4 w-4 text-[#00C9A7]" />
              </Link>
            </div>
          </div>
        </PageWrapper>
      </section>

      <PageWrapper className="py-14 sm:py-20">
        {/* LIFESTYLE CARDS */}
        <section id="lifestyle-cards" aria-labelledby="lifestyles-heading">
          <div className="mb-10 max-w-2xl">
            <h2 id="lifestyles-heading" className="text-2xl font-bold text-[#0F172A] sm:text-3xl">
              Start with the life you want
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              Choose a direction and get closer to the areas that support it.
            </p>
          </div>

          {isLoading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4" aria-busy="true" aria-label="Loading lifestyle profiles">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="overflow-hidden rounded-[28px] bg-white ring-1 ring-slate-200/70">
                  <div className="h-48 animate-pulse bg-slate-200" />
                  <div className="space-y-3 px-5 pb-6 pt-9">
                    <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200" />
                    <div className="h-3 w-full animate-pulse rounded bg-slate-100" />
                    <div className="h-3 w-4/5 animate-pulse rounded bg-slate-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : isError ? (
            <ErrorMessage message="We could not load the lifestyle profiles right now." onRetry={refetch} />
          ) : profiles.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
              Lifestyle profiles are not available yet.
            </div>
          ) : (
            <div ref={gridRef} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {profiles.map((profile, index) => {
                const Icon = LIFESTYLE_ICONS[profile.slug] ?? MapPin;
                return (
                  <Link
                    key={profile.id}
                    to={`/lifestyles/${encodeURIComponent(profile.slug)}`}
                    className={`khenx-card-reveal group relative flex flex-col overflow-hidden rounded-[28px] bg-white ring-1 ring-slate-200/70 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_24px_48px_-16px_rgba(10,22,40,0.28)] ${gridVisible ? 'khenx-visible' : ''}`}
                    style={{ animationDelay: `${index * 90}ms` }}
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={profile.cardImage}
                        alt=""
                        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />
                    </div>

                    <div className="relative flex flex-1 flex-col px-5 pb-6 pt-9">
                      <div className="absolute -top-6 left-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-lg ring-1 ring-slate-100">
                        <Icon className="h-5 w-5 text-[#0A1628]" />
                      </div>
                      <Icon
                        aria-hidden="true"
                        className="pointer-events-none absolute -bottom-4 -right-4 h-28 w-28 text-[#0A1628] opacity-[0.04]"
                      />
                      <h3 className="relative text-lg font-semibold leading-tight text-[#0F172A]">{profile.name}</h3>
                      <p className="relative mt-1.5 text-sm leading-snug text-slate-500">{profile.shortDescription}</p>
                      <span className="relative mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#00A88C]">
                        Explore profile
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* POPULAR NEIGHBOURHOODS */}
        {(previewLoading || previewError || previewItems.length > 0) && (
          <section className="mt-16" aria-labelledby="popular-neighbourhoods-heading">
            <div className="mb-8 flex items-end justify-between gap-4">
              <div className="max-w-2xl">
                <h2 id="popular-neighbourhoods-heading" className="text-2xl font-bold text-[#0F172A] sm:text-3xl">
                  Popular neighbourhoods by lifestyle
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">A quick look at the current top match for each lifestyle profile.</p>
              </div>
              {!previewLoading && !previewError && (
                <div className="hidden shrink-0 items-center gap-1.5 text-xs font-medium text-slate-400 sm:flex">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00C9A7] opacity-60" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-[#00C9A7]" />
                  </span>
                  Updated in real time
                </div>
              )}
            </div>

            {previewLoading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-busy="true" aria-label="Loading popular neighbourhoods">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="h-3 w-1/2 animate-pulse rounded bg-slate-100" />
                    <div className="mt-3 h-5 w-3/4 animate-pulse rounded bg-slate-200" />
                    <div className="mt-3 h-7 w-1/3 animate-pulse rounded bg-slate-200" />
                  </div>
                ))}
              </div>
            ) : previewError ? (
              <ErrorMessage message="We could not load the popular neighbourhood preview right now." onRetry={() => recommendationQueries.forEach((query) => query.refetch())} />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {previewItems.map(({ profile, recommendation }) => (
                  <Link
                    key={profile!.slug}
                    to={`/neighbourhood/${encodeURIComponent(recommendation!.slug ?? recommendation!.name)}`}
                    className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#00C9A7]/40 hover:shadow-lg"
                  >
                    <p className="text-xs font-semibold text-[#00A88C]">{profile!.name}</p>
                    <h3 className="mt-2 text-lg font-bold text-[#0F172A]">{recommendation!.name}</h3>
                    <div className="mt-3 flex items-baseline gap-2">
                      <p className="text-2xl font-bold text-[#0A1628]">{recommendation!.score.toFixed(1)}%</p>
                      <span className="text-xs text-slate-400">fit</span>
                    </div>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#00C9A7] to-[#00E0BA]"
                        style={{ width: `${Math.min(100, Math.max(0, recommendation!.score))}%` }}
                      />
                    </div>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#00A88C]">
                      Explore area
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </section>
        )}

        {/* HOW IT WORKS */}
        <section className="mt-16 rounded-2xl bg-[#0A1628] p-8 sm:mt-20 sm:p-12" aria-labelledby="how-it-works-heading">
          <h2 id="how-it-works-heading" className="mb-10 max-w-xl text-2xl font-bold text-white sm:text-3xl">
            How it works
          </h2>
          <div className="relative grid gap-10 sm:grid-cols-3 sm:gap-8">
            <div
              aria-hidden="true"
              className="absolute left-0 right-0 top-[22px] hidden h-px bg-gradient-to-r from-transparent via-white/15 to-transparent sm:block"
            />
            {HOW_IT_WORKS.map(({ icon: Icon, title, description }, index) => (
              <div key={title} className="relative">
                <div className="relative z-10 mb-4 flex h-11 w-11 items-center justify-center rounded-full border border-[#00C9A7]/25 bg-[#0A1628] ring-8 ring-[#0A1628]">
                  <Icon className="h-5 w-5 text-[#00C9A7]" />
                </div>
                <span className="text-xs font-bold tracking-widest text-slate-500">0{index + 1}</span>
                <h3 className="mt-2 font-semibold text-white">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="relative mt-8 flex flex-col items-start justify-between gap-6 overflow-hidden rounded-2xl border border-[#00C9A7]/20 bg-[#00C9A7]/5 p-8 sm:mt-10 sm:flex-row sm:items-center sm:p-10">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-40 blur-2xl"
            style={{ background: 'radial-gradient(circle, #E8B04B 0%, transparent 70%)' }}
          />
          <div className="relative">
            <h2 className="text-2xl font-bold text-[#0F172A]">Not sure which lifestyle fits you?</h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">Answer three quick questions and let the neighbourhood matcher narrow things down.</p>
          </div>
          <Link
            to="/neighbourhood/match"
            className="relative inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#0A1628] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0A1628]/90"
          >
            Find my match
            <ArrowRight className="h-4 w-4 text-[#00C9A7]" />
          </Link>
        </section>
      </PageWrapper>
    </div>
  );
}