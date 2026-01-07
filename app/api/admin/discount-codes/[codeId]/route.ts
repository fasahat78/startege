import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { DiscountCodeStatus } from "@prisma/client";

export const dynamic = 'force-dynamic';

// GET - Get single discount code
export async function GET(
  request: Request,
  { params }: { params: Promise<{ codeId: string }> }
) {
  try {
    await requireAdmin();
    const { codeId } = await params;

    const code = await prisma.discountCode.findUnique({
      where: { id: codeId },
      include: {
        usages: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        _count: {
          select: {
            usages: true,
          },
        },
      },
    });

    if (!code) {
      return NextResponse.json({ error: "Discount code not found" }, { status: 404 });
    }

    return NextResponse.json({ code });
  } catch (error: any) {
    console.error("Error fetching discount code:", error);
    if (error.message === "Admin access required" || error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: error.message || "Failed to fetch discount code" },
      { status: 500 }
    );
  }
}

// PATCH - Update discount code
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ codeId: string }> }
) {
  try {
    await requireAdmin();
    const { codeId } = await params;
    const body = await request.json();

    const {
      description,
      status,
      maxUses,
      maxUsesPerUser,
      applicableToPlanTypes,
      minAmount,
      validFrom,
      validUntil,
      notes,
    } = body;

    const updateData: any = {};
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status as DiscountCodeStatus;
    if (maxUses !== undefined) updateData.maxUses = maxUses;
    if (maxUsesPerUser !== undefined) updateData.maxUsesPerUser = maxUsesPerUser;
    if (applicableToPlanTypes !== undefined) updateData.applicableToPlanTypes = applicableToPlanTypes;
    if (minAmount !== undefined) updateData.minAmount = minAmount;
    if (validFrom !== undefined) updateData.validFrom = new Date(validFrom);
    if (validUntil !== undefined) updateData.validUntil = validUntil ? new Date(validUntil) : null;
    if (notes !== undefined) updateData.notes = notes;

    const code = await prisma.discountCode.update({
      where: { id: codeId },
      data: updateData,
    });

    return NextResponse.json({ code });
  } catch (error: any) {
    console.error("Error updating discount code:", error);
    if (error.message === "Admin access required" || error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: error.message || "Failed to update discount code" },
      { status: 500 }
    );
  }
}

// DELETE - Delete discount code (soft delete by setting status to INACTIVE)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ codeId: string }> }
) {
  try {
    await requireAdmin();
    const { codeId } = await params;

    const code = await prisma.discountCode.update({
      where: { id: codeId },
      data: {
        status: DiscountCodeStatus.INACTIVE,
      },
    });

    return NextResponse.json({ code });
  } catch (error: any) {
    console.error("Error deleting discount code:", error);
    if (error.message === "Admin access required" || error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: error.message || "Failed to delete discount code" },
      { status: 500 }
    );
  }
}

