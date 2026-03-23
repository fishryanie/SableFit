import fs from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import sharp from "sharp";
import { v2 as cloudinary } from "cloudinary";
import { getSystemExercises, getSystemTaxonomy } from "../src/data/system/catalog";
import {
  renderAppScreenSvg,
  renderBrandMarkSvg,
  renderBrandWordmarkSvg,
} from "../src/lib/artwork";
import type { ExerciseMedia } from "../src/types/domain";

const require = createRequire(import.meta.url);
const { GIFEncoder, quantize, applyPalette } = require("gifenc") as {
  GIFEncoder: () => {
    writeFrame: (
      index: Uint8Array,
      width: number,
      height: number,
      options?: {
        palette?: number[][];
        delay?: number;
        repeat?: number;
        transparent?: boolean;
      },
    ) => void;
    finish: () => void;
    bytesView: () => Uint8Array;
  };
  quantize: (
    rgba: Uint8Array,
    maxColors: number,
    options?: {
      format?: "rgb565" | "rgb444" | "rgba4444";
      oneBitAlpha?: boolean | number;
      clearAlpha?: boolean;
      clearAlphaThreshold?: number;
    },
  ) => number[][];
  applyPalette: (
    rgba: Uint8Array,
    palette: number[][],
    format?: "rgb565" | "rgb444" | "rgba4444",
  ) => Uint8Array;
};

type ScreenSpec = {
  key: "today" | "plans" | "library" | "install" | "hero-stack";
  width: number;
  height: number;
};

type ExerciseSeed = ReturnType<typeof getSystemExercises>[number];

type MediaManifest = Record<string, ExerciseMedia>;
type EquipmentImageManifest = Record<
  string,
  {
    imageUrl: string;
    sourcePath: string;
    status: "PROVIDED" | "DERIVED";
  }
>;
type MuscleImageManifest = Record<
  string,
  {
    imageUrl: string;
    sourcePath: string;
    status: "PROVIDED" | "DERIVED";
  }
>;

type CloudinaryRuntime = {
  rootFolder: string;
};

type PickedSourceAsset = {
  asset: SourceAsset;
  matchMode: "exact" | "equivalent" | "prototype";
};

type DerivedExerciseMediaMatchMode = "exact" | "equivalent";

type DerivedExerciseMediaSpec = {
  baseRelativePath: string;
  matchMode: DerivedExerciseMediaMatchMode;
  sourceProvider: string;
  sourcePath: string;
  overlayVariant: "trx-push-up" | "trx-row";
};

type ExerciseMediaAuditEntry = {
  slug: string;
  matchMode: "exact" | "equivalent" | "prototype";
  sourcePath: string;
  cloudinaryFolder: string;
};

type EquipmentImageAuditEntry = {
  slug: string;
  status: "PROVIDED" | "DERIVED";
  sourcePath: string;
  cloudinaryFolder: string;
};

type MuscleImageAuditEntry = {
  slug: string;
  status: "PROVIDED" | "DERIVED";
  sourcePath: string;
  cloudinaryFolder: string;
};

type ExerciseVideoOverride = {
  videoPublicId: string;
  posterPublicId?: string;
};

type SourceAsset = {
  absolutePath: string;
  relativePath: string;
  extension: string;
  tokens: string[];
  categoryHint: string;
  equipmentHints: string[];
  movementHints: string[];
  normalizedLabel: string;
};

type RenderedFrame = {
  rgba: Uint8Array;
  width: number;
  height: number;
};

const root = process.cwd();
const publicDir = path.join(root, "public");
const srcDir = path.join(root, "src");
const brandDir = path.join(publicDir, "brand");
const screensDir = path.join(publicDir, "screens");
const workoutPublicDir = path.join(publicDir, "workout");
const exerciseMediaDir = path.join(workoutPublicDir, "exercise");
const equipmentImageDir = path.join(workoutPublicDir, "equipment");
const muscleImageDir = path.join(workoutPublicDir, "muscle");
const legacyExerciseArtDir = path.join(publicDir, "exercise-art");
const legacyExerciseMediaDir = path.join(publicDir, "exercise-media");
const pwaDir = path.join(publicDir, "pwa");
const pwaScreensDir = path.join(pwaDir, "screens");
const appIconPath = path.join(root, "src", "app", "icon.svg");
const manifestPath = path.join(srcDir, "data", "system", "exercise-media-manifest.json");
const auditPath = path.join(srcDir, "data", "system", "exercise-media-audit.json");
const equipmentManifestPath = path.join(srcDir, "data", "system", "equipment-image-manifest.json");
const equipmentAuditPath = path.join(srcDir, "data", "system", "equipment-image-audit.json");
const muscleManifestPath = path.join(srcDir, "data", "system", "muscle-image-manifest.json");
const muscleAuditPath = path.join(srcDir, "data", "system", "muscle-image-audit.json");
const fitateExerciseAssetDir = path.resolve(
  root,
  "../fitate/server/public/assets/images/exercises",
);
const fitateMuscleImageDir = path.resolve(root, "../fitate/muscle image");

const customExerciseVideoOverrides: Record<string, ExerciseVideoOverride> = {
  "triceps-pushdown-rope-attachment": {
    videoPublicId: "motion-slow-video",
    posterPublicId: "motion-poster",
  },
};

const derivedExerciseMediaSpecs: Record<string, DerivedExerciseMediaSpec> = {
  "trx-push-up": {
    baseRelativePath: "chest/06621301-Push-up-m_Chest-FIX_720.gif",
    matchMode: "exact",
    sourceProvider: "INTERNAL_DERIVED",
    sourcePath: "derived://trx-push-up/from/chest/06621301-Push-up-m_Chest-FIX_720.gif",
    overlayVariant: "trx-push-up",
  },
  "trx-row": {
    baseRelativePath: "back/06521301-Pull-up_Back_720.gif",
    matchMode: "equivalent",
    sourceProvider: "INTERNAL_DERIVED",
    sourcePath: "derived://trx-row/from/back/06521301-Pull-up_Back_720.gif",
    overlayVariant: "trx-row",
  },
};

const curatedSourceOverrides: Record<string, string> = {
  "alternating-incline-dumbbell-curl":
    "biceps/36821301-Dumbbell-Incline-Alternate-Bicep-Curl_Upper-Arms_720.gif",
  "barbell-bench-press": "chest/00251301-Barbell-Bench-Press_Chest-FIX_720.gif",
  "cable-curl": "biceps/08681301-Cable-Curl-male_Upper-Arms-FIX_720.gif",
  "cable-hammer-curl":
    "biceps/01651301-Cable-Hammer-Curl-with-rope-attachment-male_Forearms-FIX_720.gif",
  "cable-lateral-raise": "shoulder/01781301-Cable-Lateral-Raise_shoulder_720.gif",
  "cable-pushdown": "triceps/02011301-Cable-Pushdown_Upper-Arms-FIX_7201.gif",
  "deadlift": "leg/00321301-Barbell-Deadlift_Hips-FIX2_720.gif",
  "decline-push-up": "chest/02791301-Decline-Push-Up-m_chest_720.gif",
  "dumbbell-hammer-curl": "biceps/03131301-Dumbbell-Hammer-Curl_Forearm_720.gif",
  "dumbbell-lateral-raise": "shoulder/03341301-Dumbbell-Lateral-Raise_shoulder-AFIX_720.gif",
  "dumbbell-squat": "leg/15551301-Dumbbell-Squat_Thighs_720.gif",
  "ez-bar-curl": "biceps/04461301-EZ-Barbell-Close-grip-Curl_Upper-Arms_720.gif",
  "flat-dumbbell-press": "chest/02891301-Dumbbell-Bench-Press_Chest_720.gif",
  "hip-thrust": "leg/31101301-Smith-Hip-Thrust_Hips_720.gif",
  "lat-pulldown": "back/01501301-Cable-Bar-Lateral-Pulldown_Back_720.gif",
  "neutral-grip-seated-row": "back/26611301-Cable-Seated-Row-with-V-bar_Back_720.gif",
  "pec-deck-fly": "chest/66d4e6f2ebc3db70602c4b14ae107fcf.gif",
  "dip-machine": "triceps/a59cfd87c4a642cf55d2dc77e0acb2bb.gif",
  "face-pull": "shoulder/3bb2d258a3c908600a52069b9fbe783c.gif",
  "pull-up": "back/06521301-Pull-up_Back_720.gif",
  "push-up": "chest/06621301-Push-up-m_Chest-FIX_720.gif",
  "seated-cable-row": "back/26611301-Cable-Seated-Row-with-V-bar_Back_720.gif",
  "single-leg-split-squat": "leg/04101301-Dumbbell-Single-Leg-Split-Squat_Thighs-FIX_720.gif",
  "smith-calf-raise": "leg/11641301-Smith-Calf-Raise-version-2_Calves_720.gif",
  "standing-calf-raise": "leg/06051301-Lever-Standing-Calf-Raise_Calf_720.gif",
  "straight-leg-deadlift": "leg/01161301-Barbell-Straight-Leg-Deadlift_Thighs_720.gif",
  "tricep-dips": "chest/08141301-Triceps-Dip_Upper-Arms_720.gif",
};

const curatedEquivalentSourceOverrides: Record<string, string> = {
  "bulgarian-split-squat": "leg/04101301-Dumbbell-Single-Leg-Split-Squat_Thighs-FIX_720.gif",
  "cable-crossovers": "chest/02271301-Cable-Standing-Fly_Chest-FIX_720.gif",
  "cable-v-bar-push-down": "triceps/02011301-Cable-Pushdown_Upper-Arms-FIX_7201.gif",
  "chest-dips": "chest/08141301-Triceps-Dip_Upper-Arms_720.gif",
  "close-grip-bench-press": "chest/00251301-Barbell-Bench-Press_Chest-FIX_720.gif",
  "decline-bench-press": "chest/00251301-Barbell-Bench-Press_Chest-FIX_720.gif",
  "decline-ez-bar-skullcrusher": "biceps/06071301-Lever-Triceps-Extension_Upper-Arms_720.gif",
  "dumbbell-flyes": "chest/02271301-Cable-Standing-Fly_Chest-FIX_720.gif",
  "ez-bar-skullcrusher": "biceps/06071301-Lever-Triceps-Extension_Upper-Arms_720.gif",
  "glute-bridge": "leg/31101301-Smith-Hip-Thrust_Hips_720.gif",
  "goblet-squat": "leg/15551301-Dumbbell-Squat_Thighs_720.gif",
  "incline-ez-bar-skullcrusher": "biceps/06071301-Lever-Triceps-Extension_Upper-Arms_720.gif",
  "incline-hammer-curls":
    "biceps/36821301-Dumbbell-Incline-Alternate-Bicep-Curl_Upper-Arms_720.gif",
  "low-to-high-cable-fly": "chest/02271301-Cable-Standing-Fly_Chest-FIX_720.gif",
  "lunges": "leg/29601301-Dumbbell-Split-Squat_Thighs_720.gif",
  "machine-preacher-curls":
    "biceps/16271301-EZ-Barbell-Close-Grip-Preacher-Curl_Upper-Arms-FIX_720.gif",
  "parallel-bar-dip": "chest/08141301-Triceps-Dip_Upper-Arms_720.gif",
  "paused-push-up": "chest/06621301-Push-up-m_Chest-FIX_720.gif",
  "pendlay-row": "back/00271301-Barbell-Bent-Over-Row_Back-FIX_720.gif",
  "preacher-hammer-dumbbell-curl":
    "biceps/16271301-EZ-Barbell-Close-Grip-Preacher-Curl_Upper-Arms-FIX_720.gif",
  "push-ups-close-triceps-position": "chest/06621301-Push-up-m_Chest-FIX_720.gif",
  "rear-delt-cable-fly":
    "shoulder/39121301-Cable-Bent-Over-One-Arm-Lateral-Raise_Shoulders_720.gif",
  "reverse-cable-curl": "biceps/08681301-Cable-Curl-male_Upper-Arms-FIX_720.gif",
  "reverse-curl": "biceps/04461301-EZ-Barbell-Close-grip-Curl_Upper-Arms_720.gif",
  "reverse-flyes":
    "shoulder/39121301-Cable-Bent-Over-One-Arm-Lateral-Raise_Shoulders_720.gif",
  "reverse-grip-triceps-pushdown":
    "triceps/02011301-Cable-Pushdown_Upper-Arms-FIX_7201.gif",
  "romanian-deadlift": "leg/01161301-Barbell-Straight-Leg-Deadlift_Thighs_720.gif",
  "rope-pushdown": "triceps/02011301-Cable-Pushdown_Upper-Arms-FIX_7201.gif",
  "ring-dip": "chest/08141301-Triceps-Dip_Upper-Arms_720.gif",
  "seated-triceps-press":
    "triceps/17221301-Cable-High-Pulley-Overhead-Tricep-Extension_Upper-Arms_720.gif",
  "single-arm-lat-pulldown": "back/01501301-Cable-Bar-Lateral-Pulldown_Back_720.gif",
  "single-leg-glute-bridge": "leg/31101301-Smith-Hip-Thrust_Hips_720.gif",
  "skull-crusher": "biceps/06071301-Lever-Triceps-Extension_Upper-Arms_720.gif",
  "standing-dumbbell-triceps-extension":
    "triceps/17221301-Cable-High-Pulley-Overhead-Tricep-Extension_Upper-Arms_720.gif",
  "standing-one-arm-dumbbell-curl-over-incline-bench":
    "biceps/36821301-Dumbbell-Incline-Alternate-Bicep-Curl_Upper-Arms_720.gif",
  "sumo-deadlift": "leg/00321301-Barbell-Deadlift_Hips-FIX2_720.gif",
  "trx-push-ups": "chest/06621301-Push-up-m_Chest-FIX_720.gif",
  "walking-lunge": "leg/29601301-Dumbbell-Split-Squat_Thighs_720.gif",
  "weighted-bench-dip": "chest/08141301-Triceps-Dip_Upper-Arms_720.gif",
  "wide-grip-barbell-curl": "biceps/00311301-Barbell-Curl_Upper-Arms-FIX_720.gif",
  "zottman-curl": "biceps/16721301-Dumbbell-One-Arm-Zottman-Preacher-Curl_Upper-Arms_720.gif",
};

const curatedAssetPathSet = new Set(
  [...Object.values(curatedSourceOverrides), ...Object.values(curatedEquivalentSourceOverrides)].map(
    (value) => value.replaceAll("\\", "/"),
  ),
);

const anatomyPrototypePaths = {
  coreSitUp: "abs/24761301-3-4-Sit-up-female_Waist_720.gif",
  chestBenchPress: "chest/00251301-Barbell-Bench-Press_Chest-FIX_720.gif",
  chestCableFly: "chest/02271301-Cable-Standing-Fly_Chest-FIX_720.gif",
  chestDeclinePushUp: "chest/02791301-Decline-Push-Up-m_chest_720.gif",
  chestDumbbellPress: "chest/02891301-Dumbbell-Bench-Press_Chest_720.gif",
  chestInclineDumbbellPress: "chest/03141301-Dumbbell-Incline-Bench-Press_Chest-FIX_720.gif",
  chestPushUp: "chest/06621301-Push-up-m_Chest-FIX_720.gif",
  chestSmithInclinePress: "chest/07571301-Smith-Incline-Bench-Press_Chest-FIX_720.gif",
  chestDip: "chest/08141301-Triceps-Dip_Upper-Arms_720.gif",
  backBarbellRow: "back/00271301-Barbell-Bent-Over-Row_Back-FIX_720.gif",
  backCablePulldown: "back/01501301-Cable-Bar-Lateral-Pulldown_Back_720.gif",
  backDumbbellRow: "back/02921301-Dumbbell-Bent-over-Row_back_Back_720.gif",
  backLeverPulldown: "back/05791301-Lever-Front-Pulldown_Back_720.gif",
  backHighRow: "back/05811301-Lever-High-Row-plate-loaded_Back_720.gif",
  backPullUp: "back/06521301-Pull-up_Back_720.gif",
  backHyperextension: "back/08771301-45-degree-hyperextension-arms-in-front-of-chest_Back_720.gif",
  backLeverSeatedRow: "back/13501301-Lever-Seated-Row_Back_720.gif",
  backCableSeatedRow: "back/26611301-Cable-Seated-Row-with-V-bar_Back_720.gif",
  backLeverBentOverRow: "back/32001301-Lever-Bent-over-Row-with-V-bar-plate-loaded_Back_720.gif",
  bicepsBarbellCurl: "biceps/00311301-Barbell-Curl_Upper-Arms-FIX_720.gif",
  bicepsCableHammerCurl:
    "biceps/01651301-Cable-Hammer-Curl-with-rope-attachment-male_Forearms-FIX_720.gif",
  bicepsAlternatingCurl: "biceps/02851301-Dumbbell-Alternate-Biceps-Curl_Upper-Arms_720.gif",
  bicepsConcentrationCurl:
    "biceps/02971301-Dumbbell-Concentration-Curl_Upper-Arms-FIX_720-1.gif",
  bicepsHammerCurl: "biceps/03131301-Dumbbell-Hammer-Curl_Forearm_720.gif",
  bicepsEzCurl: "biceps/04461301-EZ-Barbell-Close-grip-Curl_Upper-Arms_720.gif",
  tricepsLeverExtension: "biceps/06071301-Lever-Triceps-Extension_Upper-Arms_720.gif",
  bicepsOlympicHammerCurl: "biceps/06361301-Olympic-Barbell-Hammer-Curl_Forearms_720.gif",
  bicepsCableCurl: "biceps/08681301-Cable-Curl-male_Upper-Arms-FIX_720.gif",
  bicepsPreacherCurl:
    "biceps/16271301-EZ-Barbell-Close-Grip-Preacher-Curl_Upper-Arms-FIX_720.gif",
  bicepsZottmanPreacher:
    "biceps/16721301-Dumbbell-One-Arm-Zottman-Preacher-Curl_Upper-Arms_720.gif",
  bicepsInclineCurl:
    "biceps/36821301-Dumbbell-Incline-Alternate-Bicep-Curl_Upper-Arms_720.gif",
  lowerBarbellDeadlift: "leg/00321301-Barbell-Deadlift_Hips-FIX2_720.gif",
  lowerBarbellRdl: "leg/01161301-Barbell-Straight-Leg-Deadlift_Thighs_720.gif",
  lowerSingleLegSplitSquat:
    "leg/04101301-Dumbbell-Single-Leg-Split-Squat_Thighs-FIX_720.gif",
  lowerDumbbellRdl: "leg/04341301-Dumbbell-Straight-Leg-Deadlift_Waist-FIX_720.gif",
  lowerStandingCalfRaise: "leg/06051301-Lever-Standing-Calf-Raise_Calf_720.gif",
  lowerSmithCalfRaise: "leg/11641301-Smith-Calf-Raise-version-2_Calves_720.gif",
  lowerDumbbellSquat: "leg/15551301-Dumbbell-Squat_Thighs_720.gif",
  lowerDumbbellSplitSquat: "leg/29601301-Dumbbell-Split-Squat_Thighs_720.gif",
  lowerSmithHipThrust: "leg/31101301-Smith-Hip-Thrust_Hips_720.gif",
  shoulderCableLateralRaise: "shoulder/01781301-Cable-Lateral-Raise_shoulder_720.gif",
  shoulderDumbbellLateralRaise: "shoulder/03341301-Dumbbell-Lateral-Raise_shoulder-AFIX_720.gif",
  shoulderLeverLateralRaise: "shoulder/05841301-Lever-Lateral-Raise_shoulder_720.gif",
  shoulderRearDeltRaise:
    "shoulder/39121301-Cable-Bent-Over-One-Arm-Lateral-Raise_Shoulders_720.gif",
  tricepsPushdown: "triceps/02011301-Cable-Pushdown_Upper-Arms-FIX_7201.gif",
  tricepsOverheadExtension:
    "triceps/17221301-Cable-High-Pulley-Overhead-Tricep-Extension_Upper-Arms_720.gif",
} as const;

const muscleImageSourceSpecs: Record<
  string,
  {
    source: string;
    status: "PROVIDED" | "DERIVED";
  }
> = {
  "pectoralis-major": { source: "chest.png", status: "PROVIDED" },
  "pectoralis-minor": { source: "chest.png", status: "DERIVED" },
  "serratus-anterior": { source: "020-muscles-4.png", status: "PROVIDED" },
  "latissimus-dorsi": { source: "lat.png", status: "PROVIDED" },
  rhomboids: { source: "trap1.png", status: "DERIVED" },
  trapezius: { source: "trap1.png", status: "PROVIDED" },
  "erector-spinae": { source: "trap3.png", status: "PROVIDED" },
  "teres-major": { source: "lat.png", status: "DERIVED" },
  deltoids: { source: "shoulder.png", status: "PROVIDED" },
  "rear-deltoids": { source: "deltoy.png", status: "PROVIDED" },
  "rotator-cuff": { source: "shoulder.png", status: "DERIVED" },
  biceps: { source: "biceps.png", status: "PROVIDED" },
  triceps: { source: "009-muscles.png", status: "PROVIDED" },
  forearms: { source: "021-bodybuilding.png", status: "PROVIDED" },
  brachialis: { source: "021-bodybuilding.png", status: "DERIVED" },
  "rectus-abdominis": { source: "abs.png", status: "PROVIDED" },
  obliques: { source: "017-training.png", status: "PROVIDED" },
  "hip-flexors": { source: "018-exercise.png", status: "PROVIDED" },
  glutes: { source: "011-muscles-1.png", status: "PROVIDED" },
  quadriceps: { source: "005-front.png", status: "PROVIDED" },
  hamstrings: { source: "008-back-2.png", status: "PROVIDED" },
  adductors: { source: "013-front-1.png", status: "PROVIDED" },
  calves: { source: "015-muscles-3.png", status: "PROVIDED" },
  soleus: { source: "015-muscles-3.png", status: "DERIVED" },
  "rectus-femoris": { source: "013-front-1.png", status: "DERIVED" },
};

const ignoredAssetFragments = [
  "anatomie",
  "anatomy",
  "aufbau",
  "beitrag",
  "griffbreite",
  "holkreuz",
  "muskeln",
  "muskulatur",
  "richtige",
  "rueckenmuskulatur",
  "surae",
];

const commonTokens = new Set([
  "a",
  "an",
  "and",
  "arm",
  "arms",
  "attachment",
  "back",
  "bar",
  "body",
  "chest",
  "female",
  "fix",
  "fix2",
  "for",
  "from",
  "in",
  "loaded",
  "male",
  "of",
  "plate",
  "the",
  "to",
  "upper",
  "v",
  "version",
  "with",
]);

const sensitiveModifierTokens = new Set([
  "alternate",
  "alternating",
  "arnold",
  "bulgarian",
  "clean",
  "close",
  "concentration",
  "decline",
  "floor",
  "front",
  "goblet",
  "hammer",
  "incline",
  "kneeling",
  "landmine",
  "lateral",
  "meadow",
  "neutral",
  "one",
  "paused",
  "pendlay",
  "preacher",
  "pullover",
  "rear",
  "reverse",
  "romanian",
  "renegade",
  "shrug",
  "single",
  "split",
  "standing",
  "sumo",
  "supported",
  "upright",
  "wide",
]);

const hardModifierTokens = new Set([
  "arnold",
  "bulgarian",
  "clean",
  "close",
  "concentration",
  "decline",
  "floor",
  "front",
  "goblet",
  "hammer",
  "incline",
  "landmine",
  "lateral",
  "machine",
  "meadow",
  "pendlay",
  "preacher",
  "pullover",
  "rear",
  "romanian",
  "shrug",
  "smith",
  "split",
  "sumo",
  "supported",
  "upright",
  "wide",
]);

const equipmentTokenRegistry = new Map<string, string[]>([
  ["ab-wheel", ["ab", "wheel"]],
  ["barbell", ["barbell"]],
  ["battle-ropes", ["rope", "ropes"]],
  ["body-weight", ["bodyweight", "pushup", "pullup", "dip", "plank"]],
  ["cable-machine", ["cable"]],
  ["dumbbell", ["dumbbell"]],
  ["ez-curl-bar", ["ez", "curl", "barbell"]],
  ["kettlebell", ["kettlebell"]],
  ["lat-pulldown-machine", ["pulldown", "lat"]],
  ["leg-curl-machine", ["curl", "lever"]],
  ["leg-extension-machine", ["extension", "lever"]],
  ["leg-press-machine", ["press", "lever", "sled"]],
  ["machine", ["lever", "machine"]],
  ["medicine-ball", ["medicine", "ball"]],
  ["parallel-bars", ["dip", "parallel"]],
  ["pec-deck-machine", ["fly", "deck"]],
  ["plate", ["plate"]],
  ["pull-up-bar", ["pullup", "chinup", "bar"]],
  ["smith-machine", ["smith"]],
  ["trx", ["trx"]],
  ["yoga-mat", ["mat"]],
]);

const screens: ScreenSpec[] = [
  { key: "today", width: 840, height: 1720 },
  { key: "plans", width: 840, height: 1720 },
  { key: "library", width: 840, height: 1720 },
  { key: "install", width: 840, height: 1720 },
  { key: "hero-stack", width: 1104, height: 1032 },
];

function loadEnvFile() {
  const envPath = path.join(root, ".env");

  return fs
    .readFile(envPath, "utf8")
    .then((content) => {
      for (const line of content.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
          continue;
        }

        const [key, ...rest] = trimmed.split("=");
        if (!key || process.env[key]) {
          continue;
        }

        process.env[key] = rest.join("=").trim().replace(/^"|"$/g, "");
      }
    })
    .catch(() => undefined);
}

function getCloudinaryRuntime() {
  const cloudName = process.env.CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return null;
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: process.env.CLOUDINARY_SECURE !== "false",
  });

  return {
    rootFolder: process.env.CLOUDINARY_ROOT_FOLDER?.trim() || "sablefit",
  } satisfies CloudinaryRuntime;
}

function getLocalExerciseMediaPaths(slug: string) {
  const baseDir = path.join(exerciseMediaDir, slug);

  return {
    baseDir,
    phase1Path: path.join(baseDir, "phase-01.webp"),
    phase2Path: path.join(baseDir, "phase-02.webp"),
    motionPath: path.join(baseDir, "motion-slow.gif"),
    phase1Url: `/workout/exercise/${slug}/phase-01.webp`,
    phase2Url: `/workout/exercise/${slug}/phase-02.webp`,
    motionUrl: `/workout/exercise/${slug}/motion-slow.gif`,
  };
}

function getLocalEquipmentImagePaths(slug: string) {
  const baseDir = path.join(equipmentImageDir, slug);

  return {
    baseDir,
    imagePath: path.join(baseDir, "primary.png"),
    imageUrl: `/workout/equipment/${slug}/primary.png`,
  };
}

function getLocalMuscleImagePaths(slug: string) {
  const baseDir = path.join(muscleImageDir, slug);

  return {
    baseDir,
    imagePath: path.join(baseDir, "primary.png"),
    imageUrl: `/workout/muscle/${slug}/primary.png`,
  };
}

function buildKeyframeLabel(order: number) {
  return {
    en: order === 1 ? "Eccentric" : "Concentric",
    vi: order === 1 ? "Pha eccentric" : "Pha concentric",
  };
}

function buildKeyframePhase(order: number) {
  return order === 1 ? "ECCENTRIC" : "CONCENTRIC";
}

function buildCloudinaryExerciseVideoOverrideUrl(
  runtime: CloudinaryRuntime,
  slug: string,
  override: ExerciseVideoOverride,
) {
  return cloudinary.url(
    `${runtime.rootFolder}/workout/exercise/${slug}/${override.videoPublicId}`,
    {
      secure: true,
      resource_type: "video",
      format: "mp4",
    },
  );
}

function buildCloudinaryExercisePosterUrl(
  runtime: CloudinaryRuntime,
  slug: string,
  override?: ExerciseVideoOverride,
) {
  if (override?.posterPublicId) {
    return cloudinary.url(
      `${runtime.rootFolder}/workout/exercise/${slug}/${override.posterPublicId}`,
      {
        secure: true,
        resource_type: "image",
        format: "png",
      },
    );
  }

  return cloudinary.url(`${runtime.rootFolder}/workout/exercise/${slug}/phase-02`, {
    secure: true,
    resource_type: "image",
    format: "webp",
  });
}

async function resetDir(target: string) {
  await fs.rm(target, { recursive: true, force: true });
  await fs.mkdir(target, { recursive: true });
}

async function writeTextFile(target: string, value: string) {
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, value, "utf8");
}

async function writeJsonFile(target: string, value: unknown) {
  await writeTextFile(target, JSON.stringify(value, null, 2));
}

async function writeStaticPng(
  input: Buffer | string,
  target: string,
  width: number,
  height: number,
) {
  await fs.mkdir(path.dirname(target), { recursive: true });
  await sharp(input, { animated: false })
    .ensureAlpha()
    .resize(width, height, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toFile(target);
}

async function rasterizeSvgToPng(svg: string, target: string, width: number, height: number) {
  await fs.mkdir(path.dirname(target), { recursive: true });
  await sharp(Buffer.from(svg))
    .resize(width, height)
    .png()
    .toFile(target);
}

const equipmentPalette = {
  stroke: "#141414",
  fill: "#1c1c1f",
  accent: "#d8dde5",
  accentDark: "#96a0ad",
  shadow: "#d7dde5",
};

function svgAttrs(attributes: Record<string, string | number | undefined>) {
  return Object.entries(attributes)
    .filter(([, value]) => value !== undefined && value !== "")
    .map(([key, value]) => ` ${key}="${value}"`)
    .join("");
}

function svgLine(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  options: Record<string, string | number | undefined> = {},
) {
  return `<line${svgAttrs({
    x1,
    y1,
    x2,
    y2,
    stroke: equipmentPalette.stroke,
    "stroke-width": 18,
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    fill: "none",
    ...options,
  })} />`;
}

function svgRect(
  x: number,
  y: number,
  width: number,
  height: number,
  options: Record<string, string | number | undefined> = {},
) {
  return `<rect${svgAttrs({
    x,
    y,
    width,
    height,
    rx: 18,
    fill: equipmentPalette.fill,
    stroke: equipmentPalette.stroke,
    "stroke-width": 12,
    ...options,
  })} />`;
}

function svgCircle(
  cx: number,
  cy: number,
  r: number,
  options: Record<string, string | number | undefined> = {},
) {
  return `<circle${svgAttrs({
    cx,
    cy,
    r,
    fill: equipmentPalette.fill,
    stroke: equipmentPalette.stroke,
    "stroke-width": 12,
    ...options,
  })} />`;
}

function svgPath(
  d: string,
  options: Record<string, string | number | undefined> = {},
) {
  return `<path${svgAttrs({
    d,
    fill: "none",
    stroke: equipmentPalette.stroke,
    "stroke-width": 18,
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    ...options,
  })} />`;
}

function svgEllipse(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  options: Record<string, string | number | undefined> = {},
) {
  return `<ellipse${svgAttrs({
    cx,
    cy,
    rx,
    ry,
    fill: equipmentPalette.shadow,
    opacity: 0.55,
    ...options,
  })} />`;
}

function wrapEquipmentSvg(content: string, shadow = true) {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512" fill="none">
      ${shadow ? svgEllipse(256, 410, 164, 32) : ""}
      ${content}
    </svg>
  `;
}

function renderEquipmentSvg(slug: string) {
  switch (slug) {
    case "body-weight":
      return wrapEquipmentSvg(`
        ${svgCircle(256, 116, 34)}
        ${svgPath("M256 154 L256 272")}
        ${svgPath("M180 214 Q256 182 332 214")}
        ${svgPath("M220 312 L178 390")}
        ${svgPath("M292 312 L334 390")}
        ${svgPath("M212 234 L196 310")}
        ${svgPath("M300 234 L316 310")}
      `);
    case "dumbbell":
      return wrapEquipmentSvg(`
        ${svgRect(202, 234, 108, 44, { rx: 22 })}
        ${svgRect(168, 214, 24, 84, { rx: 10 })}
        ${svgRect(136, 196, 24, 120, { rx: 10, fill: equipmentPalette.accent })}
        ${svgRect(108, 180, 20, 152, { rx: 8, fill: equipmentPalette.accentDark })}
        ${svgRect(320, 214, 24, 84, { rx: 10 })}
        ${svgRect(352, 196, 24, 120, { rx: 10, fill: equipmentPalette.accent })}
        ${svgRect(384, 180, 20, 152, { rx: 8, fill: equipmentPalette.accentDark })}
      `);
    case "barbell":
      return wrapEquipmentSvg(`
        ${svgRect(120, 244, 272, 24, { rx: 12 })}
        ${svgRect(88, 202, 20, 108, { rx: 8, fill: equipmentPalette.accentDark })}
        ${svgRect(112, 188, 24, 136, { rx: 10, fill: equipmentPalette.accent })}
        ${svgRect(140, 212, 18, 88, { rx: 8 })}
        ${svgRect(354, 212, 18, 88, { rx: 8 })}
        ${svgRect(376, 188, 24, 136, { rx: 10, fill: equipmentPalette.accent })}
        ${svgRect(404, 202, 20, 108, { rx: 8, fill: equipmentPalette.accentDark })}
      `);
    case "kettlebell":
      return wrapEquipmentSvg(`
        ${svgPath("M188 200 C188 142 324 142 324 200", { "stroke-width": 24 })}
        ${svgPath("M212 204 C212 166 300 166 300 204", {
          "stroke-width": 16,
          stroke: equipmentPalette.accentDark,
        })}
        ${svgPath("M176 228 Q176 148 256 148 Q336 148 336 228 L336 320 Q336 376 256 384 Q176 376 176 320 Z", {
          fill: equipmentPalette.fill,
        })}
      `);
    case "cable-machine":
      return wrapEquipmentSvg(`
        ${svgLine(156, 108, 156, 384)}
        ${svgLine(356, 108, 356, 384)}
        ${svgLine(156, 108, 356, 108)}
        ${svgLine(144, 384, 368, 384, { "stroke-width": 14 })}
        ${svgCircle(186, 136, 18, { fill: equipmentPalette.accent })}
        ${svgCircle(326, 136, 18, { fill: equipmentPalette.accent })}
        ${svgPath("M186 154 L186 224 L228 266")}
        ${svgPath("M326 154 L326 224 L284 266")}
        ${svgRect(214, 292, 84, 24, { rx: 12, fill: equipmentPalette.accent })}
        ${svgRect(234, 316, 44, 52, { rx: 14 })}
        ${svgLine(228, 266, 208, 286, { "stroke-width": 12 })}
        ${svgLine(284, 266, 304, 286, { "stroke-width": 12 })}
      `);
    case "machine":
      return wrapEquipmentSvg(`
        ${svgRect(214, 178, 56, 88, { fill: equipmentPalette.accent })}
        ${svgRect(202, 270, 88, 28, { rx: 14, fill: equipmentPalette.accent })}
        ${svgLine(224, 298, 192, 382)}
        ${svgLine(280, 298, 320, 382)}
        ${svgLine(278, 180, 354, 150)}
        ${svgLine(354, 150, 388, 234)}
        ${svgRect(356, 230, 26, 74, { rx: 12 })}
        ${svgLine(168, 382, 340, 382, { "stroke-width": 14 })}
      `);
    case "bench":
      return wrapEquipmentSvg(`
        ${svgRect(176, 216, 160, 34, { rx: 17, fill: equipmentPalette.accent })}
        ${svgRect(264, 156, 102, 34, { rx: 17, fill: equipmentPalette.accent, transform: "rotate(-24 315 173)" })}
        ${svgLine(196, 250, 160, 380)}
        ${svgLine(312, 250, 348, 380)}
        ${svgLine(286, 188, 238, 282)}
        ${svgLine(154, 380, 204, 380, { "stroke-width": 14 })}
        ${svgLine(308, 380, 364, 380, { "stroke-width": 14 })}
      `);
    case "smith-machine":
      return wrapEquipmentSvg(`
        ${svgLine(168, 104, 168, 388)}
        ${svgLine(344, 104, 344, 388)}
        ${svgLine(144, 388, 368, 388, { "stroke-width": 14 })}
        ${svgLine(168, 104, 344, 104)}
        ${svgRect(170, 214, 172, 22, { rx: 11 })}
        ${svgRect(148, 196, 18, 58, { rx: 8, fill: equipmentPalette.accent })}
        ${svgRect(346, 196, 18, 58, { rx: 8, fill: equipmentPalette.accent })}
        ${svgLine(214, 104, 214, 196, { "stroke-width": 10, stroke: equipmentPalette.accentDark })}
        ${svgLine(298, 104, 298, 196, { "stroke-width": 10, stroke: equipmentPalette.accentDark })}
      `);
    case "lat-pulldown-machine":
      return wrapEquipmentSvg(`
        ${svgLine(168, 96, 168, 388)}
        ${svgLine(168, 96, 332, 96)}
        ${svgLine(332, 96, 344, 388)}
        ${svgLine(150, 388, 364, 388, { "stroke-width": 14 })}
        ${svgPath("M220 132 Q256 164 292 132", { "stroke-width": 14 })}
        ${svgLine(256, 132, 256, 220, { "stroke-width": 10, stroke: equipmentPalette.accentDark })}
        ${svgRect(228, 230, 56, 26, { rx: 13, fill: equipmentPalette.accent })}
        ${svgRect(216, 266, 80, 30, { rx: 15, fill: equipmentPalette.accent })}
        ${svgLine(230, 296, 206, 382)}
        ${svgLine(282, 296, 306, 382)}
      `);
    case "leg-press-machine":
      return wrapEquipmentSvg(`
        ${svgPath("M154 364 L222 364 L314 250 L362 274", { "stroke-width": 16 })}
        ${svgRect(126, 286, 88, 44, { rx: 16, fill: equipmentPalette.accent, transform: "rotate(-20 170 308)" })}
        ${svgRect(282, 184, 92, 52, { rx: 16, fill: equipmentPalette.accent, transform: "rotate(24 328 210)" })}
        ${svgCircle(390, 200, 30, { fill: equipmentPalette.fill })}
        ${svgCircle(390, 200, 12, { fill: equipmentPalette.accent, stroke: equipmentPalette.accentDark })}
        ${svgLine(154, 364, 128, 392)}
        ${svgLine(222, 364, 248, 392)}
      `);
    case "leg-curl-machine":
      return wrapEquipmentSvg(`
        ${svgRect(150, 252, 138, 30, { rx: 15, fill: equipmentPalette.accent, transform: "rotate(-18 219 267)" })}
        ${svgRect(266, 198, 62, 26, { rx: 13, fill: equipmentPalette.accent, transform: "rotate(-18 297 211)" })}
        ${svgCircle(352, 190, 22, { fill: equipmentPalette.fill })}
        ${svgCircle(386, 178, 18, { fill: equipmentPalette.accent })}
        ${svgLine(170, 288, 142, 384)}
        ${svgLine(252, 262, 278, 384)}
        ${svgLine(136, 384, 304, 384, { "stroke-width": 14 })}
      `);
    case "leg-extension-machine":
      return wrapEquipmentSvg(`
        ${svgRect(198, 176, 66, 92, { fill: equipmentPalette.accent })}
        ${svgRect(190, 270, 90, 28, { rx: 14, fill: equipmentPalette.accent })}
        ${svgLine(212, 298, 188, 384)}
        ${svgLine(272, 298, 300, 384)}
        ${svgLine(280, 284, 352, 284)}
        ${svgCircle(374, 284, 18, { fill: equipmentPalette.fill })}
        ${svgCircle(404, 284, 18, { fill: equipmentPalette.accent })}
        ${svgLine(168, 384, 322, 384, { "stroke-width": 14 })}
      `);
    case "pull-up-bar":
      return wrapEquipmentSvg(`
        ${svgLine(176, 110, 176, 390)}
        ${svgLine(336, 110, 336, 390)}
        ${svgPath("M132 116 L380 116", { "stroke-width": 20 })}
        ${svgPath("M132 116 L110 144", { "stroke-width": 16 })}
        ${svgPath("M380 116 L402 144", { "stroke-width": 16 })}
        ${svgLine(148, 390, 214, 390, { "stroke-width": 14 })}
        ${svgLine(298, 390, 364, 390, { "stroke-width": 14 })}
      `);
    case "parallel-bars":
      return wrapEquipmentSvg(`
        ${svgLine(186, 154, 186, 372)}
        ${svgLine(326, 154, 326, 372)}
        ${svgLine(154, 154, 154, 372)}
        ${svgLine(294, 154, 294, 372)}
        ${svgLine(154, 154, 326, 154)}
        ${svgLine(186, 126, 358, 126)}
        ${svgLine(132, 372, 208, 372, { "stroke-width": 14 })}
        ${svgLine(272, 372, 348, 372, { "stroke-width": 14 })}
      `);
    case "medicine-ball":
      return wrapEquipmentSvg(`
        ${svgCircle(256, 256, 112, { fill: equipmentPalette.accent })}
        ${svgPath("M180 208 Q256 256 180 304", { "stroke-width": 14 })}
        ${svgPath("M332 208 Q256 256 332 304", { "stroke-width": 14 })}
        ${svgPath("M214 164 Q256 256 298 164", { "stroke-width": 14 })}
        ${svgPath("M214 348 Q256 256 298 348", { "stroke-width": 14 })}
      `);
    case "resistance-bands":
      return wrapEquipmentSvg(`
        ${svgPath("M172 276 C172 188 244 168 268 232 C286 280 338 292 338 220 C338 164 304 126 256 126 C176 126 124 190 124 276 C124 352 176 392 224 392", {
          "stroke-width": 20,
        })}
        ${svgPath("M340 236 C340 324 268 344 244 280 C226 232 174 220 174 292 C174 348 208 386 256 386 C336 386 388 322 388 236 C388 160 336 120 288 120", {
          "stroke-width": 20,
          stroke: equipmentPalette.accentDark,
        })}
      `);
    case "trx":
      return wrapEquipmentSvg(`
        ${svgLine(256, 92, 256, 126)}
        ${svgPath("M256 126 L206 304", { "stroke-width": 14 })}
        ${svgPath("M256 126 L306 304", { "stroke-width": 14 })}
        ${svgRect(186, 304, 34, 72, { rx: 14, fill: equipmentPalette.accent })}
        ${svgRect(292, 304, 34, 72, { rx: 14, fill: equipmentPalette.accent })}
        ${svgPath("M186 304 L152 242", { "stroke-width": 12, stroke: equipmentPalette.accentDark })}
        ${svgPath("M326 304 L360 242", { "stroke-width": 12, stroke: equipmentPalette.accentDark })}
      `);
    case "plyo-box":
      return wrapEquipmentSvg(`
        ${svgPath("M176 182 L286 148 L366 194 L258 228 Z", {
          fill: equipmentPalette.accent,
        })}
        ${svgPath("M176 182 L176 326 L258 372 L258 228 Z", {
          fill: equipmentPalette.fill,
        })}
        ${svgPath("M258 228 L366 194 L366 338 L258 372 Z", {
          fill: equipmentPalette.accentDark,
        })}
      `);
    case "battle-ropes":
      return wrapEquipmentSvg(`
        ${svgCircle(142, 256, 18, { fill: equipmentPalette.fill })}
        ${svgPath("M156 228 C214 188 214 324 272 284 C330 244 330 160 390 208", { "stroke-width": 18 })}
        ${svgPath("M156 284 C214 244 214 380 272 340 C330 300 330 216 390 264", {
          "stroke-width": 18,
          stroke: equipmentPalette.accentDark,
        })}
      `);
    case "ez-curl-bar":
      return wrapEquipmentSvg(`
        ${svgPath("M110 268 L166 232 L220 284 L292 220 L348 280 L402 246", {
          "stroke-width": 18,
        })}
        ${svgRect(86, 226, 18, 64, { rx: 8, fill: equipmentPalette.accent })}
        ${svgRect(408, 226, 18, 64, { rx: 8, fill: equipmentPalette.accent })}
      `);
    case "plate":
      return wrapEquipmentSvg(`
        ${svgCircle(256, 256, 122, { fill: equipmentPalette.fill })}
        ${svgCircle(256, 256, 34, { fill: "transparent", stroke: equipmentPalette.accent, "stroke-width": 18 })}
        ${svgRect(242, 146, 28, 48, { rx: 14, fill: equipmentPalette.accent, stroke: "none" })}
        ${svgRect(242, 318, 28, 48, { rx: 14, fill: equipmentPalette.accent, stroke: "none" })}
        ${svgRect(146, 242, 48, 28, { rx: 14, fill: equipmentPalette.accent, stroke: "none" })}
        ${svgRect(318, 242, 48, 28, { rx: 14, fill: equipmentPalette.accent, stroke: "none" })}
      `);
    case "ab-wheel":
      return wrapEquipmentSvg(`
        ${svgLine(174, 256, 338, 256, { "stroke-width": 14 })}
        ${svgCircle(256, 256, 76, { fill: equipmentPalette.fill })}
        ${svgCircle(256, 256, 30, { fill: "transparent", stroke: equipmentPalette.accent, "stroke-width": 16 })}
        ${svgLine(122, 256, 174, 256, { "stroke-width": 18 })}
        ${svgLine(338, 256, 390, 256, { "stroke-width": 18 })}
      `);
    case "pec-deck-machine":
      return wrapEquipmentSvg(`
        ${svgRect(228, 172, 56, 94, { fill: equipmentPalette.accent })}
        ${svgRect(216, 270, 80, 28, { rx: 14, fill: equipmentPalette.accent })}
        ${svgLine(232, 298, 208, 384)}
        ${svgLine(280, 298, 304, 384)}
        ${svgPath("M228 206 Q166 196 156 254", { "stroke-width": 16 })}
        ${svgPath("M284 206 Q346 196 356 254", { "stroke-width": 16 })}
        ${svgRect(138, 250, 18, 70, { rx: 8 })}
        ${svgRect(356, 250, 18, 70, { rx: 8 })}
      `);
    case "calf-raise-machine":
      return wrapEquipmentSvg(`
        ${svgLine(182, 128, 182, 374)}
        ${svgLine(330, 128, 330, 374)}
        ${svgRect(154, 158, 56, 34, { rx: 16, fill: equipmentPalette.accent })}
        ${svgRect(302, 158, 56, 34, { rx: 16, fill: equipmentPalette.accent })}
        ${svgRect(190, 324, 132, 20, { rx: 10, fill: equipmentPalette.fill })}
        ${svgLine(160, 374, 352, 374, { "stroke-width": 14 })}
      `);
    case "seated-calf-raise-machine":
      return wrapEquipmentSvg(`
        ${svgRect(196, 188, 64, 92, { fill: equipmentPalette.accent })}
        ${svgRect(188, 282, 90, 28, { rx: 14, fill: equipmentPalette.accent })}
        ${svgRect(274, 246, 74, 22, { rx: 11, fill: equipmentPalette.fill })}
        ${svgRect(320, 306, 78, 18, { rx: 9, fill: equipmentPalette.accentDark })}
        ${svgLine(206, 310, 184, 386)}
        ${svgLine(270, 310, 292, 386)}
        ${svgLine(168, 386, 314, 386, { "stroke-width": 14 })}
      `);
    case "yoga-mat":
      return wrapEquipmentSvg(`
        ${svgRect(118, 262, 220, 58, { rx: 29, fill: equipmentPalette.accent })}
        ${svgPath("M338 292 C388 292 410 272 410 246 C410 220 388 198 354 198 C320 198 298 220 298 246 C298 272 320 292 338 292 Z", {
          fill: equipmentPalette.fill,
        })}
        ${svgCircle(338, 246, 20, { fill: "transparent", stroke: equipmentPalette.accent, "stroke-width": 12 })}
      `);
    default:
      return wrapEquipmentSvg(`
        ${svgRect(150, 172, 212, 42, { rx: 21, fill: equipmentPalette.accent })}
        ${svgRect(210, 214, 92, 118, { fill: equipmentPalette.fill })}
        ${svgLine(190, 332, 162, 390)}
        ${svgLine(322, 332, 350, 390)}
      `);
  }
}

function normalizeToken(raw: string) {
  let token = raw.toLowerCase().trim();

  token = token.replace(/^e-z$/, "ez");
  token = token.replace(/^tricep$/, "triceps");
  token = token.replace(/^bicep$/, "biceps");
  token = token.replace(/^push-up$/, "pushup");
  token = token.replace(/^pull-up$/, "pullup");
  token = token.replace(/^chin-up$/, "chinup");

  if (token.endsWith("ies") && token.length > 4) {
    token = `${token.slice(0, -3)}y`;
  } else if (token.endsWith("s") && token.length > 4 && !token.endsWith("ss")) {
    token = token.slice(0, -1);
  }

  return token;
}

function tokenize(value: string) {
  return value
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/i, " ")
    .replace(/\([^)]*\)/g, " ")
    .replace(/[_/]+/g, " ")
    .replace(/[0-9]+/g, " ")
    .replace(/[^a-z]+/g, " ")
    .trim()
    .split(/\s+/)
    .map((token) => normalizeToken(token))
    .filter((token) => token && !commonTokens.has(token));
}

function unique<T>(values: T[]) {
  return [...new Set(values)];
}

async function walk(dir: string, collected: string[] = []) {
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      await walk(fullPath, collected);
      continue;
    }

    collected.push(fullPath);
  }

  return collected;
}

function inferCategoryHint(relativePath: string) {
  const firstSegment = relativePath.split(path.sep)[0]?.toLowerCase() ?? "";

  switch (firstSegment) {
    case "abs":
      return "core";
    case "back":
      return "back";
    case "biceps":
    case "triceps":
      return "arms";
    case "chest":
      return "chest";
    case "leg":
      return "lower-body";
    case "shoulder":
      return "shoulders";
    default:
      return "general";
  }
}

function inferMovementHints(tokens: string[]) {
  const hints: string[] = [];

  if (tokens.some((token) => ["bench", "press", "pushup", "dip"].includes(token))) {
    hints.push("press");
  }
  if (tokens.some((token) => ["fly", "flye"].includes(token))) {
    hints.push("fly");
  }
  if (tokens.some((token) => ["row"].includes(token))) {
    hints.push("row");
  }
  if (tokens.some((token) => ["shrug"].includes(token))) {
    hints.push("shrug");
  }
  if (tokens.some((token) => ["curl", "hammer"].includes(token))) {
    hints.push("curl");
  }
  if (tokens.some((token) => ["pulldown", "pullup", "chinup"].includes(token))) {
    hints.push("pull");
  }
  if (tokens.some((token) => ["squat", "lunge", "split"].includes(token))) {
    hints.push("squat");
  }
  if (tokens.some((token) => ["deadlift", "hinge", "thrust", "bridge"].includes(token))) {
    hints.push("hinge");
  }
  if (tokens.some((token) => ["pullover"].includes(token))) {
    hints.push("pullover");
  }
  if (tokens.some((token) => ["clean"].includes(token))) {
    hints.push("clean");
  }
  if (tokens.some((token) => ["plank", "twist", "crunch", "rollout"].includes(token))) {
    hints.push("core");
  }
  if (tokens.some((token) => ["raise", "arnold"].includes(token))) {
    hints.push("raise");
  }
  if (tokens.some((token) => ["extension", "pushdown"].includes(token))) {
    hints.push("extension");
  }

  return unique(hints);
}

function inferEquipmentHints(tokens: string[]) {
  const hints: string[] = [];

  if (tokens.includes("barbell")) {
    hints.push("barbell");
  }
  if (tokens.includes("dumbbell")) {
    hints.push("dumbbell");
  }
  if (tokens.includes("cable")) {
    hints.push("cable-machine");
  }
  if (tokens.includes("smith")) {
    hints.push("smith-machine");
  }
  if (tokens.includes("lever") || tokens.includes("machine")) {
    hints.push("machine");
  }
  if (tokens.includes("ez")) {
    hints.push("ez-curl-bar");
  }
  if (tokens.includes("rope")) {
    hints.push("battle-ropes");
  }
  if (tokens.includes("ball")) {
    hints.push("medicine-ball");
  }

  return unique(hints);
}

function isLikelyExerciseAsset(relativePath: string) {
  const lower = relativePath.toLowerCase();
  const basename = path.basename(lower);
  const normalizedRelativePath = relativePath.replaceAll(path.sep, "/");

  if (!/\.(gif|png|jpe?g|webp)$/i.test(lower)) {
    return false;
  }

  if (ignoredAssetFragments.some((fragment) => lower.includes(fragment))) {
    return false;
  }

  if (
    /^[a-f0-9]{24,}(\s\(\d+\))?\.(jpg|jpeg|png|gif|webp)$/i.test(basename) &&
    !curatedAssetPathSet.has(normalizedRelativePath)
  ) {
    return false;
  }

  return true;
}

async function loadSourceAssets() {
  try {
    const absolutePaths = await walk(fitateExerciseAssetDir);

    return absolutePaths
      .map((absolutePath) => {
        const relativePath = path.relative(fitateExerciseAssetDir, absolutePath);

        if (!isLikelyExerciseAsset(relativePath)) {
          return null;
        }

        const tokens = unique(tokenize(relativePath));

        return {
          absolutePath,
          relativePath,
          extension: path.extname(absolutePath).toLowerCase(),
          tokens,
          categoryHint: inferCategoryHint(relativePath),
          equipmentHints: inferEquipmentHints(tokens),
          movementHints: inferMovementHints(tokens),
          normalizedLabel: tokens.join(" "),
        } satisfies SourceAsset;
      })
      .filter(Boolean) as SourceAsset[];
  } catch {
    return [];
  }
}

function resolveExerciseCategoryHint(exercise: ExerciseSeed) {
  const muscles = exercise.primaryMuscleSlugs.join(" ");

  if (/pectoralis|serratus/.test(muscles)) {
    return "chest";
  }
  if (/latissimus|rhomboids|trapezius|erector|teres/.test(muscles)) {
    return "back";
  }
  if (/deltoids|rotator/.test(muscles)) {
    return "shoulders";
  }
  if (/biceps|triceps|forearms|brachialis/.test(muscles)) {
    return "arms";
  }
  if (/rectus|obliques|hip-flexors/.test(muscles)) {
    return "core";
  }
  if (/glutes|quadriceps|hamstrings|adductors|calves|soleus|femoris/.test(muscles)) {
    return "lower-body";
  }

  return "general";
}

function buildExerciseSearchProfile(exercise: ExerciseSeed) {
  const aliasTokens = exercise.aliases.flatMap((value) => tokenize(value));
  const nameTokens = tokenize(exercise.name.en);
  const slugTokens = tokenize(exercise.slug);
  const tokens = unique([...nameTokens, ...slugTokens, ...aliasTokens]);
  const equipmentHints = unique(
    exercise.equipmentSlugs.flatMap((slug) => equipmentTokenRegistry.get(slug) ?? [slug]),
  );
  const movementHints = inferMovementHints(tokens);
  const normalizedLabel = unique(
    exercise.name.en
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .trim()
      .split(/\s+/)
      .map((token) => normalizeToken(token))
      .filter(Boolean),
  ).join(" ");

  return {
    tokens,
    equipmentHints,
    movementHints,
    categoryHint: resolveExerciseCategoryHint(exercise),
    normalizedLabel,
  };
}

function scoreCandidate(exercise: ExerciseSeed, candidate: SourceAsset) {
  const profile = buildExerciseSearchProfile(exercise);
  const overlap = profile.tokens.filter((token) => candidate.tokens.includes(token));
  const movementOverlap = profile.movementHints.filter((hint) => candidate.movementHints.includes(hint));
  const exerciseModifiers = profile.tokens.filter((token) => sensitiveModifierTokens.has(token));
  const candidateModifiers = candidate.tokens.filter((token) => sensitiveModifierTokens.has(token));
  let score = overlap.length * 1.25;

  if (overlap.length >= 2) {
    score += 1;
  }

  if (
    profile.normalizedLabel &&
    (candidate.normalizedLabel.includes(profile.normalizedLabel) ||
      profile.normalizedLabel.includes(candidate.normalizedLabel))
  ) {
    score += 2.5;
  }

  if (profile.categoryHint !== "general" && profile.categoryHint === candidate.categoryHint) {
    score += 1;
  }

  if (profile.equipmentHints.some((hint) => candidate.equipmentHints.includes(hint))) {
    score += 1.4;
  }

  if (movementOverlap.length > 0) {
    score += 1.1;
  } else if (profile.movementHints.length > 0) {
    score -= 2.4;
  }

  const conflictingEquipment =
    candidate.equipmentHints.length > 0 &&
    profile.equipmentHints.length > 0 &&
    !candidate.equipmentHints.some((hint) => profile.equipmentHints.includes(hint));

  if (conflictingEquipment) {
    score -= 1.4;
  }

  const missingExerciseModifiers = exerciseModifiers.filter(
    (token) => !candidate.tokens.includes(token),
  );
  const extraCandidateModifiers = candidateModifiers.filter(
    (token) => !profile.tokens.includes(token),
  );
  const missingHardModifiers = missingExerciseModifiers.filter((token) =>
    hardModifierTokens.has(token),
  );

  if (missingHardModifiers.length > 0) {
    return Number.NEGATIVE_INFINITY;
  }

  if (missingExerciseModifiers.length > 0) {
    score -= missingExerciseModifiers.length * 1.4;
  }

  if (extraCandidateModifiers.length > 0) {
    score -= extraCandidateModifiers.length * 1.4;
  }

  if (
    candidate.categoryHint !== "general" &&
    profile.categoryHint !== "general" &&
    candidate.categoryHint !== profile.categoryHint
  ) {
    score -= 1;
  }

  return score;
}

function hasToken(tokens: string[], ...expected: string[]) {
  return expected.some((token) => tokens.includes(token));
}

function hasEquipment(exercise: ExerciseSeed, ...expected: string[]) {
  return expected.some((equipment) => exercise.equipmentSlugs.includes(equipment));
}

function buildSourceAssetLookup(candidates: SourceAsset[]) {
  return new Map(candidates.map((candidate) => [candidate.relativePath, candidate]));
}

function resolvePrototypeSourcePath(exercise: ExerciseSeed) {
  const profile = buildExerciseSearchProfile(exercise);
  const categoryHint = resolveExerciseCategoryHint(exercise);
  const primaryMuscles = new Set(exercise.primaryMuscleSlugs);
  const categorySlugs = new Set(exercise.categorySlugs);
  const movement = exercise.movementPattern;

  if (categoryHint === "chest") {
    if (movement === "fly" || hasToken(profile.tokens, "fly", "crossover", "crossovers", "deck")) {
      return anatomyPrototypePaths.chestCableFly;
    }
    if (hasToken(profile.tokens, "dip") || hasEquipment(exercise, "parallel-bars")) {
      return anatomyPrototypePaths.chestDip;
    }
    if (hasToken(profile.tokens, "decline") && hasEquipment(exercise, "body-weight")) {
      return anatomyPrototypePaths.chestDeclinePushUp;
    }
    if (hasToken(profile.tokens, "push", "pushup") || hasEquipment(exercise, "body-weight", "trx")) {
      return anatomyPrototypePaths.chestPushUp;
    }
    if (hasToken(profile.tokens, "incline") && hasEquipment(exercise, "smith-machine")) {
      return anatomyPrototypePaths.chestSmithInclinePress;
    }
    if (hasToken(profile.tokens, "incline")) {
      return anatomyPrototypePaths.chestInclineDumbbellPress;
    }
    if (hasEquipment(exercise, "dumbbell")) {
      return anatomyPrototypePaths.chestDumbbellPress;
    }
    if (hasEquipment(exercise, "cable-machine", "pec-deck-machine")) {
      return anatomyPrototypePaths.chestCableFly;
    }
    if (hasEquipment(exercise, "smith-machine")) {
      return anatomyPrototypePaths.chestSmithInclinePress;
    }
    return anatomyPrototypePaths.chestBenchPress;
  }

  if (categoryHint === "back") {
    if (movement === "vertical-pull") {
      if (hasEquipment(exercise, "pull-up-bar")) {
        return anatomyPrototypePaths.backPullUp;
      }
      if (hasEquipment(exercise, "lat-pulldown-machine", "machine")) {
        return anatomyPrototypePaths.backLeverPulldown;
      }
      return anatomyPrototypePaths.backCablePulldown;
    }

    if (movement === "row") {
      if (hasToken(profile.tokens, "high")) {
        return anatomyPrototypePaths.backHighRow;
      }
      if (hasToken(profile.tokens, "meadow", "t", "bar")) {
        return anatomyPrototypePaths.backLeverBentOverRow;
      }
      if (hasToken(profile.tokens, "supported", "chest")) {
        return anatomyPrototypePaths.backLeverBentOverRow;
      }
      if (hasEquipment(exercise, "dumbbell")) {
        return anatomyPrototypePaths.backDumbbellRow;
      }
      if (hasEquipment(exercise, "cable-machine")) {
        return anatomyPrototypePaths.backCableSeatedRow;
      }
      if (hasEquipment(exercise, "machine")) {
        return anatomyPrototypePaths.backLeverSeatedRow;
      }
      return anatomyPrototypePaths.backBarbellRow;
    }

    if (movement === "hinge") {
      return anatomyPrototypePaths.backHyperextension;
    }

    return anatomyPrototypePaths.backCableSeatedRow;
  }

  if (categoryHint === "shoulders") {
    if (hasToken(profile.tokens, "rear", "face") || movement === "row") {
      return anatomyPrototypePaths.shoulderRearDeltRaise;
    }
    if (movement === "raise" || hasToken(profile.tokens, "lateral", "raise", "upright")) {
      if (hasEquipment(exercise, "machine")) {
        return anatomyPrototypePaths.shoulderLeverLateralRaise;
      }
      if (hasEquipment(exercise, "dumbbell", "plate")) {
        return anatomyPrototypePaths.shoulderDumbbellLateralRaise;
      }
      return anatomyPrototypePaths.shoulderCableLateralRaise;
    }
    if (movement === "press") {
      if (hasEquipment(exercise, "machine")) {
        return anatomyPrototypePaths.shoulderLeverLateralRaise;
      }
      return anatomyPrototypePaths.shoulderDumbbellLateralRaise;
    }
    return anatomyPrototypePaths.shoulderDumbbellLateralRaise;
  }

  if (categoryHint === "arms") {
    if (primaryMuscles.has("triceps")) {
      if (hasToken(profile.tokens, "dip") || hasEquipment(exercise, "parallel-bars")) {
        return anatomyPrototypePaths.chestDip;
      }
      if (hasToken(profile.tokens, "overhead")) {
        return anatomyPrototypePaths.tricepsOverheadExtension;
      }
      if (hasToken(profile.tokens, "pushdown", "rope", "kickback") || hasEquipment(exercise, "cable-machine")) {
        return anatomyPrototypePaths.tricepsPushdown;
      }
      if (hasToken(profile.tokens, "skull", "crusher", "bench", "extension")) {
        return anatomyPrototypePaths.tricepsLeverExtension;
      }
      return anatomyPrototypePaths.tricepsOverheadExtension;
    }

    if (hasToken(profile.tokens, "preacher")) {
      return anatomyPrototypePaths.bicepsPreacherCurl;
    }
    if (hasToken(profile.tokens, "concentration")) {
      return anatomyPrototypePaths.bicepsConcentrationCurl;
    }
    if (hasToken(profile.tokens, "zottman")) {
      return anatomyPrototypePaths.bicepsZottmanPreacher;
    }
    if (hasToken(profile.tokens, "incline")) {
      return anatomyPrototypePaths.bicepsInclineCurl;
    }
    if (hasToken(profile.tokens, "hammer")) {
      if (hasEquipment(exercise, "cable-machine")) {
        return anatomyPrototypePaths.bicepsCableHammerCurl;
      }
      if (hasEquipment(exercise, "barbell", "ez-curl-bar")) {
        return anatomyPrototypePaths.bicepsOlympicHammerCurl;
      }
      return anatomyPrototypePaths.bicepsHammerCurl;
    }
    if (hasEquipment(exercise, "cable-machine")) {
      return anatomyPrototypePaths.bicepsCableCurl;
    }
    if (hasEquipment(exercise, "ez-curl-bar")) {
      return anatomyPrototypePaths.bicepsEzCurl;
    }
    if (hasEquipment(exercise, "barbell")) {
      return anatomyPrototypePaths.bicepsBarbellCurl;
    }
    return anatomyPrototypePaths.bicepsAlternatingCurl;
  }

  if (categoryHint === "core") {
    if (movement === "stability" || hasToken(profile.tokens, "rollout", "mountain", "climber")) {
      return anatomyPrototypePaths.chestPushUp;
    }
    return anatomyPrototypePaths.coreSitUp;
  }

  if (categoryHint === "lower-body") {
    if (movement === "calf" || hasToken(profile.tokens, "calf")) {
      if (hasToken(profile.tokens, "smith")) {
        return anatomyPrototypePaths.lowerSmithCalfRaise;
      }
      return anatomyPrototypePaths.lowerStandingCalfRaise;
    }

    if (movement === "hinge") {
      if (hasToken(profile.tokens, "hip", "bridge", "glute", "thrust")) {
        return anatomyPrototypePaths.lowerSmithHipThrust;
      }
      if (hasEquipment(exercise, "dumbbell", "kettlebell")) {
        return anatomyPrototypePaths.lowerDumbbellRdl;
      }
      if (hasToken(profile.tokens, "straight", "romanian", "sumo")) {
        return anatomyPrototypePaths.lowerBarbellRdl;
      }
      return anatomyPrototypePaths.lowerBarbellDeadlift;
    }

    if (movement === "lunge") {
      if (hasToken(profile.tokens, "bulgarian", "single", "split")) {
        return anatomyPrototypePaths.lowerSingleLegSplitSquat;
      }
      return anatomyPrototypePaths.lowerDumbbellSplitSquat;
    }

    if (movement === "squat") {
      if (hasToken(profile.tokens, "bulgarian", "split")) {
        return anatomyPrototypePaths.lowerSingleLegSplitSquat;
      }
      return anatomyPrototypePaths.lowerDumbbellSquat;
    }

    if (movement === "carry" || categorySlugs.has("cardio") || categorySlugs.has("plyometric")) {
      if (hasToken(profile.tokens, "swing")) {
        return anatomyPrototypePaths.lowerBarbellDeadlift;
      }
      return anatomyPrototypePaths.lowerDumbbellSquat;
    }

    return anatomyPrototypePaths.lowerDumbbellSquat;
  }

  if (movement === "vertical-pull") {
    return anatomyPrototypePaths.backPullUp;
  }
  if (movement === "press") {
    return anatomyPrototypePaths.chestBenchPress;
  }
  if (movement === "row") {
    return anatomyPrototypePaths.backCableSeatedRow;
  }
  if (movement === "curl") {
    return anatomyPrototypePaths.bicepsAlternatingCurl;
  }
  if (movement === "raise") {
    return anatomyPrototypePaths.shoulderDumbbellLateralRaise;
  }
  if (movement === "extension") {
    return anatomyPrototypePaths.tricepsOverheadExtension;
  }
  if (movement === "hinge") {
    return anatomyPrototypePaths.lowerBarbellDeadlift;
  }
  if (movement === "squat" || movement === "lunge") {
    return anatomyPrototypePaths.lowerDumbbellSquat;
  }
  if (movement === "stability" || movement === "core-dynamic") {
    return anatomyPrototypePaths.coreSitUp;
  }

  return anatomyPrototypePaths.chestPushUp;
}

function pickBestSourceAsset(exercise: ExerciseSeed, candidates: SourceAsset[]) {
  const sourceAssetLookup = buildSourceAssetLookup(candidates);
  const overridePath = curatedSourceOverrides[exercise.slug];
  if (overridePath) {
    const overrideAsset = sourceAssetLookup.get(overridePath);
    if (overrideAsset) {
      return {
        asset: overrideAsset,
        matchMode: "exact",
      } satisfies PickedSourceAsset;
    }
  }

  const equivalentPath = curatedEquivalentSourceOverrides[exercise.slug];
  if (equivalentPath) {
    const equivalentAsset = sourceAssetLookup.get(equivalentPath);
    if (equivalentAsset) {
      return {
        asset: equivalentAsset,
        matchMode: "equivalent",
      } satisfies PickedSourceAsset;
    }
  }

  let best: SourceAsset | null = null;
  let bestScore = Number.NEGATIVE_INFINITY;

  for (const candidate of candidates) {
    const score = scoreCandidate(exercise, candidate);

    if (score > bestScore) {
      bestScore = score;
      best = candidate;
    }
  }

  if (best && bestScore >= 3.6) {
    return {
      asset: best,
      matchMode: "exact",
    } satisfies PickedSourceAsset;
  }

  const prototypePath = resolvePrototypeSourcePath(exercise);
  const prototypeAsset =
    sourceAssetLookup.get(prototypePath) ??
    candidates.find((candidate) => candidate.categoryHint === resolveExerciseCategoryHint(exercise)) ??
    candidates[0];

  if (!prototypeAsset) {
    return null;
  }

  return {
    asset: prototypeAsset,
    matchMode: "prototype",
  } satisfies PickedSourceAsset;
}

function getPhaseIndexes(pageCount: number) {
  if (pageCount <= 1) {
    return [0, 0] as const;
  }

  const midpoint = Math.max(1, Math.floor(pageCount / 2));
  return [0, midpoint] as const;
}

function isNearWhitePixel(
  rgba: Uint8Array,
  index: number,
  threshold = 246,
  maxDelta = 18,
) {
  const red = rgba[index];
  const green = rgba[index + 1];
  const blue = rgba[index + 2];
  const alpha = rgba[index + 3];

  return (
    alpha > 0 &&
    red >= threshold &&
    green >= threshold &&
    blue >= threshold &&
    Math.max(red, green, blue) - Math.min(red, green, blue) <= maxDelta
  );
}

function stripNearWhiteBackdrop(
  rgba: Uint8Array,
  width: number,
  height: number,
) {
  const totalPixels = width * height;
  const visited = new Uint8Array(totalPixels);
  const queue = new Uint32Array(totalPixels);
  let head = 0;
  let tail = 0;

  const enqueue = (x: number, y: number) => {
    if (x < 0 || x >= width || y < 0 || y >= height) {
      return;
    }

    const offset = y * width + x;
    if (visited[offset]) {
      return;
    }

    const pixelIndex = offset * 4;
    if (!isNearWhitePixel(rgba, pixelIndex)) {
      return;
    }

    visited[offset] = 1;
    queue[tail] = offset;
    tail += 1;
  };

  for (let x = 0; x < width; x += 1) {
    enqueue(x, 0);
    enqueue(x, height - 1);
  }

  for (let y = 1; y < height - 1; y += 1) {
    enqueue(0, y);
    enqueue(width - 1, y);
  }

  while (head < tail) {
    const offset = queue[head];
    head += 1;

    const pixelIndex = offset * 4;
    rgba[pixelIndex + 3] = 0;

    const x = offset % width;
    const y = Math.floor(offset / width);

    enqueue(x + 1, y);
    enqueue(x - 1, y);
    enqueue(x, y + 1);
    enqueue(x, y - 1);
  }

  return rgba;
}

async function writeRgbaWebp(
  rgba: Uint8Array,
  width: number,
  height: number,
  target: string,
) {
  await fs.mkdir(path.dirname(target), { recursive: true });
  await sharp(Buffer.from(rgba), {
    raw: {
      width,
      height,
      channels: 4,
    },
  })
    .webp({ quality: 92, alphaQuality: 100 })
    .toFile(target);
}

async function renderAnimatedFrame(
  sourcePath: string,
  page: number,
  width: number,
  height: number,
) {
  const { data, info } = await sharp(sourcePath, { animated: true, page, pages: 1 })
    .ensureAlpha()
    .resize(width, height, {
      fit: "contain",
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const rgba = stripNearWhiteBackdrop(new Uint8Array(data), info.width, info.height);

  return {
    rgba,
    width: info.width,
    height: info.height,
  };
}

function buildTrxOverlaySvg(
  width: number,
  height: number,
  positions: {
    leftAnchor: [number, number];
    rightAnchor: [number, number];
    leftHandle: [number, number];
    rightHandle: [number, number];
  },
) {
  const strokeWidth = Math.max(6, Math.round(width * 0.012));
  const handleWidth = Math.max(22, Math.round(width * 0.04));
  const handleHeight = Math.max(16, Math.round(height * 0.03));
  const anchorRadius = Math.max(6, Math.round(width * 0.012));

  const [leftAnchorX, leftAnchorY] = positions.leftAnchor;
  const [rightAnchorX, rightAnchorY] = positions.rightAnchor;
  const [leftHandleX, leftHandleY] = positions.leftHandle;
  const [rightHandleX, rightHandleY] = positions.rightHandle;

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <g stroke="#121212" stroke-width="${strokeWidth}" stroke-linecap="round" fill="none" opacity="0.92">
        <line x1="${leftAnchorX}" y1="${leftAnchorY}" x2="${leftHandleX}" y2="${leftHandleY}" />
        <line x1="${rightAnchorX}" y1="${rightAnchorY}" x2="${rightHandleX}" y2="${rightHandleY}" />
      </g>
      <g stroke="#121212" stroke-width="${Math.max(5, strokeWidth - 1)}" stroke-linecap="round" fill="none">
        <path d="M ${leftHandleX - handleWidth / 2} ${leftHandleY} q ${handleWidth / 2} -${handleHeight} ${handleWidth} 0 v ${handleHeight} q -${handleWidth / 2} ${handleHeight} -${handleWidth} 0 z" />
        <path d="M ${rightHandleX - handleWidth / 2} ${rightHandleY} q ${handleWidth / 2} -${handleHeight} ${handleWidth} 0 v ${handleHeight} q -${handleWidth / 2} ${handleHeight} -${handleWidth} 0 z" />
      </g>
      <g fill="#1a1a1a" opacity="0.22">
        <circle cx="${leftAnchorX}" cy="${leftAnchorY}" r="${anchorRadius}" />
        <circle cx="${rightAnchorX}" cy="${rightAnchorY}" r="${anchorRadius}" />
      </g>
    </svg>
  `;
}

function getDerivedExerciseOverlaySvg(
  variant: DerivedExerciseMediaSpec["overlayVariant"],
  width: number,
  height: number,
) {
  if (variant === "trx-row") {
    return buildTrxOverlaySvg(width, height, {
      leftAnchor: [Math.round(width * 0.405), Math.round(height * 0.035)],
      rightAnchor: [Math.round(width * 0.64), Math.round(height * 0.035)],
      leftHandle: [Math.round(width * 0.355), Math.round(height * 0.18)],
      rightHandle: [Math.round(width * 0.635), Math.round(height * 0.18)],
    });
  }

  return buildTrxOverlaySvg(width, height, {
    leftAnchor: [Math.round(width * 0.615), Math.round(height * 0.03)],
    rightAnchor: [Math.round(width * 0.83), Math.round(height * 0.03)],
    leftHandle: [Math.round(width * 0.625), Math.round(height * 0.63)],
    rightHandle: [Math.round(width * 0.89), Math.round(height * 0.645)],
  });
}

async function compositeOverlayOnFrame(
  frame: RenderedFrame,
  overlaySvg: string,
) {
  const { data, info } = await sharp(Buffer.from(frame.rgba), {
    raw: {
      width: frame.width,
      height: frame.height,
      channels: 4,
    },
  })
    .composite([{ input: Buffer.from(overlaySvg) }])
    .raw()
    .toBuffer({ resolveWithObject: true });

  return {
    rgba: new Uint8Array(data),
    width: info.width,
    height: info.height,
  } satisfies RenderedFrame;
}

async function renderDerivedExerciseFrame(
  assetPath: string,
  page: number,
  width: number,
  height: number,
  variant: DerivedExerciseMediaSpec["overlayVariant"],
) {
  const baseFrame = await renderAnimatedFrame(assetPath, page, width, height);
  const overlaySvg = getDerivedExerciseOverlaySvg(variant, baseFrame.width, baseFrame.height);

  return compositeOverlayOnFrame(baseFrame, overlaySvg);
}

async function writeAnimatedFrameVariant(
  sourcePath: string,
  target: string,
  page: number,
  width: number,
  height: number,
) {
  const frame = await renderAnimatedFrame(sourcePath, page, width, height);
  await writeRgbaWebp(frame.rgba, frame.width, frame.height, target);
}

async function getAnimatedFramePixels(
  sourcePath: string,
  page: number,
  width: number,
  height: number,
) {
  return renderAnimatedFrame(sourcePath, page, width, height);
}

async function writeAnimatedGif(
  frames: Array<{
    rgba: Uint8Array;
    width: number;
    height: number;
    delay: number;
  }>,
  target: string,
) {
  await fs.mkdir(path.dirname(target), { recursive: true });
  const gif = GIFEncoder();

  frames.forEach((frame, index) => {
    const palette = quantize(frame.rgba, 256, {
      format: "rgba4444",
      oneBitAlpha: true,
      clearAlpha: true,
      clearAlphaThreshold: 0,
    });
    const indexed = applyPalette(frame.rgba, palette, "rgba4444");

    gif.writeFrame(indexed, frame.width, frame.height, {
      palette,
      delay: frame.delay,
      repeat: index === 0 ? 0 : undefined,
    });
  });

  gif.finish();
  await fs.writeFile(target, Buffer.from(gif.bytesView()));
}

async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  worker: (item: T, index: number) => Promise<R>,
) {
  const results = new Array<R>(items.length);
  let cursor = 0;

  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (cursor < items.length) {
        const currentIndex = cursor;
        cursor += 1;
        results[currentIndex] = await worker(items[currentIndex], currentIndex);
      }
    }),
  );

  return results;
}

async function ensureCloudinaryFolders(runtime: CloudinaryRuntime) {
  const folders = [
    runtime.rootFolder,
    `${runtime.rootFolder}/app`,
    `${runtime.rootFolder}/app/brand`,
    `${runtime.rootFolder}/app/screens`,
    `${runtime.rootFolder}/app/pwa`,
    `${runtime.rootFolder}/workout`,
    `${runtime.rootFolder}/workout/exercise`,
    `${runtime.rootFolder}/workout/equipment`,
    `${runtime.rootFolder}/workout/muscle`,
  ];

  for (const folder of folders) {
    try {
      await cloudinary.api.create_folder(folder);
    } catch {
      continue;
    }
  }
}

async function uploadFileToCloudinary({
  filePath,
  folder,
  publicId,
}: {
  filePath: string;
  folder: string;
  publicId: string;
}) {
  const result = await cloudinary.uploader.upload(filePath, {
    asset_folder: folder,
    folder,
    public_id: publicId,
    overwrite: true,
    invalidate: true,
    resource_type: "image",
    unique_filename: false,
    use_filename: false,
  });

  return result.secure_url;
}

async function syncAppAssetsToCloudinary(runtime: CloudinaryRuntime) {
  const appUploads = [
    {
      filePath: path.join(brandDir, "sablefit-mark.svg"),
      folder: `${runtime.rootFolder}/app/brand`,
      publicId: "sablefit-mark",
    },
    {
      filePath: path.join(brandDir, "sablefit-mark-inverse.svg"),
      folder: `${runtime.rootFolder}/app/brand`,
      publicId: "sablefit-mark-inverse",
    },
    {
      filePath: path.join(brandDir, "sablefit-wordmark.svg"),
      folder: `${runtime.rootFolder}/app/brand`,
      publicId: "sablefit-wordmark",
    },
    {
      filePath: path.join(brandDir, "sablefit-wordmark-inverse.svg"),
      folder: `${runtime.rootFolder}/app/brand`,
      publicId: "sablefit-wordmark-inverse",
    },
    ...screens.flatMap((screen) => [
      {
        filePath: path.join(screensDir, `${screen.key}.svg`),
        folder: `${runtime.rootFolder}/app/screens`,
        publicId: screen.key,
      },
      {
        filePath: path.join(
          screen.key === "hero-stack" ? pwaDir : pwaScreensDir,
          `${screen.key}.png`,
        ),
        folder: `${runtime.rootFolder}/app/screens`,
        publicId: `${screen.key}-preview`,
      },
    ]),
    ...[
      "icon-192.png",
      "icon-512.png",
      "apple-touch-icon.png",
      "maskable-icon-512.png",
      "badge-96.png",
      "favicon-32.png",
    ].map((fileName) => ({
      filePath: path.join(pwaDir, fileName),
      folder: `${runtime.rootFolder}/app/pwa`,
      publicId: fileName.replace(/\.[a-z0-9]+$/i, ""),
    })),
  ];

  await mapWithConcurrency(appUploads, 4, (item) =>
    uploadFileToCloudinary({
      filePath: item.filePath,
      folder: item.folder,
      publicId: item.publicId,
    }),
  );

  return appUploads.length;
}

async function syncExerciseMediaToCloudinary(
  runtime: CloudinaryRuntime,
  manifest: MediaManifest,
) {
  type UploadField = "phase1" | "phase2" | "animation";
  type UploadJob = {
    slug: string;
    field: UploadField;
    filePath: string;
    folder: string;
    publicId: string;
  };

  const uploadJobs = Object.keys(manifest).flatMap((slug) => {
    const paths = getLocalExerciseMediaPaths(slug);
    const jobs: UploadJob[] = [
      {
        slug,
        field: "phase1",
        filePath: paths.phase1Path,
        folder: `${runtime.rootFolder}/workout/exercise/${slug}`,
        publicId: "phase-01",
      },
      {
        slug,
        field: "phase2",
        filePath: paths.phase2Path,
        folder: `${runtime.rootFolder}/workout/exercise/${slug}`,
        publicId: "phase-02",
      },
      {
        slug,
        field: "animation",
        filePath: paths.motionPath,
        folder: `${runtime.rootFolder}/workout/exercise/${slug}`,
        publicId: "motion-slow",
      },
    ];

    return jobs;
  });

  const uploads = await mapWithConcurrency(uploadJobs, 6, async (job) => ({
    ...job,
    secureUrl: await uploadFileToCloudinary({
      filePath: job.filePath,
      folder: job.folder,
      publicId: job.publicId,
    }),
  }));

  for (const upload of uploads) {
    const media = manifest[upload.slug];

    if (upload.field === "phase1") {
      media.thumbnailUrl = upload.secureUrl;
      media.keyframes[0].url = upload.secureUrl;
    } else if (upload.field === "phase2") {
      media.detailUrl = upload.secureUrl;
      media.keyframes[1].url = upload.secureUrl;
    } else {
      media.animationUrl = upload.secureUrl;
    }

    media.sourceProvider = "CLOUDINARY";
    media.sourcePath = `${runtime.rootFolder}/workout/exercise/${upload.slug}`;
  }

  for (const slug of Object.keys(manifest)) {
    const media = manifest[slug];
    const override = customExerciseVideoOverrides[slug];

    media.videoUrl = override ? buildCloudinaryExerciseVideoOverrideUrl(runtime, slug, override) : "";
    media.videoPosterUrl = override ? buildCloudinaryExercisePosterUrl(runtime, slug, override) : "";
  }

  return uploads.length;
}

async function syncMuscleImagesToCloudinary(
  runtime: CloudinaryRuntime,
  manifest: MuscleImageManifest,
) {
  const uploadJobs = Object.keys(manifest).map((slug) => {
    const paths = getLocalMuscleImagePaths(slug);

    return {
      slug,
      filePath: paths.imagePath,
      folder: `${runtime.rootFolder}/workout/muscle/${slug}`,
      publicId: "primary",
    };
  });

  const uploads = await mapWithConcurrency(uploadJobs, 6, async (job) => ({
    ...job,
    secureUrl: await uploadFileToCloudinary({
      filePath: job.filePath,
      folder: job.folder,
      publicId: job.publicId,
    }),
  }));

  for (const upload of uploads) {
    manifest[upload.slug].imageUrl = upload.secureUrl;
    manifest[upload.slug].sourcePath = `${runtime.rootFolder}/workout/muscle/${upload.slug}`;
  }

  return uploads.length;
}

async function syncEquipmentImagesToCloudinary(
  runtime: CloudinaryRuntime,
  manifest: EquipmentImageManifest,
) {
  const uploadJobs = Object.keys(manifest).map((slug) => {
    const paths = getLocalEquipmentImagePaths(slug);

    return {
      slug,
      filePath: paths.imagePath,
      folder: `${runtime.rootFolder}/workout/equipment/${slug}`,
      publicId: "primary",
    };
  });

  const uploads = await mapWithConcurrency(uploadJobs, 6, async (job) => ({
    ...job,
    secureUrl: await uploadFileToCloudinary({
      filePath: job.filePath,
      folder: job.folder,
      publicId: job.publicId,
    }),
  }));

  for (const upload of uploads) {
    manifest[upload.slug].imageUrl = upload.secureUrl;
    manifest[upload.slug].sourcePath = `${runtime.rootFolder}/workout/equipment/${upload.slug}`;
  }

  return uploads.length;
}

async function generateBrandAssets() {
  const mark = renderBrandMarkSvg({ size: 512 });
  const markInverse = renderBrandMarkSvg({ inverse: true, size: 512 });
  const wordmark = renderBrandWordmarkSvg();
  const wordmarkInverse = renderBrandWordmarkSvg({ inverse: true });

  await Promise.all([
    writeTextFile(path.join(brandDir, "sablefit-mark.svg"), mark),
    writeTextFile(path.join(brandDir, "sablefit-mark-inverse.svg"), markInverse),
    writeTextFile(path.join(brandDir, "sablefit-wordmark.svg"), wordmark),
    writeTextFile(path.join(brandDir, "sablefit-wordmark-inverse.svg"), wordmarkInverse),
    writeTextFile(appIconPath, mark),
  ]);

  await Promise.all([
    rasterizeSvgToPng(mark, path.join(pwaDir, "icon-192.png"), 192, 192),
    rasterizeSvgToPng(mark, path.join(pwaDir, "icon-512.png"), 512, 512),
    rasterizeSvgToPng(mark, path.join(pwaDir, "apple-touch-icon.png"), 180, 180),
    rasterizeSvgToPng(mark, path.join(pwaDir, "maskable-icon-512.png"), 512, 512),
    rasterizeSvgToPng(mark, path.join(pwaDir, "badge-96.png"), 96, 96),
    rasterizeSvgToPng(mark, path.join(pwaDir, "favicon-32.png"), 32, 32),
  ]);
}

async function generateScreenAssets() {
  await Promise.all(
    screens.map(async (screen) => {
      const svg = renderAppScreenSvg(screen.key);
      await writeTextFile(path.join(screensDir, `${screen.key}.svg`), svg);
      await rasterizeSvgToPng(
        svg,
        path.join(screen.key === "hero-stack" ? pwaDir : pwaScreensDir, `${screen.key}.png`),
        screen.width,
        screen.height,
      );
    }),
  );
}

async function generateEquipmentImages() {
  const taxonomy = getSystemTaxonomy();
  const manifest: EquipmentImageManifest = {};
  const auditEntries: EquipmentImageAuditEntry[] = [];
  const cloudinaryRootFolder = process.env.CLOUDINARY_ROOT_FOLDER?.trim() || "sablefit";

  for (const equipment of taxonomy.equipments) {
    const localPaths = getLocalEquipmentImagePaths(equipment.slug);
    const svg = renderEquipmentSvg(equipment.slug);

    await rasterizeSvgToPng(svg, localPaths.imagePath, 512, 512);

    manifest[equipment.slug] = {
      imageUrl: localPaths.imageUrl,
      sourcePath: `internal://equipment-svg/${equipment.slug}`,
      status: "DERIVED",
    };

    auditEntries.push({
      slug: equipment.slug,
      status: "DERIVED",
      sourcePath: `internal://equipment-svg/${equipment.slug}`,
      cloudinaryFolder: `${cloudinaryRootFolder}/workout/equipment/${equipment.slug}`,
    });
  }

  await writeJsonFile(equipmentAuditPath, {
    totalEquipments: taxonomy.equipments.length,
    providedCount: 0,
    derivedCount: auditEntries.length,
    entries: auditEntries,
  });

  return {
    manifest,
    auditEntries,
  };
}

async function generateMuscleImages() {
  const taxonomy = getSystemTaxonomy();
  const manifest: MuscleImageManifest = {};
  const auditEntries: MuscleImageAuditEntry[] = [];
  const cloudinaryRootFolder = process.env.CLOUDINARY_ROOT_FOLDER?.trim() || "sablefit";

  for (const muscle of taxonomy.muscles) {
    const sourceSpec = muscleImageSourceSpecs[muscle.slug];

    if (!sourceSpec) {
      throw new Error(`Missing muscle image source spec for ${muscle.slug}`);
    }

    const sourcePath = path.join(fitateMuscleImageDir, sourceSpec.source);
    const localPaths = getLocalMuscleImagePaths(muscle.slug);

    await writeStaticPng(sourcePath, localPaths.imagePath, 512, 512);

    manifest[muscle.slug] = {
      imageUrl: localPaths.imageUrl,
      sourcePath: sourceSpec.source,
      status: sourceSpec.status,
    };

    auditEntries.push({
      slug: muscle.slug,
      status: sourceSpec.status,
      sourcePath: sourceSpec.source,
      cloudinaryFolder: `${cloudinaryRootFolder}/workout/muscle/${muscle.slug}`,
    });
  }

  await writeJsonFile(muscleAuditPath, {
    totalMuscles: taxonomy.muscles.length,
    providedCount: auditEntries.filter((entry) => entry.status === "PROVIDED").length,
    derivedCount: auditEntries.filter((entry) => entry.status === "DERIVED").length,
    entries: auditEntries,
  });

  return {
    manifest,
    auditEntries,
  };
}

async function generateExerciseMedia() {
  const exercises = getSystemExercises();
  const sourceAssets = await loadSourceAssets();
  const sourceAssetLookup = buildSourceAssetLookup(sourceAssets);
  const manifest: MediaManifest = {};
  const auditEntries: ExerciseMediaAuditEntry[] = [];
  const cloudinaryRootFolder = process.env.CLOUDINARY_ROOT_FOLDER?.trim() || "sablefit";
  let anatomyCount = 0;
  let exactCount = 0;
  let equivalentCount = 0;
  let prototypeCount = 0;
  let motionCount = 0;

  for (const exercise of exercises) {
    const localPaths = getLocalExerciseMediaPaths(exercise.slug);
    const derivedSpec = derivedExerciseMediaSpecs[exercise.slug];
    const pickedSource = derivedSpec ? null : pickBestSourceAsset(exercise, sourceAssets);

    const matchedAsset = derivedSpec
      ? sourceAssetLookup.get(derivedSpec.baseRelativePath) ?? null
      : pickedSource?.asset ?? null;
    const matchMode = derivedSpec ? derivedSpec.matchMode : pickedSource?.matchMode ?? null;

    if (!matchedAsset || matchedAsset.extension !== ".gif" || !matchMode) {
      throw new Error(`Unable to resolve anatomy media for exercise: ${exercise.slug}`);
    }

    const metadata = await sharp(matchedAsset.absolutePath, { animated: true }).metadata();
    const pageCount = metadata.pages ?? 1;
    const delays = metadata.delay ?? [];
    const [phase1Index, phase2Index] = getPhaseIndexes(pageCount);

    if (derivedSpec) {
      const [phase1Frame, phase2Frame] = await Promise.all([
        renderDerivedExerciseFrame(
          matchedAsset.absolutePath,
          phase1Index,
          520,
          520,
          derivedSpec.overlayVariant,
        ),
        renderDerivedExerciseFrame(
          matchedAsset.absolutePath,
          phase2Index,
          520,
          520,
          derivedSpec.overlayVariant,
        ),
      ]);

      await Promise.all([
        writeRgbaWebp(phase1Frame.rgba, phase1Frame.width, phase1Frame.height, localPaths.phase1Path),
        writeRgbaWebp(phase2Frame.rgba, phase2Frame.width, phase2Frame.height, localPaths.phase2Path),
      ]);
    } else {
      await Promise.all([
        writeAnimatedFrameVariant(matchedAsset.absolutePath, localPaths.phase1Path, phase1Index, 520, 520),
        writeAnimatedFrameVariant(matchedAsset.absolutePath, localPaths.phase2Path, phase2Index, 520, 520),
      ]);
    }

    const motionFrames = await mapWithConcurrency(
      Array.from({ length: pageCount }, (_, index) => index),
      4,
      async (page) => {
        const frame = derivedSpec
          ? await renderDerivedExerciseFrame(
              matchedAsset.absolutePath,
              page,
              720,
              720,
              derivedSpec.overlayVariant,
            )
          : await getAnimatedFramePixels(matchedAsset.absolutePath, page, 720, 720);

        return {
          ...frame,
          delay: Math.max(180, Math.round((delays[page] ?? 100) * 1.8)),
        };
      },
    );

    await writeAnimatedGif(motionFrames, localPaths.motionPath);
    motionCount += 1;

    manifest[exercise.slug] = {
      style: "ANATOMY",
      status: "READY",
      thumbnailUrl: localPaths.phase1Url,
      detailUrl: localPaths.phase2Url,
      keyframes: [
        {
          order: 1,
          phase: buildKeyframePhase(1),
          label: buildKeyframeLabel(1),
          url: localPaths.phase1Url,
        },
        {
          order: 2,
          phase: buildKeyframePhase(2),
          label: buildKeyframeLabel(2),
          url: localPaths.phase2Url,
        },
      ],
      animationUrl: localPaths.motionUrl,
      videoUrl: "",
      videoPosterUrl: "",
      sourceProvider: derivedSpec?.sourceProvider ?? "FITATE_LOCAL",
      sourcePath:
        derivedSpec?.sourcePath ?? matchedAsset.relativePath.replaceAll(path.sep, "/"),
    };
    anatomyCount += 1;

    if (matchMode === "exact") {
      exactCount += 1;
    } else if (matchMode === "equivalent") {
      equivalentCount += 1;
    } else {
      prototypeCount += 1;
    }

    auditEntries.push({
      slug: exercise.slug,
      matchMode,
      sourcePath:
        derivedSpec?.sourcePath ?? matchedAsset.relativePath.replaceAll(path.sep, "/"),
      cloudinaryFolder: `${cloudinaryRootFolder}/workout/exercise/${exercise.slug}`,
    });
  }

  await writeJsonFile(auditPath, {
    totalExercises: exercises.length,
    exactMatchCount: exactCount,
    equivalentMatchCount: equivalentCount,
    prototypeMatchCount: prototypeCount,
    entries: auditEntries,
  });

  return {
    manifest,
    exerciseCount: exercises.length,
    anatomyCount,
    exactCount,
    equivalentCount,
    prototypeCount,
    motionCount,
    sourceAssetCount: sourceAssets.length,
  };
}

async function main() {
  await loadEnvFile();

  await Promise.all([
    resetDir(brandDir),
    resetDir(screensDir),
    resetDir(workoutPublicDir),
    resetDir(pwaDir),
    fs.rm(legacyExerciseArtDir, { recursive: true, force: true }),
    fs.rm(legacyExerciseMediaDir, { recursive: true, force: true }),
  ]);
  await fs.mkdir(exerciseMediaDir, { recursive: true });
  await fs.mkdir(pwaScreensDir, { recursive: true });

  await generateBrandAssets();
  await generateScreenAssets();
  const equipmentImageReport = await generateEquipmentImages();
  const muscleImageReport = await generateMuscleImages();
  const mediaReport = await generateExerciseMedia();
  const cloudinaryRuntime = getCloudinaryRuntime();
  let uploadedAppAssets = 0;
  let uploadedExerciseAssets = 0;
  let uploadedEquipmentAssets = 0;
  let uploadedMuscleAssets = 0;

  if (cloudinaryRuntime) {
    await ensureCloudinaryFolders(cloudinaryRuntime);
    uploadedAppAssets = await syncAppAssetsToCloudinary(cloudinaryRuntime);
    uploadedEquipmentAssets = await syncEquipmentImagesToCloudinary(
      cloudinaryRuntime,
      equipmentImageReport.manifest,
    );
    uploadedMuscleAssets = await syncMuscleImagesToCloudinary(
      cloudinaryRuntime,
      muscleImageReport.manifest,
    );
    uploadedExerciseAssets = await syncExerciseMediaToCloudinary(
      cloudinaryRuntime,
      mediaReport.manifest,
    );
  }

  await writeJsonFile(equipmentManifestPath, equipmentImageReport.manifest);
  await writeJsonFile(muscleManifestPath, muscleImageReport.manifest);
  await writeJsonFile(manifestPath, mediaReport.manifest);

  console.log(
    JSON.stringify(
      {
        brandAssets: 4,
        screenAssets: screens.length,
        equipmentImageAssets: Object.keys(equipmentImageReport.manifest).length,
        equipmentProvidedAssets: equipmentImageReport.auditEntries.filter(
          (entry) => entry.status === "PROVIDED",
        ).length,
        equipmentDerivedAssets: equipmentImageReport.auditEntries.filter(
          (entry) => entry.status === "DERIVED",
        ).length,
        muscleImageAssets: Object.keys(muscleImageReport.manifest).length,
        muscleProvidedAssets: muscleImageReport.auditEntries.filter(
          (entry) => entry.status === "PROVIDED",
        ).length,
        muscleDerivedAssets: muscleImageReport.auditEntries.filter(
          (entry) => entry.status === "DERIVED",
        ).length,
        exerciseMediaBundles: mediaReport.exerciseCount,
        anatomyMedia: mediaReport.anatomyCount,
        exactMatchMedia: mediaReport.exactCount,
        equivalentMatchMedia: mediaReport.equivalentCount,
        prototypeMatchMedia: mediaReport.prototypeCount,
        motionAssets: mediaReport.motionCount,
        sourceAssetsScanned: mediaReport.sourceAssetCount,
        cloudinaryEnabled: Boolean(cloudinaryRuntime),
        cloudinaryRootFolder: cloudinaryRuntime?.rootFolder ?? "",
        uploadedAppAssets,
        uploadedEquipmentAssets,
        uploadedMuscleAssets,
        uploadedExerciseAssets,
        equipmentManifestPath: "/src/data/system/equipment-image-manifest.json",
        equipmentAuditPath: "/src/data/system/equipment-image-audit.json",
        muscleManifestPath: "/src/data/system/muscle-image-manifest.json",
        muscleAuditPath: "/src/data/system/muscle-image-audit.json",
        manifestPath: "/src/data/system/exercise-media-manifest.json",
        auditPath: "/src/data/system/exercise-media-audit.json",
        iconPath: "/src/app/icon.svg",
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error("[art] generation failed", error);
  process.exitCode = 1;
});
