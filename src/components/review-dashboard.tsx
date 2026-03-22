import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  Dumbbell,
  FolderKanban,
  ImageIcon,
  Layers3,
  PlayCircle,
  Search,
  Shapes,
  Target,
} from "lucide-react";
import { getLocalizedText } from "@/lib/localized";
import type {
  ReviewDashboardData,
  ReviewExerciseItem,
  ReviewReferenceItem,
  ReviewSection,
} from "@/lib/data";
import type { AppLocale } from "@/types/domain";

type ReviewDashboardProps = {
  locale: AppLocale;
  data: ReviewDashboardData;
  dictionary: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    noResultsTitle: string;
    noResultsBody: string;
    linkedExercises: string;
    imageReady: string;
    videoReady: string;
    source: string;
    reviewStatus: string;
    level: string;
    focus: string;
    equipment: string;
    goals: string;
    categories: string;
    category: string;
    slugLabel: string;
    records: string;
    page: string;
    previous: string;
    next: string;
    openExercise: string;
    showing: string;
    item: string;
    media: string;
    details: string;
    sections: Record<ReviewSection, string>;
  };
};

function buildReviewHref(section: ReviewSection, q: string, page = 1) {
  const params = new URLSearchParams();

  params.set("section", section);
  if (q.trim()) {
    params.set("q", q.trim());
  }
  if (page > 1) {
    params.set("page", String(page));
  }

  return `/app/review?${params.toString()}`;
}

function detectAssetSource(url?: string) {
  if (!url) {
    return "missing";
  }

  if (url.includes("res.cloudinary.com")) {
    return "cloud";
  }

  if (url.startsWith("/")) {
    return "local";
  }

  return "external";
}

function formatList(locale: AppLocale, values: Array<{ name: { en: string; vi: string } }>, limit = 3) {
  const items = values
    .slice(0, limit)
    .map((value) => getLocalizedText(locale, value.name))
    .filter(Boolean);

  return items.join(", ");
}

function SectionIcon({ section }: { section: ReviewSection }) {
  switch (section) {
    case "exercises":
      return <Dumbbell className="h-4.5 w-4.5" />;
    case "muscles":
      return <CircleDot className="h-4.5 w-4.5" />;
    case "equipments":
      return <Shapes className="h-4.5 w-4.5" />;
    case "goals":
      return <Target className="h-4.5 w-4.5" />;
    case "categories":
      return <Layers3 className="h-4.5 w-4.5" />;
  }
}

function SectionTab({
  section,
  active,
  href,
  label,
  count,
}: {
  section: ReviewSection;
  active: boolean;
  href: string;
  label: string;
  count: number;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition-colors ${
        active
          ? "border-transparent bg-foreground text-white"
          : "border-border bg-background text-foreground-secondary hover:bg-background-tertiary hover:text-foreground"
      }`}
    >
      <SectionIcon section={section} />
      <span>{label}</span>
      <span
        className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
          active ? "bg-white/15 text-white" : "bg-background-secondary text-foreground-muted"
        }`}
      >
        {count}
      </span>
    </Link>
  );
}

function SummaryCard({
  label,
  value,
  meta,
}: {
  label: string;
  value: string;
  meta: string;
}) {
  return (
    <div className="rounded-[24px] border border-border bg-background-secondary p-4 shadow-[0_10px_28px_rgba(17,17,17,0.04)]">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground-muted">{label}</p>
      <p className="mt-3 font-heading text-[1.9rem] font-semibold leading-none text-foreground">{value}</p>
      <p className="mt-2 text-sm leading-6 text-foreground-secondary">{meta}</p>
    </div>
  );
}

function Pagination({
  section,
  q,
  page,
  totalPages,
  dictionary,
}: {
  section: ReviewSection;
  q: string;
  page: number;
  totalPages: number;
  dictionary: ReviewDashboardProps["dictionary"];
}) {
  return (
    <div className="flex items-center gap-2">
      <Link
        href={buildReviewHref(section, q, Math.max(1, page - 1))}
        className={`inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold ${
          page <= 1 ? "pointer-events-none bg-background text-foreground-muted" : "bg-foreground text-white"
        }`}
      >
        <ChevronLeft className="h-4 w-4" />
        {dictionary.previous}
      </Link>

      <div className="rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground">
        {dictionary.page} {page}/{totalPages}
      </div>

      <Link
        href={buildReviewHref(section, q, Math.min(totalPages, page + 1))}
        className={`inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold ${
          page >= totalPages ? "pointer-events-none bg-background text-foreground-muted" : "bg-foreground text-white"
        }`}
      >
        {dictionary.next}
        <ChevronRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

function ExerciseCard({
  locale,
  item,
  dictionary,
}: {
  locale: AppLocale;
  item: ReviewExerciseItem;
  dictionary: ReviewDashboardProps["dictionary"];
}) {
  const name = getLocalizedText(locale, item.name);
  const description = getLocalizedText(locale, item.description);
  const level = item.level ? getLocalizedText(locale, item.level.name) : "";
  const muscles = formatList(locale, item.primaryMuscles, 2);
  const equipment = formatList(locale, item.equipment, 2);
  const goals = formatList(locale, item.goals, 2);
  const categories = formatList(locale, item.categories, 2);
  const imageSource = detectAssetSource(item.imageUrl);

  return (
    <article className="rounded-[28px] border border-border bg-background-secondary p-4 shadow-[0_14px_32px_rgba(17,17,17,0.05)]">
      <div className="flex gap-3">
        <Link
          href={`/app/library/${item.slug}`}
          className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-[22px] bg-white p-2"
        >
          <Image
            src={item.imageUrl}
            alt={name}
            width={240}
            height={240}
            unoptimized
            className="h-full w-full object-contain"
          />
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-background px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground-muted">
              {item.reviewStatus}
            </span>
            <span className="rounded-full bg-background px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground-muted">
              {imageSource}
            </span>
            {item.media.videoUrl ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-foreground px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-white">
                <PlayCircle className="h-3.5 w-3.5" />
                {dictionary.videoReady}
              </span>
            ) : null}
          </div>

          <h3 className="mt-3 line-clamp-2 font-heading text-[1.08rem] font-semibold leading-[1.05] text-foreground">
            {name}
          </h3>
          <p className="mt-1 text-xs text-foreground-muted">{item.slug}</p>
          <p className="mt-2 line-clamp-3 text-sm leading-6 text-foreground-secondary">{description}</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-[18px] bg-background p-3">
          <p className="text-foreground-muted">{dictionary.focus}</p>
          <p className="mt-1 font-semibold text-foreground">{muscles || "—"}</p>
        </div>
        <div className="rounded-[18px] bg-background p-3">
          <p className="text-foreground-muted">{dictionary.level}</p>
          <p className="mt-1 font-semibold text-foreground">{level || "—"}</p>
        </div>
        <div className="rounded-[18px] bg-background p-3">
          <p className="text-foreground-muted">{dictionary.equipment}</p>
          <p className="mt-1 font-semibold text-foreground">{equipment || "—"}</p>
        </div>
        <div className="rounded-[18px] bg-background p-3">
          <p className="text-foreground-muted">{dictionary.goals}</p>
          <p className="mt-1 font-semibold text-foreground">{goals || "—"}</p>
        </div>
      </div>

      <div className="mt-2 rounded-[18px] bg-background p-3 text-xs">
        <p className="text-foreground-muted">{dictionary.categories}</p>
        <p className="mt-1 font-semibold text-foreground">{categories || "—"}</p>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="text-xs text-foreground-muted">
          {dictionary.source}: {item.source}
        </span>
        <Link
          href={`/app/library/${item.slug}`}
          className="inline-flex items-center gap-1 text-sm font-semibold text-foreground"
        >
          {dictionary.openExercise}
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}

function ReferenceCard({
  locale,
  item,
  dictionary,
  showImage,
}: {
  locale: AppLocale;
  item: ReviewReferenceItem;
  dictionary: ReviewDashboardProps["dictionary"];
  showImage: boolean;
}) {
  const name = getLocalizedText(locale, item.name);
  const description = getLocalizedText(locale, item.description);
  const secondaryLabel = item.category ? dictionary.category : dictionary.slugLabel;
  const secondaryValue = item.category ? getLocalizedText(locale, item.category.name) : item.slug;

  return (
    <article className="rounded-[28px] border border-border bg-background-secondary p-4 shadow-[0_14px_32px_rgba(17,17,17,0.05)]">
      <div className="flex gap-3">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-[20px] bg-white p-2">
          {showImage && item.imageUrl ? (
            <Image
              src={item.imageUrl}
              alt={name}
              width={200}
              height={200}
              unoptimized
              className="h-full w-full object-contain"
            />
          ) : (
            <FolderKanban className="h-6 w-6 text-foreground-muted" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 font-heading text-[1.08rem] font-semibold leading-[1.05] text-foreground">
            {name}
          </h3>
          <p className="mt-1 text-xs text-foreground-muted">{item.slug}</p>
          <p className="mt-2 line-clamp-3 text-sm leading-6 text-foreground-secondary">{description}</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-[18px] bg-background p-3">
          <p className="text-foreground-muted">{dictionary.linkedExercises}</p>
          <p className="mt-1 font-semibold text-foreground">{item.linkedExerciseCount}</p>
        </div>
        <div className="rounded-[18px] bg-background p-3">
          <p className="text-foreground-muted">{secondaryLabel}</p>
          <p className="mt-1 font-semibold text-foreground">{secondaryValue || "—"}</p>
        </div>
      </div>
    </article>
  );
}

function ExerciseDesktopRow({
  locale,
  item,
  dictionary,
}: {
  locale: AppLocale;
  item: ReviewExerciseItem;
  dictionary: ReviewDashboardProps["dictionary"];
}) {
  const name = getLocalizedText(locale, item.name);
  const description = getLocalizedText(locale, item.description);
  const level = item.level ? getLocalizedText(locale, item.level.name) : "";
  const muscles = formatList(locale, item.primaryMuscles);
  const equipment = formatList(locale, item.equipment, 2);
  const goals = formatList(locale, item.goals, 2);
  const categories = formatList(locale, item.categories, 2);

  return (
    <tr className="border-t border-border align-top">
      <td className="px-4 py-4">
        <div className="flex min-w-[320px] gap-3">
          <Link
            href={`/app/library/${item.slug}`}
            className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[18px] bg-white p-2"
          >
            <Image
              src={item.imageUrl}
              alt={name}
              width={160}
              height={160}
              unoptimized
              className="h-full w-full object-contain"
            />
          </Link>
          <div className="min-w-0">
            <Link
              href={`/app/library/${item.slug}`}
              className="line-clamp-2 font-semibold text-foreground transition-colors hover:text-foreground-secondary"
            >
              {name}
            </Link>
            <p className="mt-1 text-xs text-foreground-muted">{item.slug}</p>
            <p className="mt-2 line-clamp-2 text-xs leading-5 text-foreground-secondary">{description}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-4">
        <div className="min-w-[180px] space-y-2">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground-muted">
              {dictionary.focus}
            </p>
            <p className="mt-1 text-sm font-semibold text-foreground">{muscles || "—"}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground-muted">
              {dictionary.level}
            </p>
            <p className="mt-1 text-sm text-foreground-secondary">{level || "—"}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-4">
        <div className="min-w-[180px] space-y-2">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground-muted">
              {dictionary.equipment}
            </p>
            <p className="mt-1 text-sm font-medium text-foreground">{equipment || "—"}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground-muted">
              {dictionary.goals}
            </p>
            <p className="mt-1 text-sm text-foreground-secondary">{goals || "—"}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-4">
        <div className="min-w-[180px] space-y-2">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground-muted">
              {dictionary.categories}
            </p>
            <p className="mt-1 text-sm font-medium text-foreground">{categories || "—"}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground-muted">
              {dictionary.reviewStatus}
            </p>
            <p className="mt-1 text-sm text-foreground-secondary">{item.reviewStatus}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-4">
        <div className="min-w-[150px] space-y-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-background px-3 py-1 text-xs font-semibold text-foreground-secondary">
            <ImageIcon className="h-3.5 w-3.5" />
            {detectAssetSource(item.imageUrl)}
          </span>
          <span
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
              item.media.videoUrl ? "bg-foreground text-white" : "bg-background text-foreground-muted"
            }`}
          >
            <PlayCircle className="h-3.5 w-3.5" />
            {item.media.videoUrl ? dictionary.videoReady : `${dictionary.videoReady}: —`}
          </span>
        </div>
      </td>
      <td className="px-4 py-4">
        <div className="min-w-[170px] space-y-2">
          <p className="text-sm font-semibold text-foreground">{item.source}</p>
          <Link
            href={`/app/library/${item.slug}`}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-background-tertiary"
          >
            {dictionary.openExercise}
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </td>
    </tr>
  );
}

function ReferenceDesktopRow({
  locale,
  item,
  showImage,
}: {
  locale: AppLocale;
  item: ReviewReferenceItem;
  showImage: boolean;
}) {
  const name = getLocalizedText(locale, item.name);
  const description = getLocalizedText(locale, item.description);
  const secondaryValue = item.category ? getLocalizedText(locale, item.category.name) : item.slug;

  return (
    <tr className="border-t border-border align-top">
      <td className="px-4 py-4">
        <div className="flex min-w-[280px] gap-3">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[16px] bg-white p-2">
            {showImage && item.imageUrl ? (
              <Image
                src={item.imageUrl}
                alt={name}
                width={140}
                height={140}
                unoptimized
                className="h-full w-full object-contain"
              />
            ) : (
              <FolderKanban className="h-5 w-5 text-foreground-muted" />
            )}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-foreground">{name}</p>
            <p className="mt-1 text-xs text-foreground-muted">{item.slug}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-4 text-sm leading-6 text-foreground-secondary">
        <p className="min-w-[280px]">{description || "—"}</p>
      </td>
      <td className="px-4 py-4 text-sm font-medium text-foreground">{secondaryValue || "—"}</td>
      <td className="px-4 py-4 text-sm font-semibold text-foreground">{item.linkedExerciseCount}</td>
      <td className="px-4 py-4">
        {showImage ? (
          <span className="inline-flex items-center gap-2 rounded-full bg-background px-3 py-1 text-xs font-semibold text-foreground-secondary">
            <ImageIcon className="h-3.5 w-3.5" />
            {detectAssetSource(item.imageUrl)}
          </span>
        ) : (
          <span className="text-xs text-foreground-muted">—</span>
        )}
      </td>
    </tr>
  );
}

export function ReviewDashboard({ locale, data, dictionary }: ReviewDashboardProps) {
  const sectionCounts: Record<ReviewSection, number> = {
    exercises: data.summary.exercises.count,
    muscles: data.summary.muscles.count,
    equipments: data.summary.equipments.count,
    goals: data.summary.goals.count,
    categories: data.summary.categories.count,
  };
  const currentItems =
    data.section === "exercises"
      ? data.exercises.length
      : data.section === "muscles"
        ? data.muscles.length
        : data.section === "equipments"
          ? data.equipments.length
          : data.section === "goals"
            ? data.goals.length
            : data.categories.length;
  const rangeStart = data.total ? (data.page - 1) * data.pageSize + 1 : 0;
  const rangeEnd = data.total ? rangeStart + currentItems - 1 : 0;

  return (
    <div className="space-y-5">
      <section className="rounded-[34px] border border-border bg-background-secondary px-5 py-5 shadow-[0_20px_55px_rgba(17,17,17,0.08)] lg:px-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground-muted">
              {dictionary.sections[data.section]}
            </p>
            <h1 className="mt-3 font-heading text-[2rem] font-semibold leading-[0.92] tracking-[-0.03em] text-foreground lg:text-[2.5rem]">
              {dictionary.title}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-foreground-secondary lg:text-[15px]">
              {dictionary.subtitle}
            </p>
          </div>

          <form className="flex w-full max-w-[620px] flex-col gap-3 sm:flex-row">
            <input type="hidden" name="section" value={data.section} />
            <label className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
              <input
                type="search"
                name="q"
                defaultValue={data.q}
                placeholder={dictionary.searchPlaceholder}
                className="h-14 w-full rounded-full border border-border bg-background pl-11 pr-4 text-sm font-medium text-foreground outline-none placeholder:text-foreground-muted"
              />
            </label>
            <button
              type="submit"
              className="inline-flex h-14 shrink-0 items-center justify-center rounded-full bg-foreground px-5 text-sm font-semibold text-white"
            >
              <Search className="h-4 w-4" />
            </button>
          </form>
        </div>
      </section>

      <section className="rounded-[28px] border border-border bg-background-secondary p-4 shadow-[0_16px_42px_rgba(17,17,17,0.06)]">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            {(Object.keys(dictionary.sections) as ReviewSection[]).map((section) => (
              <SectionTab
                key={section}
                section={section}
                active={data.section === section}
                href={buildReviewHref(section, data.q)}
                label={dictionary.sections[section]}
                count={sectionCounts[section]}
              />
            ))}
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              label={dictionary.showing}
              value={`${rangeStart}-${rangeEnd}`}
              meta={`${data.total} ${dictionary.records}`}
            />
            <SummaryCard
              label={dictionary.imageReady}
              value={
                data.section === "exercises"
                  ? String(data.summary.exercises.withImage)
                  : data.section === "muscles"
                    ? String(data.summary.muscles.withImage)
                    : data.section === "equipments"
                      ? String(data.summary.equipments.withImage)
                      : "—"
              }
              meta={
                data.section === "goals" || data.section === "categories"
                  ? dictionary.details
                  : dictionary.sections[data.section]
              }
            />
            <SummaryCard
              label={dictionary.videoReady}
              value={data.section === "exercises" ? String(data.summary.exercises.withVideo) : "—"}
              meta={dictionary.sections.exercises}
            />
            <div className="rounded-[24px] border border-border bg-background p-4 shadow-[0_10px_28px_rgba(17,17,17,0.04)]">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground-muted">
                {dictionary.page}
              </p>
              <div className="mt-4">
                <Pagination
                  section={data.section}
                  q={data.q}
                  page={data.page}
                  totalPages={data.totalPages}
                  dictionary={dictionary}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {currentItems ? (
        <>
          <div className="space-y-3 lg:hidden">
            {data.section === "exercises"
              ? data.exercises.map((item) => (
                  <ExerciseCard key={item.id} locale={locale} item={item} dictionary={dictionary} />
                ))
              : data.section === "muscles"
                ? data.muscles.map((item) => (
                    <ReferenceCard
                      key={item.id}
                      locale={locale}
                      item={item}
                      dictionary={dictionary}
                      showImage
                    />
                  ))
                : data.section === "equipments"
                  ? data.equipments.map((item) => (
                      <ReferenceCard
                        key={item.id}
                        locale={locale}
                        item={item}
                        dictionary={dictionary}
                        showImage
                      />
                    ))
                  : data.section === "goals"
                    ? data.goals.map((item) => (
                        <ReferenceCard
                          key={item.id}
                          locale={locale}
                          item={item}
                          dictionary={dictionary}
                          showImage={false}
                        />
                      ))
                    : data.categories.map((item) => (
                        <ReferenceCard
                          key={item.id}
                          locale={locale}
                          item={item}
                          dictionary={dictionary}
                          showImage={false}
                        />
                      ))}
          </div>

          <section className="hidden overflow-hidden rounded-[30px] border border-border bg-background-secondary shadow-[0_18px_44px_rgba(17,17,17,0.05)] lg:block">
            <div className="overflow-x-auto">
              {data.section === "exercises" ? (
                <table className="w-full min-w-[1080px] text-left">
                  <thead className="bg-[#eef0f4] text-xs font-semibold uppercase tracking-[0.14em] text-foreground-muted">
                    <tr>
                      <th className="px-4 py-4">{dictionary.item}</th>
                      <th className="px-4 py-4">{dictionary.focus}</th>
                      <th className="px-4 py-4">{dictionary.equipment}</th>
                      <th className="px-4 py-4">{dictionary.categories}</th>
                      <th className="px-4 py-4">{dictionary.media}</th>
                      <th className="px-4 py-4">{dictionary.source}</th>
                    </tr>
                  </thead>
                  <tbody className="bg-background-secondary">
                    {data.exercises.map((item) => (
                      <ExerciseDesktopRow key={item.id} locale={locale} item={item} dictionary={dictionary} />
                    ))}
                  </tbody>
                </table>
              ) : (
                <table className="w-full min-w-[920px] text-left">
                  <thead className="bg-[#eef0f4] text-xs font-semibold uppercase tracking-[0.14em] text-foreground-muted">
                    <tr>
                      <th className="px-4 py-4">{dictionary.item}</th>
                      <th className="px-4 py-4">{dictionary.details}</th>
                      <th className="px-4 py-4">{dictionary.category}</th>
                      <th className="px-4 py-4">{dictionary.linkedExercises}</th>
                      <th className="px-4 py-4">{dictionary.media}</th>
                    </tr>
                  </thead>
                  <tbody className="bg-background-secondary">
                    {(data.section === "muscles"
                      ? data.muscles
                      : data.section === "equipments"
                        ? data.equipments
                        : data.section === "goals"
                          ? data.goals
                          : data.categories
                    ).map((item) => (
                      <ReferenceDesktopRow
                        key={item.id}
                        locale={locale}
                        item={item}
                        showImage={data.section === "muscles" || data.section === "equipments"}
                      />
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        </>
      ) : (
        <div className="rounded-[28px] border border-border bg-background-secondary p-5 text-center shadow-[0_10px_28px_rgba(17,17,17,0.04)]">
          <p className="font-heading text-xl font-semibold text-foreground">{dictionary.noResultsTitle}</p>
          <p className="mt-2 text-sm leading-6 text-foreground-secondary">{dictionary.noResultsBody}</p>
        </div>
      )}
    </div>
  );
}
