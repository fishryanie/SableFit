"use client";

import { Download, Share2, Smartphone, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
};

function isMobileUserAgent() {
  if (typeof navigator === "undefined") {
    return false;
  }

  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
}

function isIos() {
  if (typeof navigator === "undefined") {
    return false;
  }

  const iOSByUa = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  const iPadOs = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  return iOSByUa || iPadOs;
}

function isStandaloneMode() {
  if (typeof window === "undefined") {
    return false;
  }

  const byMedia = window.matchMedia("(display-mode: standalone)").matches;
  const byNavigator = Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
  return byMedia || byNavigator;
}

async function updateInstallState(payload: { dismissed?: boolean; installed?: boolean }) {
  try {
    await fetch("/api/manifest/install-state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    return undefined;
  }
}

export function PwaMobileInstall() {
  const t = useTranslations("pwaPrompt");
  const [isOpen, setIsOpen] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIosDevice, setIsIosDevice] = useState(false);
  const [manualHint, setManualHint] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (!isMobileUserAgent() || isStandaloneMode()) {
      return;
    }

    const dismissed = window.localStorage.getItem("sablefit-install-dismissed") === "1";
    if (dismissed) {
      return;
    }

    setIsIosDevice(isIos());
    setIsOpen(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    const onAppInstalled = () => {
      setIsOpen(false);
      setDeferredPrompt(null);
      updateInstallState({ installed: true });
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (!("serviceWorker" in navigator) || !window.isSecureContext) {
      return;
    }

    if (process.env.NODE_ENV !== "production") {
      navigator.serviceWorker
        .getRegistrations()
        .then((registrations) =>
          Promise.all(registrations.map((registration) => registration.unregister())),
        )
        .catch(() => undefined);
      return;
    }

    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => registration.update())
      .catch((error) => {
        console.error("[pwa] service worker registration failed", error);
      });
  }, []);

  const installButtonLabel = useMemo(() => {
    if (deferredPrompt) {
      return t("installButton");
    }

    if (isIosDevice) {
      return t("iosButton");
    }

    return t("androidButton");
  }, [deferredPrompt, isIosDevice, t]);

  async function closePrompt() {
    setIsOpen(false);
    window.localStorage.setItem("sablefit-install-dismissed", "1");
    await updateInstallState({ dismissed: true });
  }

  async function handleInstallClick() {
    if (isIosDevice) {
      if (typeof navigator !== "undefined" && "share" in navigator) {
        try {
          setInstalling(true);
          await navigator.share({
            title: t("title"),
            text: t("subtitle"),
            url: window.location.href,
          });
          setManualHint(t("iosShareOpenedHint"));
        } catch {
          setManualHint(t("iosShareFallbackHint"));
        } finally {
          setInstalling(false);
        }
        return;
      }

      setManualHint(t("iosShareFallbackHint"));
      return;
    }

    if (!deferredPrompt) {
      setManualHint(t("androidManual"));
      return;
    }

    try {
      setInstalling(true);
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;

      if (choice.outcome === "accepted") {
        setIsOpen(false);
        await updateInstallState({ installed: true });
      }
    } finally {
      setInstalling(false);
      setDeferredPrompt(null);
    }
  }

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[1000] flex items-end justify-center bg-black/55 p-3">
      <div className="w-full max-w-md rounded-[28px] border border-border-strong bg-background-secondary p-4 shadow-[0_24px_64px_rgba(17,17,17,0.16)]">
        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="flex items-start gap-2.5">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-500 text-foreground-inverted">
              <Smartphone className="h-5 w-5" />
            </span>
            <div>
              <p className="m-0 font-heading text-base font-semibold text-foreground">{t("title")}</p>
              <p className="m-0 mt-1 text-xs text-foreground-secondary">{t("subtitle")}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={closePrompt}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background-tertiary text-foreground-secondary"
            aria-label={t("closeAria")}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="rounded-3xl border border-border bg-background-tertiary p-3 text-xs text-foreground-secondary">
          {isIosDevice ? (
            <div className="space-y-1.5">
              <p className="m-0 font-medium text-foreground">{t("iosTitle")}</p>
              <p className="m-0">
                <span className="font-semibold text-foreground">1.</span> {t("iosStep1")}
              </p>
              <p className="m-0 inline-flex items-center gap-1">
                <span className="font-semibold text-foreground">2.</span> {t("iosStep2")}{" "}
                <Share2 className="h-3.5 w-3.5 text-foreground" />
              </p>
              <p className="m-0">
                <span className="font-semibold text-foreground">3.</span> {t("iosStep3")}
              </p>
            </div>
          ) : (
            <div className="space-y-1.5">
              <p className="m-0 font-medium text-foreground">{t("androidTitle")}</p>
              {deferredPrompt ? (
                <p className="m-0">{t("androidReady")}</p>
              ) : (
                <p className="m-0">{t("androidManual")}</p>
              )}
            </div>
          )}
        </div>

        {manualHint ? <p className="m-0 mt-2 text-xs text-accent-500">{manualHint}</p> : null}

        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={closePrompt}
            className="inline-flex h-11 items-center justify-center rounded-full border border-border bg-background-tertiary px-3 text-sm font-medium text-foreground-secondary"
          >
            {t("skipButton")}
          </button>

          <button
            type="button"
            onClick={handleInstallClick}
            disabled={installing}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary-500 px-3 text-sm font-semibold text-foreground-inverted disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Download className="h-4 w-4" />
            {installing ? t("installing") : installButtonLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
