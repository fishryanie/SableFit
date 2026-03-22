"use client";

import { BellOff, BellPlus, BellRing } from "lucide-react";
import { startTransition, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";

function isIosMobile() {
  if (typeof navigator === "undefined") {
    return false;
  }

  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function isStandaloneMode() {
  if (typeof window === "undefined") {
    return false;
  }

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    Boolean((navigator as Navigator & { standalone?: boolean }).standalone)
  );
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

type PushSubscriptionCardProps = {
  hasActiveSubscription: boolean;
};

export function PushSubscriptionCard({ hasActiveSubscription }: PushSubscriptionCardProps) {
  const router = useRouter();
  const locale = useLocale();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const publicKey = process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY || "";

  const preinstallIos = useMemo(() => isIosMobile() && !isStandaloneMode(), []);

  async function subscribe() {
    if (!("serviceWorker" in navigator) || !publicKey) {
      setMessage("Web Push is not configured yet.");
      return;
    }

    try {
      setPending(true);
      setMessage("");

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setMessage("Notification permission was not granted.");
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      await fetch("/api/pwa/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...subscription.toJSON(),
          platform: navigator.userAgent,
          locale,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          isPwaInstalled: isStandaloneMode(),
        }),
      });

      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      console.error("[push-subscription] subscribe failed", error);
      setMessage("Could not enable push notifications.");
    } finally {
      setPending(false);
    }
  }

  async function unsubscribe() {
    try {
      setPending(true);
      setMessage("");
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await fetch("/api/pwa/subscriptions", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });
        await subscription.unsubscribe();
      }

      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      console.error("[push-subscription] unsubscribe failed", error);
      setMessage("Could not disable notifications.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="rounded-[28px] border border-border bg-background-secondary p-4 shadow-[0_18px_44px_rgba(17,17,17,0.06)]">
      <div className="mb-3 flex items-start gap-3">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-500 text-foreground-inverted">
          {hasActiveSubscription ? <BellRing className="h-5 w-5" /> : <BellPlus className="h-5 w-5" />}
        </span>
        <div>
          <h3 className="font-heading text-lg font-semibold text-foreground">Reminder notifications</h3>
          <p className="mt-1 text-sm text-foreground-secondary">
            {preinstallIos
              ? "On iPhone and iPad, install the app to Home Screen before enabling push."
              : "Enable push to receive your today workout reminder automatically."}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {!hasActiveSubscription ? (
          <button
            type="button"
            disabled={pending || preinstallIos}
            onClick={subscribe}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-primary-500 px-4 text-sm font-semibold text-foreground-inverted disabled:opacity-50"
          >
            <BellPlus className="h-4 w-4" />
            Enable push
          </button>
        ) : (
          <button
            type="button"
            disabled={pending}
            onClick={unsubscribe}
            className="inline-flex h-11 items-center gap-2 rounded-full border border-border bg-background-tertiary px-4 text-sm font-semibold text-foreground"
          >
            <BellOff className="h-4 w-4" />
            Disable push
          </button>
        )}
      </div>

      {message ? <p className="mt-3 text-sm text-foreground-secondary">{message}</p> : null}
    </div>
  );
}
