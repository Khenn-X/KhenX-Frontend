export type PropertyType =
  | 'apartment'
  | 'duplex'
  | 'bungalow'
  | 'self-con'
  | 'mini-flat'
  | 'terrace'
  | 'detached'
  | 'land'
  | 'commercial';

export type ListingType = 'rent' | 'sale' | 'short-let';
export type ListingStatus = 'pending' | 'active' | 'paused' | 'rejected';
export type PricePeriod = 'yearly' | 'monthly' | 'nightly';

export interface IListingFeatures {
  generator: boolean;
  borehole: boolean;
  security: boolean;
  parking: boolean;
  gym: boolean;
  pool: boolean;
  cctv: boolean;
  internet: boolean;
}

export interface IListingOwnerUser {
  _id?: string;
  fullName?: string;
  avatarUrl?: string;
  email?: string;
  createdAt?: string;
}

export interface IListingOwnerProfile {
  _id?: string;
  userId?: IListingOwnerUser | string | null;
  businessName?: string;
  phone?: string;
  bio?: string;
  kycStatus?: string;
  tier?: string;
  verifiedAt?: string;
}

export interface IListing {
  _id: string;
  agentId?: IListingOwnerProfile | string | null;
  landlordId?: IListingOwnerProfile | string | null;
  title: string;
  description: string;
  propertyType: PropertyType;
  listingType: ListingType;
  bedrooms: number;
  bathrooms: number;
  areaName: string;
  neighbourhoodId?: string | null;
  estateName?: string;
  price: number;
  pricePeriod: PricePeriod;
  serviceCharge?: number;
  features: IListingFeatures;
  photos: string[];
  status: ListingStatus;
  rejectionReason?: string;
  isFeatured: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Request Payloads ────────────────────────────────────────────────────────

export interface CreateListingPayload {
  title: string;
  description: string;
  propertyType: PropertyType;
  listingType: ListingType;
  bedrooms: number;
  bathrooms: number;
  areaName: string;
  neighbourhoodId?: string | null;
  estateName?: string;
  price: number;
  pricePeriod: PricePeriod;
  serviceCharge?: number;
  features: IListingFeatures;
}

export type UpdateListingPayload = Partial<CreateListingPayload>;

// ─── Filter Options (for ListingFilters component) ───────────────────────────

export const PROPERTY_TYPES: PropertyType[] = [
  'apartment', 'duplex', 'bungalow', 'self-con', 'mini-flat', 'terrace', 'detached', 'land', 'commercial',
];

export const LISTING_TYPES: ListingType[] = ['rent', 'sale', 'short-let'];

export const PRICE_PERIODS: PricePeriod[] = ['yearly', 'monthly', 'nightly'];

export const BEDROOM_OPTIONS = [0, 1, 2, 3, 4, 5, 6];


interface TypeVisual {
  rail: string;
}

// Mirrors the admin card's STATUS_VISUALS pattern, but keyed on listingType
// since public visitors care about rent-vs-sale at a glance, not review status.
export const TYPE_VISUALS: Record<string, TypeVisual> = {
  rent: { rail: '#00C9A7' },
  sale: { rail: '#F59E0B' },
};

export const getTypeVisual = (listingType: string): TypeVisual =>
  TYPE_VISUALS[listingType] ?? TYPE_VISUALS.rent;