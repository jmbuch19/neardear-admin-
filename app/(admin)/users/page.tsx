import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function fetchRecentUsers() {
  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      name: true,
      phone: true,
      city: true,
      role: true,
      accountStatus: true,
      createdAt: true,
    },
  });
}

export default async function UsersPage() {
  const users = await fetchRecentUsers();

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Users
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Showing the 50 most recently created accounts. Search and suspend actions
          coming soon.
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 dark:bg-zinc-900 text-left">
            <tr>
              <th className="px-4 py-3 font-semibold text-zinc-600 dark:text-zinc-400">
                Name
              </th>
              <th className="px-4 py-3 font-semibold text-zinc-600 dark:text-zinc-400">
                Phone
              </th>
              <th className="px-4 py-3 font-semibold text-zinc-600 dark:text-zinc-400">
                City
              </th>
              <th className="px-4 py-3 font-semibold text-zinc-600 dark:text-zinc-400">
                Role
              </th>
              <th className="px-4 py-3 font-semibold text-zinc-600 dark:text-zinc-400">
                Status
              </th>
              <th className="px-4 py-3 font-semibold text-zinc-600 dark:text-zinc-400">
                Joined
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {users.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center text-zinc-500"
                >
                  No users yet.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr
                  key={u.id}
                  className="hover:bg-zinc-50 dark:hover:bg-zinc-900"
                >
                  <td className="px-4 py-3 text-zinc-900 dark:text-zinc-100">
                    {u.name}
                  </td>
                  <td className="px-4 py-3 font-mono text-zinc-600 dark:text-zinc-400">
                    +91 {u.phone}
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                    {u.city}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-block px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider rounded-full border border-zinc-200 dark:border-zinc-700">
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider rounded-full border ${
                        u.accountStatus === "ACTIVE"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : u.accountStatus === "SUSPENDED"
                            ? "bg-red-50 text-red-700 border-red-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}
                    >
                      {u.accountStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-500">
                    {u.createdAt.toLocaleDateString("en-IN", {
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
