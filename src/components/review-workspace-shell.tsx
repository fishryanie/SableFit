"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  BookOpenText,
  FolderKanban,
  House,
  LayoutGrid,
  Settings2,
  Sparkles,
  Target,
  Dumbbell,
  Waves,
} from "lucide-react";
import { BrandLockup } from "@/components/brand-lockup";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { ReviewSidebarUser } from "@/components/review-sidebar-user";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
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

function buildReviewHref(section: ReviewSection) {
  return `/app/review?section=${section}`;
}

export function ReviewWorkspaceShell({
  user,
  dictionary,
  children,
}: ReviewWorkspaceShellProps) {
  const isMobile = useIsMobile();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const section = (searchParams.get("section") as ReviewSection | null) ?? "exercises";
  const isUiAudit = pathname.startsWith("/app/review/ui-audit");

  const workspaceItems = [
    { href: "/app/today", label: dictionary.nav.today, icon: House, active: pathname === "/app/today" },
    { href: "/app/library", label: dictionary.nav.library, icon: BookOpenText, active: pathname.startsWith("/app/library") },
    { href: "/app/review", label: dictionary.nav.review, icon: FolderKanban, active: pathname.startsWith("/app/review") },
    { href: "/app/settings", label: dictionary.nav.settings, icon: Settings2, active: pathname.startsWith("/app/settings") },
  ];

  const collectionItems: Array<{ section: ReviewSection; icon: typeof LayoutGrid }> = [
    { section: "exercises", icon: LayoutGrid },
    { section: "muscles", icon: Waves },
    { section: "equipments", icon: Dumbbell },
    { section: "goals", icon: Target },
    { section: "categories", icon: FolderKanban },
  ];

  const pageLabel = isUiAudit ? dictionary.auditAction : dictionary.sections[section];

  return (
    <SidebarProvider
      className="review-neutral-theme"
      style={
        {
          "--sidebar-width": "17rem",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <Sidebar
        collapsible={isMobile ? "offcanvas" : "none"}
        variant="sidebar"
        className="border-r border-sidebar-border/70"
      >
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild size="lg" className="h-14 px-3">
                <Link href="/app/review">
                  <BrandLockup markSize={28} wordmarkWidth={118} />
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>{dictionary.workspaceLabel}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {workspaceItems.map((item) => {
                  const Icon = item.icon;

                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild isActive={item.active} tooltip={item.label}>
                        <Link href={item.href}>
                          <Icon />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>{dictionary.collectionsLabel}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {collectionItems.map((item) => {
                  const Icon = item.icon;
                  const active = !isUiAudit && pathname === "/app/review" && section === item.section;

                  return (
                    <SidebarMenuItem key={item.section}>
                      <SidebarMenuButton asChild isActive={active} tooltip={dictionary.sections[item.section]}>
                        <Link href={buildReviewHref(item.section)}>
                          <Icon />
                          <span>{dictionary.sections[item.section]}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup className="mt-auto">
            <SidebarGroupLabel>{dictionary.toolsLabel}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isUiAudit} tooltip={dictionary.auditAction}>
                    <Link href="/app/review/ui-audit">
                      <Sparkles />
                      <span>{dictionary.auditAction}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarSeparator />

        <SidebarFooter>
          <div className="px-1">
            <ReviewSidebarUser
              user={{
                name: user.displayName,
                detail: user.phoneE164,
              }}
              dictionary={{
                account: dictionary.account,
                billing: dictionary.billing,
                notifications: dictionary.notifications,
                settings: dictionary.nav.settings,
                logout: dictionary.logout,
              }}
            />
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="min-w-0 bg-background">
        <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
          <div className="flex w-full items-center gap-2 px-4 lg:px-6">
            {isMobile ? <SidebarTrigger className="-ml-1" /> : null}
            <Breadcrumb className="hidden md:block">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/app/review">{dictionary.reviewTitle}</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{pageLabel}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <div className="ml-auto flex items-center gap-2">
              <Button asChild variant={isUiAudit ? "default" : "outline"} size="sm">
                <Link href={isUiAudit ? "/app/review" : "/app/review/ui-audit"}>
                  <Sparkles />
                  {isUiAudit ? dictionary.reviewTitle : dictionary.auditAction}
                </Link>
              </Button>
              <LocaleSwitcher />
            </div>
          </div>
        </header>

        <div className="@container/main flex min-h-[calc(100svh-var(--header-height))] flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
