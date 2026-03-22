import Image from "next/image";
import { getTodayView } from "@/lib/data";
import { requireAuthSession } from "@/lib/auth";
import { CompleteOccurrenceButton } from "@/components/complete-occurrence-button";
import { PlanActivateButton } from "@/components/plan-activate-button";
import { getTranslations } from "next-intl/server";

export default async function TodayPage() {
  const session = await requireAuthSession();
  const [t, data] = await Promise.all([
    getTranslations("todayPage"),
    getTodayView(session.user.id),
  ]);

  return (
    <div className="space-y-4">
      <section className="rounded-[32px] border border-border bg-background-secondary p-5 shadow-[0_20px_55px_rgba(17,17,17,0.08)]">
        <p className="text-xs uppercase tracking-[0.2em] text-foreground-muted">{t("title")}</p>
        <h1 className="mt-2 font-heading text-[2rem] font-semibold text-foreground">
          {data.user?.displayName ?? "SableFit"}
        </h1>
        <p className="mt-2 text-sm leading-6 text-foreground-secondary">{t("subtitle")}</p>
      </section>

      {data.activePlan ? (
        <section className="rounded-[30px] border border-border bg-background-secondary p-4 shadow-[0_16px_42px_rgba(17,17,17,0.06)]">
          <p className="text-xs uppercase tracking-[0.18em] text-foreground-muted">Active plan</p>
          <h2 className="mt-2 font-heading text-xl font-semibold text-foreground">{data.activePlan.title.en}</h2>
          <p className="mt-1 text-sm leading-6 text-foreground-secondary">{data.activePlan.description.en}</p>
        </section>
      ) : null}

      {data.todayItems.length ? (
        <section className="space-y-3">
          {data.todayItems.map((item) => (
            <article key={item.id} className="rounded-[30px] border border-border bg-background-secondary p-4 shadow-[0_16px_42px_rgba(17,17,17,0.06)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-foreground-muted">Today session</p>
                  <h2 className="mt-2 font-heading text-xl font-semibold text-foreground">
                    {item.workoutSession?.title?.en ?? "Workout session"}
                  </h2>
                  <p className="mt-1 text-sm text-foreground-secondary">
                    {new Date(item.scheduledFor).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <CompleteOccurrenceButton occurrenceId={item.id} />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                {(
                  (item.workoutSession?.exerciseEntries ?? []) as Array<{
                    exerciseId?: {
                      imageUrl?: string;
                      name?: { en?: string };
                    };
                    sets: Array<unknown>;
                  }>
                )
                  .slice(0, 4)
                  .map((entry, index: number) => (
                  <div key={`${item.id}-${index}`} className="overflow-hidden rounded-[24px] border border-border bg-background-tertiary">
                    <Image
                      src={entry.exerciseId?.imageUrl ?? "/pwa/icon-192.png"}
                      alt={entry.exerciseId?.name?.en ?? "Exercise"}
                      width={480}
                      height={360}
                      unoptimized
                      className="aspect-[4/3] w-full object-cover"
                    />
                    <div className="p-3">
                      <p className="line-clamp-2 text-sm font-semibold text-foreground">
                        {entry.exerciseId?.name?.en ?? "Exercise"}
                      </p>
                      <p className="mt-1 text-xs text-foreground-muted">{entry.sets.length} sets</p>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </section>
      ) : (
        <section className="rounded-[30px] border border-dashed border-border-strong bg-background-secondary p-5 text-center shadow-[0_16px_42px_rgba(17,17,17,0.04)]">
          <h2 className="font-heading text-xl font-semibold text-foreground">{t("empty")}</h2>
          <div className="mt-4 space-y-3">
            {data.planTemplates.map((plan) => (
              <div key={plan.id} className="rounded-[24px] border border-border bg-background-tertiary p-4 text-left">
                <h3 className="font-heading text-base font-semibold text-foreground">{plan.title.en}</h3>
                <p className="mt-1 text-sm text-foreground-secondary">{plan.description.en}</p>
                <div className="mt-3">
                  <PlanActivateButton systemPlanId={plan.id} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {data.nextItems.length ? (
        <section className="rounded-[30px] border border-border bg-background-secondary p-4 shadow-[0_16px_42px_rgba(17,17,17,0.06)]">
          <p className="text-xs uppercase tracking-[0.18em] text-foreground-muted">Next up</p>
          <div className="mt-3 space-y-2">
            {data.nextItems.map((item) => (
              <div key={item.id} className="rounded-[22px] border border-border bg-background-tertiary p-3">
                <p className="font-semibold text-foreground">{item.workoutSession?.title?.en ?? "Workout session"}</p>
                <p className="mt-1 text-sm text-foreground-secondary">
                  {new Date(item.scheduledFor).toLocaleDateString()}{" "}
                  {new Date(item.scheduledFor).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
