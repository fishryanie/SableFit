import { requireAuthSession } from "@/lib/auth";
import { getUserPlanList } from "@/lib/data";
import { PlanBuilder } from "@/components/forms/plan-builder";
import { PlanActivateButton } from "@/components/plan-activate-button";
import { getTranslations } from "next-intl/server";

export default async function PlansPage() {
  const session = await requireAuthSession();
  const [t, data] = await Promise.all([
    getTranslations("plansPage"),
    getUserPlanList(session.user.id),
  ]);

  return (
    <div className="space-y-4">
      <section className="rounded-[32px] border border-border bg-background-secondary p-5 shadow-[0_20px_55px_rgba(17,17,17,0.08)]">
        <h1 className="font-heading text-[2rem] font-semibold text-foreground">{t("title")}</h1>
        <p className="mt-2 text-sm leading-6 text-foreground-secondary">{t("subtitle")}</p>
      </section>

      <PlanBuilder sessionOptions={data.sessionOptions} levels={data.levels} goals={data.goals} />

      <section className="rounded-[30px] border border-border bg-background-secondary p-4 shadow-[0_16px_42px_rgba(17,17,17,0.06)]">
        <h2 className="font-heading text-lg font-semibold text-foreground">Your plans</h2>
        <div className="mt-3 space-y-2">
          {data.userPlans.length ? (
            data.userPlans.map((plan) => (
              <div key={plan.id} className="rounded-[24px] border border-border bg-background-tertiary p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground">{plan.title.en}</p>
                    <p className="mt-1 text-sm text-foreground-secondary">{plan.description.en}</p>
                  </div>
                  {plan.isActive ? (
                    <span className="rounded-full bg-primary-500 px-3 py-1 text-xs font-semibold text-foreground-inverted">
                      Active
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 text-xs text-foreground-muted">{plan.scheduleEntries.length} scheduled slots</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-foreground-secondary">No custom plans yet.</p>
          )}
        </div>
      </section>

      <section className="rounded-[30px] border border-border bg-background-secondary p-4 shadow-[0_16px_42px_rgba(17,17,17,0.06)]">
        <h2 className="font-heading text-lg font-semibold text-foreground">System templates</h2>
        <div className="mt-3 space-y-3">
          {data.systemPlans.map((plan) => (
            <div key={plan.id} className="rounded-[24px] border border-border bg-background-tertiary p-4">
              <p className="font-semibold text-foreground">{plan.title.en}</p>
              <p className="mt-1 text-sm text-foreground-secondary">{plan.description.en}</p>
              <div className="mt-3">
                <PlanActivateButton systemPlanId={plan.id} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
