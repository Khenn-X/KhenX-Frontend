import assert from 'node:assert/strict';
import { buildSourceDetailsSummary } from './source-details-summary';

const osmEvidence = {
  _id: 'osm-1',
  claimType: 'school_nearest_list',
  value: [{ name: 'Lekki British School', distanceKm: 1.2 }],
  observedAt: '2026-09-01T00:00:00.000Z',
  retrievedAt: '2026-09-02T00:00:00.000Z',
  sourceDocumentPublicId: 'https://overpass-api.de/api/interpreter?data=%5Bout%3Ajson%5D%5Btimeout%3A60%5D%3B%28nwr%5Bamenity%3Dschool%5D%28around%3A1500%2C6.45%2C3.45%29%3B%29%3Bout%20center%20tags%3B',
};

const osmSource = {
  name: 'OpenStreetMap Overpass',
  organization: 'OpenStreetMap Foundation',
  sourceType: 'open_data',
  domain: 'amenities',
  tier: 4,
};

const osrmEvidence = {
  _id: 'osrm-1',
  claimType: 'travel_time_lekki',
  value: 22.5,
  observedAt: '2026-09-01T00:00:00.000Z',
  retrievedAt: '2026-09-02T00:00:00.000Z',
  sourceDocumentPublicId: 'https://router.project-osrm.org/route/v1/driving/3.45,6.45;3.47,6.47?overview=false',
};

const osrmSource = {
  name: 'OSRM Routing (Demo Server)',
  organization: 'Project OSRM',
  sourceType: 'open_data',
  domain: 'routing',
  tier: 4,
};

const hospitalSummary = buildSourceDetailsSummary({
  _id: 'hospital-1',
  claimType: 'nearest_hospital',
  value: { name: 'Reddington Hospital', distanceKm: 0.6 },
  observedAt: '2026-09-01T00:00:00.000Z',
  retrievedAt: '2026-09-02T00:00:00.000Z',
} as any, osmSource as any);
assert.ok(hospitalSummary.dataTable.some((row) => row.label === 'Value' && row.value === 'Reddington Hospital — 0.6 km'));

const osmSummary = buildSourceDetailsSummary(osmEvidence as any, osmSource as any);
assert.match(osmSummary.headline, /KhenX found/i);
assert.match(osmSummary.headline, /nearby schools/i);
assert.equal(osmSummary.source, 'OpenStreetMap Overpass');
assert.equal(osmSummary.provider, 'OpenStreetMap Foundation');
assert.equal(osmSummary.method, 'Overpass API query');
assert.ok(osmSummary.dataTable.some((row) => row.label === 'Observation date'));
assert.ok(osmSummary.dataTable.some((row) => row.label === 'Radius'));

const osrmSummary = buildSourceDetailsSummary(osrmEvidence as any, osrmSource as any);
assert.match(osrmSummary.headline, /travel time/i);
assert.equal(osrmSummary.method, 'Routing API');
assert.equal(osrmSummary.source, 'OSRM Routing (Demo Server)');
assert.ok(!('searchArea' in osrmSummary) || !osrmSummary.searchArea);

console.log('source summary tests passed');
