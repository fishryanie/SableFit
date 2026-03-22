import manifest from "@/data/system/exercise-media-manifest.json";
import type { ExerciseMedia } from "@/types/domain";

type ExerciseMediaManifest = Record<string, ExerciseMedia>;

const exerciseMediaManifest = manifest as ExerciseMediaManifest;

export function getFallbackExerciseMedia(slug: string): ExerciseMedia {
  return {
    style: "ANATOMY",
    status: "READY",
    thumbnailUrl: `/workout/exercise/${slug}/phase-01.webp`,
    detailUrl: `/workout/exercise/${slug}/phase-02.webp`,
    keyframes: [
      {
        order: 1,
        label: { en: "Key pose 1", vi: "Tư thế chính 1" },
        url: `/workout/exercise/${slug}/phase-01.webp`,
      },
      {
        order: 2,
        label: { en: "Key pose 2", vi: "Tư thế chính 2" },
        url: `/workout/exercise/${slug}/phase-02.webp`,
      },
    ],
    animationUrl: `/workout/exercise/${slug}/motion-slow.gif`,
    videoUrl: "",
    videoPosterUrl: "",
    sourceProvider: "LOCAL_CACHE",
    sourcePath: `/workout/exercise/${slug}`,
  };
}

export function getExerciseMedia(slug: string): ExerciseMedia {
  return exerciseMediaManifest[slug] ?? getFallbackExerciseMedia(slug);
}

export function getExerciseMediaManifest() {
  return exerciseMediaManifest;
}
