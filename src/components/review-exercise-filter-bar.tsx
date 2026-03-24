import { RotateCcw, SlidersHorizontal, X } from "lucide-react";
import type { ReviewExerciseFilters } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type ReviewExerciseFilterBarProps = {
  filters: ReviewExerciseFilters;
  appliedFilters: ReviewExerciseFilters;
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
  onFilterChange: (name: keyof ReviewExerciseFilters, value: string) => void;
  onApply: () => void;
  onReset: () => void;
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
  value,
  placeholder,
  options,
  onChange,
}: {
  name: keyof ReviewExerciseFilters;
  label: string;
  value?: string;
  placeholder: string;
  options: Array<{ slug: string; label: string }>;
  onChange: (name: keyof ReviewExerciseFilters, value: string) => void;
}) {
  return (
    <label className="space-y-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <select
        name={name}
        value={value || ""}
        onChange={(event) => onChange(name, event.target.value)}
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
  filters,
  appliedFilters,
  options,
  dictionary,
  onFilterChange,
  onApply,
  onReset,
}: ReviewExerciseFilterBarProps) {
  const activeCount = [
    appliedFilters.movementType,
    appliedFilters.level,
    appliedFilters.muscleCategory,
    appliedFilters.muscle,
    appliedFilters.equipment,
    appliedFilters.goal,
    appliedFilters.category,
  ].filter(Boolean).length;
  const activeFilters = [
    appliedFilters.movementType
      ? { key: "movementType", label: dictionary.movementType, value: findOptionLabel(options.movementTypes, appliedFilters.movementType) }
      : null,
    appliedFilters.level
      ? { key: "level", label: dictionary.level, value: findOptionLabel(options.levels, appliedFilters.level) }
      : null,
    appliedFilters.muscleCategory
      ? { key: "muscleCategory", label: dictionary.muscleCategory, value: findOptionLabel(options.muscleCategories, appliedFilters.muscleCategory) }
      : null,
    appliedFilters.muscle
      ? { key: "muscle", label: dictionary.muscle, value: findOptionLabel(options.muscles, appliedFilters.muscle) }
      : null,
    appliedFilters.equipment
      ? { key: "equipment", label: dictionary.equipment, value: findOptionLabel(options.equipments, appliedFilters.equipment) }
      : null,
    appliedFilters.goal
      ? { key: "goal", label: dictionary.goal, value: findOptionLabel(options.goals, appliedFilters.goal) }
      : null,
    appliedFilters.category
      ? { key: "category", label: dictionary.category, value: findOptionLabel(options.categories, appliedFilters.category) }
      : null,
  ].filter(Boolean) as Array<{ key: string; label: string; value: string }>;

  return (
    <div className="rounded-2xl border bg-muted/15 p-4 shadow-xs">
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
          <Button type="button" variant="ghost" size="sm" onClick={onReset}>
            <RotateCcw className="h-4 w-4" />
            {dictionary.reset}
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
            <Button type="button" variant="ghost" size="sm" className="ml-auto h-7 px-2 text-muted-foreground" onClick={onReset}>
              <X className="h-3.5 w-3.5" />
              {dictionary.reset}
            </Button>
          </div>
        ) : null}

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7">
          <FilterSelect
            name="movementType"
            label={dictionary.movementType}
            value={filters.movementType}
            placeholder={dictionary.allMovementTypes}
            options={options.movementTypes}
            onChange={onFilterChange}
          />
          <FilterSelect
            name="level"
            label={dictionary.level}
            value={filters.level}
            placeholder={dictionary.allLevels}
            options={options.levels}
            onChange={onFilterChange}
          />
          <FilterSelect
            name="muscleCategory"
            label={dictionary.muscleCategory}
            value={filters.muscleCategory}
            placeholder={dictionary.allMuscleCategories}
            options={options.muscleCategories}
            onChange={onFilterChange}
          />
          <FilterSelect
            name="muscle"
            label={dictionary.muscle}
            value={filters.muscle}
            placeholder={dictionary.allMuscles}
            options={options.muscles}
            onChange={onFilterChange}
          />
          <FilterSelect
            name="equipment"
            label={dictionary.equipment}
            value={filters.equipment}
            placeholder={dictionary.allEquipments}
            options={options.equipments}
            onChange={onFilterChange}
          />
          <FilterSelect
            name="goal"
            label={dictionary.goal}
            value={filters.goal}
            placeholder={dictionary.allGoals}
            options={options.goals}
            onChange={onFilterChange}
          />
          <FilterSelect
            name="category"
            label={dictionary.category}
            value={filters.category}
            placeholder={dictionary.allCategories}
            options={options.categories}
            onChange={onFilterChange}
          />
        </div>

        <div className="flex justify-end">
          <Button type="button" size="sm" className="min-w-32" onClick={onApply}>
            {dictionary.apply}
          </Button>
        </div>
      </div>
    </div>
  );
}
