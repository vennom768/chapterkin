"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPromoCode } from "@/lib/actions/promo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AdminPromoForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <form
      className="grid gap-4 sm:grid-cols-2"
      onSubmit={async (event) => {
        event.preventDefault();
        setPending(true);
        setError(null);
        const form = event.currentTarget;
        const result = await createPromoCode(new FormData(form));
        if (!result.ok) {
          setError(result.error);
          setPending(false);
          return;
        }
        form.reset();
        setPending(false);
        router.refresh();
      }}
    >
      <div className="sm:col-span-2">
        <Label htmlFor="promo-code">Code</Label>
        <Input
          id="promo-code"
          name="code"
          required
          minLength={3}
          maxLength={64}
          placeholder="chapterkin2026!!"
          autoComplete="off"
        />
      </div>
      <div>
        <Label htmlFor="promo-benefit">Benefit</Label>
        <select
          id="promo-benefit"
          name="benefit"
          defaultValue="unlimited"
          className="w-full min-h-11 rounded-xl border border-border bg-white px-3.5 py-2.5 text-base text-foreground outline-none ring-accent/30 focus:ring-2"
        >
          <option value="unlimited">Free unlimited account</option>
        </select>
      </div>
      <div>
        <Label htmlFor="promo-max">Max uses (optional)</Label>
        <Input
          id="promo-max"
          name="maxRedemptions"
          type="number"
          min={1}
          placeholder="Leave blank for unlimited uses"
        />
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor="promo-note">Note (optional)</Label>
        <Input id="promo-note" name="note" maxLength={200} placeholder="Testers, launch friends…" />
      </div>
      {error ? <p className="sm:col-span-2 text-sm text-red-700">{error}</p> : null}
      <div className="sm:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Create promo code"}
        </Button>
      </div>
    </form>
  );
}
