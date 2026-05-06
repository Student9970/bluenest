import { House } from "lucide-react";

export function BlueNestLogo({ compact }: { compact?: boolean }) {
  return (
    <div className={`flex items-center gap-2 ${compact ? "" : "flex-col gap-0.5"}`}>
      <div className="flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--bn-blue)]/10">
          <House className="text-[var(--bn-blue)]" size={22} strokeWidth={2.1} />
        </span>
        {!compact && (
          <div className="leading-tight">
            <p className="text-base font-bold tracking-tight text-[var(--bn-blue-dark)]">
              BlueNest
            </p>
            <p className="text-[11px] font-semibold text-[var(--bn-blue)]">
              Homes
            </p>
          </div>
        )}
      </div>
      {!compact && (
        <p className="text-[10px] font-semibold tracking-wide text-[var(--bn-blue)]/90">
          LIVE IN NAVI MUMBAI
        </p>
      )}
    </div>
  );
}
