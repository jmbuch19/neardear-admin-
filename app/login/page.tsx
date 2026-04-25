"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Stage = "PHONE" | "OTP";

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-zinc-50 dark:bg-black" />}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const from = search.get("from") ?? "/";

  const [stage, setStage] = useState<Stage>("PHONE");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function sendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!/^\d{10}$/.test(phone)) {
      setError("Enter a 10-digit phone number");
      return;
    }
    setBusy(true);
    try {
      const r = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        setError(data.error ?? "Could not send OTP");
        return;
      }
      setStage("OTP");
    } finally {
      setBusy(false);
    }
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!/^\d{6}$/.test(otp)) {
      setError("Enter the 6-digit OTP");
      return;
    }
    setBusy(true);
    try {
      const r = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        setError(data.error ?? "Invalid OTP");
        return;
      }
      router.replace(from);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black px-4">
      <div className="w-full max-w-sm bg-white dark:bg-zinc-950 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-8">
        <div className="mb-8">
          <p className="text-xs font-semibold tracking-widest uppercase text-zinc-500 mb-2">
            NearDear Admin
          </p>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            Sign in
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Admins only. We&rsquo;ll text you a one-time code.
          </p>
        </div>

        {stage === "PHONE" ? (
          <form onSubmit={sendOtp} className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Phone number
              </span>
              <div className="mt-1 flex rounded-lg border border-zinc-300 dark:border-zinc-700 overflow-hidden focus-within:border-zinc-900 dark:focus-within:border-zinc-100">
                <span className="px-3 py-2 bg-zinc-100 dark:bg-zinc-900 text-zinc-500 text-sm border-r border-zinc-300 dark:border-zinc-700">
                  +91
                </span>
                <input
                  type="tel"
                  inputMode="numeric"
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                  }
                  placeholder="10-digit number"
                  className="flex-1 px-3 py-2 bg-transparent text-zinc-900 dark:text-zinc-50 outline-none"
                  autoFocus
                />
              </div>
            </label>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-lg bg-zinc-900 dark:bg-zinc-50 text-white dark:text-black py-2.5 text-sm font-semibold disabled:opacity-60"
            >
              {busy ? "Sending…" : "Send OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={verifyOtp} className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Enter OTP
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="6-digit code"
                className="mt-1 w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent text-zinc-900 dark:text-zinc-50 outline-none focus:border-zinc-900 dark:focus:border-zinc-100"
                autoFocus
              />
              <p className="text-xs text-zinc-500 mt-1">
                Sent to +91 {phone}.{" "}
                <button
                  type="button"
                  onClick={() => {
                    setStage("PHONE");
                    setOtp("");
                    setError("");
                  }}
                  className="underline"
                >
                  Use a different number
                </button>
              </p>
            </label>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-lg bg-zinc-900 dark:bg-zinc-50 text-white dark:text-black py-2.5 text-sm font-semibold disabled:opacity-60"
            >
              {busy ? "Verifying…" : "Verify & sign in"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
