import type { WorkoutPlanDraft, WorkoutSessionDraft } from "@/types/domain";

export const systemSessionDrafts: WorkoutSessionDraft[] = [
  {
    slug: "full-body-foundation-a",
    title: { en: "Full Body Foundation A", vi: "Toàn thân nền tảng A" },
    description: {
      en: "A balanced beginner workout with squat, press, row, and core work.",
      vi: "Buổi tập beginner cân bằng với squat, đẩy, kéo và core.",
    },
    entries: [
      { exerciseSlug: "goblet-squat", sets: [{ order: 1, repsTarget: 12, restSec: 75 }, { order: 2, repsTarget: 12, restSec: 75 }, { order: 3, repsTarget: 10, restSec: 90 }] },
      { exerciseSlug: "flat-dumbbell-press", sets: [{ order: 1, repsTarget: 12, restSec: 75 }, { order: 2, repsTarget: 10, restSec: 75 }, { order: 3, repsTarget: 10, restSec: 90 }] },
      { exerciseSlug: "neutral-grip-seated-row", sets: [{ order: 1, repsTarget: 12, restSec: 75 }, { order: 2, repsTarget: 12, restSec: 75 }, { order: 3, repsTarget: 10, restSec: 90 }] },
      { exerciseSlug: "glute-bridge", sets: [{ order: 1, repsTarget: 15, restSec: 45 }, { order: 2, repsTarget: 15, restSec: 45 }, { order: 3, repsTarget: 15, restSec: 60 }] },
      { exerciseSlug: "dead-bug", sets: [{ order: 1, repsTarget: 12, restSec: 30 }, { order: 2, repsTarget: 12, restSec: 30 }, { order: 3, repsTarget: 12, restSec: 30 }] }
    ]
  },
  {
    slug: "full-body-foundation-b",
    title: { en: "Full Body Foundation B", vi: "Toàn thân nền tảng B" },
    description: {
      en: "A second full-body day focused on hinge, pull, and shoulder stability.",
      vi: "Ngày toàn thân thứ hai tập trung vào hinge, kéo và ổn định vai.",
    },
    entries: [
      { exerciseSlug: "romanian-deadlift", sets: [{ order: 1, repsTarget: 10, restSec: 90 }, { order: 2, repsTarget: 10, restSec: 90 }, { order: 3, repsTarget: 8, restSec: 120 }] },
      { exerciseSlug: "trx-row", sets: [{ order: 1, repsTarget: 12, restSec: 60 }, { order: 2, repsTarget: 12, restSec: 60 }, { order: 3, repsTarget: 10, restSec: 75 }] },
      { exerciseSlug: "arnold-press", sets: [{ order: 1, repsTarget: 12, restSec: 75 }, { order: 2, repsTarget: 10, restSec: 75 }, { order: 3, repsTarget: 10, restSec: 75 }] },
      { exerciseSlug: "step-up", sets: [{ order: 1, repsTarget: 10, restSec: 60 }, { order: 2, repsTarget: 10, restSec: 60 }, { order: 3, repsTarget: 10, restSec: 60 }] },
      { exerciseSlug: "pallof-press", sets: [{ order: 1, repsTarget: 12, restSec: 30 }, { order: 2, repsTarget: 12, restSec: 30 }, { order: 3, repsTarget: 12, restSec: 30 }] }
    ]
  },
  {
    slug: "push-hypertrophy",
    title: { en: "Push Hypertrophy", vi: "Push hypertrophy" },
    description: { en: "Chest, shoulders, and triceps volume with stable rest windows.", vi: "Volume cho ngực, vai và tay sau với thời gian nghỉ ổn định." },
    entries: [
      { exerciseSlug: "incline-barbell-bench-press", sets: [{ order: 1, repsTarget: 10, restSec: 90 }, { order: 2, repsTarget: 8, restSec: 90 }, { order: 3, repsTarget: 8, restSec: 120 }] },
      { exerciseSlug: "machine-chest-press", sets: [{ order: 1, repsTarget: 12, restSec: 75 }, { order: 2, repsTarget: 12, restSec: 75 }, { order: 3, repsTarget: 10, restSec: 90 }] },
      { exerciseSlug: "cable-lateral-raise", sets: [{ order: 1, repsTarget: 15, restSec: 45 }, { order: 2, repsTarget: 15, restSec: 45 }, { order: 3, repsTarget: 12, restSec: 45 }] },
      { exerciseSlug: "rope-pushdown", sets: [{ order: 1, repsTarget: 15, restSec: 45 }, { order: 2, repsTarget: 12, restSec: 45 }, { order: 3, repsTarget: 12, restSec: 45 }] }
    ]
  },
  {
    slug: "pull-hypertrophy",
    title: { en: "Pull Hypertrophy", vi: "Pull hypertrophy" },
    description: { en: "Back width, mid-back density, and biceps support work.", vi: "Tập trung độ rộng lưng, lưng giữa và biceps hỗ trợ." },
    entries: [
      { exerciseSlug: "single-arm-lat-pulldown", sets: [{ order: 1, repsTarget: 12, restSec: 75 }, { order: 2, repsTarget: 12, restSec: 75 }, { order: 3, repsTarget: 10, restSec: 90 }] },
      { exerciseSlug: "chest-supported-row", sets: [{ order: 1, repsTarget: 12, restSec: 75 }, { order: 2, repsTarget: 10, restSec: 75 }, { order: 3, repsTarget: 10, restSec: 90 }] },
      { exerciseSlug: "face-pull", sets: [{ order: 1, repsTarget: 15, restSec: 45 }, { order: 2, repsTarget: 15, restSec: 45 }, { order: 3, repsTarget: 12, restSec: 45 }] },
      { exerciseSlug: "ez-bar-curl", sets: [{ order: 1, repsTarget: 12, restSec: 45 }, { order: 2, repsTarget: 10, restSec: 45 }, { order: 3, repsTarget: 10, restSec: 45 }] }
    ]
  },
  {
    slug: "legs-hypertrophy",
    title: { en: "Legs Hypertrophy", vi: "Legs hypertrophy" },
    description: { en: "A lower-body session built around quad, glute, and hamstring volume.", vi: "Buổi lower body tập trung volume đùi trước, mông và đùi sau." },
    entries: [
      { exerciseSlug: "hack-squat", sets: [{ order: 1, repsTarget: 10, restSec: 90 }, { order: 2, repsTarget: 10, restSec: 90 }, { order: 3, repsTarget: 8, restSec: 120 }] },
      { exerciseSlug: "walking-lunge", sets: [{ order: 1, repsTarget: 12, restSec: 60 }, { order: 2, repsTarget: 12, restSec: 60 }, { order: 3, repsTarget: 10, restSec: 75 }] },
      { exerciseSlug: "seated-leg-curl", sets: [{ order: 1, repsTarget: 15, restSec: 45 }, { order: 2, repsTarget: 12, restSec: 45 }, { order: 3, repsTarget: 12, restSec: 45 }] },
      { exerciseSlug: "machine-leg-extension-pause", sets: [{ order: 1, repsTarget: 15, restSec: 45 }, { order: 2, repsTarget: 15, restSec: 45 }, { order: 3, repsTarget: 12, restSec: 45 }] }
    ]
  },
  {
    slug: "upper-strength",
    title: { en: "Upper Strength", vi: "Upper strength" },
    description: { en: "Heavier upper-body session focused on strength expression.", vi: "Buổi upper nặng hơn để ưu tiên sức mạnh." },
    entries: [
      { exerciseSlug: "close-grip-bench-press", sets: [{ order: 1, repsTarget: 6, restSec: 120 }, { order: 2, repsTarget: 6, restSec: 120 }, { order: 3, repsTarget: 5, restSec: 150 }] },
      { exerciseSlug: "pendlay-row", sets: [{ order: 1, repsTarget: 6, restSec: 120 }, { order: 2, repsTarget: 6, restSec: 120 }, { order: 3, repsTarget: 5, restSec: 150 }] },
      { exerciseSlug: "landmine-press", sets: [{ order: 1, repsTarget: 8, restSec: 90 }, { order: 2, repsTarget: 8, restSec: 90 }, { order: 3, repsTarget: 6, restSec: 105 }] },
      { exerciseSlug: "reverse-curl", sets: [{ order: 1, repsTarget: 12, restSec: 45 }, { order: 2, repsTarget: 12, restSec: 45 }, { order: 3, repsTarget: 10, restSec: 45 }] }
    ]
  },
  {
    slug: "lower-strength",
    title: { en: "Lower Strength", vi: "Lower strength" },
    description: { en: "A lower-body day emphasizing strength with a controlled accessory finish.", vi: "Buổi lower ưu tiên sức mạnh kèm phụ trợ có kiểm soát." },
    entries: [
      { exerciseSlug: "front-squat", sets: [{ order: 1, repsTarget: 6, restSec: 120 }, { order: 2, repsTarget: 6, restSec: 120 }, { order: 3, repsTarget: 5, restSec: 150 }] },
      { exerciseSlug: "sumo-deadlift", sets: [{ order: 1, repsTarget: 5, restSec: 150 }, { order: 2, repsTarget: 5, restSec: 150 }, { order: 3, repsTarget: 4, restSec: 150 }] },
      { exerciseSlug: "hip-thrust", sets: [{ order: 1, repsTarget: 8, restSec: 90 }, { order: 2, repsTarget: 8, restSec: 90 }, { order: 3, repsTarget: 8, restSec: 90 }] },
      { exerciseSlug: "standing-calf-raise-on-step", sets: [{ order: 1, repsTarget: 18, restSec: 45 }, { order: 2, repsTarget: 18, restSec: 45 }, { order: 3, repsTarget: 15, restSec: 45 }] }
    ]
  },
  {
    slug: "home-conditioning",
    title: { en: "Home Conditioning", vi: "Conditioning tại nhà" },
    description: { en: "Fast bodyweight and light-equipment conditioning circuit for busy days.", vi: "Circuit bodyweight và dụng cụ nhẹ cho những ngày bận." },
    entries: [
      { exerciseSlug: "mountain-climber", sets: [{ order: 1, repsTarget: 20, restSec: 20 }, { order: 2, repsTarget: 20, restSec: 20 }, { order: 3, repsTarget: 20, restSec: 30 }] },
      { exerciseSlug: "burpee", sets: [{ order: 1, repsTarget: 12, restSec: 30 }, { order: 2, repsTarget: 12, restSec: 30 }, { order: 3, repsTarget: 10, restSec: 45 }] },
      { exerciseSlug: "glute-bridge", sets: [{ order: 1, repsTarget: 20, restSec: 30 }, { order: 2, repsTarget: 20, restSec: 30 }, { order: 3, repsTarget: 20, restSec: 30 }] },
      { exerciseSlug: "side-plank-reach", sets: [{ order: 1, repsTarget: 12, restSec: 20 }, { order: 2, repsTarget: 12, restSec: 20 }, { order: 3, repsTarget: 12, restSec: 20 }] }
    ]
  },
  {
    slug: "dumbbell-upper",
    title: { en: "Dumbbell Upper", vi: "Upper với tạ đơn" },
    description: { en: "A practical upper day when dumbbells are your main tool.", vi: "Buổi upper thực dụng khi dụng cụ chính là tạ đơn." },
    entries: [
      { exerciseSlug: "flat-dumbbell-press", sets: [{ order: 1, repsTarget: 10, restSec: 75 }, { order: 2, repsTarget: 10, restSec: 75 }, { order: 3, repsTarget: 8, restSec: 90 }] },
      { exerciseSlug: "renegade-row", sets: [{ order: 1, repsTarget: 8, restSec: 75 }, { order: 2, repsTarget: 8, restSec: 75 }, { order: 3, repsTarget: 8, restSec: 75 }] },
      { exerciseSlug: "arnold-press", sets: [{ order: 1, repsTarget: 12, restSec: 60 }, { order: 2, repsTarget: 10, restSec: 60 }, { order: 3, repsTarget: 10, restSec: 60 }] },
      { exerciseSlug: "cross-body-hammer-curl", sets: [{ order: 1, repsTarget: 12, restSec: 45 }, { order: 2, repsTarget: 12, restSec: 45 }, { order: 3, repsTarget: 10, restSec: 45 }] }
    ]
  },
  {
    slug: "dumbbell-lower",
    title: { en: "Dumbbell Lower", vi: "Lower với tạ đơn" },
    description: { en: "A lower-body session that stays effective with only dumbbells and a bench.", vi: "Buổi lower vẫn hiệu quả chỉ với tạ đơn và ghế." },
    entries: [
      { exerciseSlug: "goblet-squat", sets: [{ order: 1, repsTarget: 12, restSec: 75 }, { order: 2, repsTarget: 12, restSec: 75 }, { order: 3, repsTarget: 10, restSec: 90 }] },
      { exerciseSlug: "bulgarian-split-squat", sets: [{ order: 1, repsTarget: 10, restSec: 60 }, { order: 2, repsTarget: 10, restSec: 60 }, { order: 3, repsTarget: 10, restSec: 60 }] },
      { exerciseSlug: "romanian-deadlift", sets: [{ order: 1, repsTarget: 10, restSec: 90 }, { order: 2, repsTarget: 10, restSec: 90 }, { order: 3, repsTarget: 8, restSec: 90 }] },
      { exerciseSlug: "single-leg-glute-bridge", sets: [{ order: 1, repsTarget: 15, restSec: 30 }, { order: 2, repsTarget: 15, restSec: 30 }, { order: 3, repsTarget: 12, restSec: 30 }] }
    ]
  },
  {
    slug: "core-conditioning",
    title: { en: "Core Conditioning", vi: "Core conditioning" },
    description: { en: "A short but focused core session to slot between heavier days.", vi: "Buổi core ngắn nhưng tập trung để xen giữa các ngày nặng." },
    entries: [
      { exerciseSlug: "ab-wheel-rollout", sets: [{ order: 1, repsTarget: 8, restSec: 45 }, { order: 2, repsTarget: 8, restSec: 45 }, { order: 3, repsTarget: 6, restSec: 60 }] },
      { exerciseSlug: "hanging-knee-raise", sets: [{ order: 1, repsTarget: 12, restSec: 30 }, { order: 2, repsTarget: 12, restSec: 30 }, { order: 3, repsTarget: 10, restSec: 30 }] },
      { exerciseSlug: "suitcase-carry", sets: [{ order: 1, repsTarget: 12, restSec: 30 }, { order: 2, repsTarget: 12, restSec: 30 }, { order: 3, repsTarget: 12, restSec: 30 }] },
      { exerciseSlug: "bird-dog", sets: [{ order: 1, repsTarget: 12, restSec: 20 }, { order: 2, repsTarget: 12, restSec: 20 }, { order: 3, repsTarget: 12, restSec: 20 }] }
    ]
  }
];

export const systemPlanDrafts: WorkoutPlanDraft[] = [
  {
    slug: "beginner-reset-2-day",
    title: { en: "Beginner Reset 2-Day", vi: "Beginner Reset 2 buổi" },
    description: { en: "Two balanced full-body sessions each week for new lifters.", vi: "Hai buổi toàn thân mỗi tuần cho người mới bắt đầu." },
    levelSlug: "beginner",
    goalSlug: "strength",
    sessions: [
      { weekday: 1, time: "06:30", sessionSlug: "full-body-foundation-a" },
      { weekday: 4, time: "06:30", sessionSlug: "full-body-foundation-b" }
    ],
    sourceUrl: "https://www.acsm.org/wp-content/uploads/2025/01/Progression-Models-in-Resistance-Training-for-Healthy-Adults.pdf"
  },
  {
    slug: "beginner-gym-3-day",
    title: { en: "Beginner Gym 3-Day", vi: "Beginner Gym 3 buổi" },
    description: { en: "A practical three-day rhythm to build consistency and technique.", vi: "Nhịp tập ba buổi thực dụng để xây nền kỹ thuật và thói quen." },
    levelSlug: "beginner",
    goalSlug: "hypertrophy",
    sessions: [
      { weekday: 1, time: "06:30", sessionSlug: "full-body-foundation-a" },
      { weekday: 3, time: "06:30", sessionSlug: "full-body-foundation-b" },
      { weekday: 5, time: "06:30", sessionSlug: "core-conditioning" }
    ]
  },
  {
    slug: "push-pull-legs-classic",
    title: { en: "Push Pull Legs Classic", vi: "Push Pull Legs cổ điển" },
    description: { en: "A classic three-day split for hypertrophy with easy weekly repeat.", vi: "Split ba ngày cổ điển cho hypertrophy và lặp tuần gọn." },
    levelSlug: "intermediate",
    goalSlug: "hypertrophy",
    sessions: [
      { weekday: 1, time: "06:30", sessionSlug: "push-hypertrophy" },
      { weekday: 3, time: "06:30", sessionSlug: "pull-hypertrophy" },
      { weekday: 5, time: "06:30", sessionSlug: "legs-hypertrophy" }
    ]
  },
  {
    slug: "upper-lower-strength",
    title: { en: "Upper Lower Strength", vi: "Upper Lower sức mạnh" },
    description: { en: "Four-day upper-lower split focused on heavier sets and clean progression.", vi: "Split upper-lower bốn buổi tập trung set nặng và tiến độ rõ ràng." },
    levelSlug: "intermediate",
    goalSlug: "strength",
    sessions: [
      { weekday: 1, time: "06:30", sessionSlug: "upper-strength" },
      { weekday: 2, time: "06:30", sessionSlug: "lower-strength" },
      { weekday: 4, time: "06:30", sessionSlug: "dumbbell-upper" },
      { weekday: 5, time: "06:30", sessionSlug: "dumbbell-lower" }
    ]
  },
  {
    slug: "home-fat-loss-3-day",
    title: { en: "Home Fat-Loss 3-Day", vi: "Giảm mỡ tại nhà 3 buổi" },
    description: { en: "A bodyweight-first conditioning plan for busy schedules.", vi: "Plan bodyweight ưu tiên điều kiện bận rộn và tập tại nhà." },
    levelSlug: "beginner",
    goalSlug: "hiit",
    sessions: [
      { weekday: 2, time: "06:30", sessionSlug: "home-conditioning" },
      { weekday: 4, time: "06:30", sessionSlug: "core-conditioning" },
      { weekday: 6, time: "06:30", sessionSlug: "home-conditioning" }
    ]
  },
  {
    slug: "dumbbell-only-4-day",
    title: { en: "Dumbbell Only 4-Day", vi: "4 buổi chỉ dùng tạ đơn" },
    description: { en: "A structured dumbbell-only plan for travel or compact home setups.", vi: "Plan có cấu trúc chỉ dùng tạ đơn cho nhà nhỏ hoặc đi công tác." },
    levelSlug: "intermediate",
    goalSlug: "hypertrophy",
    sessions: [
      { weekday: 1, time: "06:30", sessionSlug: "dumbbell-upper" },
      { weekday: 2, time: "06:30", sessionSlug: "dumbbell-lower" },
      { weekday: 4, time: "06:30", sessionSlug: "dumbbell-upper" },
      { weekday: 6, time: "06:30", sessionSlug: "core-conditioning" }
    ]
  },
  {
    slug: "lean-recomp-3-day",
    title: { en: "Lean Recomp 3-Day", vi: "Lean recomp 3 buổi" },
    description: { en: "Balanced hypertrophy and conditioning for steady body recomposition.", vi: "Cân bằng hypertrophy và conditioning để tái cấu trúc cơ thể ổn định." },
    levelSlug: "intermediate",
    goalSlug: "hypertrophy",
    sessions: [
      { weekday: 1, time: "06:30", sessionSlug: "push-hypertrophy" },
      { weekday: 3, time: "06:30", sessionSlug: "legs-hypertrophy" },
      { weekday: 6, time: "06:30", sessionSlug: "home-conditioning" }
    ]
  },
  {
    slug: "back-and-core-focus",
    title: { en: "Back and Core Focus", vi: "Tập trung lưng và core" },
    description: { en: "Three weekly sessions prioritizing posture, pull strength, and trunk stability.", vi: "Ba buổi mỗi tuần ưu tiên tư thế, sức kéo và ổn định thân người." },
    levelSlug: "beginner",
    goalSlug: "strength",
    sessions: [
      { weekday: 1, time: "06:30", sessionSlug: "pull-hypertrophy" },
      { weekday: 3, time: "06:30", sessionSlug: "core-conditioning" },
      { weekday: 5, time: "06:30", sessionSlug: "full-body-foundation-b" }
    ]
  },
  {
    slug: "glutes-and-legs-focus",
    title: { en: "Glutes and Legs Focus", vi: "Tập trung mông và chân" },
    description: { en: "Three lower-body biased sessions with enough upper support to stay balanced.", vi: "Ba buổi thiên lower body nhưng vẫn đủ upper để cân bằng." },
    levelSlug: "intermediate",
    goalSlug: "hypertrophy",
    sessions: [
      { weekday: 1, time: "06:30", sessionSlug: "legs-hypertrophy" },
      { weekday: 3, time: "06:30", sessionSlug: "lower-strength" },
      { weekday: 6, time: "06:30", sessionSlug: "dumbbell-lower" }
    ]
  },
  {
    slug: "office-reset-mobility",
    title: { en: "Office Reset Mobility", vi: "Mobility cho dân văn phòng" },
    description: { en: "Short sessions to restore movement quality, upper-back endurance, and core control.", vi: "Các buổi ngắn để phục hồi chất lượng vận động, sức bền lưng trên và kiểm soát core." },
    levelSlug: "beginner",
    goalSlug: "mobility",
    sessions: [
      { weekday: 2, time: "06:30", sessionSlug: "core-conditioning" },
      { weekday: 4, time: "06:30", sessionSlug: "full-body-foundation-b" },
      { weekday: 6, time: "06:30", sessionSlug: "home-conditioning" }
    ]
  },
  {
    slug: "mass-builder-4-day",
    title: { en: "Mass Builder 4-Day", vi: "Tăng cơ 4 buổi" },
    description: { en: "A four-day training rhythm for lifters chasing more size without excessive complexity.", vi: "Nhịp tập bốn buổi cho người muốn tăng cơ mà vẫn giữ cấu trúc dễ bám." },
    levelSlug: "intermediate",
    goalSlug: "hypertrophy",
    sessions: [
      { weekday: 1, time: "06:30", sessionSlug: "push-hypertrophy" },
      { weekday: 2, time: "06:30", sessionSlug: "pull-hypertrophy" },
      { weekday: 4, time: "06:30", sessionSlug: "legs-hypertrophy" },
      { weekday: 6, time: "06:30", sessionSlug: "dumbbell-upper" }
    ]
  },
  {
    slug: "athletic-engine-3-day",
    title: { en: "Athletic Engine 3-Day", vi: "Athletic engine 3 buổi" },
    description: { en: "A mixed plan for power, conditioning, and base strength.", vi: "Plan kết hợp sức mạnh nền, power và conditioning." },
    levelSlug: "intermediate",
    goalSlug: "hiit",
    sessions: [
      { weekday: 1, time: "06:30", sessionSlug: "upper-strength" },
      { weekday: 3, time: "06:30", sessionSlug: "home-conditioning" },
      { weekday: 5, time: "06:30", sessionSlug: "lower-strength" }
    ]
  }
];
