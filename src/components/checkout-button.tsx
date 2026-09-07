"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { startCheckout } from "@/lib/actions/billing";
import { Button } from "@/components/ui/button";
import type { PlanId } from "@/lib/plans";

export function CheckoutButton({
  planId,
  signedIn,
}: {
  planId: PlanId;
  signedIn: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      <Button
        type="button"
        className="w-full"
        disabled={pending}
        onClick={async () => {
          if (!signedIn) {
            router.push(`/sign-up?next=/pricing`);
            return;
          }
          setPending(true);
          setError(null);
          try {
            const result = await startCheckout(planId);
            if (!result.ok) {
              if (result.redirectTo) {
                router.push(result.redirectTo);
                return;
              }
              setError(result.error);
              setPending(false);
              return;
            }
            window.location.assign(result.url);
          } catch (err) {
            setError(
              err instanceof Error ? err.message : "Could not start checkout.",
            );
            setPending(false);
          }
        }}
      >
        {pending ? "Opening checkout..." : signedIn ? "Choose this plan" : "Start with this plan"}
      </Button>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
