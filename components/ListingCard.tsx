import { Armchair, BedSingle, MapPin, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import type { Listing } from "@/lib/types";

function formatPrice(listing: Listing) {
  if (listing.type === "daily") {
    return `₹${listing.price.toLocaleString("en-IN")} / DAY`;
  }
  return `₹${listing.price.toLocaleString("en-IN")} / MONTH`;
}

export function ListingCard({ listing }: { listing: Listing }) {
  const typeLabel = listing.type === "rent" ? "RENT" : "DAILY STAY";

  return (
    <Link
      href={`/listing/${listing.id}`}
      className="group block overflow-hidden rounded-[22px] bg-white shadow-[0_8px_30px_rgba(15,23,42,0.08)] ring-1 ring-slate-100 transition-transform active:scale-[0.99]"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <Image
          src={listing.imageUrl}
          alt=""
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          sizes="(max-width: 430px) 100vw, 430px"
          unoptimized={listing.imageUrl.startsWith("data:")}
        />
        <span className="absolute left-3 top-3 rounded-lg bg-[var(--bn-blue)] px-2.5 py-1 text-[10px] font-bold tracking-wide text-white shadow-sm">
          {typeLabel}
        </span>
        <span className="absolute bottom-3 right-3 rounded-xl bg-[var(--bn-blue)] px-3 py-1.5 text-xs font-bold text-white shadow-md">
          {formatPrice(listing)}
        </span>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-4 pt-16">
          <h2 className="text-lg font-bold leading-tight text-white drop-shadow-sm">
            {listing.title}
          </h2>
          <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-medium text-slate-700 backdrop-blur-sm">
            <MapPin className="text-[var(--bn-blue)]" size={12} strokeWidth={2} />
            {listing.area}
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 border-t border-slate-100 px-4 py-3 text-xs text-slate-600">
        <FooterItem icon={<BedSingle size={18} strokeWidth={1.8} />} label="1 BHK" />
        <FooterItem icon={<Armchair size={18} strokeWidth={1.8} />} label="Furnished" />
        <FooterItem icon={<ShieldCheck size={18} strokeWidth={1.8} />} label="24/7 Security" />
      </div>
    </Link>
  );
}

function FooterItem({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="flex flex-1 flex-col items-center gap-1 text-center">
      <span className="text-slate-400">{icon}</span>
      <span className="text-[10px] font-medium leading-tight text-slate-600">
        {label}
      </span>
    </div>
  );
}
