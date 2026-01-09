import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  const dbUrl = process.env.DATABASE_URL;
  const maskedUrl = dbUrl ? dbUrl.replace(/:([^:@]+)@/, ":***@") : "NOT SET";

  return NextResponse.json({
    DATABASE_URL: {
      present: !!dbUrl,
      length: dbUrl?.length || 0,
      startsWith: dbUrl?.substring(0, 30) || "N/A",
      endsWith: dbUrl?.substring(Math.max(0, (dbUrl?.length || 0) - 50)) || "N/A",
      hasCloudsql: dbUrl?.includes("/cloudsql/") || false,
      has127001: dbUrl?.includes("127.0.0.1:5435") || false,
      masked: maskedUrl,
    },
    nodeEnv: process.env.NODE_ENV,
    nextPhase: process.env.NEXT_PHASE,
  });
}

