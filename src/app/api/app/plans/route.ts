import { NextResponse } from "next/server";
import { generateOccurrencesForPlan } from "@/data/system/seed";
import { getAuthSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { AppUser } from "@/models/auth";
import { WorkoutPlan } from "@/models/workouts";

type PlanPayload = {
  title?: string;
  description?: string;
  levelId?: string;
  goalId?: string;
  reminderTime?: string;
  activate?: boolean;
  scheduleEntries?: Array<{
    weekday: number;
    time: string;
    workoutSessionId: string;
  }>;
};

export async function POST(request: Request) {
  const session = await getAuthSession();
  if (!session) {
    return NextResponse.json({ ok: false, message: "Unauthorized." }, { status: 401 });
  }

  const payload = (await request.json().catch(() => null)) as PlanPayload | null;
  if (!payload?.title?.trim() || !payload.levelId || !payload.goalId || !payload.scheduleEntries?.length) {
    return NextResponse.json({ ok: false, message: "Plan title, level, goal, and schedule are required." }, { status: 400 });
  }

  await connectToDatabase();

  if (payload.activate) {
    await WorkoutPlan.updateMany(
      { ownerUserId: session.user.id, isActive: true },
      { $set: { isActive: false } },
    );
  }

  const created = await WorkoutPlan.create({
    ownerType: "USER",
    ownerUserId: session.user.id,
    title: { en: payload.title.trim(), vi: payload.title.trim() },
    description: {
      en: payload.description?.trim() || payload.title.trim(),
      vi: payload.description?.trim() || payload.title.trim(),
    },
    repeatEveryWeeks: 1,
    reminderTime: payload.reminderTime?.trim() || session.user.reminderTime,
    timezone: session.user.timezone,
    startDate: new Date(),
    endDate: null,
    isActive: Boolean(payload.activate),
    levelId: payload.levelId,
    goalId: payload.goalId,
    scheduleEntries: payload.scheduleEntries,
  });

  if (payload.activate) {
    await AppUser.findByIdAndUpdate(session.user.id, {
      $set: {
        activePlanId: created._id,
        reminderTime: payload.reminderTime?.trim() || session.user.reminderTime,
      },
    });

    await generateOccurrencesForPlan({
      userId: session.user.id,
      workoutPlanId: String(created._id),
    });
  }

  return NextResponse.json({ ok: true, id: String(created._id) });
}
