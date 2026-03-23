import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { ReviewDashboard } from "@/components/review-dashboard";
import { getLocalizedText } from "@/lib/localized";
import {
  getReviewDashboardData,
  getShellBootstrap,
  reviewSections,
  type ReviewExerciseFilters,
  type ReviewSection,
} from "@/lib/data";
import type { AppLocale } from "@/types/domain";

export const metadata: Metadata = {
  title: "Data Review",
  description: "Desktop review dashboard for exercises, muscles, equipments, goals, and categories.",
};

function parseSection(value: string | string[] | undefined): ReviewSection {
  return typeof value === "string" && reviewSections.includes(value as ReviewSection)
    ? (value as ReviewSection)
    : "exercises";
}

function parsePage(value: string | string[] | undefined) {
  const page = typeof value === "string" ? Number.parseInt(value, 10) : 1;

  return Number.isFinite(page) && page > 0 ? page : 1;
}

function parseFilter(value: string | string[] | undefined) {
  return typeof value === "string" ? value : "";
}

export default async function ReviewPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = searchParams ? await searchParams : {};
  const section = parseSection(params?.section);
  const q = typeof params?.q === "string" ? params.q : "";
  const page = parsePage(params?.page);
  const locale = (await getLocale()) as AppLocale;
  const filters: ReviewExerciseFilters = {
    level: parseFilter(params?.level),
    muscle: parseFilter(params?.muscle),
    muscleCategory: parseFilter(params?.muscleCategory),
    equipment: parseFilter(params?.equipment),
    goal: parseFilter(params?.goal),
    category: parseFilter(params?.category),
    movementType: parseFilter(params?.movementType),
  };

  const [t, data, bootstrap] = await Promise.all([
    getTranslations("reviewPage"),
    getReviewDashboardData({ section, q, page, filters }),
    getShellBootstrap(),
  ]);

  return (
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
        totalRecords: t("totalRecords"),
        item: t("item"),
        media: t("media"),
        details: t("details"),
        filtersTitle: t("filtersTitle"),
        muscleCategoryFilter: t("muscleCategoryFilter"),
        applyFilters: t("applyFilters"),
        activeFilters: t("activeFilters"),
        resetFilters: t("resetFilters"),
        slowMotion: t("slowMotion"),
        movementFrames: t("movementFrames"),
        gifReady: t("gifReady"),
        allLevels: t("allLevels"),
        allMovementTypes: t("allMovementTypes"),
        allMuscleCategories: t("allMuscleCategories"),
        allMuscles: t("allMuscles"),
        allEquipments: t("allEquipments"),
        allGoals: t("allGoals"),
        allCategories: t("allCategories"),
        movementType: t("movementType"),
        movementTypeDynamicHelp: t("movementTypeDynamicHelp"),
        movementTypeIsometricHelp: t("movementTypeIsometricHelp"),
        movementTypes: {
          dynamic: t("movementTypes.dynamic"),
          isometric: t("movementTypes.isometric"),
        },
        sections: {
          exercises: t("sections.exercises"),
          muscles: t("sections.muscles"),
          equipments: t("sections.equipments"),
          goals: t("sections.goals"),
          categories: t("sections.categories"),
        },
      }}
      filterState={filters}
      filterOptions={{
        movementTypes: [
          { slug: "DYNAMIC", label: t("movementTypes.dynamic") },
          { slug: "ISOMETRIC", label: t("movementTypes.isometric") },
        ],
        levels: bootstrap.levels.map((item) => ({
          slug: item.slug,
          label: getLocalizedText(locale, item.name),
        })),
        muscles: bootstrap.muscles.map((item) => ({
          slug: item.slug,
          label: getLocalizedText(locale, item.name),
        })),
        muscleCategories: bootstrap.muscleCategories.map((item) => ({
          slug: item.slug,
          label: getLocalizedText(locale, item.name),
        })),
        equipments: bootstrap.equipments.map((item) => ({
          slug: item.slug,
          label: getLocalizedText(locale, item.name),
        })),
        goals: bootstrap.goals.map((item) => ({
          slug: item.slug,
          label: getLocalizedText(locale, item.name),
        })),
        categories: bootstrap.categories.map((item) => ({
          slug: item.slug,
          label: getLocalizedText(locale, item.name),
        })),
      }}
    />
  );
}
