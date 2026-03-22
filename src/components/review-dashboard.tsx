import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ImageIcon,
  PlayCircle,
  Search,
} from "lucide-react";
import type {
  ReviewDashboardData,
  ReviewExerciseItem,
  ReviewReferenceItem,
  ReviewSection,
} from "@/lib/data";
import { getLocalizedText } from "@/lib/localized";
import { cn } from "@/lib/utils";
import type { AppLocale } from "@/types/domain";
import { ReviewSectionTabs } from "@/components/review-section-tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
  return values
    .slice(0, limit)
    .map((value) => getLocalizedText(locale, value.name))
    .filter(Boolean)
    .join(", ");
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

function Pagination({
  section,
  q,
  page,
  totalPages,
  pageSize,
  total,
  dictionary,
}: {
  section: ReviewSection;
  q: string;
  page: number;
  totalPages: number;
  pageSize: number;
  total: number;
  dictionary: ReviewDashboardProps["dictionary"];
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
            asChild
            variant="outline"
            size="icon"
            className={cn("hidden lg:flex", page <= 1 && "pointer-events-none opacity-50")}
          >
            <Link href={buildReviewHref(section, q, 1)}>
              <span className="sr-only">Go to first page</span>
              <ChevronsLeft className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="icon"
            className={cn(page <= 1 && "pointer-events-none opacity-50")}
          >
            <Link href={buildReviewHref(section, q, Math.max(1, page - 1))}>
              <span className="sr-only">Go to previous page</span>
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="icon"
            className={cn(page >= totalPages && "pointer-events-none opacity-50")}
          >
            <Link href={buildReviewHref(section, q, Math.min(totalPages, page + 1))}>
              <span className="sr-only">Go to next page</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="icon"
            className={cn("hidden lg:flex", page >= totalPages && "pointer-events-none opacity-50")}
          >
            <Link href={buildReviewHref(section, q, totalPages)}>
              <span className="sr-only">Go to last page</span>
              <ChevronsRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function Stats({
  data,
  dictionary,
}: {
  data: ReviewDashboardData;
  dictionary: ReviewDashboardProps["dictionary"];
}) {
  const { start, end } = getRange(data);

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <Card size="sm" className="@container/card bg-gradient-to-t from-primary/5 to-card shadow-xs">
        <CardHeader>
          <CardDescription>{dictionary.showing}</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[240px]/card:text-3xl">{start}-{end}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {data.total} {dictionary.records}
        </CardContent>
      </Card>
      <Card size="sm" className="@container/card bg-gradient-to-t from-primary/5 to-card shadow-xs">
        <CardHeader>
          <CardDescription>{dictionary.imageReady}</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[240px]/card:text-3xl">
            {data.section === "exercises"
              ? data.summary.exercises.withImage
              : data.section === "muscles"
                ? data.summary.muscles.withImage
                : data.section === "equipments"
                  ? data.summary.equipments.withImage
                  : "—"}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">{dictionary.sections[data.section]}</CardContent>
      </Card>
      <Card size="sm" className="@container/card bg-gradient-to-t from-primary/5 to-card shadow-xs">
        <CardHeader>
          <CardDescription>{dictionary.videoReady}</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[240px]/card:text-3xl">
            {data.section === "exercises" ? data.summary.exercises.withVideo : "—"}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">{dictionary.sections.exercises}</CardContent>
      </Card>
      <Card size="sm" className="@container/card bg-gradient-to-t from-primary/5 to-card shadow-xs">
        <CardHeader>
          <CardDescription>{dictionary.page}</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[240px]/card:text-3xl">
            {data.page}/{data.totalPages}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Pagination
            section={data.section}
            q={data.q}
            page={data.page}
            totalPages={data.totalPages}
            pageSize={data.pageSize}
            total={data.total}
            dictionary={dictionary}
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
  const muscles = formatList(locale, item.primaryMuscles, 2) || "—";
  const equipment = formatList(locale, item.equipment, 2) || "—";
  const goals = formatList(locale, item.goals, 2) || "—";
  const categories = formatList(locale, item.categories, 2) || "—";

  return (
    <TableRow>
      <TableCell className="min-w-[320px] py-4 align-top">
        <div className="flex gap-3">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-muted">
            <Image src={item.imageUrl} alt={name} width={160} height={160} unoptimized className="h-full w-full object-contain" />
          </div>
          <div className="min-w-0">
            <Link href={`/app/library/${item.slug}`} className="font-semibold text-foreground hover:underline">
              {name}
            </Link>
            <p className="mt-1 text-xs text-muted-foreground">{item.slug}</p>
            <p className="mt-2 line-clamp-2 max-w-[360px] text-xs leading-5 text-muted-foreground">{description}</p>
          </div>
        </div>
      </TableCell>
      <TableCell className="min-w-[180px] align-top">
        <p className="font-medium">{muscles}</p>
        <p className="mt-2 text-xs text-muted-foreground">{dictionary.level}: {level}</p>
      </TableCell>
      <TableCell className="min-w-[190px] align-top">
        <p className="font-medium">{equipment}</p>
        <p className="mt-2 text-xs text-muted-foreground">{dictionary.goals}: {goals}</p>
      </TableCell>
      <TableCell className="min-w-[180px] align-top">
        <p className="font-medium">{categories}</p>
        <p className="mt-2 text-xs text-muted-foreground">{dictionary.reviewStatus}: {item.reviewStatus}</p>
      </TableCell>
      <TableCell className="min-w-[160px] align-top">
        <div className="flex flex-col gap-2">
          <Badge variant="outline" className="w-fit rounded-full">
            <ImageIcon className="h-3 w-3" />
            {detectAssetSource(item.imageUrl)}
          </Badge>
          <Badge
            variant={item.media.videoUrl ? "default" : "outline"}
            className={cn("w-fit rounded-full", item.media.videoUrl ? "" : "text-muted-foreground")}
          >
            <PlayCircle className="h-3 w-3" />
            {item.media.videoUrl ? dictionary.videoReady : `${dictionary.videoReady}: —`}
          </Badge>
        </div>
      </TableCell>
      <TableCell className="min-w-[180px] align-top">
        <p className="font-medium">{item.source}</p>
        <Button asChild variant="outline" size="sm" className="mt-3">
          <Link href={`/app/library/${item.slug}`}>
            {dictionary.openExercise}
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </Button>
      </TableCell>
    </TableRow>
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
              <Image src={item.imageUrl} alt={name} width={140} height={140} unoptimized className="h-full w-full object-contain" />
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
}: {
  locale: AppLocale;
  item: ReviewExerciseItem;
}) {
  const name = getLocalizedText(locale, item.name);
  const description = getLocalizedText(locale, item.description);

  return (
    <Card size="sm">
      <CardContent className="pt-3">
        <div className="flex gap-3">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-muted">
            <Image src={item.imageUrl} alt={name} width={160} height={160} unoptimized className="h-full w-full object-contain" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="rounded-full">{item.reviewStatus}</Badge>
              <Badge variant="outline" className="rounded-full">{detectAssetSource(item.imageUrl)}</Badge>
            </div>
            <h3 className="mt-3 font-medium">{name}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{item.slug}</p>
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{description}</p>
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
              <Image src={item.imageUrl} alt={name} width={120} height={120} unoptimized className="h-full w-full object-contain" />
            ) : (
              <ImageIcon className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-medium">{name}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{item.slug}</p>
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{description}</p>
            <p className="mt-3 text-xs text-muted-foreground">
              {dictionary.linkedExercises}: {item.linkedExerciseCount}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ReviewDashboard({ locale, data, dictionary }: ReviewDashboardProps) {
  const { start, end } = getRange(data);

  return (
    <div className="flex flex-1 flex-col gap-4 md:gap-6">
      <Stats data={data} dictionary={dictionary} />

      <Card className="shadow-xs">
        <CardHeader className="gap-4">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-3xl">
              <CardDescription>{dictionary.sections[data.section]}</CardDescription>
              <CardTitle className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">{dictionary.title}</CardTitle>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{dictionary.subtitle}</p>
            </div>

            <form className="flex w-full max-w-[560px] gap-2">
              <input type="hidden" name="section" value={data.section} />
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  name="q"
                  defaultValue={data.q}
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
              exercises: data.summary.exercises.count,
              muscles: data.summary.muscles.count,
              equipments: data.summary.equipments.count,
              goals: data.summary.goals.count,
              categories: data.summary.categories.count,
            }}
          />
        </CardContent>
      </Card>

      {getSectionItems(data) ? (
        <>
          <div className="grid gap-3 lg:hidden">
                {data.section === "exercises"
                  ? data.exercises.map((item) => (
                      <MobileExerciseCard key={item.id} locale={locale} item={item} />
                    ))
              : (data.section === "muscles"
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

          <Card className="hidden shadow-xs lg:flex">
            <CardHeader className="flex-row items-center justify-between gap-3">
              <div>
                <CardTitle>{dictionary.sections[data.section]}</CardTitle>
                <CardDescription>
                  {dictionary.showing} {start}-{end} / {data.total} {dictionary.records}
                </CardDescription>
              </div>
              <div className="hidden lg:block" />
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden rounded-lg border">
                <div className="max-h-[calc(100svh-25rem)] overflow-auto">
                {data.section === "exercises" ? (
                  <Table className="min-w-[1180px]">
                    <TableHeader className="sticky top-0 z-10 bg-muted">
                      <TableRow>
                        <TableHead>{dictionary.item}</TableHead>
                        <TableHead>{dictionary.focus}</TableHead>
                        <TableHead>{dictionary.equipment}</TableHead>
                        <TableHead>{dictionary.categories}</TableHead>
                        <TableHead>{dictionary.media}</TableHead>
                        <TableHead>{dictionary.source}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.exercises.map((item) => (
                        <ExerciseTableRow key={item.id} locale={locale} item={item} dictionary={dictionary} />
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <Table className="min-w-[980px]">
                    <TableHeader className="sticky top-0 z-10 bg-muted">
                      <TableRow>
                        <TableHead>{dictionary.item}</TableHead>
                        <TableHead>{dictionary.details}</TableHead>
                        <TableHead>{dictionary.category}</TableHead>
                        <TableHead>{dictionary.linkedExercises}</TableHead>
                        <TableHead>{dictionary.media}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(data.section === "muscles"
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
              </div>
            </CardContent>
            <CardFooter className="justify-between border-t bg-muted/30">
              <Pagination
                section={data.section}
                q={data.q}
                page={data.page}
                totalPages={data.totalPages}
                pageSize={data.pageSize}
                total={data.total}
                dictionary={dictionary}
              />
            </CardFooter>
          </Card>
        </>
      ) : (
        <Card className="shadow-xs">
          <CardContent className="py-10 text-center">
            <h2 className="font-heading text-2xl font-semibold">{dictionary.noResultsTitle}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{dictionary.noResultsBody}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
