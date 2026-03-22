import { Buffer } from "node:buffer";
import { NextRequest, NextResponse } from "next/server";
import { extractUiReviewReport, uiReviewJsonSchema } from "@/lib/ui-review";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "0.0.0.0"]);
const MAX_SCREENSHOTS = 4;

function isLocalDevRequest(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return false;
  }

  const host = request.headers.get("host")?.split(":")[0] ?? "";
  return LOCAL_HOSTS.has(host);
}

function toCleanString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

async function fileToDataUrl(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer()).toString("base64");
  const mimeType = file.type || "image/png";
  return `data:${mimeType};base64,${buffer}`;
}

function buildPrompt({
  pageUrl,
  viewport,
  notes,
  screenshotCount,
}: {
  pageUrl: string;
  viewport: string;
  notes: string;
  screenshotCount: number;
}) {
  return [
    "You are a strict senior product designer and frontend QA reviewer.",
    "Audit the UI in the provided screenshots and return JSON only.",
    "Prioritize layout breakage, overlapping layers, clipping, unreadable content, poor spacing, weak information hierarchy, confusing navigation, broken localization, and bad desktop/mobile adaptation.",
    "Call out issues even if they seem obvious. If the interface feels broken or unfinished, say so clearly.",
    `Page URL: ${pageUrl || "unknown"}`,
    `Viewport target: ${viewport || "desktop"}`,
    `Screenshot count: ${screenshotCount}`,
    notes ? `Extra context from developer: ${notes}` : "",
    "Scoring rules:",
    "- 90-100: strong, polished UI with only small refinements",
    "- 70-89: usable but clear quality issues remain",
    "- 40-69: major product/design problems that should be fixed before review",
    "- 0-39: severely broken layout or interaction design",
    "Issue rules:",
    "- severity=critical when layout is visibly broken or blocks basic usage",
    "- severity=high when UX is confusing or visually unstable",
    "- severity=medium when quality is acceptable but clearly rough",
    "- severity=low for polish improvements",
    "Keep recommendations practical and specific for a frontend engineer.",
  ]
    .filter(Boolean)
    .join("\n");
}

export async function POST(request: NextRequest) {
  if (!isLocalDevRequest(request)) {
    return NextResponse.json({ ok: false, message: "Not available." }, { status: 404 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        ok: false,
        message: "Missing OPENAI_API_KEY. Add it to your local env to enable AI UI review.",
      },
      { status: 503 },
    );
  }

  const formData = await request.formData();
  const pageUrl = toCleanString(formData.get("pageUrl"));
  const viewport = toCleanString(formData.get("viewport")) || "desktop";
  const notes = toCleanString(formData.get("notes"));
  const screenshotFiles = formData
    .getAll("screenshots")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0)
    .slice(0, MAX_SCREENSHOTS);

  if (!screenshotFiles.length) {
    return NextResponse.json(
      { ok: false, message: "Upload at least one screenshot before running the audit." },
      { status: 400 },
    );
  }

  const model = process.env.OPENAI_UI_REVIEW_MODEL || "gpt-4.1-mini";
  const prompt = buildPrompt({
    pageUrl,
    viewport,
    notes,
    screenshotCount: screenshotFiles.length,
  });

  const images = await Promise.all(
    screenshotFiles.map(async (file) => ({
      type: "input_image" as const,
      image_url: await fileToDataUrl(file),
      detail: "high" as const,
    })),
  );

  const upstreamResponse = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      input: [
        {
          role: "user",
          content: [
            { type: "input_text", text: prompt },
            ...images,
          ],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "ui_review_report",
          strict: true,
          schema: uiReviewJsonSchema,
        },
      },
    }),
  });

  if (!upstreamResponse.ok) {
    const detail = await upstreamResponse.text();
    return NextResponse.json(
      {
        ok: false,
        message: "OpenAI review request failed.",
        detail,
      },
      { status: 502 },
    );
  }

  const payload = (await upstreamResponse.json()) as unknown;
  const report = extractUiReviewReport(payload);

  return NextResponse.json({
    ok: true,
    model,
    viewport,
    screenshotCount: screenshotFiles.length,
    report,
  });
}
