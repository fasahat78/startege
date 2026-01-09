import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const adminStatus = await isAdmin();
    return NextResponse.json({ isAdmin: adminStatus });
  } catch (error: any) {
    console.error("Error checking admin status:", error);
    return NextResponse.json({ isAdmin: false }, { status: 500 });
  }
}

