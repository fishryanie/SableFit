"use client";

import { Languages } from "lucide-react";
import { startTransition, useState } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function changeLocale(nextLocale: "vi" | "en") {
    if (nextLocale === locale) {
      return;
    }

    try {
      setPending(true);
      await fetch("/api/locale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: nextLocale }),
      });

      startTransition(() => {
        router.refresh();
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-border bg-card/88 px-1.5 py-1 shadow-sm backdrop-blur-sm dark:bg-card/76">
      <Languages className="ml-1 h-4 w-4 text-muted-foreground" />
      {(["vi", "en"] as const).map((item) => (
        <button
          key={item}
          type="button"
          disabled={pending}
          onClick={() => changeLocale(item)}
          className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase transition-colors ${
            locale === item ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {item}
        </button>
      ))}
    </div>
  );
}
