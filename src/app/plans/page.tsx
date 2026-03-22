import { getSystemPlanTemplates } from "@/lib/data";
import { getTranslations } from "next-intl/server";
import { BrandLockup } from "@/components/brand-lockup";
import { LocaleSwitcher } from "@/components/locale-switcher";

export default async function MarketingPlansPage() {
  const [t, plans] = await Promise.all([
    getTranslations("marketingPlans"),
    getSystemPlanTemplates(),
  ]);

  return (
    <main className="min-h-dvh bg-background">
      <div className="mx-auto w-full max-w-[400px] px-4 pb-10 pt-4">
        <div className="mb-4 flex items-center justify-between">
          <BrandLockup href="/" markSize={32} wordmarkWidth={146} />
          <LocaleSwitcher />
        </div>

        <section className="rounded-[32px] border border-border bg-background-secondary p-5 shadow-[0_18px_44px_rgba(17,17,17,0.06)]">
          <h1 className="font-heading text-[2rem] font-semibold text-foreground">{t("title")}</h1>
          <p className="mt-2 text-sm leading-6 text-foreground-secondary">{t("subtitle")}</p>
        </section>

        <div className="mt-4 space-y-3">
          {plans.map((plan) => (
            <article key={plan.id} className="rounded-[30px] border border-border bg-background-secondary p-4 shadow-[0_16px_42px_rgba(17,17,17,0.06)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-heading text-lg font-semibold text-foreground">{plan.title.en}</h2>
                  <p className="mt-1 text-sm leading-6 text-foreground-secondary">{plan.description.en}</p>
                </div>
                <span className="rounded-full border border-border bg-background-tertiary px-3 py-1 text-xs font-medium text-foreground-secondary">
                  {plan.sessionsPerWeek} days
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
