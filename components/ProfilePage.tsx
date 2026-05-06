"use client";

import { User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { BlueNestLogo } from "@/components/BlueNestLogo";
import { MobileShell } from "@/components/MobileShell";
import { useApp } from "@/context/AppContext";

export function ProfilePage() {
  const router = useRouter();
  const {
    authUser,
    isLoggedIn,
    phone,
    userListing,
    logout,
    deleteListing,
    setPhoneNumber,
  } = useApp();
  const [draftPhoneOverride, setDraftPhoneOverride] = useState<string | null>(
    null,
  );
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const initialPhoneDigits = useMemo(() => {
    const digits = phone?.replace(/\D/g, "") ?? "";
    return digits.startsWith("91") ? digits.slice(2) : digits;
  }, [phone]);
  const draftPhone = draftPhoneOverride ?? initialPhoneDigits;

  function confirmDelete() {
    if (!userListing) return;
    if (typeof window !== "undefined" && window.confirm("Delete your listing?")) {
      void deleteListing();
    }
  }

  if (!isLoggedIn) {
    return (
      <MobileShell>
        <div className="relative flex flex-1 flex-col items-center px-6 pb-28 pt-[max(2rem,env(safe-area-inset-top))]">
          <div
            className="pointer-events-none absolute inset-0 -z-10 opacity-90"
            style={{
              background:
                "radial-gradient(120% 80% at 50% -10%, rgba(37,99,235,0.18), transparent 55%), linear-gradient(180deg, #f8fafc 0%, #ffffff 45%)",
            }}
          />
          <BlueNestLogo />
          <div className="mt-10 flex h-24 w-24 items-center justify-center rounded-3xl bg-white shadow-[0_12px_40px_rgba(37,99,235,0.12)] ring-1 ring-slate-100">
            <User className="text-[var(--bn-blue)]" size={48} strokeWidth={1.7} />
          </div>
          <h1 className="mt-8 text-2xl font-bold text-[var(--bn-blue-dark)]">
            Welcome Back
          </h1>
          <p className="mt-2 text-center text-sm text-slate-500">
            Login to manage listings
          </p>
          <Link
            href="/login"
            className="mt-10 flex w-full max-w-xs items-center justify-center rounded-2xl bg-[var(--bn-blue)] py-4 text-base font-bold text-white shadow-lg shadow-[var(--bn-blue)]/25"
          >
            Continue with Google
          </Link>
        </div>
      </MobileShell>
    );
  }

  return (
    <MobileShell>
      <main className="flex flex-1 flex-col px-5 pb-28 pt-[max(1rem,env(safe-area-inset-top))]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-[var(--bn-blue-dark)]">
              {authUser?.name || "You"}
            </h1>
            <p className="mt-1 text-sm text-slate-500">{authUser?.email}</p>
            <p className="mt-1 text-sm font-medium text-slate-700">{phone}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              void logout();
              router.refresh();
            }}
            className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            Log out
          </button>
        </div>

        <section className="mt-5 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
          <h2 className="text-xs font-bold uppercase tracking-wide text-slate-400">
            Phone number
          </h2>
          <div className="mt-2 flex rounded-xl border border-slate-200 bg-white">
            <span className="flex items-center border-r border-slate-200 px-3 text-sm font-semibold text-slate-700">
              +91
            </span>
            <input
              inputMode="numeric"
              value={draftPhone}
              onChange={(e) =>
                setDraftPhoneOverride(
                  e.target.value.replace(/\D/g, "").slice(0, 10),
                )
              }
              placeholder="00000 00000"
              className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm text-slate-800 outline-none placeholder:text-slate-400"
            />
          </div>
          {phoneError && (
            <p className="mt-2 text-xs font-medium text-red-600">{phoneError}</p>
          )}
          <button
            type="button"
            onClick={() => {
              const digits = draftPhone.replace(/\D/g, "");
              if (digits.length !== 10) {
                setPhoneError("Enter a valid 10-digit phone number.");
                return;
              }
              (async () => {
                const result = await setPhoneNumber(`+91 ${digits}`);
                if (!result.ok) {
                  setPhoneError(result.error || "Could not update phone.");
                  return;
                }
                setPhoneError(null);
                setDraftPhoneOverride(null);
              })();
            }}
            className="mt-3 w-full rounded-xl bg-[var(--bn-blue)] py-3 text-sm font-bold text-white"
          >
            Update phone number
          </button>
        </section>

        <section className="mt-8">
          <h2 className="text-xs font-bold uppercase tracking-wide text-slate-400">
            Your listing
          </h2>
          {!userListing ? (
            <div className="mt-3 rounded-2xl bg-slate-50 px-4 py-8 text-center ring-1 ring-slate-100">
              <p className="text-sm text-slate-600">You have no active listing.</p>
              <Link
                href="/host"
                className="mt-3 inline-block text-sm font-semibold text-[var(--bn-blue)]"
              >
                Post a listing
              </Link>
            </div>
          ) : (
            <div className="mt-3 overflow-hidden rounded-[22px] bg-white shadow-[0_8px_30px_rgba(15,23,42,0.08)] ring-1 ring-slate-100">
              <div className="relative aspect-[16/9] w-full">
                <Image
                  src={userListing.imageUrl}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="430px"
                  unoptimized={userListing.imageUrl.startsWith("data:")}
                />
              </div>
              <div className="space-y-2 px-4 py-4">
                <h3 className="text-lg font-bold text-[var(--bn-blue-dark)]">
                  {userListing.title}
                </h3>
                <p className="text-sm text-slate-500">{userListing.area}</p>
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="mt-2 w-full rounded-xl border border-red-200 bg-red-50 py-3 text-sm font-bold text-red-700 transition-colors hover:bg-red-100"
                >
                  Delete listing
                </button>
              </div>
            </div>
          )}
        </section>
      </main>
    </MobileShell>
  );
}
