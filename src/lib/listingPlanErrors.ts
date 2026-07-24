export const LISTING_PLAN_LIMIT_MESSAGES = [
  'listing limit reached',
  'listing limit for the free plan',
  'upgrade to create more listings',
  'free plan',
];

export const isListingPlanLimitError = (error: unknown): boolean => {
  const responseStatus = (error as { response?: { status?: number } } | undefined)?.response?.status;
  const message = [
    (error as { message?: string } | undefined)?.message,
    (error as { responseData?: { message?: string } } | undefined)?.responseData?.message,
    (error as { response?: { data?: { message?: string } } } | undefined)?.response?.data?.message,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  const isStatusMatch = responseStatus === 403;
  const isMessageMatch = LISTING_PLAN_LIMIT_MESSAGES.some((token) => message.includes(token));

  return isStatusMatch && isMessageMatch;
};
