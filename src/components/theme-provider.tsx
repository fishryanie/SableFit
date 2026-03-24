"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { parseThemeSnippet, readStoredThemeSnippet } from "@/lib/theme-snippet";

const CUSTOM_THEME_STYLE_ID = "sablefit-custom-theme-style";
const NEXT_THEME_STORAGE_KEY = "theme";

type ThemeStudioContextValue = {
  ready: boolean;
  customSnippet: string;
  hasCustomTheme: boolean;
  applyCustomTheme: (snippet: string) => { ok: true } | { ok: false; error: string };
  resetCustomTheme: () => void;
};

const ThemeStudioContext = React.createContext<ThemeStudioContextValue | null>(null);

function applyDocumentTheme(theme: "light" | "dark") {
  if (typeof document === "undefined") {
    return;
  }

  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(theme);
  root.style.colorScheme = theme;
}

function upsertThemeStyle(cssText: string) {
  if (typeof document === "undefined") {
    return;
  }

  let style = document.getElementById(CUSTOM_THEME_STYLE_ID) as HTMLStyleElement | null;

  if (!cssText) {
    style?.remove();
    return;
  }

  if (!style) {
    style = document.createElement("style");
    style.id = CUSTOM_THEME_STYLE_ID;
    document.head.appendChild(style);
  }

  style.textContent = cssText;
}

function CustomThemeProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = React.useState(false);
  const [customSnippet, setCustomSnippet] = React.useState("");
  const { resolvedTheme, theme } = useTheme();

  React.useEffect(() => {
    const nextTheme =
      resolvedTheme === "dark" || theme === "dark"
        ? "dark"
        : "light";

    applyDocumentTheme(nextTheme);
  }, [resolvedTheme, theme]);

  React.useLayoutEffect(() => {
    const storedSnippet = readStoredThemeSnippet();
    const storedTheme = window.localStorage.getItem(NEXT_THEME_STORAGE_KEY);

    if (storedTheme === "dark" || storedTheme === "light") {
      applyDocumentTheme(storedTheme);
    }

    if (!storedSnippet) {
      setReady(true);
      return;
    }

    const parsed = parseThemeSnippet(storedSnippet);

    if (parsed.ok) {
      upsertThemeStyle(parsed.value.cssText);
      setCustomSnippet(storedSnippet);
    } else {
      window.localStorage.removeItem("sablefit.custom-theme-snippet.v1");
      upsertThemeStyle("");
    }

    setReady(true);
  }, []);

  React.useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key !== "sablefit.custom-theme-snippet.v1") {
        return;
      }

      const nextSnippet = event.newValue ?? "";

      if (!nextSnippet) {
        setCustomSnippet("");
        upsertThemeStyle("");
        return;
      }

      const parsed = parseThemeSnippet(nextSnippet);

      if (!parsed.ok) {
        return;
      }

      setCustomSnippet(nextSnippet);
      upsertThemeStyle(parsed.value.cssText);
    }

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const applyCustomTheme = React.useCallback((snippet: string) => {
    const parsed = parseThemeSnippet(snippet);

    if (!parsed.ok) {
      return parsed;
    }

    window.localStorage.setItem("sablefit.custom-theme-snippet.v1", snippet.trim());
    upsertThemeStyle(parsed.value.cssText);
    setCustomSnippet(snippet.trim());

    return { ok: true as const };
  }, []);

  const resetCustomTheme = React.useCallback(() => {
    window.localStorage.removeItem("sablefit.custom-theme-snippet.v1");
    upsertThemeStyle("");
    setCustomSnippet("");
  }, []);

  const value = React.useMemo<ThemeStudioContextValue>(
    () => ({
      ready,
      customSnippet,
      hasCustomTheme: customSnippet.length > 0,
      applyCustomTheme,
      resetCustomTheme,
    }),
    [applyCustomTheme, customSnippet, ready, resetCustomTheme],
  );

  return <ThemeStudioContext.Provider value={value}>{children}</ThemeStudioContext.Provider>;
}

export function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
    >
      <CustomThemeProvider>{children}</CustomThemeProvider>
    </NextThemesProvider>
  );
}

export function useThemeStudio() {
  const context = React.useContext(ThemeStudioContext);

  if (!context) {
    throw new Error("useThemeStudio must be used inside ThemeProvider.");
  }

  return context;
}

export { NEXT_THEME_STORAGE_KEY, applyDocumentTheme };
