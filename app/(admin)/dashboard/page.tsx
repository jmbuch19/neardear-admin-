import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function fetchMetrics() {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const todaysPayments = { status: "CAPTURED" as const, createdAt: { gte: startOfDay } };

  const [
    totalUsers,
    totalCompanions,
    totalReceivers,
    activeSessions,
    pendingVerifications,
    paymentsTodaySum,
    paymentsTodayCount,
    pendingPayouts,
    openConcerns,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "COMPANION", accountStatus: "ACTIVE" } }),
    prisma.user.count({ where: { role: "RECEIVER" } }),
    prisma.session.count({
      where: { status: { in: ["SCHEDULED", "CHECKED_IN", "CHECKED_OUT"] } },
    }),
    prisma.providerProfile.count({
      where: {
        OR: [
          { aadhaarVerified: "PENDING" },
          { pccStatus: "PENDING" },
        ],
      },
    }),
    prisma.payment.aggregate({ where: todaysPayments, _sum: { amount: true } }),
    prisma.payment.count({ where: todaysPayments }),
    prisma.earning.count({ where: { status: "PENDING" } }),
    prisma.concern.count({ where: { status: "OPEN" } }),
  ]);

  return {
    totalUsers,
    totalCompanions,
    totalReceivers,
    activeSessions,
    pendingVerifications,
    paymentsTodayAmount: paymentsTodaySum._sum?.amount ?? 0,
    paymentsTodayCount,
    pendingPayouts,
    openConcerns,
  };
}

function formatINR(rupees: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(rupees);
}

function MetricCard({
  label,
  value,
  hint,
  tone = "neutral",
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "neutral" | "warn" | "good";
}) {
  const toneClass =
    tone === "warn"
      ? "border-amber-200 dark:border-amber-900"
      : tone === "good"
        ? "border-emerald-200 dark:border-emerald-900"
        : "border-zinc-200 dark:border-zinc-800";
  return (
    <div
      className={`rounded-xl border ${toneClass} bg-white dark:bg-zinc-950 p-5`}
    >
      <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
        {label}
      </p>
      <p className="mt-2 text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
        {value}
      </p>
      {hint && <p className="mt-1 text-sm text-zinc-500">{hint}</p>}
    </div>
  );
}

export default async function DashboardPage() {
  const m = await fetchMetrics();

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Dashboard
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Live counts from the database.
        </p>
      </div>
      <div>
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 mb-4">
            People
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <MetricCard label="Total users" value={m.totalUsers} />
            <MetricCard
              label="Active companions"
              value={m.totalCompanions}
              hint="Status: ACTIVE"
            />
            <MetricCard
              label="Receivers (families)"
              value={m.totalReceivers}
            />
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 mb-4">
            Operations
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              label="Active sessions"
              value={m.activeSessions}
              hint="Confirmed or in-progress"
            />
            <MetricCard
              label="Pending verifications"
              value={m.pendingVerifications}
              hint="Companions awaiting review"
              tone={m.pendingVerifications > 0 ? "warn" : "neutral"}
            />
            <MetricCard
              label="Payments today"
              value={formatINR(m.paymentsTodayAmount)}
              hint={`${m.paymentsTodayCount} transactions`}
              tone={m.paymentsTodayCount > 0 ? "good" : "neutral"}
            />
            <MetricCard
              label="Pending payouts"
              value={m.pendingPayouts}
              hint="Companion earnings to release"
              tone={m.pendingPayouts > 0 ? "warn" : "neutral"}
            />
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 mb-4">
            Trust & Safety
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <MetricCard
              label="Open concerns"
              value={m.openConcerns}
              hint="Awaiting review"
              tone={m.openConcerns > 0 ? "warn" : "good"}
            />
          </div>
        </section>
      </div>
    </>
  );
}
