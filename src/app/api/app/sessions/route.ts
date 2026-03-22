import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { Exercise } from "@/models/catalog";
import { WorkoutSession } from "@/models/workouts";

type SessionPayload = {
  title?: string;
  description?: string;
  entries?: Array<{
    exerciseId: string;
    notes?: string;
    sets?: Array<{
      order: number;
      repsTarget: number;
      restSec: number;
      loadText?: string;
    }>;
  }>;
};

export async function POST(request: Request) {
  const session = await getAuthSession();
  if (!session) {
    return NextResponse.json({ ok: false, message: "Unauthorized." }, { status: 401 });
  }

  const payload = (await request.json().catch(() => null)) as SessionPayload | null;
  if (!payload?.title?.trim() || !payload.entries?.length) {
    return NextResponse.json({ ok: false, message: "Title and exercise entries are required." }, { status: 400 });
  }

  await connectToDatabase();

  const exerciseIds = payload.entries.map((entry) => entry.exerciseId);
  const existing = await Exercise.countDocuments({ _id: { $in: exerciseIds } }).exec();
  if (existing !== exerciseIds.length) {
    return NextResponse.json({ ok: false, message: "One or more exercise selections are invalid." }, { status: 400 });
  }

  const created = await WorkoutSession.create({
    ownerType: "USER",
    ownerUserId: session.user.id,
    title: { en: payload.title.trim(), vi: payload.title.trim() },
    description: {
      en: payload.description?.trim() || payload.title.trim(),
      vi: payload.description?.trim() || payload.title.trim(),
    },
    exerciseEntries: payload.entries.map((entry) => ({
      exerciseId: entry.exerciseId,
      notes: entry.notes?.trim() || "",
      sets:
        entry.sets?.map((set, index) => ({
          order: set.order || index + 1,
          repsTarget: Number(set.repsTarget) || 10,
          restSec: Number(set.restSec) || 60,
          loadText: set.loadText?.trim() || "",
        })) ?? [],
    })),
  });

  return NextResponse.json({ ok: true, id: String(created._id) });
}
