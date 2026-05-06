"use client";

import { Bell, Menu, Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { BlueNestLogo } from "@/components/BlueNestLogo";
import { ListingCard } from "@/components/ListingCard";
import { MobileShell } from "@/components/MobileShell";
import { NAVI_AREAS } from "@/lib/constants";
import { useApp } from "@/context/AppContext";

export function HomeExplore() {
  const { allListings } = useApp();
  const [area, setArea] = useState<(typeof NAVI_AREAS)[number]>("All");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allListings.filter((l) => {
      const areaOk = area === "All" || l.area === area;
      const textOk =
        !q ||
        l.title.toLowerCase().includes(q) ||
        l.area.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q);
      return areaOk && textOk;
    });
  }, [allListings, area, query]);

  return (
    <MobileShell>
      <header className="sticky top-0 z-30 bg-white/90 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur-md">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full text-slate-700 transition-colors hover:bg-slate-100"
            aria-label="Menu"
          >
            <Menu size={22} strokeWidth={2} />
          </button>
          <BlueNestLogo />
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full text-slate-700 transition-colors hover:bg-slate-100"
            aria-label="Notifications"
          >
            <Bell size={22} strokeWidth={1.8} />
          </button>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-4 px-4 pb-28">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--bn-blue-dark)]">
            Find your{" "}
            <span className="text-[var(--bn-blue)]">space.</span>
          </h1>
        </div>

        <div className="relative">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--bn-blue)]">
            <Search size={18} strokeWidth={2} />
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by locality, property or keyword..."
            className="w-full rounded-2xl border border-slate-200/90 bg-white py-3.5 pl-11 pr-12 text-sm text-slate-800 shadow-[0_8px_24px_rgba(15,23,42,0.06)] outline-none ring-0 placeholder:text-slate-400 focus:border-[var(--bn-blue)]/40 focus:ring-2 focus:ring-[var(--bn-blue)]/20"
          />
          <button
            type="button"
            className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-50"
            aria-label="Filters"
          >
            <SlidersHorizontal size={18} strokeWidth={1.9} />
          </button>
        </div>

        <div className="-mx-1 overflow-x-auto pb-1">
          <div className="flex gap-2 px-1">
            {NAVI_AREAS.map((a) => {
              const selected = area === a;
              return (
                <button
                  key={a}
                  type="button"
                  onClick={() => setArea(a)}
                  className={
                    selected
                      ? "shrink-0 rounded-full bg-[var(--bn-blue)] px-4 py-2 text-xs font-semibold text-white shadow-sm"
                      : "shrink-0 rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-[0_2px_12px_rgba(15,23,42,0.06)] ring-1 ring-slate-200/80"
                  }
                >
                  {a}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {filtered.length === 0 ? (
            <p className="rounded-2xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
              No listings match your search. Try another area or keyword.
            </p>
          ) : (
            filtered.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))
          )}
        </div>
      </main>
    </MobileShell>
  );
}
