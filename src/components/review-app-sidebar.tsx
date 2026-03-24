"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  BookOpenText,
  Dumbbell,
  FolderKanban,
  House,
  LayoutGrid,
  Settings2,
  Target,
  Waves,
} from "lucide-react";
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
  const activeSection =
    (searchParams.get("section") as ReviewSection | null) ?? "exercises";

  const workspaceItems = [
    { href: "/app/today", label: dictionary.nav.today, icon: House },
    { href: "/app/library", label: dictionary.nav.library, icon: BookOpenText },
    { href: "/app/review", label: dictionary.nav.review, icon: FolderKanban },
    { href: "/app/settings", label: dictionary.nav.settings, icon: Settings2 },
  ];

  const collectionItems: Array<{
    section: ReviewSection;
    icon: typeof LayoutGrid;
  }> = [
    { section: "exercises", icon: LayoutGrid },
    { section: "muscles", icon: Waves },
    { section: "equipments", icon: Dumbbell },
    { section: "goals", icon: Target },
    { section: "categories", icon: FolderKanban },
  ];

  return (
    <Sidebar
      className="sticky top-0 h-screen max-h-screen self-start overflow-hidden border-r"
      {...props}
    >
      <SidebarHeader className="h-(--header-height) flex-row items-center gap-0 border-b p-0 px-4">
        <Link href="/app/review" className="inline-flex items-center">
          <Image
            src="/brand/sablefit-wordmark.svg"
            alt="SableFit"
            width={148}
            height={37}
            unoptimized
            className="block h-auto w-[148px] max-w-full shrink-0"
          />
        </Link>
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
                    : pathname === item.href ||
                      pathname.startsWith(`${item.href}/`);

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.label}
                    >
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
                const isActive =
                  pathname === "/app/review" &&
                  activeSection === item.section;

                return (
                  <SidebarMenuItem key={item.section}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={dictionary.sections[item.section]}
                    >
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
