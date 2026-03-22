import { getLocale, getTranslations } from "next-intl/server";
import { BrandLockup } from "@/components/brand-lockup";
import { ExerciseFilterForm } from "@/components/exercise-filter-form";
import { ExerciseLibraryList } from "@/components/exercise-library-list";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { getPublicExerciseCatalog, getShellBootstrap } from "@/lib/data";
import type { AppLocale } from "@/types/domain";

export default async function MarketingExercisesPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = searchParams ? await searchParams : {};
  const q = typeof params?.q === "string" ? params.q : "";
  const equipment = typeof params?.equipment === "string" ? params.equipment : "";
  const level = typeof params?.level === "string" ? params.level : "";
  const muscle = typeof params?.muscle === "string" ? params.muscle : "";

  const locale = (await getLocale()) as AppLocale;
  const [t, ui, catalog, bootstrap] = await Promise.all([
    getTranslations("marketingExercises"),
    getTranslations("exerciseCatalog"),
    getPublicExerciseCatalog({ q, equipment, level, muscle }),
    getShellBootstrap(),
  ]);

  return (
    <main className="min-h-dvh bg-[linear-gradient(180deg,#f7f8fa,#eceff2)]">
      <div className="mx-auto w-full max-w-[400px] px-4 pb-10 pt-4">
        <div className="mb-4 flex items-center justify-between">
          <BrandLockup href="/" markSize={32} wordmarkWidth={146} />
          <LocaleSwitcher />
        </div>

        <section className="rounded-[34px] border border-border bg-background-secondary px-4 pb-5 pt-4 shadow-[0_20px_55px_rgba(17,17,17,0.08)]">
          <div className="mx-auto h-1.5 w-28 rounded-full bg-[rgba(17,17,17,0.08)]" />
          <h1 className="mt-4 font-heading text-[2.35rem] font-semibold leading-[0.95] tracking-[-0.03em] text-foreground">
            {t("title")}
          </h1>
          <p className="mt-2 text-sm leading-6 text-foreground-secondary">{t("subtitle")}</p>

          <div className="mt-4">
            <ExerciseFilterForm
              locale={locale}
              searchValue={q}
              muscleValue={muscle}
              equipmentValue={equipment}
              levelValue={level}
              muscles={bootstrap.muscles}
              equipments={bootstrap.equipments}
              levels={bootstrap.levels}
              dictionary={{
                searchPlaceholder: ui("searchPlaceholder"),
                anyMuscle: ui("anyMuscle"),
                anyEquipment: ui("anyEquipment"),
                anyLevel: ui("anyLevel"),
                apply: ui("apply"),
              }}
            />
          </div>
        </section>

        <div className="mt-4">
          <ExerciseLibraryList
            locale={locale}
            catalog={catalog}
            detailBasePath="/exercises"
            dictionary={{
              emptyTitle: ui("emptyTitle"),
              emptyBody: ui("emptyBody"),
              openDetail: ui("openDetail"),
              resultLabel: ui("resultLabel"),
            }}
          />
        </div>
      </div>
    </main>
  );
}
