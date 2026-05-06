"use client";

import { ArrowRight, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { BackButton } from "@/components/BackButton";
import { MobileShell } from "@/components/MobileShell";
import { useApp } from "@/context/AppContext";

export function ListingDetail({ id }: { id: string }) {
  const { allListings, isLoggedIn } = useApp();
  const listing = useMemo(
    () => allListings.find((l) => l.id === id),
    [allListings, id],
  );
  const [showLoginHint, setShowLoginHint] = useState(false);

  if (!listing) {
    return (
      <MobileShell className="items-center justify-center px-6 pb-28 text-center">
        <p className="text-slate-600">This listing is no longer available.</p>
        <Link
          href="/"
          className="mt-4 text-sm font-semibold text-[var(--bn-blue)]"
        >
          Back to explore
        </Link>
      </MobileShell>
    );
  }

  const priceLabel =
    listing.type === "rent"
      ? `₹${listing.price.toLocaleString("en-IN")} / month`
      : `₹${listing.price.toLocaleString("en-IN")} / day`;

  const typeLabel = listing.type === "rent" ? "Rent (monthly)" : "Daily stay";
  const ownerPhone = listing.ownerPhone;

  function handleCall() {
    if (!isLoggedIn) {
      setShowLoginHint(true);
      return;
    }
    window.location.href = `tel:${ownerPhone.replace(/\s/g, "")}`;
  }

  return (
    <MobileShell>
      <div className="relative">
        <div className="absolute left-4 top-[max(0.75rem,env(safe-area-inset-top))] z-10">
          <BackButton href="/" />
        </div>
        <div className="relative aspect-[4/3] w-full">
          <Image
            src={listing.imageUrl}
            alt=""
            fill
            className="object-cover"
            priority
            sizes="430px"
            unoptimized={listing.imageUrl.startsWith("data:")}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/25" />
          <div className="absolute bottom-0 left-0 right-0 p-5 pb-8">
            <span className="inline-block rounded-lg bg-[var(--bn-blue)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
              {listing.type === "rent" ? "Rent" : "Daily stay"}
            </span>
            <h1 className="mt-2 text-2xl font-bold text-white drop-shadow-md">
              {listing.title}
            </h1>
            <p className="mt-1 flex items-center gap-1 text-sm font-medium text-white/95">
              <MapPin size={14} strokeWidth={2} />
              {listing.area}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-5 rounded-t-[28px] bg-white px-5 pb-28 pt-6 shadow-[0_-12px_40px_rgba(15,23,42,0.08)] -mt-6 relative z-[1]">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Price
            </p>
            <p className="text-2xl font-bold text-[var(--bn-blue-dark)]">
              {priceLabel}
            </p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-[var(--bn-blue-dark)]">
            {typeLabel}
          </span>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
            About
          </p>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            {listing.description}
          </p>
        </div>

        {showLoginHint && (
          <div className="rounded-xl bg-amber-50 px-3 py-3 text-sm text-amber-950 ring-1 ring-amber-100">
            <p>Continue with Google to call the owner.</p>
            <Link
              href={`/login?return=${encodeURIComponent(`/listing/${listing.id}`)}`}
              className="mt-2 inline-flex font-semibold text-[var(--bn-blue)]"
            >
              Continue to login
            </Link>
          </div>
        )}

        <button
          type="button"
          onClick={handleCall}
          className="mt-auto flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--bn-blue)] py-4 text-base font-bold text-white shadow-lg shadow-[var(--bn-blue)]/25 transition-transform active:scale-[0.99]"
        >
          Call owner
          <ArrowRight size={18} strokeWidth={2.2} />
        </button>
      </div>
    </MobileShell>
  );
}
