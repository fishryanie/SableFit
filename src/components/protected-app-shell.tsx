"use client";

import { usePathname } from "next/navigation";
import { BrandLockup } from "@/components/brand-lockup";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";

type ProtectedAppShellProps = {
  displayName: string;
  children: React.ReactNode;
};

export function ProtectedAppShell({ displayName, children }: ProtectedAppShellProps) {
  const pathname = usePathname();
  const isReviewRoute = pathname.startsWith("/app/review");

  if (!isReviewRoute) {
    return (
      <main className="min-h-dvh bg-[linear-gradient(180deg,#f7f6f3,#ece7dc)]">
        <div className="mx-auto min-h-dvh w-full max-w-[400px] px-4 pb-28 pt-4">
          <header className="mb-4 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <BrandLockup href="/app/today" markSize={28} wordmarkWidth={126} />
              <p className="mt-1 truncate text-xs text-foreground-muted">{displayName}</p>
            </div>
            <LocaleSwitcher />
          </header>

          {children}
        </div>
        <MobileBottomNav />
      </main>
    );
  }

  return <>{children}</>;
}
