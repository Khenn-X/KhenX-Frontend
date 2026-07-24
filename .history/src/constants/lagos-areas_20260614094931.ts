/**
 * Comprehensive list of Lagos areas used across search, filters,
 * neighbourhood intelligence, and dropdown selects.
 */
export const LAGOS_AREAS = [
  // Island & Upscale
  'Lekki Phase 1',
  'Lekki Phase 2',
  'Lekki',
  'Victoria Island',
  'Ikoyi',
  'Banana Island',
  'Eti-Osa',
  'Ajah',
  'Sangotedo',
  'Chevron',
  'Oniru',
  'Osborne',
  'Parkview',

  // Mainland — Inner
  'Yaba',
  'Surulere',
  'Gbagada',
  'Maryland',
  'Ikeja',
  'Ojota',
  'Ketu',
  'Mile 12',
  'Shomolu',
  'Bariga',
  'Ilupeju',
  'Mushin',
  'Isolo',
  'Oshodi',
  'Mafoluku',

  // Mainland — Outer
  'Ikorodu',
  'Agege',
  'Ifako-Ijaiye',
  'Mangoro',
  'Egbeda',
  'Alimosho',
  'Ipaja',
  'Ayobo',
  'Dopemu',
  'Meiran',
  'Abule Egba',
  'Akowonjo',

  // Lagos-Ogun Border / Expanding Zones
  'Mowe',
  'Ibafo',
  'Berger',
  'Ojodu',
  'Ogba',
  'Wuse',
  'Magodo',
  'Shangisha',

  // South / Port Areas
  'Apapa',
  'Festac',
  'Satellite Town',
  'Badagry',
  'Mile 2',
  'Orile',
  'Ajegunle',

  // Epe / Far East
  'Epe',
  'Ibeju-Lekki',
  'Lakowe',
  'Bogije',
  'Abraham Adesanya',
] as const;

export type LagosArea = (typeof LAGOS_AREAS)[number];

/**
 * Returns areas that match the search query (case-insensitive).
 */
export const filterAreas = (query: string): string[] => {
  if (!query.trim()) return [...LAGOS_AREAS];
  const lower = query.toLowerCase();
  return LAGOS_AREAS.filter((area) => area.toLowerCase().includes(lower));
};
