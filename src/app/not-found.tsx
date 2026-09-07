import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center px-4 text-center">
      <div>
        <h1 className="font-serif text-4xl text-navy">That page wandered off</h1>
        <p className="mt-2 text-muted">It is not part of tonight&apos;s story.</p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
