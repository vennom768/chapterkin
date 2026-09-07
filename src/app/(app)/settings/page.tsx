import Link from "next/link";
import { Card } from "@/components/ui/card";
import { SignOutButton } from "@/components/sign-out-button";
import { getFamilyForUser } from "@/lib/queries/family";
import { requireUser } from "@/lib/session";

export default async function SettingsPage() {
  const user = await requireUser();
  const family = await getFamilyForUser(user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-navy sm:text-4xl">Settings</h1>
        <p className="mt-1 text-muted">
          This is a family account. Children never sign in to Chapterkin.
        </p>
      </div>
      <Card className="space-y-3">
        {family ? (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              Family
            </p>
            <p className="text-lg">{family.name}</p>
            <Link
              href="/family"
              className="inline-flex min-h-11 items-center text-sm font-semibold text-accent"
            >
              Edit family
            </Link>
          </div>
        ) : null}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Name
          </p>
          <p className="text-lg">{user.name || "—"}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Email
          </p>
          <p className="text-lg">{user.email}</p>
        </div>
        <SignOutButton />
      </Card>
    </div>
  );
}
