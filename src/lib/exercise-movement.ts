import type {
  ExerciseMedia,
  ExerciseMediaFrame,
  ExerciseMediaFramePhase,
  ExerciseMovementType,
  LocalizedString,
} from "@/types/domain";

type FrameDefinition = {
  phase: ExerciseMediaFramePhase;
  label: LocalizedString;
};

const dynamicFrameDefinitions: FrameDefinition[] = [
  {
    phase: "ECCENTRIC",
    label: {
      en: "Eccentric",
      vi: "Pha eccentric",
    },
  },
  {
    phase: "CONCENTRIC",
    label: {
      en: "Concentric",
      vi: "Pha concentric",
    },
  },
];

const isometricFrameDefinitions: FrameDefinition[] = [
  {
    phase: "SETUP",
    label: {
      en: "Setup",
      vi: "Vào tư thế",
    },
  },
  {
    phase: "HOLD",
    label: {
      en: "Hold",
      vi: "Giữ tĩnh",
    },
  },
];

export function getExerciseMovementType(
  categorySlugs: string[],
  name: string,
): ExerciseMovementType {
  const normalized = `${name} ${categorySlugs.join(" ")}`.toLowerCase();

  if (
    categorySlugs.includes("isometric") ||
    /plank|hold|pallof|wall sit|hollow body|dead bug hold|bird dog hold/.test(normalized)
  ) {
    return "ISOMETRIC";
  }

  return "DYNAMIC";
}

export function getExerciseMovementTypeLabel(
  movementType: ExerciseMovementType,
): LocalizedString {
  return movementType === "ISOMETRIC"
    ? { en: "Isometric", vi: "Isometric" }
    : { en: "Dynamic", vi: "Động" };
}

export function getExerciseFrameDefinitions(
  movementType: ExerciseMovementType,
): FrameDefinition[] {
  return movementType === "ISOMETRIC"
    ? isometricFrameDefinitions
    : dynamicFrameDefinitions;
}

export function normalizeExerciseMedia(
  media: ExerciseMedia,
  movementType: ExerciseMovementType,
  slug: string,
): ExerciseMedia {
  const phase1Url =
    media.keyframes[0]?.url || media.thumbnailUrl || `/workout/exercise/${slug}/phase-01.webp`;
  const phase2Url =
    media.keyframes[1]?.url || media.detailUrl || `/workout/exercise/${slug}/phase-02.webp`;
  const animationUrl = media.animationUrl || `/workout/exercise/${slug}/motion-slow.gif`;
  const frameDefinitions = getExerciseFrameDefinitions(movementType);

  const keyframes: ExerciseMediaFrame[] = frameDefinitions.map((definition, index) => ({
    order: index + 1,
    phase: definition.phase,
    label: definition.label,
    url: index === 0 ? phase1Url : phase2Url,
  }));

  return {
    ...media,
    thumbnailUrl: media.thumbnailUrl || phase1Url,
    detailUrl: media.detailUrl || phase2Url,
    animationUrl,
    keyframes,
  };
}
