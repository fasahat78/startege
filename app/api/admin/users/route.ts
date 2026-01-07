import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';

// GET - List users with filters
export async function GET(request: Request) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const search = searchParams.get("search");
    const tier = searchParams.get("tier");
    const earlyAdopter = searchParams.get("earlyAdopter");
    const role = searchParams.get("role");

    const where: any = {};
    
    if (search) {
      where.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
      ];
    }
    
    if (tier) {
      where.subscriptionTier = tier;
    }
    
    if (earlyAdopter === "true") {
      where.isEarlyAdopter = true;
    }
    
    if (role) {
      where.role = role;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          image: true,
          subscriptionTier: true,
          role: true,
          isAdmin: true,
          isEarlyAdopter: true,
          earlyAdopterTier: true,
          earlyAdopterStartDate: true,
          referralCode: true,
          referralCount: true,
          createdAt: true,
          subscription: {
            select: {
              status: true,
              planType: true,
            },
          },
          _count: {
            select: {
              referralsGiven: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Error fetching users:", error);
    if (error.message === "Admin access required" || error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: error.message || "Failed to fetch users" },
      { status: 500 }
    );
  }
}

