import Link from "next/link";
import { prisma } from "@/lib/prisma";
import VerificationActions from "./VerificationActions";

export const dynamic = "force-dynamic";

async function fetchPending() {
  return prisma.providerProfile.findMany({
    where: {
      OR: [
        { aadhaarVerified: "PENDING" },
        { pccStatus: "PENDING" },
      ],
    },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      legalName: true,
      city: true,
      addressLine1: true,
      addressLine2: true,
      state: true,
      pincode: true,
      aadhaarLast4: true,
      aadhaarVerified: true,
      pccStatus: true,
      pccIssuingAuth: true,
      pccIssuedAt: true,
      pccUrl: true,
      addressProofUrl: true,
      selfieUrl: true,
      applicationStage: true,
      createdAt: true,
      user: { select: { phone: true, email: true, name: true } },
    },
  });
}

function StatusPill({ value }: { value: string }) {
  const map: Record<string, string> = {
    PENDING: "bg-amber-100 text-amber-800 border-amber-200",
    CONFIRMED: "bg-emerald-100 text-emerald-800 border-emerald-200",
    FAILED: "bg-red-100 text-red-800 border-red-200",
    EXPIRED: "bg-zinc-100 text-zinc-700 border-zinc-200",
  };
  const cls = map[value] ?? map.EXPIRED;
  return (
    <span
      className={`inline-block px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider rounded-full border ${cls}`}
    >
      {value}
    </span>
  );
}

export default async function VerificationsPage() {
  const items = await fetchPending();

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Verifications
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Companion applications awaiting identity or police-certificate review.
          Cross-check the name on the document against the name entered.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-10 text-center">
          <p className="text-sm text-zinc-500">No pending applications. Inbox zero.</p>
        </div>
      ) : (
        <ul className="space-y-5">
          {items.map((p) => {
            const aadhaar = p.aadhaarLast4
              ? `XXXXXXXX${p.aadhaarLast4}`
              : "Not provided";
            const issued = p.pccIssuedAt
              ? new Date(p.pccIssuedAt).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              : null;
            return (
              <li
                key={p.id}
                className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5"
              >
                <div className="flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                        {p.legalName}
                      </p>
                      <p className="text-sm text-zinc-500">
                        {p.user?.phone ? `+91 ${p.user.phone}` : "(no phone)"}
                        {p.user?.email && ` · ${p.user.email}`}
                      </p>
                      <p className="text-xs text-zinc-400 mt-1">
                        Stage: {p.applicationStage} · Submitted{" "}
                        {p.createdAt.toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1 items-end">
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-zinc-500">Aadhaar:</span>
                        <StatusPill value={p.aadhaarVerified} />
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-zinc-500">Certificate:</span>
                        <StatusPill value={p.pccStatus} />
                      </div>
                    </div>
                  </div>

                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                    <div>
                      <dt className="text-xs uppercase tracking-wider text-zinc-500">
                        Name provided
                      </dt>
                      <dd className="text-zinc-900 dark:text-zinc-100">{p.legalName}</dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase tracking-wider text-zinc-500">
                        Aadhaar last 4
                      </dt>
                      <dd className="font-mono text-zinc-900 dark:text-zinc-100">
                        {aadhaar}
                      </dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-xs uppercase tracking-wider text-zinc-500">
                        Address
                      </dt>
                      <dd className="text-zinc-900 dark:text-zinc-100">
                        {[p.addressLine1, p.addressLine2, p.city, p.state, p.pincode]
                          .filter(Boolean)
                          .join(", ") || "—"}
                      </dd>
                    </div>
                    {p.pccIssuingAuth && (
                      <div>
                        <dt className="text-xs uppercase tracking-wider text-zinc-500">
                          Certificate issued by
                        </dt>
                        <dd className="text-zinc-900 dark:text-zinc-100">
                          {p.pccIssuingAuth}
                          {issued && ` (${issued})`}
                        </dd>
                      </div>
                    )}
                  </dl>

                  <div className="flex flex-wrap gap-3 text-sm">
                    {p.selfieUrl && (
                      <Link
                        href={p.selfieUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        View selfie ↗
                      </Link>
                    )}
                    {p.pccUrl && (
                      <Link
                        href={p.pccUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        View certificate ↗
                      </Link>
                    )}
                    {p.addressProofUrl && (
                      <Link
                        href={p.addressProofUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        View address proof ↗
                      </Link>
                    )}
                  </div>

                  <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4">
                    <p className="text-xs text-zinc-500 mb-3">
                      Confirm the name on the documents matches the name above before
                      approving.
                    </p>
                    <VerificationActions id={p.id} />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
