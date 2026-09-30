import test from 'node:test';
import assert from 'node:assert/strict';

import { dashboardQueryOptions, publicQueryOptions } from './dashboardQuery';

test('public queries keep normal caching defaults', () => {
  const options = publicQueryOptions({
    queryKey: ['public', 'listings'],
    queryFn: async () => ({ ok: true }),
  });

  assert.equal(options.staleTime, 1000 * 60 * 5);
  assert.equal(options.refetchOnWindowFocus, false);
  assert.equal((options.meta as { scope?: string } | undefined)?.scope, 'public');
});

test('dashboard queries stay always fresh and page-scoped', () => {
  const options = dashboardQueryOptions({
    queryKey: ['dashboard', 'stats'],
    queryFn: async () => ({ ok: true }),
  });

  assert.equal(options.staleTime, 0);
  assert.equal(options.refetchOnMount, 'always');
  assert.equal((options.meta as { scope?: string } | undefined)?.scope, 'page');
});