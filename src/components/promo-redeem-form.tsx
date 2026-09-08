"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { redeemPromoCode } from "@/lib/actions/promo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PromoRedeemForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <form
      className="space-y-4"
      onSubmit={async (event) => {
        event.preventDefault();
        setPending(true);
        setError(null);
        const form = new FormData(event.currentTarget);
        const result = await redeemPromoCode(String(form.get("promoCode") ?? ""));
        if (!result.ok) {
          setError(result.error);
          setPending(false);
          return;
        }
        router.refresh();
      }}
    >
      <div>
        <Label htmlFor="billing-promo">Promo code</Label>
        <Input
          id="billing-promo"
          name="promoCode"
          required
          placeholder="If you have a tester code"
          autoComplete="off"
        />
      </div>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <Button type="submit" variant="secondary" disabled={pending}>
        {pending ? "Applying…" : "Apply promo code"}
      </Button>
    </form>
  );
}
