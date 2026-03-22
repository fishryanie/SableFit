import { NextRequest, NextResponse } from "next/server";
import { createSessionForUser } from "@/lib/auth";
import { ensureSystemSeed } from "@/data/system/seed";
import { connectToDatabase } from "@/lib/mongodb";
import { AppUser } from "@/models/auth";
import { isAppLocale } from "@/i18n/config";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "0.0.0.0"]);

function isLocalDevRequest(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return false;
  }

  const host = request.headers.get("host")?.split(":")[0] ?? "";
  return LOCAL_HOSTS.has(host);
}

function getSafeRedirect(request: NextRequest) {
  const redirect = request.nextUrl.searchParams.get("redirect")?.trim();

  if (!redirect || !redirect.startsWith("/")) {
    return "/app/review";
  }

  return redirect;
}

function buildLocalRedirectUrl(request: NextRequest) {
  const hostHeader =
    request.headers.get("x-forwarded-host") ??
    request.headers.get("host") ??
    request.nextUrl.host;
  const protocol =
    request.headers.get("x-forwarded-proto") ??
    request.nextUrl.protocol.replace(":", "") ??
    "http";

  return new URL(getSafeRedirect(request), `${protocol}://${hostHeader}`);
}

export async function GET(request: NextRequest) {
  if (!isLocalDevRequest(request)) {
    return NextResponse.json({ ok: false, message: "Not available." }, { status: 404 });
  }

  await ensureSystemSeed();
  await connectToDatabase();

  const localeParam = request.nextUrl.searchParams.get("locale");
  const locale = isAppLocale(localeParam) ? localeParam : "vi";
  const timezone = request.nextUrl.searchParams.get("timezone")?.trim() || "Asia/Ho_Chi_Minh";
  const displayName = request.nextUrl.searchParams.get("name")?.trim() || "Local Review";

  const user = await AppUser.findOneAndUpdate(
    { firebaseUid: "local-dev-review" },
    {
      $set: {
        phoneE164: "+84000000000",
        displayName,
        locale,
        timezone,
        onboardingCompleted: true,
        lastLoginAt: new Date(),
      },
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    },
  );

  await createSessionForUser(String(user._id));

  return NextResponse.redirect(buildLocalRedirectUrl(request));
}
