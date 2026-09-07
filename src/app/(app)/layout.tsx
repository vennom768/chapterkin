import { AppShell } from "@/components/app-shell";
import { getFamilyForUser } from "@/lib/queries/family";
import { requireUser } from "@/lib/session";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const family = await getFamilyForUser(user.id);
  return (
    <AppShell parentName={user.name || user.email} familyName={family?.name}>
      {children}
    </AppShell>
  );
}
