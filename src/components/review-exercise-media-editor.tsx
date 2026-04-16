"use client";

import Image from "next/image";
import {
  ImagePlus,
  Loader2,
  PencilLine,
  PlayCircle,
  Trash2,
  Video,
} from "lucide-react";
import { startTransition, useEffect, useState } from "react";
import type { ReviewExerciseItem } from "@/lib/data";
import { getLocalizedText } from "@/lib/localized";
import type { AppLocale } from "@/types/domain";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type ReviewExerciseMediaEditorProps = {
  locale: AppLocale;
  exercise: ReviewExerciseItem;
  dictionary: {
    editMedia: string;
    editMediaDescription: string;
    currentImage: string;
    currentVideo: string;
    currentPath: string;
    customMedia: string;
    defaultMedia: string;
    sourcePathLabel: string;
    sourcePathPlaceholder: string;
    sourcePathHelp: string;
    targetDirectory: string;
    saveImage: string;
    saveVideo: string;
    removeImage: string;
    removeVideo: string;
    noVideo: string;
    saving: string;
    failedToSave: string;
  };
  onExerciseChange: (exercise: ReviewExerciseItem) => void;
};

type SaveAction = "image" | "video" | "clear-image" | "clear-video" | null;

function isCustomAsset(url: string | undefined, slug: string) {
  return Boolean(url?.includes(`/workout/exercise/${slug}/review/`));
}

export function ReviewExerciseMediaEditor({
  locale,
  exercise,
  dictionary,
  onExerciseChange,
}: ReviewExerciseMediaEditorProps) {
  const title = getLocalizedText(locale, exercise.name);
  const [open, setOpen] = useState(false);
  const [imageSourcePath, setImageSourcePath] = useState("");
  const [videoSourcePath, setVideoSourcePath] = useState("");
  const [pendingAction, setPendingAction] = useState<SaveAction>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      setImageSourcePath("");
      setVideoSourcePath("");
      setError("");
    }
  }, [open, exercise.imageUrl, exercise.media.videoUrl]);

  async function submit(action: Exclude<SaveAction, null>) {
    setPendingAction(action);
    setError("");

    const payload =
      action === "image"
        ? { imageSourcePath }
        : action === "video"
          ? { videoSourcePath }
          : action === "clear-image"
            ? { clearImage: true }
            : { clearVideo: true };

    try {
      const response = await fetch(`/api/app/review/exercises/${exercise.slug}/media`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = (await response.json().catch(() => null)) as
        | {
            ok?: boolean;
            item?: {
              imageUrl: string;
              media: ReviewExerciseItem["media"];
            };
            message?: string;
          }
        | null;

      if (!response.ok || !data?.ok || !data.item) {
        setError(data?.message || dictionary.failedToSave);
        return;
      }

      startTransition(() => {
        onExerciseChange({
          ...exercise,
          imageUrl: data.item?.imageUrl ?? exercise.imageUrl,
          media: data.item?.media ?? exercise.media,
        });
      });

      if (action === "image" || action === "clear-image") {
        setImageSourcePath("");
      }
      if (action === "video" || action === "clear-video") {
        setVideoSourcePath("");
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : dictionary.failedToSave);
    } finally {
      setPendingAction(null);
    }
  }

  const isSaving = pendingAction !== null;
  const reviewAssetDirectory = `/workout/exercise/${exercise.slug}/review`;
  const currentVideoUrl = exercise.media.videoUrl || "";
  const hasCustomImage = isCustomAsset(exercise.imageUrl, exercise.slug);
  const hasCustomVideo = isCustomAsset(currentVideoUrl, exercise.slug);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <PencilLine className="h-3.5 w-3.5" />
          {dictionary.editMedia}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-[44rem]">
        <div className="flex h-full flex-col">
          <SheetHeader className="border-b px-5 py-4 text-left">
            <SheetTitle>{title}</SheetTitle>
            <SheetDescription>{dictionary.editMediaDescription}</SheetDescription>
          </SheetHeader>

          <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
            <section className="rounded-2xl border bg-muted/15 p-4">
              <div className="mb-3 flex items-center gap-2">
                <ImagePlus className="h-4 w-4" />
                <p className="text-sm font-semibold text-foreground">{dictionary.currentImage}</p>
                <Badge variant="outline" className="rounded-full">
                  {hasCustomImage ? dictionary.customMedia : dictionary.defaultMedia}
                </Badge>
              </div>
              <div className="overflow-hidden rounded-2xl border bg-background p-3">
                <div className="flex min-h-[180px] items-center justify-center rounded-xl bg-muted/25 p-3">
                  <Image
                    src={exercise.imageUrl}
                    alt={title}
                    width={360}
                    height={360}
                    unoptimized
                    className="max-h-[220px] w-full object-contain"
                  />
                </div>
                <div className="mt-3 space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    {dictionary.currentPath}
                  </p>
                  <p className="break-all text-sm text-foreground">{exercise.imageUrl}</p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border bg-muted/15 p-4">
              <div className="mb-3 flex items-center gap-2">
                <Video className="h-4 w-4" />
                <p className="text-sm font-semibold text-foreground">{dictionary.currentVideo}</p>
                <Badge variant="outline" className="rounded-full">
                  {hasCustomVideo ? dictionary.customMedia : dictionary.defaultMedia}
                </Badge>
              </div>
              <div className="overflow-hidden rounded-2xl border bg-background p-3">
                {currentVideoUrl ? (
                  <div className="space-y-3">
                    <div className="overflow-hidden rounded-xl bg-black">
                      <video
                        src={currentVideoUrl}
                        poster={exercise.media.videoPosterUrl || exercise.imageUrl}
                        className="mx-auto aspect-[9/16] w-full max-w-[280px] object-contain"
                        controls
                        playsInline
                        preload="metadata"
                      />
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">
                        {dictionary.currentPath}
                      </p>
                      <p className="break-all text-sm text-foreground">{currentVideoUrl}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex min-h-[120px] items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground">
                    {dictionary.noVideo}
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-2xl border bg-background p-4">
              <div className="space-y-2">
                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  {dictionary.targetDirectory}
                </p>
                <p className="break-all text-sm text-foreground">{reviewAssetDirectory}</p>
                <p className="text-xs leading-5 text-muted-foreground">{dictionary.sourcePathHelp}</p>
              </div>
            </section>

            <section className="rounded-2xl border bg-background p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                <ImagePlus className="h-4 w-4" />
                {dictionary.currentImage}
              </div>
              <label className="space-y-2">
                <span className="text-sm text-muted-foreground">{dictionary.sourcePathLabel}</span>
                <Input
                  value={imageSourcePath}
                  onChange={(event) => setImageSourcePath(event.target.value)}
                  placeholder={dictionary.sourcePathPlaceholder}
                  disabled={isSaving}
                />
              </label>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  type="button"
                  onClick={() => submit("image")}
                  disabled={isSaving || !imageSourcePath.trim()}
                >
                  {pendingAction === "image" ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <ImagePlus className="h-3.5 w-3.5" />
                  )}
                  {pendingAction === "image" ? dictionary.saving : dictionary.saveImage}
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => submit("clear-image")}
                  disabled={isSaving || !hasCustomImage}
                >
                  {pendingAction === "clear-image" ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                  {dictionary.removeImage}
                </Button>
              </div>
            </section>

            <section className="rounded-2xl border bg-background p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                <PlayCircle className="h-4 w-4" />
                {dictionary.currentVideo}
              </div>
              <label className="space-y-2">
                <span className="text-sm text-muted-foreground">{dictionary.sourcePathLabel}</span>
                <Input
                  value={videoSourcePath}
                  onChange={(event) => setVideoSourcePath(event.target.value)}
                  placeholder={dictionary.sourcePathPlaceholder}
                  disabled={isSaving}
                />
              </label>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  type="button"
                  onClick={() => submit("video")}
                  disabled={isSaving || !videoSourcePath.trim()}
                >
                  {pendingAction === "video" ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <PlayCircle className="h-3.5 w-3.5" />
                  )}
                  {pendingAction === "video" ? dictionary.saving : dictionary.saveVideo}
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => submit("clear-video")}
                  disabled={isSaving || !hasCustomVideo}
                >
                  {pendingAction === "clear-video" ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                  {dictionary.removeVideo}
                </Button>
              </div>
            </section>

            {error ? (
              <div className="rounded-2xl border border-destructive/25 bg-destructive/8 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            ) : null}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
