/**
 * Pre-Migration Data Integrity Check
 * 
 * This script checks data completeness before migration
 * Run this before and after migration to ensure data integrity
 */

import { prisma } from "../lib/db";

async function checkDataIntegrity() {
  console.log("🔍 Pre-Migration Data Integrity Check\n");
  
  const checks: Array<{ name: string; count: number; status: string }> = [];
  
  try {
    // Check existing tables
    const userCount = await prisma.user.count();
    checks.push({ name: "Users", count: userCount, status: userCount > 0 ? "✅" : "⚠️" });
    
    const conceptCount = await prisma.conceptCard.count();
    checks.push({ name: "Concept Cards", count: conceptCount, status: conceptCount > 0 ? "✅" : "⚠️" });
    
    const challengeCount = await prisma.challenge.count();
    checks.push({ name: "Challenges", count: challengeCount, status: challengeCount > 0 ? "✅" : "⚠️" });
    
    const examCount = await prisma.exam.count();
    checks.push({ name: "Exams", count: examCount, status: "✅" });
    
    const examAttemptCount = await prisma.examAttempt.count();
    checks.push({ name: "Exam Attempts", count: examAttemptCount, status: "✅" });
    
    const userProgressCount = await prisma.userProgress.count();
    checks.push({ name: "User Progress", count: userProgressCount, status: "✅" });
    
    const userPointsCount = await prisma.userPoints.count();
    checks.push({ name: "User Points", count: userPointsCount, status: "✅" });
    
    const userStreakCount = await prisma.userStreak.count();
    checks.push({ name: "User Streaks", count: userStreakCount, status: "✅" });
    
    const badgeCount = await prisma.badge.count();
    checks.push({ name: "Badges", count: badgeCount, status: "✅" });
    
    const userBadgeCount = await prisma.userBadge.count();
    checks.push({ name: "User Badges", count: userBadgeCount, status: "✅" });
    
    const levelProgressCount = await prisma.userLevelProgress.count();
    checks.push({ name: "Level Progress", count: levelProgressCount, status: "✅" });
    
    const categoryProgressCount = await prisma.userCategoryProgress.count();
    checks.push({ name: "Category Progress", count: categoryProgressCount, status: "✅" });
    
    // Check relationships
    const usersWithProgress = await prisma.user.findMany({
      where: { progress: { some: {} } },
      select: { id: true },
    });
    checks.push({ name: "Users with Progress", count: usersWithProgress.length, status: "✅" });
    
    const usersWithPoints = await prisma.user.findMany({
      where: { points: { isNot: null } },
      select: { id: true },
    });
    checks.push({ name: "Users with Points", count: usersWithPoints.length, status: "✅" });
    
    // Print results
    console.log("📊 Data Counts:\n");
    checks.forEach((check) => {
      console.log(`${check.status} ${check.name}: ${check.count}`);
    });
    
    // Summary
    const totalRecords = checks.reduce((sum, check) => sum + check.count, 0);
    console.log(`\n📈 Total Records: ${totalRecords}`);
    
    // Check for orphaned records (check via raw query)
    console.log("\n🔗 Checking Relationships...\n");
    
    const orphanedProgressResult = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*) as count
      FROM "UserProgress" up
      WHERE NOT EXISTS (SELECT 1 FROM "User" u WHERE u.id = up."userId")
         OR NOT EXISTS (SELECT 1 FROM "ConceptCard" cc WHERE cc.id = up."conceptCardId")
    `;
    
    const orphanedCount = Number(orphanedProgressResult[0]?.count || 0);
    
    if (orphanedCount > 0) {
      console.log(`⚠️  Found ${orphanedCount} orphaned UserProgress records`);
    } else {
      console.log("✅ No orphaned UserProgress records");
    }
    
    console.log("\n✅ Pre-Migration Check Complete\n");
    
    return {
      success: true,
      checks,
      totalRecords,
      orphanedProgress: orphanedCount,
    };
  } catch (error) {
    console.error("❌ Error during data integrity check:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

checkDataIntegrity()
  .then((result) => {
    console.log("\n📋 Summary:", JSON.stringify(result, null, 2));
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Check failed:", error);
    process.exit(1);
  });

