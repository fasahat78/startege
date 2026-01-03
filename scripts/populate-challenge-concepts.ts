/**
 * Populate Challenge.concepts from CSV files
 * 
 * This script reads CSV files and matches ConceptCard records by name,
 * then updates Challenge.concepts arrays.
 */

import { prisma } from "../lib/db";
import { parse } from "csv-parse/sync";
import * as fs from "fs";

async function populateChallengeConcepts() {
  console.log("📥 Populating Challenge.concepts from CSV files...\n");

  // Get all ConceptCard records
  const allConcepts = await (prisma as any).conceptCard.findMany({
    select: { id: true, name: true, concept: true },
  });

  // Build lookup maps
  const conceptByName = new Map<string, typeof allConcepts[0]>();
  allConcepts.forEach((c: any) => {
    const nameKey = (c.name || c.concept || "").toLowerCase().trim();
    if (nameKey) {
      conceptByName.set(nameKey, c);
    }
    if (c.name && c.name !== c.concept) {
      const conceptKey = (c.concept || "").toLowerCase().trim();
      if (conceptKey) {
        conceptByName.set(conceptKey, c);
      }
    }
  });

  console.log(`Found ${allConcepts.length} ConceptCard records`);
  console.log(`Built lookup map with ${conceptByName.size} entries\n`);

  // Process each level CSV
  for (let level = 1; level <= 9; level++) {
    const csvPath = `data/level-${level}-concepts.csv`;
    
    if (!fs.existsSync(csvPath)) {
      console.log(`⚠️  Level ${level}: CSV file not found`);
      continue;
    }

    const csvContent = fs.readFileSync(csvPath, "utf-8");
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    }) as any[];

    const conceptIds: string[] = [];
    const notFound: string[] = [];

    for (const record of records) {
      const conceptName = (record.conceptName || record.concept || "").trim();
      if (!conceptName) continue;

      const lookupKey = conceptName.toLowerCase();
      const concept = conceptByName.get(lookupKey);

      if (concept) {
        conceptIds.push(concept.id);
      } else {
        notFound.push(conceptName);
      }
    }

    // Update Challenge record
    try {
      const challenge = await (prisma as any).challenge.findUnique({
        where: { levelNumber: level },
      });

      if (!challenge) {
        console.log(`⚠️  Level ${level}: Challenge record not found`);
        continue;
      }

      await (prisma as any).challenge.update({
        where: { levelNumber: level },
        data: {
          concepts: conceptIds,
        },
      });

      console.log(`✅ Level ${level}: ${conceptIds.length}/${records.length} concepts matched`);
      if (notFound.length > 0) {
        console.log(`   ⚠️  Not found: ${notFound.slice(0, 3).join(", ")}${notFound.length > 3 ? "..." : ""}`);
      }
    } catch (error: any) {
      console.log(`❌ Level ${level}: Error updating - ${error.message}`);
    }
  }

  console.log("\n✅ Done!");
  await prisma.$disconnect();
}

populateChallengeConcepts();

