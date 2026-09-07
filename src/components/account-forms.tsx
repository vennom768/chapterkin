"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function UpdateNameForm({ defaultName }: { defaultName: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  return (
    <form
      className="space-y-4"
      onSubmit={async (event) => {
        event.preventDefault();
        setPending(true);
        setError(null);
        setSaved(false);
        const name = String(new FormData(event.currentTarget).get("name") ?? "").trim();
        const result = await authClient.updateUser({ name });
        if (result.error) {
          setError(result.error.message ?? "Could not save your name.");
          setPending(false);
          return;
        }
        setSaved(true);
        setPending(false);
        router.refresh();
      }}
    >
      <div>
        <Label htmlFor="name">Your name</Label>
        <Input
          id="name"
          name="name"
          required
          defaultValue={defaultName}
          autoComplete="name"
        />
      </div>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      {saved ? <p className="text-sm text-navy">Saved.</p> : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Save name"}
      </Button>
    </form>
  );
}

export function ChangePasswordForm() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  return (
    <form
      className="space-y-4"
      onSubmit={async (event) => {
        event.preventDefault();
        setPending(true);
        setError(null);
        setSaved(false);
        const form = new FormData(event.currentTarget);
        const currentPassword = String(form.get("currentPassword") ?? "");
        const newPassword = String(form.get("newPassword") ?? "");
        const confirm = String(form.get("confirmPassword") ?? "");
        if (newPassword !== confirm) {
          setError("Those passwords do not match.");
          setPending(false);
          return;
        }
        const result = await authClient.changePassword({
          currentPassword,
          newPassword,
          revokeOtherSessions: true,
        });
        if (result.error) {
          setError(result.error.message ?? "Could not change that password.");
          setPending(false);
          return;
        }
        event.currentTarget.reset();
        setSaved(true);
        setPending(false);
      }}
    >
      <div>
        <Label htmlFor="currentPassword">Current password</Label>
        <Input
          id="currentPassword"
          name="currentPassword"
          type="password"
          required
          autoComplete="current-password"
        />
      </div>
      <div>
        <Label htmlFor="newPassword">New password</Label>
        <Input
          id="newPassword"
          name="newPassword"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
        />
      </div>
      <div>
        <Label htmlFor="confirmPassword">Confirm new password</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
        />
      </div>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      {saved ? (
        <p className="text-sm text-navy">
          Password updated. Other signed-in devices were signed out.
        </p>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Change password"}
      </Button>
    </form>
  );
}
