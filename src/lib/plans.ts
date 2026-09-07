export const COMPLIMENTARY_STORIES = 1;

export const PLANS = {
  weekly: {
    id: "weekly",
    name: "A few nights",
    storiesPerMonth: 4,
    priceCents: 900,
    blurb: "One new story a week. Enough to start the bedtime ritual.",
  },
  family: {
    id: "family",
    name: "Most weeks",
    storiesPerMonth: 8,
    priceCents: 1600,
    popular: true,
    blurb: "A couple of nights a week, or take turns between kids.",
  },
  nightly: {
    id: "nightly",
    name: "Every night",
    storiesPerMonth: null,
    priceCents: 2900,
    blurb: "Unlimited stories for the whole family, any night you want.",
  },
} as const;

export type PlanId = keyof typeof PLANS;

export function isPlanId(value: string): value is PlanId {
  return value in PLANS;
}

export function formatPrice(cents: number) {
  return `$${Math.round(cents / 100)}`;
}

export function planStoryLabel(storiesPerMonth: number | null) {
  return storiesPerMonth == null ? "Unlimited stories" : `${storiesPerMonth} stories a month`;
}
