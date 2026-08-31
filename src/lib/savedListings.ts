export type SavedListingPayload = {
  data?: {
    listings?: Array<Record<string, any>>;
    saved?: Array<Record<string, any>>;
  };
};

export const extractSavedListings = (payload?: SavedListingPayload | null) => {
  const raw = payload?.data;
  if (!raw) return [];

  const list = Array.isArray(raw.listings)
    ? raw.listings
    : Array.isArray(raw.saved)
      ? raw.saved
          .map((item) => (item && typeof item === 'object' && 'listingId' in item ? item.listingId : item))
          .filter(Boolean)
      : [];

  return list;
};
