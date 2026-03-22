"use client";

import { LogOut } from "lucide-react";
import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export function LogoutButton() {
  const router = useRouter();
  const t = useTranslations("common");
  const [pending, setPending] = useState(false);

  async function handleLogout() {
    try {
      setPending(true);
      await fetch("/api/auth/logout", { method: "POST" });
      startTransition(() => {
        router.replace("/");
        router.refresh();
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={handleLogout}
      className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-background-tertiary px-4 text-sm font-medium text-foreground"
    >
      <LogOut className="h-4 w-4" />
      {t("logout")}
    </button>
  );
}
