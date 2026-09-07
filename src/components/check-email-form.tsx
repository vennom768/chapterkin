"use client";

import { useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

export function CheckEmailForm({ email }: { email?: string }) {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        {email
          ? `We sent a confirmation link to ${email}.`
          : "We sent a confirmation link to your email."}{" "}
        Open it on this device to finish setting up your parent account.
        Locally, open Mailpit at http://127.0.0.1:8025 to read the message.
      </p>
      {email ? (
        <Button
          type="button"
          variant="secondary"
          className="w-full"
          disabled={pending}
          onClick={async () => {
            setPending(true);
            setError(null);
            setMessage(null);
            const result = await authClient.sendVerificationEmail({
              email,
              callbackURL: "/onboarding",
            });
            if (result.error) {
              setError(result.error.message ?? "Could not resend that email.");
            } else {
              setMessage("Another email is on the way.");
            }
            setPending(false);
          }}
        >
          {pending ? "Sending..." : "Resend confirmation email"}
        </Button>
      ) : null}
      {message ? <p className="text-sm text-navy">{message}</p> : null}
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <p className="text-center text-sm text-muted">
        Wrong address?{" "}
        <Link href="/sign-up" className="font-semibold text-navy">
          Create the account again
        </Link>
      </p>
    </div>
  );
}
