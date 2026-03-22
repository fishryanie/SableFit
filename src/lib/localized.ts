import type { AppLocale, LocalizedString } from "@/types/domain";

export function getLocalizedText(
  locale: AppLocale,
  value?: LocalizedString | null,
  fallback = "",
) {
  if (!value) {
    return fallback;
  }

  if (locale === "vi") {
    return value.vi || value.en || fallback;
  }

  return value.en || value.vi || fallback;
}
