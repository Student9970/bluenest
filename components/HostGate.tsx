"use client";

import Link from "next/link";
import { MobileShell } from "@/components/MobileShell";
import { useApp } from "@/context/AppContext";
import { HostListingForm } from "@/components/HostListingForm";

export function HostGate() {
  const { isLoggedIn, hasPhone } = useApp();

  if (!isLoggedIn || !hasPhone) {
    return (
      <MobileShell>
        <div
          className="relative h-64 w-full overflow-hidden bg-slate-200"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1484154218962-a197022b5858?w=900&q=70)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-[2px]" />
        </div>

        <div className="-mt-6 flex flex-1 flex-col rounded-t-[28px] bg-white px-6 pb-28 pt-12 shadow-[0_-12px_40px_rgba(15,23,42,0.08)]">
          <h1 className="text-2xl font-bold text-(--bn-blue-dark)">
            Post a listing
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Continue with Google, then add your phone number to publish your
            place. Only one active listing is allowed per account.
          </p>
          <Link
            href="/login?return=/host"
            className="mt-8 flex w-full items-center justify-center rounded-2xl bg-(--bn-blue) py-4 text-base font-bold text-white shadow-lg shadow-(--bn-blue)/25"
          >
            Login to continue
          </Link>
        </div>
      </MobileShell>
    );
  }

  return <HostListingForm />;
}
