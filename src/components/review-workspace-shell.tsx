"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
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
    workspaceLabel: string;
    collectionsLabel: string;
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
  const searchParams = useSearchParams();
  const section = (searchParams.get("section") as ReviewSection | null) ?? "exercises";
  const pageLabel = dictionary.sections[section];

  return (
    <ReviewWorkspaceFrame
      user={user}
      dictionary={dictionary}
      pageLabel={pageLabel}
    >
      {children}
    </ReviewWorkspaceFrame>
  );
}

function ReviewWorkspaceFrame({
  user,
  dictionary,
  pageLabel,
  children,
}: ReviewWorkspaceShellProps & {
  pageLabel: string;
}) {
  return (
    <SidebarProvider
      className="review-neutral-theme fixed inset-0 overflow-hidden"
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 64)",
          "--header-height": "calc(var(--spacing) * 12 + 1px)",
        } as React.CSSProperties
      }
    >
      <ReviewAppSidebar
        variant="sidebar"
        collapsible="none"
        user={user}
        dictionary={{
          workspaceLabel: dictionary.workspaceLabel,
          collectionsLabel: dictionary.collectionsLabel,
          account: dictionary.account,
          billing: dictionary.billing,
          notifications: dictionary.notifications,
          logout: dictionary.logout,
          nav: dictionary.nav,
          sections: dictionary.sections,
        }}
      />
      <SidebarInset className="h-full min-h-0 w-auto min-w-0 overflow-hidden">
        <ReviewSiteHeader pageLabel={pageLabel} />
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="@container/main flex min-h-0 flex-1 flex-col overflow-y-auto">
            <div className="flex flex-col gap-4 px-4 py-4 md:gap-6 md:px-5 md:py-6 lg:px-6">
              {children}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
