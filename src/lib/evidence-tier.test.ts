import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyEvidenceTier } from './evidence-tier';

test('travel-time claims are always reference tier', () => {
  assert.equal(
    classifyEvidenceTier(
      { claimType: 'travel_time_lekki', value: 22 },
      { sourceType: 'community' },
      0,
    ),
    'reference',
  );
});

test('open_data and field verification sources with valid claims are verified', () => {
  assert.equal(
    classifyEvidenceTier(
      { claimType: 'flood_risk', value: 'moderate' },
      { sourceType: 'open_data' },
      0,
    ),
    'verified',
  );

  assert.equal(
    classifyEvidenceTier(
      { claimType: 'nearest_hospital', value: { name: 'Reddington', latitude: 6.5, longitude: 3.4 } },
      { sourceType: 'field_verification' },
      0,
    ),
    'verified',
  );
});

test('two corroborating sources elevate evidence to verified tier', () => {
  assert.equal(
    classifyEvidenceTier(
      { claimType: 'power_supply_hours', value: 8 },
      { sourceType: 'community' },
      2,
    ),
    'verified',
  );
});

test('single-community evidence without corroboration remains supported', () => {
  assert.equal(
    classifyEvidenceTier(
      { claimType: 'bank_count', value: 4 },
      { sourceType: 'community' },
      0,
    ),
    'supported',
  );
});
