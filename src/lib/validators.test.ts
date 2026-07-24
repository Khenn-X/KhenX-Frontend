import test from 'node:test';
import assert from 'node:assert/strict';
import { listingSchema } from './validators';

test('allows non-residential listings to use zero service charge', () => {
  const result = listingSchema.safeParse({
    title: 'Land for sale in Lekki',
    description: 'Large plot of land ideal for development with clear title',
    propertyType: 'land',
    listingType: 'sale',
    bedrooms: 0,
    bathrooms: 0,
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
