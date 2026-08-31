/**
 * Utilities for handling deactivated/grace-period listings
 */

import type { IListing } from '../types/listing.types';

// Grace period in hours (must match backend constant)
const SAVED_LISTING_GRACE_PERIOD_HOURS = 48;
const GRACE_PERIOD_MS = SAVED_LISTING_GRACE_PERIOD_HOURS * 60 * 60 * 1000;

/**
 * Determine if a listing is currently within the grace period after deactivation.
 * A listing is considered "deactivated" if its status is not 'active' and
 * deactivatedAt is recent enough to be within the grace period.
 */
export const isListingDeactivated = (listing: IListing): boolean => {
  // Not deactivated if status is active
  if (listing.status === 'active') {
    return false;
  }

  // If no deactivatedAt timestamp, not within grace period
  if (!listing.deactivatedAt) {
    return false;
  }

  // Check if within grace period
  const deactivatedDate = new Date(listing.deactivatedAt).getTime();
  const now = Date.now();
  const timeSinceDeactivation = now - deactivatedDate;

  return timeSinceDeactivation < GRACE_PERIOD_MS;
};

/**
 * Get a human-readable message for why a listing is no longer available.
 */
export const getDeactivationMessage = (): string => {
  return 'No longer available — may have been sold, rented, or taken off the market.';
};
