import { LAGOS_AREAS } from '../constants/lagos-areas';

const normalize = (value: string) => value.trim().toLowerCase().replace(/\s+/g, ' ');

const findKnownArea = (value: string): string | undefined => {
  const normalizedValue = normalize(value);
  if (!normalizedValue) return undefined;

  return [...LAGOS_AREAS]
    .sort((first, second) => second.length - first.length)
    .find((area) => {
      const normalizedArea = normalize(area);
      const escapedArea = normalizedArea.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return new RegExp(`(^|[^a-z0-9])${escapedArea}(?=$|[^a-z0-9])`, 'i').test(normalizedValue);
    });
};

export const resolveSearchArea = ({
  currentArea,
  workplace,
  refinement,
}: {
  currentArea: string;
  workplace: string;
  refinement: string;
}): string => {
  const normalizedCurrentArea = normalize(currentArea);
  const refinementArea = findKnownArea(refinement);
  const workplaceArea = findKnownArea(workplace);

  // Refinement is the more explicit search intent when both fields name different areas.
  if (refinementArea && normalize(refinementArea) !== normalizedCurrentArea) return refinementArea;
  if (workplaceArea && normalize(workplaceArea) !== normalizedCurrentArea) return workplaceArea;
  return currentArea;
};