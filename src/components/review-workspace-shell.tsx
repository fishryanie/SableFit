"use client";

import { Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { ReviewAppSidebar } from "@/components/review-app-sidebar";
import { ReviewSiteHeader } from "@/components/review-site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import type { ReviewSection } from "@/lib/data";

type ReviewWorkspaceShellProps = {
  user: {
    displayName: string;
    phoneE164: string;
  };
  dictionary: {
    reviewTitle: string;
    reviewBody: string;
    auditAction: string;
    workspaceLabel: string;
    collectionsLabel: string;
    toolsLabel: string;
    localReviewLabel: string;
    account: string;
    billing: string;
    notifications: string;
    logout: string;
    nav: {
      today: string;
      library: string;
      review: string;
      settings: string;
    };
    sections: Record<ReviewSection, string>;
  };
  children: React.ReactNode;
};

export function ReviewWorkspaceShell({
  user,
  dictionary,
  children,
}: ReviewWorkspaceShellProps) {
  return (
    <Suspense
      fallback={
        <ReviewWorkspaceFrame
          user={user}
          dictionary={dictionary}
          isUiAudit={false}
          pageLabel={dictionary.sections.exercises}
        >
          {children}
        </ReviewWorkspaceFrame>
      }
    >
      <ReviewWorkspaceShellInner user={user} dictionary={dictionary}>
        {children}
      </ReviewWorkspaceShellInner>
    </Suspense>
  );
}

function ReviewWorkspaceShellInner({
  user,
  dictionary,
  children,
}: ReviewWorkspaceShellProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const section = (searchParams.get("section") as ReviewSection | null) ?? "exercises";
  const isUiAudit = pathname.startsWith("/app/review/ui-audit");
  const pageLabel = isUiAudit ? dictionary.auditAction : dictionary.sections[section];

  return (
    <ReviewWorkspaceFrame
      user={user}
      dictionary={dictionary}
      isUiAudit={isUiAudit}
      pageLabel={pageLabel}
    >
      {children}
    </ReviewWorkspaceFrame>
  );
}

function ReviewWorkspaceFrame({
  user,
  dictionary,
  isUiAudit,
  pageLabel,
  children,
}: ReviewWorkspaceShellProps & {
  isUiAudit: boolean;
  pageLabel: string;
}) {
  return (
    <SidebarProvider
      className="review-neutral-theme"
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <ReviewAppSidebar
        variant="inset"
        user={user}
        dictionary={{
          auditAction: dictionary.auditAction,
          workspaceLabel: dictionary.workspaceLabel,
          collectionsLabel: dictionary.collectionsLabel,
          toolsLabel: dictionary.toolsLabel,
          account: dictionary.account,
          billing: dictionary.billing,
          notifications: dictionary.notifications,
          logout: dictionary.logout,
          nav: dictionary.nav,
          sections: dictionary.sections,
        }}
      />
      <SidebarInset>
        <ReviewSiteHeader
          reviewTitle={dictionary.reviewTitle}
          pageLabel={pageLabel}
          auditAction={dictionary.auditAction}
          isUiAudit={isUiAudit}
        />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {children}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
