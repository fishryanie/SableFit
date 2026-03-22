"use client";

import Link from "next/link";
import { ArrowLeft, AlertTriangle, CheckCircle2, ImagePlus, LoaderCircle, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { UiReviewReport, UiReviewSeverity } from "@/lib/ui-review";

type UiAuditPanelProps = {
  dictionary: {
    title: string;
    subtitle: string;
    helper: string;
    pageUrl: string;
    viewport: string;
    notes: string;
    screenshots: string;
    desktop: string;
    mobile: string;
    runAudit: string;
    running: string;
    emptyState: string;
    configHint: string;
    score: string;
    summary: string;
    positives: string;
    issues: string;
    nextActions: string;
    uploadHint: string;
    openReview: string;
    errorTitle: string;
  };
};

type AuditResponse = {
  ok: boolean;
  message?: string;
  detail?: string;
  model?: string;
  viewport?: string;
  screenshotCount?: number;
  report?: UiReviewReport;
};

type PreviewItem = {
  name: string;
  url: string;
};

function severityClasses(severity: UiReviewSeverity) {
  switch (severity) {
    case "critical":
      return "border-[#d9363e] bg-[#fff1f2] text-[#8f1d22]";
    case "high":
      return "border-[#f08c00] bg-[#fff7e6] text-[#9a4d00]";
    case "medium":
      return "border-[#1677ff] bg-[#eff6ff] text-[#1248a6]";
    case "low":
      return "border-[#2f9e44] bg-[#eefbf0] text-[#206b31]";
  }
}

export function UiAuditPanel({ dictionary }: UiAuditPanelProps) {
  const [pageUrl, setPageUrl] = useState("");
  const [viewport, setViewport] = useState("desktop");
  const [notes, setNotes] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<PreviewItem[]>([]);
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<AuditResponse | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    setPageUrl((current) => current || `${window.location.origin}/app/review`);
  }, []);

  useEffect(() => {
    const nextPreviews = files.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
    }));

    setPreviews(nextPreviews);

    return () => {
      nextPreviews.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, [files]);

  const scoreTone = useMemo(() => {
    const score = result?.report?.score ?? 0;
    if (score >= 85) {
      return "text-[#206b31]";
    }
    if (score >= 65) {
      return "text-[#9a4d00]";
    }
    return "text-[#8f1d22]";
  }, [result]);

  async function submitAudit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!files.length) {
      setError(dictionary.uploadHint);
      return;
    }

    try {
      setPending(true);
      setError("");
      setResult(null);

      const formData = new FormData();
      formData.set("pageUrl", pageUrl);
      formData.set("viewport", viewport);
      formData.set("notes", notes);
      files.forEach((file) => {
        formData.append("screenshots", file);
      });

      const response = await fetch("/api/dev/ui-review", {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json()) as AuditResponse;
      if (!response.ok || !payload.ok) {
        throw new Error(payload.message || dictionary.errorTitle);
      }

      setResult(payload);
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : dictionary.errorTitle);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-5">
      <section className="rounded-[34px] border border-border bg-background-secondary px-5 py-5 shadow-[0_20px_55px_rgba(17,17,17,0.08)] lg:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <Link
              href="/app/review"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-background-tertiary"
            >
              <ArrowLeft className="h-4 w-4" />
              {dictionary.openReview}
            </Link>
            <h1 className="mt-4 font-heading text-[2rem] font-semibold leading-[0.92] tracking-[-0.03em] text-foreground lg:text-[2.5rem]">
              {dictionary.title}
            </h1>
            <p className="mt-3 text-sm leading-6 text-foreground-secondary lg:text-[15px]">
              {dictionary.subtitle}
            </p>
            <p className="mt-3 rounded-[22px] border border-border bg-background px-4 py-3 text-sm leading-6 text-foreground-secondary">
              {dictionary.helper}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr),420px]">
        <form
          onSubmit={submitAudit}
          className="rounded-[30px] border border-border bg-background-secondary p-5 shadow-[0_18px_44px_rgba(17,17,17,0.05)]"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-semibold text-foreground">{dictionary.pageUrl}</span>
              <input
                type="url"
                value={pageUrl}
                onChange={(event) => setPageUrl(event.target.value)}
                className="h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm text-foreground outline-none"
                placeholder="http://localhost:3000/app/review"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-foreground">{dictionary.viewport}</span>
              <select
                value={viewport}
                onChange={(event) => setViewport(event.target.value)}
                className="h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm text-foreground outline-none"
              >
                <option value="desktop">{dictionary.desktop}</option>
                <option value="mobile">{dictionary.mobile}</option>
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-foreground">{dictionary.screenshots}</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(event) => setFiles(Array.from(event.target.files ?? []).slice(0, 4))}
                className="block h-12 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground file:mr-3 file:rounded-full file:border-0 file:bg-foreground file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"
              />
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-semibold text-foreground">{dictionary.notes}</span>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={4}
                className="w-full rounded-[24px] border border-border bg-background px-4 py-3 text-sm leading-6 text-foreground outline-none"
                placeholder="Example: Focus on desktop readability, scrolling, and whether the dashboard hierarchy feels stable."
              />
            </label>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={pending}
              className="inline-flex h-12 items-center gap-2 rounded-full bg-foreground px-5 text-sm font-semibold text-white disabled:opacity-60"
            >
              {pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {pending ? dictionary.running : dictionary.runAudit}
            </button>
            <p className="text-sm text-foreground-secondary">{dictionary.configHint}</p>
          </div>

          {error ? (
            <div className="mt-4 rounded-[22px] border border-[#d9363e] bg-[#fff1f2] px-4 py-3 text-sm text-[#8f1d22]">
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <p>{error}</p>
              </div>
            </div>
          ) : null}
        </form>

        <aside className="rounded-[30px] border border-border bg-background-secondary p-5 shadow-[0_18px_44px_rgba(17,17,17,0.05)]">
          <div className="flex items-center gap-2">
            <ImagePlus className="h-5 w-5 text-foreground-secondary" />
            <h2 className="font-heading text-lg font-semibold text-foreground">{dictionary.screenshots}</h2>
          </div>
          <p className="mt-2 text-sm leading-6 text-foreground-secondary">{dictionary.uploadHint}</p>

          <div className="mt-4 grid grid-cols-2 gap-3">
            {previews.length ? (
              previews.map((preview) => (
                <div
                  key={preview.url}
                  className="overflow-hidden rounded-[22px] border border-border bg-background shadow-[0_10px_28px_rgba(17,17,17,0.04)]"
                >
                  {/* Local blob preview for screenshots before upload. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={preview.url} alt={preview.name} className="aspect-[4/3] w-full object-cover" />
                  <p className="truncate px-3 py-2 text-xs text-foreground-secondary">{preview.name}</p>
                </div>
              ))
            ) : (
              <div className="col-span-2 rounded-[22px] border border-dashed border-border bg-background px-4 py-10 text-center text-sm text-foreground-muted">
                {dictionary.emptyState}
              </div>
            )}
          </div>
        </aside>
      </section>

      {result?.report ? (
        <section className="space-y-4">
          <div className="grid gap-4 xl:grid-cols-[240px,minmax(0,1fr)]">
            <div className="rounded-[28px] border border-border bg-background-secondary p-5 shadow-[0_16px_42px_rgba(17,17,17,0.06)]">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground-muted">
                {dictionary.score}
              </p>
              <p className={`mt-4 font-heading text-[3rem] font-semibold leading-none ${scoreTone}`}>
                {Math.round(result.report.score)}
              </p>
              <p className="mt-3 text-sm leading-6 text-foreground-secondary">
                {result.model} • {result.viewport} • {result.screenshotCount} screenshot(s)
              </p>
            </div>

            <div className="rounded-[28px] border border-border bg-background-secondary p-5 shadow-[0_16px_42px_rgba(17,17,17,0.06)]">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground-muted">
                {dictionary.summary}
              </p>
              <p className="mt-4 text-base leading-7 text-foreground">{result.report.summary}</p>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr),minmax(0,1fr)]">
            <div className="rounded-[28px] border border-border bg-background-secondary p-5 shadow-[0_16px_42px_rgba(17,17,17,0.06)]">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-foreground-secondary" />
                <h2 className="font-heading text-lg font-semibold text-foreground">{dictionary.issues}</h2>
              </div>
              <div className="mt-4 space-y-3">
                {result.report.issues.map((issue, index) => (
                  <article
                    key={`${issue.title}-${index}`}
                    className={`rounded-[24px] border px-4 py-4 ${severityClasses(issue.severity)}`}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em]">
                        {issue.severity}
                      </span>
                      <h3 className="text-base font-semibold">{issue.title}</h3>
                    </div>
                    <p className="mt-3 text-sm leading-6">{issue.evidence}</p>
                    <p className="mt-3 text-sm leading-6">
                      <strong>Impact:</strong> {issue.impact}
                    </p>
                    <p className="mt-2 text-sm leading-6">
                      <strong>Fix:</strong> {issue.recommendation}
                    </p>
                  </article>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <section className="rounded-[28px] border border-border bg-background-secondary p-5 shadow-[0_16px_42px_rgba(17,17,17,0.06)]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-[#206b31]" />
                  <h2 className="font-heading text-lg font-semibold text-foreground">{dictionary.positives}</h2>
                </div>
                <ul className="mt-4 space-y-3">
                  {result.report.positives.map((item) => (
                    <li key={item} className="rounded-[22px] border border-border bg-background px-4 py-3 text-sm leading-6 text-foreground-secondary">
                      {item}
                    </li>
                  ))}
                </ul>
              </section>

              <section className="rounded-[28px] border border-border bg-background-secondary p-5 shadow-[0_16px_42px_rgba(17,17,17,0.06)]">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-foreground-secondary" />
                  <h2 className="font-heading text-lg font-semibold text-foreground">{dictionary.nextActions}</h2>
                </div>
                <ul className="mt-4 space-y-3">
                  {result.report.nextActions.map((item) => (
                    <li key={item} className="rounded-[22px] border border-border bg-background px-4 py-3 text-sm leading-6 text-foreground-secondary">
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
