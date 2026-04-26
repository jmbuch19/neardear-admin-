"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

function Icon({ d }: { d: string }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );
}

const NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: <Icon d="M3 12l9-9 9 9M5 10v10h14V10" /> },
  {
    href: "/verifications",
    label: "Verifications",
    icon: <Icon d="M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6zM9 12l2 2 4-4" />,
  },
  {
    href: "/users",
    label: "Users",
    icon: <Icon d="M16 11a4 4 0 1 0-8 0 4 4 0 0 0 8 0zM4 21a8 8 0 0 1 16 0" />,
  },
  {
    href: "/sessions",
    label: "Sessions",
    icon: <Icon d="M12 8v5l3 2M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0z" />,
  },
  {
    href: "/concerns",
    label: "Concerns",
    icon: <Icon d="M12 9v4M12 17h.01M10.3 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />,
  },
  {
    href: "/payouts",
    label: "Payouts",
    icon: <Icon d="M3 7h18v10H3zM3 11h18M7 15h2" />,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex md:flex-col md:w-60 md:shrink-0 bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800">
      <div className="px-5 py-6 border-b border-zinc-200 dark:border-zinc-800">
        <p className="text-xs font-semibold tracking-widest uppercase text-zinc-500">
          NearDear
        </p>
        <p className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
          Admin
        </p>
      </div>
      <ul className="flex-1 px-3 py-4 space-y-1">
        {NAV.map((item) => {
          const active = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                    : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function AdminMobileNav() {
  const pathname = usePathname();
  return (
    <nav
      className="md:hidden border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-x-auto"
      aria-label="Admin sections"
    >
      <ul className="flex gap-1 px-3 py-2 min-w-max">
        {NAV.map((item) => {
          const active = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                  active
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                    : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
