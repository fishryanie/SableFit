"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  BookOpenText,
  Dumbbell,
  FolderKanban,
  House,
  LayoutGrid,
  Settings2,
  Sparkles,
  Target,
  Waves,
} from "lucide-react";
import { BrandLockup } from "@/components/brand-lockup";
import { ReviewSidebarUser } from "@/components/review-sidebar-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import type { ReviewSection } from "@/lib/data";

type ReviewAppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  user: {
    displayName: string;
    phoneE164: string;
  };
  dictionary: {
    workspaceLabel: string;
    collectionsLabel: string;
    toolsLabel: string;
    account: string;
    billing: string;
    notifications: string;
    logout: string;
    auditAction: string;
    nav: {
      today: string;
      library: string;
      review: string;
      settings: string;
    };
    sections: Record<ReviewSection, string>;
  };
};

function buildReviewHref(section: ReviewSection) {
  return `/app/review?section=${section}`;
}

export function ReviewAppSidebar({
  user,
  dictionary,
  ...props
}: ReviewAppSidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeSection = (searchParams.get("section") as ReviewSection | null) ?? "exercises";
  const isUiAudit = pathname.startsWith("/app/review/ui-audit");

  const workspaceItems = [
    { href: "/app/today", label: dictionary.nav.today, icon: House },
    { href: "/app/library", label: dictionary.nav.library, icon: BookOpenText },
    { href: "/app/review", label: dictionary.nav.review, icon: FolderKanban },
    { href: "/app/settings", label: dictionary.nav.settings, icon: Settings2 },
  ];

  const collectionItems: Array<{ section: ReviewSection; icon: typeof LayoutGrid }> = [
    { section: "exercises", icon: LayoutGrid },
    { section: "muscles", icon: Waves },
    { section: "equipments", icon: Dumbbell },
    { section: "goals", icon: Target },
    { section: "categories", icon: FolderKanban },
  ];

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:p-1.5!">
              <Link href="/app/review">
                <BrandLockup markSize={26} wordmarkWidth={116} />
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
                const isActive =
                  item.href === "/app/review"
                    ? pathname.startsWith("/app/review")
                    : pathname === item.href || pathname.startsWith(`${item.href}/`);

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
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
                const isActive = !isUiAudit && pathname === "/app/review" && activeSection === item.section;

                return (
                  <SidebarMenuItem key={item.section}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={dictionary.sections[item.section]}>
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

      <SidebarFooter>
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
      </SidebarFooter>
    </Sidebar>
  );
}
