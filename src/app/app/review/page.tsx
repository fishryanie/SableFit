import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { ReviewDashboard } from "@/components/review-dashboard";
import { requireAuthSession } from "@/lib/auth";
import { getReviewDashboardData, reviewSections, type ReviewSection } from "@/lib/data";
import type { AppLocale } from "@/types/domain";

function parseSection(value: string | string[] | undefined): ReviewSection {
  return typeof value === "string" && reviewSections.includes(value as ReviewSection)
    ? (value as ReviewSection)
    : "exercises";
}

function parsePage(value: string | string[] | undefined) {
  const page = typeof value === "string" ? Number.parseInt(value, 10) : 1;

  return Number.isFinite(page) && page > 0 ? page : 1;
}

export default async function ReviewPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAuthSession();

  const params = searchParams ? await searchParams : {};
  const section = parseSection(params?.section);
  const q = typeof params?.q === "string" ? params.q : "";
  const page = parsePage(params?.page);
  const locale = (await getLocale()) as AppLocale;

  const [t, data] = await Promise.all([
    getTranslations("reviewPage"),
    getReviewDashboardData({ section, q, page }),
  ]);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Link
          href="/app/review/ui-audit"
          className="inline-flex items-center gap-2 rounded-full border border-border bg-background-secondary px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-background"
        >
          {t("auditAction")}
        </Link>
      </div>

      <ReviewDashboard
        locale={locale}
        data={data}
        dictionary={{
          title: t("title"),
          subtitle: t("subtitle"),
          searchPlaceholder: t("searchPlaceholder"),
          noResultsTitle: t("noResultsTitle"),
          noResultsBody: t("noResultsBody"),
          linkedExercises: t("linkedExercises"),
          imageReady: t("imageReady"),
          videoReady: t("videoReady"),
          source: t("source"),
          reviewStatus: t("reviewStatus"),
          level: t("level"),
          focus: t("focus"),
          equipment: t("equipment"),
          goals: t("goals"),
          categories: t("categories"),
          category: t("category"),
          slugLabel: t("slugLabel"),
          records: t("records"),
          page: t("page"),
          previous: t("previous"),
          next: t("next"),
          openExercise: t("openExercise"),
          showing: t("showing"),
          item: t("item"),
          media: t("media"),
          details: t("details"),
          sections: {
            exercises: t("sections.exercises"),
            muscles: t("sections.muscles"),
            equipments: t("sections.equipments"),
            goals: t("sections.goals"),
            categories: t("sections.categories"),
          },
        }}
      />
    </div>
  );
}
