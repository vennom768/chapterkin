import Link from "next/link";
import {
  ChangePasswordForm,
  UpdateNameForm,
} from "@/components/account-forms";
import { SignOutButton } from "@/components/sign-out-button";
import { Card } from "@/components/ui/card";
import { setAdminViewMode } from "@/lib/actions/admin";
import { isAdminEmail } from "@/lib/admin";
import { getFamilyForUser } from "@/lib/queries/family";
import { requireUser } from "@/lib/session";

export default async function SettingsPage() {
  const user = await requireUser();
  const family = await getFamilyForUser(user.id);
  const isAdmin = isAdminEmail(user.email);

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
            Email
          </p>
          <p className="text-lg">{user.email}</p>
          <p className="text-sm text-muted">
            {user.emailVerified ? "Verified." : "Waiting for confirmation."}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Plan
          </p>
          <Link
            href="/billing"
            className="inline-flex min-h-11 items-center text-sm font-semibold text-accent"
          >
            Billing and story allowance
          </Link>
        </div>
        {isAdmin ? (
          <form action={setAdminViewMode.bind(null, "admin")}>
            <button
              type="submit"
              className="inline-flex min-h-11 items-center text-sm font-semibold text-accent"
            >
              Open admin
            </button>
          </form>
        ) : null}
        <SignOutButton />
      </Card>
      <Card>
        <h2 className="mb-4 font-serif text-2xl text-navy">Your name</h2>
        <UpdateNameForm defaultName={user.name || ""} />
      </Card>
      <Card>
        <h2 className="mb-4 font-serif text-2xl text-navy">Password</h2>
        <p className="mb-4 text-sm text-muted">
          Changing it signs out other devices.
        </p>
        <ChangePasswordForm />
      </Card>
    </div>
  );
}
