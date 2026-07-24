import { ArrowRight } from 'lucide-react';

// ─── Static lifestyle categories ─────────────────────────────────────────────
// These are editorial/discovery cards, not API-driven

const LIFESTYLE_CATEGORIES = [
  {
    id:       'families',
    label:    'New Families',
    tagline:  'Top-rated schools & gated estates',
    image:    '/images/lifestyle/families.jpg',
    href:     '/neighbourhoods?lifestyle=families',
  },
  {
    id:       'luxury',
    label:    'Luxury Living',
    tagline:  'Penthouse living with lagoon views',
    image:    '/images/lifestyle/luxury.jpg',
    href:     '/neighbourhoods?lifestyle=luxury',
  },
  {
    id:       'studentfriendly',
    label:    'Student Friendly',
    tagline:  'Near top universities & hubs',
    image:    '/images/lifestyle/student.jpg',
    href:     '/neighbourhoods?lifestyle=student',
  },
  {
    id:       'business',
    label:    'Business Ready',
    tagline:  'Walking distance to corporate offices',
    image:    '/images/lifestyle/business.jpg',
    href:     '/neighbourhoods?lifestyle=business',
  },
] as const;

// ─── Card ─────────────────────────────────────────────────────────────────────

interface LifestyleCardProps {
  label:   string;
  tagline: string;
  image:   string;
  href:    string;
}

const LifestyleCard = ({ label, tagline, image, href }: LifestyleCardProps) => (
  <a
    href={href}
    className="group relative flex-shrink-0 block w-44 sm:w-52 h-56 sm:h-64 overflow-hidden rounded-2xl"
  >
    <img
      src={image}
      alt={label}
      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      onError={(e) => {
        // Fallback gradient if image missing
        (e.currentTarget as HTMLImageElement).style.display = 'none';
      }}
    />
    {/* Fallback gradient bg */}
    <div className="absolute inset-0 bg-gradient-to-br from-[#0A1628] to-[#1a3a5c]" />

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
  </a>
);

// ─── Section ──────────────────────────────────────────────────────────────────

export default function DiscoverByLifestyle() {
  return (
    <section>
      <div className="flex items-end justify-between mb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#00C9A7] mb-1">
            Curated Collections
          </p>
          <h3 className="text-xl sm:text-2xl font-bold text-[#0F172A]">Discover by Lifestyle</h3>
        </div>
        <a
          href="/neighbourhoods/lifestyle"
          className="text-sm font-semibold text-[#00C9A7] hover:underline hidden sm:block"
        >
          All lifestyles →
        </a>
      </div>

      {/* Horizontal scroll row */}
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
        {LIFESTYLE_CATEGORIES.map((cat) => (
          <LifestyleCard key={cat.id} {...cat} />
        ))}
      </div>
    </section>
  );
}