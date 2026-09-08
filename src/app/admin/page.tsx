import { desc } from "drizzle-orm";
import { setAdminViewMode, updateSiteSetting } from "@/lib/actions/admin";
import { setPromoCodeActive } from "@/lib/actions/promo";
import { isEmailVerificationRequired } from "@/lib/admin";
import { AdminPromoForm } from "@/components/admin-promo-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { getAdminDashboardStats } from "@/lib/queries/admin-stats";
import { listPromoCodesWithUsage, PROMO_BENEFITS, isPromoBenefit } from "@/lib/promo";
import { requireAdmin } from "@/lib/session";

export default async function AdminPage() {
  await requireAdmin();
  const [requireVerification, stats, recentUsers, promoCodes] =
    await Promise.all([
      isEmailVerificationRequired(),
      getAdminDashboardStats(),
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
      listPromoCodesWithUsage(),
    ]);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-accent">
          Site admin
        </p>
        <h1 className="font-serif text-3xl text-navy sm:text-4xl">
          Configure ChapterKin
        </h1>
        <p className="mt-2 max-w-2xl text-muted">
          This page is only for you, the ChapterKin owner. Parents never see it.
          Use parent mode to write stories like a family account.
        </p>
      </div>

      <Card className="space-y-4">
        <div>
          <h2 className="font-serif text-2xl text-navy">Use as a parent</h2>
          <p className="mt-1 text-sm text-muted">
            Hide this admin area and walk through ChapterKin the way a family
            would. You can come back here any time.
          </p>
        </div>
        <form action={setAdminViewMode.bind(null, "parent")}>
          <Button type="submit">Use ChapterKin as a parent</Button>
        </form>
      </Card>

      <Card className="space-y-4">
        <div>
          <h2 className="font-serif text-2xl text-navy">Promo codes</h2>
          <p className="mt-1 text-sm text-muted">
            Give testers a code on signup for a free unlimited account. Codes
            are case-insensitive. Turn one off any time.
          </p>
        </div>
        <AdminPromoForm />
        {promoCodes.length === 0 ? (
          <p className="text-sm text-muted">No promo codes yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {promoCodes.map((item) => {
              const benefit = isPromoBenefit(item.benefit)
                ? PROMO_BENEFITS[item.benefit].label
                : item.benefit;
              const uses =
                item.maxRedemptions == null
                  ? `${item.redemptions} used`
                  : `${item.redemptions} of ${item.maxRedemptions} used`;
              return (
                <li
                  key={item.id}
                  className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-semibold text-navy">
                      <span className="font-mono">{item.code}</span>
                      {item.active ? "" : " · off"}
                    </p>
                    <p className="text-sm text-muted">
                      {benefit} · {uses}
                      {item.note ? ` · ${item.note}` : ""}
                    </p>
                  </div>
                  <form action={setPromoCodeActive.bind(null, item.id, !item.active)}>
                    <Button type="submit" variant="secondary">
                      {item.active ? "Turn off" : "Turn on"}
                    </Button>
                  </form>
                </li>
              );
            })}
          </ul>
        )}
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

      <div>
        <h2 className="font-serif text-2xl text-navy">Dashboard</h2>
        <p className="mt-1 text-sm text-muted">
          Counts from the live database, plus events we record as families use
          ChapterKin.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Accounts
          </p>
          <p className="mt-1 font-serif text-3xl text-navy">{stats.users}</p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Families
          </p>
          <p className="mt-1 font-serif text-3xl text-navy">{stats.families}</p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Children
          </p>
          <p className="mt-1 font-serif text-3xl text-navy">{stats.children}</p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Active books
          </p>
          <p className="mt-1 font-serif text-3xl text-navy">{stats.activeStories}</p>
          <p className="mt-1 text-xs text-muted">{stats.stories} ever written</p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Stories this week
          </p>
          <p className="mt-1 font-serif text-3xl text-navy">{stats.storiesWeek}</p>
          <p className="mt-1 text-xs text-muted">{stats.storiesMonth} in 30 days</p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Child drawings
          </p>
          <p className="mt-1 font-serif text-3xl text-navy">{stats.portraits}</p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Paying / promo
          </p>
          <p className="mt-1 font-serif text-3xl text-navy">{stats.paying}</p>
        </Card>
      </div>
      <Card>
        <h2 className="mb-4 font-serif text-2xl text-navy">Activity</h2>
        {stats.events.length === 0 ? (
          <p className="text-sm text-muted">No tracked events in the last 30 days.</p>
        ) : (
          <ul className="divide-y divide-border">
            {stats.events.map((event) => (
              <li key={event.name} className="flex justify-between gap-3 py-2">
                <p className="font-mono text-sm text-navy">{event.name}</p>
                <p className="text-sm text-muted">
                  {event.week} / 7d · {event.month} / 30d
                </p>
              </li>
            ))}
          </ul>
        )}
      </Card>
      {stats.plans.length ? (
        <Card>
          <h2 className="mb-4 font-serif text-2xl text-navy">Plans</h2>
          <ul className="divide-y divide-border">
            {stats.plans.map((row) => (
              <li
                key={`${row.planId}-${row.status}`}
                className="flex justify-between py-2 text-sm"
              >
                <span className="text-navy">
                  {row.planId} · {row.status}
                </span>
                <span className="text-muted">{row.total}</span>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

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
