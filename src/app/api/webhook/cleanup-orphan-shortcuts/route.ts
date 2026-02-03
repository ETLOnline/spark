

import { NextResponse } from "next/server";
import { runOrphanCleanup } from "@/src/services/cleanup/shortcuts/cleanup.runner";

const CRON_SECRET = process.env.CRON_SECRET;

function isAuthorised(request: Request): boolean {
  const authHeader = request.headers.get("Authorization");
  if (!CRON_SECRET) {
    if (process.env.NODE_ENV === "production") return false;
    console.warn("[cron] CRON_SECRET is not set. Allowing in dev mode.");
    return true;
  }
  return authHeader === `Bearer ${CRON_SECRET}`;
}

export async function POST(request: Request): Promise<NextResponse> {
  if (!isAuthorised(request)) {
    return NextResponse.json(
      { error: "Unauthorised" },
      { status: 401 }
    );
  }

  console.log("[cron] orphan-shortcut cleanup started …");

  const report = await runOrphanCleanup();

  console.log(
    `[cron] cleanup finished — checked: ${report.totalChecked}, ` +
    `deleted: ${report.totalDeleted}, errors: ${report.errors.length}`
  );

  return NextResponse.json(report, { status: 200 });
}