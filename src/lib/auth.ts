import "server-only";

import { AppUser, AppUserSession } from "@/models/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { createHash, randomBytes } from "node:crypto";

export const SESSION_COOKIE_NAME = "SABLEFIT_SESSION";

const SESSION_DURATION_DAYS = 21;

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSessionForUser(userId: string) {
  await connectToDatabase();

  const rawToken = randomBytes(32).toString("base64url");
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000);
  const headerStore = await headers();

  await AppUserSession.create({
    userId,
    tokenHash,
    userAgent: headerStore.get("user-agent") ?? "",
    ipAddress: headerStore.get("x-forwarded-for") ?? "",
    expiresAt,
    lastSeenAt: new Date(),
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, rawToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export async function clearAuthSession() {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (rawToken) {
    await connectToDatabase();
    await AppUserSession.deleteOne({ tokenHash: hashToken(rawToken) });
  }

  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getAuthSession() {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!rawToken) {
    return null;
  }

  await connectToDatabase();
  const tokenHash = hashToken(rawToken);
  const session = await AppUserSession.findOne({
    tokenHash,
    expiresAt: { $gt: new Date() },
  }).lean();

  if (!session) {
    return null;
  }

  const user = await AppUser.findById(session.userId).lean();
  if (!user) {
    return null;
  }

  return {
    user: {
      id: String(user._id),
      firebaseUid: user.firebaseUid,
      phoneE164: user.phoneE164,
      displayName: user.displayName,
      locale: user.locale,
      timezone: user.timezone,
      reminderTime: user.reminderTime,
      activePlanId: user.activePlanId ? String(user.activePlanId) : null,
    },
    sessionId: String(session._id),
  };
}

export async function requireAuthSession() {
  const session = await getAuthSession();
  if (!session) {
    redirect("/auth/phone");
  }

  return session;
}
