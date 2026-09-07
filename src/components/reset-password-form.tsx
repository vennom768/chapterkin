"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const invalid = searchParams.get("error") === "INVALID_TOKEN";
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (invalid || !token) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted">
          This reset link is missing or has expired. Request a new one and try
          again.
        </p>
        <Link
          href="/forgot-password"
          className="inline-flex min-h-11 items-center font-semibold text-accent"
        >
          Request a new link
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
        const password = String(form.get("password") ?? "");
        const confirm = String(form.get("confirmPassword") ?? "");
        if (password !== confirm) {
          setError("Those passwords do not match.");
          setPending(false);
          return;
        }
        const result = await authClient.resetPassword({
          newPassword: password,
          token,
        });
        if (result.error) {
          setError(result.error.message ?? "Could not reset that password.");
          setPending(false);
          return;
        }
        router.push("/sign-in?reset=1");
      }}
    >
      <div>
        <Label htmlFor="password">New password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          placeholder="At least 8 characters"
          autoComplete="new-password"
        />
      </div>
      <div>
        <Label htmlFor="confirmPassword">Confirm password</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          minLength={8}
          placeholder="Type it again"
          autoComplete="new-password"
        />
      </div>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Saving..." : "Save new password"}
      </Button>
    </form>
  );
}
