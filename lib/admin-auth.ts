import { getCurrentUser } from "@/lib/firebase-auth-helpers";
import { prisma } from "@/lib/db";
import { UserRole } from "@prisma/client";

/**
 * Check if current user is an admin
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const user = await getCurrentUser();
    if (!user) return false;

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { isAdmin: true, role: true },
    });

    return dbUser?.isAdmin === true || dbUser?.role === UserRole.ADMIN || dbUser?.role === UserRole.SUPER_ADMIN;
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}

/**
 * Get admin user or throw error
 */
export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { isAdmin: true, role: true },
  });

  if (!dbUser || (dbUser.isAdmin !== true && dbUser.role !== UserRole.ADMIN && dbUser.role !== UserRole.SUPER_ADMIN)) {
    throw new Error("Admin access required");
  }

  return dbUser;
}

/**
 * Check if user is super admin
 */
export async function isSuperAdmin(): Promise<boolean> {
  try {
    const user = await getCurrentUser();
    if (!user) return false;

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true },
    });

    return dbUser?.role === UserRole.SUPER_ADMIN;
  } catch (error) {
    console.error("Error checking super admin status:", error);
    return false;
  }
}

