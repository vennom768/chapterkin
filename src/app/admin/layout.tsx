import Link from "next/link";
import { Moon } from "lucide-react";
import { SignOutButton } from "@/components/sign-out-button";
import { requireAdmin } from "@/lib/session";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();

  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-20 border-b border-border/80 bg-background/90 pt-[env(safe-area-inset-top)] backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <Link href="/admin" className="flex min-w-0 items-center gap-2 text-navy">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-navy text-gold">
              <Moon className="h-4 w-4" />
            </span>
            <span className="truncate font-serif text-xl">ChapterKin admin</span>
          </Link>
          <div className="flex shrink-0 items-center gap-3">
            <span className="hidden max-w-48 truncate text-sm text-muted sm:inline">
              {user.email}
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl px-4 py-6 pb-8 sm:py-8">{children}</main>
    </div>
  );
}
