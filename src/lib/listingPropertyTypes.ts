import type { PropertyType } from '../types/listing.types';

const ROOM_BASED_PROPERTY_TYPES: PropertyType[] = [
  'apartment',
  'duplex',
  'bungalow',
  'self-con',
  'mini-flat',
  'terrace',
  'detached_house',
  'semi_detached',
  'penthouse',
  'studio',
  'office',
  'shop',
];

export const isResidentialPropertyType = (propertyType: PropertyType) =>
  ROOM_BASED_PROPERTY_TYPES.includes(propertyType);
