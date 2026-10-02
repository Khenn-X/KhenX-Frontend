export type NamedPlaceLike = {
  name?: string | null;
  distanceKm?: number | null;
  responseTimeMin?: number | null;
};

export const hasMeaningfulName = (value?: string | null) => {
  if (typeof value !== 'string') {
    return value != null;
  }

  return value.trim().length > 0;
};

export const hasMeaningfulPoliceStation = (
  station: NamedPlaceLike | null | undefined,
) => {
  if (station == null) return false;

  return (
    hasMeaningfulName(station.name) ||
    station.distanceKm != null ||
    station.responseTimeMin != null
  );
};

export const hasMeaningfulAirQualityRating = (value: number | null | undefined) =>
  typeof value === 'number' && Number.isFinite(value);

export const filterMeaningfulNamedPlaces = <T extends NamedPlaceLike>(
  items: T[] | null | undefined,
): T[] => {
  if (!Array.isArray(items)) return [];

  return items.filter((item) => item != null && (
    hasMeaningfulName(item.name) ||
    item.distanceKm != null
  ));
};

export const hasMeaningfulPublicSafetyData = ({
  nearestPoliceStation,
  airQualityRating,
  schoolNearestList,
  bankNearestList,
  marketNearestList,
}: {
  nearestPoliceStation?: NamedPlaceLike | null;
  airQualityRating?: number | null;
  schoolNearestList?: NamedPlaceLike[] | null;
  bankNearestList?: NamedPlaceLike[] | null;
  marketNearestList?: NamedPlaceLike[] | null;
}) => {
  return (
    hasMeaningfulPoliceStation(nearestPoliceStation) ||
    hasMeaningfulAirQualityRating(airQualityRating) ||
    filterMeaningfulNamedPlaces(schoolNearestList).length > 0 ||
    filterMeaningfulNamedPlaces(bankNearestList).length > 0 ||
    filterMeaningfulNamedPlaces(marketNearestList).length > 0
  );
};
