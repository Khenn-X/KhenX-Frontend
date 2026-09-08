import assert from 'node:assert/strict';
import { test } from 'node:test';

import { isRealCompareError } from './neighbourhoodCompareState';

test('a missing compare column is not a full-page compare error', () => {
  assert.equal(isRealCompareError({ error: true, notFound: true }), false);
  assert.equal(isRealCompareError({ error: true }), true);
});