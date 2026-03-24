"use client";

import { BellDot, BookMarked, CalendarRange, Dumbbell, House, Settings2 } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const items = [
  { href: "/app/today", icon: House, key: "today" },
  { href: "/app/sessions", icon: Dumbbell, key: "sessions" },
  { href: "/app/plans", icon: CalendarRange, key: "plans" },
  { href: "/app/library", icon: BookMarked, key: "library" },
  { href: "/app/inbox", icon: BellDot, key: "inbox" },
  { href: "/app/settings", icon: Settings2, key: "settings" },
];

function isActiveRoute(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const t = useTranslations("shell");

  return (
    <nav
      id="mobile-bottom-nav"
      aria-label="Primary mobile navigation"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]"
    >
      <div className="pointer-events-auto relative w-full max-w-[400px] rounded-[2.2rem] border border-black/6 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,243,236,0.97))] px-2.5 pb-3 pt-2.5 shadow-[0_22px_55px_rgba(17,17,17,0.16)] backdrop-blur-xl dark:border-white/8 dark:bg-[linear-gradient(180deg,rgba(28,28,28,0.96),rgba(14,14,14,0.96))] dark:shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
        <div className="absolute inset-x-6 top-2 h-px rounded-full bg-black/6 dark:bg-white/8" />
        <div className="absolute inset-x-1/2 bottom-2 h-1 w-16 -translate-x-1/2 rounded-full bg-black/10 dark:bg-white/12" />
        <div className="flex items-stretch gap-1.5">
          {items.map((item) => {
            const active = isActiveRoute(pathname, item.href);
            const Icon = item.icon;
            const label = t(`nav.${item.key}`);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                aria-label={label}
                title={label}
                className={cn(
                  "group relative flex min-w-0 basis-0 items-center justify-center overflow-hidden rounded-[1.7rem] px-2 py-2 text-neutral-500 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none dark:text-neutral-400",
                  active
                    ? "flex-[2.55_1_0%] bg-[#121212] text-white shadow-[0_18px_34px_rgba(17,17,17,0.24)] dark:bg-[#f4ede3] dark:text-[#111111] dark:shadow-[0_18px_34px_rgba(0,0,0,0.32)]"
                    : "flex-[0.88_1_0%] bg-transparent hover:bg-black/[0.04] hover:text-neutral-900 dark:hover:bg-white/[0.05] dark:hover:text-white",
                )}
              >
                <span
                  className={cn(
                    "absolute inset-x-4 top-1.5 h-8 rounded-full bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.2),transparent_68%)] transition-opacity duration-500 motion-reduce:transition-none",
                    active ? "opacity-100 dark:opacity-30" : "opacity-0",
                  )}
                />
                <span
                  className={cn(
                    "relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
                    active
                      ? "border-white/10 bg-white/10 text-[#f0c98c] dark:border-black/8 dark:bg-black/8 dark:text-[#9f6e26]"
                      : "border-black/6 bg-[#f5f0e7] text-neutral-700 group-hover:bg-white dark:border-white/8 dark:bg-white/6 dark:text-neutral-200 dark:group-hover:bg-white/12",
                  )}
                >
                  <span
                    className={cn(
                      "absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(240,201,140,0.24),transparent_62%)] transition-opacity duration-500 motion-reduce:transition-none",
                      active ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <Icon
                    className={cn(
                      "relative h-[1.1rem] w-[1.1rem] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
                      active ? "-translate-y-0.5 scale-[1.05]" : "scale-100",
                    )}
                  />
                </span>
                <span
                  className={cn(
                    "ml-0 grid min-w-0 grid-cols-[0fr] items-center opacity-0 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
                    active && "ml-2.5 grid-cols-[1fr] opacity-100",
                  )}
                >
                  <span className="truncate text-[0.74rem] font-semibold tracking-[0.01em]">
                    {label}
                  </span>
                </span>
                <span
                  className={cn(
                    "absolute bottom-1 left-1/2 h-1 w-10 -translate-x-1/2 rounded-full bg-[#f0c98c] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none dark:bg-[#9f6e26]",
                    active ? "scale-100 opacity-100" : "scale-0 opacity-0",
                  )}
                />
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
