import { NextRequest, NextResponse } from "next/server";

export function apiAuthMiddleware(req: NextRequest) {
  const cronSecret = process.env.PREBUILT_CRON_SECRET;
  const token = req.headers.get("prebuilt-cron-secret"); // or req.query.secret

  if (!token || token !== cronSecret) {
    return NextResponse.json({ error: `Unauthorized` }, { status: 401 });
  }

  return NextResponse.next();
}
