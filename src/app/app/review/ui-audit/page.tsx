import { getTranslations } from "next-intl/server";
import { UiAuditPanel } from "@/components/ui-audit-panel";
import { requireAuthSession } from "@/lib/auth";

export default async function UiAuditPage() {
  await requireAuthSession();
  const t = await getTranslations("uiAuditPage");

  return (
    <UiAuditPanel
      dictionary={{
        title: t("title"),
        subtitle: t("subtitle"),
        helper: t("helper"),
        pageUrl: t("pageUrl"),
        viewport: t("viewport"),
        notes: t("notes"),
        screenshots: t("screenshots"),
        desktop: t("desktop"),
        mobile: t("mobile"),
        runAudit: t("runAudit"),
        running: t("running"),
        emptyState: t("emptyState"),
        configHint: t("configHint"),
        score: t("score"),
        summary: t("summary"),
        positives: t("positives"),
        issues: t("issues"),
        nextActions: t("nextActions"),
        uploadHint: t("uploadHint"),
        openReview: t("openReview"),
        errorTitle: t("errorTitle"),
      }}
    />
  );
}
