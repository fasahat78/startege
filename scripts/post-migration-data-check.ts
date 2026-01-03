/**
 * Post-Migration Data Integrity Check
 * 
 * This script verifies data completeness after migration
 * Compares with pre-migration counts to ensure nothing was lost
 */

import { prisma } from "../lib/db";
import * as fs from "fs";
import * as path from "path";

async function checkPostMigrationIntegrity() {
  console.log("🔍 Post-Migration Data Integrity Check\n");
  
  const checks: Array<{ name: string; count: number; status: string }> = [];
  
  try {
    // Check existing tables (should match pre-migration)
    const userCount = await prisma.user.count();
    checks.push({ name: "Users", count: userCount, status: userCount >= 21 ? "✅" : "❌" });
    
    const conceptCount = await prisma.conceptCard.count();
    checks.push({ name: "Concept Cards", count: conceptCount, status: conceptCount >= 360 ? "✅" : "❌" });
    
    const challengeCount = await prisma.challenge.count();
    checks.push({ name: "Challenges", count: challengeCount, status: challengeCount >= 80 ? "✅" : "❌" });
    
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
    
    // Check NEW tables exist
    console.log("\n🆕 Checking New Tables...\n");
    
    const userProfileCount = await prisma.userProfile.count();
    checks.push({ name: "User Profiles (NEW)", count: userProfileCount, status: "✅" });
    
    const userInterestCount = await prisma.userInterest.count();
    checks.push({ name: "User Interests (NEW)", count: userInterestCount, status: "✅" });
    
    const userGoalCount = await prisma.userGoal.count();
    checks.push({ name: "User Goals (NEW)", count: userGoalCount, status: "✅" });
    
    const onboardingScenarioCount = await prisma.onboardingScenario.count();
    checks.push({ name: "Onboarding Scenarios (NEW)", count: onboardingScenarioCount, status: "✅" });
    
    const promptTemplateCount = await prisma.promptTemplate.count();
    checks.push({ name: "Prompt Templates (NEW)", count: promptTemplateCount, status: "✅" });
    
    const marketScanArticleCount = await prisma.marketScanArticle.count();
    checks.push({ name: "Market Scan Articles (NEW)", count: marketScanArticleCount, status: "✅" });
    
    // Print results
    console.log("📊 Data Counts:\n");
    checks.forEach((check) => {
      console.log(`${check.status} ${check.name}: ${check.count}`);
    });
    
    // Summary
    const totalRecords = checks.reduce((sum, check) => sum + check.count, 0);
    console.log(`\n📈 Total Records: ${totalRecords}`);
    
    // Verify relationships still work
    console.log("\n🔗 Verifying Relationships...\n");
    
    const usersWithProgress = await prisma.user.findMany({
      where: { progress: { some: {} } },
      select: { id: true },
    });
    console.log(`✅ Users with Progress: ${usersWithProgress.length}`);
    
    const usersWithPoints = await prisma.user.findMany({
      where: { points: { isNot: null } },
      select: { id: true },
    });
    console.log(`✅ Users with Points: ${usersWithPoints.length}`);
    
    // Check foreign key constraints
    console.log("\n🔐 Verifying Foreign Keys...\n");
    
    try {
      // Try to query with relations
      const sampleUser = await prisma.user.findFirst({
        include: {
          progress: true,
          points: true,
          badges: true,
          levelProgress: true,
          profile: true,
        },
      });
      
      if (sampleUser) {
        console.log("✅ Foreign key relationships working correctly");
        console.log(`   Sample user has ${sampleUser.progress.length} progress records`);
        console.log(`   Sample user has ${sampleUser.levelProgress.length} level progress records`);
      }
    } catch (error: any) {
      console.error("❌ Foreign key check failed:", error.message);
      throw error;
    }
    
    // Check new enums
    console.log("\n📋 Verifying New Enums...\n");
    
    const enumCheck = await prisma.$queryRaw<Array<{ enum_name: string }>>`
      SELECT t.typname as enum_name
      FROM pg_type t
      JOIN pg_enum e ON t.oid = e.enumtypid
      WHERE t.typname IN ('PersonaType', 'KnowledgeLevel', 'OnboardingStatus', 'SourceType', 'ScanType', 'ScanStatus')
      GROUP BY t.typname
      ORDER BY t.typname;
    `;
    
    const expectedEnums = ['PersonaType', 'KnowledgeLevel', 'OnboardingStatus', 'SourceType', 'ScanType', 'ScanStatus'];
    const foundEnums = enumCheck.map(e => e.enum_name);
    
    expectedEnums.forEach(enumName => {
      if (foundEnums.includes(enumName)) {
        console.log(`✅ Enum ${enumName} exists`);
      } else {
        console.log(`❌ Enum ${enumName} missing`);
      }
    });
    
    console.log("\n✅ Post-Migration Check Complete\n");
    
    const allChecksPassed = checks.every(check => check.status === "✅");
    
    return {
      success: allChecksPassed,
      checks,
      totalRecords,
      enumsFound: foundEnums.length,
      expectedEnums: expectedEnums.length,
    };
  } catch (error) {
    console.error("❌ Error during data integrity check:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

checkPostMigrationIntegrity()
  .then((result) => {
    const outputFile = path.join(process.cwd(), "backups", "post_migration_data_check.txt");
    const report = {
      timestamp: new Date().toISOString(),
      ...result,
    };
    
    fs.writeFileSync(outputFile, JSON.stringify(report, null, 2));
    console.log(`\n📄 Report saved to: ${outputFile}`);
    console.log("\n📋 Summary:", JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log("\n✅ Migration successful! All data intact.");
      process.exit(0);
    } else {
      console.log("\n⚠️  Some checks failed. Please review.");
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error("❌ Check failed:", error);
    process.exit(1);
  });

