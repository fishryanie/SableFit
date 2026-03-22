"use client";

import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

type ReviewSiteHeaderProps = {
  reviewTitle: string;
  pageLabel: string;
  auditAction: string;
  isUiAudit: boolean;
};

export function ReviewSiteHeader({
  reviewTitle,
  pageLabel,
  auditAction,
  isUiAudit,
}: ReviewSiteHeaderProps) {
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-base font-medium">
            <Link href="/app/review" className="truncate text-muted-foreground transition-colors hover:text-foreground">
              {reviewTitle}
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="truncate">{pageLabel}</span>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button asChild variant={isUiAudit ? "default" : "outline"} size="sm">
            <Link href={isUiAudit ? "/app/review" : "/app/review/ui-audit"}>
              <Sparkles />
              {isUiAudit ? reviewTitle : auditAction}
            </Link>
          </Button>
          <LocaleSwitcher />
        </div>
      </div>
    </header>
  );
}
