import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { DiscountCodeType, DiscountCodeStatus } from "@prisma/client";

export const dynamic = 'force-dynamic';

// GET - List all discount codes
export async function GET(request: Request) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const tier = searchParams.get("tier");

    const where: any = {};
    if (status) {
      where.status = status as DiscountCodeStatus;
    }
    if (tier) {
      where.earlyAdopterTier = tier;
    }

    const codes = await prisma.discountCode.findMany({
      where,
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
          take: 10, // Latest 10 usages
        },
        _count: {
          select: {
            usages: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ codes });
  } catch (error: any) {
    console.error("Error fetching discount codes:", error);
    if (error.message === "Admin access required" || error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: error.message || "Failed to fetch discount codes" },
      { status: 500 }
    );
  }
}

// POST - Create new discount code
export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();
    const body = await request.json();

    const {
      code,
      description,
      type,
      value,
      maxUses,
      maxUsesPerUser,
      applicableToPlanTypes,
      minAmount,
      validFrom,
      validUntil,
      earlyAdopterTier,
      notes,
    } = body;

    if (!code || !type || value === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: code, type, value" },
        { status: 400 }
      );
    }

    // Validate value based on type
    if (type === DiscountCodeType.PERCENTAGE && (value < 0 || value > 100)) {
      return NextResponse.json(
        { error: "Percentage value must be between 0 and 100" },
        { status: 400 }
      );
    }

    const discountCode = await prisma.discountCode.create({
      data: {
        code: code.toUpperCase(),
        description,
        type: type as DiscountCodeType,
        value,
        status: DiscountCodeStatus.ACTIVE,
        maxUses,
        maxUsesPerUser: maxUsesPerUser || 1,
        applicableToPlanTypes: applicableToPlanTypes || ["both"],
        minAmount,
        validFrom: validFrom ? new Date(validFrom) : new Date(),
        validUntil: validUntil ? new Date(validUntil) : null,
        earlyAdopterTier,
        createdBy: admin.id,
        notes,
      },
    });

    return NextResponse.json({ code: discountCode }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating discount code:", error);
    if (error.message === "Admin access required" || error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error.code === "P2002") {
      return NextResponse.json({ error: "Discount code already exists" }, { status: 400 });
    }
    return NextResponse.json(
      { error: error.message || "Failed to create discount code" },
      { status: 500 }
    );
  }
}

