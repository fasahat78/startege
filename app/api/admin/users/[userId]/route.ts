import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { UserRole, EarlyAdopterTier } from "@prisma/client";

export const dynamic = 'force-dynamic';

// GET - Get single user details
export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    await requireAdmin();
    const { userId } = await params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: true,
        aiCredit: true,
        profile: true,
        referralsGiven: {
          include: {
            referee: {
              select: {
                id: true,
                email: true,
                name: true,
                createdAt: true,
              },
            },
          },
        },
        referralReceived: {
          include: {
            referrer: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
        },
        discountCodeUsages: {
          include: {
            discountCode: {
              select: {
                code: true,
                description: true,
              },
            },
          },
        },
        _count: {
          select: {
            challengeAttempts: true,
            examAttempts: true,
            aigpExamAttempts: true,
            agentConversations: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error: any) {
    console.error("Error fetching user:", error);
    if (error.message === "Admin access required" || error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: error.message || "Failed to fetch user" },
      { status: 500 }
    );
  }
}

// PATCH - Update user (admin)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    await requireAdmin();
    const { userId } = await params;
    const body = await request.json();

    const {
      role,
      isAdmin,
      isEarlyAdopter,
      earlyAdopterTier,
      earlyAdopterStartDate,
      earlyAdopterEndDate,
      subscriptionTier,
    } = body;

    const updateData: any = {};
    if (role !== undefined) updateData.role = role as UserRole;
    if (isAdmin !== undefined) updateData.isAdmin = isAdmin;
    if (isEarlyAdopter !== undefined) updateData.isEarlyAdopter = isEarlyAdopter;
    if (earlyAdopterTier !== undefined) updateData.earlyAdopterTier = earlyAdopterTier as EarlyAdopterTier | null;
    if (earlyAdopterStartDate !== undefined) updateData.earlyAdopterStartDate = earlyAdopterStartDate ? new Date(earlyAdopterStartDate) : null;
    if (earlyAdopterEndDate !== undefined) updateData.earlyAdopterEndDate = earlyAdopterEndDate ? new Date(earlyAdopterEndDate) : null;
    if (subscriptionTier !== undefined) updateData.subscriptionTier = subscriptionTier;

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isAdmin: true,
        isEarlyAdopter: true,
        earlyAdopterTier: true,
        subscriptionTier: true,
      },
    });

    return NextResponse.json({ user });
  } catch (error: any) {
    console.error("Error updating user:", error);
    if (error.message === "Admin access required" || error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: error.message || "Failed to update user" },
      { status: 500 }
    );
  }
}

