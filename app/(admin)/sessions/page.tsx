export const dynamic = "force-dynamic";

export default function SessionsPage() {
  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Sessions
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Live and recently completed sessions across the platform.
        </p>
      </div>
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-10 text-center">
        <p className="text-sm text-zinc-500">
          Session monitoring view is on the roadmap. Once companions start checking in
          and out, this page will show live GPS check-ins, durations, and post-session
          notes.
        </p>
      </div>
    </>
  );
}
