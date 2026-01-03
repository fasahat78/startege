import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/firebase-auth-helpers";
import { prisma } from "@/lib/db";

// GET - Fetch user settings
export async function GET() {
  try {
    const user = await getCurrentUser();
    console.log("[SETTINGS_API] User:", user?.id, user?.email);

    if (!user) {
      console.log("[SETTINGS_API] No user found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[SETTINGS_API] Fetching settings for user:", user.id);
    console.log("[SETTINGS_API] Prisma client has userSettings:", !!prisma.userSettings);
    
    // Verify prisma.userSettings exists
    if (!prisma.userSettings) {
      console.error("[SETTINGS_API_ERROR] prisma.userSettings is undefined! Prisma client needs regeneration.");
      throw new Error("Database client not properly initialized. Please restart the server.");
    }
    
    // Get or create user settings
    let settings = await prisma.userSettings.findUnique({
      where: { userId: user.id },
    });

    console.log("[SETTINGS_API] Found settings:", settings ? "yes" : "no");

    // Create default settings if they don't exist
    if (!settings) {
      console.log("[SETTINGS_API] Creating default settings");
      settings = await prisma.userSettings.create({
        data: {
          userId: user.id,
        },
      });
      console.log("[SETTINGS_API] Created settings:", settings.id);
    }

    return NextResponse.json(settings);
  } catch (error: any) {
    console.error("[SETTINGS_API_ERROR] Full error:", error);
    console.error("[SETTINGS_API_ERROR] Error name:", error?.name);
    console.error("[SETTINGS_API_ERROR] Error message:", error?.message);
    console.error("[SETTINGS_API_ERROR] Error code:", error?.code);
    console.error("[SETTINGS_API_ERROR] Error meta:", JSON.stringify(error?.meta, null, 2));
    console.error("[SETTINGS_API_ERROR] Error stack:", error?.stack);
    
    // Provide more specific error messages
    let errorMessage = error.message || "Failed to fetch settings";
    if (error.code === "P2002") {
      errorMessage = "Settings already exist for this user";
    } else if (error.code === "P2003") {
      errorMessage = "User not found";
    } else if (error.code === "P2025") {
      errorMessage = "Record not found";
    }
    
    return NextResponse.json(
      { error: "Failed to fetch settings", details: errorMessage, code: error?.code },
      { status: 500 }
    );
  }
}

// PUT - Update user settings
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate input
    const allowedFields = [
      "emailNotifications",
      "inAppNotifications",
      "learningReminders",
      "reminderTime",
      "profileVisibility",
      "dataSharing",
    ];

    const updateData: any = {};
    for (const field of allowedFields) {
      if (field in body) {
        updateData[field] = body[field];
      }
    }

    // Validate reminderTime format if provided
    if (updateData.reminderTime && updateData.reminderTime !== null) {
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(updateData.reminderTime)) {
        return NextResponse.json(
          { error: "Invalid reminder time format. Use HH:MM format." },
          { status: 400 }
        );
      }
    }

    // Validate profileVisibility
    if (
      updateData.profileVisibility &&
      !["private", "public"].includes(updateData.profileVisibility)
    ) {
      return NextResponse.json(
        { error: "Invalid profile visibility value" },
        { status: 400 }
      );
    }

    // Update or create settings
    const settings = await prisma.userSettings.upsert({
      where: { userId: user.id },
      update: updateData,
      create: {
        userId: user.id,
        ...updateData,
      },
    });

    return NextResponse.json(settings);
  } catch (error: any) {
    console.error("[SETTINGS_UPDATE_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to update settings", details: error.message },
      { status: 500 }
    );
  }
}

