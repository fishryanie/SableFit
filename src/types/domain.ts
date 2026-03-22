export type AppLocale = "vi" | "en";

export type LocalizedString = {
  en: string;
  vi: string;
};

export type OwnerType = "SYSTEM" | "USER";

export type ReviewStatus = "APPROVED" | "DRAFT";

export type ReminderStatus = "PENDING" | "SENT" | "SKIPPED";

export type OccurrenceStatus = "UPCOMING" | "COMPLETED" | "MISSED" | "SKIPPED";

export type NotificationType = "REMINDER" | "SYSTEM";

export type ExerciseMediaStyle = "ANATOMY" | "ILLUSTRATION";

export type ExerciseMediaStatus = "READY" | "FALLBACK";

export type ExerciseMediaFrame = {
  order: number;
  label: LocalizedString;
  url: string;
};

export type ExerciseMedia = {
  style: ExerciseMediaStyle;
  status: ExerciseMediaStatus;
  thumbnailUrl: string;
  detailUrl: string;
  animationUrl: string;
  videoUrl?: string;
  videoPosterUrl?: string;
  keyframes: ExerciseMediaFrame[];
  sourceProvider: string;
  sourcePath: string;
};

export type WorkoutSetDraft = {
  order: number;
  repsTarget: number;
  restSec: number;
  loadText?: string;
};

export type WorkoutEntryDraft = {
  exerciseSlug: string;
  notes?: string;
  sets: WorkoutSetDraft[];
};

export type WorkoutSessionDraft = {
  slug: string;
  title: LocalizedString;
  description: LocalizedString;
  ownerType?: OwnerType;
  sourceUrl?: string;
  entries: WorkoutEntryDraft[];
};

export type WorkoutPlanDraft = {
  slug: string;
  title: LocalizedString;
  description: LocalizedString;
  levelSlug: string;
  goalSlug: string;
  repeatEveryWeeks?: number;
  sessions: Array<{
    weekday: number;
    time: string;
    sessionSlug: string;
  }>;
  sourceUrl?: string;
};
