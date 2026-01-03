import { prisma } from "../lib/db";
import { parse } from "csv-parse/sync";
import * as fs from "fs";
import * as path from "path";

interface ConceptMapping {
  conceptId?: string;
  conceptName: string;
  primaryLevel: number;
  levelTheme: string;
  complexity: string;
  alignment: string;
  isSpiralLearning: boolean;
  spiralLevels: number[];
  domain: string;
  category: string;
  notes?: string;
}

interface ValidationError {
  type: string;
  message: string;
  concept?: string;
  level?: number;
}

interface ImportResult {
  totalMappings: number;
  conceptsMatched: number;
  conceptsNotFound: string[];
  levelsUpdated: number;
  errors: string[];
  validationErrors: ValidationError[];
  warnings: string[];
}

async function importFromCSV(filePath: string): Promise<ImportResult> {
  const fileContent = fs.readFileSync(filePath, "utf-8");
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as any[];

  return await processMappings(records);
}

async function importFromJSON(filePath: string): Promise<ImportResult> {
  const fileContent = fs.readFileSync(filePath, "utf-8");
  const data = JSON.parse(fileContent);
  const records = data.mappings || data;

  return await processMappings(records);
}

async function processMappings(records: any[]): Promise<ImportResult> {
  const result: ImportResult = {
    totalMappings: records.length,
    conceptsMatched: 0,
    conceptsNotFound: [],
    levelsUpdated: 0,
    errors: [],
    validationErrors: [],
    warnings: [],
  };

  // Get all concepts from database
  const allConcepts = await (prisma as any).conceptCard.findMany();
  const conceptMap = new Map<string, typeof allConcepts[0]>();
  allConcepts.forEach((c: any) => {
    conceptMap.set(c.id, c);
    conceptMap.set(c.concept.toLowerCase(), c);
    if (c.name) {
      conceptMap.set(c.name.toLowerCase(), c);
    }
  });

  // Get all categories
  const allCategories = await (prisma as any).category.findMany({
    include: { domain: true },
  });
  const categoryMap = new Map<string, typeof allCategories[0]>();
  allCategories.forEach((cat: any) => {
    const key = `${cat.domain.name}:${cat.name}`.toLowerCase();
    categoryMap.set(key, cat);
    categoryMap.set(cat.name.toLowerCase(), cat);
  });

  // Get all challenges
  const allChallenges = await (prisma as any).challenge.findMany();
  const challengeMap = new Map<number, typeof allChallenges[0]>();
  allChallenges.forEach((c: any) => {
    challengeMap.set(c.levelNumber, c);
  });

  // Track concept assignments for validation
  const conceptToLevels = new Map<string, number[]>();
  const conceptToPrimaryLevel = new Map<string, number>();
  const levelToConcepts = new Map<number, string[]>();

  // Initialize level arrays
  for (let i = 1; i <= 40; i++) {
    levelToConcepts.set(i, []);
  }

  // ============================================
  // VALIDATION A: Parse and validate mappings
  // ============================================

  const mappings: ConceptMapping[] = [];

  for (const record of records) {
    try {
      const mapping: ConceptMapping = {
        conceptId: record.conceptId,
        conceptName: record.conceptName || record.concept,
        primaryLevel: parseInt(record.primaryLevel),
        levelTheme: record.levelTheme,
        complexity: record.complexity || record.difficulty,
        alignment: record.alignment,
        isSpiralLearning:
          record.isSpiralLearning === "true" ||
          record.isSpiralLearning === true ||
          record.isSpiralLearning === "1",
        spiralLevels: parseSpiralLevels(record.spiralLevels),
        domain: record.domain,
        category: record.category,
        notes: record.notes,
      };

      // Validate primary level
      if (isNaN(mapping.primaryLevel) || mapping.primaryLevel < 1 || mapping.primaryLevel > 40) {
        result.validationErrors.push({
          type: "INVALID_PRIMARY_LEVEL",
          message: `Invalid primary level: ${record.primaryLevel}`,
          concept: mapping.conceptName,
        });
        continue;
      }

      // Find or create concept
      let concept =
        mapping.conceptId && conceptMap.has(mapping.conceptId)
          ? conceptMap.get(mapping.conceptId)!
          : conceptMap.get(mapping.conceptName.toLowerCase());

      // If concept doesn't exist, create it automatically
      if (!concept) {
        // Resolve category from domain + category
        const categoryKey = `${mapping.domain}:${mapping.category}`.toLowerCase();
        const category = categoryMap.get(categoryKey) || categoryMap.get(mapping.category.toLowerCase());

        if (!category) {
          result.validationErrors.push({
            type: "CATEGORY_NOT_FOUND",
            message: `Category "${mapping.category}" in "${mapping.domain}" not found in database`,
            concept: mapping.conceptName,
          });
          continue;
        }

        // Create new ConceptCard with minimal required fields
        try {
          const newConcept = await (prisma as any).conceptCard.create({
            data: {
              concept: mapping.conceptName,
              name: mapping.conceptName, // Use conceptName as name for matching
              definition: "TBD - Definition to be added", // Placeholder
              shortDefinition: "TBD", // Placeholder
              boundary: "TBD", // Placeholder
              categoryId: category.id,
              domain: mapping.domain, // Legacy field
              category: mapping.category, // Legacy field
              difficulty: mapping.complexity || "beginner",
              importance: mapping.alignment === "high" ? "high" : mapping.alignment === "medium" ? "medium" : "low",
              source: "import",
              version: "1.0.0",
            },
          });

          // Add to concept map for subsequent lookups
          conceptMap.set(newConcept.id, newConcept);
          conceptMap.set(newConcept.concept.toLowerCase(), newConcept);
          if (newConcept.name) {
            conceptMap.set(newConcept.name.toLowerCase(), newConcept);
          }

          concept = newConcept;
          console.log(`  ✅ Created ConceptCard: ${mapping.conceptName}`);
        } catch (error: any) {
          result.errors.push(`Error creating concept "${mapping.conceptName}": ${error.message}`);
          continue;
        }
      }

      mappings.push({ ...mapping, conceptId: concept.id });
    } catch (error: any) {
      result.errors.push(`Error parsing record: ${error.message}`);
    }
  }

  // ============================================
  // VALIDATION B: Primary level uniqueness
  // ============================================

  for (const mapping of mappings) {
    const conceptId = mapping.conceptId!;
    const existingPrimary = conceptToPrimaryLevel.get(conceptId);

    if (existingPrimary !== undefined && existingPrimary !== mapping.primaryLevel) {
      result.validationErrors.push({
        type: "DUPLICATE_PRIMARY_LEVEL",
        message: `Concept has multiple primary levels: ${existingPrimary} and ${mapping.primaryLevel}`,
        concept: mapping.conceptName,
      });
      continue;
    }

    conceptToPrimaryLevel.set(conceptId, mapping.primaryLevel);
  }

  // ============================================
  // VALIDATION A: No accidental repeats
  // ============================================

  for (const mapping of mappings) {
    const conceptId = mapping.conceptId!;
    const allLevels = [mapping.primaryLevel, ...mapping.spiralLevels];
    const uniqueLevels = [...new Set(allLevels)];

    // Check if concept appears in multiple levels without spiral flag
    if (uniqueLevels.length > 1 && !mapping.isSpiralLearning) {
      result.validationErrors.push({
        type: "ACCIDENTAL_REPEAT",
        message: `Concept appears in multiple levels (${uniqueLevels.join(", ")}) but isSpiralLearning=false`,
        concept: mapping.conceptName,
      });
    }

    // Check max spiral levels (max 3)
    if (uniqueLevels.length > 3) {
      result.validationErrors.push({
        type: "TOO_MANY_SPIRAL_LEVELS",
        message: `Concept appears in ${uniqueLevels.length} levels (max 3 allowed)`,
        concept: mapping.conceptName,
      });
    }

    // Track all levels for this concept
    const existing = conceptToLevels.get(conceptId) || [];
    conceptToLevels.set(conceptId, [...new Set([...existing, ...uniqueLevels])]);
  }

  // ============================================
  // VALIDATION C: Level concept distribution (10 per level)
  // ============================================

  // Build level assignments
  for (const mapping of mappings) {
    const conceptId = mapping.conceptId!;
    const allLevels = [mapping.primaryLevel, ...mapping.spiralLevels];

    for (const level of allLevels) {
      const concepts = levelToConcepts.get(level) || [];
      if (!concepts.includes(conceptId)) {
        concepts.push(conceptId);
        levelToConcepts.set(level, concepts);
      }
    }
  }

  // Validate distribution (only check levels that have PRIMARY concepts assigned)
  const levelsWithPrimaryConcepts = new Set<number>();
  mappings.forEach((m) => {
    levelsWithPrimaryConcepts.add(m.primaryLevel);
  });

  for (const level of levelsWithPrimaryConcepts) {
    const primaryConcepts = mappings
      .filter((m) => m.primaryLevel === level)
      .map((m) => m.conceptId!);

    if (primaryConcepts.length !== 10) {
      result.validationErrors.push({
        type: "INVALID_DISTRIBUTION",
        message: `Level ${level} has ${primaryConcepts.length} primary concepts (expected 10)`,
        level,
      });
    }
  }

  // ============================================
  // VALIDATION D: Category coverage alignment
  // ============================================

  // Get LevelCategoryCoverage
  const levelCategoryCoverage = await (prisma as any).levelCategoryCoverage.findMany();
  const coverageMap = new Map<string, Set<string>>(); // "level:category" -> Set<CoverageType>

  levelCategoryCoverage.forEach((coverage: any) => {
    const key = `${coverage.levelNumber}:${coverage.categoryId}`;
    if (!coverageMap.has(key)) {
      coverageMap.set(key, new Set());
    }
    coverageMap.get(key)!.add(coverage.coverageType);
  });

  for (const mapping of mappings) {
    // Find category
    const categoryKey = `${mapping.domain}:${mapping.category}`.toLowerCase();
    const category = categoryMap.get(categoryKey) || categoryMap.get(mapping.category.toLowerCase());

    if (!category) {
      result.warnings.push(
        `Category "${mapping.category}" in "${mapping.domain}" not found in database`
      );
      continue;
    }

    // Check if category is covered at this level
    const coverageKey = `${mapping.primaryLevel}:${category.id}`;
    const coverageTypes = coverageMap.get(coverageKey);

    if (!coverageTypes || coverageTypes.size === 0) {
      result.validationErrors.push({
        type: "MISSING_CATEGORY_COVERAGE",
        message: `Category "${mapping.category}" not covered in LevelCategoryCoverage for level ${mapping.primaryLevel}`,
        concept: mapping.conceptName,
        level: mapping.primaryLevel,
      });
    }
  }

  // ============================================
  // VALIDATION E: Boss exam eligibility
  // ============================================

  const bossLevels = [10, 20, 30, 40];
  for (const bossLevel of bossLevels) {
    const startLevel = bossLevel === 10 ? 1 : bossLevel === 20 ? 11 : bossLevel === 30 ? 21 : 31;
    const endLevel = bossLevel;

    // Check all levels in block exist
    for (let level = startLevel; level <= endLevel; level++) {
      if (!challengeMap.has(level)) {
        result.validationErrors.push({
          type: "MISSING_BOSS_BLOCK_LEVEL",
          message: `Level ${level} missing for boss exam at level ${bossLevel}`,
          level,
        });
      }
    }

    // Check concept count in block
    const blockConcepts = new Set<string>();
    for (let level = startLevel; level <= endLevel; level++) {
      const concepts = levelToConcepts.get(level) || [];
      concepts.forEach((id) => blockConcepts.add(id));
    }

    if (blockConcepts.size !== 100) {
      result.warnings.push(
        `Boss level ${bossLevel} block (${startLevel}-${endLevel}) has ${blockConcepts.size} unique concepts (expected 100)`
      );
    }
  }

  // ============================================
  // STOP IF VALIDATION ERRORS
  // ============================================

  if (result.validationErrors.length > 0) {
    console.error("\n❌ VALIDATION ERRORS FOUND - Import aborted:");
    result.validationErrors.forEach((err) => {
      console.error(`  [${err.type}] ${err.message}`);
    });
    return result;
  }

  // ============================================
  // APPLY MAPPINGS
  // ============================================

  // Update Challenge.concepts arrays
  for (let level = 1; level <= 40; level++) {
    const conceptIds = levelToConcepts.get(level) || [];

    try {
      await (prisma as any).challenge.update({
        where: { levelNumber: level },
        data: {
          concepts: conceptIds,
          level: level, // Update legacy field too
        },
      });
      result.levelsUpdated++;
      console.log(`✅ Updated Level ${level}: ${conceptIds.length} concepts`);
    } catch (error: any) {
      result.errors.push(`Error updating level ${level}: ${error.message}`);
    }
  }

  // Update concept difficulty/importance and categoryId
  for (const mapping of mappings) {
    try {
      const categoryKey = `${mapping.domain}:${mapping.category}`.toLowerCase();
      const category = categoryMap.get(categoryKey) || categoryMap.get(mapping.category.toLowerCase());

      await (prisma as any).conceptCard.update({
        where: { id: mapping.conceptId },
        data: {
          difficulty: mapping.complexity,
          importance: mapping.alignment === "high" ? "high" : mapping.alignment === "medium" ? "medium" : "low",
          categoryId: category?.id,
        },
      });
    } catch (error: any) {
      result.errors.push(`Error updating concept ${mapping.conceptName}: ${error.message}`);
    }
  }

  return result;
}

function parseSpiralLevels(spiralLevels: string | number[]): number[] {
  if (!spiralLevels) return [];
  if (Array.isArray(spiralLevels)) return spiralLevels;
  if (typeof spiralLevels === "string") {
    return spiralLevels
      .split(",")
      .map((s) => parseInt(s.trim()))
      .filter((n) => !isNaN(n) && n >= 1 && n <= 40);
  }
  return [];
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error("Usage: tsx scripts/import-level-mapping.ts <file.csv|file.json>");
    process.exit(1);
  }

  const filePath = args[0];
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }

  const ext = path.extname(filePath).toLowerCase();
  console.log(`📥 Importing level mappings from ${filePath}...`);

  let result: ImportResult;
  try {
    if (ext === ".csv") {
      result = await importFromCSV(filePath);
    } else if (ext === ".json") {
      result = await importFromJSON(filePath);
    } else {
      console.error("Unsupported file format. Use .csv or .json");
      process.exit(1);
    }

    // Print results
    console.log("\n📊 Import Results:");
    console.log(`Total mappings: ${result.totalMappings}`);
    console.log(`Concepts matched: ${result.conceptsMatched}`);
    console.log(`Levels updated: ${result.levelsUpdated}`);
    console.log(`Concepts not found: ${result.conceptsNotFound.length}`);
    console.log(`Validation errors: ${result.validationErrors.length}`);
    console.log(`Warnings: ${result.warnings.length}`);

    if (result.validationErrors.length > 0) {
      console.log("\n❌ Validation Errors:");
      result.validationErrors.forEach((err) => {
        console.log(`  [${err.type}] ${err.message}`);
      });
    }

    if (result.warnings.length > 0) {
      console.log("\n⚠️  Warnings:");
      result.warnings.forEach((warn) => {
        console.log(`  - ${warn}`);
      });
    }

    if (result.conceptsNotFound.length > 0) {
      console.log("\n⚠️  Concepts not found:");
      result.conceptsNotFound.slice(0, 10).forEach((name) => {
        console.log(`  - ${name}`);
      });
      if (result.conceptsNotFound.length > 10) {
        console.log(`  ... and ${result.conceptsNotFound.length - 10} more`);
      }
    }

    if (result.errors.length > 0) {
      console.log("\n❌ Errors:");
      result.errors.forEach((error) => {
        console.log(`  - ${error}`);
      });
    }

    // Generate coverage report
    if (result.validationErrors.length === 0) {
      console.log("\n📈 Coverage Report:");
      const challenges = await (prisma as any).challenge.findMany({
        orderBy: { levelNumber: "asc" },
      });

      for (const challenge of challenges) {
        console.log(
          `Level ${challenge.levelNumber}: ${challenge.concepts.length} concepts ${challenge.isBoss ? "👑 BOSS" : ""}`
        );
      }

      const totalConcepts = challenges.reduce((sum: number, c: any) => sum + c.concepts.length, 0);
      const uniqueConcepts = new Set(challenges.flatMap((c: any) => c.concepts)).size;

      console.log(`\nTotal concept assignments: ${totalConcepts}`);
      console.log(`Unique concepts: ${uniqueConcepts}`);
      console.log(`Coverage: ${((uniqueConcepts / 410) * 100).toFixed(2)}%`);
    }

    if (result.validationErrors.length === 0) {
      console.log("\n✅ Import complete!");
    } else {
      console.log("\n❌ Import failed due to validation errors!");
      process.exit(1);
    }
  } catch (error: any) {
    console.error("❌ Import failed:", error.message);
    console.error(error);
    process.exit(1);
  }
}

main();
