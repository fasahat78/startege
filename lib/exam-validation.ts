/**
 * Exam-Type-Aware Validation
 * 
 * Different validation rules for:
 * - Level Exams (Levels 1-9): Coverage-first, single-concept
 * - Category Exams: Scope purity only
 * - Boss Exams: Integration-focused, relaxed frequency caps
 */

export interface ConceptCard {
  id: string;
  name?: string | null;
  concept?: string;
}

export interface ExamQuestion {
  id: string;
  stem: string;
  options: Array<{ id: string; text: string }>;
  correctOptionId: string;
  conceptIds?: string[];
  categoryIds?: string[];
  difficultyTag?: string;
}

/**
 * Validate Level Exam (Levels 1-9)
 * 
 * Rules:
 * - Exact question count = concept count
 * - Every concept appears exactly once
 * - Single-concept questions only
 * - Canonical category IDs
 */
export function validateLevelExam(
  questions: ExamQuestion[],
  conceptsInScope: ConceptCard[]
): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Exact question count
  if (questions.length !== conceptsInScope.length) {
    errors.push(
      `Question count (${questions.length}) must equal concept count (${conceptsInScope.length})`
    );
  }

  // 2. Coverage check (MANDATORY)
  const usedConcepts = new Set<string>();
  for (const q of questions) {
    if (!q.conceptIds || q.conceptIds.length === 0) {
      errors.push(`Question ${q.id}: Missing conceptIds`);
      continue;
    }

    if (q.conceptIds.length !== 1) {
      errors.push(
        `Question ${q.id}: Level exam questions must reference exactly one concept (found ${q.conceptIds.length})`
      );
    }

    usedConcepts.add(q.conceptIds[0]);
  }

  // Check all concepts are covered
  const conceptIdsInScope = new Set(conceptsInScope.map((c) => c.id));
  for (const concept of conceptsInScope) {
    if (!usedConcepts.has(concept.id)) {
      errors.push(`Missing concept coverage: ${concept.id} (${concept.name || concept.concept})`);
    }
  }

  // Check for out-of-scope concepts
  for (const q of questions) {
    q.conceptIds?.forEach((cid) => {
      if (!conceptIdsInScope.has(cid)) {
        errors.push(`Question ${q.id}: conceptId "${cid}" is outside allowed scope`);
      }
    });
  }

  // 3. Canonical category IDs check
  // Note: For level exams, we validate categoryIds exist but don't enforce specific categories
  // (categories are determined by the concept's categoryId)
  for (const q of questions) {
    if (!q.categoryIds || q.categoryIds.length === 0) {
      warnings.push(`Question ${q.id}: Missing categoryIds`);
    } else {
      // Check if categoryIds look like database IDs (start with "cmj" and are long)
      const invalidCategories = q.categoryIds.filter((catId: string) => 
        !catId.startsWith("cmj") || catId.length < 20
      );
      if (invalidCategories.length > 0) {
        errors.push(`Question ${q.id}: Non-canonical categoryIds detected: ${invalidCategories.join(", ")}`);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate Category Exam
 * 
 * Rules:
 * - All conceptIds must be in allowed scope
 * - Canonical category IDs only
 * - No coverage requirement
 * - No frequency cap
 */
export function validateCategoryExam(
  questions: ExamQuestion[],
  allowedConceptIds: Set<string>,
  requiredCategoryId: string
): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const q of questions) {
    // Check concept scope (category purity)
    if (q.conceptIds && q.conceptIds.length > 0) {
      const outOfScope = q.conceptIds.filter((cid) => !allowedConceptIds.has(cid));
      if (outOfScope.length > 0) {
        errors.push(
          `Question ${q.id}: conceptIds outside category scope: ${outOfScope.join(", ")}`
        );
      }
    } else {
      warnings.push(`Question ${q.id}: Missing conceptIds`);
    }

    // Check category ID (must be this category only)
    if (q.categoryIds && q.categoryIds.length > 0) {
      const invalidCategories = q.categoryIds.filter((catId) => catId !== requiredCategoryId);
      if (invalidCategories.length > 0) {
        errors.push(
          `Question ${q.id}: categoryIds must be only "${requiredCategoryId}", found: ${q.categoryIds.join(", ")}`
        );
      }
    } else if (q.categoryId) {
      if (q.categoryId !== requiredCategoryId) {
        errors.push(`Question ${q.id}: categoryId must be "${requiredCategoryId}", found: ${q.categoryId}`);
      }
    } else {
      warnings.push(`Question ${q.id}: Missing categoryIds`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate Boss Exam (with relaxed frequency cap)
 * 
 * Rules:
 * - Concept scope enforcement
 * - Canonical category IDs
 * - Category presence
 * - Frequency cap: max 4 (relaxed from 3)
 */
export function validateBossExam(
  questions: ExamQuestion[],
  allowedConceptIds: Set<string>,
  canonicalCategoryIds: Set<string>,
  requiredCategoryIds: string[]
): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  stats: {
    conceptFrequency: Record<string, number>;
    categoriesPresent: Set<string>;
  };
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  const conceptFrequency: Record<string, number> = {};
  const categoriesPresent = new Set<string>();

  // Track concept usage
  for (const q of questions) {
    // Check concept scope
    if (q.conceptIds && q.conceptIds.length > 0) {
      q.conceptIds.forEach((cid) => {
        if (!allowedConceptIds.has(cid)) {
          errors.push(`Question ${q.id}: conceptId "${cid}" is outside allowed scope`);
        } else {
          conceptFrequency[cid] = (conceptFrequency[cid] || 0) + 1;
        }
      });
    }

    // Track categories
    if (q.categoryIds && q.categoryIds.length > 0) {
      q.categoryIds.forEach((catId) => {
        if (!canonicalCategoryIds.has(catId)) {
          errors.push(`Question ${q.id}: categoryId "${catId}" is not canonical`);
        } else {
          categoriesPresent.add(catId);
        }
      });
    }
  }

  // Check frequency cap (relaxed to 4 for boss exams)
  for (const [cid, count] of Object.entries(conceptFrequency)) {
    if (count > 4) {
      errors.push(`Concept ${cid} appears ${count} times (max: 4)`);
    }
  }

  // Check category presence
  const missingCategories = requiredCategoryIds.filter((catId) => !categoriesPresent.has(catId));
  if (missingCategories.length > 0) {
    errors.push(`Missing required categories: ${missingCategories.join(", ")}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    stats: {
      conceptFrequency,
      categoriesPresent,
    },
  };
}

