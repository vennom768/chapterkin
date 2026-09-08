"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { redeemPromoCode, validatePromoCode } from "@/lib/actions/promo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const nextPath = searchParams.get("next") || "/home";

  return (
    <form
      className="space-y-4"
      onSubmit={async (event) => {
        event.preventDefault();
        setPending(true);
        setError(null);
        const form = new FormData(event.currentTarget);
        const email = String(form.get("email") ?? "").trim();
        const password = String(form.get("password") ?? "");
        const confirm = String(form.get("confirmPassword") ?? "");
        const name = String(form.get("name") ?? "").trim();
        const promoCode = String(form.get("promoCode") ?? "").trim();

        if (mode === "sign-up" && password !== confirm) {
          setError("Those passwords do not match.");
          setPending(false);
          return;
        }

        if (mode === "sign-up" && promoCode) {
          const check = await validatePromoCode(promoCode);
          if (!check.ok) {
            setError(check.error);
            setPending(false);
            return;
          }
        }

        let result;
        try {
          result =
            mode === "sign-up"
              ? await authClient.signUp.email({
                  email,
                  password,
                  name,
                  callbackURL: "/onboarding",
                })
              : await authClient.signIn.email({
                  email,
                  password,
                  callbackURL: nextPath,
                });
        } catch {
          setError("Could not reach ChapterKin. Refresh the page and try again.");
          setPending(false);
          return;
        }

        if (result.error) {
          const message = result.error.message ?? "Something went wrong.";
          const unverified =
            result.error.code === "EMAIL_NOT_VERIFIED" ||
            /verif/i.test(message);
          if (unverified) {
            if (mode === "sign-up" && promoCode) {
              await redeemPromoCode(promoCode);
            }
            router.push(`/check-email?email=${encodeURIComponent(email)}`);
            return;
          }
          setError(message);
          setPending(false);
          return;
        }

        if (mode === "sign-up" && promoCode) {
          await redeemPromoCode(promoCode);
        }

        router.push(nextPath.startsWith("/") ? nextPath : "/home");
        router.refresh();
      }}
    >
      {mode === "sign-up" ? (
        <div>
          <Label htmlFor="name">Your name</Label>
          <Input id="name" name="name" required placeholder="Alex" autoComplete="name" />
        </div>
      ) : null}
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
      <div>
        <div className="mb-1.5 flex items-center justify-between gap-3">
          <Label htmlFor="password" className="mb-0">
            Password
          </Label>
          {mode === "sign-in" ? (
            <Link
              href="/forgot-password"
              className="text-sm font-semibold text-accent"
            >
              Forgot password?
            </Link>
          ) : null}
        </div>
        <Input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          placeholder="At least 8 characters"
          autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
        />
      </div>
      {mode === "sign-up" ? (
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
      ) : null}
      {mode === "sign-up" ? (
        <div>
          <Label htmlFor="promoCode">Promo code (optional)</Label>
          <Input
            id="promoCode"
            name="promoCode"
            placeholder="Testers can enter a code for a free unlimited account"
            autoComplete="off"
          />
        </div>
      ) : null}
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending
          ? "Please wait..."
          : mode === "sign-up"
            ? "Create family account"
            : "Sign in"}
      </Button>
      <p className="text-center text-sm text-muted">
        {mode === "sign-up" ? (
          <>
            Already have an account?{" "}
            <Link href="/sign-in" className="font-semibold text-navy">
              Sign in
            </Link>
          </>
        ) : (
          <>
            New here?{" "}
            <Link href="/sign-up" className="font-semibold text-navy">
              Create an account
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
