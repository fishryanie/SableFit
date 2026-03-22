import type { ComponentType } from "react";
import Link from "next/link";
import { ArrowLeft, CircleDot, Dumbbell, Flame, Layers3, PlayCircle, Sparkles } from "lucide-react";
import { ExerciseMediaFigure } from "@/components/exercise-media-figure";
import { getLocalizedText } from "@/lib/localized";
import type { ExerciseDetail } from "@/lib/data";
import type { AppLocale } from "@/types/domain";

type ExerciseDetailViewProps = {
  locale: AppLocale;
  exercise: ExerciseDetail;
  backHref: string;
  dictionary: {
    back: string;
    chart: string;
    history: string;
    howTo: string;
    focus: string;
    equipment: string;
    goals: string;
    categories: string;
    level: string;
    source: string;
    movementFrames: string;
    slowMotion: string;
    openApp?: string;
    signIn?: string;
  };
  footerCta?: {
    href: string;
    label: string;
  };
};

function Chip({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[24px] bg-background-secondary px-4 py-3 shadow-[0_10px_26px_rgba(17,17,17,0.04)]">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-foreground-muted">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <p className="mt-2 text-sm font-semibold leading-6 text-foreground">{value}</p>
    </div>
  );
}

function StepCard({
  order,
  body,
}: {
  order: number;
  body: string;
}) {
  return (
    <article className="rounded-[30px] bg-background-secondary p-5 shadow-[0_12px_30px_rgba(17,17,17,0.04)]">
      <div className="flex gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] bg-background text-[1.8rem] font-semibold text-foreground-muted">
          {order}
        </div>
        <p className="text-[1.05rem] leading-9 text-foreground">{body}</p>
      </div>
    </article>
  );
}

export function ExerciseDetailView({
  locale,
  exercise,
  backHref,
  dictionary,
  footerCta,
}: ExerciseDetailViewProps) {
  const name = getLocalizedText(locale, exercise.name);
  const description = getLocalizedText(locale, exercise.description);
  const imageAlt = getLocalizedText(locale, exercise.imageAlt, name);
  const primaryMuscles = exercise.primaryMuscles.map((item) => getLocalizedText(locale, item.name)).join(", ");
  const equipment = exercise.equipment.map((item) => getLocalizedText(locale, item.name)).join(", ");
  const goals = exercise.goals.map((item) => getLocalizedText(locale, item.name)).join(", ");
  const categories = exercise.categories.map((item) => getLocalizedText(locale, item.name)).join(", ");
  const level = exercise.level ? getLocalizedText(locale, exercise.level.name) : "";
  const keyframes = exercise.media.keyframes.slice(0, 2);
  const motionClassName = exercise.media.videoUrl
    ? "aspect-[9/16] mx-auto w-full max-w-[250px] object-contain"
    : "aspect-[4/3] w-full object-contain";

  return (
    <main className="min-h-dvh bg-[linear-gradient(180deg,#f6f7f8,#e9ebef)]">
      <div className="mx-auto w-full max-w-[400px] px-3 pb-8 pt-4">
        <section className="rounded-[38px] bg-[#eef0f4] px-4 pb-5 pt-3 shadow-[0_22px_55px_rgba(17,17,17,0.08)]">
          <div className="mx-auto h-1.5 w-28 rounded-full bg-[rgba(17,17,17,0.08)]" />

          <div className="mt-4">
            <Link
              href={backHref}
              className="inline-flex items-center gap-2 rounded-full bg-background-secondary px-3 py-2 text-sm font-semibold text-foreground shadow-[0_10px_24px_rgba(17,17,17,0.04)]"
            >
              <ArrowLeft className="h-4 w-4" />
              {dictionary.back}
            </Link>
          </div>

          <div className="mt-5 flex items-center justify-center gap-8 text-sm font-semibold">
            <span className="text-foreground-muted">{dictionary.chart}</span>
            <span className="text-foreground-muted">{dictionary.history}</span>
            <span className="text-foreground">{dictionary.howTo}</span>
          </div>

          <h1 className="mt-6 font-heading text-[3.25rem] font-semibold leading-[0.92] tracking-[-0.04em] text-foreground">
            {name}
          </h1>
          <p className="mt-3 text-sm leading-6 text-foreground-secondary">{description}</p>

          <div className="mt-5 rounded-[34px] bg-background-secondary p-4 shadow-[0_12px_30px_rgba(17,17,17,0.04)]">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
              <PlayCircle className="h-5 w-5" />
              {dictionary.slowMotion}
            </div>
            <div className="overflow-hidden rounded-[28px] bg-white p-3">
              <ExerciseMediaFigure
                media={exercise.media}
                alt={imageAlt}
                variant="motion"
                priority
                className={motionClassName}
              />
            </div>
          </div>

          <div className="mt-4 rounded-[30px] bg-background-secondary p-4 shadow-[0_12px_30px_rgba(17,17,17,0.04)]">
            <div className="mb-3 text-sm font-semibold text-foreground">{dictionary.movementFrames}</div>
            <div className="grid grid-cols-2 gap-3">
              {keyframes.map((frame) => (
                <div key={`${exercise.id}-frame-${frame.order}`} className="rounded-[24px] bg-background p-3">
                  <div className="overflow-hidden rounded-[20px] bg-white p-2">
                    <ExerciseMediaFigure
                      src={frame.url}
                      alt={`${imageAlt} ${getLocalizedText(locale, frame.label)}`}
                      variant="frame"
                      className="aspect-square w-full object-contain"
                    />
                  </div>
                  <p className="mt-3 text-center text-sm font-semibold text-foreground">
                    {getLocalizedText(locale, frame.label)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <Chip icon={CircleDot} label={dictionary.focus} value={primaryMuscles || "—"} />
            <Chip icon={Dumbbell} label={dictionary.equipment} value={equipment || "—"} />
            <Chip icon={Flame} label={dictionary.goals} value={goals || "—"} />
            <Chip icon={Layers3} label={dictionary.categories} value={categories || level || "—"} />
          </div>

          {level ? (
            <div className="mt-3 rounded-[24px] bg-background-secondary px-4 py-3 text-sm font-semibold text-foreground shadow-[0_10px_26px_rgba(17,17,17,0.04)]">
              <span className="text-xs uppercase tracking-[0.16em] text-foreground-muted">{dictionary.level}</span>
              <p className="mt-2">{level}</p>
            </div>
          ) : null}

          <div className="mt-5 space-y-4">
            {exercise.instructionSteps.map((step, index) => (
              <StepCard key={`${exercise.id}-${index}`} order={index + 1} body={getLocalizedText(locale, step)} />
            ))}
          </div>

          {exercise.sourceUrl ? (
            <div className="mt-4 flex items-center gap-2 text-xs text-foreground-muted">
              <Sparkles className="h-4 w-4" />
              <span>{dictionary.source}:</span>
              <a
                href={exercise.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-foreground-secondary"
              >
                {exercise.source}
              </a>
            </div>
          ) : null}

          {footerCta ? (
            <Link
              href={footerCta.href}
              className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary-500 px-4 text-sm font-semibold text-foreground-inverted"
            >
              {footerCta.label}
            </Link>
          ) : null}
        </section>
      </div>
    </main>
  );
}
