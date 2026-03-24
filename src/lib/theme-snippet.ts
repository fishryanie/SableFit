export const CUSTOM_THEME_STORAGE_KEY = "sablefit.custom-theme-snippet.v1";
const ROOT_BLOCK_PATTERN = /:root\s*\{([\s\S]*?)\}/m;
const DARK_BLOCK_PATTERN = /\.dark\s*\{([\s\S]*?)\}/m;
const DECLARATION_PATTERN = /(--[\w-]+)\s*:\s*([^;]+);/g;

type ThemeDeclaration = {
  name: string;
  value: string;
};

export type ParsedThemeSnippet = {
  root: ThemeDeclaration[];
  dark: ThemeDeclaration[];
  cssText: string;
};

export type ParseThemeSnippetResult =
  | {
      ok: true;
      value: ParsedThemeSnippet;
    }
  | {
      ok: false;
      error: string;
    };

function parseDeclarationBlock(block: string) {
  const declarations: ThemeDeclaration[] = [];

  for (const match of block.matchAll(DECLARATION_PATTERN)) {
    const name = match[1]?.trim();
    const value = match[2]?.trim();

    if (!name || !value) {
      continue;
    }

    declarations.push({ name, value });
  }

  return declarations;
}

function withRuntimeAliases(declarations: ThemeDeclaration[]) {
  const next = [...declarations];

  for (const declaration of declarations) {
    if (declaration.name === "--font-sans") {
      next.push({ name: "--app-font-sans", value: declaration.value });
    }

    if (declaration.name === "--font-serif") {
      next.push({ name: "--app-font-serif", value: declaration.value });
    }

    if (declaration.name === "--font-mono") {
      next.push({ name: "--app-font-mono", value: declaration.value });
    }
  }

  return next;
}

function renderDeclarations(declarations: ThemeDeclaration[]) {
  return declarations.map((item) => `  ${item.name}: ${item.value};`).join("\n");
}

export function parseThemeSnippet(input: string): ParseThemeSnippetResult {
  const source = input.trim();

  if (!source) {
    return {
      ok: false,
      error: "Theme snippet is empty.",
    };
  }

  const rootMatch = source.match(ROOT_BLOCK_PATTERN);
  const darkMatch = source.match(DARK_BLOCK_PATTERN);

  if (!rootMatch) {
    return {
      ok: false,
      error: "Missing :root block.",
    };
  }

  if (!darkMatch) {
    return {
      ok: false,
      error: "Missing .dark block.",
    };
  }

  const root = withRuntimeAliases(parseDeclarationBlock(rootMatch[1] ?? ""));
  const dark = withRuntimeAliases(parseDeclarationBlock(darkMatch[1] ?? ""));

  if (!root.length) {
    return {
      ok: false,
      error: "No CSS variables found inside :root.",
    };
  }

  if (!dark.length) {
    return {
      ok: false,
      error: "No CSS variables found inside .dark.",
    };
  }

  const cssText = [
    ":root, .review-neutral-theme {",
    renderDeclarations(root),
    "}",
    "",
    ".dark, .review-neutral-theme.dark, .dark .review-neutral-theme {",
    renderDeclarations(dark),
    "}",
  ].join("\n");

  return {
    ok: true,
    value: {
      root,
      dark,
      cssText,
    },
  };
}

export function readStoredThemeSnippet() {
  if (typeof window === "undefined") {
    return "";
  }

  return window.localStorage.getItem(CUSTOM_THEME_STORAGE_KEY) ?? "";
}

