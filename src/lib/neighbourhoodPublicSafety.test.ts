import test from 'node:test';
import assert from 'node:assert/strict';
import {
  filterMeaningfulNamedPlaces,
  hasMeaningfulAirQualityRating,
  hasMeaningfulPoliceStation,
  hasMeaningfulPublicSafetyData,
} from './neighbourhoodPublicSafety';

test('sparse police station objects are treated as absent data', () => {
  assert.equal(hasMeaningfulPoliceStation(null), false);
  assert.equal(hasMeaningfulPoliceStation({ name: null, distanceKm: null, responseTimeMin: null }), false);
  assert.equal(hasMeaningfulPoliceStation({ name: ' ', distanceKm: null, responseTimeMin: null }), false);
  assert.equal(hasMeaningfulPoliceStation({ name: null, distanceKm: 1.01, responseTimeMin: null }), true);
});

test('valid AQI values count as real data while null stays hidden', () => {
  assert.equal(hasMeaningfulAirQualityRating(null), false);
  assert.equal(hasMeaningfulAirQualityRating(undefined), false);
  assert.equal(hasMeaningfulAirQualityRating(0), true);
  assert.equal(hasMeaningfulAirQualityRating(42), true);
});

test('only named or distance-backed place entries stay visible', () => {
  const items = [
    { name: null, distanceKm: null },
    { name: ' ', distanceKm: null },
    { name: 'Adeniran Ogunsanya College', distanceKm: 1.2 },
    { name: 'First Bank', distanceKm: null },
  ];

  assert.deepEqual(filterMeaningfulNamedPlaces(items), [
    { name: 'Adeniran Ogunsanya College', distanceKm: 1.2 },
    { name: 'First Bank', distanceKm: null },
  ]);
});

test('public safety sections stay hidden when only empty objects exist', () => {
  assert.equal(hasMeaningfulPublicSafetyData({
    nearestPoliceStation: { name: null, distanceKm: null, responseTimeMin: null },
    airQualityRating: null,
    schoolNearestList: [],
    bankNearestList: [],
    marketNearestList: [],
  }), false);

  assert.equal(hasMeaningfulPublicSafetyData({
    nearestPoliceStation: { name: null, distanceKm: 1.01, responseTimeMin: null },
    airQualityRating: null,
    schoolNearestList: [],
    bankNearestList: [],
    marketNearestList: [],
  }), true);
});
