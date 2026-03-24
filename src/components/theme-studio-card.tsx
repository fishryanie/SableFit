"use client";

import * as React from "react";
import { CheckCircle2, PaintBucket, RotateCcw, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { useThemeStudio } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const THEME_PLACEHOLDER = `:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.18 0.01 248);
  --card: oklch(0.97 0.001 197);
  --card-foreground: oklch(0.18 0.01 248);
  --primary: oklch(0.67 0.16 245);
  --primary-foreground: oklch(1 0 0);
  --secondary: oklch(0.18 0.01 248);
  --secondary-foreground: oklch(1 0 0);
  --muted: oklch(0.92 0.001 286);
  --muted-foreground: oklch(0.18 0.01 248);
  --accent: oklch(0.93 0.016 250);
  --accent-foreground: oklch(0.67 0.16 245);
  --destructive: oklch(0.62 0.23 25);
  --border: oklch(0.93 0.01 231);
  --input: oklch(0.98 0.002 228);
  --ring: oklch(0.68 0.15 243);
  --sidebar: oklch(0.97 0.001 197);
  --sidebar-foreground: oklch(0.18 0.01 248);
  --sidebar-primary: oklch(0.67 0.16 245);
  --sidebar-primary-foreground: oklch(1 0 0);
  --sidebar-accent: oklch(0.93 0.016 250);
  --sidebar-accent-foreground: oklch(0.67 0.16 245);
  --radius: 0.625rem;
}

.dark {
  --background: oklch(0 0 0);
  --foreground: oklch(0.93 0.002 228);
  --card: oklch(0.21 0.008 274);
  --card-foreground: oklch(0.88 0 0);
  --primary: oklch(0.67 0.16 245);
  --primary-foreground: oklch(1 0 0);
  --secondary: oklch(0.96 0.003 219);
  --secondary-foreground: oklch(0.18 0.01 248);
  --muted: oklch(0.21 0 0);
  --muted-foreground: oklch(0.56 0.007 247);
  --accent: oklch(0.19 0.03 242);
  --accent-foreground: oklch(0.67 0.16 245);
  --destructive: oklch(0.62 0.23 25);
  --border: oklch(0.26 0.004 248);
  --input: oklch(0.3 0.028 244);
  --ring: oklch(0.68 0.15 243);
  --sidebar: oklch(0.21 0.008 274);
  --sidebar-foreground: oklch(0.88 0 0);
  --sidebar-primary: oklch(0.68 0.15 243);
  --sidebar-primary-foreground: oklch(1 0 0);
  --sidebar-accent: oklch(0.19 0.03 242);
  --sidebar-accent-foreground: oklch(0.67 0.16 245);
  --radius: 0.625rem;
}`;

export function ThemeStudioCard() {
  const t = useTranslations("settingsPage");
  const { ready, customSnippet, hasCustomTheme, applyCustomTheme, resetCustomTheme } = useThemeStudio();
  const [draft, setDraft] = React.useState("");
  const [feedback, setFeedback] = React.useState<{
    type: "idle" | "success" | "error";
    message: string;
  }>({ type: "idle", message: "" });

  React.useEffect(() => {
    if (!ready) {
      return;
    }

    setDraft(customSnippet);
  }, [customSnippet, ready]);

  function handleApply() {
    const result = applyCustomTheme(draft);

    if (!result.ok) {
      setFeedback({ type: "error", message: t("themeInvalid", { reason: result.error }) });
      return;
    }

    setFeedback({ type: "success", message: t("themeApplied") });
  }

  function handleReset() {
    resetCustomTheme();
    setDraft("");
    setFeedback({ type: "success", message: t("themeReset") });
  }

  return (
    <section className="rounded-[28px] border border-border bg-background-secondary p-4 shadow-[0_16px_42px_rgba(17,17,17,0.06)]">
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] bg-background-tertiary text-foreground">
          <PaintBucket className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <h2 className="font-heading text-lg font-semibold text-foreground">{t("themeTitle")}</h2>
          <p className="mt-1 text-sm leading-6 text-foreground-secondary">{t("themeBody")}</p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 rounded-[22px] border border-border bg-background-tertiary px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-foreground">
            {hasCustomTheme ? t("themeStatusCustom") : t("themeStatusDefault")}
          </p>
          <p className="mt-1 text-xs leading-5 text-foreground-muted">{t("themeScope")}</p>
        </div>
        {hasCustomTheme ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-primary-500 px-3 py-1 text-xs font-semibold text-foreground-inverted">
            <Sparkles className="h-3.5 w-3.5" />
            {t("themeStatusApplied")}
          </span>
        ) : null}
      </div>

      <div className="mt-4">
        <label className="mb-2 block text-sm font-medium text-foreground">{t("themeSnippetLabel")}</label>
        <Textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={THEME_PLACEHOLDER}
          className="min-h-[280px] rounded-[22px] bg-background font-mono text-[13px] leading-6"
          spellCheck={false}
        />
      </div>

      <p className="mt-3 text-xs leading-5 text-foreground-muted">{t("themeHint")}</p>

      {feedback.message ? (
        <div
          className={`mt-3 flex items-start gap-2 rounded-[18px] border px-3 py-2 text-sm ${
            feedback.type === "error"
              ? "border-destructive/30 bg-destructive/10 text-destructive"
              : "border-border bg-background-tertiary text-foreground"
          }`}
        >
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{feedback.message}</span>
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button type="button" onClick={handleApply} disabled={!draft.trim()}>
          {t("themeApplyAction")}
        </Button>
        <Button type="button" variant="outline" onClick={handleReset} disabled={!hasCustomTheme && !draft.trim()}>
          <RotateCcw className="h-4 w-4" />
          {t("themeResetAction")}
        </Button>
      </div>
    </section>
  );
}
