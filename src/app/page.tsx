import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BellRing, Dumbbell, Sparkles, TimerReset } from "lucide-react";
import { getPublicExerciseCatalog, getSystemPlanTemplates } from "@/lib/data";
import { getTranslations } from "next-intl/server";
import { BrandLockup } from "@/components/brand-lockup";
import { LocaleSwitcher } from "@/components/locale-switcher";

export const metadata: Metadata = {
  title: "Workout Planner App",
  description:
    "SableFit is a mobile-first workout planner app and gym routine tracker with visual exercise cards, sample plans, and reminder-ready PWA flow.",
};

export default async function HomePage() {
  const [t, plans, exercises] = await Promise.all([
    getTranslations("landing"),
    getSystemPlanTemplates(),
    getPublicExerciseCatalog(),
  ]);

  return (
    <main className="min-h-dvh bg-[radial-gradient(circle_at_top,#ffffff,#f4f1ea_48%,#ece6d8_100%)]">
      <div className="mx-auto flex min-h-dvh w-full max-w-[400px] flex-col px-4 pb-10 pt-4">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <BrandLockup href="/" priority markSize={34} wordmarkWidth={154} />
            <p className="mt-1 text-xs text-foreground-muted">{t("eyebrow")}</p>
          </div>
          <LocaleSwitcher />
        </div>

        <section className="rounded-[36px] border border-border bg-background-secondary p-5 shadow-[0_20px_55px_rgba(17,17,17,0.08)]">
          <div className="mb-5 inline-flex rounded-full border border-border bg-background-tertiary px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-foreground-secondary">
            {t("eyebrow")}
          </div>
          <h1 className="font-heading text-[2.2rem] font-semibold leading-[1.02] text-foreground">{t("title")}</h1>
          <p className="mt-4 text-sm leading-6 text-foreground-secondary">{t("body")}</p>

          <div className="mt-5 overflow-hidden rounded-[30px] border border-border bg-[linear-gradient(180deg,#ffffff,#f3ece0)] p-3">
            <Image
              src="/screens/hero-stack.svg"
              alt="SableFit mobile app previews"
              width={920}
              height={860}
              priority
              unoptimized
              className="h-auto w-full"
            />
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2">
            {[t("stat1"), t("stat2"), t("stat3")].map((stat) => (
              <div key={stat} className="rounded-[24px] border border-border bg-background-tertiary px-3 py-3 text-center text-xs font-medium text-foreground">
                {stat}
              </div>
            ))}
          </div>

          <div className="mt-5 flex flex-col gap-2">
            <Link
              href="/auth/phone"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary-500 px-4 text-sm font-semibold text-foreground-inverted"
            >
              {t("primaryCta")}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/plans"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-border bg-background-tertiary px-4 text-sm font-semibold text-foreground"
            >
              {t("secondaryCta")}
            </Link>
          </div>
        </section>

        <section className="mt-4 grid gap-3">
          {[
            { icon: Dumbbell, title: t("feature1Title"), body: t("feature1Body") },
            { icon: TimerReset, title: t("feature2Title"), body: t("feature2Body") },
            { icon: BellRing, title: t("feature3Title"), body: t("feature3Body") },
          ].map((item) => (
            <article key={item.title} className="rounded-[30px] border border-border bg-background-secondary p-4 shadow-[0_16px_42px_rgba(17,17,17,0.06)]">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-500 text-foreground-inverted">
                <item.icon className="h-5 w-5" />
              </span>
              <h2 className="mt-3 font-heading text-lg font-semibold text-foreground">{item.title}</h2>
              <p className="mt-1 text-sm leading-6 text-foreground-secondary">{item.body}</p>
            </article>
          ))}
        </section>

        <section className="mt-4 rounded-[30px] border border-border bg-background-secondary p-4 shadow-[0_16px_42px_rgba(17,17,17,0.06)]">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-foreground-muted">Plans</p>
              <h2 className="font-heading text-lg font-semibold text-foreground">Preview</h2>
            </div>
            <Link href="/plans" className="text-sm font-semibold text-foreground-secondary">
              View all
            </Link>
          </div>

          <div className="space-y-2">
            {plans.slice(0, 3).map((plan) => (
              <div key={plan.id} className="rounded-[24px] border border-border bg-background-tertiary p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-heading text-base font-semibold text-foreground">{plan.title.en}</p>
                    <p className="mt-1 text-sm text-foreground-secondary">{plan.description.en}</p>
                  </div>
                  <span className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-foreground-secondary">
                    {plan.sessionsPerWeek} days
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-4 rounded-[30px] border border-border bg-background-secondary p-4 shadow-[0_16px_42px_rgba(17,17,17,0.06)]">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-foreground-muted">Exercise Library</p>
              <h2 className="font-heading text-lg font-semibold text-foreground">Visual cards</h2>
            </div>
            <Link href="/exercises" className="text-sm font-semibold text-foreground-secondary">
              Browse
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {exercises.slice(0, 4).map((exercise) => (
              <div key={exercise.id} className="overflow-hidden rounded-[24px] border border-border bg-background-tertiary">
                <Image
                  src={exercise.imageUrl}
                  alt={exercise.imageAlt.en}
                  width={480}
                  height={360}
                  unoptimized
                  className="aspect-[4/3] w-full object-cover"
                />
                <div className="p-3">
                  <p className="line-clamp-2 text-sm font-semibold text-foreground">{exercise.name.en}</p>
                  <p className="mt-1 text-xs text-foreground-muted">
                    {exercise.level?.name?.en ?? "Level"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-foreground-muted">
          <Sparkles className="h-4 w-4" />
          Mobile-first PWA, visual exercise library, weekly plan reminders.
        </div>
      </div>
    </main>
  );
}
