import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function fetchOpen() {
  return prisma.concern.findMany({
    where: { status: "OPEN" },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      severity: true,
      description: true,
      status: true,
      createdAt: true,
    },
  });
}

export default async function ConcernsPage() {
  const items = await fetchOpen().catch(() => []);

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Concerns
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Open concerns flagged by families or companions, sorted newest first.
          Action UI coming soon.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-10 text-center">
          <p className="text-sm text-zinc-500">
            No open concerns. Trust & safety queue is clear.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((c) => (
            <li
              key={c.id}
              className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900 p-4"
            >
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-amber-800">
                    {c.severity}
                  </p>
                  <p className="mt-1 text-sm text-zinc-900 dark:text-zinc-100">
                    {c.description || "(no description)"}
                  </p>
                </div>
                <p className="text-xs text-zinc-500 shrink-0">
                  {c.createdAt.toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                  })}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
