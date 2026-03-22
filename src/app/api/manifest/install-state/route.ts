import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as {
    dismissed?: boolean;
    installed?: boolean;
  } | null;

  const response = NextResponse.json({ ok: true });

  if (payload?.dismissed !== undefined) {
    response.cookies.set("SABLEFIT_INSTALL_DISMISSED", payload.dismissed ? "1" : "0", {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  }

  if (payload?.installed !== undefined) {
    response.cookies.set("SABLEFIT_INSTALLED", payload.installed ? "1" : "0", {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  }

  return response;
}
