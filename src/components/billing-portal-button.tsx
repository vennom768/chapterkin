"use client";

import { useState } from "react";
import { openBillingPortal } from "@/lib/actions/billing";
import { Button } from "@/components/ui/button";

export function BillingPortalButton() {
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
            await openBillingPortal();
          } catch (err) {
            if (
              typeof err === "object" &&
              err &&
              "digest" in err &&
              String((err as { digest?: string }).digest).startsWith("NEXT_REDIRECT")
            ) {
              throw err;
            }
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
