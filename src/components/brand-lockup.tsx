import Image from "next/image";
import Link from "next/link";

type BrandLockupProps = {
  href?: string;
  inverse?: boolean;
  priority?: boolean;
  markSize?: number;
  wordmarkWidth?: number;
  className?: string;
};

export function BrandLockup({
  href,
  inverse = false,
  priority = false,
  markSize = 34,
  wordmarkWidth = 146,
  className = "",
}: BrandLockupProps) {
  const wordmarkHeight = Math.round((wordmarkWidth * 104) / 306);

  const content = (
    <span className={`inline-flex items-center gap-3 ${className}`.trim()}>
      <Image
        src={inverse ? "/brand/sablefit-mark-inverse.svg" : "/brand/sablefit-mark.svg"}
        alt="SableFit"
        width={markSize}
        height={markSize}
        priority={priority}
        unoptimized
        className="shrink-0"
        style={{ width: `${markSize}px`, height: `${markSize}px` }}
      />
      <Image
        src={inverse ? "/brand/sablefit-wordmark-text-inverse.svg" : "/brand/sablefit-wordmark-text.svg"}
        alt="SableFit"
        width={wordmarkWidth}
        height={wordmarkHeight}
        priority={priority}
        unoptimized
        className="shrink-0"
        style={{ width: `${wordmarkWidth}px`, height: "auto" }}
      />
    </span>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center">
        {content}
      </Link>
    );
  }

  return content;
}
