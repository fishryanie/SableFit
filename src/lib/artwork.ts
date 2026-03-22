import type { LocalizedString } from "@/types/domain";

export type ExerciseArtworkInput = {
  slug: string;
  name: LocalizedString;
  equipmentSlugs?: string[];
  primaryMuscleSlugs?: string[];
  categorySlugs?: string[];
  levelSlug?: string;
  goalSlugs?: string[];
};

export type BrandArtworkOptions = {
  inverse?: boolean;
  size?: number;
};

export type ScreenArtworkKind =
  | "today"
  | "plans"
  | "library"
  | "install"
  | "hero-stack";

type MovementPattern =
  | "press"
  | "fly"
  | "row"
  | "vertical-pull"
  | "curl"
  | "extension"
  | "raise"
  | "squat"
  | "lunge"
  | "hinge"
  | "stability"
  | "carry"
  | "calf"
  | "cardio"
  | "core-dynamic"
  | "general";

type MuscleTheme = {
  key: "chest" | "back" | "shoulders" | "arms" | "core" | "lower-body" | "general";
  label: string;
  accent: string;
  soft: string;
  halo: string;
};

const palette = {
  ink: "#111111",
  inkSoft: "#4F4F4F",
  canvas: "#F7F6F3",
  paper: "#FFFFFF",
  mist: "#EFECE5",
  sand: "#E9E1D3",
  stone: "#D7D0C3",
  gold: "#B79B67",
  goldSoft: "#F2E8D5",
  chest: "#C9705A",
  chestSoft: "#F7E0D8",
  back: "#5C8578",
  backSoft: "#DDECE7",
  shoulders: "#D7A03D",
  shouldersSoft: "#F7E7C8",
  arms: "#756390",
  armsSoft: "#E8E0F4",
  core: "#5C8262",
  coreSoft: "#DDEEDF",
  legs: "#B45C58",
  legsSoft: "#F4DDDB",
  neutral: "#8A6B3A",
  neutralSoft: "#F3ECDD",
};

const muscleThemeRegistry: Array<MuscleTheme & { slugs: Set<string> }> = [
  {
    key: "chest",
    label: "Chest focus",
    accent: palette.chest,
    soft: palette.chestSoft,
    halo: "#FBEFEA",
    slugs: new Set(["pectoralis-major", "pectoralis-minor", "serratus-anterior"]),
  },
  {
    key: "back",
    label: "Back focus",
    accent: palette.back,
    soft: palette.backSoft,
    halo: "#ECF6F2",
    slugs: new Set([
      "latissimus-dorsi",
      "rhomboids",
      "trapezius",
      "erector-spinae",
      "teres-major",
    ]),
  },
  {
    key: "shoulders",
    label: "Shoulder focus",
    accent: palette.shoulders,
    soft: palette.shouldersSoft,
    halo: "#FAF3E3",
    slugs: new Set(["deltoids", "rear-deltoids", "rotator-cuff"]),
  },
  {
    key: "arms",
    label: "Arm focus",
    accent: palette.arms,
    soft: palette.armsSoft,
    halo: "#F1ECF8",
    slugs: new Set(["biceps", "triceps", "forearms", "brachialis"]),
  },
  {
    key: "core",
    label: "Core focus",
    accent: palette.core,
    soft: palette.coreSoft,
    halo: "#EEF6EF",
    slugs: new Set(["rectus-abdominis", "obliques", "hip-flexors"]),
  },
  {
    key: "lower-body",
    label: "Lower-body focus",
    accent: palette.legs,
    soft: palette.legsSoft,
    halo: "#FAEEEE",
    slugs: new Set([
      "glutes",
      "quadriceps",
      "hamstrings",
      "adductors",
      "calves",
      "soleus",
      "rectus-femoris",
    ]),
  },
];

const equipmentLabelMap = new Map<string, string>([
  ["body-weight", "Body Weight"],
  ["dumbbell", "Dumbbell"],
  ["barbell", "Barbell"],
  ["kettlebell", "Kettlebell"],
  ["cable-machine", "Cable"],
  ["machine", "Machine"],
  ["bench", "Bench"],
  ["smith-machine", "Smith"],
  ["lat-pulldown-machine", "Pulldown"],
  ["leg-press-machine", "Leg Press"],
  ["leg-curl-machine", "Leg Curl"],
  ["leg-extension-machine", "Leg Extension"],
  ["pull-up-bar", "Pull-Up Bar"],
  ["parallel-bars", "Parallel Bars"],
  ["medicine-ball", "Med Ball"],
  ["resistance-bands", "Bands"],
  ["trx", "TRX"],
  ["plyo-box", "Plyo Box"],
  ["battle-ropes", "Ropes"],
  ["ez-curl-bar", "EZ Bar"],
  ["plate", "Plate"],
  ["ab-wheel", "Ab Wheel"],
  ["pec-deck-machine", "Pec Deck"],
  ["calf-raise-machine", "Calf Raise"],
  ["seated-calf-raise-machine", "Seated Calf"],
  ["yoga-mat", "Mat"],
]);

const levelLabelMap = new Map<string, string>([
  ["beginner", "Beginner"],
  ["intermediate", "Intermediate"],
  ["advanced", "Advanced"],
]);

const goalLabelMap = new Map<string, string>([
  ["strength", "Strength"],
  ["hypertrophy", "Hypertrophy"],
  ["hiit", "HIIT"],
  ["endurance", "Endurance"],
  ["mobility", "Mobility"],
]);

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function slugToLabel(input: string) {
  return input
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function hexToRgba(hex: string, alpha: number) {
  const clean = hex.replace("#", "");
  const normalized = clean.length === 3
    ? clean
        .split("")
        .map((char) => `${char}${char}`)
        .join("")
    : clean;
  const red = Number.parseInt(normalized.slice(0, 2), 16);
  const green = Number.parseInt(normalized.slice(2, 4), 16);
  const blue = Number.parseInt(normalized.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function getPrimaryEquipmentLabel(equipmentSlugs: string[] = []) {
  const slug = equipmentSlugs[0] ?? "body-weight";

  return {
    slug,
    label: equipmentLabelMap.get(slug) ?? slugToLabel(slug),
  };
}

function getLevelLabel(levelSlug?: string) {
  if (!levelSlug) {
    return "All levels";
  }

  return levelLabelMap.get(levelSlug) ?? slugToLabel(levelSlug);
}

function getGoalLabels(goalSlugs: string[] = []) {
  return goalSlugs.slice(0, 2).map((slug) => goalLabelMap.get(slug) ?? slugToLabel(slug));
}

function resolveMuscleTheme(primaryMuscleSlugs: string[] = []): MuscleTheme {
  for (const theme of muscleThemeRegistry) {
    if (primaryMuscleSlugs.some((slug) => theme.slugs.has(slug))) {
      return theme;
    }
  }

  return {
    key: "general",
    label: "General strength",
    accent: palette.neutral,
    soft: palette.neutralSoft,
    halo: "#F8F2E7",
  };
}

function detectMovementPattern(input: ExerciseArtworkInput): {
  key: MovementPattern;
  label: string;
} {
  const slug = input.slug.toLowerCase();
  const meta = `${(input.categorySlugs ?? []).join(" ")} ${(input.goalSlugs ?? []).join(" ")}`.toLowerCase();

  if (/plank|pallof|dead-bug|bird-dog|hollow|hold/.test(slug) || /isometric/.test(meta)) {
    return { key: "stability", label: "Stability" };
  }

  if (/carry/.test(slug)) {
    return { key: "carry", label: "Carry" };
  }

  if (/ab-wheel|crunch|twist|mountain-climber|woodchop|wood-chop|leg-raise|knee-raise/.test(slug) || /core/.test(meta)) {
    return { key: "core-dynamic", label: "Core" };
  }

  if (
    /burpee|jump|battle-rope|rope|slam|swing/.test(slug) ||
    /hiit|cardio|conditioning/.test(meta)
  ) {
    return { key: "cardio", label: "Condition" };
  }

  if (/calf/.test(slug)) {
    return { key: "calf", label: "Calves" };
  }

  if (/lunge|split-squat|step-up/.test(slug)) {
    return { key: "lunge", label: "Lunge" };
  }

  if (/deadlift|hinge|good-morning|romanian|hip-thrust|glute-bridge|bridge/.test(slug)) {
    return { key: "hinge", label: "Hinge" };
  }

  if (/squat|leg-press|hack-squat/.test(slug)) {
    return { key: "squat", label: "Squat" };
  }

  if (/curl|hammer/.test(slug)) {
    return { key: "curl", label: "Curl" };
  }

  if (/pushdown|extension|skullcrusher|tricep/.test(slug)) {
    return { key: "extension", label: "Extend" };
  }

  if (/lateral-raise|front-raise|arnold|upright-row|y-raise|raise/.test(slug)) {
    return { key: "raise", label: "Raise" };
  }

  if (/pull-up|chin-up|pulldown/.test(slug) || /(^|-)lat(-|$)/.test(slug)) {
    return { key: "vertical-pull", label: "Pull" };
  }

  if (/row|face-pull/.test(slug)) {
    return { key: "row", label: "Row" };
  }

  if (/fly/.test(slug)) {
    return { key: "fly", label: "Fly" };
  }

  if (/bench|press|push-up|dip/.test(slug)) {
    return { key: "press", label: "Press" };
  }

  return { key: "general", label: "Train" };
}

function renderBrandGlyph(options: BrandArtworkOptions = {}) {
  const size = options.size ?? 512;
  const inverse = options.inverse ?? false;
  const outerFill = inverse ? "#FFFDF8" : palette.ink;
  const innerStart = inverse ? "#FFFFFF" : "#303030";
  const innerEnd = inverse ? "#F2E8D5" : "#111111";
  const markFill = inverse ? palette.ink : "#FFFDF8";
  const accentStroke = palette.gold;
  const base = size / 512;

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512" fill="none">
      <rect width="512" height="512" rx="132" fill="${outerFill}"/>
      <rect x="88" y="88" width="336" height="336" rx="104" fill="url(#mark-gradient)"/>
      <path d="M192.188 206.062C192.188 175.875 216.75 151.312 246.938 151.312H322.938V196.25H257C246.937 196.25 238.75 204.437 238.75 214.5C238.75 224.563 246.937 232.75 257 232.75H294C337.562 232.75 373 268.188 373 311.75C373 355.375 337.562 390.75 294 390.75H188.625V345.812H283.938C301.438 345.812 315.688 331.562 315.688 314.062C315.688 296.562 301.438 282.312 283.938 282.312H246.938C216.75 282.312 192.188 257.75 192.188 227.562V206.062Z" fill="${markFill}"/>
      <path d="M334 151L380 130" stroke="${accentStroke}" stroke-width="${18 * base}" stroke-linecap="round"/>
      <circle cx="382" cy="129" r="${18 * base}" fill="${palette.goldSoft}" stroke="${accentStroke}" stroke-width="${6 * base}"/>
      <defs>
        <radialGradient id="mark-gradient" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(196 128) rotate(47.3378) scale(363.724)">
          <stop stop-color="${innerStart}"/>
          <stop offset="1" stop-color="${innerEnd}"/>
        </radialGradient>
      </defs>
    </svg>
  `;
}

export function renderBrandMarkSvg(options: BrandArtworkOptions = {}) {
  return renderBrandGlyph(options).trim();
}

export function renderBrandWordmarkSvg(options: BrandArtworkOptions = {}) {
  const inverse = options.inverse ?? false;
  const textFill = inverse ? "#FFFDF8" : palette.ink;
  const subtitleFill = inverse ? "rgba(255,253,248,0.64)" : hexToRgba(palette.ink, 0.56);

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="420" height="104" viewBox="0 0 420 104" fill="none">
      <g transform="translate(0 8)">
        <g transform="scale(0.1875)">
          <rect width="512" height="512" rx="132" fill="${inverse ? "#FFFDF8" : palette.ink}"/>
          <rect x="88" y="88" width="336" height="336" rx="104" fill="url(#wordmark-gradient)"/>
          <path d="M192.188 206.062C192.188 175.875 216.75 151.312 246.938 151.312H322.938V196.25H257C246.937 196.25 238.75 204.437 238.75 214.5C238.75 224.563 246.937 232.75 257 232.75H294C337.562 232.75 373 268.188 373 311.75C373 355.375 337.562 390.75 294 390.75H188.625V345.812H283.938C301.438 345.812 315.688 331.562 315.688 314.062C315.688 296.562 301.438 282.312 283.938 282.312H246.938C216.75 282.312 192.188 257.75 192.188 227.562V206.062Z" fill="${inverse ? palette.ink : "#FFFDF8"}"/>
          <path d="M334 151L380 130" stroke="${palette.gold}" stroke-width="18" stroke-linecap="round"/>
          <circle cx="382" cy="129" r="18" fill="${palette.goldSoft}" stroke="${palette.gold}" stroke-width="6"/>
        </g>
      </g>
      <text x="114" y="52" font-family="Arial, Helvetica, sans-serif" font-size="46" font-weight="800" fill="${textFill}" letter-spacing="-1.6">SableFit</text>
      <text x="114" y="80" font-family="Arial, Helvetica, sans-serif" font-size="13" font-weight="700" fill="${subtitleFill}" letter-spacing="3.2">VISUAL WORKOUT PLANNER</text>
      <defs>
        <radialGradient id="wordmark-gradient" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(196 128) rotate(47.3378) scale(363.724)">
          <stop stop-color="${inverse ? "#FFFFFF" : "#303030"}"/>
          <stop offset="1" stop-color="${inverse ? "#F2E8D5" : "#111111"}"/>
        </radialGradient>
      </defs>
    </svg>
  `.trim();
}

function renderEquipmentIcon(equipmentSlug: string) {
  const stroke = `stroke="${palette.ink}" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" fill="none"`;

  switch (equipmentSlug) {
    case "dumbbell":
      return `<g ${stroke}><path d="M14 27V37"/><path d="M19 23V41"/><path d="M25 29H39"/><path d="M44 23V41"/><path d="M49 27V37"/></g>`;
    case "barbell":
      return `<g ${stroke}><path d="M10 18V46"/><path d="M16 22V42"/><path d="M22 26V38"/><path d="M24 32H40"/><path d="M42 26V38"/><path d="M48 22V42"/><path d="M54 18V46"/></g>`;
    case "kettlebell":
      return `<g ${stroke}><path d="M24 20C24 15 27 12 32 12C37 12 40 15 40 20"/><path d="M20 24H44"/><path d="M18 30C18 23 24 18 32 18C40 18 46 23 46 30V41C46 47 40 52 32 52C24 52 18 47 18 41V30Z"/></g>`;
    case "cable-machine":
      return `<g ${stroke}><path d="M14 10V54"/><path d="M14 10H46"/><path d="M46 10V54"/><path d="M30 16V32"/><circle cx="30" cy="38" r="6"/><path d="M30 44V52"/></g>`;
    case "machine":
    case "smith-machine":
    case "lat-pulldown-machine":
    case "leg-press-machine":
    case "leg-curl-machine":
    case "leg-extension-machine":
    case "pec-deck-machine":
    case "calf-raise-machine":
    case "seated-calf-raise-machine":
      return `<g ${stroke}><path d="M14 12V52"/><path d="M14 12H46"/><path d="M46 12V52"/><path d="M20 44H40"/><path d="M22 22H38"/><path d="M24 22V44"/></g>`;
    case "bench":
      return `<g ${stroke}><path d="M12 38H44"/><path d="M20 38V48"/><path d="M36 38V48"/><path d="M18 24H40"/><path d="M16 24V38"/></g>`;
    case "pull-up-bar":
    case "parallel-bars":
      return `<g ${stroke}><path d="M16 12V52"/><path d="M48 12V52"/><path d="M10 18H54"/></g>`;
    case "medicine-ball":
      return `<g ${stroke}><circle cx="32" cy="32" r="18"/><path d="M14 32H50"/><path d="M32 14V50"/></g>`;
    case "resistance-bands":
      return `<g ${stroke}><path d="M18 18C18 10 46 10 46 18C46 26 18 26 18 18Z"/><path d="M22 42C26 34 38 34 42 42"/><path d="M26 30V46"/><path d="M38 30V46"/></g>`;
    case "trx":
      return `<g ${stroke}><path d="M22 12L30 28"/><path d="M42 12L34 28"/><path d="M30 28V46"/><path d="M34 28V46"/><path d="M24 12H40"/></g>`;
    case "plyo-box":
      return `<g ${stroke}><path d="M18 18H46V46H18Z"/><path d="M18 18L28 10H56V38L46 46"/></g>`;
    case "battle-ropes":
      return `<g ${stroke}><path d="M14 24C22 20 30 20 38 24C46 28 50 28 54 24"/><path d="M14 40C22 36 30 36 38 40C46 44 50 44 54 40"/></g>`;
    case "ez-curl-bar":
      return `<g ${stroke}><path d="M10 34H20L26 28L32 34L38 28L44 34H54"/><path d="M14 26V42"/><path d="M50 26V42"/></g>`;
    case "plate":
      return `<g ${stroke}><circle cx="32" cy="32" r="18"/><circle cx="32" cy="32" r="6"/></g>`;
    case "ab-wheel":
      return `<g ${stroke}><circle cx="32" cy="32" r="12"/><path d="M12 32H20"/><path d="M44 32H52"/></g>`;
    case "yoga-mat":
      return `<g ${stroke}><path d="M14 40H50"/><path d="M18 34H46"/><path d="M46 34C48 34 50 36 50 38C50 40 48 42 46 42"/></g>`;
    default:
      return `<g ${stroke}><circle cx="32" cy="18" r="8"/><path d="M32 26V38"/><path d="M20 32L32 28L44 32"/><path d="M26 52L32 38L38 52"/></g>`;
  }
}

function renderGoalPills(goalLabels: string[], accent: string) {
  return goalLabels
    .map((label, index) => {
      const width = Math.max(74, label.length * 8 + 24);
      const x = index === 0 ? 0 : 6 + Math.max(74, goalLabels[index - 1].length * 8 + 24);

      return `
        <g transform="translate(${x} 0)">
          <rect width="${width}" height="28" rx="14" fill="${hexToRgba(accent, 0.13)}"/>
          <text x="${width / 2}" y="18" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="11" font-weight="700" fill="${accent}" letter-spacing="0.8">${escapeXml(label.toUpperCase())}</text>
        </g>
      `;
    })
    .join("");
}

function renderMuscleMap(theme: MuscleTheme) {
  const frameStroke = hexToRgba(palette.ink, 0.08);
  const frontHighlights =
    theme.key === "chest"
      ? `<ellipse cx="36" cy="58" rx="12" ry="9" fill="${theme.accent}" fill-opacity="0.78"/><ellipse cx="52" cy="58" rx="12" ry="9" fill="${theme.accent}" fill-opacity="0.78"/>`
      : theme.key === "shoulders"
        ? `<circle cx="28" cy="54" r="8" fill="${theme.accent}" fill-opacity="0.78"/><circle cx="60" cy="54" r="8" fill="${theme.accent}" fill-opacity="0.78"/>`
        : theme.key === "arms"
          ? `<rect x="16" y="60" width="10" height="30" rx="5" fill="${theme.accent}" fill-opacity="0.78"/><rect x="62" y="60" width="10" height="30" rx="5" fill="${theme.accent}" fill-opacity="0.78"/>`
          : theme.key === "core"
            ? `<rect x="32" y="56" width="24" height="38" rx="10" fill="${theme.accent}" fill-opacity="0.78"/>`
            : theme.key === "lower-body"
              ? `<rect x="28" y="94" width="14" height="40" rx="7" fill="${theme.accent}" fill-opacity="0.78"/><rect x="46" y="94" width="14" height="40" rx="7" fill="${theme.accent}" fill-opacity="0.78"/>`
              : `<rect x="24" y="48" width="40" height="86" rx="20" fill="${theme.accent}" fill-opacity="0.25"/>`;

  const backHighlights =
    theme.key === "back"
      ? `<path d="M28 58C28 48 36 42 44 42C52 42 60 48 60 58V92C60 98 54 104 44 104C34 104 28 98 28 92V58Z" fill="${theme.accent}" fill-opacity="0.78"/>`
      : theme.key === "shoulders"
        ? `<circle cx="28" cy="54" r="8" fill="${theme.accent}" fill-opacity="0.78"/><circle cx="60" cy="54" r="8" fill="${theme.accent}" fill-opacity="0.78"/>`
        : theme.key === "arms"
          ? `<rect x="16" y="60" width="10" height="30" rx="5" fill="${theme.accent}" fill-opacity="0.78"/><rect x="62" y="60" width="10" height="30" rx="5" fill="${theme.accent}" fill-opacity="0.78"/>`
          : theme.key === "lower-body"
            ? `<rect x="28" y="94" width="14" height="40" rx="7" fill="${theme.accent}" fill-opacity="0.78"/><rect x="46" y="94" width="14" height="40" rx="7" fill="${theme.accent}" fill-opacity="0.78"/>`
            : theme.key === "core"
              ? `<rect x="32" y="60" width="24" height="34" rx="10" fill="${theme.accent}" fill-opacity="0.6"/>`
              : `<rect x="24" y="48" width="40" height="86" rx="20" fill="${theme.accent}" fill-opacity="0.25"/>`;

  return `
    <g>
      <rect x="0" y="0" width="164" height="176" rx="28" fill="${palette.paper}" stroke="${frameStroke}"/>
      <text x="18" y="26" font-family="Arial, Helvetica, sans-serif" font-size="11" font-weight="700" fill="${hexToRgba(palette.ink, 0.42)}" letter-spacing="1.8">MUSCLE MAP</text>
      <g transform="translate(16 34)">
        <g>
          <circle cx="44" cy="16" r="10" fill="${theme.soft}" stroke="${hexToRgba(palette.ink, 0.16)}"/>
          <rect x="28" y="28" width="32" height="40" rx="16" fill="${theme.soft}" stroke="${hexToRgba(palette.ink, 0.16)}"/>
          <path d="M28 42L18 74" stroke="${hexToRgba(palette.ink, 0.16)}" stroke-width="8" stroke-linecap="round"/>
          <path d="M60 42L70 74" stroke="${hexToRgba(palette.ink, 0.16)}" stroke-width="8" stroke-linecap="round"/>
          <path d="M36 68L30 126" stroke="${hexToRgba(palette.ink, 0.16)}" stroke-width="8" stroke-linecap="round"/>
          <path d="M52 68L58 126" stroke="${hexToRgba(palette.ink, 0.16)}" stroke-width="8" stroke-linecap="round"/>
          ${frontHighlights}
        </g>
        <g transform="translate(74 0)">
          <circle cx="44" cy="16" r="10" fill="${theme.soft}" stroke="${hexToRgba(palette.ink, 0.16)}"/>
          <rect x="28" y="28" width="32" height="40" rx="16" fill="${theme.soft}" stroke="${hexToRgba(palette.ink, 0.16)}"/>
          <path d="M28 42L18 74" stroke="${hexToRgba(palette.ink, 0.16)}" stroke-width="8" stroke-linecap="round"/>
          <path d="M60 42L70 74" stroke="${hexToRgba(palette.ink, 0.16)}" stroke-width="8" stroke-linecap="round"/>
          <path d="M36 68L30 126" stroke="${hexToRgba(palette.ink, 0.16)}" stroke-width="8" stroke-linecap="round"/>
          <path d="M52 68L58 126" stroke="${hexToRgba(palette.ink, 0.16)}" stroke-width="8" stroke-linecap="round"/>
          ${backHighlights}
        </g>
      </g>
    </g>
  `;
}

function renderPose(pattern: MovementPattern, accent: string) {
  const stroke = `stroke="${palette.ink}" stroke-width="14" stroke-linecap="round" stroke-linejoin="round" fill="none"`;
  const guide = `stroke="${hexToRgba(palette.ink, 0.16)}" stroke-width="14" stroke-linecap="round" stroke-linejoin="round" fill="none"`;
  const focusFill = hexToRgba(accent, 0.22);
  const arrowStroke = `stroke="${accent}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" fill="none"`;

  switch (pattern) {
    case "press":
      return `
        <g transform="translate(26 62)">
          <rect x="114" y="206" width="170" height="16" rx="8" fill="${hexToRgba(palette.ink, 0.1)}"/>
          <rect x="158" y="118" width="118" height="14" rx="7" transform="rotate(-22 158 118)" fill="${palette.ink}"/>
          <circle cx="128" cy="136" r="22" fill="${focusFill}" stroke="${hexToRgba(palette.ink, 0.16)}" stroke-width="10"/>
          <path d="M148 154L198 182L248 168L286 118" ${stroke}/>
          <path d="M198 182L210 236" ${stroke}/>
          <path d="M248 168L252 222" ${stroke}/>
          <path d="M286 118L326 82" ${stroke}/>
          <path d="M270 130L344 94" ${stroke}/>
          <path d="M328 78H358" ${stroke}/>
          <path d="M338 88V68" ${guide}/>
          <path d="M96 158L146 158" ${arrowStroke}/>
        </g>
      `;
    case "fly":
      return `
        <g transform="translate(22 70)">
          <rect x="110" y="214" width="176" height="16" rx="8" fill="${hexToRgba(palette.ink, 0.1)}"/>
          <rect x="156" y="124" width="120" height="14" rx="7" transform="rotate(-20 156 124)" fill="${palette.ink}"/>
          <circle cx="128" cy="144" r="22" fill="${focusFill}" stroke="${hexToRgba(palette.ink, 0.16)}" stroke-width="10"/>
          <path d="M148 160L200 188L246 174L286 134" ${stroke}/>
          <path d="M212 178L180 104" ${stroke}/>
          <path d="M250 166L324 122" ${stroke}/>
          <path d="M164 88L182 100" ${guide}/>
          <path d="M318 104L338 92" ${guide}/>
          <path d="M144 96C164 118 174 132 188 146" ${arrowStroke}/>
          <path d="M336 112C308 128 292 140 276 150" ${arrowStroke}/>
        </g>
      `;
    case "row":
      return `
        <g transform="translate(30 56)">
          <path d="M100 258H304" ${guide}/>
          <circle cx="228" cy="88" r="22" fill="${focusFill}" stroke="${hexToRgba(palette.ink, 0.16)}" stroke-width="10"/>
          <path d="M210 108L188 152L136 162" ${stroke}/>
          <path d="M188 152L210 232" ${stroke}/>
          <path d="M160 162L146 232" ${stroke}/>
          <path d="M136 162L92 146" ${stroke}/>
          <path d="M92 146L64 154" ${stroke}/>
          <path d="M248 116L304 152" ${stroke}/>
          <path d="M76 150H120" ${guide}/>
          <path d="M298 146L332 126" ${arrowStroke}/>
        </g>
      `;
    case "vertical-pull":
      return `
        <g transform="translate(30 52)">
          <path d="M120 34H320" ${guide}/>
          <path d="M118 34V214" ${guide}/>
          <path d="M320 34V214" ${guide}/>
          <rect x="184" y="208" width="86" height="18" rx="9" fill="${hexToRgba(palette.ink, 0.12)}"/>
          <circle cx="226" cy="92" r="22" fill="${focusFill}" stroke="${hexToRgba(palette.ink, 0.16)}" stroke-width="10"/>
          <path d="M226 114L226 166" ${stroke}/>
          <path d="M226 166L202 236" ${stroke}/>
          <path d="M226 166L250 236" ${stroke}/>
          <path d="M226 126L174 72" ${stroke}/>
          <path d="M226 126L278 72" ${stroke}/>
          <path d="M156 64H296" ${stroke}/>
          <path d="M172 82L156 64L172 48" ${arrowStroke}/>
          <path d="M280 82L296 64L280 48" ${arrowStroke}/>
        </g>
      `;
    case "curl":
      return `
        <g transform="translate(38 56)">
          <circle cx="200" cy="76" r="22" fill="${focusFill}" stroke="${hexToRgba(palette.ink, 0.16)}" stroke-width="10"/>
          <path d="M200 98L200 170" ${stroke}/>
          <path d="M200 124L154 154" ${stroke}/>
          <path d="M154 154L172 202" ${stroke}/>
          <path d="M200 124L246 154" ${stroke}/>
          <path d="M246 154L228 202" ${stroke}/>
          <path d="M200 170L176 246" ${stroke}/>
          <path d="M200 170L224 246" ${stroke}/>
          <path d="M164 196H180" ${guide}/>
          <path d="M220 196H236" ${guide}/>
          <path d="M144 160C148 184 158 194 170 206" ${arrowStroke}/>
          <path d="M256 160C252 184 242 194 230 206" ${arrowStroke}/>
        </g>
      `;
    case "extension":
      return `
        <g transform="translate(42 54)">
          <path d="M110 34H290" ${guide}/>
          <path d="M110 34V232" ${guide}/>
          <circle cx="208" cy="78" r="22" fill="${focusFill}" stroke="${hexToRgba(palette.ink, 0.16)}" stroke-width="10"/>
          <path d="M208 100L208 170" ${stroke}/>
          <path d="M208 120L160 146" ${stroke}/>
          <path d="M160 146L160 206" ${stroke}/>
          <path d="M208 120L256 146" ${stroke}/>
          <path d="M256 146L256 206" ${stroke}/>
          <path d="M208 170L184 246" ${stroke}/>
          <path d="M208 170L232 246" ${stroke}/>
          <path d="M150 212H170" ${guide}/>
          <path d="M246 212H266" ${guide}/>
          <path d="M160 160V196" ${arrowStroke}/>
          <path d="M256 160V196" ${arrowStroke}/>
        </g>
      `;
    case "raise":
      return `
        <g transform="translate(34 52)">
          <circle cx="198" cy="76" r="22" fill="${focusFill}" stroke="${hexToRgba(palette.ink, 0.16)}" stroke-width="10"/>
          <path d="M198 98L198 170" ${stroke}/>
          <path d="M198 120L142 76" ${stroke}/>
          <path d="M198 120L254 76" ${stroke}/>
          <path d="M198 170L178 246" ${stroke}/>
          <path d="M198 170L218 246" ${stroke}/>
          <path d="M128 66L144 78L156 64" ${arrowStroke}/>
          <path d="M268 66L252 78L240 64" ${arrowStroke}/>
        </g>
      `;
    case "squat":
      return `
        <g transform="translate(34 50)">
          <path d="M110 68H288" ${stroke}/>
          <path d="M126 60V78" ${guide}/>
          <path d="M272 60V78" ${guide}/>
          <circle cx="198" cy="78" r="22" fill="${focusFill}" stroke="${hexToRgba(palette.ink, 0.16)}" stroke-width="10"/>
          <path d="M198 100L198 158" ${stroke}/>
          <path d="M198 122L154 104" ${stroke}/>
          <path d="M198 122L242 104" ${stroke}/>
          <path d="M198 158L168 198" ${stroke}/>
          <path d="M198 158L230 198" ${stroke}/>
          <path d="M168 198L132 244" ${stroke}/>
          <path d="M230 198L266 244" ${stroke}/>
          <path d="M132 244H170" ${guide}/>
          <path d="M228 244H266" ${guide}/>
          <path d="M88 126C118 142 140 154 156 168" ${arrowStroke}/>
        </g>
      `;
    case "lunge":
      return `
        <g transform="translate(28 54)">
          <circle cx="200" cy="76" r="22" fill="${focusFill}" stroke="${hexToRgba(palette.ink, 0.16)}" stroke-width="10"/>
          <path d="M200 98L190 164" ${stroke}/>
          <path d="M190 124L148 156" ${stroke}/>
          <path d="M190 124L238 138" ${stroke}/>
          <path d="M190 164L154 206" ${stroke}/>
          <path d="M154 206L140 250" ${stroke}/>
          <path d="M190 164L238 180" ${stroke}/>
          <path d="M238 180L278 244" ${stroke}/>
          <path d="M128 248H164" ${guide}/>
          <path d="M254 244H292" ${guide}/>
          <path d="M118 160C134 180 146 194 154 206" ${arrowStroke}/>
        </g>
      `;
    case "hinge":
      return `
        <g transform="translate(24 56)">
          <path d="M86 258H310" ${guide}/>
          <circle cx="234" cy="88" r="22" fill="${focusFill}" stroke="${hexToRgba(palette.ink, 0.16)}" stroke-width="10"/>
          <path d="M216 108L186 156L138 184" ${stroke}/>
          <path d="M186 156L208 228" ${stroke}/>
          <path d="M138 184L118 246" ${stroke}/>
          <path d="M208 228L232 246" ${stroke}/>
          <path d="M150 174L110 188" ${stroke}/>
          <path d="M110 188H72" ${stroke}/>
          <path d="M72 188H170" ${guide}/>
          <path d="M296 110C276 134 252 148 226 156" ${arrowStroke}/>
        </g>
      `;
    case "stability":
      return `
        <g transform="translate(22 76)">
          <rect x="92" y="208" width="220" height="16" rx="8" fill="${hexToRgba(palette.ink, 0.1)}"/>
          <circle cx="120" cy="132" r="20" fill="${focusFill}" stroke="${hexToRgba(palette.ink, 0.16)}" stroke-width="10"/>
          <path d="M138 144L216 166L300 172" ${stroke}/>
          <path d="M216 166L190 224" ${stroke}/>
          <path d="M300 172L320 228" ${stroke}/>
          <path d="M120 152L92 180" ${stroke}/>
          <path d="M160 120C186 116 208 116 230 120" ${arrowStroke}/>
        </g>
      `;
    case "carry":
      return `
        <g transform="translate(34 56)">
          <circle cx="198" cy="78" r="22" fill="${focusFill}" stroke="${hexToRgba(palette.ink, 0.16)}" stroke-width="10"/>
          <path d="M198 100L198 172" ${stroke}/>
          <path d="M198 126L160 154" ${stroke}/>
          <path d="M160 154L160 220" ${stroke}/>
          <path d="M198 126L238 146" ${stroke}/>
          <path d="M198 172L178 246" ${stroke}/>
          <path d="M198 172L226 246" ${stroke}/>
          <rect x="148" y="222" width="26" height="26" rx="8" fill="${hexToRgba(palette.ink, 0.12)}" stroke="${palette.ink}" stroke-width="8"/>
          <path d="M130 136C148 160 156 190 160 220" ${arrowStroke}/>
        </g>
      `;
    case "calf":
      return `
        <g transform="translate(32 56)">
          <rect x="98" y="232" width="98" height="16" rx="8" fill="${hexToRgba(palette.ink, 0.12)}"/>
          <circle cx="208" cy="78" r="22" fill="${focusFill}" stroke="${hexToRgba(palette.ink, 0.16)}" stroke-width="10"/>
          <path d="M208 100L208 174" ${stroke}/>
          <path d="M208 126L168 154" ${stroke}/>
          <path d="M208 126L248 154" ${stroke}/>
          <path d="M208 174L188 232" ${stroke}/>
          <path d="M208 174L220 226" ${stroke}/>
          <path d="M188 232L170 232" ${stroke}/>
          <path d="M220 226L244 220" ${stroke}/>
          <path d="M258 144C248 182 238 208 220 226" ${arrowStroke}/>
        </g>
      `;
    case "cardio":
      return `
        <g transform="translate(28 52)">
          <circle cx="198" cy="74" r="22" fill="${focusFill}" stroke="${hexToRgba(palette.ink, 0.16)}" stroke-width="10"/>
          <path d="M198 96L184 152L224 184" ${stroke}/>
          <path d="M184 118L136 150" ${stroke}/>
          <path d="M184 118L242 104" ${stroke}/>
          <path d="M184 152L150 222" ${stroke}/>
          <path d="M224 184L272 240" ${stroke}/>
          <path d="M116 82C144 58 164 48 184 48" ${arrowStroke}/>
          <path d="M236 42C262 50 288 68 314 96" ${arrowStroke}/>
        </g>
      `;
    case "core-dynamic":
      return `
        <g transform="translate(24 80)">
          <rect x="92" y="214" width="220" height="16" rx="8" fill="${hexToRgba(palette.ink, 0.1)}"/>
          <circle cx="134" cy="144" r="20" fill="${focusFill}" stroke="${hexToRgba(palette.ink, 0.16)}" stroke-width="10"/>
          <path d="M150 154L202 184L244 174" ${stroke}/>
          <path d="M202 184L236 132" ${stroke}/>
          <path d="M202 184L246 220" ${stroke}/>
          <path d="M244 174L292 130" ${guide}/>
          <path d="M236 132C250 144 260 154 272 166" ${arrowStroke}/>
        </g>
      `;
    default:
      return `
        <g transform="translate(36 54)">
          <circle cx="198" cy="78" r="22" fill="${focusFill}" stroke="${hexToRgba(palette.ink, 0.16)}" stroke-width="10"/>
          <path d="M198 100L198 172" ${stroke}/>
          <path d="M198 126L150 154" ${stroke}/>
          <path d="M198 126L246 146" ${stroke}/>
          <path d="M198 172L176 246" ${stroke}/>
          <path d="M198 172L228 246" ${stroke}/>
          <path d="M114 112C136 122 154 134 168 150" ${arrowStroke}/>
        </g>
      `;
  }
}

export function renderExerciseCardSvg(input: ExerciseArtworkInput) {
  const title = escapeXml(input.name.en);
  const titleLine = title.length > 26 ? `${title.slice(0, 24).trim()}...` : title;
  const equipment = getPrimaryEquipmentLabel(input.equipmentSlugs);
  const movement = detectMovementPattern(input);
  const theme = resolveMuscleTheme(input.primaryMuscleSlugs);
  const level = escapeXml(getLevelLabel(input.levelSlug));
  const goalLabels = getGoalLabels(input.goalSlugs);
  const id = escapeXml(input.slug);

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="720" height="540" viewBox="0 0 720 540" fill="none">
      <defs>
        <linearGradient id="card-bg-${id}" x1="96" y1="48" x2="648" y2="492" gradientUnits="userSpaceOnUse">
          <stop stop-color="${theme.halo}"/>
          <stop offset="1" stop-color="${palette.paper}"/>
        </linearGradient>
        <radialGradient id="halo-${id}" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(182 198) rotate(38.2) scale(262 216)">
          <stop stop-color="${hexToRgba(theme.accent, 0.18)}"/>
          <stop offset="1" stop-color="${hexToRgba(theme.accent, 0)}"/>
        </radialGradient>
        <pattern id="dots-${id}" width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="6" cy="6" r="1.5" fill="${hexToRgba(theme.accent, 0.18)}"/>
        </pattern>
      </defs>
      <rect width="720" height="540" rx="48" fill="${palette.canvas}"/>
      <rect x="24" y="24" width="672" height="492" rx="36" fill="url(#card-bg-${id})" stroke="${hexToRgba(palette.ink, 0.08)}"/>
      <rect x="38" y="38" width="644" height="464" rx="30" fill="url(#dots-${id})"/>
      <circle cx="174" cy="198" r="162" fill="url(#halo-${id})"/>

      <g transform="translate(54 56)">
        <rect x="0" y="0" width="132" height="34" rx="17" fill="${hexToRgba(palette.ink, 0.08)}"/>
        <text x="18" y="22" font-family="Arial, Helvetica, sans-serif" font-size="14" font-weight="800" fill="${palette.ink}" letter-spacing="2.4">SABLEFIT</text>

        <g transform="translate(438 0)">
          <rect x="0" y="0" width="174" height="52" rx="26" fill="${palette.paper}" stroke="${hexToRgba(palette.ink, 0.08)}"/>
          <g transform="translate(14 10)">
            ${renderEquipmentIcon(equipment.slug)}
          </g>
          <text x="62" y="24" font-family="Arial, Helvetica, sans-serif" font-size="12" font-weight="700" fill="${hexToRgba(palette.ink, 0.42)}" letter-spacing="1.8">EQUIPMENT</text>
          <text x="62" y="40" font-family="Arial, Helvetica, sans-serif" font-size="16" font-weight="800" fill="${palette.ink}">${escapeXml(equipment.label)}</text>
        </g>

        <g transform="translate(0 40)">
          ${renderPose(movement.key, theme.accent)}
        </g>

        <g transform="translate(430 84)">
          <text x="0" y="20" font-family="Arial, Helvetica, sans-serif" font-size="12" font-weight="700" fill="${hexToRgba(palette.ink, 0.42)}" letter-spacing="2.4">MOVEMENT</text>
          <text x="0" y="58" font-family="Arial, Helvetica, sans-serif" font-size="36" font-weight="800" fill="${palette.ink}" letter-spacing="-1.2">${escapeXml(movement.label)}</text>
          <text x="0" y="82" font-family="Arial, Helvetica, sans-serif" font-size="14" font-weight="700" fill="${theme.accent}">${escapeXml(theme.label)}</text>
          <g transform="translate(0 102)">
            ${renderMuscleMap(theme)}
          </g>
          <g transform="translate(0 294)">
            <rect width="126" height="32" rx="16" fill="${hexToRgba(theme.accent, 0.14)}"/>
            <text x="63" y="21" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="12" font-weight="800" fill="${theme.accent}" letter-spacing="1.6">${escapeXml(level.toUpperCase())}</text>
          </g>
          <g transform="translate(0 338)">
            ${renderGoalPills(goalLabels.length ? goalLabels : ["Structured"], theme.accent)}
          </g>
        </g>

        <g transform="translate(0 372)">
          <rect x="0" y="0" width="394" height="74" rx="30" fill="${palette.paper}" stroke="${hexToRgba(palette.ink, 0.08)}"/>
          <text x="24" y="30" font-family="Arial, Helvetica, sans-serif" font-size="13" font-weight="700" fill="${hexToRgba(palette.ink, 0.42)}" letter-spacing="2.1">EXERCISE CARD</text>
          <text x="24" y="56" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="800" fill="${palette.ink}" letter-spacing="-0.6">${titleLine}</text>
        </g>
      </g>
    </svg>
  `.trim();
}

function renderPhoneFrame(innerMarkup: string) {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="420" height="860" viewBox="0 0 420 860" fill="none">
      <rect x="18" y="18" width="384" height="824" rx="58" fill="${palette.ink}"/>
      <rect x="34" y="34" width="352" height="792" rx="44" fill="${palette.canvas}"/>
      <rect x="154" y="52" width="112" height="12" rx="6" fill="${hexToRgba(palette.ink, 0.16)}"/>
      <rect x="56" y="92" width="308" height="688" rx="34" fill="url(#screen-bg)"/>
      <g transform="translate(70 112)">
        ${innerMarkup}
      </g>
      <rect x="168" y="796" width="84" height="6" rx="3" fill="${hexToRgba(palette.ink, 0.16)}"/>
      <defs>
        <linearGradient id="screen-bg" x1="210" y1="92" x2="210" y2="780" gradientUnits="userSpaceOnUse">
          <stop stop-color="#FFFFFF"/>
          <stop offset="1" stop-color="#F3F0E8"/>
        </linearGradient>
      </defs>
    </svg>
  `.trim();
}

function renderTodayScreenContent() {
  return `
    <text x="0" y="16" font-family="Arial, Helvetica, sans-serif" font-size="12" font-weight="700" fill="${hexToRgba(palette.ink, 0.42)}" letter-spacing="2.4">TODAY</text>
    <text x="0" y="50" font-family="Arial, Helvetica, sans-serif" font-size="30" font-weight="800" fill="${palette.ink}" letter-spacing="-0.8">SableFit rhythm</text>
    <rect x="0" y="76" width="280" height="94" rx="28" fill="${palette.paper}" stroke="${hexToRgba(palette.ink, 0.08)}"/>
    <text x="20" y="106" font-family="Arial, Helvetica, sans-serif" font-size="12" font-weight="700" fill="${hexToRgba(palette.ink, 0.42)}" letter-spacing="1.8">ACTIVE PLAN</text>
    <text x="20" y="136" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="800" fill="${palette.ink}">Push Pull Legs</text>
    <text x="20" y="158" font-family="Arial, Helvetica, sans-serif" font-size="14" font-weight="600" fill="${hexToRgba(palette.ink, 0.56)}">06:30 reminder • 3 days a week</text>

    <rect x="0" y="188" width="280" height="176" rx="32" fill="${palette.paper}" stroke="${hexToRgba(palette.ink, 0.08)}"/>
    <text x="20" y="220" font-family="Arial, Helvetica, sans-serif" font-size="12" font-weight="700" fill="${hexToRgba(palette.ink, 0.42)}" letter-spacing="1.8">NEXT SESSION</text>
    <text x="20" y="254" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="800" fill="${palette.ink}" letter-spacing="-0.8">Upper Strength</text>
    <rect x="20" y="274" width="116" height="64" rx="20" fill="${palette.backSoft}"/>
    <rect x="144" y="274" width="116" height="64" rx="20" fill="${palette.chestSoft}"/>
    <text x="36" y="308" font-family="Arial, Helvetica, sans-serif" font-size="16" font-weight="800" fill="${palette.back}">Pendlay Row</text>
    <text x="160" y="308" font-family="Arial, Helvetica, sans-serif" font-size="16" font-weight="800" fill="${palette.chest}">Close-Grip</text>
    <rect x="20" y="316" width="70" height="8" rx="4" fill="${hexToRgba(palette.back, 0.32)}"/>
    <rect x="144" y="316" width="76" height="8" rx="4" fill="${hexToRgba(palette.chest, 0.32)}"/>

    <rect x="0" y="384" width="280" height="112" rx="30" fill="${palette.paper}" stroke="${hexToRgba(palette.ink, 0.08)}"/>
    <text x="20" y="416" font-family="Arial, Helvetica, sans-serif" font-size="12" font-weight="700" fill="${hexToRgba(palette.ink, 0.42)}" letter-spacing="1.8">REMINDERS</text>
    <rect x="20" y="432" width="108" height="36" rx="18" fill="${hexToRgba(palette.ink, 0.08)}"/>
    <text x="74" y="455" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="13" font-weight="800" fill="${palette.ink}">WEB PUSH ON</text>
    <text x="20" y="482" font-family="Arial, Helvetica, sans-serif" font-size="14" font-weight="600" fill="${hexToRgba(palette.ink, 0.56)}">One-tap view for today, next up, and completion state.</text>

    <g transform="translate(44 540)">
      <rect x="0" y="0" width="36" height="36" rx="18" fill="${palette.ink}"/>
      <rect x="76" y="0" width="36" height="36" rx="18" fill="${hexToRgba(palette.ink, 0.08)}"/>
      <rect x="152" y="0" width="36" height="36" rx="18" fill="${hexToRgba(palette.ink, 0.08)}"/>
      <rect x="228" y="0" width="36" height="36" rx="18" fill="${hexToRgba(palette.ink, 0.08)}"/>
    </g>
  `;
}

function renderPlansScreenContent() {
  return `
    <text x="0" y="16" font-family="Arial, Helvetica, sans-serif" font-size="12" font-weight="700" fill="${hexToRgba(palette.ink, 0.42)}" letter-spacing="2.4">PLANS</text>
    <text x="0" y="50" font-family="Arial, Helvetica, sans-serif" font-size="30" font-weight="800" fill="${palette.ink}" letter-spacing="-0.8">Weekly split</text>
    <rect x="0" y="76" width="280" height="144" rx="32" fill="${palette.paper}" stroke="${hexToRgba(palette.ink, 0.08)}"/>
    <text x="20" y="108" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="800" fill="${palette.ink}">Mass Builder 4-Day</text>
    <text x="20" y="132" font-family="Arial, Helvetica, sans-serif" font-size="14" font-weight="600" fill="${hexToRgba(palette.ink, 0.56)}">Mon • Tue • Thu • Sat</text>
    <rect x="20" y="150" width="84" height="40" rx="20" fill="${palette.chestSoft}"/>
    <rect x="112" y="150" width="84" height="40" rx="20" fill="${palette.backSoft}"/>
    <rect x="204" y="150" width="56" height="40" rx="20" fill="${palette.legsSoft}"/>
    <text x="62" y="174" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="12" font-weight="800" fill="${palette.chest}">PUSH</text>
    <text x="154" y="174" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="12" font-weight="800" fill="${palette.back}">PULL</text>
    <text x="232" y="174" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="12" font-weight="800" fill="${palette.legs}">LEGS</text>

    <rect x="0" y="240" width="280" height="116" rx="30" fill="${palette.paper}" stroke="${hexToRgba(palette.ink, 0.08)}"/>
    <text x="20" y="272" font-family="Arial, Helvetica, sans-serif" font-size="12" font-weight="700" fill="${hexToRgba(palette.ink, 0.42)}" letter-spacing="1.8">THIS WEEK</text>
    <rect x="20" y="290" width="240" height="16" rx="8" fill="${hexToRgba(palette.ink, 0.08)}"/>
    <rect x="20" y="290" width="164" height="16" rx="8" fill="${palette.ink}"/>
    <text x="20" y="334" font-family="Arial, Helvetica, sans-serif" font-size="14" font-weight="600" fill="${hexToRgba(palette.ink, 0.56)}">12 completed sessions • auto reminders at 06:30</text>

    <rect x="0" y="376" width="280" height="132" rx="30" fill="${palette.paper}" stroke="${hexToRgba(palette.ink, 0.08)}"/>
    <text x="20" y="408" font-family="Arial, Helvetica, sans-serif" font-size="12" font-weight="700" fill="${hexToRgba(palette.ink, 0.42)}" letter-spacing="1.8">TEMPLATE STACK</text>
    <rect x="20" y="426" width="240" height="26" rx="13" fill="${palette.goldSoft}"/>
    <rect x="20" y="462" width="190" height="26" rx="13" fill="${palette.backSoft}"/>
    <text x="34" y="444" font-family="Arial, Helvetica, sans-serif" font-size="13" font-weight="800" fill="${palette.neutral}">Beginner Reset 2-Day</text>
    <text x="34" y="480" font-family="Arial, Helvetica, sans-serif" font-size="13" font-weight="800" fill="${palette.back}">Back and Core Focus</text>
  `;
}

function renderLibraryScreenContent() {
  return `
    <text x="0" y="16" font-family="Arial, Helvetica, sans-serif" font-size="12" font-weight="700" fill="${hexToRgba(palette.ink, 0.42)}" letter-spacing="2.4">LIBRARY</text>
    <text x="0" y="50" font-family="Arial, Helvetica, sans-serif" font-size="30" font-weight="800" fill="${palette.ink}" letter-spacing="-0.8">Visual cards</text>
    <rect x="0" y="78" width="280" height="44" rx="22" fill="${palette.paper}" stroke="${hexToRgba(palette.ink, 0.08)}"/>
    <text x="20" y="105" font-family="Arial, Helvetica, sans-serif" font-size="15" font-weight="700" fill="${hexToRgba(palette.ink, 0.42)}">Search exercise</text>
    <rect x="0" y="138" width="86" height="34" rx="17" fill="${hexToRgba(palette.ink, 0.08)}"/>
    <rect x="96" y="138" width="72" height="34" rx="17" fill="${palette.backSoft}"/>
    <rect x="178" y="138" width="102" height="34" rx="17" fill="${palette.goldSoft}"/>
    <text x="43" y="160" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="12" font-weight="800" fill="${palette.ink}">ALL</text>
    <text x="132" y="160" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="12" font-weight="800" fill="${palette.back}">BACK</text>
    <text x="229" y="160" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="12" font-weight="800" fill="${palette.neutral}">DUMBBELL</text>
    <rect x="0" y="192" width="132" height="168" rx="28" fill="${palette.paper}" stroke="${hexToRgba(palette.ink, 0.08)}"/>
    <rect x="148" y="192" width="132" height="168" rx="28" fill="${palette.paper}" stroke="${hexToRgba(palette.ink, 0.08)}"/>
    <rect x="12" y="206" width="108" height="98" rx="24" fill="${palette.backSoft}"/>
    <rect x="160" y="206" width="108" height="98" rx="24" fill="${palette.chestSoft}"/>
    <text x="18" y="326" font-family="Arial, Helvetica, sans-serif" font-size="14" font-weight="800" fill="${palette.ink}">Chest Supported Row</text>
    <text x="166" y="326" font-family="Arial, Helvetica, sans-serif" font-size="14" font-weight="800" fill="${palette.ink}">Flat Dumbbell Press</text>
    <text x="18" y="344" font-family="Arial, Helvetica, sans-serif" font-size="12" font-weight="700" fill="${hexToRgba(palette.ink, 0.42)}">Back focus</text>
    <text x="166" y="344" font-family="Arial, Helvetica, sans-serif" font-size="12" font-weight="700" fill="${hexToRgba(palette.ink, 0.42)}">Chest focus</text>
  `;
}

function renderInstallScreenContent() {
  return `
    <text x="0" y="16" font-family="Arial, Helvetica, sans-serif" font-size="12" font-weight="700" fill="${hexToRgba(palette.ink, 0.42)}" letter-spacing="2.4">INSTALL</text>
    <text x="0" y="50" font-family="Arial, Helvetica, sans-serif" font-size="30" font-weight="800" fill="${palette.ink}" letter-spacing="-0.8">Home screen ready</text>
    <rect x="0" y="76" width="280" height="152" rx="32" fill="${palette.paper}" stroke="${hexToRgba(palette.ink, 0.08)}"/>
    <rect x="20" y="96" width="68" height="68" rx="22" fill="${palette.ink}"/>
    <path d="M44 114C44 107 50 101 58 101H76V114H64C60 114 58 116 58 119C58 122 60 124 64 124H69C80 124 89 133 89 145C89 156 80 165 69 165H44V152H66C70 152 73 149 73 145C73 141 70 138 66 138H58C50 138 44 132 44 124V114Z" fill="#FFFDF8"/>
    <path d="M80 102L94 96" stroke="${palette.gold}" stroke-width="5" stroke-linecap="round"/>
    <circle cx="96" cy="95" r="5" fill="${palette.goldSoft}" stroke="${palette.gold}" stroke-width="2"/>
    <text x="104" y="118" font-family="Arial, Helvetica, sans-serif" font-size="20" font-weight="800" fill="${palette.ink}">SableFit</text>
    <text x="104" y="146" font-family="Arial, Helvetica, sans-serif" font-size="14" font-weight="600" fill="${hexToRgba(palette.ink, 0.56)}">Install for reminders, standalone mode, and faster launch.</text>
    <rect x="0" y="248" width="280" height="188" rx="32" fill="${palette.paper}" stroke="${hexToRgba(palette.ink, 0.08)}"/>
    <text x="20" y="280" font-family="Arial, Helvetica, sans-serif" font-size="12" font-weight="700" fill="${hexToRgba(palette.ink, 0.42)}" letter-spacing="1.8">FIRST-RUN FLOW</text>
    <rect x="20" y="298" width="240" height="38" rx="19" fill="${hexToRgba(palette.ink, 0.08)}"/>
    <rect x="20" y="346" width="240" height="38" rx="19" fill="${palette.goldSoft}"/>
    <rect x="20" y="394" width="240" height="38" rx="19" fill="${palette.backSoft}"/>
    <text x="36" y="322" font-family="Arial, Helvetica, sans-serif" font-size="13" font-weight="800" fill="${palette.ink}">1. Open Share or browser menu</text>
    <text x="36" y="370" font-family="Arial, Helvetica, sans-serif" font-size="13" font-weight="800" fill="${palette.neutral}">2. Tap Add to Home Screen</text>
    <text x="36" y="418" font-family="Arial, Helvetica, sans-serif" font-size="13" font-weight="800" fill="${palette.back}">3. Enable push on the installed app</text>
  `;
}

function renderSingleScreen(kind: Exclude<ScreenArtworkKind, "hero-stack">) {
  if (kind === "today") {
    return renderPhoneFrame(renderTodayScreenContent());
  }

  if (kind === "plans") {
    return renderPhoneFrame(renderPlansScreenContent());
  }

  if (kind === "library") {
    return renderPhoneFrame(renderLibraryScreenContent());
  }

  return renderPhoneFrame(renderInstallScreenContent());
}

export function renderAppScreenSvg(kind: ScreenArtworkKind) {
  if (kind !== "hero-stack") {
    return renderSingleScreen(kind);
  }

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="920" height="860" viewBox="0 0 920 860" fill="none">
      <defs>
        <radialGradient id="hero-halo" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(470 220) rotate(90) scale(410 520)">
          <stop stop-color="${hexToRgba(palette.gold, 0.18)}"/>
          <stop offset="1" stop-color="${hexToRgba(palette.gold, 0)}"/>
        </radialGradient>
      </defs>
      <rect width="920" height="860" rx="80" fill="${palette.canvas}"/>
      <circle cx="472" cy="250" r="320" fill="url(#hero-halo)"/>
      <g transform="translate(36 138) rotate(-10 180 360)">
        <g transform="scale(0.72)">
          ${renderSingleScreen("plans")}
        </g>
      </g>
      <g transform="translate(280 40)">
        <g transform="scale(0.84)">
          ${renderSingleScreen("today")}
        </g>
      </g>
      <g transform="translate(590 166) rotate(10 150 330)">
        <g transform="scale(0.66)">
          ${renderSingleScreen("library")}
        </g>
      </g>
    </svg>
  `.trim();
}
