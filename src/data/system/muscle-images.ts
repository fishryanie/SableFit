import manifest from "@/data/system/muscle-image-manifest.json";

export type MuscleImageAsset = {
  imageUrl: string;
  sourcePath: string;
  status: "PROVIDED" | "DERIVED";
};

type MuscleImageManifest = Record<string, MuscleImageAsset>;

const muscleImageManifest = manifest as MuscleImageManifest;

export function getFallbackMuscleImage(slug: string): MuscleImageAsset {
  return {
    imageUrl: `/workout/muscle/${slug}/primary.png`,
    sourcePath: `/workout/muscle/${slug}/primary.png`,
    status: "DERIVED",
  };
}

export function getMuscleImage(slug: string): MuscleImageAsset {
  return muscleImageManifest[slug] ?? getFallbackMuscleImage(slug);
}

export function getMuscleImageManifest() {
  return muscleImageManifest;
}
