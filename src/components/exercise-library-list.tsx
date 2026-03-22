import Link from "next/link";
import { ChevronRight, Info } from "lucide-react";
import { ExerciseMediaFigure } from "@/components/exercise-media-figure";
import { getLocalizedText } from "@/lib/localized";
import type { ExerciseCatalogItem } from "@/lib/data";
import type { AppLocale } from "@/types/domain";

type ExerciseLibraryListProps = {
  locale: AppLocale;
  catalog: ExerciseCatalogItem[];
  detailBasePath: string;
  dictionary: {
    emptyTitle: string;
    emptyBody: string;
    openDetail: string;
    resultLabel: string;
  };
};

function buildMetaLine(locale: AppLocale, exercise: ExerciseCatalogItem) {
  const primaryMuscle = exercise.primaryMuscles[0]
    ? getLocalizedText(locale, exercise.primaryMuscles[0].name)
    : "";
  const equipment = exercise.equipment[0] ? getLocalizedText(locale, exercise.equipment[0].name) : "";
  const level = exercise.level ? getLocalizedText(locale, exercise.level.name) : "";

  return [primaryMuscle, equipment, level].filter(Boolean).join(" • ");
}

export function ExerciseLibraryList({
  locale,
  catalog,
  detailBasePath,
  dictionary,
}: ExerciseLibraryListProps) {
  if (!catalog.length) {
    return (
      <section className="rounded-[34px] bg-[#eef0f4] px-4 py-8 shadow-[0_18px_44px_rgba(17,17,17,0.05)]">
        <div className="rounded-[28px] bg-background-secondary p-5 text-center shadow-[0_10px_28px_rgba(17,17,17,0.04)]">
          <p className="font-heading text-xl font-semibold text-foreground">{dictionary.emptyTitle}</p>
          <p className="mt-2 text-sm leading-6 text-foreground-secondary">{dictionary.emptyBody}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-[34px] bg-[#eef0f4] px-3 py-4 shadow-[0_18px_44px_rgba(17,17,17,0.05)]">
      <div className="mb-4 px-2 text-xs font-semibold uppercase tracking-[0.18em] text-foreground-muted">
        {catalog.length} {dictionary.resultLabel}
      </div>

      <div className="space-y-3">
        {catalog.map((exercise) => {
          const href = `${detailBasePath}/${exercise.slug}`;
          const alt = getLocalizedText(locale, exercise.imageAlt, exercise.name.en);

          return (
            <article
              key={exercise.id}
              className="rounded-[30px] bg-background-secondary px-3 py-3 shadow-[0_12px_28px_rgba(17,17,17,0.05)]"
            >
              <div className="flex items-center gap-3">
                <Link href={href} className="flex min-w-0 flex-1 items-center gap-3">
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-[26px] bg-white p-2 shadow-[0_10px_24px_rgba(17,17,17,0.06)]">
                    <ExerciseMediaFigure
                      media={exercise.media}
                      alt={alt}
                      variant="thumb"
                      className="h-full w-full object-contain"
                    />
                  </div>

                  <div className="min-w-0">
                    <h2 className="line-clamp-2 font-heading text-[1.45rem] font-semibold leading-[1.02] text-foreground">
                      {getLocalizedText(locale, exercise.name)}
                    </h2>
                    <p className="mt-2 line-clamp-2 text-xs leading-5 text-foreground-secondary">
                      {buildMetaLine(locale, exercise)}
                    </p>
                  </div>
                </Link>

                <Link
                  href={href}
                  aria-label={dictionary.openDetail}
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-border bg-background text-foreground-secondary"
                >
                  <Info className="h-5 w-5" />
                </Link>
              </div>

              <Link
                href={href}
                className="mt-3 inline-flex items-center gap-1 pl-[6.5rem] text-sm font-semibold text-foreground-secondary"
              >
                {dictionary.openDetail}
                <ChevronRight className="h-4 w-4" />
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
}
