import { prisma } from "./db";

export interface ConceptAssignment {
  conceptId: string;
  level: number;
  isSpiralLearning: boolean; // Appears in multiple levels
}

export interface CoverageReport {
  totalConcepts: number;
  assignedConcepts: number;
  unassignedConcepts: string[];
  coveragePercentage: number;
  domainDistribution: Record<string, number>;
  levelDistribution: Record<number, number>;
  spiralLearning: Record<string, number[]>; // conceptId -> levels[]
}

/**
 * Classify concepts by difficulty and importance
 */
export async function classifyConcepts() {
  const allConcepts = await prisma.conceptCard.findMany();

  const classified = {
    byDifficulty: {
      beginner: [] as typeof allConcepts,
      intermediate: [] as typeof allConcepts,
      advanced: [] as typeof allConcepts,
      expert: [] as typeof allConcepts,
    },
    byImportance: {
      high: [] as typeof allConcepts,
      medium: [] as typeof allConcepts,
      low: [] as typeof allConcepts,
    },
    byDomain: {} as Record<string, typeof allConcepts>,
  };

  allConcepts.forEach((concept) => {
    // Classify by difficulty
    const difficulty = concept.difficulty.toLowerCase();
    if (difficulty === "beginner") {
      classified.byDifficulty.beginner.push(concept);
    } else if (difficulty === "intermediate") {
      classified.byDifficulty.intermediate.push(concept);
    } else if (difficulty === "advanced") {
      classified.byDifficulty.advanced.push(concept);
    } else {
      // Default to expert for unknown
      classified.byDifficulty.expert.push(concept);
    }

    // Classify by importance
    const importance = concept.importance?.toLowerCase() || "medium";
    if (importance === "high") {
      classified.byImportance.high.push(concept);
    } else if (importance === "medium") {
      classified.byImportance.medium.push(concept);
    } else {
      classified.byImportance.low.push(concept);
    }

    // Classify by domain
    if (!classified.byDomain[concept.domain]) {
      classified.byDomain[concept.domain] = [];
    }
    classified.byDomain[concept.domain].push(concept);
  });

  return classified;
}

/**
 * Determine which levels a high-importance concept should appear in (spiral learning)
 */
export function determineSpiralLevels(
  concept: { difficulty: string; domain: string },
  importance: string
): number[] {
  const levels: number[] = [];

  if (importance !== "high") {
    return levels; // Only high-importance concepts get spiral learning
  }

  const difficulty = concept.difficulty.toLowerCase();

  // High-importance concepts appear in 3-5 levels
  if (difficulty === "beginner" || difficulty === "intermediate") {
    // Appear in early levels and mid-levels
    levels.push(3, 8, 13, 18);
  } else if (difficulty === "advanced") {
    // Appear in mid and advanced levels
    levels.push(13, 18, 23, 28);
  } else {
    // Expert concepts appear in advanced and mastery levels
    levels.push(23, 28, 33, 38);
  }

  return levels;
}

/**
 * Get level range for a difficulty tier
 */
export function getLevelRange(difficulty: string): [number, number] {
  const d = difficulty.toLowerCase();
  if (d === "beginner") return [1, 10];
  if (d === "intermediate") return [11, 20];
  if (d === "advanced") return [21, 30];
  return [31, 40]; // expert
}

/**
 * Distribute concepts evenly across level range
 */
export function distributeConcepts(
  concepts: Array<{ id: string }>,
  levelRange: [number, number],
  existingAssignments: Map<string, number[]>
): Map<string, number[]> {
  const [startLevel, endLevel] = levelRange;
  const totalLevels = endLevel - startLevel + 1;
  const conceptsPerLevel = Math.ceil(concepts.length / totalLevels);

  const assignments = new Map<string, number[]>();

  concepts.forEach((concept, index) => {
    const level = startLevel + Math.floor(index / conceptsPerLevel);
    if (level <= endLevel) {
      const existing = existingAssignments.get(concept.id) || [];
      assignments.set(concept.id, [...existing, level]);
    }
  });

  return assignments;
}

/**
 * Distribute concepts evenly across levels and update assignments map
 */
function distributeEvenlyAcrossLevels(
  concepts: Array<{ id: string }>,
  levelRange: [number, number],
  assignments: Map<string, number[]>
) {
  const [startLevel, endLevel] = levelRange;
  const totalLevels = endLevel - startLevel + 1;
  
  if (concepts.length === 0) return;
  
  const conceptsPerLevel = Math.max(1, Math.floor(concepts.length / totalLevels));

  concepts.forEach((concept, index) => {
    const levelIndex = Math.floor(index / conceptsPerLevel);
    const level = Math.min(startLevel + levelIndex, endLevel);
    
    const existing = assignments.get(concept.id) || [];
    if (!existing.includes(level)) {
      assignments.set(concept.id, [...existing, level]);
    }
  });
}

/**
 * Validate coverage - ensure all concepts are assigned
 */
export async function validateCoverage(): Promise<CoverageReport> {
  const allConcepts = await prisma.conceptCard.findMany();
  const allChallenges = await prisma.challenge.findMany();

  const assignedConceptIds = new Set<string>();
  const conceptToLevels = new Map<string, number[]>();

  allChallenges.forEach((challenge) => {
    challenge.concepts.forEach((conceptId) => {
      assignedConceptIds.add(conceptId);
      if (!conceptToLevels.has(conceptId)) {
        conceptToLevels.set(conceptId, []);
      }
      conceptToLevels.get(conceptId)!.push(challenge.level);
    });
  });

  const unassigned = allConcepts.filter(
    (c) => !assignedConceptIds.has(c.id)
  );

  // Calculate domain distribution
  const domainDistribution: Record<string, number> = {};
  allChallenges.forEach((challenge) => {
    challenge.concepts.forEach((conceptId) => {
      const concept = allConcepts.find((c) => c.id === conceptId);
      if (concept) {
        domainDistribution[concept.domain] =
          (domainDistribution[concept.domain] || 0) + 1;
      }
    });
  });

  // Calculate level distribution
  const levelDistribution: Record<number, number> = {};
  allChallenges.forEach((challenge) => {
    levelDistribution[challenge.level] = challenge.concepts.length;
  });

  return {
    totalConcepts: allConcepts.length,
    assignedConcepts: assignedConceptIds.size,
    unassignedConcepts: unassigned.map((c) => c.id),
    coveragePercentage: (assignedConceptIds.size / allConcepts.length) * 100,
    domainDistribution,
    levelDistribution,
    spiralLearning: Object.fromEntries(conceptToLevels),
  };
}

/**
 * Assign concepts to levels ensuring 100% coverage
 */
export async function assignConceptsToLevels(): Promise<CoverageReport> {
  console.log("📊 Starting concept-to-level assignment...");

  // Step 1: Classify all concepts
  const classified = await classifyConcepts();
  console.log(`✅ Classified ${classified.byDifficulty.beginner.length + classified.byDifficulty.intermediate.length + classified.byDifficulty.advanced.length + classified.byDifficulty.expert.length} concepts`);

  // Step 2: Track assignments
  const conceptAssignments = new Map<string, number[]>();

  // Step 3: Assign high-importance concepts (spiral learning)
  console.log("🔄 Assigning high-importance concepts (spiral learning)...");
  classified.byImportance.high.forEach((concept) => {
    const levels = determineSpiralLevels(concept, "high");
    conceptAssignments.set(concept.id, levels);
  });
  console.log(`✅ Assigned ${classified.byImportance.high.length} high-importance concepts`);

  // Step 4: Assign remaining concepts by difficulty with better distribution
  console.log("📚 Assigning concepts by difficulty tier...");

  // Beginner concepts to Levels 1-10 (distribute evenly)
  const beginnerNotAssigned = classified.byDifficulty.beginner.filter(
    (c) => !conceptAssignments.has(c.id)
  );
  distributeEvenlyAcrossLevels(beginnerNotAssigned, [1, 10], conceptAssignments);

  // Intermediate concepts: Split across Levels 1-30 (most concepts are intermediate)
  const intermediateNotAssigned = classified.byDifficulty.intermediate.filter(
    (c) => !conceptAssignments.has(c.id)
  );
  // Distribute: 30% to 1-10, 40% to 11-20, 30% to 21-30
  const intermediate1 = intermediateNotAssigned.slice(0, Math.floor(intermediateNotAssigned.length * 0.3));
  const intermediate2 = intermediateNotAssigned.slice(
    Math.floor(intermediateNotAssigned.length * 0.3),
    Math.floor(intermediateNotAssigned.length * 0.7)
  );
  const intermediate3 = intermediateNotAssigned.slice(Math.floor(intermediateNotAssigned.length * 0.7));
  
  distributeEvenlyAcrossLevels(intermediate1, [1, 10], conceptAssignments);
  distributeEvenlyAcrossLevels(intermediate2, [11, 20], conceptAssignments);
  distributeEvenlyAcrossLevels(intermediate3, [21, 30], conceptAssignments);

  // Advanced concepts to Levels 21-35
  const advancedNotAssigned = classified.byDifficulty.advanced.filter(
    (c) => !conceptAssignments.has(c.id)
  );
  distributeEvenlyAcrossLevels(advancedNotAssigned, [21, 35], conceptAssignments);

  // Expert concepts to Levels 31-40 (and some advanced concepts)
  const expertNotAssigned = classified.byDifficulty.expert.filter(
    (c) => !conceptAssignments.has(c.id)
  );
  distributeEvenlyAcrossLevels(expertNotAssigned, [31, 40], conceptAssignments);
  
  // Fill remaining levels 31-40 with advanced concepts if needed
  const remainingAdvanced = classified.byDifficulty.advanced.filter(
    (c) => !conceptAssignments.has(c.id)
  );
  if (remainingAdvanced.length > 0) {
    distributeEvenlyAcrossLevels(remainingAdvanced, [31, 40], conceptAssignments);
  }
  
  // Fill any gaps with intermediate concepts
  const remainingIntermediate = classified.byDifficulty.intermediate.filter(
    (c) => !conceptAssignments.has(c.id)
  );
  if (remainingIntermediate.length > 0) {
    distributeEvenlyAcrossLevels(remainingIntermediate, [1, 40], conceptAssignments);
  }

  // Step 5: Balance concept distribution per level
  console.log("⚖️  Balancing concept distribution per level...");
  
  // Target: 10-18 concepts per level
  const targetMin = 10;
  const targetMax = 18;
  
  // Count concepts per level
  const levelConceptCounts = new Map<number, number>();
  for (let level = 1; level <= 40; level++) {
    levelConceptCounts.set(level, 0);
  }
  
  conceptAssignments.forEach((levels) => {
    levels.forEach((level) => {
      levelConceptCounts.set(level, (levelConceptCounts.get(level) || 0) + 1);
    });
  });
  
  // Redistribute if levels are unbalanced
  const allChallenges = await prisma.challenge.findMany();
  const levelConcepts = new Map<number, string[]>();
  
  // Initialize level concepts arrays
  for (let level = 1; level <= 40; level++) {
    levelConcepts.set(level, []);
  }
  
  // First pass: Assign non-spiral concepts to their primary level
  conceptAssignments.forEach((levels, conceptId) => {
    if (levels.length === 1) {
      // Single level assignment - add to that level
      const level = levels[0];
      const current = levelConcepts.get(level) || [];
      levelConcepts.set(level, [...current, conceptId]);
    }
  });
  
  // Second pass: Distribute spiral learning concepts evenly
  conceptAssignments.forEach((levels, conceptId) => {
    if (levels.length > 1) {
      // Spiral learning - add to each level, but limit per level
      levels.forEach((level) => {
        const current = levelConcepts.get(level) || [];
        if (current.length < targetMax) {
          levelConcepts.set(level, [...current, conceptId]);
        }
      });
    }
  });
  
  // Third pass: Ensure ALL concepts are assigned to at least one level
  const allConceptIds = Array.from(conceptAssignments.keys());
  const assignedConceptIds = new Set<string>();
  
  // Collect all currently assigned concepts
  levelConcepts.forEach((concepts) => {
    concepts.forEach((id) => assignedConceptIds.add(id));
  });
  
  // Find unassigned concepts
  const unassignedConcepts = allConceptIds.filter((id) => !assignedConceptIds.has(id));
  console.log(`  Found ${unassignedConcepts.length} unassigned concepts, distributing...`);
  
  // Distribute unassigned concepts evenly across levels
  unassignedConcepts.forEach((conceptId, index) => {
    // Distribute evenly: assign to level based on index
    const targetLevel = (index % 40) + 1;
    const current = levelConcepts.get(targetLevel) || [];
    if (!current.includes(conceptId) && current.length < targetMax) {
      levelConcepts.set(targetLevel, [...current, conceptId]);
    } else {
      // If level is full, find next available level
      for (let level = 1; level <= 40; level++) {
        const levelConceptsList = levelConcepts.get(level) || [];
        if (!levelConceptsList.includes(conceptId) && levelConceptsList.length < targetMax) {
          levelConcepts.set(level, [...levelConceptsList, conceptId]);
          break;
        }
      }
    }
  });
  
  // Fourth pass: Fill levels that are below minimum with any available concepts
  const allConcepts = await prisma.conceptCard.findMany();
  for (let level = 1; level <= 40; level++) {
    const current = levelConcepts.get(level) || [];
    if (current.length < targetMin) {
      const needed = targetMin - current.length;
      const assignedAll = new Set<string>();
      levelConcepts.forEach((concepts) => {
        concepts.forEach((id) => assignedAll.add(id));
      });
      
      const available = allConcepts
        .filter((c) => !current.includes(c.id))
        .slice(0, needed);
      
      available.forEach((concept) => {
        if (!current.includes(concept.id)) {
          current.push(concept.id);
        }
      });
      levelConcepts.set(level, current);
    }
  }
  
  // Final pass: Ensure every concept is in at least one level
  const finalAssigned = new Set<string>();
  levelConcepts.forEach((concepts) => {
    concepts.forEach((id) => finalAssigned.add(id));
  });
  
  const stillUnassigned = allConcepts.filter((c) => !finalAssigned.has(c.id));
  console.log(`  Distributing ${stillUnassigned.length} remaining unassigned concepts...`);
  
  // Distribute remaining concepts round-robin
  stillUnassigned.forEach((concept, index) => {
    const targetLevel = ((index % 40) + 1) as number;
    const current = levelConcepts.get(targetLevel) || [];
    if (!current.includes(concept.id)) {
      levelConcepts.set(targetLevel, [...current, concept.id]);
    }
  });
  
  // Step 6: Update challenges with balanced concept assignments
  console.log("💾 Updating challenges with balanced concept assignments...");
  for (const challenge of allChallenges) {
    const conceptsForLevel = levelConcepts.get(challenge.level) || [];
    
    await prisma.challenge.update({
      where: { id: challenge.id },
      data: { concepts: conceptsForLevel },
    });
  }

  // Step 6: Validate coverage
  console.log("✅ Validating coverage...");
  const coverage = await validateCoverage();

  return coverage;
}

