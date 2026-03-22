import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { ReviewWorkspaceShell } from "@/components/review-workspace-shell";
import { requireAuthSession } from "@/lib/auth";

export default async function ReviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAuthSession();
  const [shellT, settingsT, reviewT] = await Promise.all([
    getTranslations("shell"),
    getTranslations("settingsPage"),
    getTranslations("reviewPage"),
  ]);

  return (
    <Suspense fallback={children}>
      <ReviewWorkspaceShell
        user={{
          displayName: session.user.displayName,
          phoneE164: session.user.phoneE164,
        }}
        dictionary={{
          reviewTitle: settingsT("reviewTitle"),
          reviewBody: settingsT("reviewBody"),
          auditAction: reviewT("auditAction"),
          workspaceLabel: reviewT("workspaceLabel"),
          collectionsLabel: reviewT("collectionsLabel"),
          toolsLabel: reviewT("toolsLabel"),
          localReviewLabel: reviewT("localReviewLabel"),
          account: reviewT("account"),
          billing: reviewT("billing"),
          notifications: reviewT("notifications"),
          logout: reviewT("logout"),
          nav: {
            today: shellT("nav.today"),
            library: shellT("nav.library"),
            review: settingsT("reviewTitle"),
            settings: shellT("nav.settings"),
          },
          sections: {
            exercises: reviewT("sections.exercises"),
            muscles: reviewT("sections.muscles"),
            equipments: reviewT("sections.equipments"),
            goals: reviewT("sections.goals"),
            categories: reviewT("sections.categories"),
          },
        }}
      >
        {children}
      </ReviewWorkspaceShell>
    </Suspense>
  );
}
