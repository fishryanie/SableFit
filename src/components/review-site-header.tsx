"use client";

import { LocaleSwitcher } from "@/components/locale-switcher";
import { ThemeToggle } from "@/components/theme-toggle";

type ReviewSiteHeaderProps = {
  pageLabel: string;
};

export function ReviewSiteHeader({ pageLabel }: ReviewSiteHeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-(--header-height) shrink-0 items-center gap-2 border-b bg-background/90 transition-[width,height] ease-linear">
      <div className="flex w-full items-center gap-1 px-4 md:px-5 lg:gap-2 lg:px-6">
        <h1 className="text-base font-medium">{pageLabel}</h1>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <LocaleSwitcher />
        </div>
      </div>
    </header>
  );
}
