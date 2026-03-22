import { requireAuthSession } from "@/lib/auth";
import { getUserSessionList } from "@/lib/data";
import { SessionBuilder } from "@/components/forms/session-builder";
import { getTranslations } from "next-intl/server";

export default async function SessionsPage() {
  const session = await requireAuthSession();
  const [t, data] = await Promise.all([
    getTranslations("sessionsPage"),
    getUserSessionList(session.user.id),
  ]);

  return (
    <div className="space-y-4">
      <section className="rounded-[32px] border border-border bg-background-secondary p-5 shadow-[0_20px_55px_rgba(17,17,17,0.08)]">
        <h1 className="font-heading text-[2rem] font-semibold text-foreground">{t("title")}</h1>
        <p className="mt-2 text-sm leading-6 text-foreground-secondary">{t("subtitle")}</p>
      </section>

      <SessionBuilder exerciseOptions={data.exerciseOptions} />

      <section className="rounded-[30px] border border-border bg-background-secondary p-4 shadow-[0_16px_42px_rgba(17,17,17,0.06)]">
        <h2 className="font-heading text-lg font-semibold text-foreground">Your sessions</h2>
        <div className="mt-3 space-y-2">
          {data.userSessions.length ? (
            data.userSessions.map((item) => (
              <div key={item.id} className="rounded-[24px] border border-border bg-background-tertiary p-4">
                <p className="font-semibold text-foreground">{item.title.en}</p>
                <p className="mt-1 text-sm text-foreground-secondary">{item.description.en}</p>
                <p className="mt-2 text-xs text-foreground-muted">{item.entryCount} exercises</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-foreground-secondary">No custom sessions yet.</p>
          )}
        </div>
      </section>

      <section className="rounded-[30px] border border-border bg-background-secondary p-4 shadow-[0_16px_42px_rgba(17,17,17,0.06)]">
        <h2 className="font-heading text-lg font-semibold text-foreground">System session ideas</h2>
        <div className="mt-3 space-y-2">
          {data.systemSessions.map((item) => (
            <div key={item.id} className="rounded-[24px] border border-border bg-background-tertiary p-4">
              <p className="font-semibold text-foreground">{item.title.en}</p>
              <p className="mt-1 text-sm text-foreground-secondary">{item.description.en}</p>
              <p className="mt-2 text-xs text-foreground-muted">{item.entryCount} exercises</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
