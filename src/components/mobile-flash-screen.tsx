"use client";

import { useEffect, useState } from "react";
import { BrandLockup } from "@/components/brand-lockup";

function isMobileDevice() {
  if (typeof navigator === "undefined") {
    return false;
  }

  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
}

export function MobileFlashScreen() {
  const [phase, setPhase] = useState<"hidden" | "show" | "fade">(() =>
    isMobileDevice() ? "show" : "hidden",
  );

  useEffect(() => {
    if (phase === "hidden") {
      return;
    }

    const fadeTimer = window.setTimeout(() => setPhase("fade"), 600);
    const hideTimer = window.setTimeout(() => setPhase("hidden"), 960);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(hideTimer);
    };
  }, [phase]);

  if (phase === "hidden") {
    return null;
  }

  return (
    <div
      className={`pointer-events-none fixed inset-0 z-[2200] flex items-center justify-center bg-[#111111] transition-opacity duration-300 ${
        phase === "fade" ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="flex flex-col items-center gap-3">
        <BrandLockup inverse markSize={78} wordmarkWidth={186} />
        <p className="m-0 text-xs uppercase tracking-[0.28em] text-white/56">Workout PWA</p>
      </div>
    </div>
  );
}
