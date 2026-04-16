import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import type { ExerciseMedia } from "@/types/domain";

export type ExerciseAssetOverride = {
  imageUrl?: string;
  videoUrl?: string;
  videoPosterUrl?: string;
};

type ExerciseAssetKind = "image" | "video" | "videoPoster";

const OVERRIDES_PATH = path.join(
  process.cwd(),
  "src/data/system/exercise-asset-overrides.json",
);
const PUBLIC_ROOT = path.join(process.cwd(), "public");
let cachedOverrides: Record<string, ExerciseAssetOverride> | null = null;

const imageExtensions = new Set([
  ".avif",
  ".gif",
  ".jpeg",
  ".jpg",
  ".png",
  ".svg",
  ".webp",
]);
const videoExtensions = new Set([".m4v", ".mov", ".mp4", ".webm"]);

const assetPrefixByKind: Record<ExerciseAssetKind, string> = {
  image: "review-image",
  video: "review-video",
  videoPoster: "review-video-poster",
};

function normalizeSlashPath(value: string) {
  return value.split(path.sep).join("/");
}

function isFile(value: string) {
  try {
    return statSync(value).isFile();
  } catch {
    return false;
  }
}

function readOverridesFile() {
  if (cachedOverrides) {
    return cachedOverrides;
  }

  if (!existsSync(OVERRIDES_PATH)) {
    cachedOverrides = {};
    return cachedOverrides;
  }

  try {
    const content = readFileSync(OVERRIDES_PATH, "utf8");
    cachedOverrides = JSON.parse(content) as Record<string, ExerciseAssetOverride>;
    return cachedOverrides;
  } catch {
    cachedOverrides = {};
    return cachedOverrides;
  }
}

function writeOverridesFile(overrides: Record<string, ExerciseAssetOverride>) {
  cachedOverrides = overrides;
  writeFileSync(OVERRIDES_PATH, `${JSON.stringify(overrides, null, 2)}\n`, "utf8");
}

function getReviewAssetDirectory(slug: string) {
  return path.join(PUBLIC_ROOT, "workout", "exercise", slug, "review");
}

function getReviewAssetPublicDirectory(slug: string) {
  return `/workout/exercise/${slug}/review`;
}

function resolveInputFile(sourcePath: string) {
  const trimmed = sourcePath.trim();
  if (!trimmed) {
    throw new Error("Missing source path.");
  }

  if (path.isAbsolute(trimmed) && isFile(trimmed)) {
    return trimmed;
  }

  const publicCandidate = path.join(PUBLIC_ROOT, trimmed.replace(/^\/+/, ""));
  if (isFile(publicCandidate)) {
    return publicCandidate;
  }

  throw new Error("Source file was not found.");
}

function ensureExtension(kind: ExerciseAssetKind, sourcePath: string) {
  const extension = path.extname(sourcePath).toLowerCase();
  const allowed = kind === "video" ? videoExtensions : imageExtensions;

  if (!allowed.has(extension)) {
    throw new Error(
      kind === "video"
        ? "Unsupported video format."
        : "Unsupported image format.",
    );
  }

  return extension;
}

function cleanupReviewFiles(
  slug: string,
  kind: ExerciseAssetKind,
  {
    except,
  }: {
    except?: string;
  } = {},
) {
  const directory = getReviewAssetDirectory(slug);
  if (!existsSync(directory)) {
    return;
  }

  const prefix = assetPrefixByKind[kind];

  for (const entry of readdirSync(directory)) {
    if (!entry.startsWith(`${prefix}.`)) {
      continue;
    }

    const absolutePath = path.join(directory, entry);
    if (except && absolutePath === except) {
      continue;
    }

    rmSync(absolutePath, { force: true });
  }
}

export function getExerciseAssetOverrides() {
  return readOverridesFile();
}

export function getExerciseAssetOverride(slug: string) {
  return readOverridesFile()[slug] ?? {};
}

export function getExerciseReviewPublicDirectory(slug: string) {
  return getReviewAssetPublicDirectory(slug);
}

export function applyExerciseAssetOverrideToExercise({
  slug,
  imageUrl,
  media,
}: {
  slug: string;
  imageUrl: string;
  media: ExerciseMedia;
}) {
  const override = getExerciseAssetOverride(slug);

  return {
    imageUrl: override.imageUrl || imageUrl,
    media: {
      ...media,
      videoUrl: override.videoUrl ?? media.videoUrl ?? "",
      videoPosterUrl: override.videoPosterUrl ?? media.videoPosterUrl ?? "",
    },
  };
}

export function importExerciseReviewAsset({
  slug,
  kind,
  sourcePath,
}: {
  slug: string;
  kind: ExerciseAssetKind;
  sourcePath: string;
}) {
  const sourceAbsolutePath = resolveInputFile(sourcePath);
  const extension = ensureExtension(kind, sourceAbsolutePath);
  const directory = getReviewAssetDirectory(slug);
  const filename = `${assetPrefixByKind[kind]}${extension}`;
  const targetAbsolutePath = path.join(directory, filename);

  mkdirSync(directory, { recursive: true });
  cleanupReviewFiles(slug, kind, { except: targetAbsolutePath });

  if (sourceAbsolutePath !== targetAbsolutePath) {
    copyFileSync(sourceAbsolutePath, targetAbsolutePath);
  }

  const publicUrl = `${getReviewAssetPublicDirectory(slug)}/${filename}`;

  return {
    absolutePath: targetAbsolutePath,
    publicUrl,
  };
}

export function removeExerciseReviewAsset({
  slug,
  kind,
}: {
  slug: string;
  kind: ExerciseAssetKind;
}) {
  cleanupReviewFiles(slug, kind);
}

export function updateExerciseAssetOverride(
  slug: string,
  update: Partial<ExerciseAssetOverride>,
) {
  const overrides = readOverridesFile();
  const current = overrides[slug] ?? {};
  const next: ExerciseAssetOverride = {
    ...current,
    ...update,
  };

  for (const key of ["imageUrl", "videoUrl", "videoPosterUrl"] as Array<
    keyof ExerciseAssetOverride
  >) {
    if (!next[key]) {
      delete next[key];
    }
  }

  if (!Object.keys(next).length) {
    delete overrides[slug];
  } else {
    overrides[slug] = next;
  }

  writeOverridesFile(overrides);

  return overrides[slug] ?? {};
}

export function toPublicAssetUrl(absolutePath: string) {
  const relativePath = path.relative(PUBLIC_ROOT, absolutePath);
  return `/${normalizeSlashPath(relativePath)}`;
}
