import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { requireAuthSession } from "@/lib/auth";
import { getLibraryData } from "@/lib/data";
import { ExerciseFilterForm } from "@/components/exercise-filter-form";
import { ExerciseLibraryList } from "@/components/exercise-library-list";
import { getLocalizedText } from "@/lib/localized";
import type { AppLocale } from "@/types/domain";

export const metadata: Metadata = {
  title: "Exercise Library",
  description: "Review anatomy-based exercise media and filter by muscle, equipment, level, and movement type.",
};

export default async function LibraryPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireAuthSession();
  const params = searchParams ? await searchParams : {};
  const q = typeof params?.q === "string" ? params.q : "";
  const equipment = typeof params?.equipment === "string" ? params.equipment : "";
  const level = typeof params?.level === "string" ? params.level : "";
  const muscle = typeof params?.muscle === "string" ? params.muscle : "";
  const movementType = typeof params?.movementType === "string" ? params.movementType : "";

  const locale = (await getLocale()) as AppLocale;
  const [t, ui, data] = await Promise.all([
    getTranslations("libraryPage"),
    getTranslations("exerciseCatalog"),
    getLibraryData(session.user.id, { q, equipment, level, muscle, movementType }),
  ]);

  return (
    <div className="space-y-4">
      <section className="rounded-[34px] border border-border bg-background-secondary px-4 pb-5 pt-4 shadow-[0_20px_55px_rgba(17,17,17,0.08)]">
        <div className="mx-auto h-1.5 w-28 rounded-full bg-[rgba(17,17,17,0.08)]" />
        <h1 className="mt-4 font-heading text-[2.35rem] font-semibold leading-[0.95] tracking-[-0.03em] text-foreground">
          {t("title")}
        </h1>
        <p className="mt-2 text-sm leading-6 text-foreground-secondary">{t("subtitle")}</p>

        <div className="mt-4">
          <ExerciseFilterForm
            searchValue={q}
            muscleValue={muscle}
            equipmentValue={equipment}
            levelValue={level}
            movementTypeValue={movementType}
            muscles={data.muscles.map((item) => ({
              value: item.slug,
              label: getLocalizedText(locale, item.name),
            }))}
            equipments={data.equipments.map((item) => ({
              value: item.slug,
              label: getLocalizedText(locale, item.name),
            }))}
            levels={data.levels.map((item) => ({
              value: item.slug,
              label: getLocalizedText(locale, item.name),
            }))}
            movementTypes={[
              { value: "DYNAMIC", label: ui("movementTypes.dynamic") },
              { value: "ISOMETRIC", label: ui("movementTypes.isometric") },
            ]}
            dictionary={{
              searchPlaceholder: ui("searchPlaceholder"),
              anyMuscle: ui("anyMuscle"),
              anyEquipment: ui("anyEquipment"),
              anyLevel: ui("anyLevel"),
              anyMovementType: ui("anyMovementType"),
              apply: ui("apply"),
            }}
          />
        </div>
      </section>

      <ExerciseLibraryList
        locale={locale}
        catalog={data.catalog}
        detailBasePath="/app/library"
        dictionary={{
          emptyTitle: ui("emptyTitle"),
          emptyBody: ui("emptyBody"),
          openDetail: ui("openDetail"),
          resultLabel: ui("resultLabel"),
          movementType: ui("movementType"),
          movementTypes: {
            dynamic: ui("movementTypes.dynamic"),
            isometric: ui("movementTypes.isometric"),
          },
          slowMotion: ui("slowMotion"),
          movementFrames: ui("movementFrames"),
        }}
      />
    </div>
  );
}
