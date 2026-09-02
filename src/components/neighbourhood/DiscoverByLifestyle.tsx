import { useQuery } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { lifestylesApi } from '../../api/lifestyles.api';

// ─── Card ─────────────────────────────────────────────────────────────────────

interface LifestyleCardProps {
  label: string;
  tagline: string;
  image: string;
  href: string;
}

const LifestyleCard = ({ label, tagline, image, href }: LifestyleCardProps) => (
  <Link
    to={href}
    className="group relative flex-shrink-0 block w-44 sm:w-52 h-56 sm:h-64 overflow-hidden rounded-2xl"
  >
    {/* Fallback gradient bg (sits behind the image; shows through if the image 404s) */}
    <div className="absolute inset-0 bg-gradient-to-br from-[#0A1628] to-[#1a3a5c]" />

    <img
      src={image}
      alt={label}
      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      onError={(e) => {
        (e.currentTarget as HTMLImageElement).style.display = 'none';
      }}
    />

    {/* Overlay */}
    <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628] via-transparent to-transparent" />

    {/* Content */}
    <div className="absolute inset-x-0 bottom-0 p-4">
      <p className="text-white font-bold text-sm leading-tight">{label}</p>
      <p className="text-slate-300 text-xs mt-0.5 leading-snug">{tagline}</p>
    </div>

    {/* Hover arrow */}
    <span className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
      <ArrowRight className="h-3.5 w-3.5 text-white" />
    </span>
  </Link>
);

const LifestyleCardSkeleton = () => (
  <div className="flex-shrink-0 w-44 sm:w-52 h-56 sm:h-64 overflow-hidden rounded-2xl bg-slate-200 animate-pulse" />
);

// ─── Section ──────────────────────────────────────────────────────────────────

export default function DiscoverByLifestyle() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['lifestyles'],
    queryFn: lifestylesApi.getAll,
    staleTime: 1000 * 60 * 10,
  });

  const profiles = (data?.data?.profiles ?? [])
    .filter((profile) => profile.status === 'active')
    .sort((a, b) => a.priority - b.priority);

  // Nothing to show and nothing loading/erroring — quietly hide the section
  // rather than render an empty shell.
  if (!isLoading && !isError && profiles.length === 0) return null;

  return (
    <section>
      <div className="flex items-end justify-between mb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#00C9A7] mb-1">
            Curated Collections
          </p>
          <h3 className="text-xl sm:text-2xl font-bold text-[#0F172A]">Discover by Lifestyle</h3>
        </div>
        <Link
          to="/lifestyles"
          className="text-sm font-semibold text-[#00C9A7] hover:underline hidden sm:block"
        >
          All lifestyles →
        </Link>
      </div>
      
      {/* Horizontal scroll row */}
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <LifestyleCardSkeleton key={i} />)
        ) : isError ? (
          <p className="text-sm text-slate-500 py-4">We could not load lifestyle picks right now.</p>
        ) : (
          profiles.map((profile) => (
            <LifestyleCard
              key={profile.id}
              label={profile.name}
              tagline={profile.shortDescription}
              image={profile.cardImage}
              href={`/lifestyles/${encodeURIComponent(profile.slug)}`}
            />
          ))
        )}
      </div>
    </section>
  );
}