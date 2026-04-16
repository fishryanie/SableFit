import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { getFallbackExerciseMedia } from "@/data/system/exercise-media";
import {
  getExerciseReviewPublicDirectory,
  importExerciseReviewAsset,
  removeExerciseReviewAsset,
  updateExerciseAssetOverride,
} from "@/data/system/exercise-assets";
import { getAuthSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { Exercise } from "@/models/catalog";
import type { ExerciseMedia } from "@/types/domain";

type MediaUpdatePayload = {
  imageSourcePath?: string;
  videoSourcePath?: string;
  clearImage?: boolean;
  clearVideo?: boolean;
};

function hasText(value?: string) {
  return Boolean(value?.trim());
}

export async function PATCH(
  request: Request,
  context: {
    params: Promise<{ slug: string }>;
  },
) {
  const session = await getAuthSession();
  if (!session) {
    return NextResponse.json({ ok: false, message: "Unauthorized." }, { status: 401 });
  }

  const payload = (await request.json().catch(() => null)) as MediaUpdatePayload | null;
  const { slug } = await context.params;

  if (
    !payload ||
    (!hasText(payload.imageSourcePath) &&
      !hasText(payload.videoSourcePath) &&
      !payload.clearImage &&
      !payload.clearVideo)
  ) {
    return NextResponse.json({ ok: false, message: "Nothing to update." }, { status: 400 });
  }

  await connectToDatabase();

  const exercise = await Exercise.findOne({ slug, reviewStatus: "APPROVED" }).lean();
  if (!exercise) {
    return NextResponse.json({ ok: false, message: "Exercise not found." }, { status: 404 });
  }

  try {
    const overrideUpdate: {
      imageUrl?: string;
      videoUrl?: string;
      videoPosterUrl?: string;
    } = {};

    if (hasText(payload.imageSourcePath)) {
      const importedImage = importExerciseReviewAsset({
        slug,
        kind: "image",
        sourcePath: payload.imageSourcePath ?? "",
      });
      overrideUpdate.imageUrl = importedImage.publicUrl;
    } else if (payload.clearImage) {
      removeExerciseReviewAsset({ slug, kind: "image" });
      overrideUpdate.imageUrl = "";
    }

    if (hasText(payload.videoSourcePath)) {
      const importedVideo = importExerciseReviewAsset({
        slug,
        kind: "video",
        sourcePath: payload.videoSourcePath ?? "",
      });
      overrideUpdate.videoUrl = importedVideo.publicUrl;
    } else if (payload.clearVideo) {
      removeExerciseReviewAsset({ slug, kind: "video" });
      removeExerciseReviewAsset({ slug, kind: "videoPoster" });
      overrideUpdate.videoUrl = "";
      overrideUpdate.videoPosterUrl = "";
    }

    const nextOverride = updateExerciseAssetOverride(slug, overrideUpdate);
    const currentMedia =
      (exercise.media as ExerciseMedia | undefined) ??
      getFallbackExerciseMedia(slug, exercise.movementType ?? "DYNAMIC");

    const nextImageUrl = nextOverride.imageUrl || currentMedia.thumbnailUrl || exercise.imageUrl;
    const nextMedia: ExerciseMedia = {
      ...currentMedia,
      videoUrl: nextOverride.videoUrl ?? "",
      videoPosterUrl: nextOverride.videoPosterUrl ?? "",
    };

    await Exercise.updateOne(
      { _id: exercise._id },
      {
        $set: {
          imageUrl: nextImageUrl,
          media: nextMedia,
        },
      },
    );

    revalidateTag("review-dashboard-snapshot", "max");
    revalidatePath("/app/review");
    revalidatePath("/app/library");
    revalidatePath(`/app/library/${slug}`);
    revalidatePath("/exercises");
    revalidatePath(`/exercises/${slug}`);

    return NextResponse.json({
      ok: true,
      item: {
        id: String(exercise._id),
        slug,
        imageUrl: nextImageUrl,
        media: nextMedia,
      },
      reviewAssetDirectory: getExerciseReviewPublicDirectory(slug),
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "Could not update exercise media.",
      },
      { status: 400 },
    );
  }
}
