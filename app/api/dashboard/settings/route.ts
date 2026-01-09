import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/firebase-auth-helpers";
import { prisma } from "@/lib/db";

// GET - Fetch user settings
// NOTE: UserSettings model doesn't exist in schema - returning default settings
export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Return default settings since UserSettings model doesn't exist
    // TODO: Add UserSettings model to schema if needed
    const defaultSettings = {
      emailNotifications: true,
      inAppNotifications: true,
      learningReminders: false,
      reminderTime: null,
      profileVisibility: "private",
      dataSharing: false,
    };

    return NextResponse.json(defaultSettings);
  } catch (error: any) {
    console.error("[SETTINGS_API_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to fetch settings", details: error.message },
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

    // NOTE: UserSettings model doesn't exist - just return success
    // TODO: Add UserSettings model to schema if needed
    // For now, settings are not persisted
    return NextResponse.json({
      message: "Settings update received (not persisted - UserSettings model not implemented)",
      ...updateData,
    });
  } catch (error: any) {
    console.error("[SETTINGS_UPDATE_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to update settings", details: error.message },
      { status: 500 }
    );
  }
}

