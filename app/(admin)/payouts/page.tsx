import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function fetchPending() {
  return prisma.earning
    .findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        amount: true,
        earningType: true,
        createdAt: true,
        providerProfile: { select: { legalName: true } },
      },
    })
    .catch(() => []);
}

function formatINR(rupees: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(rupees);
}

export default async function PayoutsPage() {
  const items = await fetchPending();
  const total = items.reduce((s, e) => s + e.amount, 0);

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Payouts
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Earnings awaiting release to companions. Mark-as-paid action coming soon.
        </p>
      </div>

      {items.length > 0 && (
        <div className="mb-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4">
          <p className="text-xs uppercase tracking-wider text-zinc-500">
            Total pending
          </p>
          <p className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            {formatINR(total)}
          </p>
          <p className="text-xs text-zinc-500 mt-1">
            Across {items.length} earning {items.length === 1 ? "record" : "records"}
          </p>
        </div>
      )}

      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 dark:bg-zinc-900 text-left">
            <tr>
              <th className="px-4 py-3 font-semibold text-zinc-600 dark:text-zinc-400">
                Companion
              </th>
              <th className="px-4 py-3 font-semibold text-zinc-600 dark:text-zinc-400">
                Type
              </th>
              <th className="px-4 py-3 font-semibold text-zinc-600 dark:text-zinc-400 text-right">
                Amount
              </th>
              <th className="px-4 py-3 font-semibold text-zinc-600 dark:text-zinc-400">
                Earned
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {items.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-10 text-center text-zinc-500"
                >
                  No pending payouts.
                </td>
              </tr>
            ) : (
              items.map((e) => (
                <tr
                  key={e.id}
                  className="hover:bg-zinc-50 dark:hover:bg-zinc-900"
                >
                  <td className="px-4 py-3 text-zinc-900 dark:text-zinc-100">
                    {e.providerProfile?.legalName ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                    {e.earningType}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-zinc-900 dark:text-zinc-100">
                    {formatINR(e.amount)}
                  </td>
                  <td className="px-4 py-3 text-zinc-500">
                    {e.createdAt.toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
