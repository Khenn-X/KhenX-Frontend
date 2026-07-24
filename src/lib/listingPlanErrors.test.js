import test from 'node:test';
import assert from 'node:assert/strict';
import { isListingPlanLimitError } from './listingPlanErrors.js';

test('detects listing plan limit errors from backend responses', () => {
  const error = {
    response: {
      status: 403,
      data: {
        message: 'You have reached your listing limit for the free plan. Upgrade to create more listings.'
      }
    }
  };

  assert.equal(isListingPlanLimitError(error), true);
});

test('ignores unrelated errors', () => {
  const error = {
    response: {
      status: 500,
      data: {
        message: 'Something went wrong while saving the listing.'
      }
    }
  };

  assert.equal(isListingPlanLimitError(error), false);
});
