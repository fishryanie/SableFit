import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { WorkoutLog, WorkoutOccurrence, WorkoutSession } from "@/models/workouts";

type CompletionPayload = {
  notes?: string;
  exerciseResults?: Array<{
    exerciseId: string;
    sets: Array<{
      order: number;
      repsCompleted: number;
      loadText?: string;
      completed?: boolean;
    }>;
  }>;
};

export async function POST(
  request: Request,
  { params }: { params: Promise<{ occurrenceId: string }> },
) {
  const session = await getAuthSession();
  if (!session) {
    return NextResponse.json({ ok: false, message: "Unauthorized." }, { status: 401 });
  }

  const { occurrenceId } = await params;
  const payload = (await request.json().catch(() => null)) as CompletionPayload | null;

  await connectToDatabase();
  const occurrence = await WorkoutOccurrence.findOne({ _id: occurrenceId, userId: session.user.id }).lean();
  if (!occurrence) {
    return NextResponse.json({ ok: false, message: "Occurrence not found." }, { status: 404 });
  }

  const workoutSession = await WorkoutSession.findById(occurrence.workoutSessionId).lean();
  if (!workoutSession) {
    return NextResponse.json({ ok: false, message: "Workout session not found." }, { status: 404 });
  }

  const exerciseResults =
    payload?.exerciseResults && payload.exerciseResults.length
      ? payload.exerciseResults
      : workoutSession.exerciseEntries.map((entry) => ({
          exerciseId: String(entry.exerciseId),
          sets: entry.sets.map((set) => ({
            order: set.order,
            repsCompleted: set.repsTarget,
            loadText: set.loadText,
            completed: true,
          })),
        }));

  await WorkoutLog.updateOne(
    { occurrenceId: occurrence._id },
    {
      $set: {
        userId: session.user.id,
        occurrenceId: occurrence._id,
        workoutSessionId: occurrence.workoutSessionId,
        startedAt: occurrence.scheduledFor,
        completedAt: new Date(),
        notes: payload?.notes?.trim() || "",
        exerciseResults,
      },
    },
    { upsert: true },
  );

  await WorkoutOccurrence.updateOne(
    { _id: occurrence._id },
    { $set: { status: "COMPLETED", completedAt: new Date() } },
  );

  return NextResponse.json({ ok: true });
}
