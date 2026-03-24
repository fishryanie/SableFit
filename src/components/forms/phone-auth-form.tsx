"use client";

import { FirebaseError } from "firebase/app";
import { getFirebaseClientAuth, hasFirebaseWebConfig } from "@/lib/firebase-client";
import { Loader2, ShieldCheck, Smartphone } from "lucide-react";
import {
  ConfirmationResult,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";
import { startTransition, useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    sablefitRecaptcha?: RecaptchaVerifier;
  }
}

function getFirebaseErrorMessage(error: unknown) {
  if (!(error instanceof FirebaseError)) {
    return "Unexpected Firebase error.";
  }

  switch (error.code) {
    case "auth/invalid-phone-number":
      return "Phone number format is invalid. Use full E.164 format, for example +84...";
    case "auth/operation-not-allowed":
      return "Phone sign-in is not enabled in Firebase Authentication yet.";
    case "auth/unauthorized-domain":
      return "This domain is not authorized in Firebase Authentication.";
    case "auth/captcha-check-failed":
      return "reCAPTCHA verification failed. Reload the page and try again.";
    case "auth/invalid-app-credential":
      return "Firebase rejected the app credential. Check the auth domain and reCAPTCHA setup.";
    case "auth/quota-exceeded":
      return "Firebase SMS quota is exhausted for this project.";
    case "auth/too-many-requests":
      return "Too many attempts. Firebase has temporarily blocked more SMS requests.";
    case "auth/missing-phone-number":
      return "Phone number is missing.";
    case "auth/code-expired":
      return "The verification code expired. Request a new OTP.";
    case "auth/invalid-verification-code":
      return "The verification code is invalid.";
    default:
      return `${error.code}: ${error.message}`;
  }
}

export function PhoneAuthForm() {
  const t = useTranslations("authPhone");
  const locale = useLocale();
  const router = useRouter();
  const recaptchaRef = useRef<HTMLDivElement | null>(null);
  const confirmationRef = useRef<ConfirmationResult | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [code, setCode] = useState("");
  const [phase, setPhase] = useState<"phone" | "code">("phone");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!hasFirebaseWebConfig() || !recaptchaRef.current) {
      return;
    }

    const auth = getFirebaseClientAuth();
    auth.languageCode = locale;

    if (!window.sablefitRecaptcha) {
      window.sablefitRecaptcha = new RecaptchaVerifier(auth, recaptchaRef.current, {
        size: "invisible",
      });
      window.sablefitRecaptcha.render().catch(() => undefined);
    }
  }, [locale]);

  async function handleSendOtp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!hasFirebaseWebConfig()) {
      return;
    }

    try {
      setSubmitting(true);
      setMessage("");
      const auth = getFirebaseClientAuth();
      auth.languageCode = locale;

      const confirmation = await signInWithPhoneNumber(
        auth,
        phoneNumber.trim(),
        window.sablefitRecaptcha!,
      );

      confirmationRef.current = confirmation;
      setPhase("code");
      setMessage("");
    } catch (error) {
      console.error("[phone-auth] send otp failed", error);
      setMessage(getFirebaseErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleVerify(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!confirmationRef.current) {
      return;
    }

    try {
      setSubmitting(true);
      setMessage("");
      const credential = await confirmationRef.current.confirm(code.trim());
      const idToken = await credential.user.getIdToken();

      const response = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idToken,
          displayName: displayName.trim() || phoneNumber.trim(),
          locale,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { message?: string } | null;
        throw new Error(payload?.message || "Session exchange failed.");
      }

      startTransition(() => {
        router.replace("/app/today");
        router.refresh();
      });
    } catch (error) {
      console.error("[phone-auth] verify failed", error);
      setMessage(error instanceof Error ? error.message : "Could not verify the code. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!hasFirebaseWebConfig()) {
    return (
      <div className="rounded-[28px] border border-dashed border-border-strong bg-background-tertiary p-4 text-sm text-foreground-secondary">
        {t("missingConfig")}
      </div>
    );
  }

  return (
    <div className="rounded-[32px] border border-border bg-background-secondary p-5 shadow-[0_20px_50px_rgba(17,17,17,0.08)]">
      <div className="mb-4 flex items-start gap-3">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-500 text-foreground-inverted">
          {phase === "phone" ? <Smartphone className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
        </span>
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">{t("title")}</h1>
          <p className="mt-1 text-sm text-foreground-secondary">{t("subtitle")}</p>
        </div>
      </div>

      {phase === "phone" ? (
        <form className="space-y-4" onSubmit={handleSendOtp}>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-foreground">{t("nameLabel")}</span>
            <input
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder="SableFit User"
              className="h-12 w-full rounded-2xl border border-border bg-background-tertiary px-4 text-sm text-foreground"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-foreground">{t("phoneLabel")}</span>
            <input
              value={phoneNumber}
              onChange={(event) => setPhoneNumber(event.target.value)}
              required
              placeholder="+84..."
              className="h-12 w-full rounded-2xl border border-border bg-background-tertiary px-4 text-sm text-foreground"
            />
          </label>

          <p className="text-xs text-foreground-muted">{t("helper")}</p>
          <div ref={recaptchaRef} />

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary-500 px-4 text-sm font-semibold text-foreground-inverted"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {t("submit")}
          </button>
        </form>
      ) : (
        <form className="space-y-4" onSubmit={handleVerify}>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-foreground">{t("codeLabel")}</span>
            <input
              value={code}
              onChange={(event) => setCode(event.target.value)}
              required
              placeholder="123456"
              className="h-12 w-full rounded-2xl border border-border bg-background-tertiary px-4 text-sm text-foreground"
            />
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary-500 px-4 text-sm font-semibold text-foreground-inverted"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {submitting ? t("signingIn") : t("verify")}
          </button>
        </form>
      )}

      {message ? <p className="mt-3 text-sm text-error">{message}</p> : null}
    </div>
  );
}
