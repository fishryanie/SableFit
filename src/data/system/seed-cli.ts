import { loadEnvConfig } from "@next/env";

async function main() {
  loadEnvConfig(process.cwd());
  const { ensureSystemSeed } = await import("@/data/system/seed");
  const force = process.argv.includes("--force");
  const summary = await ensureSystemSeed({ force });
  console.log("[seed] SableFit system data ready.");
  console.log(JSON.stringify(summary, null, 2));
}

main().catch((error) => {
  console.error("[seed] failed", error);
  process.exit(1);
});
