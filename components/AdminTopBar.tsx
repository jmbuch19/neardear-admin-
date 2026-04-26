import LogoutButton from "@/components/LogoutButton";

export default function AdminTopBar({ adminName }: { adminName: string }) {
  return (
    <header className="bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
      <div className="px-6 py-4 flex items-center justify-end gap-4">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">{adminName}</p>
        <LogoutButton />
      </div>
    </header>
  );
}
