import { createHash } from "node:crypto";
import dayjs from "dayjs";
import { Types } from "mongoose";
import { AppUser } from "@/models/auth";
import {
  Equipment,
  Exercise,
  ExerciseCategory,
  ExerciseGoal,
  ExerciseLevel,
  Muscle,
  MuscleCategory,
} from "@/models/catalog";
import { Notification, WorkoutOccurrence, WorkoutPlan, WorkoutSession } from "@/models/workouts";
import { SystemSeedState } from "@/models/system";
import { connectToDatabase } from "@/lib/mongodb";
import { getSystemExercises, getSystemPlanDrafts, getSystemSessionDrafts, getSystemTaxonomy } from "@/data/system/catalog";
import { mirrorLocalized } from "@/lib/strings";

export const SYSTEM_SEED_KEY = "sablefit-core";
export const SYSTEM_SEED_VERSION = "2026-03-22.10";

function compactIds(values: Array<string | undefined>) {
  return values.filter(Boolean);
}

function toObjectId(value?: string | null) {
  return value ? new Types.ObjectId(value) : undefined;
}

function toNullableObjectId(value?: string | null) {
  return value ? new Types.ObjectId(value) : null;
}

function compactObjectIds(values: Array<string | undefined>) {
  return compactIds(values).map((value) => new Types.ObjectId(value));
}

async function dedupeSystemDocsBySlug(model: {
  find: (query: Record<string, unknown>) => {
    sort: (sort: Record<string, 1 | -1>) => {
      select: (selection: string) => {
        lean: () => Promise<Array<{ _id: Types.ObjectId; slug?: string | null }>>;
      };
    };
  };
  deleteMany: (query: Record<string, unknown>) => Promise<unknown>;
}, query: Record<string, unknown>) {
  const docs = await model
    .find(query)
    .sort({ updatedAt: -1, createdAt: -1 })
    .select("_id slug")
    .lean();

  const canonicalMap = new Map<string, string>();
  const staleIds: Types.ObjectId[] = [];

  for (const doc of docs) {
    if (!doc.slug) {
      continue;
    }

    if (!canonicalMap.has(doc.slug)) {
      canonicalMap.set(doc.slug, String(doc._id));
      continue;
    }

    staleIds.push(doc._id);
  }

  if (staleIds.length) {
    await model.deleteMany({ _id: { $in: staleIds } });
  }

  return canonicalMap;
}

function buildSystemSeedPayload() {
  const taxonomy = getSystemTaxonomy();
  const exercises = getSystemExercises();
  const sessionDrafts = getSystemSessionDrafts();
  const planDrafts = getSystemPlanDrafts();

  const summary = {
    taxonomyCounts: {
      equipments: taxonomy.equipments.length,
      muscleCategories: taxonomy.muscleCategories.length,
      muscles: taxonomy.muscles.length,
      exerciseLevels: taxonomy.exerciseLevels.length,
      exerciseGoals: taxonomy.exerciseGoals.length,
      exerciseCategories: taxonomy.exerciseCategories.length,
    },
    exerciseCount: exercises.length,
    anatomyMediaCount: exercises.filter((item) => item.media.style === "ANATOMY").length,
    sessionTemplateCount: sessionDrafts.length,
    planTemplateCount: planDrafts.length,
  };

  const checksum = createHash("sha256")
    .update(
      JSON.stringify({
        version: SYSTEM_SEED_VERSION,
        taxonomy,
        exercises,
        sessionDrafts,
        planDrafts,
      }),
    )
    .digest("hex");

  return { taxonomy, exercises, sessionDrafts, planDrafts, summary, checksum };
}

const SYSTEM_SEED_PAYLOAD = buildSystemSeedPayload();

async function pruneStaleSystemDocuments(payload: ReturnType<typeof buildSystemSeedPayload>) {
  const { taxonomy, exercises, sessionDrafts, planDrafts } = payload;

  await Promise.all([
    Equipment.deleteMany({
      slug: { $nin: taxonomy.equipments.map((item) => item.slug) },
      $or: [{ isSystem: true }, { isSystem: { $exists: false } }],
    }),
    MuscleCategory.deleteMany({
      slug: { $nin: taxonomy.muscleCategories.map((item) => item.slug) },
      $or: [{ isSystem: true }, { isSystem: { $exists: false } }],
    }),
    Muscle.deleteMany({
      slug: { $nin: taxonomy.muscles.map((item) => item.slug) },
      $or: [{ isSystem: true }, { isSystem: { $exists: false } }],
    }),
    ExerciseLevel.deleteMany({
      slug: { $nin: taxonomy.exerciseLevels.map((item) => item.slug) },
      $or: [{ isSystem: true }, { isSystem: { $exists: false } }],
    }),
    ExerciseGoal.deleteMany({
      slug: { $nin: taxonomy.exerciseGoals.map((item) => item.slug) },
      $or: [{ isSystem: true }, { isSystem: { $exists: false } }],
    }),
    ExerciseCategory.deleteMany({
      slug: { $nin: taxonomy.exerciseCategories.map((item) => item.slug) },
      $or: [{ isSystem: true }, { isSystem: { $exists: false } }],
    }),
    Exercise.deleteMany({
      slug: { $nin: exercises.map((item) => item.slug) },
      $or: [{ isSystem: true }, { isSystem: { $exists: false } }],
    }),
    WorkoutSession.deleteMany({
      ownerType: "SYSTEM",
      slug: { $nin: sessionDrafts.map((item) => item.slug) },
    }),
    WorkoutPlan.deleteMany({
      ownerType: "SYSTEM",
      slug: { $nin: planDrafts.map((item) => item.slug) },
    }),
  ]);
}

export async function ensureSystemSeed({ force = false }: { force?: boolean } = {}) {
  await connectToDatabase();

  const payload = SYSTEM_SEED_PAYLOAD;
  const existingState = await SystemSeedState.findOne({ key: SYSTEM_SEED_KEY }).lean();
  if (
    !force &&
    existingState?.status === "READY" &&
    existingState.version === SYSTEM_SEED_VERSION &&
    existingState.checksum === payload.checksum
  ) {
    return existingState.summary;
  }

  await SystemSeedState.updateOne(
    { key: SYSTEM_SEED_KEY },
    {
      $set: {
        version: SYSTEM_SEED_VERSION,
        checksum: payload.checksum,
        status: "RUNNING",
        summary: payload.summary,
        lastError: "",
      },
    },
    { upsert: true },
  );

  try {
    const { taxonomy } = payload;

    await Equipment.bulkWrite(
      taxonomy.equipments.map((seed) => ({
        updateOne: {
          filter: { slug: seed.slug },
          update: {
            $set: {
              slug: seed.slug,
              name: seed.name,
              description: seed.description,
              imageUrl: seed.imageUrl ?? "",
              aliases: seed.aliases ?? [],
              order: seed.order,
              isSystem: true,
              seedVersion: SYSTEM_SEED_VERSION,
            },
          },
          upsert: true,
        },
      })),
      { ordered: false },
    );

    await MuscleCategory.bulkWrite(
      taxonomy.muscleCategories.map((seed) => ({
        updateOne: {
          filter: { slug: seed.slug },
          update: {
            $set: {
              slug: seed.slug,
              name: seed.name,
              description: seed.description,
              aliases: seed.aliases ?? [],
              order: seed.order,
              isSystem: true,
              seedVersion: SYSTEM_SEED_VERSION,
            },
          },
          upsert: true,
        },
      })),
      { ordered: false },
    );

    await ExerciseLevel.bulkWrite(
      taxonomy.exerciseLevels.map((seed) => ({
        updateOne: {
          filter: { slug: seed.slug },
          update: {
            $set: {
              slug: seed.slug,
              name: seed.name,
              description: seed.description,
              aliases: seed.aliases ?? [],
              order: seed.order,
              isSystem: true,
              seedVersion: SYSTEM_SEED_VERSION,
            },
          },
          upsert: true,
        },
      })),
      { ordered: false },
    );

    await ExerciseGoal.bulkWrite(
      taxonomy.exerciseGoals.map((seed) => ({
        updateOne: {
          filter: { slug: seed.slug },
          update: {
            $set: {
              slug: seed.slug,
              name: seed.name,
              description: seed.description,
              aliases: seed.aliases ?? [],
              order: seed.order,
              isSystem: true,
              seedVersion: SYSTEM_SEED_VERSION,
            },
          },
          upsert: true,
        },
      })),
      { ordered: false },
    );

    await ExerciseCategory.bulkWrite(
      taxonomy.exerciseCategories.map((seed) => ({
        updateOne: {
          filter: { slug: seed.slug },
          update: {
            $set: {
              slug: seed.slug,
              name: seed.name,
              description: seed.description,
              aliases: seed.aliases ?? [],
              order: seed.order,
              isSystem: true,
              seedVersion: SYSTEM_SEED_VERSION,
            },
          },
          upsert: true,
        },
      })),
      { ordered: false },
    );

    const [equipmentDocs, muscleCategoryDocs, levelDocs, goalDocs, categoryDocs] = await Promise.all([
      Equipment.find().select("_id slug").lean(),
      MuscleCategory.find().select("_id slug").lean(),
      ExerciseLevel.find().select("_id slug").lean(),
      ExerciseGoal.find().select("_id slug").lean(),
      ExerciseCategory.find().select("_id slug").lean(),
    ]);

    const equipmentMap = new Map(equipmentDocs.map((doc) => [doc.slug, String(doc._id)]));
    const muscleCategoryMap = new Map(muscleCategoryDocs.map((doc) => [doc.slug, String(doc._id)]));
    const levelMap = new Map(levelDocs.map((doc) => [doc.slug, String(doc._id)]));
    const goalMap = new Map(goalDocs.map((doc) => [doc.slug, String(doc._id)]));
    const categoryMap = new Map(categoryDocs.map((doc) => [doc.slug, String(doc._id)]));

    await Muscle.bulkWrite(
      taxonomy.muscles.map((seed) => ({
        updateOne: {
          filter: { slug: seed.slug },
          update: {
            $set: {
              slug: seed.slug,
              name: seed.name,
              description: seed.description,
              imageUrl: seed.imageUrl,
              aliases: seed.aliases ?? [],
              categoryId: toObjectId(muscleCategoryMap.get(seed.categorySlug)),
              order: seed.order,
              isSystem: true,
              seedVersion: SYSTEM_SEED_VERSION,
            },
          },
          upsert: true,
        },
      })),
      { ordered: false },
    );

    const muscleDocs = await Muscle.find().select("_id slug categoryId").lean();
    const muscleMap = new Map(muscleDocs.map((doc) => [doc.slug, String(doc._id)]));
    const muscleCategoryByMuscleMap = new Map(
      muscleDocs.map((doc) => [doc.slug, doc.categoryId ? String(doc.categoryId) : ""]),
    );

    for (const seed of payload.exercises) {
      await Exercise.updateOne(
        { slug: seed.slug },
        {
          $set: {
            slug: seed.slug,
            name: seed.name,
            description: seed.description,
            instructionSteps: seed.instructionSteps,
            imageUrl: seed.imageUrl,
            imageAlt: seed.imageAlt,
            media: seed.media,
            aliases: seed.aliases,
            primaryEquipmentId: toNullableObjectId(equipmentMap.get(seed.primaryEquipmentSlug) ?? null),
            equipmentIds: compactObjectIds(seed.equipmentSlugs.map((slug) => equipmentMap.get(slug))),
            primaryMuscleIds: compactObjectIds(seed.primaryMuscleSlugs.map((slug) => muscleMap.get(slug))),
            secondaryMuscleIds: compactObjectIds(seed.secondaryMuscleSlugs.map((slug) => muscleMap.get(slug))),
            muscleCategoryIds: compactObjectIds(
              seed.muscleCategorySlugs.map(
                (slug) =>
                  muscleCategoryMap.get(slug) ||
                  muscleCategoryByMuscleMap.get(seed.primaryMuscleSlugs[0] ?? ""),
              ),
            ),
            goalIds: compactObjectIds(seed.goalSlugs.map((slug) => goalMap.get(slug))),
            levelId: toObjectId(levelMap.get(seed.levelSlug)),
            categoryIds: compactObjectIds(seed.categorySlugs.map((slug) => categoryMap.get(slug))),
            movementPattern: seed.movementPattern,
            source: seed.source,
            sourceUrl: seed.sourceUrl,
            reviewStatus: seed.reviewStatus,
            isSystem: true,
            seedVersion: SYSTEM_SEED_VERSION,
            isSearchable: seed.reviewStatus === "APPROVED",
          },
        },
        { upsert: true },
      );
    }

    const exerciseDocs = await Exercise.find().select("_id slug").lean();
    const exerciseMap = new Map(exerciseDocs.map((doc) => [doc.slug, String(doc._id)]));

    for (const draft of payload.sessionDrafts) {
      await WorkoutSession.updateOne(
        { slug: draft.slug, ownerType: "SYSTEM" },
        {
          $set: {
            slug: draft.slug,
            ownerType: "SYSTEM",
            ownerUserId: null,
            title: draft.title,
            description: draft.description,
            sourceUrl: draft.sourceUrl ?? "",
            seedVersion: SYSTEM_SEED_VERSION,
            exerciseEntries: draft.entries.map((entry) => ({
              exerciseId: toObjectId(exerciseMap.get(entry.exerciseSlug)),
              notes: entry.notes ?? "",
              sets: entry.sets,
            })),
          },
        },
        { upsert: true },
      );
    }

    const sessionMap = await dedupeSystemDocsBySlug(WorkoutSession, { ownerType: "SYSTEM" });

    for (const draft of payload.planDrafts) {
      await WorkoutPlan.updateOne(
        { slug: draft.slug, ownerType: "SYSTEM" },
        {
          $set: {
            slug: draft.slug,
            ownerType: "SYSTEM",
            ownerUserId: null,
            title: draft.title,
            description: draft.description,
            repeatEveryWeeks: draft.repeatEveryWeeks ?? 1,
            reminderTime: "06:30",
            timezone: "Asia/Ho_Chi_Minh",
            startDate: dayjs().startOf("day").toDate(),
            endDate: null,
            isActive: false,
            levelId: toObjectId(levelMap.get(draft.levelSlug)),
            goalId: toObjectId(goalMap.get(draft.goalSlug)),
            sourceUrl: draft.sourceUrl ?? "",
            seedVersion: SYSTEM_SEED_VERSION,
            scheduleEntries: draft.sessions.map((session) => ({
              weekday: session.weekday,
              time: session.time,
              workoutSessionId: toObjectId(sessionMap.get(session.sessionSlug)),
            })),
          },
        },
        { upsert: true },
      );
    }

    await dedupeSystemDocsBySlug(WorkoutPlan, { ownerType: "SYSTEM" });

    await pruneStaleSystemDocuments(payload);

    await SystemSeedState.updateOne(
      { key: SYSTEM_SEED_KEY },
      {
        $set: {
          version: SYSTEM_SEED_VERSION,
          checksum: payload.checksum,
          status: "READY",
          summary: payload.summary,
          lastAppliedAt: new Date(),
          lastError: "",
        },
      },
    );

    return payload.summary;
  } catch (error) {
    await SystemSeedState.updateOne(
      { key: SYSTEM_SEED_KEY },
      {
        $set: {
          version: SYSTEM_SEED_VERSION,
          checksum: payload.checksum,
          status: "FAILED",
          lastError: error instanceof Error ? error.message : "Unknown seed error",
        },
      },
      { upsert: true },
    );

    throw error;
  }
}

export async function cloneSystemPlanToUser({
  userId,
  systemPlanId,
}: {
  userId: string;
  systemPlanId: string;
}) {
  await connectToDatabase();

  const systemPlan = await WorkoutPlan.findOne({ _id: systemPlanId, ownerType: "SYSTEM" }).lean();
  if (!systemPlan) {
    throw new Error("Plan template not found.");
  }

  const sessionIds = systemPlan.scheduleEntries.map((entry) => String(entry.workoutSessionId));
  const systemSessions = await WorkoutSession.find({ _id: { $in: sessionIds } }).lean();
  const clonedSessionMap = new Map<string, string>();

  for (const session of systemSessions) {
    const created = await WorkoutSession.create({
      slug: null,
      ownerType: "USER",
      ownerUserId: userId,
      title: session.title,
      description: session.description,
      sourceUrl: session.sourceUrl ?? "",
      exerciseEntries: session.exerciseEntries,
    });
    clonedSessionMap.set(String(session._id), String(created._id));
  }

  await WorkoutPlan.updateMany(
    { ownerType: "USER", ownerUserId: userId, isActive: true },
    { $set: { isActive: false } },
  );

  const clonedPlan = await WorkoutPlan.create({
    slug: null,
    ownerType: "USER",
    ownerUserId: userId,
    title: systemPlan.title,
    description: systemPlan.description,
    repeatEveryWeeks: systemPlan.repeatEveryWeeks,
    reminderTime: systemPlan.reminderTime,
    timezone: systemPlan.timezone,
    startDate: dayjs().startOf("day").toDate(),
    endDate: null,
    isActive: true,
    levelId: systemPlan.levelId,
    goalId: systemPlan.goalId,
    sourceUrl: systemPlan.sourceUrl ?? "",
    scheduleEntries: systemPlan.scheduleEntries.map((entry) => ({
      weekday: entry.weekday,
      time: entry.time,
      workoutSessionId: clonedSessionMap.get(String(entry.workoutSessionId)),
    })),
  });

  await AppUser.findByIdAndUpdate(userId, {
    $set: {
      activePlanId: clonedPlan._id,
    },
  });

  await generateOccurrencesForPlan({
    userId,
    workoutPlanId: String(clonedPlan._id),
  });

  return clonedPlan;
}

export async function generateOccurrencesForPlan({
  userId,
  workoutPlanId,
}: {
  userId: string;
  workoutPlanId: string;
}) {
  await connectToDatabase();

  const [user, plan] = await Promise.all([
    AppUser.findById(userId).lean(),
    WorkoutPlan.findById(workoutPlanId).lean(),
  ]);

  if (!user || !plan) {
    throw new Error("User or workout plan not found.");
  }

  await WorkoutOccurrence.deleteMany({ userId, workoutPlanId });

  const start = dayjs().startOf("day");
  const end = start.add(42, "day");
  const occurrences = [];

  for (let cursor = start; cursor.isBefore(end); cursor = cursor.add(1, "day")) {
    const weekday = cursor.day();
    const entries = plan.scheduleEntries.filter((entry) => entry.weekday === weekday);

    for (const entry of entries) {
      const [hour, minute] = entry.time.split(":").map(Number);
      const scheduledFor = cursor.hour(hour).minute(minute).second(0).millisecond(0);
      const [reminderHour, reminderMinute] = (user.reminderTime || "06:30").split(":").map(Number);
      const notifyAt = cursor.hour(reminderHour).minute(reminderMinute).second(0).millisecond(0);

      occurrences.push({
        userId,
        workoutPlanId,
        workoutSessionId: entry.workoutSessionId,
        scheduledFor: scheduledFor.toDate(),
        notifyAt: notifyAt.toDate(),
        reminderStatus: "PENDING",
        status: "UPCOMING",
      });
    }
  }

  if (occurrences.length) {
    await WorkoutOccurrence.insertMany(occurrences);
  }
}

export async function seedUserWelcomeNotification(userId: string) {
  await Notification.create({
    userId,
    title: mirrorLocalized("Welcome to SableFit"),
    body: {
      en: "Your private mobile workout space is ready. Explore plans or build your first session.",
      vi: "Không gian tập luyện mobile của bạn đã sẵn sàng. Hãy khám phá plan mẫu hoặc tạo buổi tập đầu tiên.",
    },
    type: "SYSTEM",
    actionHref: "/app/today",
  });
}
