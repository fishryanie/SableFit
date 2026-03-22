"use client";

import { BellDot, BookOpenText, CalendarDays, Dumbbell, House, Settings2 } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";

const items = [
  { href: "/app/today", icon: House, key: "today" },
  { href: "/app/sessions", icon: Dumbbell, key: "sessions" },
  { href: "/app/plans", icon: CalendarDays, key: "plans" },
  { href: "/app/library", icon: BookOpenText, key: "library" },
  { href: "/app/inbox", icon: BellDot, key: "inbox" },
  { href: "/app/settings", icon: Settings2, key: "settings" },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const t = useTranslations("shell");

  return (
    <nav
      id="mobile-bottom-nav"
      className="safe-area-inset-bottom fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background-secondary/98 backdrop-blur"
    >
      <div className="mx-auto flex h-[72px] max-w-[400px] items-stretch px-1.5">
        {items.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-w-0 flex-1 flex-col items-center justify-center rounded-[18px] px-1 py-2 transition-colors ${
                active
                  ? "bg-primary-500 text-foreground-inverted"
                  : "text-foreground-muted hover:bg-background-tertiary hover:text-foreground"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="mt-1 w-full truncate text-center text-[10px] font-medium">
                {t(`nav.${item.key}`)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
