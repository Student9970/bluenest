"use client";

import { ArrowRight, LoaderCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { BackButton } from "@/components/BackButton";
import { MobileShell } from "@/components/MobileShell";
import { useApp } from "@/context/AppContext";

export function LoginFlow() {
  const router = useRouter();
  const params = useSearchParams();
  const returnTo = params.get("return") ?? "/profile";
  const { authUser, isLoggedIn, hasPhone, phone, signInWithGoogle, setPhoneNumber } =
    useApp();

  const [countryCode] = useState("+91");
  const [phoneLocal, setPhoneLocal] = useState(() => {
    const digits = phone?.replace(/\D/g, "") ?? "";
    return digits.startsWith("91") ? digits.slice(2) : digits;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoggedIn && hasPhone) {
      router.replace(returnTo);
    }
  }, [hasPhone, isLoggedIn, returnTo, router]);

  const helperText = useMemo(() => {
    if (!authUser) return "Sign in with your Google account to continue.";
    return `Logged in as ${authUser.email}`;
  }, [authUser]);

  async function handleGoogleSignIn() {
    setError(null);
    setLoading(true);
    const result = await signInWithGoogle();
    setLoading(false);
    if (!result.ok) {
      setError(result.error ?? "Google sign-in failed.");
    }
  }

  async function handleSavePhone() {
    setError(null);
    const digits = phoneLocal.replace(/\D/g, "");
    if (digits.length !== 10) {
      setError("Enter a valid 10-digit phone number.");
      return;
    }
    const result = await setPhoneNumber(`${countryCode} ${digits}`);
    if (!result.ok) {
      setError(result.error || "Could not save phone number.");
      return;
    }
    router.replace(returnTo);
  }

  return (
    <MobileShell>
      <div
        className="relative min-h-[38vh] w-full overflow-hidden bg-slate-300"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1513694203232-719a280e022f?w=900&q=70)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-slate-900/35 backdrop-blur-[3px]" />
        <div className="absolute left-4 top-[max(0.75rem,env(safe-area-inset-top))] z-10">
          <BackButton href="/" />
        </div>
      </div>

      <div className="flex flex-1 flex-col rounded-t-[28px] bg-white px-5 pb-28 pt-7 shadow-[0_-12px_40px_rgba(15,23,42,0.12)] -mt-6 relative z-[1]">
        <h1 className="text-2xl font-bold text-[var(--bn-blue-dark)]">
          Welcome Back
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {isLoggedIn ? "Enter your phone number to continue." : helperText}
        </p>

        {!isLoggedIn ? (
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--bn-blue)] py-4 text-base font-bold text-white shadow-lg shadow-[var(--bn-blue)]/25 transition-transform active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? (
              <>
                <LoaderCircle size={18} className="animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                Continue with Google
                <ArrowRight size={18} strokeWidth={2.2} />
              </>
            )}
          </button>
        ) : (
          <>
            <label className="mt-8 text-[11px] font-bold uppercase tracking-wide text-slate-400">
              Phone number
            </label>
            <div className="mt-2 flex rounded-xl border border-slate-200 bg-white shadow-sm focus-within:border-[var(--bn-blue)]/50 focus-within:ring-2 focus-within:ring-[var(--bn-blue)]/15">
              <span className="flex items-center border-r border-slate-200 px-3 text-sm font-semibold text-slate-700">
                {countryCode}
              </span>
              <input
                inputMode="numeric"
                autoComplete="tel"
                placeholder="00000 00000"
                value={phoneLocal}
                onChange={(e) =>
                  setPhoneLocal(e.target.value.replace(/\D/g, "").slice(0, 10))
                }
                className="min-w-0 flex-1 bg-transparent px-3 py-3.5 text-sm text-slate-800 outline-none placeholder:text-slate-400"
              />
            </div>
            {error && (
              <p className="mt-2 text-sm text-red-600" role="alert">
                {error}
              </p>
            )}
            <button
              type="button"
              onClick={handleSavePhone}
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--bn-blue)] py-4 text-base font-bold text-white shadow-lg shadow-[var(--bn-blue)]/25 transition-transform active:scale-[0.99]"
            >
              Continue
              <ArrowRight size={18} strokeWidth={2.2} />
            </button>
          </>
        )}

        {error && !isLoggedIn && (
          <p className="mt-3 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        <p className="mt-auto pt-8 text-center text-xs text-slate-400">
          OTP removed. Sign in with Google, then add your phone number.
        </p>
      </div>
    </MobileShell>
  );
}

export function LoginFlowFallback() {
  return (
    <MobileShell className="items-center justify-center pb-28">
      <div className="h-8 w-8 animate-pulse rounded-full bg-[var(--bn-blue)]/20" />
    </MobileShell>
  );
}
