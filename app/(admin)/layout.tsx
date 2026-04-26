import { requireAdmin } from "@/lib/admin-guard";
import AdminSidebar, { AdminMobileNav } from "@/components/AdminSidebar";
import AdminTopBar from "@/components/AdminTopBar";

export default async function AdminAreaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-zinc-50 dark:bg-black">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminTopBar adminName={admin.name} />
        <AdminMobileNav />
        <main className="flex-1 px-6 py-8 max-w-6xl w-full">{children}</main>
      </div>
    </div>
  );
}
