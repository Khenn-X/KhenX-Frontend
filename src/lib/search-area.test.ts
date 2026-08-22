import assert from 'node:assert/strict';
import { resolveSearchArea } from './search-area';

const resolve = (workplace: string, refinement = '') => resolveSearchArea({
  currentArea: 'Ikoyi',
  workplace,
  refinement,
});

assert.equal(resolve('Lekki Phase 1'), 'Lekki Phase 1');
assert.equal(resolve('', '3-bed apartment in Lekki Phase 1'), 'Lekki Phase 1');
assert.equal(resolve('Lekki Phase 1', 'Lekki Phase 1'), 'Lekki Phase 1');
assert.equal(resolve('Ikeja', 'search near Lekki Phase 1'), 'Lekki Phase 1');
assert.equal(resolve('near the office'), 'Ikoyi');