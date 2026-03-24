"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Activity,
  BarChart3,
  FolderKanban,
  Images,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Dumbbell,
  ImageIcon,
  Layers3,
  PlayCircle,
  Search,
  Target,
} from "lucide-react";
import {
  startTransition,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";
import type {
  ReviewDashboardData,
  ReviewDashboardSnapshot,
  ReviewExerciseFilters,
  ReviewExerciseItem,
  ReviewReferenceItem,
  ReviewSection,
} from "@/lib/data";
import { ExerciseThumbnailPreview } from "@/components/exercise-media-preview-sheet";
import { getLocalizedText } from "@/lib/localized";
import { cn } from "@/lib/utils";
import type { AppLocale } from "@/types/domain";
import { ReviewExerciseFilterBar } from "@/components/review-exercise-filter-bar";
import { ReviewSectionTabs } from "@/components/review-section-tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type ReviewDashboardProps = {
  locale: AppLocale;
  snapshot: ReviewDashboardSnapshot;
  initialState: {
    section: ReviewSection;
    q: string;
    page: number;
    filters: ReviewExerciseFilters;
  };
  filterOptions: {
    movementTypes: Array<{ slug: string; label: string }>;
    levels: Array<{ slug: string; label: string }>;
    muscleCategories: Array<{ slug: string; label: string }>;
    muscles: Array<{ slug: string; label: string }>;
    equipments: Array<{ slug: string; label: string }>;
    goals: Array<{ slug: string; label: string }>;
    categories: Array<{ slug: string; label: string }>;
  };
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
    totalRecords: string;
    item: string;
    media: string;
    details: string;
    filtersTitle: string;
    muscleCategoryFilter: string;
    applyFilters: string;
    activeFilters: string;
    resetFilters: string;
    slowMotion: string;
    movementFrames: string;
    gifReady: string;
    allMovementTypes: string;
    allLevels: string;
    allMuscleCategories: string;
    allMuscles: string;
    allEquipments: string;
    allGoals: string;
    allCategories: string;
    movementType: string;
    movementTypeDynamicHelp: string;
    movementTypeIsometricHelp: string;
    movementTypes: {
      dynamic: string;
      isometric: string;
    };
    sections: Record<ReviewSection, string>;
  };
};

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

function getSectionItems(data: ReviewDashboardData) {
  switch (data.section) {
    case "exercises":
      return data.exercises.length;
    case "muscles":
      return data.muscles.length;
    case "equipments":
      return data.equipments.length;
    case "goals":
      return data.goals.length;
    case "categories":
      return data.categories.length;
  }
}

function getRange(data: ReviewDashboardData) {
  const count = getSectionItems(data);
  const start = data.total ? (data.page - 1) * data.pageSize + 1 : 0;
  const end = data.total ? start + count - 1 : 0;
  return { start, end };
}

function summarizeLabels(values: string[], limit: number) {
  const visible = values.slice(0, limit);
  const remaining = Math.max(0, values.length - visible.length);

  return {
    visible,
    remaining,
    text: visible.join(", "),
  };
}

function normalizeText(value: string) {
  return value.trim().toLowerCase();
}

function matchesQuery(value: string, q: string) {
  return normalizeText(value).includes(q);
}

function buildReviewUrl({
  section,
  q,
  page,
  filters,
}: {
  section: ReviewSection;
  q: string;
  page: number;
  filters: ReviewExerciseFilters;
}) {
  const params = new URLSearchParams();
  params.set("section", section);

  if (q.trim()) {
    params.set("q", q.trim());
  }

  if (section === "exercises") {
    if (filters.level) {
      params.set("level", filters.level);
    }
    if (filters.movementType) {
      params.set("movementType", filters.movementType);
    }
    if (filters.muscle) {
      params.set("muscle", filters.muscle);
    }
    if (filters.muscleCategory) {
      params.set("muscleCategory", filters.muscleCategory);
    }
    if (filters.equipment) {
      params.set("equipment", filters.equipment);
    }
    if (filters.goal) {
      params.set("goal", filters.goal);
    }
    if (filters.category) {
      params.set("category", filters.category);
    }
  }

  if (page > 1) {
    params.set("page", String(page));
  }

  return `/app/review?${params.toString()}`;
}

function filterExercises(items: ReviewExerciseItem[], q: string, filters: ReviewExerciseFilters) {
  return items.filter((item) => {
    if (filters.level && item.level?.slug !== filters.level) {
      return false;
    }

    if (filters.equipment && !item.equipment.some((value) => value.slug === filters.equipment)) {
      return false;
    }

    if (
      filters.muscleCategory &&
      !item.muscleCategories.some((value) => value.slug === filters.muscleCategory)
    ) {
      return false;
    }

    if (
      filters.muscle &&
      ![...item.primaryMuscles, ...item.secondaryMuscles].some(
        (value) => value.slug === filters.muscle,
      )
    ) {
      return false;
    }

    if (filters.goal && !item.goals.some((value) => value.slug === filters.goal)) {
      return false;
    }

    if (filters.category && !item.categories.some((value) => value.slug === filters.category)) {
      return false;
    }

    if (filters.movementType && item.movementType !== filters.movementType) {
      return false;
    }

    if (!q) {
      return true;
    }

    const haystacks = [
      item.slug,
      item.name.en,
      item.name.vi,
      item.description.en,
      item.description.vi,
      ...item.primaryMuscles.map((value) => value.name.en),
      ...item.primaryMuscles.map((value) => value.name.vi),
      ...item.secondaryMuscles.map((value) => value.name.en),
      ...item.secondaryMuscles.map((value) => value.name.vi),
      ...item.muscleCategories.map((value) => value.name.en),
      ...item.muscleCategories.map((value) => value.name.vi),
      ...item.equipment.map((value) => value.name.en),
      ...item.equipment.map((value) => value.name.vi),
      ...item.goals.map((value) => value.name.en),
      ...item.goals.map((value) => value.name.vi),
      ...item.categories.map((value) => value.name.en),
      ...item.categories.map((value) => value.name.vi),
    ];

    return haystacks.some((value) => matchesQuery(value || "", q));
  });
}

function filterReferences(items: ReviewReferenceItem[], q: string) {
  if (!q) {
    return items;
  }

  return items.filter((item) => {
    const haystacks = [
      item.slug,
      item.name.en,
      item.name.vi,
      item.description.en,
      item.description.vi,
      item.category?.slug ?? "",
      item.category?.name.en ?? "",
      item.category?.name.vi ?? "",
    ];

    return haystacks.some((value) => matchesQuery(value, q));
  });
}

function paginateItems<T>(items: T[], page: number, pageSize: number) {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;

  return {
    page: safePage,
    total,
    totalPages,
    items: items.slice(start, start + pageSize),
  };
}

function ExerciseMetaRow({
  movementType,
  movementTypeHelp,
  level,
  equipment,
  goals,
  categories,
}: {
  movementType: string;
  movementTypeHelp: string;
  level: string;
  equipment: string;
  goals: string;
  categories: string;
}) {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
      <span className="inline-flex items-center gap-1.5" title={movementTypeHelp}>
        <Activity className="h-3.5 w-3.5" />
        {movementType}
      </span>
      <span className="inline-flex items-center gap-1.5">
        <BarChart3 className="h-3.5 w-3.5" />
        {level}
      </span>
      {equipment ? (
        <span className="inline-flex items-center gap-1.5">
          <Dumbbell className="h-3.5 w-3.5" />
          {equipment}
        </span>
      ) : null}
      {goals ? (
        <span className="inline-flex items-center gap-1.5">
          <Target className="h-3.5 w-3.5" />
          {goals}
        </span>
      ) : null}
      {categories ? (
        <span className="inline-flex items-center gap-1.5">
          <Layers3 className="h-3.5 w-3.5" />
          {categories}
        </span>
      ) : null}
    </div>
  );
}

function Pagination({
  page,
  totalPages,
  pageSize,
  total,
  dictionary,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  pageSize: number;
  total: number;
  dictionary: ReviewDashboardProps["dictionary"];
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="hidden items-center gap-2 lg:flex">
        <span className="text-sm font-medium text-foreground">Rows per page</span>
        <span className="rounded-md border px-2 py-1 text-sm text-muted-foreground">{pageSize}</span>
        <span className="text-sm text-muted-foreground">{total} total</span>
      </div>
      <div className="flex w-full items-center gap-3 sm:justify-end">
        <div className="flex w-fit items-center justify-center text-sm font-medium">
          {dictionary.page} {page}/{totalPages}
        </div>
        <div className="ml-auto flex items-center gap-2 sm:ml-0">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className={cn("hidden lg:flex", page <= 1 && "pointer-events-none opacity-50")}
            onClick={() => onPageChange(1)}
          >
            <span className="sr-only">Go to first page</span>
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className={cn(page <= 1 && "pointer-events-none opacity-50")}
            onClick={() => onPageChange(Math.max(1, page - 1))}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className={cn(page >= totalPages && "pointer-events-none opacity-50")}
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className={cn("hidden lg:flex", page >= totalPages && "pointer-events-none opacity-50")}
            onClick={() => onPageChange(totalPages)}
          >
            <span className="sr-only">Go to last page</span>
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function Stats({
  data,
  dictionary,
  onPageChange,
}: {
  data: ReviewDashboardData;
  dictionary: ReviewDashboardProps["dictionary"];
  onPageChange: (page: number) => void;
}) {
  const { start, end } = getRange(data);
  const statCards = [
    {
      key: "showing",
      label: dictionary.showing,
      value: `${start}-${end}`,
      helper: `${data.total} ${dictionary.records}`,
      icon: FolderKanban,
    },
    {
      key: "images",
      label: dictionary.imageReady,
      value:
        data.section === "exercises"
          ? String(data.summary.exercises.withImage)
          : data.section === "muscles"
            ? String(data.summary.muscles.withImage)
            : data.section === "equipments"
              ? String(data.summary.equipments.withImage)
              : "—",
      helper: dictionary.sections[data.section],
      icon: Images,
    },
    {
      key: "videos",
      label: dictionary.videoReady,
      value: data.section === "exercises" ? String(data.summary.exercises.withVideo) : "—",
      helper: dictionary.sections.exercises,
      icon: PlayCircle,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-0 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      {statCards.map((card) => {
        const Icon = card.icon;

        return (
          <Card
            key={card.key}
            size="sm"
            className="@container/card bg-gradient-to-t from-primary/5 to-card shadow-xs"
          >
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <div>
                <CardDescription>{card.label}</CardDescription>
                <CardTitle className="mt-2 text-2xl font-semibold tabular-nums @[240px]/card:text-3xl">
                  {card.value}
                </CardTitle>
              </div>
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl border bg-background/80 text-muted-foreground shadow-xs">
                <Icon className="h-4.5 w-4.5" />
              </div>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">{card.helper}</CardContent>
          </Card>
        );
      })}
      <Card size="sm" className="@container/card bg-gradient-to-t from-primary/5 to-card shadow-xs">
        <CardHeader>
          <CardDescription>{dictionary.page}</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[240px]/card:text-3xl">
            {data.page}/{data.totalPages}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Pagination
            page={data.page}
            totalPages={data.totalPages}
            pageSize={data.pageSize}
            total={data.total}
            dictionary={dictionary}
            onPageChange={onPageChange}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function ExerciseTableRow({
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
  const level = item.level ? getLocalizedText(locale, item.level.name) : "—";
  const primaryMuscleTags = item.primaryMuscles
    .map((value) => getLocalizedText(locale, value.name))
    .filter(Boolean);
  const secondaryMuscleTags = item.secondaryMuscles
    .map((value) => getLocalizedText(locale, value.name))
    .filter(Boolean);
  const primaryMuscles = summarizeLabels(primaryMuscleTags, 2);
  const secondaryMuscles = summarizeLabels(secondaryMuscleTags, 2);
  const movementType =
    item.movementType === "ISOMETRIC"
      ? dictionary.movementTypes.isometric
      : dictionary.movementTypes.dynamic;
  const movementTypeHelp =
    item.movementType === "ISOMETRIC"
      ? dictionary.movementTypeIsometricHelp
      : dictionary.movementTypeDynamicHelp;
  const equipment = summarizeLabels(
    item.equipment.map((value) => getLocalizedText(locale, value.name)).filter(Boolean),
    2,
  );
  const goals = summarizeLabels(
    item.goals.map((value) => getLocalizedText(locale, value.name)).filter(Boolean),
    2,
  );
  const categories = summarizeLabels(
    item.categories.map((value) => getLocalizedText(locale, value.name)).filter(Boolean),
    2,
  );

  return (
    <div className="group px-4 py-4 transition-colors hover:bg-muted/10">
      <div className="flex items-start gap-4">
        <ExerciseThumbnailPreview
          locale={locale}
          title={name}
          alt={name}
          media={item.media}
          movementType={item.movementType}
          dictionary={{
            movementTypeLabel: dictionary.movementType,
            movementTypes: dictionary.movementTypes,
            motionLabel: dictionary.slowMotion,
            framesLabel: dictionary.movementFrames,
          }}
          className="shrink-0"
          showOverlayIcon={false}
        >
          <div className="flex h-[88px] w-[88px] items-center justify-center overflow-hidden rounded-2xl border bg-muted/35 p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] transition-transform group-hover:scale-[1.01]">
            <Image
              src={item.imageUrl}
              alt={name}
              width={168}
              height={168}
              unoptimized
              className="h-full w-full object-contain"
            />
          </div>
        </ExerciseThumbnailPreview>

        <div className="min-w-0 flex-1">
          <div className="min-w-0">
            <Link
              href={`/app/library/${item.slug}`}
              className="line-clamp-1 text-[15px] font-semibold text-foreground decoration-foreground/30 underline-offset-4 transition-colors hover:text-foreground/85 hover:underline"
            >
              {name}
            </Link>
          </div>

          <p className="mt-1.5 line-clamp-2 max-w-5xl text-sm leading-6 text-muted-foreground">
            {description}
          </p>

          <div className="mt-3 flex flex-wrap gap-2.5">
            {primaryMuscles.visible.map((value) => (
              <Badge
                key={`${item.id}-primary-${value}`}
                variant="default"
                className="rounded-full border-transparent bg-foreground px-2.5 py-1 text-background shadow-none"
              >
                {value}
              </Badge>
            ))}
            {primaryMuscles.remaining ? (
              <Badge
                variant="outline"
                className="rounded-full bg-muted/20 px-2.5 py-1 font-normal text-muted-foreground"
              >
                +{primaryMuscles.remaining}
              </Badge>
            ) : null}
            {secondaryMuscles.visible.map((value) => (
              <Badge
                key={`${item.id}-secondary-${value}`}
                variant="outline"
                className="rounded-full bg-muted/20 px-2.5 py-1 font-normal text-muted-foreground"
              >
                {value}
              </Badge>
            ))}
            {secondaryMuscles.remaining ? (
              <Badge
                variant="outline"
                className="rounded-full bg-muted/20 px-2.5 py-1 font-normal text-muted-foreground"
              >
                +{secondaryMuscles.remaining}
              </Badge>
            ) : null}
          </div>

          <ExerciseMetaRow
            movementType={movementType}
            movementTypeHelp={movementTypeHelp}
            level={level}
            equipment={equipment.text}
            goals={goals.text}
            categories={categories.text}
          />
        </div>
      </div>
    </div>
  );
}

function ReferenceTableRow({
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
  const category = item.category ? getLocalizedText(locale, item.category.name) : item.slug;

  return (
    <TableRow>
      <TableCell className="min-w-[280px] py-4 align-top">
        <div className="flex gap-3">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-muted">
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
              <ImageIcon className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          <div className="min-w-0">
            <p className="font-medium">{name}</p>
            <p className="mt-1 text-xs text-muted-foreground">{item.slug}</p>
          </div>
        </div>
      </TableCell>
      <TableCell className="min-w-[300px] whitespace-normal align-top text-sm leading-6 text-muted-foreground">
        {description || "—"}
      </TableCell>
      <TableCell className="min-w-[180px] align-top">{category || "—"}</TableCell>
      <TableCell className="min-w-[120px] align-top">{item.linkedExerciseCount}</TableCell>
      <TableCell className="min-w-[140px] align-top">
        {showImage ? (
          <Badge variant="outline" className="rounded-full">
            <ImageIcon className="h-3 w-3" />
            {detectAssetSource(item.imageUrl)}
          </Badge>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        )}
      </TableCell>
    </TableRow>
  );
}

function MobileExerciseCard({
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
  const primaryMuscleTags = item.primaryMuscles
    .map((value) => getLocalizedText(locale, value.name))
    .filter(Boolean);
  const secondaryMuscleTags = item.secondaryMuscles
    .map((value) => getLocalizedText(locale, value.name))
    .filter(Boolean);
  const primaryMuscles = summarizeLabels(primaryMuscleTags, 2);
  const secondaryMuscles = summarizeLabels(secondaryMuscleTags, 2);
  const level = item.level ? getLocalizedText(locale, item.level.name) : "—";
  const movementType =
    item.movementType === "ISOMETRIC"
      ? dictionary.movementTypes.isometric
      : dictionary.movementTypes.dynamic;
  const movementTypeHelp =
    item.movementType === "ISOMETRIC"
      ? dictionary.movementTypeIsometricHelp
      : dictionary.movementTypeDynamicHelp;
  const equipment = summarizeLabels(
    item.equipment.map((value) => getLocalizedText(locale, value.name)).filter(Boolean),
    2,
  );
  const goals = summarizeLabels(
    item.goals.map((value) => getLocalizedText(locale, value.name)).filter(Boolean),
    2,
  );
  const categories = summarizeLabels(
    item.categories.map((value) => getLocalizedText(locale, value.name)).filter(Boolean),
    2,
  );

  return (
    <Card size="sm">
      <CardContent className="pt-3">
        <div className="flex gap-3">
          <ExerciseThumbnailPreview
            locale={locale}
            title={name}
            alt={name}
            media={item.media}
            movementType={item.movementType}
            dictionary={{
              movementTypeLabel: dictionary.movementType,
              movementTypes: dictionary.movementTypes,
              motionLabel: dictionary.slowMotion,
              framesLabel: dictionary.movementFrames,
            }}
            className="shrink-0"
            showOverlayIcon={false}
          >
            <div className="w-20">
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl border bg-muted/40 p-2">
                <Image
                  src={item.imageUrl}
                  alt={name}
                  width={160}
                  height={160}
                  unoptimized
                  className="h-full w-full object-contain"
                />
              </div>
              <span className="mt-1 block text-center text-[11px] font-medium text-muted-foreground">
                Preview
              </span>
            </div>
          </ExerciseThumbnailPreview>
          <div className="min-w-0 flex-1">
            <h3 className="font-medium">{name}</h3>
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
              {description}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {primaryMuscles.visible.map((value) => (
                <Badge
                  key={`${item.id}-primary-mobile-${value}`}
                  variant="default"
                  className="rounded-full border-transparent bg-foreground text-background shadow-none"
                >
                  {value}
                </Badge>
              ))}
              {primaryMuscles.remaining ? (
                <Badge
                  variant="outline"
                  className="rounded-full bg-muted/20 font-normal text-muted-foreground"
                >
                  +{primaryMuscles.remaining}
                </Badge>
              ) : null}
              {secondaryMuscles.visible.map((value) => (
                <Badge
                  key={`${item.id}-secondary-mobile-${value}`}
                  variant="outline"
                  className="rounded-full bg-muted/20 font-normal text-muted-foreground"
                >
                  {value}
                </Badge>
              ))}
              {secondaryMuscles.remaining ? (
                <Badge
                  variant="outline"
                  className="rounded-full bg-muted/20 font-normal text-muted-foreground"
                >
                  +{secondaryMuscles.remaining}
                </Badge>
              ) : null}
            </div>

            <ExerciseMetaRow
              movementType={movementType}
              movementTypeHelp={movementTypeHelp}
              level={level}
              equipment={equipment.text}
              goals={goals.text}
              categories={categories.text}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MobileReferenceCard({
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

  return (
    <Card size="sm">
      <CardContent className="pt-3">
        <div className="flex gap-3">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-muted">
            {showImage && item.imageUrl ? (
              <Image
                src={item.imageUrl}
                alt={name}
                width={120}
                height={120}
                unoptimized
                className="h-full w-full object-contain"
              />
            ) : (
              <ImageIcon className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-medium">{name}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{item.slug}</p>
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
              {description}
            </p>
            <p className="mt-3 text-xs text-muted-foreground">
              {dictionary.linkedExercises}: {item.linkedExerciseCount}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ReviewDashboard({
  locale,
  snapshot,
  initialState,
  dictionary,
  filterOptions,
}: ReviewDashboardProps) {
  const [section, setSection] = useState<ReviewSection>(initialState.section);
  const [page, setPage] = useState(initialState.page);
  const [searchInput, setSearchInput] = useState(initialState.q);
  const [appliedQuery, setAppliedQuery] = useState(initialState.q);
  const [draftFilters, setDraftFilters] = useState<ReviewExerciseFilters>(initialState.filters);
  const [appliedFilters, setAppliedFilters] = useState<ReviewExerciseFilters>(initialState.filters);
  const deferredQuery = useDeferredValue(normalizeText(appliedQuery));

  const data = useMemo<ReviewDashboardData>(() => {
    const pageSize = section === "exercises" ? 40 : 60;

    if (section === "exercises") {
      const filteredItems = filterExercises(snapshot.exercises, deferredQuery, appliedFilters);
      const paged = paginateItems(filteredItems, page, pageSize);

      return {
        section,
        q: appliedQuery,
        page: paged.page,
        pageSize,
        total: paged.total,
        totalPages: paged.totalPages,
        summary: snapshot.summary,
        exercises: paged.items,
        muscles: [],
        equipments: [],
        goals: [],
        categories: [],
      };
    }

    const referenceItems =
      section === "muscles"
        ? filterReferences(snapshot.muscles, deferredQuery)
        : section === "equipments"
          ? filterReferences(snapshot.equipments, deferredQuery)
          : section === "goals"
            ? filterReferences(snapshot.goals, deferredQuery)
            : filterReferences(snapshot.categories, deferredQuery);
    const paged = paginateItems(referenceItems, page, pageSize);

    return {
      section,
      q: appliedQuery,
      page: paged.page,
      pageSize,
      total: paged.total,
      totalPages: paged.totalPages,
      summary: snapshot.summary,
      exercises: [],
      muscles: section === "muscles" ? paged.items : [],
      equipments: section === "equipments" ? paged.items : [],
      goals: section === "goals" ? paged.items : [],
      categories: section === "categories" ? paged.items : [],
    };
  }, [appliedFilters, appliedQuery, deferredQuery, page, section, snapshot]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const url = buildReviewUrl({
      section,
      q: appliedQuery,
      page: data.page,
      filters: appliedFilters,
    });

    window.history.replaceState(window.history.state, "", url);
  }, [appliedFilters, appliedQuery, data.page, section]);

  const { start, end } = getRange(data);

  function handleSectionChange(nextSection: ReviewSection) {
    startTransition(() => {
      setSection(nextSection);
      setPage(1);
    });
  }

  function handleFilterChange(name: keyof ReviewExerciseFilters, value: string) {
    setDraftFilters((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleApplyFilters() {
    startTransition(() => {
      setAppliedFilters(draftFilters);
      setPage(1);
    });
  }

  function handleResetFilters() {
    const nextFilters: ReviewExerciseFilters = {
      level: "",
      muscle: "",
      muscleCategory: "",
      equipment: "",
      goal: "",
      category: "",
      movementType: "",
    };

    startTransition(() => {
      setDraftFilters(nextFilters);
      setAppliedFilters(nextFilters);
      setPage(1);
    });
  }

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startTransition(() => {
      setAppliedQuery(searchInput.trim());
      setPage(1);
    });
  }

  return (
    <div className="flex flex-1 flex-col gap-4 md:gap-6">
      <Stats data={data} dictionary={dictionary} onPageChange={setPage} />

      <div className="px-4 lg:px-0">
        <Card className="shadow-xs">
          <CardHeader className="gap-5 border-b bg-muted/10">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div className="max-w-3xl">
                <CardDescription>{dictionary.sections[data.section]}</CardDescription>
                <CardTitle className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
                  {dictionary.title}
                </CardTitle>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                  {dictionary.subtitle}
                </p>
              </div>

              <form onSubmit={handleSearchSubmit} className="flex w-full max-w-[560px] gap-2">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="search"
                    value={searchInput}
                    onChange={(event) => setSearchInput(event.target.value)}
                    placeholder={dictionary.searchPlaceholder}
                    className="h-10 pl-10"
                  />
                </div>
                <Button type="submit" size="lg" className="px-4">
                  <Search className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ReviewSectionTabs
              section={data.section}
              sections={dictionary.sections}
              counts={{
                exercises: snapshot.summary.exercises.count,
                muscles: snapshot.summary.muscles.count,
                equipments: snapshot.summary.equipments.count,
                goals: snapshot.summary.goals.count,
                categories: snapshot.summary.categories.count,
              }}
              onSectionChange={handleSectionChange}
            />
            {data.section === "exercises" ? (
              <ReviewExerciseFilterBar
                filters={draftFilters}
                appliedFilters={appliedFilters}
                options={filterOptions}
                dictionary={{
                  title: dictionary.filtersTitle,
                  apply: dictionary.applyFilters,
                  activeFilters: dictionary.activeFilters,
                  reset: dictionary.resetFilters,
                  allMovementTypes: dictionary.allMovementTypes,
                  allLevels: dictionary.allLevels,
                  allMuscleCategories: dictionary.allMuscleCategories,
                  allMuscles: dictionary.allMuscles,
                  allEquipments: dictionary.allEquipments,
                  allGoals: dictionary.allGoals,
                  allCategories: dictionary.allCategories,
                  movementType: dictionary.movementType,
                  level: dictionary.level,
                  muscleCategory: dictionary.muscleCategoryFilter,
                  muscle: dictionary.sections.muscles,
                  equipment: dictionary.equipment,
                  goal: dictionary.sections.goals,
                  category: dictionary.sections.categories,
                }}
                onFilterChange={handleFilterChange}
                onApply={handleApplyFilters}
                onReset={handleResetFilters}
              />
            ) : null}
          </CardContent>
        </Card>
      </div>

      {getSectionItems(data) ? (
        <>
          <div className="grid gap-3 px-4 lg:hidden">
            {data.section === "exercises"
              ? data.exercises.map((item) => (
                  <MobileExerciseCard
                    key={item.id}
                    locale={locale}
                    item={item}
                    dictionary={dictionary}
                  />
                ))
              : (
                  data.section === "muscles"
                    ? data.muscles
                    : data.section === "equipments"
                      ? data.equipments
                      : data.section === "goals"
                        ? data.goals
                        : data.categories
                ).map((item) => (
                  <MobileReferenceCard
                    key={item.id}
                    locale={locale}
                    item={item}
                    dictionary={dictionary}
                    showImage={data.section === "muscles" || data.section === "equipments"}
                  />
                ))}
          </div>

          <div className="hidden px-4 lg:block lg:px-0">
            <Card className="overflow-hidden shadow-xs">
              <CardHeader className="flex-row items-center justify-between gap-3 border-b bg-muted/10">
                <div>
                  <CardTitle>{dictionary.sections[data.section]}</CardTitle>
                  <CardDescription>
                    {dictionary.showing} {start}-{end} / {data.total} {dictionary.records}
                  </CardDescription>
                </div>
                <Badge
                  variant="outline"
                  className="hidden rounded-full px-2.5 py-1 text-xs font-medium text-muted-foreground lg:inline-flex"
                >
                  {dictionary.totalRecords}: {data.total}
                </Badge>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[calc(100svh-24rem)] overflow-auto border-t">
                  {data.section === "exercises" ? (
                    <div className="divide-y">
                      {data.exercises.map((item) => (
                        <ExerciseTableRow
                          key={item.id}
                          locale={locale}
                          item={item}
                          dictionary={dictionary}
                        />
                      ))}
                    </div>
                  ) : (
                    <Table className="min-w-[980px]">
                      <TableHeader className="[&_tr]:bg-background/95 [&_tr]:backdrop-blur supports-[backdrop-filter]:[&_tr]:bg-background/80">
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="sticky top-0 z-20 bg-background/95 backdrop-blur">
                            {dictionary.item}
                          </TableHead>
                          <TableHead className="sticky top-0 z-20 bg-background/95 backdrop-blur">
                            {dictionary.details}
                          </TableHead>
                          <TableHead className="sticky top-0 z-20 bg-background/95 backdrop-blur">
                            {dictionary.category}
                          </TableHead>
                          <TableHead className="sticky top-0 z-20 bg-background/95 backdrop-blur">
                            {dictionary.linkedExercises}
                          </TableHead>
                          <TableHead className="sticky top-0 z-20 bg-background/95 backdrop-blur">
                            {dictionary.media}
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(
                          data.section === "muscles"
                            ? data.muscles
                            : data.section === "equipments"
                              ? data.equipments
                              : data.section === "goals"
                                ? data.goals
                                : data.categories
                        ).map((item) => (
                          <ReferenceTableRow
                            key={item.id}
                            locale={locale}
                            item={item}
                            showImage={data.section === "muscles" || data.section === "equipments"}
                          />
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </CardContent>
              <CardFooter className="justify-between border-t bg-muted/30">
                <Pagination
                  page={data.page}
                  totalPages={data.totalPages}
                  pageSize={data.pageSize}
                  total={data.total}
                  dictionary={dictionary}
                  onPageChange={setPage}
                />
              </CardFooter>
            </Card>
          </div>
        </>
      ) : (
        <div className="px-4 lg:px-0">
          <Card className="shadow-xs">
            <CardContent className="py-10 text-center">
              <h2 className="font-heading text-2xl font-semibold">{dictionary.noResultsTitle}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {dictionary.noResultsBody}
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
