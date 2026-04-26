"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function VerificationActions({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState<"APPROVE" | "REJECT" | null>(null);
  const [error, setError] = useState("");

  async function act(action: "APPROVE" | "REJECT") {
    if (action === "REJECT" && !confirm("Reject this application? The companion will be marked SUSPENDED.")) {
      return;
    }
    setBusy(action);
    setError("");
    try {
      const r = await fetch(`/api/verifications/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!r.ok) {
        const data = await r.json().catch(() => ({}));
        setError(data.error ?? "Action failed");
        return;
      }
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <button
        type="button"
        onClick={() => act("APPROVE")}
        disabled={busy !== null}
        className="rounded-lg bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        {busy === "APPROVE" ? "Approving…" : "Approve"}
      </button>
      <button
        type="button"
        onClick={() => act("REJECT")}
        disabled={busy !== null}
        className="rounded-lg border border-red-300 text-red-700 hover:bg-red-50 px-4 py-2 text-sm font-semibold disabled:opacity-60"
      >
        {busy === "REJECT" ? "Rejecting…" : "Reject"}
      </button>
      {error && (
        <p className="text-xs text-red-600 self-center sm:ml-2">{error}</p>
      )}
    </div>
  );
}
