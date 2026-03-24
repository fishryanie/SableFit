import { NextResponse } from "next/server";
import { createSessionForUser } from "@/lib/auth";
import { verifyFirebaseIdToken } from "@/lib/firebase-admin";
import { connectToDatabase } from "@/lib/mongodb";
import { ensureSystemSeed, seedUserWelcomeNotification } from "@/data/system/seed";
import { AppUser } from "@/models/auth";
import { isAppLocale } from "@/i18n/config";

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as {
    idToken?: string;
    displayName?: string;
    locale?: string;
    timezone?: string;
  } | null;

  if (!payload?.idToken) {
    return NextResponse.json({ ok: false, message: "Missing Firebase ID token." }, { status: 400 });
  }

  try {
    await ensureSystemSeed();
    await connectToDatabase();
    const decoded = await verifyFirebaseIdToken(payload.idToken);

    if (!decoded.phone_number) {
      return NextResponse.json(
        { ok: false, message: "Phone number is missing from the Firebase identity." },
        { status: 400 },
      );
    }

    const locale = isAppLocale(payload.locale) ? payload.locale : "vi";
    const displayName = payload.displayName?.trim() || decoded.phone_number;
    const timezone = payload.timezone?.trim() || "Asia/Ho_Chi_Minh";

    const existing = await AppUser.findOne({ firebaseUid: decoded.uid }).lean();
    const user = await AppUser.findOneAndUpdate(
      { firebaseUid: decoded.uid },
      {
        $set: {
          phoneE164: decoded.phone_number,
          displayName,
          locale,
          timezone,
          lastLoginAt: new Date(),
        },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      },
    );

    if (!existing) {
      await seedUserWelcomeNotification(String(user._id));
    }

    await createSessionForUser(String(user._id));
    return NextResponse.json({ ok: true, userId: String(user._id) });
  } catch (error) {
    console.error("[auth/session]", error);
    const message = error instanceof Error ? error.message : "Could not create session.";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
