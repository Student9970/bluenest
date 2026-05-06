"use client";

import { Home, PlusSquare, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "EXPLORE", icon: Home },
  { href: "/host", label: "HOST", icon: PlusSquare },
  { href: "/profile", label: "YOU", icon: User },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const onLogin = pathname.startsWith("/login");

  if (onLogin) return null;

  return (
    <nav
      className="fixed bottom-0 left-1/2 z-40 flex w-full max-w-[430px] -translate-x-1/2 border-t border-slate-200/80 bg-white/95 px-6 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-md"
      aria-label="Main"
    >
      {items.map(({ href, label, icon: Icon }) => {
        const active =
          href === "/"
            ? pathname === "/"
            : pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            className="flex flex-1 flex-col items-center gap-1 py-2 text-[10px] font-semibold tracking-wide text-slate-400 transition-colors"
          >
            <span
              className={
                active
                  ? "text-[var(--bn-blue)]"
                  : "text-slate-400 group-hover:text-slate-600"
              }
            >
              <Icon size={22} strokeWidth={1.9} className={active ? "scale-105" : undefined} />
            </span>
            <span
              className={active ? "text-[var(--bn-blue-dark)]" : undefined}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
