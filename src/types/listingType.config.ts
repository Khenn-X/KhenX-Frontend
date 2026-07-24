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