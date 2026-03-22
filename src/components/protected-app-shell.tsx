"use client";

import Link from "next/link";
import { BookOpenText, FolderKanban, House, Settings2 } from "lucide-react";
import { useTranslations } from "next-intl";
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
  const shellT = useTranslations("shell");
  const settingsT = useTranslations("settingsPage");
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

  const navItems = [
    { href: "/app/today", label: shellT("nav.today"), icon: House, active: pathname === "/app/today" },
    { href: "/app/library", label: shellT("nav.library"), icon: BookOpenText, active: pathname.startsWith("/app/library") },
    { href: "/app/review", label: settingsT("reviewTitle"), icon: FolderKanban, active: pathname.startsWith("/app/review") },
    { href: "/app/settings", label: shellT("nav.settings"), icon: Settings2, active: pathname.startsWith("/app/settings") },
  ];

  return (
    <main className="min-h-dvh bg-[linear-gradient(180deg,#f7f6f3,#ece7dc)]">
      <div className="mx-auto flex min-h-dvh w-full max-w-[1640px] gap-6 px-4 py-4 lg:px-6 xl:px-8">
        <aside className="hidden lg:flex lg:w-[290px] lg:shrink-0 lg:flex-col">
          <div className="sticky top-4 flex h-[calc(100dvh-2rem)] flex-col rounded-[34px] border border-border bg-background-secondary p-5 shadow-[0_24px_60px_rgba(17,17,17,0.08)]">
            <div>
              <BrandLockup href="/app/review" markSize={34} wordmarkWidth={146} />
              <div className="mt-5 rounded-[26px] border border-border bg-background p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground-muted">
                  SableFit
                </p>
                <p className="mt-2 text-lg font-semibold text-foreground">{displayName}</p>
                <p className="mt-2 text-sm leading-6 text-foreground-secondary">
                  {settingsT("reviewBody")}
                </p>
              </div>
            </div>

            <nav className="mt-6 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-[22px] px-4 py-3 text-sm font-semibold transition-colors ${
                      item.active
                        ? "bg-foreground text-white"
                        : "bg-background text-foreground-secondary hover:bg-background-tertiary hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-[18px] w-[18px]" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto rounded-[26px] border border-border bg-background p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground-muted">
                    Locale
                  </p>
                  <p className="mt-1 text-sm text-foreground-secondary">{settingsT("reviewAction")}</p>
                </div>
                <LocaleSwitcher />
              </div>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="mb-4 flex items-center justify-between gap-3 rounded-[28px] border border-border bg-background-secondary px-4 py-3 shadow-[0_18px_44px_rgba(17,17,17,0.06)] lg:hidden">
            <div className="min-w-0">
              <BrandLockup href="/app/review" markSize={28} wordmarkWidth={126} />
              <p className="mt-1 truncate text-xs text-foreground-muted">{displayName}</p>
            </div>
            <LocaleSwitcher />
          </header>

          {children}
        </div>
      </div>
    </main>
  );
}
