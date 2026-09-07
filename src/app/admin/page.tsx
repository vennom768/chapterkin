import { count, desc } from "drizzle-orm";
import { setAdminViewMode, updateSiteSetting } from "@/lib/actions/admin";
import { isEmailVerificationRequired } from "@/lib/admin";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { db } from "@/lib/db";
import { family, story, user } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/session";

export default async function AdminPage() {
  await requireAdmin();
  const [requireVerification, [userStats], [familyStats], [storyStats], recentUsers] =
    await Promise.all([
      isEmailVerificationRequired(),
      db.select({ total: count() }).from(user),
      db.select({ total: count() }).from(family),
      db.select({ total: count() }).from(story),
      db
        .select({
          id: user.id,
          name: user.name,
          email: user.email,
          emailVerified: user.emailVerified,
          createdAt: user.createdAt,
        })
        .from(user)
        .orderBy(desc(user.createdAt))
        .limit(12),
    ]);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-accent">
          Site admin
        </p>
        <h1 className="font-serif text-3xl text-navy sm:text-4xl">
          Configure Chapterkin
        </h1>
        <p className="mt-2 max-w-2xl text-muted">
          Change how the live site works, or switch into parent mode to use it
          like a family account.
        </p>
      </div>

      <Card className="space-y-4">
        <div>
          <h2 className="font-serif text-2xl text-navy">Use as a parent</h2>
          <p className="mt-1 text-sm text-muted">
            Hide this admin area and walk through Chapterkin the way a family
            would. You can come back here any time.
          </p>
        </div>
        <form action={setAdminViewMode.bind(null, "parent")}>
          <Button type="submit">Use Chapterkin as a parent</Button>
        </form>
      </Card>

      <Card className="space-y-4">
        <div>
          <h2 className="font-serif text-2xl text-navy">Email confirmation</h2>
          <p className="mt-1 text-sm text-muted">
            When this is on, new parents must confirm their email before they
            can add kids or write a story. Your admin email skips that step.
          </p>
        </div>
        <p className="text-sm font-semibold text-navy">
          {requireVerification ? "Confirmation is required." : "Confirmation is off."}
        </p>
        <form
          action={updateSiteSetting.bind(
            null,
            "require_email_verification",
            requireVerification ? "false" : "true",
          )}
        >
          <Button type="submit" variant="secondary">
            {requireVerification ? "Turn confirmation off" : "Turn confirmation on"}
          </Button>
        </form>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Accounts
          </p>
          <p className="mt-1 font-serif text-3xl text-navy">{userStats.total}</p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Families
          </p>
          <p className="mt-1 font-serif text-3xl text-navy">{familyStats.total}</p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Stories
          </p>
          <p className="mt-1 font-serif text-3xl text-navy">{storyStats.total}</p>
        </Card>
      </div>

      <Card>
        <h2 className="mb-4 font-serif text-2xl text-navy">Recent accounts</h2>
        {recentUsers.length === 0 ? (
          <p className="text-sm text-muted">No one has signed up yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {recentUsers.map((account) => (
              <li key={account.id} className="flex flex-col gap-1 py-3 sm:flex-row sm:justify-between">
                <div>
                  <p className="font-semibold text-navy">{account.name || "Unnamed"}</p>
                  <p className="text-sm text-muted">{account.email}</p>
                </div>
                <p className="text-sm text-muted">
                  {account.emailVerified ? "Verified" : "Unverified"}
                  {account.createdAt
                    ? ` · ${account.createdAt.toLocaleDateString()}`
                    : ""}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
