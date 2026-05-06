import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export function BackButton({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-slate-700 shadow-md ring-1 ring-slate-200/80 backdrop-blur-sm transition-colors hover:bg-white active:scale-95"
      aria-label="Back"
    >
      <ChevronLeft size={20} strokeWidth={2.2} />
    </Link>
  );
}
