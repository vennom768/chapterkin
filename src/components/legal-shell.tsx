import Link from "next/link";

export function LegalShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-background">
      <header className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-4 pt-[max(1rem,env(safe-area-inset-top))]">
        <Link href="/" className="font-serif text-2xl text-navy">
          ChapterKin
        </Link>
        <Link href="/support" className="text-sm font-semibold text-navy">
          Support
        </Link>
      </header>
      <main className="mx-auto max-w-3xl px-4 pb-16 pt-4">
        <h1 className="font-serif text-3xl text-navy sm:text-4xl">{title}</h1>
        <div className="prose-legal mt-6 space-y-4 text-navy/90">{children}</div>
      </main>
    </div>
  );
}
