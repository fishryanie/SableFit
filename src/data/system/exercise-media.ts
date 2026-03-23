import manifest from "@/data/system/exercise-media-manifest.json";
import { normalizeExerciseMedia } from "@/lib/exercise-movement";
import type { ExerciseMedia } from "@/types/domain";
import type { ExerciseMovementType } from "@/types/domain";

type ExerciseMediaManifest = Record<string, ExerciseMedia>;

const exerciseMediaManifest = manifest as unknown as ExerciseMediaManifest;

export function getFallbackExerciseMedia(
  slug: string,
  movementType: ExerciseMovementType = "DYNAMIC",
): ExerciseMedia {
  return normalizeExerciseMedia(
    {
    style: "ANATOMY",
    status: "READY",
    thumbnailUrl: `/workout/exercise/${slug}/phase-01.webp`,
    detailUrl: `/workout/exercise/${slug}/phase-02.webp`,
    keyframes: [],
    animationUrl: `/workout/exercise/${slug}/motion-slow.gif`,
    videoUrl: "",
    videoPosterUrl: "",
    sourceProvider: "LOCAL_CACHE",
    sourcePath: `/workout/exercise/${slug}`,
    },
    movementType,
    slug,
  );
}

export function getExerciseMedia(
  slug: string,
  movementType: ExerciseMovementType = "DYNAMIC",
): ExerciseMedia {
  const media = exerciseMediaManifest[slug] ?? getFallbackExerciseMedia(slug, movementType);
  return normalizeExerciseMedia(media, movementType, slug);
}

export function getExerciseMediaManifest() {
  return exerciseMediaManifest;
}
