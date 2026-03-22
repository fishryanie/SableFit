import type { LocalizedString } from "@/types/domain";

export function slugify(input: string) {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function mirrorLocalized(value: string): LocalizedString {
  return {
    en: value,
    vi: value,
  };
}
