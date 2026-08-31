import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { extractSavedListings } from './savedListings';

describe('extractSavedListings', () => {
  it('normalizes backend responses that use the saved key', () => {
    const payload = {
      data: {
        saved: [
          { listingId: { _id: 'a', areaName: 'Yaba', title: 'Flat A' } },
          { listingId: { _id: 'b', areaName: 'Lekki Phase 1', title: 'Flat B' } },
        ],
      },
    };

    assert.deepEqual(extractSavedListings(payload), [
      { _id: 'a', areaName: 'Yaba', title: 'Flat A' },
      { _id: 'b', areaName: 'Lekki Phase 1', title: 'Flat B' },
    ]);
  });

  it('keeps standard listings responses unchanged', () => {
    const payload = {
      data: {
        listings: [
          { _id: 'c', areaName: 'Ikeja', title: 'Flat C' },
        ],
      },
    };

    assert.deepEqual(extractSavedListings(payload), [
      { _id: 'c', areaName: 'Ikeja', title: 'Flat C' },
    ]);
  });
});
