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
  const content = (
    <span className={`inline-flex items-center gap-3 ${className}`.trim()}>
      <Image
        src={inverse ? "/brand/sablefit-mark-inverse.svg" : "/brand/sablefit-mark.svg"}
        alt="SableFit"
        width={markSize}
        height={markSize}
        priority={priority}
        unoptimized
        className="h-auto w-auto"
      />
      <Image
        src={inverse ? "/brand/sablefit-wordmark-inverse.svg" : "/brand/sablefit-wordmark.svg"}
        alt="SableFit"
        width={wordmarkWidth}
        height={36}
        priority={priority}
        unoptimized
        className="h-auto w-auto"
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
