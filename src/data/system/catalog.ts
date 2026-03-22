import rawExerciseCategories from "@/data/raw/fitate-exercise-categories.json";
import rawEquipment from "@/data/raw/fitate-equipment.json";
import rawExerciseGoal from "@/data/raw/fitate-exercise-goal.json";
import rawExercises from "@/data/raw/fitate-exercise.json";
import rawMuscles from "@/data/raw/kinis-muscles.json";
import { getEquipmentImage } from "@/data/system/equipment-images";
import { getExerciseMedia, getExerciseMediaManifest } from "@/data/system/exercise-media";
import { getMuscleImage } from "@/data/system/muscle-images";
import { manualExerciseSeeds } from "@/data/system/manual-exercises";
import { systemPlanDrafts, systemSessionDrafts } from "@/data/system/sample-plans";
import { slugify } from "@/lib/strings";
import type {
  ExerciseMedia,
  LocalizedString,
  WorkoutPlanDraft,
  WorkoutSessionDraft,
} from "@/types/domain";

type TaxonomySeed = {
  slug: string;
  name: LocalizedString;
  description: LocalizedString;
  aliases?: string[];
  order: number;
};

type MuscleSeed = TaxonomySeed & {
  categorySlug: string;
  imageUrl?: string;
};

type BuiltExerciseSeed = {
  slug: string;
  name: LocalizedString;
  description: LocalizedString;
  instructionSteps: LocalizedString[];
  imageUrl: string;
  imageAlt: LocalizedString;
  media: ExerciseMedia;
  aliases: string[];
  primaryEquipmentSlug: string;
  equipmentSlugs: string[];
  primaryMuscleSlugs: string[];
  secondaryMuscleSlugs: string[];
  muscleCategorySlugs: string[];
  goalSlugs: string[];
  levelSlug: string;
  categorySlugs: string[];
  movementPattern: string;
  source: string;
  sourceUrl: string;
  reviewStatus: "APPROVED" | "DRAFT";
};

type RawExerciseRecord = {
  name: string;
  description?: string;
  difficulty?: string;
  equipment?: string;
  muscles_targeted?: string[];
  muscle?: string | string[];
  image_url?: string;
  instructions?: string;
  type?: string;
};

const NASM_SOURCE = "https://www.nasm.org/workout-exercise-guidance";
const levelAliasMap = new Map<string, string[]>([
  ["beginner", ["newbie", "starter", "entry"]],
  ["intermediate", ["mid-level", "progressing"]],
  ["advanced", ["experienced", "elite"]],
]);

const goalAliasMap = new Map<string, string[]>([
  ["strength", ["power", "max strength"]],
  ["hypertrophy", ["muscle gain", "muscle building"]],
  ["hiit", ["conditioning", "fat loss"]],
  ["endurance", ["stamina", "work capacity"]],
  ["mobility", ["movement quality", "range of motion"]],
]);

const categoryAliasMap = new Map<string, string[]>([
  ["compound", ["multi-joint"]],
  ["isolation", ["single-joint"]],
  ["isometric", ["static hold"]],
  ["plyometric", ["explosive"]],
  ["cardio", ["conditioning"]],
  ["mobility", ["warm-up", "movement prep"]],
]);
const equipmentSeeds: TaxonomySeed[] = [
  { slug: "body-weight", name: { en: "Body Weight", vi: "Trọng lượng cơ thể" }, description: { en: "Exercises performed without external load.", vi: "Bài tập không dùng thêm tải ngoài." }, order: 1 },
  { slug: "dumbbell", name: { en: "Dumbbell", vi: "Tạ đơn" }, description: { en: "Single-hand free weights for unilateral or bilateral training.", vi: "Tạ cầm tay dùng cho bài tập một bên hoặc hai bên." }, order: 2 },
  { slug: "barbell", name: { en: "Barbell", vi: "Thanh đòn" }, description: { en: "A standard barbell used for compound strength lifts.", vi: "Thanh đòn tiêu chuẩn cho các bài compound nặng." }, order: 3 },
  { slug: "kettlebell", name: { en: "Kettlebell", vi: "Tạ chuông" }, description: { en: "Offset-load bell suited for power and conditioning drills.", vi: "Tạ chuông phù hợp cho power và conditioning." }, order: 4 },
  { slug: "cable-machine", name: { en: "Cable Machine", vi: "Máy cáp" }, description: { en: "Adjustable resistance machine for constant-tension strength work.", vi: "Máy cáp tạo lực căng liên tục cho bài sức mạnh." }, order: 5 },
  { slug: "machine", name: { en: "Machine", vi: "Máy tập" }, description: { en: "Selectorized or plate-loaded gym machine.", vi: "Máy tập có chốt tạ hoặc máy gắn bánh tạ." }, order: 6 },
  { slug: "bench", name: { en: "Bench", vi: "Ghế tập" }, description: { en: "Flat or adjustable bench used for support and pressing variations.", vi: "Ghế phẳng hoặc ghế chỉnh góc để hỗ trợ các bài tập." }, order: 7 },
  { slug: "smith-machine", name: { en: "Smith Machine", vi: "Smith machine" }, description: { en: "Guided bar path for pressing, squatting, and lunge work.", vi: "Thanh dẫn hướng cho các bài đẩy, squat và lunge." }, order: 8 },
  { slug: "lat-pulldown-machine", name: { en: "Lat Pulldown Machine", vi: "Máy kéo xô" }, description: { en: "Vertical pulling station used for back development.", vi: "Máy kéo xô cho các bài kéo lưng theo phương dọc." }, order: 9 },
  { slug: "leg-press-machine", name: { en: "Leg Press Machine", vi: "Máy đạp đùi" }, description: { en: "Machine for lower-body pressing patterns.", vi: "Máy cho các bài đạp chân tập lower body." }, order: 10 },
  { slug: "leg-curl-machine", name: { en: "Leg Curl Machine", vi: "Máy gập đùi sau" }, description: { en: "Machine isolating hamstrings through knee flexion.", vi: "Máy cô lập đùi sau qua động tác gập gối." }, order: 11 },
  { slug: "leg-extension-machine", name: { en: "Leg Extension Machine", vi: "Máy duỗi đùi trước" }, description: { en: "Machine isolating quadriceps through knee extension.", vi: "Máy cô lập đùi trước qua động tác duỗi gối." }, order: 12 },
  { slug: "pull-up-bar", name: { en: "Pull-Up Bar", vi: "Xà đơn" }, description: { en: "Fixed bar for hanging and pulling movements.", vi: "Xà cố định cho các bài treo và kéo người." }, order: 13 },
  { slug: "parallel-bars", name: { en: "Parallel Bars", vi: "Xà kép" }, description: { en: "Bars used for dips and bodyweight support work.", vi: "Xà kép cho dips và các bài bodyweight." }, order: 14 },
  { slug: "medicine-ball", name: { en: "Medicine Ball", vi: "Bóng tạ" }, description: { en: "Weighted ball for throws, slams, and core drills.", vi: "Bóng có trọng lượng cho các bài ném, đập và core." }, order: 15 },
  { slug: "resistance-bands", name: { en: "Resistance Bands", vi: "Dây kháng lực" }, description: { en: "Portable elastic resistance for warm-ups, rehab, and strength work.", vi: "Dây đàn hồi di động cho warm-up, rehab và strength." }, order: 16 },
  { slug: "trx", name: { en: "TRX", vi: "TRX" }, description: { en: "Suspension trainer used for stability-focused movements.", vi: "Dây treo giúp tăng ổn định và kiểm soát." }, order: 17 },
  { slug: "plyo-box", name: { en: "Plyo Box", vi: "Bục nhảy" }, description: { en: "Stable box used for jumps and step-based drills.", vi: "Bục chắc chắn cho nhảy và step-up." }, order: 18 },
  { slug: "battle-ropes", name: { en: "Battle Ropes", vi: "Battle rope" }, description: { en: "Heavy ropes for upper-body conditioning work.", vi: "Dây nặng cho các bài conditioning thân trên." }, order: 19 },
  { slug: "ez-curl-bar", name: { en: "EZ Curl Bar", vi: "Thanh EZ" }, description: { en: "Curved bar for arm-friendly curls and extensions.", vi: "Thanh cong giúp curl và extension thoải mái cổ tay hơn." }, order: 20 },
  { slug: "plate", name: { en: "Weight Plate", vi: "Đĩa tạ" }, description: { en: "Weight plate used as free resistance or for carries and raises.", vi: "Đĩa tạ dùng như tải tự do cho các bài raise hoặc carry." }, order: 21 },
  { slug: "ab-wheel", name: { en: "Ab Wheel", vi: "Bánh xe bụng" }, description: { en: "Rolling wheel for anti-extension core work.", vi: "Bánh xe cho các bài core chống ưỡn người." }, order: 22 },
  { slug: "pec-deck-machine", name: { en: "Pec Deck Machine", vi: "Máy ép ngực bướm" }, description: { en: "Machine for chest fly patterns and rear-delt variations.", vi: "Máy ép ngực bướm và một số biến thể vai sau." }, order: 23 },
  { slug: "calf-raise-machine", name: { en: "Calf Raise Machine", vi: "Máy nhón bắp chân" }, description: { en: "Machine dedicated to calf raises.", vi: "Máy chuyên cho bài nhón bắp chân." }, order: 24 },
  { slug: "seated-calf-raise-machine", name: { en: "Seated Calf Raise Machine", vi: "Máy nhón bắp chân ngồi" }, description: { en: "Machine emphasizing soleus work from a seated position.", vi: "Máy nhón bắp chân ngồi nhấn nhiều vào cơ soleus." }, order: 25 },
  { slug: "yoga-mat", name: { en: "Yoga Mat", vi: "Thảm tập" }, description: { en: "Padded mat for floor-based mobility and core exercises.", vi: "Thảm cho các bài tập sàn, mobility và core." }, order: 26 }
];

const muscleCategorySeeds: TaxonomySeed[] = [
  { slug: "chest", name: { en: "Chest", vi: "Ngực" }, description: { en: "Muscles driving horizontal pressing and chest-focused control.", vi: "Nhóm cơ tham gia nhiều vào các chuyển động đẩy ngang." }, order: 1 },
  { slug: "back", name: { en: "Back", vi: "Lưng" }, description: { en: "Upper and mid-back muscles responsible for pulling and posture.", vi: "Các nhóm cơ lưng trên và giữa phụ trách kéo và giữ tư thế." }, order: 2 },
  { slug: "shoulders", name: { en: "Shoulders", vi: "Vai" }, description: { en: "Shoulder girdle muscles that stabilize and move the arm.", vi: "Nhóm cơ vai giúp ổn định và di chuyển cánh tay." }, order: 3 },
  { slug: "arms", name: { en: "Arms", vi: "Cánh tay" }, description: { en: "Elbow flexors, extensors, and forearm support muscles.", vi: "Nhóm cơ gập, duỗi khuỷu và hỗ trợ cẳng tay." }, order: 4 },
  { slug: "core", name: { en: "Core", vi: "Core" }, description: { en: "Trunk muscles that resist movement and transfer force.", vi: "Nhóm cơ thân người giúp chống xoay và truyền lực." }, order: 5 },
  { slug: "lower-body", name: { en: "Lower Body", vi: "Thân dưới" }, description: { en: "Leg and hip muscles that squat, hinge, lunge, and jump.", vi: "Nhóm cơ chân và hông tham gia squat, hinge, lunge và bật nhảy." }, order: 6 }
];

const muscleSeeds: MuscleSeed[] = [
  { slug: "pectoralis-major", name: { en: "Pectoralis Major", vi: "Ngực lớn" }, description: { en: "Primary chest muscle for pressing and adduction.", vi: "Cơ ngực chính cho các động tác đẩy và khép tay." }, categorySlug: "chest", order: 1 },
  { slug: "pectoralis-minor", name: { en: "Pectoralis Minor", vi: "Ngực bé" }, description: { en: "Deeper chest muscle supporting scapular control.", vi: "Cơ ngực sâu hỗ trợ kiểm soát xương bả vai." }, categorySlug: "chest", order: 2 },
  { slug: "serratus-anterior", name: { en: "Serratus Anterior", vi: "Cơ răng trước" }, description: { en: "Supports scapular upward rotation and pressing quality.", vi: "Hỗ trợ xoay bả vai và chất lượng động tác đẩy." }, categorySlug: "chest", order: 3 },
  { slug: "latissimus-dorsi", name: { en: "Latissimus Dorsi", vi: "Xô" }, description: { en: "Large back muscle driving vertical and horizontal pulling.", vi: "Cơ xô lớn tham gia kéo dọc và kéo ngang." }, categorySlug: "back", order: 4 },
  { slug: "rhomboids", name: { en: "Rhomboids", vi: "Rhomboids" }, description: { en: "Mid-back muscles that retract the shoulder blades.", vi: "Nhóm cơ giữa lưng giúp kéo bả vai về sau." }, categorySlug: "back", order: 5 },
  { slug: "trapezius", name: { en: "Trapezius", vi: "Cầu vai" }, description: { en: "Upper-back muscle group for scapular movement and support.", vi: "Nhóm cơ cầu vai giúp nâng, hạ và ổn định bả vai." }, categorySlug: "back", order: 6 },
  { slug: "erector-spinae", name: { en: "Erector Spinae", vi: "Dựng sống" }, description: { en: "Posterior chain muscles that extend and stabilize the spine.", vi: "Nhóm cơ chuỗi sau giúp duỗi và ổn định cột sống." }, categorySlug: "back", order: 7 },
  { slug: "teres-major", name: { en: "Teres Major", vi: "Teres major" }, description: { en: "Small back muscle assisting shoulder extension and adduction.", vi: "Cơ nhỏ hỗ trợ duỗi và khép vai." }, categorySlug: "back", order: 8 },
  { slug: "deltoids", name: { en: "Deltoids", vi: "Vai trước giữa" }, description: { en: "Primary shoulder muscle group for pressing and raising.", vi: "Nhóm cơ vai chính cho đẩy và nâng tay." }, categorySlug: "shoulders", order: 9 },
  { slug: "rear-deltoids", name: { en: "Rear Deltoids", vi: "Vai sau" }, description: { en: "Posterior shoulder fibers important for posture and pulling balance.", vi: "Phần vai sau quan trọng cho tư thế và cân bằng kéo." }, categorySlug: "shoulders", order: 10 },
  { slug: "rotator-cuff", name: { en: "Rotator Cuff", vi: "Chóp xoay" }, description: { en: "Shoulder stabilizers that keep the joint centered.", vi: "Nhóm ổn định vai giúp khớp vai vận động an toàn." }, categorySlug: "shoulders", order: 11 },
  { slug: "biceps", name: { en: "Biceps", vi: "Bắp tay trước" }, description: { en: "Primary elbow flexors assisting many pulling patterns.", vi: "Nhóm cơ gập khuỷu tham gia mạnh trong các bài kéo." }, categorySlug: "arms", order: 12 },
  { slug: "triceps", name: { en: "Triceps", vi: "Bắp tay sau" }, description: { en: "Primary elbow extensors heavily used in pressing.", vi: "Nhóm cơ duỗi khuỷu dùng nhiều trong các bài đẩy." }, categorySlug: "arms", order: 13 },
  { slug: "forearms", name: { en: "Forearms", vi: "Cẳng tay" }, description: { en: "Grip and wrist support muscles for carries and curls.", vi: "Nhóm cơ hỗ trợ nắm, cổ tay và các bài carry." }, categorySlug: "arms", order: 14 },
  { slug: "brachialis", name: { en: "Brachialis", vi: "Brachialis" }, description: { en: "Deep elbow flexor supporting arm size and strength.", vi: "Cơ gập khuỷu sâu hỗ trợ sức mạnh và kích thước tay." }, categorySlug: "arms", order: 15 },
  { slug: "rectus-abdominis", name: { en: "Rectus Abdominis", vi: "Cơ bụng giữa" }, description: { en: "Front trunk muscle for flexion and anti-extension.", vi: "Cơ bụng trước giúp gập thân và chống ưỡn." }, categorySlug: "core", order: 16 },
  { slug: "obliques", name: { en: "Obliques", vi: "Cơ liên sườn" }, description: { en: "Side trunk muscles resisting rotation and lateral flexion.", vi: "Nhóm cơ bên hông giúp chống xoay và nghiêng." }, categorySlug: "core", order: 17 },
  { slug: "hip-flexors", name: { en: "Hip Flexors", vi: "Gập hông" }, description: { en: "Muscles lifting the knee and flexing the hip.", vi: "Nhóm cơ giúp nâng gối và gập hông." }, categorySlug: "core", order: 18 },
  { slug: "glutes", name: { en: "Glutes", vi: "Mông" }, description: { en: "Primary hip extensors involved in squat and hinge patterns.", vi: "Nhóm cơ duỗi hông chính trong squat và hinge." }, categorySlug: "lower-body", order: 19 },
  { slug: "quadriceps", name: { en: "Quadriceps", vi: "Đùi trước" }, description: { en: "Primary knee extensor group used in squatting and lunging.", vi: "Nhóm cơ duỗi gối chính trong squat và lunge." }, categorySlug: "lower-body", order: 20 },
  { slug: "hamstrings", name: { en: "Hamstrings", vi: "Đùi sau" }, description: { en: "Posterior thigh muscles important for hinging and sprinting.", vi: "Nhóm cơ đùi sau quan trọng cho hinge và chạy." }, categorySlug: "lower-body", order: 21 },
  { slug: "adductors", name: { en: "Adductors", vi: "Khép đùi" }, description: { en: "Inner-thigh muscles assisting squat depth and hip control.", vi: "Nhóm cơ đùi trong hỗ trợ độ sâu squat và kiểm soát hông." }, categorySlug: "lower-body", order: 22 },
  { slug: "calves", name: { en: "Calves", vi: "Bắp chân" }, description: { en: "Lower-leg muscles handling plantar flexion and spring.", vi: "Nhóm cơ bắp chân hỗ trợ nhón và phản lực." }, categorySlug: "lower-body", order: 23 },
  { slug: "soleus", name: { en: "Soleus", vi: "Soleus" }, description: { en: "Deep calf muscle emphasized in seated calf patterns.", vi: "Cơ bắp chân sâu được nhấn nhiều ở tư thế ngồi." }, categorySlug: "lower-body", order: 24 },
  { slug: "rectus-femoris", name: { en: "Rectus Femoris", vi: "Rectus femoris" }, description: { en: "A front-thigh muscle crossing both hip and knee joints.", vi: "Cơ đùi trước đi qua cả khớp hông và khớp gối." }, categorySlug: "lower-body", order: 25 }
];

const exerciseLevelSeeds: TaxonomySeed[] = [
  { slug: "beginner", name: { en: "Beginner", vi: "Beginner" }, description: { en: "Suitable for new lifters building coordination and technique.", vi: "Phù hợp người mới cần xây kỹ thuật và phối hợp." }, order: 1 },
  { slug: "intermediate", name: { en: "Intermediate", vi: "Intermediate" }, description: { en: "For users with stable movement quality and training rhythm.", vi: "Dành cho người đã có nhịp tập và kỹ thuật tương đối ổn." }, order: 2 },
  { slug: "advanced", name: { en: "Advanced", vi: "Advanced" }, description: { en: "For experienced trainees comfortable with higher skill demands.", vi: "Dành cho người có kinh nghiệm và kiểm soát động tác tốt." }, order: 3 }
];

const exerciseGoalSeeds: TaxonomySeed[] = [
  { slug: "strength", name: { en: "Strength", vi: "Sức mạnh" }, description: { en: "Prioritizes force production with heavier loading.", vi: "Ưu tiên tạo lực với tải nặng hơn." }, order: 1 },
  { slug: "hypertrophy", name: { en: "Hypertrophy", vi: "Tăng cơ" }, description: { en: "Designed around muscle-building volume and tension.", vi: "Thiết kế cho volume và lực căng phục vụ tăng cơ." }, order: 2 },
  { slug: "hiit", name: { en: "HIIT", vi: "HIIT" }, description: { en: "Short, intense intervals that raise heart rate quickly.", vi: "Các quãng vận động cường độ cao ngắn giúp tăng nhịp tim nhanh." }, order: 3 },
  { slug: "endurance", name: { en: "Endurance", vi: "Sức bền" }, description: { en: "Improves fatigue resistance over longer sets or circuits.", vi: "Cải thiện khả năng chịu mỏi qua set dài hoặc circuit." }, order: 4 },
  { slug: "mobility", name: { en: "Mobility", vi: "Độ linh hoạt vận động" }, description: { en: "Supports joint control, range of motion, and movement quality.", vi: "Hỗ trợ kiểm soát khớp, biên độ và chất lượng chuyển động." }, order: 5 }
];

const exerciseCategorySeeds: TaxonomySeed[] = [
  { slug: "compound", name: { en: "Compound", vi: "Compound" }, description: { en: "Multi-joint movements training many muscles together.", vi: "Bài nhiều khớp, nhiều nhóm cơ cùng tham gia." }, order: 1 },
  { slug: "isolation", name: { en: "Isolation", vi: "Isolation" }, description: { en: "More targeted movements emphasizing one major area.", vi: "Bài tập cô lập, nhấn nhiều vào một vùng cơ chính." }, order: 2 },
  { slug: "isometric", name: { en: "Isometric", vi: "Isometric" }, description: { en: "Static holds without obvious joint travel.", vi: "Giữ tĩnh mà không di chuyển khớp nhiều." }, order: 3 },
  { slug: "plyometric", name: { en: "Plyometric", vi: "Plyometric" }, description: { en: "Explosive drills that build speed and elastic power.", vi: "Các bài bùng nổ giúp tăng tốc độ và sức bật." }, order: 4 },
  { slug: "cardio", name: { en: "Cardio", vi: "Cardio" }, description: { en: "Conditioning movements raising breathing demand and heart rate.", vi: "Các bài tăng nhu cầu tim mạch và hô hấp." }, order: 5 },
  { slug: "mobility", name: { en: "Mobility", vi: "Mobility" }, description: { en: "Movement quality drills with control and range of motion.", vi: "Các bài tăng chất lượng vận động và biên độ." }, order: 6 }
];

const equipmentAliasMap = new Map<string, string>([
  ["barbell", "barbell"],
  ["dumbbell", "dumbbell"],
  ["dumbbells", "dumbbell"],
  ["body_only", "body-weight"],
  ["none", "body-weight"],
  ["parallel bars", "parallel-bars"],
  ["pull-up bar", "pull-up-bar"],
  ["cable", "cable-machine"],
  ["cable machine", "cable-machine"],
  ["lat pulldown machine", "lat-pulldown-machine"],
  ["leg press machine", "leg-press-machine"],
  ["machine", "machine"],
  ["pec deck machine", "pec-deck-machine"],
  ["leg curl machine", "leg-curl-machine"],
  ["leg extension machine", "leg-extension-machine"],
  ["calf raise machine", "calf-raise-machine"],
  ["seated calf raise machine", "seated-calf-raise-machine"],
  ["medicine ball", "medicine-ball"],
  ["battle ropes", "battle-ropes"],
  ["kettlebell", "kettlebell"],
  ["trx", "trx"],
  ["plyo box", "plyo-box"],
  ["e-z_curl_bar", "ez-curl-bar"],
]);

const muscleAliasMap = new Map<string, string[]>([
  ["chest", ["pectoralis-major"]],
  ["triceps", ["triceps"]],
  ["shoulders", ["deltoids"]],
  ["back", ["latissimus-dorsi"]],
  ["biceps", ["biceps"]],
  ["core", ["rectus-abdominis"]],
  ["obliques", ["obliques"]],
  ["quadriceps", ["quadriceps"]],
  ["hamstrings", ["hamstrings"]],
  ["glutes", ["glutes"]],
  ["calves", ["calves"]],
  ["traps", ["trapezius"]],
  ["upper back", ["rhomboids", "trapezius"]],
  ["legs", ["quadriceps", "glutes"]],
  ["full body", ["quadriceps", "glutes", "pectoralis-major", "latissimus-dorsi"]],
  ["abs", ["rectus-abdominis"]]
]);

function unique<T>(values: T[]) {
  return [...new Set(values)];
}

function getLocalizedEquipmentName(slug: string) {
  const found = equipmentSeeds.find((item) => item.slug === slug);
  return found?.name ?? { en: slug, vi: slug };
}

function getLocalizedMuscleNames(slugs: string[]) {
  return slugs
    .map((slug) => muscleSeeds.find((item) => item.slug === slug)?.name)
    .filter(Boolean) as LocalizedString[];
}

function localizedJoin(values: LocalizedString[]) {
  return {
    en: values.map((value) => value.en).join(", "),
    vi: values.map((value) => value.vi).join(", "),
  };
}

function titleizeSlug(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function normalizeAlias(value: string) {
  return value.trim().toLowerCase();
}

function buildAliases(...values: Array<string | undefined>) {
  return unique(
    values
      .flatMap((value) => (value ? [value] : []))
      .map((value) => normalizeAlias(value))
      .filter(Boolean),
  );
}

function getMuscleCategorySlug(muscleSlug: string) {
  return muscleSeeds.find((item) => item.slug === muscleSlug)?.categorySlug;
}

function deriveMuscleCategorySlugs(muscleSlugs: string[]) {
  return unique(
    muscleSlugs
      .map((slug) => getMuscleCategorySlug(slug))
      .filter(Boolean) as string[],
  );
}

function deriveMovementPattern(name: string, categorySlugs: string[]) {
  const label = `${name} ${categorySlugs.join(" ")}`.toLowerCase();

  if (/plank|hold|pallof|dead bug|bird dog/.test(label)) {
    return "stability";
  }
  if (/carry/.test(label)) {
    return "carry";
  }
  if (/ab wheel|crunch|twist|wood chop|woodchop|leg raise|knee raise/.test(label)) {
    return "core-dynamic";
  }
  if (/burpee|jump|rope|slam|swing/.test(label) || categorySlugs.includes("cardio") || categorySlugs.includes("plyometric")) {
    return "conditioning";
  }
  if (/calf/.test(label)) {
    return "calf";
  }
  if (/lunge|split squat|step up/.test(label)) {
    return "lunge";
  }
  if (/deadlift|hinge|good morning|romanian|hip thrust|glute bridge|bridge/.test(label)) {
    return "hinge";
  }
  if (/squat|leg press|hack squat/.test(label)) {
    return "squat";
  }
  if (/curl|hammer/.test(label)) {
    return "curl";
  }
  if (/pushdown|extension|skullcrusher|kickback|tricep/.test(label)) {
    return "extension";
  }
  if (/raise|arnold|upright row/.test(label)) {
    return "raise";
  }
  if (/pull-up|chin-up|pulldown|lat pulldown/.test(label)) {
    return "vertical-pull";
  }
  if (/row|face pull/.test(label)) {
    return "row";
  }
  if (/fly/.test(label)) {
    return "fly";
  }
  if (/bench|press|push-up|dip/.test(label)) {
    return "press";
  }

  return "general";
}

function buildGenericSteps(name: LocalizedString, equipmentName: LocalizedString) {
  return [
    {
      en: `Set up with the ${equipmentName.en.toLowerCase()} and align your body before the first rep of ${name.en}.`,
      vi: `Chuẩn bị ${equipmentName.vi.toLowerCase()} và canh tư thế trước rep đầu của bài ${name.vi}.`,
    },
    {
      en: `Move with control, keep tension on the target muscles, and avoid rushing through the hardest range.`,
      vi: `Di chuyển có kiểm soát, giữ lực vào nhóm cơ chính và không vội ở đoạn khó nhất.`,
    },
    {
      en: `Finish the rep cleanly, reset your brace, then repeat with the same tempo for each set.`,
      vi: `Kết thúc rep gọn, siết core lại rồi lặp tiếp với nhịp ổn định cho từng set.`,
    },
  ];
}

function buildManualDescription(name: LocalizedString, equipmentSlug: string, primaryMuscles: string[]) {
  const equipmentName = getLocalizedEquipmentName(equipmentSlug);
  const muscles = localizedJoin(getLocalizedMuscleNames(primaryMuscles));
  return {
    en: `${name.en} is a ${equipmentName.en.toLowerCase()} exercise that emphasizes ${muscles.en.toLowerCase()} while fitting cleanly into a structured workout session.`,
    vi: `${name.vi} là bài tập với ${equipmentName.vi.toLowerCase()} nhấn mạnh vào ${muscles.vi.toLowerCase()} và phù hợp để đưa vào buổi tập có cấu trúc rõ ràng.`,
  };
}

function normalizeEquipment(input: string | undefined) {
  if (!input) {
    return "body-weight";
  }

  return equipmentAliasMap.get(String(input).trim().toLowerCase()) ?? "body-weight";
}

function normalizeMuscles(input: string | string[] | undefined) {
  const values = Array.isArray(input) ? input : input ? [input] : [];

  return unique(
    values.flatMap((value) => muscleAliasMap.get(String(value).trim().toLowerCase()) ?? []),
  );
}

function getTaxonomyAliasesForSlug(aliasMap: Map<string, string>, slug: string, extras: string[] = []) {
  const derived = [...aliasMap.entries()]
    .filter(([, canonicalSlug]) => canonicalSlug === slug)
    .map(([alias]) => alias.replaceAll("_", " "));

  return buildAliases(slug.replaceAll("-", " "), titleizeSlug(slug), ...derived, ...extras);
}

function getMuscleAliasesForSlug(slug: string) {
  const derived = [...muscleAliasMap.entries()]
    .filter(([, canonicalSlugs]) => canonicalSlugs.includes(slug))
    .map(([alias]) => alias);

  return buildAliases(slug.replaceAll("-", " "), titleizeSlug(slug), ...derived);
}

function deriveCategorySlugs(record: RawExerciseRecord, primaryMuscleSlugs: string[]) {
  const label = `${record.name} ${record.type ?? ""}`.toLowerCase();
  if (/plank|hold|pallof/.test(label)) {
    return ["isometric"];
  }
  if (/jump|box|burpee/.test(label)) {
    return ["plyometric"];
  }
  if (/mountain climber|rope|slam|swing/.test(label)) {
    return ["cardio"];
  }
  if (primaryMuscleSlugs.length > 1 || /press|row|squat|deadlift|lunge|pull-up|dip/.test(label)) {
    return ["compound"];
  }
  return ["isolation"];
}

function deriveGoalSlugs(record: RawExerciseRecord, categorySlugs: string[]) {
  const label = record.name.toLowerCase();
  if (categorySlugs.includes("cardio") || categorySlugs.includes("plyometric")) {
    return ["hiit", "endurance"];
  }
  if (/plank|hold|carry/.test(label)) {
    return ["endurance"];
  }
  if (record.difficulty?.toLowerCase() === "advanced" && /barbell|deadlift|squat/.test(label)) {
    return ["strength"];
  }
  return ["hypertrophy"];
}

function buildRawInstructions(record: RawExerciseRecord, localizedName: LocalizedString) {
  if (record.instructions) {
    const steps = record.instructions
      .split(". ")
      .map((part) => part.trim())
      .filter((part) => part.length > 20)
      .slice(0, 3);

    if (steps.length) {
      return steps.map((step) => ({
        en: step.endsWith(".") ? step : `${step}.`,
        vi: `Thực hiện ${localizedName.vi.toLowerCase()} với kiểm soát và chú ý: ${step
          .replace(/\.$/, "")
          .toLowerCase()}.`,
      }));
    }
  }

  return buildGenericSteps(localizedName, getLocalizedEquipmentName(normalizeEquipment(record.equipment)));
}

function buildRawExerciseSeeds() {
  const typedRecords = rawExercises as RawExerciseRecord[];
  const bySlug = new Map<string, BuiltExerciseSeed>();

  for (const record of typedRecords) {
    const slug = slugify(record.name);
    if (bySlug.has(slug)) {
      continue;
    }

    const equipmentSlug = normalizeEquipment(record.equipment);
    const primaryMuscleSlugs = normalizeMuscles(record.muscles_targeted ?? record.muscle);
    const categorySlugs = deriveCategorySlugs(record, primaryMuscleSlugs);
    const movementPattern = deriveMovementPattern(record.name, categorySlugs);
    const localizedName = {
      en: record.name,
      vi: record.name,
    };

    const descriptionEn = record.description?.trim() || `${record.name} helps build controlled strength and movement confidence.`;
    const media = getExerciseMedia(slug);

    bySlug.set(slug, {
      slug,
      name: localizedName,
      description: {
        en: descriptionEn,
        vi: `Bài ${record.name} giúp xây nền chuyển động và kiểm soát lực tốt hơn trong tập luyện.`,
      },
      instructionSteps: buildRawInstructions(record, localizedName),
      imageUrl: media.thumbnailUrl,
      imageAlt: {
        en: `Exercise image for ${record.name}`,
        vi: `Ảnh bài tập cho ${record.name}`,
      },
      media,
      aliases: buildAliases(record.name, titleizeSlug(slug), slug.replaceAll("-", " ")),
      primaryEquipmentSlug: equipmentSlug,
      equipmentSlugs: [equipmentSlug],
      primaryMuscleSlugs: primaryMuscleSlugs.length ? [primaryMuscleSlugs[0]] : ["rectus-abdominis"],
      secondaryMuscleSlugs: primaryMuscleSlugs.slice(1),
      muscleCategorySlugs: deriveMuscleCategorySlugs(
        primaryMuscleSlugs.length ? primaryMuscleSlugs : ["rectus-abdominis"],
      ),
      goalSlugs: deriveGoalSlugs(record, categorySlugs),
      levelSlug: record.difficulty?.toLowerCase() || "beginner",
      categorySlugs,
      movementPattern,
      source: "FITATE_IMPORT",
      sourceUrl: "",
      reviewStatus: "APPROVED",
    });
  }

  return [...bySlug.values()];
}

function buildManualExerciseSeeds() {
  return manualExerciseSeeds.map((record) => {
    const slug = slugify(record.nameEn);
    const localizedName = {
      en: record.nameEn,
      vi: record.nameVi,
    };
    const media = getExerciseMedia(slug);

    return {
      slug,
      name: localizedName,
      description: buildManualDescription(localizedName, record.equipmentSlug, record.primaryMuscles),
      instructionSteps: buildGenericSteps(localizedName, getLocalizedEquipmentName(record.equipmentSlug)),
      imageUrl: media.thumbnailUrl,
      imageAlt: {
        en: `Exercise image for ${record.nameEn}`,
        vi: `Ảnh bài tập cho ${record.nameVi}`,
      },
      media,
      aliases: buildAliases(record.nameEn, record.nameVi, titleizeSlug(slug), slug.replaceAll("-", " ")),
      primaryEquipmentSlug: record.equipmentSlug,
      equipmentSlugs: [record.equipmentSlug],
      primaryMuscleSlugs: record.primaryMuscles,
      secondaryMuscleSlugs: record.secondaryMuscles ?? [],
      muscleCategorySlugs: deriveMuscleCategorySlugs(record.primaryMuscles),
      goalSlugs: record.goalSlugs,
      levelSlug: record.levelSlug,
      categorySlugs: record.categorySlugs,
      movementPattern: deriveMovementPattern(record.nameEn, record.categorySlugs),
      source: "INTERNAL_CURATION",
      sourceUrl: NASM_SOURCE,
      reviewStatus: "APPROVED" as const,
    };
  });
}

function mergeExerciseSeeds() {
  const all = [...buildRawExerciseSeeds(), ...buildManualExerciseSeeds()];
  const bySlug = new Map<string, BuiltExerciseSeed>();

  for (const item of all) {
    const existing = bySlug.get(item.slug);
    if (!existing || (existing.source !== "INTERNAL_CURATION" && item.source === "INTERNAL_CURATION")) {
      bySlug.set(item.slug, item);
    }
  }

  return [...bySlug.values()];
}

export function getSystemTaxonomy() {
  const fitateEquipment = rawEquipment as Array<{ name: string; description: string }>;
  const fitateGoals = rawExerciseGoal as Array<{ name: string; description: string }>;
  const fitateCategories = rawExerciseCategories as Array<{ name: string; description: string }>;
  const kinisMuscles = rawMuscles as Array<{ name: string; description: string }>;

  return {
    equipments: equipmentSeeds.map((seed) => {
      const raw = fitateEquipment.find((item) => slugify(item.name) === seed.slug);
      const base = raw
        ? {
            ...seed,
            description: {
              en: raw.description,
              vi: seed.description.vi,
            },
          }
        : seed;

      return {
        ...base,
        imageUrl: getEquipmentImage(seed.slug).imageUrl,
        aliases: getTaxonomyAliasesForSlug(equipmentAliasMap, seed.slug),
      };
    }),
    muscleCategories: muscleCategorySeeds.map((seed) => ({
      ...seed,
      aliases: buildAliases(seed.slug.replaceAll("-", " "), seed.name.en, seed.name.vi),
    })),
    muscles: muscleSeeds.map((seed) => {
      const raw = kinisMuscles.find((item) => slugify(item.name) === seed.slug);
      const base = raw
        ? {
            ...seed,
            description: {
              en: raw.description,
              vi: seed.description.vi,
            },
          }
        : seed;

      return {
        ...base,
        imageUrl: getMuscleImage(seed.slug).imageUrl,
        aliases: getMuscleAliasesForSlug(seed.slug),
      };
    }),
    exerciseLevels: exerciseLevelSeeds.map((seed) => ({
      ...seed,
      aliases: buildAliases(seed.name.en, seed.name.vi, ...(levelAliasMap.get(seed.slug) ?? [])),
    })),
    exerciseGoals: exerciseGoalSeeds.map((seed) => {
      const raw = fitateGoals.find((item) => slugify(item.name) === seed.slug);
      const base = raw
        ? {
            ...seed,
            description: {
              en: raw.description,
              vi: seed.description.vi,
            },
          }
        : seed;

      return {
        ...base,
        aliases: buildAliases(seed.name.en, seed.name.vi, ...(goalAliasMap.get(seed.slug) ?? [])),
      };
    }),
    exerciseCategories: exerciseCategorySeeds.map((seed) => {
      const raw = fitateCategories.find((item) => slugify(item.name) === seed.slug);
      const base = raw
        ? {
            ...seed,
            description: {
              en: raw.description,
              vi: seed.description.vi,
            },
          }
        : seed;

      return {
        ...base,
        aliases: buildAliases(seed.name.en, seed.name.vi, ...(categoryAliasMap.get(seed.slug) ?? [])),
      };
    }),
  };
}

export function getSystemExercises() {
  return mergeExerciseSeeds();
}

export function getSystemSessionDrafts(): WorkoutSessionDraft[] {
  return systemSessionDrafts;
}

export function getSystemPlanDrafts(): WorkoutPlanDraft[] {
  return systemPlanDrafts;
}

export function getSystemSeedSummary() {
  const exercises = getSystemExercises();
  const mediaManifest = getExerciseMediaManifest();
  const anatomyCount = Object.values(mediaManifest).filter((item) => item.style === "ANATOMY").length;

  return {
    approvedExerciseCount: exercises.filter((item) => item.reviewStatus === "APPROVED").length,
    anatomyMediaCount: anatomyCount,
    sessionTemplateCount: systemSessionDrafts.length,
    planTemplateCount: systemPlanDrafts.length,
  };
}
