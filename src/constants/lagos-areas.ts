/**
 * Comprehensive list of Lagos areas used across search, filters,
 * neighbourhood intelligence, and dropdown selects.
 */
export const LAGOS_AREAS = [
  'Abraham Adesanya',
  'Abule Egba',
  'Agege',
  'Ajah',
  'Ajegunle',
  'Akowonjo',
  'Alimosho',
  'Apapa',
  'Ayobo',
  'Badagry',
  'Banana Island',
  'Bariga',
  'Berger',
  'Bogije',
  'Chevron',
  'Dopemu',
  'Egbeda',
  'Epe',
  'Eti-Osa',
  'Festac',
  'Gbagada',
  'Ibafo',
  'Ibeju-Lekki',
  'Ifako-Ijaiye',
  'Ikeja',
  'Ikorodu',
  'Ikoyi',
  'Ilupeju',
  'Ipaja',
  'Isolo',
  'Ketu',
  'Lakowe',
  'Lekki',
  'Lekki Phase 1',
  'Lekki Phase 2',
  'Mafoluku',
  'Magodo',
  'Mangoro',
  'Maryland',
  'Meiran',
  'Mile 12',
  'Mile 2',
  'Mowe',
  'Mushin',
  'Ogba',
  'Ojodu',
  'Ojota',
  'Oniru',
  'Orile',
  'Osborne',
  'Oshodi',
  'Parkview',
  'Sangotedo',
  'Satellite Town',
  'Shangisha',
  'Shomolu',
  'Surulere',
  'Victoria Island',
  'Wuse',
  'Yaba',
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
