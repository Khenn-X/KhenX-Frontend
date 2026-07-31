import test from 'node:test';
import assert from 'node:assert/strict';
import { formatPriceWithPeriod, getListingSummaryMeta } from './utils';

test('omits price period suffix when no period is provided', () => {
  assert.equal(formatPriceWithPeriod(800000, null), '₦800,000');
  assert.equal(formatPriceWithPeriod(800000, undefined), '₦800,000');
});

test('includes the correct suffix for supported periods', () => {
  assert.equal(formatPriceWithPeriod(800000, 'yearly'), '₦800,000/yr');
  assert.equal(formatPriceWithPeriod(800000, 'monthly'), '₦800,000/mo');
  assert.equal(formatPriceWithPeriod(800000, 'nightly'), '₦800,000/night');
});

test('shows bed and bath stats for building listings but hides them for land listings', () => {
  const buildingSummary = getListingSummaryMeta({
    propertyCategory: 'building',
    propertyType: 'apartment',
    bedrooms: 3,
    bathrooms: 2,
  });

  assert.equal(buildingSummary.showBedBath, true);
  assert.equal(buildingSummary.bedLabel, '3 bed');
  assert.equal(buildingSummary.bathLabel, '2 bath');
  assert.equal(buildingSummary.propertyLabel, 'Apartment');

  const landSummary = getListingSummaryMeta({
    propertyCategory: 'land',
    propertyType: 'land',
    bedrooms: 3,
    bathrooms: 2,
  });

  assert.equal(landSummary.showBedBath, false);
  assert.equal(landSummary.propertyLabel, 'Land');
});
