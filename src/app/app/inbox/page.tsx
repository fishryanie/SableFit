import { requireAuthSession } from "@/lib/auth";
import { getInboxData } from "@/lib/data";
import { getTranslations } from "next-intl/server";

export default async function InboxPage() {
  const session = await requireAuthSession();
  const [t, items] = await Promise.all([
    getTranslations("inboxPage"),
    getInboxData(session.user.id),
  ]);

  return (
    <div className="space-y-4">
      <section className="rounded-[32px] border border-border bg-background-secondary p-5 shadow-[0_20px_55px_rgba(17,17,17,0.08)]">
        <h1 className="font-heading text-[2rem] font-semibold text-foreground">{t("title")}</h1>
        <p className="mt-2 text-sm leading-6 text-foreground-secondary">{t("subtitle")}</p>
      </section>

      <div className="space-y-3">
        {items.length ? (
          items.map((item) => (
            <article key={item.id} className="rounded-[28px] border border-border bg-background-secondary p-4 shadow-[0_16px_42px_rgba(17,17,17,0.06)]">
              <div className="flex items-center justify-between gap-3">
                <p className="font-heading text-base font-semibold text-foreground">{item.title.en}</p>
                <span className="rounded-full border border-border bg-background-tertiary px-3 py-1 text-xs font-medium text-foreground-secondary">
                  {item.type}
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 text-foreground-secondary">{item.body.en}</p>
              <p className="mt-2 text-xs text-foreground-muted">
                {new Date(item.createdAt).toLocaleString()}
              </p>
            </article>
          ))
        ) : (
          <div className="rounded-[28px] border border-dashed border-border-strong bg-background-secondary p-5 text-sm text-foreground-secondary">
            No notifications yet.
          </div>
        )}
      </div>
    </div>
  );
}
