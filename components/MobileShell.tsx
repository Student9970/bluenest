import type { ReactNode } from "react";

export function MobileShell({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bn-surface relative mx-auto flex min-h-dvh w-full max-w-[430px] flex-col shadow-[0_0_0_1px_rgba(15,23,42,0.06)] ${className}`}
    >
      {children}
    </div>
  );
}
