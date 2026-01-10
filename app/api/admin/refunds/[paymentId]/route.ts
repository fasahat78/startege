import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";

/**
 * GET /api/admin/refunds/[paymentId]
 * Get refund details for a specific payment
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  try {
    await requireAdmin();

    const { paymentId } = await params;

    const payment = await (prisma as any).payment.findUnique({
      where: { id: paymentId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    return NextResponse.json({ payment });
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Admin access required") {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("Error fetching payment refund details:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch payment details" },
      { status: 500 }
    );
  }
}

