"use client";

import { Sparkles } from "lucide-react";
import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";

type PlanActivateButtonProps = {
  systemPlanId: string;
};

export function PlanActivateButton({ systemPlanId }: PlanActivateButtonProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function activatePlan() {
    try {
      setPending(true);
      await fetch("/api/app/plans/clone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ systemPlanId }),
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
      onClick={activatePlan}
      className="inline-flex h-10 items-center gap-2 rounded-full bg-primary-500 px-4 text-sm font-semibold text-foreground-inverted"
    >
      <Sparkles className="h-4 w-4" />
      {pending ? "Activating" : "Use this plan"}
    </button>
  );
}
