import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { PushSubscription } from "@/models/auth";
import { Notification, WorkoutOccurrence } from "@/models/workouts";
import { sendWebPushNotification } from "@/lib/push";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace(/^Bearer\s+/i, "") ?? "";
  const expected = process.env.CRON_SECRET || "";

  if (expected && token !== expected) {
    return NextResponse.json({ ok: false, message: "Forbidden." }, { status: 403 });
  }

  await connectToDatabase();
  const now = new Date();
  const dueOccurrences = await WorkoutOccurrence.find({
    notifyAt: { $lte: now },
    reminderStatus: "PENDING",
  })
    .populate("workoutSessionId", "title")
    .lean();

  let sent = 0;
  let skipped = 0;

  for (const occurrence of dueOccurrences) {
    const workoutSession = occurrence.workoutSessionId as { title?: { en: string; vi: string } } | null;
    const title = workoutSession?.title ?? { en: "Workout", vi: "Buổi tập" };

    await Notification.create({
      userId: occurrence.userId,
      title: {
        en: `Today's workout: ${title.en}`,
        vi: `Lịch tập hôm nay: ${title.vi}`,
      },
      body: {
        en: "Open SableFit to review your session and stay on schedule.",
        vi: "Mở SableFit để xem buổi tập và giữ đúng lịch của bạn.",
      },
      type: "REMINDER",
      actionHref: "/app/today",
      occurrenceId: occurrence._id,
    });

    const subscriptions = await PushSubscription.find({
      userId: occurrence.userId,
      status: "ACTIVE",
      isPwaInstalled: true,
    }).lean();

    if (!subscriptions.length) {
      await WorkoutOccurrence.updateOne(
        { _id: occurrence._id },
        { $set: { reminderStatus: "SKIPPED" } },
      );
      skipped += 1;
      continue;
    }

    await Promise.all(
      subscriptions.map(async (subscription) => {
        try {
          if (!subscription.keys?.auth || !subscription.keys?.p256dh) {
            return;
          }

          await sendWebPushNotification(
            {
              endpoint: subscription.endpoint,
              keys: subscription.keys,
            },
            {
              title: subscription.locale === "vi" ? `Lịch tập hôm nay: ${title.vi}` : `Today's workout: ${title.en}`,
              body:
                subscription.locale === "vi"
                  ? "Mở SableFit để vào buổi tập và giữ nhịp tập."
                  : "Open SableFit to start the session and stay on rhythm.",
              url: "/app/today",
            },
          );
        } catch (error) {
          console.error("[cron/reminders] web push failed", error);
        }
      }),
    );

    await WorkoutOccurrence.updateOne(
      { _id: occurrence._id },
      { $set: { reminderStatus: "SENT" } },
    );
    await Notification.updateMany(
      { occurrenceId: occurrence._id, pushDeliveredAt: null },
      { $set: { pushDeliveredAt: new Date() } },
    );
    sent += 1;
  }

  return NextResponse.json({ ok: true, sent, skipped, total: dueOccurrences.length });
}
