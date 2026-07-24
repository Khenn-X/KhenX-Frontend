import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges Tailwind classes safely, resolving conflicts.
 * Use this everywhere instead of string concatenation.
 */
export const cn = (...inputs: ClassValue[]): string => {
  return twMerge(clsx(inputs));
};

/**
 * Formats a number as Nigerian Naira currency.
 * e.g. 800000 → ₦800,000
 */
export const formatNaira = (amount: number): string => {
  return `₦${amount.toLocaleString('en-NG')}`;
};

/**
 * Capitalizes the first letter of a string.
 */
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Truncates a string to a max length and appends ellipsis.
 */
export const truncate = (str: string, maxLength: number): string => {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength).trimEnd() + '...';
};

/**
 * Returns a human-readable time-ago string.
 * e.g. "3 days ago", "just now"
 */
export const timeAgo = (date: string | Date): string => {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays < 30) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  return past.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
};

/**
 * Formats price with period label.
 * e.g. (800000, 'yearly') → '₦800,000/yr'
 */
export const formatPriceWithPeriod = (
  price: number,
  period: 'yearly' | 'monthly' | 'nightly'
): string => {
  const periodMap = { yearly: 'yr', monthly: 'mo', nightly: 'night' };
  return `${formatNaira(price)}/${periodMap[period]}`;
};

/**
 * Generates initials from a full name.
 * e.g. "Chidi Okafor" → "CO"
 */
export const getInitials = (fullName: string): string => {
  return fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};
