import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/firebase-auth-helpers";
import { validateDiscountCode } from "@/lib/discount-codes";

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { code, planType, amount } = body;

    if (!code || !planType || !amount) {
      return NextResponse.json(
        { error: "Missing required fields: code, planType, amount" },
        { status: 400 }
      );
    }

    const result = await validateDiscountCode(code, planType, amount);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error validating discount code:", error);
    return NextResponse.json(
      { error: error.message || "Failed to validate discount code" },
      { status: 500 }
    );
  }
}

