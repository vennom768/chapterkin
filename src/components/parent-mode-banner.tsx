import { setAdminViewMode } from "@/lib/actions/admin";

export function ParentModeBanner() {
  return (
    <div className="border-b border-gold/60 bg-gold/25">
      <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-2 text-sm text-navy sm:flex-row sm:items-center sm:justify-between">
        <p>You are using Chapterkin as a parent. Admin tools are hidden.</p>
        <form action={setAdminViewMode.bind(null, "admin")}>
          <button
            type="submit"
            className="font-semibold underline decoration-navy/30 underline-offset-2"
          >
            Back to admin
          </button>
        </form>
      </div>
    </div>
  );
}
