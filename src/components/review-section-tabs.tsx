"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ReviewSection } from "@/lib/data";

type ReviewSectionTabsProps = {
  section: ReviewSection;
  sections: Record<ReviewSection, string>;
  counts: Record<ReviewSection, number>;
  onSectionChange: (section: ReviewSection) => void;
};

export function ReviewSectionTabs({
  section,
  sections,
  counts,
  onSectionChange,
}: ReviewSectionTabsProps) {
  function onValueChange(nextSection: string) {
    onSectionChange(nextSection as ReviewSection);
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
