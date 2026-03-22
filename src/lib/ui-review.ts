export type UiReviewSeverity = "critical" | "high" | "medium" | "low";

export type UiReviewIssue = {
  severity: UiReviewSeverity;
  title: string;
  evidence: string;
  impact: string;
  recommendation: string;
};

export type UiReviewReport = {
  summary: string;
  score: number;
  positives: string[];
  issues: UiReviewIssue[];
  nextActions: string[];
};

export const uiReviewJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["summary", "score", "positives", "issues", "nextActions"],
  properties: {
    summary: { type: "string" },
    score: { type: "number" },
    positives: {
      type: "array",
      items: { type: "string" },
    },
    issues: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["severity", "title", "evidence", "impact", "recommendation"],
        properties: {
          severity: {
            type: "string",
            enum: ["critical", "high", "medium", "low"],
          },
          title: { type: "string" },
          evidence: { type: "string" },
          impact: { type: "string" },
          recommendation: { type: "string" },
        },
      },
    },
    nextActions: {
      type: "array",
      items: { type: "string" },
    },
  },
} as const;

function isSeverity(value: unknown): value is UiReviewSeverity {
  return value === "critical" || value === "high" || value === "medium" || value === "low";
}

export function isUiReviewReport(value: unknown): value is UiReviewReport {
  if (!value || typeof value !== "object") {
    return false;
  }

  const report = value as Record<string, unknown>;
  return (
    typeof report.summary === "string" &&
    typeof report.score === "number" &&
    Array.isArray(report.positives) &&
    report.positives.every((item) => typeof item === "string") &&
    Array.isArray(report.nextActions) &&
    report.nextActions.every((item) => typeof item === "string") &&
    Array.isArray(report.issues) &&
    report.issues.every((item) => {
      if (!item || typeof item !== "object") {
        return false;
      }

      const issue = item as Record<string, unknown>;
      return (
        isSeverity(issue.severity) &&
        typeof issue.title === "string" &&
        typeof issue.evidence === "string" &&
        typeof issue.impact === "string" &&
        typeof issue.recommendation === "string"
      );
    })
  );
}

export function extractUiReviewReport(payload: unknown) {
  const response = payload as {
    output_text?: string;
    output?: Array<{
      content?: Array<{
        type?: string;
        text?: string;
      }>;
    }>;
  } | null;

  const directText = response?.output_text;
  if (typeof directText === "string" && directText.trim()) {
    const parsed = JSON.parse(directText) as unknown;
    if (isUiReviewReport(parsed)) {
      return parsed;
    }
  }

  const nestedText = response?.output
    ?.flatMap((item) => item.content ?? [])
    .find((item) => item.type === "output_text" && typeof item.text === "string")
    ?.text;

  if (typeof nestedText === "string" && nestedText.trim()) {
    const parsed = JSON.parse(nestedText) as unknown;
    if (isUiReviewReport(parsed)) {
      return parsed;
    }
  }

  throw new Error("Could not parse UI review response.");
}
