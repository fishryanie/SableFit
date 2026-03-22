"use client";

import { CheckCircle2 } from "lucide-react";
import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";

type CompleteOccurrenceButtonProps = {
  occurrenceId: string;
};

export function CompleteOccurrenceButton({ occurrenceId }: CompleteOccurrenceButtonProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function complete() {
    try {
      setPending(true);
      await fetch(`/api/app/occurrences/${occurrenceId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      startTransition(() => {
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
      onClick={complete}
      className="inline-flex h-10 items-center gap-2 rounded-full bg-primary-500 px-4 text-sm font-semibold text-foreground-inverted"
    >
      <CheckCircle2 className="h-4 w-4" />
      {pending ? "Saving" : "Complete"}
    </button>
  );
}
