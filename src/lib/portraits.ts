import { formatPrice } from "@/lib/plans";

export const FREE_PORTRAITS = 3;
export const PORTRAIT_PACK_SIZE = 3;
export const PORTRAIT_PACK_CENTS = 299;

export function portraitAllowance(packs: number) {
  return FREE_PORTRAITS + Math.max(0, packs) * PORTRAIT_PACK_SIZE;
}

export function portraitsRemaining(used: number, packs: number) {
  return Math.max(0, portraitAllowance(packs) - used);
}

export function portraitPackPriceLabel() {
  return formatPrice(PORTRAIT_PACK_CENTS);
}
