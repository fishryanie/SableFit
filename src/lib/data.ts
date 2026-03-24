import { unstable_cache } from "next/cache";
import { cache } from "react";
import dayjs from "dayjs";
import { getFallbackExerciseMedia } from "@/data/system/exercise-media";
import { connectToDatabase } from "@/lib/mongodb";
import { ensureSystemSeed } from "@/data/system/seed";
import { AppUser, PushSubscription } from "@/models/auth";
import {
  Equipment,
  Exercise,
  ExerciseCategory,
  ExerciseGoal,
  ExerciseLevel,
  MuscleCategory,
  Muscle,
} from "@/models/catalog";
import { Notification, WorkoutOccurrence, WorkoutPlan, WorkoutSession } from "@/models/workouts";
import type { ExerciseMedia, ExerciseMovementType, LocalizedString } from "@/types/domain";

export type ExerciseFilters = {
  q?: string;
  equipment?: string;
  level?: string;
  muscle?: string;
  muscleCategory?: string;
  goal?: string;
  category?: string;
  movementType?: string;
};

export type NamedReference = {
  id: string;
  slug: string;
  name: LocalizedString;
  imageUrl?: string;
};

function toId(value: unknown) {
  return String(value);
}

function toNamedReference(value: unknown): NamedReference | null {
  const item = value as {
    _id?: unknown;
    slug?: string;
    name?: { en: string; vi: string };
    imageUrl?: string;
  } | null;

  if (!item) {
    return null;
  }

  return {
    id: item._id ? toId(item._id) : "",
    slug: item.slug ?? "",
    name: item.name ?? { en: "", vi: "" },
    imageUrl: item.imageUrl,
  };
}

export type ExerciseCatalogItem = {
  id: string;
  slug: string;
  name: LocalizedString;
  description: LocalizedString;
  imageUrl: string;
  imageAlt: LocalizedString;
  media: ExerciseMedia;
  equipment: NamedReference[];
  primaryMuscles: NamedReference[];
  secondaryMuscles: NamedReference[];
  level: NamedReference | null;
  movementType: ExerciseMovementType;
};

export type ExerciseDetail = ExerciseCatalogItem & {
  instructionSteps: LocalizedString[];
  goals: NamedReference[];
  categories: NamedReference[];
  movementPattern: string;
  movementType: ExerciseMovementType;
  source: string;
  sourceUrl: string;
};

export const reviewSections = [
  "exercises",
  "muscles",
  "equipments",
  "goals",
  "categories",
] as const;

export type ReviewSection = (typeof reviewSections)[number];

export type ReviewSummary = {
  exercises: {
    count: number;
    withVideo: number;
    withImage: number;
  };
  muscles: {
    count: number;
    withImage: number;
  };
  equipments: {
    count: number;
    withImage: number;
  };
  goals: {
    count: number;
  };
  categories: {
    count: number;
  };
};

export type ReviewExerciseItem = {
  id: string;
  slug: string;
  name: LocalizedString;
  description: LocalizedString;
  imageUrl: string;
  imageAlt: LocalizedString;
  media: ExerciseMedia;
  level: NamedReference | null;
  equipment: NamedReference[];
  muscleCategories: NamedReference[];
  primaryMuscles: NamedReference[];
  secondaryMuscles: NamedReference[];
  goals: NamedReference[];
  categories: NamedReference[];
  movementType: ExerciseMovementType;
  reviewStatus: "APPROVED" | "DRAFT";
  source: string;
  sourceUrl: string;
};

export type ReviewReferenceItem = {
  id: string;
  slug: string;
  name: LocalizedString;
  description: LocalizedString;
  imageUrl?: string;
  linkedExerciseCount: number;
  category?: NamedReference | null;
};

export type ReviewDashboardData = {
  section: ReviewSection;
  q: string;
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  summary: ReviewSummary;
  exercises: ReviewExerciseItem[];
  muscles: ReviewReferenceItem[];
  equipments: ReviewReferenceItem[];
  goals: ReviewReferenceItem[];
  categories: ReviewReferenceItem[];
};

export type ReviewDashboardSnapshot = {
  summary: ReviewSummary;
  exercises: ReviewExerciseItem[];
  muscles: ReviewReferenceItem[];
  equipments: ReviewReferenceItem[];
  goals: ReviewReferenceItem[];
  categories: ReviewReferenceItem[];
};

export type ReviewFilterOption = {
  slug: string;
  name: LocalizedString;
};

export type ReviewExerciseFilters = Pick<
  ExerciseFilters,
  "equipment" | "level" | "muscle" | "muscleCategory" | "goal" | "category" | "movementType"
>;

function compactNamedReferences(values: Array<NamedReference | null>): NamedReference[] {
  return values.filter((value): value is NamedReference => Boolean(value));
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildSearchQuery(q: string) {
  const normalized = q.trim();

  if (!normalized) {
    return {};
  }

  const pattern = new RegExp(escapeRegex(normalized), "i");

  return {
    $or: [
      { slug: pattern },
      { "name.en": pattern },
      { "name.vi": pattern },
      { aliases: pattern },
      { "description.en": pattern },
      { "description.vi": pattern },
    ],
  };
}

function uniqueReferenceIds(values: unknown[]) {
  return [...new Set(values.map((value) => toId(value)).filter(Boolean))];
}

function incrementCount(map: Map<string, number>, key: string) {
  map.set(key, (map.get(key) ?? 0) + 1);
}

async function buildReferenceUsageMaps() {
  const exercises = await Exercise.find({ reviewStatus: "APPROVED" })
    .select("equipmentIds primaryMuscleIds secondaryMuscleIds goalIds categoryIds")
    .lean();

  const equipmentCounts = new Map<string, number>();
  const muscleCounts = new Map<string, number>();
  const goalCounts = new Map<string, number>();
  const categoryCounts = new Map<string, number>();

  for (const exercise of exercises) {
    for (const id of uniqueReferenceIds([
      ...(Array.isArray(exercise.equipmentIds) ? exercise.equipmentIds : []),
    ])) {
      incrementCount(equipmentCounts, id);
    }

    for (const id of uniqueReferenceIds([
      ...(Array.isArray(exercise.primaryMuscleIds) ? exercise.primaryMuscleIds : []),
      ...(Array.isArray(exercise.secondaryMuscleIds) ? exercise.secondaryMuscleIds : []),
    ])) {
      incrementCount(muscleCounts, id);
    }

    for (const id of uniqueReferenceIds([
      ...(Array.isArray(exercise.goalIds) ? exercise.goalIds : []),
    ])) {
      incrementCount(goalCounts, id);
    }

    for (const id of uniqueReferenceIds([
      ...(Array.isArray(exercise.categoryIds) ? exercise.categoryIds : []),
    ])) {
      incrementCount(categoryCounts, id);
    }
  }

  return {
    equipmentCounts,
    muscleCounts,
    goalCounts,
    categoryCounts,
  };
}

async function buildReviewSummary(): Promise<ReviewSummary> {
  const [exerciseCount, exerciseWithVideoCount, exerciseWithImageCount, muscleCount, muscleWithImageCount, equipmentCount, equipmentWithImageCount, goalCount, categoryCount] =
    await Promise.all([
      Exercise.countDocuments({ reviewStatus: "APPROVED" }),
      Exercise.countDocuments({ reviewStatus: "APPROVED", "media.videoUrl": { $exists: true, $ne: "" } }),
      Exercise.countDocuments({ reviewStatus: "APPROVED", imageUrl: { $exists: true, $ne: "" } }),
      Muscle.countDocuments(),
      Muscle.countDocuments({ imageUrl: { $exists: true, $ne: "" } }),
      Equipment.countDocuments(),
      Equipment.countDocuments({ imageUrl: { $exists: true, $ne: "" } }),
      ExerciseGoal.countDocuments(),
      ExerciseCategory.countDocuments(),
    ]);

  return {
    exercises: {
      count: exerciseCount,
      withVideo: exerciseWithVideoCount,
      withImage: exerciseWithImageCount,
    },
    muscles: {
      count: muscleCount,
      withImage: muscleWithImageCount,
    },
    equipments: {
      count: equipmentCount,
      withImage: equipmentWithImageCount,
    },
    goals: {
      count: goalCount,
    },
    categories: {
      count: categoryCount,
    },
  };
}

export async function getReviewDashboardData({
  section = "exercises",
  q = "",
  page = 1,
  filters = {},
}: {
  section?: ReviewSection;
  q?: string;
  page?: number;
  filters?: ReviewExerciseFilters;
} = {}): Promise<ReviewDashboardData> {
  await ensureSystemSeed();
  await connectToDatabase();

  const normalizedSection = reviewSections.includes(section) ? section : "exercises";
  const normalizedPage = Number.isFinite(page) ? Math.max(1, Math.floor(page)) : 1;
  const pageSize = normalizedSection === "exercises" ? 40 : 60;
  const searchQuery = buildSearchQuery(q);
  const summaryPromise = buildReviewSummary();

  if (normalizedSection === "exercises") {
    const [level, equipment, muscle, muscleCategory, goal, category] = await Promise.all([
      filters.level ? ExerciseLevel.findOne({ slug: filters.level }).select("_id").lean() : null,
      filters.equipment ? Equipment.findOne({ slug: filters.equipment }).select("_id").lean() : null,
      filters.muscle ? Muscle.findOne({ slug: filters.muscle }).select("_id").lean() : null,
      filters.muscleCategory ? MuscleCategory.findOne({ slug: filters.muscleCategory }).select("_id").lean() : null,
      filters.goal ? ExerciseGoal.findOne({ slug: filters.goal }).select("_id").lean() : null,
      filters.category ? ExerciseCategory.findOne({ slug: filters.category }).select("_id").lean() : null,
    ]);

    const query = {
      reviewStatus: "APPROVED",
      ...searchQuery,
      ...(level ? { levelId: level._id } : {}),
      ...(equipment ? { equipmentIds: equipment._id } : {}),
      ...(muscleCategory ? { muscleCategoryIds: muscleCategory._id } : {}),
      ...(goal ? { goalIds: goal._id } : {}),
      ...(category ? { categoryIds: category._id } : {}),
      ...(filters.movementType ? { movementType: filters.movementType } : {}),
      ...(muscle
        ? {
            $and: [
              {
                $or: [
                  { primaryMuscleIds: muscle._id },
                  { secondaryMuscleIds: muscle._id },
                ],
              },
            ],
          }
        : {}),
    };

    const total = await Exercise.countDocuments(query);
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const items = await Exercise.find(query)
      .populate("equipmentIds", "slug name imageUrl")
      .populate("muscleCategoryIds", "slug name imageUrl")
      .populate("primaryMuscleIds", "slug name imageUrl")
      .populate("secondaryMuscleIds", "slug name imageUrl")
      .populate("goalIds", "slug name")
      .populate("categoryIds", "slug name")
      .populate("levelId", "slug name")
      .sort({ "name.en": 1 })
      .skip((normalizedPage - 1) * pageSize)
      .limit(pageSize)
      .lean();

    return {
      section: normalizedSection,
      q,
      page: normalizedPage,
      pageSize,
      total,
      totalPages,
      summary: await summaryPromise,
      exercises: items.map((item) => ({
        id: toId(item._id),
        slug: item.slug,
        name: item.name,
        description: item.description,
        imageUrl: item.imageUrl,
        imageAlt: item.imageAlt,
        media: item.media ?? getFallbackExerciseMedia(item.slug, item.movementType ?? "DYNAMIC"),
        level: toNamedReference(item.levelId),
        equipment: compactNamedReferences((Array.isArray(item.equipmentIds) ? item.equipmentIds : []).map((value) => toNamedReference(value))),
        muscleCategories: compactNamedReferences((Array.isArray(item.muscleCategoryIds) ? item.muscleCategoryIds : []).map((value) => toNamedReference(value))),
        primaryMuscles: compactNamedReferences((Array.isArray(item.primaryMuscleIds) ? item.primaryMuscleIds : []).map((value) => toNamedReference(value))),
        secondaryMuscles: compactNamedReferences((Array.isArray(item.secondaryMuscleIds) ? item.secondaryMuscleIds : []).map((value) => toNamedReference(value))),
        goals: compactNamedReferences((Array.isArray(item.goalIds) ? item.goalIds : []).map((value) => toNamedReference(value))),
        categories: compactNamedReferences((Array.isArray(item.categoryIds) ? item.categoryIds : []).map((value) => toNamedReference(value))),
        movementType: item.movementType ?? "DYNAMIC",
        reviewStatus: item.reviewStatus,
        source: item.source ?? "INTERNAL_CURATION",
        sourceUrl: item.sourceUrl ?? "",
      })),
      muscles: [],
      equipments: [],
      goals: [],
      categories: [],
    };
  }

  const [summary, usageMaps] = await Promise.all([summaryPromise, buildReferenceUsageMaps()]);

  if (normalizedSection === "muscles") {
    const total = await Muscle.countDocuments(searchQuery);
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const items = await Muscle.find(searchQuery)
      .populate("categoryId", "slug name")
      .sort({ order: 1, "name.en": 1 })
      .skip((normalizedPage - 1) * pageSize)
      .limit(pageSize)
      .lean();

    return {
      section: normalizedSection,
      q,
      page: normalizedPage,
      pageSize,
      total,
      totalPages,
      summary,
      exercises: [],
      muscles: items.map((item) => ({
        id: toId(item._id),
        slug: item.slug,
        name: item.name,
        description: item.description,
        imageUrl: item.imageUrl,
        linkedExerciseCount: usageMaps.muscleCounts.get(toId(item._id)) ?? 0,
        category: toNamedReference(item.categoryId),
      })),
      equipments: [],
      goals: [],
      categories: [],
    };
  }

  if (normalizedSection === "equipments") {
    const total = await Equipment.countDocuments(searchQuery);
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const items = await Equipment.find(searchQuery)
      .sort({ order: 1, "name.en": 1 })
      .skip((normalizedPage - 1) * pageSize)
      .limit(pageSize)
      .lean();

    return {
      section: normalizedSection,
      q,
      page: normalizedPage,
      pageSize,
      total,
      totalPages,
      summary,
      exercises: [],
      muscles: [],
      equipments: items.map((item) => ({
        id: toId(item._id),
        slug: item.slug,
        name: item.name,
        description: item.description,
        imageUrl: item.imageUrl,
        linkedExerciseCount: usageMaps.equipmentCounts.get(toId(item._id)) ?? 0,
      })),
      goals: [],
      categories: [],
    };
  }

  if (normalizedSection === "goals") {
    const total = await ExerciseGoal.countDocuments(searchQuery);
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const items = await ExerciseGoal.find(searchQuery)
      .sort({ order: 1, "name.en": 1 })
      .skip((normalizedPage - 1) * pageSize)
      .limit(pageSize)
      .lean();

    return {
      section: normalizedSection,
      q,
      page: normalizedPage,
      pageSize,
      total,
      totalPages,
      summary,
      exercises: [],
      muscles: [],
      equipments: [],
      goals: items.map((item) => ({
        id: toId(item._id),
        slug: item.slug,
        name: item.name,
        description: item.description,
        linkedExerciseCount: usageMaps.goalCounts.get(toId(item._id)) ?? 0,
      })),
      categories: [],
    };
  }

  const total = await ExerciseCategory.countDocuments(searchQuery);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const items = await ExerciseCategory.find(searchQuery)
    .sort({ order: 1, "name.en": 1 })
    .skip((normalizedPage - 1) * pageSize)
    .limit(pageSize)
    .lean();

  return {
    section: normalizedSection,
    q,
    page: normalizedPage,
    pageSize,
    total,
    totalPages,
    summary,
    exercises: [],
    muscles: [],
    equipments: [],
    goals: [],
    categories: items.map((item) => ({
      id: toId(item._id),
      slug: item.slug,
      name: item.name,
      description: item.description,
      linkedExerciseCount: usageMaps.categoryCounts.get(toId(item._id)) ?? 0,
    })),
  };
}

const getCachedReviewDashboardSnapshot = unstable_cache(
  async (): Promise<ReviewDashboardSnapshot> => {
  await ensureSystemSeed();
  await connectToDatabase();

  const [summary, usageMaps, exerciseItems, muscleItems, equipmentItems, goalItems, categoryItems] =
    await Promise.all([
      buildReviewSummary(),
      buildReferenceUsageMaps(),
      Exercise.find({ reviewStatus: "APPROVED" })
        .populate("equipmentIds", "slug name imageUrl")
        .populate("muscleCategoryIds", "slug name imageUrl")
        .populate("primaryMuscleIds", "slug name imageUrl")
        .populate("secondaryMuscleIds", "slug name imageUrl")
        .populate("goalIds", "slug name")
        .populate("categoryIds", "slug name")
        .populate("levelId", "slug name")
        .sort({ "name.en": 1 })
        .lean(),
      Muscle.find()
        .populate("categoryId", "slug name")
        .sort({ order: 1, "name.en": 1 })
        .lean(),
      Equipment.find().sort({ order: 1, "name.en": 1 }).lean(),
      ExerciseGoal.find().sort({ order: 1, "name.en": 1 }).lean(),
      ExerciseCategory.find().sort({ order: 1, "name.en": 1 }).lean(),
    ]);

  return {
    summary,
    exercises: exerciseItems.map((item) => ({
      id: toId(item._id),
      slug: item.slug,
      name: item.name,
      description: item.description,
      imageUrl: item.imageUrl,
      imageAlt: item.imageAlt,
      media: item.media ?? getFallbackExerciseMedia(item.slug, item.movementType ?? "DYNAMIC"),
      level: toNamedReference(item.levelId),
      equipment: compactNamedReferences(
        (Array.isArray(item.equipmentIds) ? item.equipmentIds : []).map((value) =>
          toNamedReference(value),
        ),
      ),
      muscleCategories: compactNamedReferences(
        (Array.isArray(item.muscleCategoryIds) ? item.muscleCategoryIds : []).map((value) =>
          toNamedReference(value),
        ),
      ),
      primaryMuscles: compactNamedReferences(
        (Array.isArray(item.primaryMuscleIds) ? item.primaryMuscleIds : []).map((value) =>
          toNamedReference(value),
        ),
      ),
      secondaryMuscles: compactNamedReferences(
        (Array.isArray(item.secondaryMuscleIds) ? item.secondaryMuscleIds : []).map((value) =>
          toNamedReference(value),
        ),
      ),
      goals: compactNamedReferences(
        (Array.isArray(item.goalIds) ? item.goalIds : []).map((value) => toNamedReference(value)),
      ),
      categories: compactNamedReferences(
        (Array.isArray(item.categoryIds) ? item.categoryIds : []).map((value) =>
          toNamedReference(value),
        ),
      ),
      movementType: item.movementType ?? "DYNAMIC",
      reviewStatus: item.reviewStatus,
      source: item.source ?? "INTERNAL_CURATION",
      sourceUrl: item.sourceUrl ?? "",
    })),
    muscles: muscleItems.map((item) => ({
      id: toId(item._id),
      slug: item.slug,
      name: item.name,
      description: item.description,
      imageUrl: item.imageUrl,
      linkedExerciseCount: usageMaps.muscleCounts.get(toId(item._id)) ?? 0,
      category: toNamedReference(item.categoryId),
    })),
    equipments: equipmentItems.map((item) => ({
      id: toId(item._id),
      slug: item.slug,
      name: item.name,
      description: item.description,
      imageUrl: item.imageUrl,
      linkedExerciseCount: usageMaps.equipmentCounts.get(toId(item._id)) ?? 0,
    })),
    goals: goalItems.map((item) => ({
      id: toId(item._id),
      slug: item.slug,
      name: item.name,
      description: item.description,
      linkedExerciseCount: usageMaps.goalCounts.get(toId(item._id)) ?? 0,
    })),
    categories: categoryItems.map((item) => ({
      id: toId(item._id),
      slug: item.slug,
      name: item.name,
      description: item.description,
      linkedExerciseCount: usageMaps.categoryCounts.get(toId(item._id)) ?? 0,
    })),
  };
  },
  ["review-dashboard-snapshot-v1"],
  {
    revalidate: 60 * 60,
    tags: ["review-dashboard-snapshot"],
  },
);

export const getReviewDashboardSnapshot = cache(async (): Promise<ReviewDashboardSnapshot> =>
  getCachedReviewDashboardSnapshot(),
);

const getCachedShellBootstrap = unstable_cache(
  async () => {
  await ensureSystemSeed();
  await connectToDatabase();

  const [levels, equipments, muscles, muscleCategories, goals, categories] = await Promise.all([
    ExerciseLevel.find().sort({ order: 1 }).lean(),
    Equipment.find().sort({ order: 1 }).lean(),
    Muscle.find().sort({ order: 1 }).lean(),
    MuscleCategory.find().sort({ order: 1 }).lean(),
    ExerciseGoal.find().sort({ order: 1 }).lean(),
    ExerciseCategory.find().sort({ order: 1 }).lean(),
  ]);

  return {
    levels: levels.map((item) => ({ id: toId(item._id), slug: item.slug, name: item.name })),
    equipments: equipments.map((item) => ({
      id: toId(item._id),
      slug: item.slug,
      name: item.name,
      imageUrl: item.imageUrl,
    })),
    muscles: muscles.map((item) => ({
      id: toId(item._id),
      slug: item.slug,
      name: item.name,
      imageUrl: item.imageUrl,
    })),
    muscleCategories: muscleCategories.map((item) => ({
      id: toId(item._id),
      slug: item.slug,
      name: item.name,
      imageUrl: item.imageUrl,
    })),
    goals: goals.map((item) => ({ id: toId(item._id), slug: item.slug, name: item.name })),
    categories: categories.map((item) => ({ id: toId(item._id), slug: item.slug, name: item.name })),
  };
  },
  ["shell-bootstrap-v1"],
  {
    revalidate: 60 * 60,
    tags: ["shell-bootstrap"],
  },
);

export const getShellBootstrap = cache(async () => getCachedShellBootstrap());

export const getPublicExerciseCatalog = cache(async (filters: ExerciseFilters = {}) => {
  await ensureSystemSeed();
  await connectToDatabase();

  const query: Record<string, unknown> = {
    reviewStatus: "APPROVED",
    isSystem: true,
  };

  if (filters.level) {
    const level = await ExerciseLevel.findOne({ slug: filters.level }).select("_id").lean();
    if (level) {
      query.levelId = level._id;
    }
  }

  if (filters.equipment) {
    const equipment = await Equipment.findOne({ slug: filters.equipment }).select("_id").lean();
    if (equipment) {
      query.equipmentIds = equipment._id;
    }
  }

  if (filters.muscle) {
    const muscle = await Muscle.findOne({ slug: filters.muscle }).select("_id").lean();
    if (muscle) {
      query.primaryMuscleIds = muscle._id;
    }
  }

  if (filters.muscleCategory) {
    const muscleCategory = await MuscleCategory.findOne({ slug: filters.muscleCategory }).select("_id").lean();
    if (muscleCategory) {
      query.muscleCategoryIds = muscleCategory._id;
    }
  }

  if (filters.goal) {
    const goal = await ExerciseGoal.findOne({ slug: filters.goal }).select("_id").lean();
    if (goal) {
      query.goalIds = goal._id;
    }
  }

  if (filters.category) {
    const category = await ExerciseCategory.findOne({ slug: filters.category }).select("_id").lean();
    if (category) {
      query.categoryIds = category._id;
    }
  }

  if (filters.movementType) {
    query.movementType = filters.movementType;
  }

  if (filters.q) {
    query.$text = { $search: filters.q };
  }

  const exercises = await Exercise.find(query)
    .populate("equipmentIds", "slug name imageUrl")
    .populate("primaryMuscleIds", "slug name imageUrl")
    .populate("secondaryMuscleIds", "slug name imageUrl")
    .populate("levelId", "slug name")
    .limit(60)
    .sort(filters.q ? { score: { $meta: "textScore" } } : { "name.en": 1 })
    .lean();

  return exercises.map((item): ExerciseCatalogItem => ({
    id: toId(item._id),
    slug: item.slug,
    name: item.name,
    description: item.description,
    imageUrl: item.imageUrl,
    imageAlt: item.imageAlt,
    media: item.media ?? getFallbackExerciseMedia(item.slug, item.movementType ?? "DYNAMIC"),
    equipment: compactNamedReferences((Array.isArray(item.equipmentIds) ? item.equipmentIds : []).map((value) => toNamedReference(value))),
    primaryMuscles: compactNamedReferences((Array.isArray(item.primaryMuscleIds) ? item.primaryMuscleIds : []).map((value) => toNamedReference(value))),
    secondaryMuscles: compactNamedReferences((Array.isArray(item.secondaryMuscleIds) ? item.secondaryMuscleIds : []).map((value) => toNamedReference(value))),
    level: toNamedReference(item.levelId),
    movementType: item.movementType ?? "DYNAMIC",
  }));
});

export const getSystemPlanTemplates = cache(async () => {
  await ensureSystemSeed();
  await connectToDatabase();

  const plans = await WorkoutPlan.find({ ownerType: "SYSTEM" })
    .populate("levelId", "slug name")
    .populate("goalId", "slug name")
    .populate("scheduleEntries.workoutSessionId", "title")
    .sort({ createdAt: 1 })
    .lean();

  return plans.map((plan) => ({
    id: toId(plan._id),
    slug: plan.slug,
    title: plan.title,
    description: plan.description,
    level: plan.levelId,
    goal: plan.goalId,
    sessionsPerWeek: plan.scheduleEntries.length,
  }));
});

export const getTodayView = cache(async (userId: string) => {
  await ensureSystemSeed();
  await connectToDatabase();

  const start = dayjs().startOf("day").toDate();
  const end = dayjs().endOf("day").toDate();

  const [user, activePlan, todayItems, nextItems, systemPlans, subscriptions] = await Promise.all([
    AppUser.findById(userId).lean(),
    WorkoutPlan.findOne({ ownerUserId: userId, isActive: true })
      .populate("levelId", "slug name")
      .populate("goalId", "slug name")
      .lean(),
    WorkoutOccurrence.find({
      userId,
      scheduledFor: { $gte: start, $lte: end },
    })
      .populate({
        path: "workoutSessionId",
        populate: {
          path: "exerciseEntries.exerciseId",
          model: "Exercise",
          select: "slug name imageUrl media",
        },
      })
      .sort({ scheduledFor: 1 })
      .lean(),
    WorkoutOccurrence.find({
      userId,
      scheduledFor: { $gt: end },
      status: "UPCOMING",
    })
      .populate("workoutSessionId", "title description")
      .sort({ scheduledFor: 1 })
      .limit(3)
      .lean(),
    getSystemPlanTemplates(),
    PushSubscription.find({ userId, status: "ACTIVE" }).lean(),
  ]);

  return {
    user: user
      ? {
          id: toId(user._id),
          displayName: user.displayName,
          reminderTime: user.reminderTime,
        }
      : null,
    activePlan: activePlan
      ? {
          id: toId(activePlan._id),
          title: activePlan.title,
          description: activePlan.description,
          level: activePlan.levelId,
          goal: activePlan.goalId,
        }
      : null,
    todayItems: todayItems.map((item) => ({
      id: toId(item._id),
      status: item.status,
      scheduledFor: item.scheduledFor,
      workoutSession: (() => {
        const workoutSession = item.workoutSessionId as
          | {
              title?: { en: string; vi: string };
              exerciseEntries?: Array<{
                exerciseId?: {
                  imageUrl?: string;
                  media?: ExerciseMedia;
                  name?: { en: string; vi: string };
                };
                sets?: Array<unknown>;
              }>;
            }
          | null;

        return workoutSession
          ? {
              title: workoutSession.title ?? { en: "Workout session", vi: "Buổi tập" },
              exerciseEntries: (workoutSession.exerciseEntries ?? []).map((entry) => ({
                exerciseId: entry.exerciseId
                  ? {
                      imageUrl:
                        entry.exerciseId.media?.thumbnailUrl ||
                        entry.exerciseId.imageUrl ||
                        "/pwa/icon-192.png",
                      name: entry.exerciseId.name ?? { en: "Exercise", vi: "Bài tập" },
                    }
                  : undefined,
                sets: entry.sets ?? [],
              })),
            }
          : null;
      })(),
    })),
    nextItems: nextItems.map((item) => ({
      id: toId(item._id),
      scheduledFor: item.scheduledFor,
      workoutSession: (() => {
        const workoutSession = item.workoutSessionId as
          | {
              title?: { en: string; vi: string };
              description?: { en: string; vi: string };
            }
          | null;

        return workoutSession
          ? {
              title: workoutSession.title ?? { en: "Workout session", vi: "Buổi tập" },
              description: workoutSession.description ?? {
                en: "Upcoming workout",
                vi: "Buổi tập sắp tới",
              },
            }
          : null;
      })(),
    })),
    planTemplates: systemPlans.slice(0, 4),
    hasPushSubscription: subscriptions.length > 0,
  };
});

export const getUserSessionList = cache(async (userId: string) => {
  await ensureSystemSeed();
  await connectToDatabase();

  const [userSessions, systemSessions, exercises] = await Promise.all([
    WorkoutSession.find({ ownerUserId: userId }).sort({ createdAt: -1 }).lean(),
    WorkoutSession.find({ ownerType: "SYSTEM" }).sort({ createdAt: 1 }).limit(6).lean(),
    Exercise.find({ reviewStatus: "APPROVED" }).select("name slug").sort({ "name.en": 1 }).lean(),
  ]);

  return {
    userSessions: userSessions.map((item) => ({
      id: toId(item._id),
      title: item.title,
      description: item.description,
      entryCount: item.exerciseEntries.length,
    })),
    systemSessions: systemSessions.map((item) => ({
      id: toId(item._id),
      title: item.title,
      description: item.description,
      entryCount: item.exerciseEntries.length,
    })),
    exerciseOptions: exercises.map((item) => ({
      id: toId(item._id),
      slug: item.slug,
      name: item.name,
    })),
  };
});

export const getUserPlanList = cache(async (userId: string) => {
  await ensureSystemSeed();
  await connectToDatabase();

  const [userPlans, systemPlans, sessions, levels, goals] = await Promise.all([
    WorkoutPlan.find({ ownerUserId: userId }).sort({ createdAt: -1 }).lean(),
    getSystemPlanTemplates(),
    WorkoutSession.find({ ownerUserId: userId }).sort({ createdAt: -1 }).lean(),
    ExerciseLevel.find().sort({ order: 1 }).lean(),
    ExerciseGoal.find().sort({ order: 1 }).lean(),
  ]);

  return {
    userPlans: userPlans.map((item) => ({
      id: toId(item._id),
      title: item.title,
      description: item.description,
      isActive: item.isActive,
      scheduleEntries: item.scheduleEntries,
    })),
    systemPlans,
    sessionOptions: sessions.map((item) => ({
      id: toId(item._id),
      title: item.title,
      description: item.description,
    })),
    levels: levels.map((item) => ({ id: toId(item._id), slug: item.slug, name: item.name })),
    goals: goals.map((item) => ({ id: toId(item._id), slug: item.slug, name: item.name })),
  };
});

export const getLibraryData = cache(async (userId?: string, filters: ExerciseFilters = {}) => {
  const catalog = await getPublicExerciseCatalog(filters);
  const { equipments, levels, muscles } = await getShellBootstrap();
  return {
    userId,
    catalog,
    equipments,
    levels,
    muscles,
  };
});

export const getExerciseDetail = cache(async (slug: string) => {
  await ensureSystemSeed();
  await connectToDatabase();

  const item = await Exercise.findOne({
    slug,
    reviewStatus: "APPROVED",
  })
    .populate("equipmentIds", "slug name imageUrl")
    .populate("primaryMuscleIds", "slug name imageUrl")
    .populate("secondaryMuscleIds", "slug name imageUrl")
    .populate("goalIds", "slug name")
    .populate("categoryIds", "slug name")
    .populate("levelId", "slug name")
    .lean();

  if (!item) {
    return null;
  }

  return {
    id: toId(item._id),
    slug: item.slug,
    name: item.name,
    description: item.description,
    instructionSteps: item.instructionSteps ?? [],
    imageUrl: item.imageUrl,
    imageAlt: item.imageAlt,
    media: item.media ?? getFallbackExerciseMedia(item.slug, item.movementType ?? "DYNAMIC"),
    equipment: compactNamedReferences((Array.isArray(item.equipmentIds) ? item.equipmentIds : []).map((value) => toNamedReference(value))),
    primaryMuscles: compactNamedReferences((Array.isArray(item.primaryMuscleIds) ? item.primaryMuscleIds : []).map((value) => toNamedReference(value))),
    secondaryMuscles: compactNamedReferences((Array.isArray(item.secondaryMuscleIds) ? item.secondaryMuscleIds : []).map((value) => toNamedReference(value))),
    goals: compactNamedReferences((Array.isArray(item.goalIds) ? item.goalIds : []).map((value) => toNamedReference(value))),
    categories: compactNamedReferences((Array.isArray(item.categoryIds) ? item.categoryIds : []).map((value) => toNamedReference(value))),
    level: toNamedReference(item.levelId),
    movementPattern: item.movementPattern ?? "general",
    movementType: item.movementType ?? "DYNAMIC",
    source: item.source ?? "INTERNAL_CURATION",
    sourceUrl: item.sourceUrl ?? "",
  } satisfies ExerciseDetail;
});

export const getInboxData = cache(async (userId: string) => {
  await ensureSystemSeed();
  await connectToDatabase();

  const notifications = await Notification.find({ userId }).sort({ createdAt: -1 }).limit(60).lean();

  return notifications.map((item) => ({
    id: toId(item._id),
    title: item.title,
    body: item.body,
    type: item.type,
    actionHref: item.actionHref,
    createdAt: item.createdAt,
    readAt: item.readAt,
  }));
});

export const getSettingsData = cache(async (userId: string) => {
  await ensureSystemSeed();
  await connectToDatabase();

  const [user, pushSubscriptions, categories, muscles] = await Promise.all([
    AppUser.findById(userId).lean(),
    PushSubscription.find({ userId, status: "ACTIVE" }).lean(),
    ExerciseCategory.find().sort({ order: 1 }).lean(),
    Muscle.find().sort({ order: 1 }).limit(18).lean(),
  ]);

  return {
    user: user
      ? {
          id: toId(user._id),
          displayName: user.displayName,
          phoneE164: user.phoneE164,
          locale: user.locale,
          timezone: user.timezone,
          reminderTime: user.reminderTime,
        }
      : null,
    pushSubscriptions: pushSubscriptions.map((item) => ({
      id: toId(item._id),
      platform: item.platform,
      endpoint: item.endpoint,
      isPwaInstalled: item.isPwaInstalled,
      lastConfirmedAt: item.lastConfirmedAt,
    })),
    categories: categories.map((item) => ({ slug: item.slug, name: item.name })),
    muscles: muscles.map((item) => ({ slug: item.slug, name: item.name, imageUrl: item.imageUrl })),
  };
});
