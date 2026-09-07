"use client";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="grid min-h-screen place-items-center px-4 text-center">
      <div>
        <h1 className="font-serif text-4xl text-navy">Something went sideways</h1>
        <p className="mt-2 text-muted">
          Tonight&apos;s page didn&apos;t load. You can try again.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 inline-flex rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
