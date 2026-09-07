"use client";

import { useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ForgotPasswordForm() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted">
          If that email has a ChapterKin account, we sent a reset link. Check
          spam if it is not in your inbox in a minute or two.
        </p>
        <Link
          href="/sign-in"
          className="inline-flex min-h-11 items-center font-semibold text-navy"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form
      className="space-y-4"
      onSubmit={async (event) => {
        event.preventDefault();
        setPending(true);
        setError(null);
        const form = new FormData(event.currentTarget);
        const email = String(form.get("email") ?? "").trim();
        const result = await authClient.requestPasswordReset({
          email,
          redirectTo: "/reset-password",
        });
        if (result.error) {
          setError(result.error.message ?? "Could not send a reset email.");
          setPending(false);
          return;
        }
        setSent(true);
        setPending(false);
      }}
    >
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          placeholder="you@example.com"
          autoComplete="email"
        />
      </div>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Sending..." : "Send reset link"}
      </Button>
      <p className="text-center text-sm text-muted">
        <Link href="/sign-in" className="font-semibold text-navy">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
