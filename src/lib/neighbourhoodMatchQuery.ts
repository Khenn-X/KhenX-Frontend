export interface NeighbourhoodMatchQueryInputs {
  budget?: string;
  priority?: string;
  commute?: string;
  lifestyle?: string | null;
}

export const buildNeighbourhoodMatchQuery = ({
  budget,
  priority,
  commute,
  lifestyle,
}: NeighbourhoodMatchQueryInputs) => {
  const params = new URLSearchParams();

  if (budget) params.set('budget', budget);
  if (priority) params.set('priority', priority);
  if (commute) params.set('commute', commute);
  if (lifestyle) params.set('lifestyleSlug', lifestyle);

  return params;
};
