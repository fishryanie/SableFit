import Image from "next/image";
import type { ExerciseMedia } from "@/types/domain";

type ExerciseMediaFigureProps = {
  media?: ExerciseMedia;
  src?: string;
  alt: string;
  variant: "thumb" | "detail" | "motion" | "frame";
  priority?: boolean;
  className?: string;
};

const dimensions = {
  thumb: { width: 240, height: 240 },
  detail: { width: 960, height: 720 },
  motion: { width: 960, height: 720 },
  frame: { width: 480, height: 480 },
} as const;

export function ExerciseMediaFigure({
  media,
  src,
  alt,
  variant,
  priority = false,
  className = "",
}: ExerciseMediaFigureProps) {
  const preferredSrc =
    src ??
    (variant === "thumb"
      ? media?.thumbnailUrl
      : variant === "motion"
        ? media?.animationUrl
        : media?.detailUrl);

  if (!preferredSrc) {
    if (variant === "motion" && media?.videoUrl) {
      return (
        <video
          src={media.videoUrl}
          poster={media.videoPosterUrl || media.detailUrl}
          aria-label={alt}
          className={className}
          controls
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        />
      );
    }

    return null;
  }

  if (variant === "motion" && media?.videoUrl) {
    return (
      <video
        src={media.videoUrl}
        poster={media.videoPosterUrl || media.detailUrl}
        aria-label={alt}
        className={className}
        controls
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
      />
    );
  }

  const { width, height } = dimensions[variant];
  const isGif = preferredSrc.endsWith(".gif");

  return (
    <Image
      src={preferredSrc}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      unoptimized={isGif}
      className={className}
    />
  );
}
