import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { getAdminViewMode, isAdminEmail } from "@/lib/admin";
import { getFamilyForUser } from "@/lib/queries/family";
import { requireUser } from "@/lib/session";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const isAdmin = isAdminEmail(user.email);
  if (isAdmin && (await getAdminViewMode()) !== "parent") {
    redirect("/admin");
  }
  const family = await getFamilyForUser(user.id);
  return (
    <AppShell
      parentName={user.name || user.email}
      familyName={family?.name}
      showParentModeBanner={isAdmin}
    >
      {children}
    </AppShell>
  );
}
