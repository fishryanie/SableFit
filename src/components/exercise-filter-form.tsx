import type { ComponentType } from "react";
import { Accessibility, ChevronDown, Dumbbell, Search, SlidersHorizontal } from "lucide-react";
import type { AppLocale } from "@/types/domain";
import { getLocalizedText } from "@/lib/localized";
import type { NamedReference } from "@/lib/data";

type ExerciseFilterFormProps = {
  locale: AppLocale;
  searchValue: string;
  muscleValue: string;
  equipmentValue: string;
  levelValue: string;
  muscles: NamedReference[];
  equipments: NamedReference[];
  levels: NamedReference[];
  dictionary: {
    searchPlaceholder: string;
    anyMuscle: string;
    anyEquipment: string;
    anyLevel: string;
    apply: string;
  };
};

type FilterPillProps = {
  icon: ComponentType<{ className?: string }>;
  name: string;
  value: string;
  defaultLabel: string;
  options: NamedReference[];
  locale: AppLocale;
};

function FilterPill({
  icon: Icon,
  name,
  value,
  defaultLabel,
  options,
  locale,
}: FilterPillProps) {
  return (
    <label className="relative min-w-[148px] flex-1">
      <Icon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-secondary" />
      <select
        name={name}
        defaultValue={value}
        className="h-14 w-full appearance-none rounded-full border border-border bg-background-secondary pl-10 pr-10 text-sm font-semibold text-foreground shadow-[0_10px_28px_rgba(17,17,17,0.06)] outline-none"
      >
        <option value="">{defaultLabel}</option>
        {options.map((item) => (
          <option key={item.id} value={item.slug}>
            {getLocalizedText(locale, item.name)}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
    </label>
  );
}

export function ExerciseFilterForm({
  locale,
  searchValue,
  muscleValue,
  equipmentValue,
  levelValue,
  muscles,
  equipments,
  levels,
  dictionary,
}: ExerciseFilterFormProps) {
  return (
    <form className="space-y-3">
      <label className="relative block">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-foreground-muted" />
        <input
          type="search"
          name="q"
          defaultValue={searchValue}
          placeholder={dictionary.searchPlaceholder}
          className="h-16 w-full rounded-[28px] border border-border bg-background-secondary pl-12 pr-4 text-base font-medium text-foreground shadow-[0_12px_32px_rgba(17,17,17,0.06)] outline-none placeholder:text-foreground-muted"
        />
      </label>

      <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-border bg-background-secondary text-foreground-secondary shadow-[0_10px_28px_rgba(17,17,17,0.06)]">
          <SlidersHorizontal className="h-5 w-5" />
        </div>
        <FilterPill
          icon={Accessibility}
          name="muscle"
          value={muscleValue}
          defaultLabel={dictionary.anyMuscle}
          options={muscles}
          locale={locale}
        />
        <FilterPill
          icon={Dumbbell}
          name="equipment"
          value={equipmentValue}
          defaultLabel={dictionary.anyEquipment}
          options={equipments}
          locale={locale}
        />
        <FilterPill
          icon={SlidersHorizontal}
          name="level"
          value={levelValue}
          defaultLabel={dictionary.anyLevel}
          options={levels}
          locale={locale}
        />
      </div>

      <button
        type="submit"
        className="inline-flex h-12 w-full items-center justify-center rounded-full bg-primary-500 px-4 text-sm font-semibold text-foreground-inverted"
      >
        {dictionary.apply}
      </button>
    </form>
  );
}
