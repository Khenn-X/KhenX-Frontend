import test from 'node:test';
import assert from 'node:assert/strict';
import { isResidentialPropertyType } from './listingPropertyTypes.ts';

test('treats residential property types as room-based', () => {
  assert.equal(isResidentialPropertyType('apartment'), true);
  assert.equal(isResidentialPropertyType('duplex'), true);
  assert.equal(isResidentialPropertyType('land'), false);
  assert.equal(isResidentialPropertyType('commercial'), false);
});
