import { NextResponse } from "next/server";
import { cloneSystemPlanToUser } from "@/data/system/seed";
import { getAuthSession } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await getAuthSession();
  if (!session) {
    return NextResponse.json({ ok: false, message: "Unauthorized." }, { status: 401 });
  }

  const payload = (await request.json().catch(() => null)) as { systemPlanId?: string } | null;
  if (!payload?.systemPlanId) {
    return NextResponse.json({ ok: false, message: "Missing system plan id." }, { status: 400 });
  }

  try {
    const plan = await cloneSystemPlanToUser({
      userId: session.user.id,
      systemPlanId: payload.systemPlanId,
    });

    return NextResponse.json({ ok: true, id: String(plan._id) });
  } catch (error) {
    console.error("[plans/clone]", error);
    return NextResponse.json({ ok: false, message: "Could not activate the template." }, { status: 500 });
  }
}
