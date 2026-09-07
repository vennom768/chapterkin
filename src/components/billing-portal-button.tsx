"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { openBillingPortal } from "@/lib/actions/billing";
import { Button } from "@/components/ui/button";

export function BillingPortalButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="secondary"
        disabled={pending}
        onClick={async () => {
          setPending(true);
          setError(null);
          try {
            const result = await openBillingPortal();
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
              err instanceof Error ? err.message : "Could not open billing.",
            );
            setPending(false);
          }
        }}
      >
        {pending ? "Opening..." : "Manage billing"}
      </Button>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
