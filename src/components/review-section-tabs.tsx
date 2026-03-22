"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ReviewSection } from "@/lib/data";

type ReviewSectionTabsProps = {
  section: ReviewSection;
  sections: Record<ReviewSection, string>;
  counts: Record<ReviewSection, number>;
};

export function ReviewSectionTabs({
  section,
  sections,
  counts,
}: ReviewSectionTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function onValueChange(nextSection: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("section", nextSection);
    params.delete("page");
    router.push(`/app/review?${params.toString()}`);
  }

  return (
    <Tabs value={section} onValueChange={onValueChange}>
      <TabsList className="h-auto flex-wrap justify-start">
        {(Object.keys(sections) as ReviewSection[]).map((item) => (
          <TabsTrigger key={item} value={item} className="gap-2 px-3">
            <span>{sections[item]}</span>
            <span className="text-xs text-muted-foreground">{counts[item]}</span>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
