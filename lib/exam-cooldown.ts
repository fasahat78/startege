/**
 * Exam Cooldown Enforcement
 * 
 * Implements cooldown policies for exam retries:
 * - All exam types: 30 seconds (testing mode)
 * - Note: Values are in minutes (0.5 = 30 seconds)
 */

export interface CooldownPolicy {
  category: {
    fail1: number; // minutes
    fail2: number;
    fail3Plus: number;
  };
  level: {
    fail1: number;
    fail2Plus: number;
  };
  boss: {
    fail1: number;
    fail2: number;
    fail3Plus: number;
  };
}

export const COOLDOWN_POLICY: CooldownPolicy = {
  category: {
    fail1: 0.5, // 30 seconds after first fail (testing)
    fail2: 0.5, // 30 seconds after second fail (testing)
    fail3Plus: 0.5, // 30 seconds after third+ fail (testing)
  },
  level: {
    fail1: 0.5, // 30 seconds after first fail (testing)
    fail2Plus: 0.5, // 30 seconds after second+ fail (testing)
  },
  boss: {
    fail1: 0.5, // 30 seconds after first fail (testing)
    fail2: 0.5, // 30 seconds after second fail (testing)
    fail3Plus: 0.5, // 30 seconds after third+ fail (testing)
  },
};

export interface AttemptHistory {
  attemptNumber: number;
  submittedAt: Date | null;
  pass: boolean | null;
}

/**
 * Calculate cooldown duration based on consecutive failures
 */
export function calculateCooldownMinutes(
  examType: "CATEGORY" | "LEVEL" | "BOSS",
  attemptHistory: AttemptHistory[]
): number {
  // Filter to only failed attempts (submitted and not passed)
  const failedAttempts = attemptHistory.filter(
    (a) => a.submittedAt !== null && a.pass === false
  );

  const consecutiveFailures = failedAttempts.length;

  if (examType === "CATEGORY") {
    if (consecutiveFailures === 0) return 0;
    if (consecutiveFailures === 1) return COOLDOWN_POLICY.category.fail1;
    if (consecutiveFailures === 2) return COOLDOWN_POLICY.category.fail2;
    return COOLDOWN_POLICY.category.fail3Plus;
  }

  if (examType === "LEVEL") {
    if (consecutiveFailures === 0) return 0;
    if (consecutiveFailures === 1) return COOLDOWN_POLICY.level.fail1;
    return COOLDOWN_POLICY.level.fail2Plus;
  }

  if (examType === "BOSS") {
    if (consecutiveFailures === 0) return 0;
    if (consecutiveFailures === 1) return COOLDOWN_POLICY.boss.fail1;
    if (consecutiveFailures === 2) return COOLDOWN_POLICY.boss.fail2;
    return COOLDOWN_POLICY.boss.fail3Plus;
  }

  return 0;
}

/**
 * Check if user is eligible to start a new attempt
 * Returns null if eligible, or nextEligibleAt Date if cooldown active
 */
export function checkCooldown(
  examType: "CATEGORY" | "LEVEL" | "BOSS",
  attemptHistory: AttemptHistory[],
  lastAttemptSubmittedAt: Date | null
): Date | null {
  const cooldownMinutes = calculateCooldownMinutes(examType, attemptHistory);

  if (cooldownMinutes === 0) {
    return null; // No cooldown
  }

  if (!lastAttemptSubmittedAt) {
    return null; // No previous attempt, eligible
  }

  const cooldownEnd = new Date(
    lastAttemptSubmittedAt.getTime() + cooldownMinutes * 60 * 1000
  );

  const now = new Date();
  if (now >= cooldownEnd) {
    return null; // Cooldown expired
  }

  return cooldownEnd; // Still in cooldown
}

