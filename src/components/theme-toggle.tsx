"use client";

import * as React from "react";
import { Moon, SunMedium } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { applyDocumentTheme, NEXT_THEME_STORAGE_KEY } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const t = useTranslations("common");
  const { resolvedTheme, theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && (resolvedTheme === "dark" || theme === "dark");
  const label = t(isDark ? "switchToLight" : "switchToDark");

  function handleToggleTheme() {
    const nextTheme = isDark ? "light" : "dark";

    applyDocumentTheme(nextTheme);
    window.localStorage.setItem(NEXT_THEME_STORAGE_KEY, nextTheme);
    setTheme(nextTheme);
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          aria-label={label}
          title={label}
          onClick={handleToggleTheme}
          className={cn(
            "relative rounded-full border-border bg-card/88 text-foreground shadow-sm backdrop-blur-sm hover:bg-accent hover:text-accent-foreground dark:bg-card/76",
            className,
          )}
        >
          <SunMedium
            className={cn(
              "absolute size-4 rotate-0 scale-100 transition-all duration-300",
              isDark && "rotate-90 scale-0",
            )}
          />
          <Moon
            className={cn(
              "absolute size-4 rotate-90 scale-0 transition-all duration-300",
              isDark && "rotate-0 scale-100",
            )}
          />
          <span className="sr-only">{label}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">{label}</TooltipContent>
    </Tooltip>
  );
}
