import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { ExerciseDetailView } from "@/components/exercise-detail-view";
import { requireAuthSession } from "@/lib/auth";
import { getExerciseDetail } from "@/lib/data";
import type { AppLocale } from "@/types/domain";

export const metadata: Metadata = {
  title: "Exercise Detail",
  description: "Preview anatomy media, movement phases, and instructions for a SableFit exercise.",
};

export default async function AppLibraryExerciseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const exercisePromise = params.then(({ slug }) => getExerciseDetail(slug));

  const [, locale, exercise, t] = await Promise.all([
    requireAuthSession(),
    getLocale(),
    exercisePromise,
    getTranslations("exerciseCatalog"),
  ]);

  if (!exercise) {
    notFound();
  }

  return (
    <ExerciseDetailView
      locale={locale as AppLocale}
      exercise={exercise}
      backHref="/app/library"
      dictionary={{
        back: t("backToLibrary"),
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
    />
  );
}
