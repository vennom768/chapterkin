import Link from "next/link";

export function EmptyState({
  title,
  body,
  actionHref,
  actionLabel,
}: {
  title: string;
  body: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="rounded-3xl border border-dashed border-border bg-card/70 px-6 py-12 text-center">
      <h2 className="font-serif text-2xl text-navy">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-muted">{body}</p>
      {actionHref && actionLabel ? (
        <Link
          href={actionHref}
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-dark"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
