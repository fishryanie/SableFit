import Link from "next/link";
import { FolderKanban } from "lucide-react";
import { LogoutButton } from "@/components/logout-button";
import { PushSubscriptionCard } from "@/components/push-subscription-card";
import { requireAuthSession } from "@/lib/auth";
import { getSettingsData } from "@/lib/data";
import { getTranslations } from "next-intl/server";

export default async function SettingsPage() {
  const session = await requireAuthSession();
  const [t, data] = await Promise.all([
    getTranslations("settingsPage"),
    getSettingsData(session.user.id),
  ]);

  return (
    <div className="space-y-4">
      <section className="rounded-[32px] border border-border bg-background-secondary p-5 shadow-[0_20px_55px_rgba(17,17,17,0.08)]">
        <h1 className="font-heading text-[2rem] font-semibold text-foreground">{t("title")}</h1>
        <p className="mt-2 text-sm leading-6 text-foreground-secondary">{t("subtitle")}</p>
      </section>

      <section className="rounded-[28px] border border-border bg-background-secondary p-4 shadow-[0_16px_42px_rgba(17,17,17,0.06)]">
        <p className="font-heading text-lg font-semibold text-foreground">{data.user?.displayName}</p>
        <p className="mt-1 text-sm text-foreground-secondary">{data.user?.phoneE164}</p>
        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-[20px] border border-border bg-background-tertiary p-3">
            <p className="text-foreground-muted">Locale</p>
            <p className="mt-1 font-semibold text-foreground">{data.user?.locale}</p>
          </div>
          <div className="rounded-[20px] border border-border bg-background-tertiary p-3">
            <p className="text-foreground-muted">Reminder</p>
            <p className="mt-1 font-semibold text-foreground">{data.user?.reminderTime}</p>
          </div>
        </div>
      </section>

      <PushSubscriptionCard hasActiveSubscription={data.pushSubscriptions.length > 0} />

      <Link
        href="/app/review"
        className="block rounded-[28px] border border-border bg-background-secondary p-4 shadow-[0_16px_42px_rgba(17,17,17,0.06)]"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] bg-background-tertiary text-foreground">
            <FolderKanban className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-heading text-lg font-semibold text-foreground">{t("reviewTitle")}</h2>
            <p className="mt-1 text-sm leading-6 text-foreground-secondary">{t("reviewBody")}</p>
            <p className="mt-3 text-sm font-semibold text-foreground">{t("reviewAction")}</p>
          </div>
        </div>
      </Link>

      <section className="rounded-[28px] border border-border bg-background-secondary p-4 shadow-[0_16px_42px_rgba(17,17,17,0.06)]">
        <h2 className="font-heading text-lg font-semibold text-foreground">System coverage</h2>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {data.categories.slice(0, 6).map((category) => (
            <div key={category.slug} className="rounded-[20px] border border-border bg-background-tertiary p-3 text-sm text-foreground">
              {category.name.en}
            </div>
          ))}
        </div>
        <div className="mt-4">
          <LogoutButton />
        </div>
      </section>
    </div>
  );
}
