import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { ExerciseDetailView } from "@/components/exercise-detail-view";
import { getExerciseDetail } from "@/lib/data";
import type { AppLocale } from "@/types/domain";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const exercise = await getExerciseDetail(slug);

  if (!exercise) {
    return {};
  }

  return {
    title: `${exercise.name.en} | SableFit`,
    description: exercise.description.en,
  };
}

export default async function MarketingExerciseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [locale, exercise, t, common] = await Promise.all([
    getLocale(),
    getExerciseDetail(slug),
    getTranslations("exerciseCatalog"),
    getTranslations("common"),
  ]);

  if (!exercise) {
    notFound();
  }
  return (
    <ExerciseDetailView
      locale={locale as AppLocale}
      exercise={exercise}
      backHref="/exercises"
      dictionary={{
        back: t("backToExercises"),
        chart: t("chart"),
        history: t("history"),
        howTo: t("howTo"),
        focus: t("focus"),
        equipment: t("equipment"),
        goals: t("goals"),
        categories: t("categories"),
        level: t("level"),
        source: t("source"),
        movementFrames: t("movementFrames"),
        slowMotion: t("slowMotion"),
        movementType: t("movementType"),
        movementTypes: {
          dynamic: t("movementTypes.dynamic"),
          isometric: t("movementTypes.isometric"),
        },
      }}
      footerCta={{
        href: "/auth/phone",
        label: common("signIn"),
      }}
    />
  );
}
