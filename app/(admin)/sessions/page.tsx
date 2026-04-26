import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const SESSION_SELECT = {
  id: true,
  status: true,
  scheduledDate: true,
  scheduledTime: true,
  durationMinutes: true,
  serviceCity: true,
  serviceAddress: true,
  isRemote: true,
  checkedInAt: true,
  checkedOutAt: true,
  completedAt: true,
  checkedInLat: true,
  checkedInLng: true,
  confirmedByUser: true,
  companion: { select: { legalName: true } },
  request: {
    select: {
      user: { select: { name: true, phone: true } },
      elderProfile: { select: { name: true, city: true } },
    },
  },
  sessionNote: { select: { id: true } },
} as const;

async function fetchSessions() {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const [live, todayScheduled, recent] = await Promise.all([
    prisma.session.findMany({
      where: { status: "CHECKED_IN" },
      orderBy: { checkedInAt: "desc" },
      take: 50,
      select: SESSION_SELECT,
    }),
    prisma.session.findMany({
      where: {
        status: "SCHEDULED",
        scheduledDate: { gte: startOfDay, lte: endOfDay },
      },
      orderBy: { scheduledTime: "asc" },
      take: 50,
      select: SESSION_SELECT,
    }),
    prisma.session.findMany({
      where: {
        status: { in: ["CHECKED_OUT", "NOTE_SUBMITTED", "COMPLETED"] },
      },
      orderBy: { completedAt: "desc" },
      take: 25,
      select: SESSION_SELECT,
    }),
  ]);

  return { live, todayScheduled, recent };
}

type SessionRow = Awaited<ReturnType<typeof fetchSessions>>["live"][number];

const STATUS_PILL: Record<string, string> = {
  SCHEDULED: "bg-blue-50 text-blue-700 border-blue-200",
  CHECKED_IN: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CHECKED_OUT: "bg-zinc-100 text-zinc-700 border-zinc-200",
  NOTE_SUBMITTED: "bg-violet-50 text-violet-700 border-violet-200",
  COMPLETED: "bg-emerald-100 text-emerald-800 border-emerald-200",
  NO_SHOW_COMPANION: "bg-red-50 text-red-700 border-red-200",
  CANCELLED: "bg-zinc-100 text-zinc-500 border-zinc-200",
};

function StatusPill({ value }: { value: string }) {
  const cls = STATUS_PILL[value] ?? STATUS_PILL.CANCELLED;
  return (
    <span
      className={`inline-block px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider rounded-full border ${cls}`}
    >
      {value.replace(/_/g, " ")}
    </span>
  );
}

function fmtDate(d: Date | null) {
  if (!d) return null;
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function fmtTime(d: Date | null) {
  if (!d) return null;
  return d.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function durationFrom(start: Date | null, end: Date | null = new Date()) {
  if (!start) return null;
  const ms = (end ?? new Date()).getTime() - start.getTime();
  if (ms < 0) return null;
  const mins = Math.floor(ms / 60000);
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

function SessionCard({ s, variant }: { s: SessionRow; variant: "live" | "scheduled" | "recent" }) {
  const elderName = s.request.elderProfile?.name ?? s.request.user.name;
  const cityLabel = s.request.elderProfile?.city ?? s.serviceCity;

  return (
    <li className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0 flex-1">
          <p className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            {s.companion?.legalName ?? "(unassigned)"}
          </p>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            with <span className="font-medium">{elderName}</span> · {cityLabel}
          </p>
        </div>
        <StatusPill value={s.status} />
      </div>

      <dl className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2 text-sm">
        <div>
          <dt className="text-[11px] uppercase tracking-wider text-zinc-500">
            Scheduled
          </dt>
          <dd className="text-zinc-900 dark:text-zinc-100">
            {fmtDate(s.scheduledDate)} · {s.scheduledTime}
          </dd>
        </div>
        {s.durationMinutes !== null && s.durationMinutes !== undefined && (
          <div>
            <dt className="text-[11px] uppercase tracking-wider text-zinc-500">
              Booked
            </dt>
            <dd className="text-zinc-900 dark:text-zinc-100">
              {s.durationMinutes} min
            </dd>
          </div>
        )}
        <div>
          <dt className="text-[11px] uppercase tracking-wider text-zinc-500">Mode</dt>
          <dd className="text-zinc-900 dark:text-zinc-100">
            {s.isRemote ? "Remote" : "In-person"}
          </dd>
        </div>
        {variant === "live" && s.checkedInAt && (
          <div>
            <dt className="text-[11px] uppercase tracking-wider text-zinc-500">
              Live for
            </dt>
            <dd className="text-emerald-700 dark:text-emerald-400 font-semibold">
              {durationFrom(s.checkedInAt)}
            </dd>
          </div>
        )}
        {variant === "recent" && s.checkedInAt && s.checkedOutAt && (
          <div>
            <dt className="text-[11px] uppercase tracking-wider text-zinc-500">
              Actual
            </dt>
            <dd className="text-zinc-900 dark:text-zinc-100">
              {durationFrom(s.checkedInAt, s.checkedOutAt)}
            </dd>
          </div>
        )}
      </dl>

      {variant === "live" && s.checkedInAt && (
        <div className="mt-4 border-t border-zinc-200 dark:border-zinc-800 pt-3 text-sm flex flex-wrap items-center gap-3">
          <span className="text-zinc-600 dark:text-zinc-400">
            Checked in at {fmtTime(s.checkedInAt)}
          </span>
          {s.checkedInLat !== null &&
            s.checkedInLat !== undefined &&
            s.checkedInLng !== null &&
            s.checkedInLng !== undefined && (
              <a
                href={`https://maps.google.com/?q=${s.checkedInLat},${s.checkedInLng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                View GPS pin ↗
              </a>
            )}
        </div>
      )}

      {variant === "recent" && (
        <div className="mt-4 border-t border-zinc-200 dark:border-zinc-800 pt-3 text-sm flex flex-wrap items-center gap-4 text-zinc-600 dark:text-zinc-400">
          {s.completedAt && <span>Completed {fmtDate(s.completedAt)}</span>}
          <span>
            Note:{" "}
            {s.sessionNote ? (
              <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                submitted
              </span>
            ) : (
              <span className="text-amber-700 dark:text-amber-400 font-medium">
                pending
              </span>
            )}
          </span>
          <span>
            Family confirmation:{" "}
            {s.confirmedByUser ? (
              <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                yes
              </span>
            ) : (
              <span className="text-zinc-500">not yet</span>
            )}
          </span>
        </div>
      )}
    </li>
  );
}

function Section({
  title,
  subtitle,
  count,
  variant,
  items,
  empty,
}: {
  title: string;
  subtitle: string;
  count: number;
  variant: "live" | "scheduled" | "recent";
  items: SessionRow[];
  empty: string;
}) {
  return (
    <section className="mt-10 first:mt-0">
      <div className="flex items-baseline justify-between mb-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
            {title}{" "}
            <span className="font-normal text-zinc-400">({count})</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">{subtitle}</p>
        </div>
      </div>
      {items.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 text-center text-sm text-zinc-500">
          {empty}
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((s) => (
            <SessionCard key={s.id} s={s} variant={variant} />
          ))}
        </ul>
      )}
    </section>
  );
}

export default async function SessionsPage() {
  const { live, todayScheduled, recent } = await fetchSessions();

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Sessions
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Live check-ins, today&rsquo;s schedule, and the most recent completions.
          Reload to refresh.
        </p>
      </div>

      <Section
        title="Live now"
        subtitle="Companions checked in at a home or on a remote call"
        count={live.length}
        variant="live"
        items={live}
        empty="No sessions in progress right now."
      />

      <Section
        title="Scheduled today"
        subtitle="Booked for today, not yet checked in"
        count={todayScheduled.length}
        variant="scheduled"
        items={todayScheduled}
        empty="No more sessions scheduled for today."
      />

      <Section
        title="Recently completed"
        subtitle="Last 25 finished sessions"
        count={recent.length}
        variant="recent"
        items={recent}
        empty="No completed sessions yet."
      />
    </>
  );
}
