import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { PushSubscription } from "@/models/auth";
import { isAppLocale } from "@/i18n/config";

type IncomingSubscription = {
  endpoint: string;
  keys: {
    auth: string;
    p256dh: string;
  };
  platform?: string;
  locale?: string;
  timezone?: string;
  isPwaInstalled?: boolean;
};

export async function POST(request: Request) {
  const session = await getAuthSession();
  if (!session) {
    return NextResponse.json({ ok: false, message: "Unauthorized." }, { status: 401 });
  }

  const payload = (await request.json().catch(() => null)) as IncomingSubscription | null;
  if (!payload?.endpoint || !payload.keys?.auth || !payload.keys?.p256dh) {
    return NextResponse.json({ ok: false, message: "Invalid subscription payload." }, { status: 400 });
  }

  await connectToDatabase();

  await PushSubscription.findOneAndUpdate(
    { endpoint: payload.endpoint },
    {
      $set: {
        userId: session.user.id,
        endpoint: payload.endpoint,
        keys: payload.keys,
        platform: payload.platform ?? "web",
        locale: isAppLocale(payload.locale) ? payload.locale : session.user.locale,
        timezone: payload.timezone ?? session.user.timezone,
        isPwaInstalled: Boolean(payload.isPwaInstalled),
        lastConfirmedAt: new Date(),
        status: "ACTIVE",
      },
    },
    { upsert: true, new: true },
  );

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const session = await getAuthSession();
  if (!session) {
    return NextResponse.json({ ok: false, message: "Unauthorized." }, { status: 401 });
  }

  const payload = (await request.json().catch(() => null)) as { endpoint?: string } | null;
  if (!payload?.endpoint) {
    return NextResponse.json({ ok: false, message: "Missing endpoint." }, { status: 400 });
  }

  await connectToDatabase();
  await PushSubscription.updateOne(
    { userId: session.user.id, endpoint: payload.endpoint },
    { $set: { status: "INACTIVE" } },
  );

  return NextResponse.json({ ok: true });
}
