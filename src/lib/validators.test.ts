import test from 'node:test';
import assert from 'node:assert/strict';
import { adminProfileSchema, listingSchema, normalizeListingSubmissionData } from './validators';

test('accepts valid admin profile data', () => {
  const result = adminProfileSchema.safeParse({
    fullName: 'Ada Okafor',
    avatarUrl: 'https://example.com/avatar.jpg',
  });

  assert.equal(result.success, true);
});

test('rejects an invalid avatar URL for admin profile data', () => {
  const result = adminProfileSchema.safeParse({
    fullName: 'Ada Okafor',
    avatarUrl: 'not-a-url',
  });

  assert.equal(result.success, false);
  assert.match(result.error?.issues.map((issue) => issue.message).join('\n') ?? '', /Please enter a valid URL/);
});

test('allows land listings without bedrooms and bathrooms when propertyCategory is land', () => {
  const result = listingSchema.safeParse({
    title: 'Land for sale in Lekki',
    description: 'Large plot of land ideal for development with clear title',
    propertyCategory: 'land',
    propertyType: 'land',
    listingType: 'sale',
    areaName: 'Lekki',
    price: 5000000,
    pricePeriod: 'yearly',
    serviceCharge: 0,
    features: {
      generator: false,
      borehole: false,
      security: false,
      parking: false,
      gym: false,
      pool: false,
      cctv: false,
      internet: false,
    },
  });

  assert.equal(result.success, true);
});

test('requires bedrooms and bathrooms for building listings when propertyCategory is building', () => {
  const result = listingSchema.safeParse({
    title: 'Luxury apartment in Lekki',
    description: 'Bright apartment with premium finishes and good access',
    propertyCategory: 'building',
    propertyType: 'apartment',
    listingType: 'rent',
    areaName: 'Lekki',
    price: 3500000,
    pricePeriod: 'yearly',
    features: {
      generator: false,
      borehole: false,
      security: false,
      parking: false,
      gym: false,
      pool: false,
      cctv: false,
      internet: false,
    },
  });

  assert.equal(result.success, false);
  assert.match(result.error?.issues.map((issue) => issue.message).join('\n') ?? '', /Bedrooms are required for building listings/);
  assert.match(result.error?.issues.map((issue) => issue.message).join('\n') ?? '', /Bathrooms are required for building listings/);
});

test('rejects invalid propertyType when land category is selected', () => {
  const result = listingSchema.safeParse({
    title: 'Large land plot in Lekki',
    description: 'Prime land available for development in a growing neighbourhood',
    propertyCategory: 'land',
    propertyType: 'apartment',
    listingType: 'sale',
    areaName: 'Lekki',
    price: 7500000,
    pricePeriod: 'yearly',
    serviceCharge: 0,
    features: {
      generator: false,
      borehole: false,
      security: false,
      parking: false,
      gym: false,
      pool: false,
      cctv: false,
      internet: false,
    },
  });

  assert.equal(result.success, false);
  assert.match(result.error?.issues.map((issue) => issue.message).join('\n') ?? '', /Property type must be "land" for land listings/);
});

test('rejects propertyType land when building category is selected', () => {
  const result = listingSchema.safeParse({
    title: 'Modern office block in Lekki',
    description: 'Well-located office space with easy access to the expressway',
    propertyCategory: 'building',
    propertyType: 'land',
    listingType: 'rent',
    bedrooms: 4,
    bathrooms: 3,
    areaName: 'Lekki',
    price: 15000000,
    pricePeriod: 'yearly',
    features: {
      generator: false,
      borehole: false,
      security: false,
      parking: false,
      gym: false,
      pool: false,
      cctv: false,
      internet: false,
    },
  });

  assert.equal(result.success, false);
  assert.match(result.error?.issues.map((issue) => issue.message).join('\n') ?? '', /Property type "land" is not valid for building listings/);
});

test('rejects building details for land listings', () => {
  const result = listingSchema.safeParse({
    title: 'Prime land plot in Lekki',
    description: 'Excellent development opportunity with a clear title and direct road access',
    propertyCategory: 'land',
    propertyType: 'land',
    listingType: 'sale',
    areaName: 'Lekki',
    price: 8000000,
    pricePeriod: 'one-time',
    features: {
      generator: false,
      borehole: false,
      security: false,
      parking: false,
      gym: false,
      pool: false,
      cctv: false,
      internet: false,
    },
    buildingDetails: {
      floors: 2,
      toilets: 4,
      livingRooms: 2,
      yearBuilt: 2020,
    },
  });

  assert.equal(result.success, false);
  assert.match(result.error?.issues.map((issue) => issue.message).join('\n') ?? '', /Building details are not valid for land listings/);
});

test('accepts one-time price period for land sale listings', () => {
  const result = listingSchema.safeParse({
    title: 'Vacant land for sale in Ikorodu',
    description: 'Spacious plot with easy access and clear documentation for immediate purchase',
    propertyCategory: 'land',
    propertyType: 'land',
    listingType: 'sale',
    areaName: 'Ikorodu',
    price: 6000000,
    pricePeriod: 'one-time',
    features: {
      generator: false,
      borehole: false,
      security: false,
      parking: false,
      gym: false,
      pool: false,
      cctv: false,
      internet: false,
    },
  });

  assert.equal(result.success, true);
});

test('strips building-only fields from land submissions before send', () => {
  const payload = normalizeListingSubmissionData({
    title: 'Vacant land for sale in Ikorodu',
    description: 'Spacious plot with easy access and clear documentation for immediate purchase',
    propertyCategory: 'land',
    propertyType: 'land',
    listingType: 'sale',
    bedrooms: 3,
    bathrooms: 2,
    areaName: 'Ikorodu',
    price: 6000000,
    pricePeriod: 'one-time',
    serviceCharge: 0,
    features: {
      generator: false,
      borehole: false,
      security: false,
      parking: false,
      gym: false,
      pool: false,
      cctv: false,
      internet: false,
    },
    buildingDetails: {
      floors: 2,
      toilets: 4,
      yearBuilt: 2020,
    },
  } as never);

  assert.equal('bedrooms' in payload, false);
  assert.equal('bathrooms' in payload, false);
  assert.equal('buildingDetails' in payload, false);
  assert.equal(payload.propertyCategory, 'land');
});

test('accepts top-level nearbyPlaces and nearbyAmenities and preserves them during normalization', () => {
  const result = listingSchema.safeParse({
    title: 'Luxury apartment in Lekki',
    description: 'Bright apartment with premium finishes and good access to schools and shopping malls',
    propertyCategory: 'building',
    propertyType: 'apartment',
    listingType: 'rent',
    bedrooms: 3,
    bathrooms: 2,
    areaName: 'Lekki',
    price: 3500000,
    pricePeriod: 'yearly',
    serviceCharge: 0,
    features: {
      generator: false,
      borehole: false,
      security: false,
      parking: false,
      gym: false,
      pool: false,
      cctv: false,
      internet: false,
    },
    nearbyPlaces: {
      schools: [{ name: 'Greensprings School', distanceKm: 2, notes: 'Great for families' }],
    },
    nearbyAmenities: {
      malls: [{ name: 'Ikeja City Mall', distanceKm: 4, notes: 'Shopping' }],
    },
  });

  assert.equal(result.success, true);

  if (!result.success) {
    throw new Error('Validation should succeed for top-level nearby fields');
  }

  const payload = normalizeListingSubmissionData(result.data);

  assert.deepEqual(payload.nearbyPlaces, {
    schools: [{ name: 'Greensprings School', distanceKm: 2, notes: 'Great for families' }],
  });
  assert.deepEqual(payload.nearbyAmenities, {
    malls: [{ name: 'Ikeja City Mall', distanceKm: 4, notes: 'Shopping' }],
  });
});
