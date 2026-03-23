import Link from "next/link";
import { RotateCcw, SlidersHorizontal, X } from "lucide-react";
import type { ReviewExerciseFilters } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type ReviewExerciseFilterBarProps = {
  q: string;
  filters: ReviewExerciseFilters;
  options: {
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
    apply: string;
    reset: string;
    activeFilters: string;
    allMovementTypes: string;
    allLevels: string;
    allMuscleCategories: string;
    allMuscles: string;
    allEquipments: string;
    allGoals: string;
    allCategories: string;
    movementType: string;
    level: string;
    muscleCategory: string;
    muscle: string;
    equipment: string;
    goal: string;
    category: string;
  };
};

function findOptionLabel(
  options: Array<{ slug: string; label: string }>,
  value?: string,
) {
  if (!value) {
    return "";
  }

  return options.find((item) => item.slug === value)?.label ?? value;
}

function FilterSelect({
  name,
  label,
  defaultValue,
  placeholder,
  options,
}: {
  name: keyof ReviewExerciseFilters;
  label: string;
  defaultValue?: string;
  placeholder: string;
  options: Array<{ slug: string; label: string }>;
}) {
  return (
    <label className="space-y-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <select
        name={name}
        defaultValue={defaultValue || ""}
        className="flex h-9 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
      >
        <option value="">{placeholder}</option>
        {options.map((item) => (
          <option key={item.slug} value={item.slug}>
            {item.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function ReviewExerciseFilterBar({
  q,
  filters,
  options,
  dictionary,
}: ReviewExerciseFilterBarProps) {
  const activeCount = [
    filters.movementType,
    filters.level,
    filters.muscleCategory,
    filters.muscle,
    filters.equipment,
    filters.goal,
    filters.category,
  ].filter(Boolean).length;
  const resetHref = q.trim()
    ? `/app/review?section=exercises&q=${encodeURIComponent(q.trim())}`
    : "/app/review?section=exercises";
  const activeFilters = [
    filters.movementType
      ? { key: "movementType", label: dictionary.movementType, value: findOptionLabel(options.movementTypes, filters.movementType) }
      : null,
    filters.level
      ? { key: "level", label: dictionary.level, value: findOptionLabel(options.levels, filters.level) }
      : null,
    filters.muscleCategory
      ? { key: "muscleCategory", label: dictionary.muscleCategory, value: findOptionLabel(options.muscleCategories, filters.muscleCategory) }
      : null,
    filters.muscle
      ? { key: "muscle", label: dictionary.muscle, value: findOptionLabel(options.muscles, filters.muscle) }
      : null,
    filters.equipment
      ? { key: "equipment", label: dictionary.equipment, value: findOptionLabel(options.equipments, filters.equipment) }
      : null,
    filters.goal
      ? { key: "goal", label: dictionary.goal, value: findOptionLabel(options.goals, filters.goal) }
      : null,
    filters.category
      ? { key: "category", label: dictionary.category, value: findOptionLabel(options.categories, filters.category) }
      : null,
  ].filter(Boolean) as Array<{ key: string; label: string; value: string }>;

  return (
    <form action="/app/review" method="get" className="rounded-2xl border bg-muted/15 p-4 shadow-xs">
      <input type="hidden" name="section" value="exercises" />
      {q.trim() ? <input type="hidden" name="q" value={q.trim()} /> : null}

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <SlidersHorizontal className="h-4 w-4" />
            <span>{dictionary.title}</span>
            {activeCount ? (
              <span className="rounded-full bg-background px-2 py-0.5 text-xs text-muted-foreground shadow-xs">
                {activeCount}
              </span>
            ) : null}
          </div>
          <Button asChild type="button" variant="ghost" size="sm">
            <Link href={resetHref}>
              <RotateCcw className="h-4 w-4" />
              {dictionary.reset}
            </Link>
          </Button>
        </div>

        {activeFilters.length ? (
          <div className="flex flex-wrap items-center gap-2 rounded-xl border bg-background/80 px-3 py-2">
            <span className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
              {dictionary.activeFilters}
            </span>
            {activeFilters.map((filter) => (
              <Badge
                key={filter.key}
                variant="outline"
                className="rounded-full bg-muted/30 font-normal"
              >
                {filter.label}: {filter.value}
              </Badge>
            ))}
            <Button asChild type="button" variant="ghost" size="sm" className="ml-auto h-7 px-2 text-muted-foreground">
              <Link href={resetHref}>
                <X className="h-3.5 w-3.5" />
                {dictionary.reset}
              </Link>
            </Button>
          </div>
        ) : null}

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7">
          <FilterSelect
            name="movementType"
            label={dictionary.movementType}
            defaultValue={filters.movementType}
            placeholder={dictionary.allMovementTypes}
            options={options.movementTypes}
          />
          <FilterSelect
            name="level"
            label={dictionary.level}
            defaultValue={filters.level}
            placeholder={dictionary.allLevels}
            options={options.levels}
          />
          <FilterSelect
            name="muscleCategory"
            label={dictionary.muscleCategory}
            defaultValue={filters.muscleCategory}
            placeholder={dictionary.allMuscleCategories}
            options={options.muscleCategories}
          />
          <FilterSelect
            name="muscle"
            label={dictionary.muscle}
            defaultValue={filters.muscle}
            placeholder={dictionary.allMuscles}
            options={options.muscles}
          />
          <FilterSelect
            name="equipment"
            label={dictionary.equipment}
            defaultValue={filters.equipment}
            placeholder={dictionary.allEquipments}
            options={options.equipments}
          />
          <FilterSelect
            name="goal"
            label={dictionary.goal}
            defaultValue={filters.goal}
            placeholder={dictionary.allGoals}
            options={options.goals}
          />
          <FilterSelect
            name="category"
            label={dictionary.category}
            defaultValue={filters.category}
            placeholder={dictionary.allCategories}
            options={options.categories}
          />
        </div>

        <div className="flex justify-end">
          <Button type="submit" size="sm" className="min-w-32">
            {dictionary.apply}
          </Button>
        </div>
      </div>
    </form>
  );
}
