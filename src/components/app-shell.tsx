import Link from "next/link";
import { BookOpen, Home, Moon, Settings, Users } from "lucide-react";
import { ParentModeBanner } from "@/components/parent-mode-banner";
import { SignOutButton } from "@/components/sign-out-button";

const links = [
  { href: "/home", label: "Tonight", icon: Home },
  { href: "/family", label: "Family", icon: Users },
  { href: "/library", label: "Library", icon: BookOpen },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppShell({
  children,
  parentName,
  familyName,
  showParentModeBanner = false,
}: {
  children: React.ReactNode;
  parentName: string;
  familyName?: string | null;
  showParentModeBanner?: boolean;
}) {
  return (
    <div className="min-h-dvh bg-background">
      {showParentModeBanner ? <ParentModeBanner /> : null}
      <header className="sticky top-0 z-20 border-b border-border/80 bg-background/90 pt-[env(safe-area-inset-top)] backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <Link href="/home" className="flex min-w-0 items-center gap-2 text-navy">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-navy text-gold">
              <Moon className="h-4 w-4" />
            </span>
            <span className="truncate font-serif text-xl">ChapterKin</span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full px-3 py-2 text-sm font-semibold text-navy/80 hover:bg-gold/20"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex shrink-0 items-center gap-3">
            <span className="hidden max-w-40 truncate text-sm text-muted sm:inline">
              {familyName || parentName}
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl px-4 py-6 pb-8 sm:py-8">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-card/95 px-2 pt-1 pb-[max(0.5rem,env(safe-area-inset-bottom))] md:hidden">
        <div className="mx-auto grid max-w-md grid-cols-4">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-xl px-1 text-[11px] font-semibold text-navy"
              >
                <Icon className="h-5 w-5" />
                {link.label}
              </Link>
            );
          })}
        </div>
      </nav>
      <div className="h-[calc(3.75rem+env(safe-area-inset-bottom))] md:hidden" />
    </div>
  );
}
