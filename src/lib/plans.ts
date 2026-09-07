export const COMPLIMENTARY_STORIES = 1;

export const PAGE_REVISION_CENTS = 199;

export const PLANS = {
  weekly: {
    id: "weekly",
    name: "A few nights",
    storiesPerMonth: 4,
    priceCents: 2499,
    blurb: "Four new books a month. A printed picture book often costs about this much for one copy.",
  },
  family: {
    id: "family",
    name: "Most weeks",
    storiesPerMonth: 8,
    priceCents: 3999,
    popular: true,
    blurb: "A couple of nights a week, or take turns between kids.",
  },
  nightly: {
    id: "nightly",
    name: "Every night",
    storiesPerMonth: null,
    priceCents: 5499,
    blurb: "Unlimited stories for the whole family, any night you want.",
  },
} as const;

export type PlanId = keyof typeof PLANS;

export function isPlanId(value: string): value is PlanId {
  return value in PLANS;
}

export function formatPrice(cents: number) {
  const dollars = cents / 100;
  return Number.isInteger(dollars) ? `$${dollars}` : `$${dollars.toFixed(2)}`;
}

export function planStoryLabel(storiesPerMonth: number | null) {
  return storiesPerMonth == null ? "Unlimited stories" : `${storiesPerMonth} stories a month`;
}

export function revisionPrice(pageCount: number) {
  return PAGE_REVISION_CENTS * Math.max(0, pageCount);
}
