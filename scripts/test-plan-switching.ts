/**
 * Test Plan Switching Logic
 * 
 * This script tests various scenarios of switching from monthly to annual plans
 * at different times in the billing cycle with different credit profiles.
 */

import { prisma } from "../lib/db";
import { allocateMonthlyCredits, updatePlanType, checkCreditBalance, deductCredits } from "../lib/ai-credits";

interface TestScenario {
  name: string;
  dayOfMonth: number; // 1-30
  creditsRemaining: number; // Credits remaining before switch
  creditsUsed: number; // Credits used before switch
  purchasedCredits: number; // Purchased credits before switch
  expectedBalanceAfterSwitch: number;
  expectedMonthlyAllowance: number;
}

const scenarios: TestScenario[] = [
  // Scenario 1: Switch on Day 1 (just started monthly cycle)
  {
    name: "Day 1 - Full monthly credits remaining",
    dayOfMonth: 1,
    creditsRemaining: 1000,
    creditsUsed: 0,
    purchasedCredits: 0,
    expectedBalanceAfterSwitch: 2250, // 1000 (preserved) + 1250 (new annual allowance)
    expectedMonthlyAllowance: 1250,
  },
  
  // Scenario 2: Switch on Day 15 with half credits used
  {
    name: "Day 15 - Half credits used",
    dayOfMonth: 15,
    creditsRemaining: 500,
    creditsUsed: 500,
    purchasedCredits: 0,
    expectedBalanceAfterSwitch: 1750, // 500 (preserved) + 1250 (new annual allowance)
    expectedMonthlyAllowance: 1250,
  },
  
  // Scenario 3: Switch on Day 15 with credits + purchased credits
  {
    name: "Day 15 - Half credits used + purchased credits",
    dayOfMonth: 15,
    creditsRemaining: 500,
    creditsUsed: 500,
    purchasedCredits: 300,
    expectedBalanceAfterSwitch: 2050, // 500 (monthly remaining) + 300 (purchased) + 1250 (new annual)
    expectedMonthlyAllowance: 1250,
  },
  
  // Scenario 4: Switch on Day 25 (almost end of cycle)
  {
    name: "Day 25 - Most credits used",
    dayOfMonth: 25,
    creditsRemaining: 100,
    creditsUsed: 900,
    purchasedCredits: 0,
    expectedBalanceAfterSwitch: 1350, // 100 (preserved) + 1250 (new annual allowance)
    expectedMonthlyAllowance: 1250,
  },
  
  // Scenario 5: Switch on Day 30 (end of cycle)
  {
    name: "Day 30 - End of cycle, few credits remaining",
    dayOfMonth: 30,
    creditsRemaining: 50,
    creditsUsed: 950,
    purchasedCredits: 0,
    expectedBalanceAfterSwitch: 1300, // 50 (preserved) + 1250 (new annual allowance)
    expectedMonthlyAllowance: 1250,
  },
  
  // Scenario 6: Switch with large purchased credits balance
  {
    name: "Day 10 - Large purchased credits balance",
    dayOfMonth: 10,
    creditsRemaining: 800,
    creditsUsed: 200,
    purchasedCredits: 2000,
    expectedBalanceAfterSwitch: 4050, // 800 (monthly remaining) + 2000 (purchased) + 1250 (new annual)
    expectedMonthlyAllowance: 1250,
  },
  
  // Scenario 7: Switch with all monthly credits used
  {
    name: "Day 20 - All monthly credits exhausted",
    dayOfMonth: 20,
    creditsRemaining: 0,
    creditsUsed: 1000,
    purchasedCredits: 500,
    expectedBalanceAfterSwitch: 1750, // 0 (monthly remaining) + 500 (purchased) + 1250 (new annual)
    expectedMonthlyAllowance: 1250,
  },
  
  // Scenario 8: Switch early with purchased credits
  {
    name: "Day 5 - Early switch with purchased credits",
    dayOfMonth: 5,
    creditsRemaining: 900,
    creditsUsed: 100,
    purchasedCredits: 100,
    expectedBalanceAfterSwitch: 2250, // 900 (monthly remaining) + 100 (purchased) + 1250 (new annual)
    expectedMonthlyAllowance: 1250,
  },
  
  // Scenario 9: Switch mid-cycle with mixed usage
  {
    name: "Day 12 - Mixed usage pattern",
    dayOfMonth: 12,
    creditsRemaining: 600,
    creditsUsed: 400,
    purchasedCredits: 150,
    expectedBalanceAfterSwitch: 2000, // 600 (monthly remaining) + 150 (purchased) + 1250 (new annual)
    expectedMonthlyAllowance: 1250,
  },
  
  // Scenario 10: Switch with zero credits (all used + no purchased)
  {
    name: "Day 18 - Zero credits remaining",
    dayOfMonth: 18,
    creditsRemaining: 0,
    creditsUsed: 1000,
    purchasedCredits: 0,
    expectedBalanceAfterSwitch: 1250, // 0 (monthly remaining) + 0 (purchased) + 1250 (new annual)
    expectedMonthlyAllowance: 1250,
  },
];

async function runTestScenario(scenario: TestScenario, userId: string) {
  console.log(`\n${"=".repeat(80)}`);
  console.log(`Testing: ${scenario.name}`);
  console.log(`${"=".repeat(80)}`);
  
  try {
    // Setup: Create or reset credit account with monthly plan
    const now = new Date();
    const billingCycleStart = new Date(now);
    billingCycleStart.setDate(scenario.dayOfMonth);
    const billingCycleEnd = new Date(billingCycleStart);
    billingCycleEnd.setMonth(billingCycleEnd.getMonth() + 1);
    
    // Get or create subscription (monthly)
    let subscription = await prisma.subscription.findUnique({
      where: { userId },
    });
    
    if (!subscription) {
      subscription = await prisma.subscription.create({
        data: {
          userId,
          stripeCustomerId: `test_customer_${userId}`,
          status: "active",
          planType: "monthly",
        },
      });
    } else {
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { planType: "monthly" },
      });
    }
    
    // Setup credit account with monthly plan state
    const monthlyAllowance = 1000;
    const totalCredits = scenario.creditsRemaining + scenario.purchasedCredits;
    
    await prisma.aICredit.upsert({
      where: { userId },
      update: {
        monthlyAllowance: monthlyAllowance,
        currentBalance: totalCredits,
        purchasedCredits: scenario.purchasedCredits,
        creditsUsedThisCycle: scenario.creditsUsed,
        billingCycleStart,
        billingCycleEnd,
        subscriptionId: subscription.id,
      },
      create: {
        userId,
        subscriptionId: subscription.id,
        monthlyAllowance: monthlyAllowance,
        currentBalance: totalCredits,
        purchasedCredits: scenario.purchasedCredits,
        creditsUsedThisCycle: scenario.creditsUsed,
        billingCycleStart,
        billingCycleEnd,
      },
    });
    
    // Display initial state
    const before = await prisma.aICredit.findUnique({
      where: { userId },
    });
    
    console.log(`\n📊 BEFORE SWITCH:`);
    console.log(`  Day of month: ${scenario.dayOfMonth}`);
    console.log(`  Plan: Monthly (1,000/month)`);
    console.log(`  Monthly Allowance: ${before?.monthlyAllowance}`);
    console.log(`  Current Balance: ${before?.currentBalance}`);
    console.log(`  Purchased Credits: ${before?.purchasedCredits}`);
    console.log(`  Credits Used This Cycle: ${before?.creditsUsedThisCycle}`);
    console.log(`  Billing Cycle End: ${before?.billingCycleEnd?.toISOString()}`);
    
    // Switch to annual plan
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { planType: "annual" },
    });
    
    await updatePlanType(userId, subscription.id, true);
    
    // Display after state
    const after = await prisma.aICredit.findUnique({
      where: { userId },
    });
    
    console.log(`\n📊 AFTER SWITCH:`);
    console.log(`  Plan: Annual (1,250/month)`);
    console.log(`  Monthly Allowance: ${after?.monthlyAllowance}`);
    console.log(`  Current Balance: ${after?.currentBalance}`);
    console.log(`  Purchased Credits: ${after?.purchasedCredits}`);
    console.log(`  Credits Used This Cycle: ${after?.creditsUsedThisCycle}`);
    
    // Verify expectations
    const balanceMatch = after?.currentBalance === scenario.expectedBalanceAfterSwitch;
    const allowanceMatch = after?.monthlyAllowance === scenario.expectedMonthlyAllowance;
    
    console.log(`\n✅ VERIFICATION:`);
    console.log(`  Expected Balance: ${scenario.expectedBalanceAfterSwitch}`);
    console.log(`  Actual Balance: ${after?.currentBalance}`);
    console.log(`  Match: ${balanceMatch ? "✅ PASS" : "❌ FAIL"}`);
    console.log(`  Expected Allowance: ${scenario.expectedMonthlyAllowance}`);
    console.log(`  Actual Allowance: ${after?.monthlyAllowance}`);
    console.log(`  Match: ${allowanceMatch ? "✅ PASS" : "❌ FAIL"}`);
    
    if (!balanceMatch || !allowanceMatch) {
      console.log(`\n⚠️  SCENARIO FAILED`);
      return false;
    }
    
    return true;
  } catch (error: any) {
    console.error(`\n❌ ERROR: ${error.message}`);
    console.error(error.stack);
    return false;
  }
}

async function main() {
  // Use an existing user or create a test user
  let testUser = await prisma.user.findFirst({
    where: { email: { contains: "test" } },
    select: { id: true },
  });
  
  if (!testUser) {
    // Create a test user
    testUser = await prisma.user.create({
      data: {
        email: `test-plan-switching-${Date.now()}@example.com`,
        name: "Test User",
        subscriptionTier: "premium",
      },
      select: { id: true },
    });
  }
  
  const testUserId = testUser.id;
  
  console.log("🧪 PLAN SWITCHING TEST SUITE");
  console.log("=".repeat(80));
  console.log("Testing monthly → annual plan switching logic");
  console.log(`Using test user: ${testUserId}`);
  console.log("=".repeat(80));
  
  const results = [];
  
  for (const scenario of scenarios) {
    const passed = await runTestScenario(scenario, testUserId);
    results.push({ scenario: scenario.name, passed });
    
    // Clean up for next test
    await prisma.aICredit.deleteMany({
      where: { userId: testUserId },
    });
  }
  
  // Summary
  console.log(`\n${"=".repeat(80)}`);
  console.log("📊 TEST SUMMARY");
  console.log(`${"=".repeat(80)}`);
  
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  
  results.forEach((result, index) => {
    console.log(`${index + 1}. ${result.scenario}: ${result.passed ? "✅ PASS" : "❌ FAIL"}`);
  });
  
  console.log(`\nTotal: ${results.length} scenarios`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  
  if (failed > 0) {
    console.log(`\n⚠️  Some tests failed. Review the logic above.`);
    process.exit(1);
  } else {
    console.log(`\n✅ All tests passed!`);
    process.exit(0);
  }
}

main()
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });

