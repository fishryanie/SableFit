"use client";

import { useState, type ReactNode } from "react";
import { Images, PlayCircle, ZoomIn } from "lucide-react";
import { ExerciseMediaFigure } from "@/components/exercise-media-figure";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { getLocalizedText } from "@/lib/localized";
import { cn } from "@/lib/utils";
import type { AppLocale, ExerciseMedia, ExerciseMovementType } from "@/types/domain";

type PreviewDictionary = {
  motionLabel: string;
  framesLabel: string;
  movementTypeLabel: string;
  movementTypes: {
    dynamic: string;
    isometric: string;
  };
};

function ExerciseMediaPreviewContent({
  locale,
  title,
  alt,
  media,
  movementType,
  dictionary,
}: {
  locale: AppLocale;
  title: string;
  alt: string;
  media: ExerciseMedia;
  movementType: ExerciseMovementType;
  dictionary: PreviewDictionary;
}) {
  const motionClassName = media.videoUrl
    ? "mx-auto aspect-[9/16] w-full max-w-[280px] object-contain"
    : "aspect-[4/3] w-full object-contain";

  return (
    <div className="flex h-full flex-col">
      <SheetHeader className="gap-3 border-b bg-background px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <SheetTitle className="text-xl">{title}</SheetTitle>
            <SheetDescription className="mt-1">
              {dictionary.movementTypeLabel}
            </SheetDescription>
          </div>
          <Badge variant="outline" className="rounded-full">
            {movementType === "ISOMETRIC"
              ? dictionary.movementTypes.isometric
              : dictionary.movementTypes.dynamic}
          </Badge>
        </div>
      </SheetHeader>

      <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
        <section className="rounded-2xl border bg-muted/20 p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
            <PlayCircle className="h-4 w-4" />
            {dictionary.motionLabel}
          </div>
          <div className="overflow-hidden rounded-2xl bg-white p-3">
            <ExerciseMediaFigure
              media={media}
              alt={alt}
              variant="motion"
              className={motionClassName}
            />
          </div>
        </section>

        <section className="rounded-2xl border bg-muted/20 p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
            <Images className="h-4 w-4" />
            {dictionary.framesLabel}
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {media.keyframes.slice(0, 2).map((frame) => (
              <div key={`${title}-${frame.order}`} className="rounded-2xl bg-background p-3">
                <div className="overflow-hidden rounded-2xl bg-white p-2">
                  <ExerciseMediaFigure
                    src={frame.url}
                    alt={`${alt} ${getLocalizedText(locale, frame.label)}`}
                    variant="frame"
                    className="aspect-square w-full object-contain"
                  />
                </div>
                <p className="mt-3 text-center text-sm font-semibold text-foreground">
                  {getLocalizedText(locale, frame.label)}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export function ExerciseMediaPreviewSheet({
  locale,
  title,
  alt,
  media,
  movementType,
  dictionary,
  trigger,
}: {
  locale: AppLocale;
  title: string;
  alt: string;
  media: ExerciseMedia;
  movementType: ExerciseMovementType;
  dictionary: PreviewDictionary;
  trigger: ReactNode;
}) {
  return (
    <Sheet>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent
        side="right"
        className="w-full gap-0 p-0 sm:max-w-[42rem]"
      >
        <ExerciseMediaPreviewContent
          locale={locale}
          title={title}
          alt={alt}
          media={media}
          movementType={movementType}
          dictionary={dictionary}
        />
      </SheetContent>
    </Sheet>
  );
}

export function ExerciseMediaGallery({
  locale,
  title,
  alt,
  media,
  movementType,
  dictionary,
}: {
  locale: AppLocale;
  title: string;
  alt: string;
  media: ExerciseMedia;
  movementType: ExerciseMovementType;
  dictionary: PreviewDictionary;
}) {
  const [open, setOpen] = useState(false);
  const keyframes = media.keyframes.slice(0, 2);
  const motionClassName = media.videoUrl
    ? "aspect-[9/16] mx-auto w-full max-w-[250px] object-contain"
    : "aspect-[4/3] w-full object-contain";

  return (
    <>
      <div className="space-y-4">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="block w-full rounded-[34px] bg-background-secondary p-4 text-left shadow-[0_12px_30px_rgba(17,17,17,0.04)] transition-transform hover:-translate-y-0.5"
          >
            <div className="mb-3 flex items-center justify-between gap-3 text-sm font-semibold text-foreground">
              <span className="flex items-center gap-2">
                <PlayCircle className="h-5 w-5" />
                {dictionary.motionLabel}
              </span>
              <ZoomIn className="h-4 w-4 text-foreground-muted" />
            </div>
            <div className="overflow-hidden rounded-[28px] bg-white p-3">
              <ExerciseMediaFigure
                media={media}
                alt={alt}
                variant="motion"
                priority
                className={motionClassName}
              />
            </div>
          </button>

          <div className="rounded-[30px] bg-background-secondary p-4 shadow-[0_12px_30px_rgba(17,17,17,0.04)]">
            <div className="mb-3 flex items-center justify-between gap-3 text-sm font-semibold text-foreground">
              <span>{dictionary.framesLabel}</span>
              <ZoomIn className="h-4 w-4 text-foreground-muted" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {keyframes.map((frame) => (
                <button
                  key={`${title}-frame-${frame.order}`}
                  type="button"
                  onClick={() => setOpen(true)}
                  className="rounded-[24px] bg-background p-3 text-left transition-transform hover:-translate-y-0.5"
                >
                  <div className="overflow-hidden rounded-[20px] bg-white p-2">
                    <ExerciseMediaFigure
                      src={frame.url}
                      alt={`${alt} ${getLocalizedText(locale, frame.label)}`}
                      variant="frame"
                      className="aspect-square w-full object-contain"
                    />
                  </div>
                  <p className="mt-3 text-center text-sm font-semibold text-foreground">
                    {getLocalizedText(locale, frame.label)}
                  </p>
                </button>
              ))}
            </div>
          </div>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          className="w-full gap-0 p-0 sm:max-w-[42rem]"
        >
          <ExerciseMediaPreviewContent
            locale={locale}
            title={title}
            alt={alt}
            media={media}
            movementType={movementType}
            dictionary={dictionary}
          />
        </SheetContent>
      </Sheet>
    </>
  );
}

export function ExerciseThumbnailPreview({
  locale,
  title,
  alt,
  media,
  movementType,
  dictionary,
  className,
  showOverlayIcon = true,
  children,
}: {
  locale: AppLocale;
  title: string;
  alt: string;
  media: ExerciseMedia;
  movementType: ExerciseMovementType;
  dictionary: PreviewDictionary;
  className?: string;
  showOverlayIcon?: boolean;
  children: ReactNode;
}) {
  return (
    <ExerciseMediaPreviewSheet
      locale={locale}
      title={title}
      alt={alt}
      media={media}
      movementType={movementType}
      dictionary={dictionary}
      trigger={
        <button
          type="button"
          className={cn(
            "group block text-left transition-transform hover:-translate-y-0.5",
            className,
          )}
        >
          <div className="relative">
            {children}
            {showOverlayIcon ? (
              <span className="pointer-events-none absolute bottom-2 right-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm">
                <ZoomIn className="h-4 w-4" />
              </span>
            ) : null}
          </div>
        </button>
      }
    />
  );
}
