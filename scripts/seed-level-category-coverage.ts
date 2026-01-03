import { prisma } from "../lib/db";

/**
 * Seed LevelCategoryCoverage
 * 
 * Creates the curriculum map that declares, for each level:
 * - which categories are INTRODUCED/PRACTICED/ASSESSED
 * 
 * This enforces progressive coverage: INTRODUCED → PRACTICED → ASSESSED
 */

interface CoverageEntry {
  level: number;
  domain: string;
  category: string;
  coverageType: "INTRODUCED" | "PRACTICED" | "ASSESSED";
}

/**
 * Foundation Block (Levels 1-10) Coverage Map
 * 
 * Legend:
 * I = INTRODUCED
 * P = PRACTICED
 * A = ASSESSED
 */
const FOUNDATION_COVERAGE: CoverageEntry[] = [
  // Level 1 — Introduction to AI Governance
  { level: 1, domain: "Domain 1", category: "AI Fundamentals", coverageType: "INTRODUCED" },
  { level: 1, domain: "Domain 1", category: "Governance Principles", coverageType: "INTRODUCED" },
  { level: 1, domain: "Domain 1", category: "Governance Structures & Roles", coverageType: "INTRODUCED" },

  // Level 2 — Core Principles
  { level: 2, domain: "Domain 1", category: "Policies & Standards (Internal)", coverageType: "INTRODUCED" },
  { level: 2, domain: "Domain 1", category: "AI Lifecycle Governance", coverageType: "INTRODUCED" },
  { level: 2, domain: "Domain 1", category: "AI Fundamentals", coverageType: "PRACTICED" },
  { level: 2, domain: "Domain 1", category: "Governance Principles", coverageType: "PRACTICED" },

  // Level 3 — GDPR Fundamentals
  { level: 3, domain: "Domain 2", category: "Data Protection & Privacy Law", coverageType: "INTRODUCED" },
  { level: 3, domain: "Domain 1", category: "Policies & Standards (Internal)", coverageType: "PRACTICED" },

  // Level 4 — Data Protection
  { level: 4, domain: "Domain 3", category: "Data Governance & Management", coverageType: "INTRODUCED" },
  { level: 4, domain: "Domain 2", category: "Data Protection & Privacy Law", coverageType: "PRACTICED" },

  // Level 5 — Privacy Rights
  { level: 5, domain: "Domain 2", category: "Regulatory Oversight & Authorities", coverageType: "INTRODUCED" },
  { level: 5, domain: "Domain 2", category: "Data Protection & Privacy Law", coverageType: "PRACTICED" },
  { level: 5, domain: "Domain 3", category: "Data Governance & Management", coverageType: "PRACTICED" },

  // Level 6 — AI Act Overview
  { level: 6, domain: "Domain 2", category: "AI-Specific Regulation", coverageType: "INTRODUCED" },
  { level: 6, domain: "Domain 1", category: "AI Lifecycle Governance", coverageType: "PRACTICED" },
  { level: 6, domain: "Domain 1", category: "Governance Structures & Roles", coverageType: "PRACTICED" },

  // Level 7 — Risk Management
  { level: 7, domain: "Domain 3", category: "Risk Identification & Assessment", coverageType: "INTRODUCED" },
  { level: 7, domain: "Domain 4", category: "Operational Monitoring & Controls", coverageType: "INTRODUCED" },
  { level: 7, domain: "Domain 2", category: "AI-Specific Regulation", coverageType: "PRACTICED" },
  { level: 7, domain: "Domain 3", category: "Data Governance & Management", coverageType: "PRACTICED" },

  // Level 8 — Transparency
  { level: 8, domain: "Domain 4", category: "Transparency & Communication", coverageType: "INTRODUCED" },
  { level: 8, domain: "Domain 3", category: "Documentation & Record-Keeping", coverageType: "INTRODUCED" },
  { level: 8, domain: "Domain 1", category: "Policies & Standards (Internal)", coverageType: "PRACTICED" },
  { level: 8, domain: "Domain 1", category: "AI Lifecycle Governance", coverageType: "PRACTICED" },

  // Level 9 — Accountability
  { level: 9, domain: "Domain 1", category: "Decision-Making & Escalation", coverageType: "INTRODUCED" },
  { level: 9, domain: "Domain 4", category: "Incident & Issue Management", coverageType: "INTRODUCED" },
  { level: 9, domain: "Domain 3", category: "Risk Identification & Assessment", coverageType: "PRACTICED" },
  { level: 9, domain: "Domain 4", category: "Transparency & Communication", coverageType: "PRACTICED" },

  // Level 10 — Foundation Mastery (Boss) - ASSESS all categories introduced in 1-9
  { level: 10, domain: "Domain 1", category: "AI Fundamentals", coverageType: "ASSESSED" },
  { level: 10, domain: "Domain 1", category: "Governance Principles", coverageType: "ASSESSED" },
  { level: 10, domain: "Domain 1", category: "Governance Structures & Roles", coverageType: "ASSESSED" },
  { level: 10, domain: "Domain 1", category: "Policies & Standards (Internal)", coverageType: "ASSESSED" },
  { level: 10, domain: "Domain 1", category: "AI Lifecycle Governance", coverageType: "ASSESSED" },
  { level: 10, domain: "Domain 1", category: "Decision-Making & Escalation", coverageType: "ASSESSED" },
  { level: 10, domain: "Domain 2", category: "Data Protection & Privacy Law", coverageType: "ASSESSED" },
  { level: 10, domain: "Domain 2", category: "Regulatory Oversight & Authorities", coverageType: "ASSESSED" },
  { level: 10, domain: "Domain 2", category: "AI-Specific Regulation", coverageType: "ASSESSED" },
  { level: 10, domain: "Domain 3", category: "Data Governance & Management", coverageType: "ASSESSED" },
  { level: 10, domain: "Domain 3", category: "Risk Identification & Assessment", coverageType: "ASSESSED" },
  { level: 10, domain: "Domain 3", category: "Documentation & Record-Keeping", coverageType: "ASSESSED" },
  { level: 10, domain: "Domain 4", category: "Operational Monitoring & Controls", coverageType: "ASSESSED" },
  { level: 10, domain: "Domain 4", category: "Transparency & Communication", coverageType: "ASSESSED" },
  { level: 10, domain: "Domain 4", category: "Incident & Issue Management", coverageType: "ASSESSED" },
];

/**
 * Building Block (Levels 11-20) Coverage Map
 * 
 * Builds on Foundation - no re-introductions, only deeper practice and new categories
 */
const BUILDING_COVERAGE: CoverageEntry[] = [
  // Level 11 — Intermediate Applications
  { level: 11, domain: "Domain 3", category: "Use Case Definition & Scoping", coverageType: "INTRODUCED" },
  { level: 11, domain: "Domain 1", category: "AI Lifecycle Governance", coverageType: "PRACTICED" },
  { level: 11, domain: "Domain 3", category: "Risk Identification & Assessment", coverageType: "PRACTICED" },

  // Level 12 — Cross-Border Data
  { level: 12, domain: "Domain 2", category: "Cross-Border Data & Jurisdiction", coverageType: "INTRODUCED" },
  { level: 12, domain: "Domain 2", category: "Data Protection & Privacy Law", coverageType: "PRACTICED" },
  { level: 12, domain: "Domain 3", category: "Data Governance & Management", coverageType: "PRACTICED" },

  // Level 13 — AI Act Requirements
  { level: 13, domain: "Domain 2", category: "AI-Specific Regulation", coverageType: "PRACTICED" },
  { level: 13, domain: "Domain 3", category: "Documentation & Record-Keeping", coverageType: "PRACTICED" },

  // Level 14 — Impact Assessments
  { level: 14, domain: "Domain 3", category: "Impact Assessments", coverageType: "INTRODUCED" },
  { level: 14, domain: "Domain 3", category: "Risk Identification & Assessment", coverageType: "PRACTICED" },
  { level: 14, domain: "Domain 1", category: "Decision-Making & Escalation", coverageType: "PRACTICED" },

  // Level 15 — High-Risk AI Systems
  { level: 15, domain: "Domain 2", category: "AI-Specific Regulation", coverageType: "PRACTICED" },
  { level: 15, domain: "Domain 3", category: "Impact Assessments", coverageType: "PRACTICED" },
  { level: 15, domain: "Domain 3", category: "Testing, Validation & Evaluation", coverageType: "PRACTICED" },

  // Level 16 — Algorithmic Accountability
  { level: 16, domain: "Domain 4", category: "Audit, Assurance & Review", coverageType: "INTRODUCED" },
  { level: 16, domain: "Domain 1", category: "Governance Structures & Roles", coverageType: "PRACTICED" },
  { level: 16, domain: "Domain 3", category: "Documentation & Record-Keeping", coverageType: "PRACTICED" },

  // Level 17 — Bias and Fairness
  { level: 17, domain: "Domain 3", category: "Bias, Fairness & Harm Mitigation", coverageType: "INTRODUCED" },
  { level: 17, domain: "Domain 3", category: "Data Governance & Management", coverageType: "PRACTICED" },
  { level: 17, domain: "Domain 3", category: "Testing, Validation & Evaluation", coverageType: "PRACTICED" },

  // Level 18 — Enforcement Mechanisms
  { level: 18, domain: "Domain 2", category: "Enforcement & Penalties", coverageType: "INTRODUCED" },
  { level: 18, domain: "Domain 2", category: "Regulatory Oversight & Authorities", coverageType: "PRACTICED" },
  { level: 18, domain: "Domain 4", category: "Incident & Issue Management", coverageType: "PRACTICED" },

  // Level 19 — Compliance Frameworks
  { level: 19, domain: "Domain 2", category: "International Standards & Frameworks", coverageType: "INTRODUCED" },
  { level: 19, domain: "Domain 1", category: "Policies & Standards (Internal)", coverageType: "PRACTICED" },
  { level: 19, domain: "Domain 4", category: "Audit, Assurance & Review", coverageType: "PRACTICED" },

  // Level 20 — Intermediate Mastery (Boss) - ASSESS new categories introduced in 11-19
  { level: 20, domain: "Domain 3", category: "Use Case Definition & Scoping", coverageType: "ASSESSED" },
  { level: 20, domain: "Domain 2", category: "Cross-Border Data & Jurisdiction", coverageType: "ASSESSED" },
  { level: 20, domain: "Domain 3", category: "Impact Assessments", coverageType: "ASSESSED" },
  { level: 20, domain: "Domain 4", category: "Audit, Assurance & Review", coverageType: "ASSESSED" },
  { level: 20, domain: "Domain 3", category: "Bias, Fairness & Harm Mitigation", coverageType: "ASSESSED" },
  { level: 20, domain: "Domain 2", category: "Enforcement & Penalties", coverageType: "ASSESSED" },
  { level: 20, domain: "Domain 2", category: "International Standards & Frameworks", coverageType: "ASSESSED" },
];

/**
 * Advanced Block (Levels 21-30) Coverage Map
 * 
 * Focus on multi-jurisdictional reasoning, ethical trade-offs, governance model design,
 * and continuous risk management. Assumes Foundation and Building categories are mastered.
 */
const ADVANCED_COVERAGE: CoverageEntry[] = [
  // Level 21 — Advanced Scenarios
  { level: 21, domain: "Domain 3", category: "Risk Identification & Assessment", coverageType: "PRACTICED" },
  { level: 21, domain: "Domain 4", category: "Operational Monitoring & Controls", coverageType: "PRACTICED" },
  { level: 21, domain: "Domain 4", category: "Incident & Issue Management", coverageType: "PRACTICED" },

  // Level 22 — Multi-Jurisdictional
  { level: 22, domain: "Domain 2", category: "Other Relevant Laws", coverageType: "INTRODUCED" },
  { level: 22, domain: "Domain 2", category: "Cross-Border Data & Jurisdiction", coverageType: "PRACTICED" },
  { level: 22, domain: "Domain 2", category: "Regulatory Interpretation & Guidance", coverageType: "PRACTICED" },

  // Level 23 — Ethical Frameworks
  // Note: Governance Principles is advanced ethical application, not re-introduction
  { level: 23, domain: "Domain 1", category: "Governance Principles", coverageType: "PRACTICED" },
  { level: 23, domain: "Domain 1", category: "Strategy & Value Realisation", coverageType: "PRACTICED" },
  { level: 23, domain: "Domain 4", category: "Transparency & Communication", coverageType: "PRACTICED" },

  // Level 24 — Regulatory Sandboxes
  { level: 24, domain: "Domain 2", category: "Regulatory Interpretation & Guidance", coverageType: "INTRODUCED" },
  { level: 24, domain: "Domain 3", category: "Use Case Definition & Scoping", coverageType: "PRACTICED" },
  { level: 24, domain: "Domain 4", category: "Change Management & Updates", coverageType: "PRACTICED" },

  // Level 25 — Case Law Analysis
  { level: 25, domain: "Domain 2", category: "Other Relevant Laws", coverageType: "PRACTICED" },
  { level: 25, domain: "Domain 2", category: "Enforcement & Penalties", coverageType: "PRACTICED" },

  // Level 26 — Governance Models
  { level: 26, domain: "Domain 1", category: "Operating Models", coverageType: "INTRODUCED" },
  { level: 26, domain: "Domain 1", category: "Governance Structures & Roles", coverageType: "PRACTICED" },
  { level: 26, domain: "Domain 1", category: "Policies & Standards (Internal)", coverageType: "PRACTICED" },

  // Level 27 — Risk Management Advanced
  { level: 27, domain: "Domain 3", category: "Risk Identification & Assessment", coverageType: "PRACTICED" },
  { level: 27, domain: "Domain 3", category: "Impact Assessments", coverageType: "PRACTICED" },
  { level: 27, domain: "Domain 4", category: "Operational Monitoring & Controls", coverageType: "PRACTICED" },

  // Level 28 — Strategic Compliance
  { level: 28, domain: "Domain 2", category: "International Standards & Frameworks", coverageType: "PRACTICED" },
  { level: 28, domain: "Domain 1", category: "Strategy & Value Realisation", coverageType: "PRACTICED" },

  // Level 29 — Emerging Regulations
  { level: 29, domain: "Domain 2", category: "Emerging & Future Regulation", coverageType: "INTRODUCED" },
  { level: 29, domain: "Domain 2", category: "Regulatory Oversight & Authorities", coverageType: "PRACTICED" },
  { level: 29, domain: "Domain 1", category: "Decision-Making & Escalation", coverageType: "PRACTICED" },

  // Level 30 — Advanced Mastery (Boss) - ASSESS key categories from Advanced block
  { level: 30, domain: "Domain 2", category: "Other Relevant Laws", coverageType: "ASSESSED" },
  { level: 30, domain: "Domain 2", category: "Regulatory Interpretation & Guidance", coverageType: "ASSESSED" },
  { level: 30, domain: "Domain 2", category: "Emerging & Future Regulation", coverageType: "ASSESSED" },
  { level: 30, domain: "Domain 1", category: "Operating Models", coverageType: "ASSESSED" },
  { level: 30, domain: "Domain 1", category: "Strategy & Value Realisation", coverageType: "ASSESSED" },
  { level: 30, domain: "Domain 3", category: "Risk Identification & Assessment", coverageType: "ASSESSED" },
  { level: 30, domain: "Domain 3", category: "Impact Assessments", coverageType: "ASSESSED" },
  { level: 30, domain: "Domain 4", category: "Operational Monitoring & Controls", coverageType: "ASSESSED" },
  { level: 30, domain: "Domain 4", category: "Incident & Issue Management", coverageType: "ASSESSED" },
];

/**
 * Mastery Block (Levels 31-40) Coverage Map
 * 
 * Executive, board, regulator, and chief risk officer-grade.
 * Focus on synthesis, design, judgment, and leadership.
 * No new basics - only integration and mastery.
 */
const MASTERY_COVERAGE: CoverageEntry[] = [
  // Level 31 — Expert Synthesis
  { level: 31, domain: "Domain 1", category: "Governance Principles", coverageType: "PRACTICED" },
  { level: 31, domain: "Domain 1", category: "AI Lifecycle Governance", coverageType: "PRACTICED" },
  { level: 31, domain: "Domain 3", category: "Risk Identification & Assessment", coverageType: "PRACTICED" },
  { level: 31, domain: "Domain 4", category: "Operational Monitoring & Controls", coverageType: "PRACTICED" },

  // Level 32 — Framework Design
  { level: 32, domain: "Domain 1", category: "Operating Models", coverageType: "PRACTICED" },
  { level: 32, domain: "Domain 1", category: "Policies & Standards (Internal)", coverageType: "PRACTICED" },
  { level: 32, domain: "Domain 2", category: "International Standards & Frameworks", coverageType: "PRACTICED" },

  // Level 33 — Real-World Problems
  { level: 33, domain: "Domain 3", category: "Use Case Definition & Scoping", coverageType: "PRACTICED" },
  { level: 33, domain: "Domain 4", category: "Vendor & Third-Party Governance", coverageType: "PRACTICED" },
  { level: 33, domain: "Domain 4", category: "Incident & Issue Management", coverageType: "PRACTICED" },

  // Level 34 — Multi-Domain Integration
  { level: 34, domain: "Domain 2", category: "Cross-Border Data & Jurisdiction", coverageType: "PRACTICED" },
  { level: 34, domain: "Domain 3", category: "Data Governance & Management", coverageType: "PRACTICED" },
  { level: 34, domain: "Domain 4", category: "Transparency & Communication", coverageType: "PRACTICED" },

  // Level 35 — Strategic Planning
  { level: 35, domain: "Domain 1", category: "Strategy & Value Realisation", coverageType: "PRACTICED" },
  { level: 35, domain: "Domain 1", category: "Decision-Making & Escalation", coverageType: "PRACTICED" },
  { level: 35, domain: "Domain 4", category: "Change Management & Updates", coverageType: "PRACTICED" },

  // Level 36 — Expert Analysis
  { level: 36, domain: "Domain 2", category: "AI-Specific Regulation", coverageType: "PRACTICED" },
  { level: 36, domain: "Domain 2", category: "Enforcement & Penalties", coverageType: "PRACTICED" },
  { level: 36, domain: "Domain 3", category: "Impact Assessments", coverageType: "PRACTICED" },

  // Level 37 — Mastery Integration
  { level: 37, domain: "Domain 1", category: "Governance Structures & Roles", coverageType: "PRACTICED" },
  { level: 37, domain: "Domain 3", category: "Documentation & Record-Keeping", coverageType: "PRACTICED" },
  { level: 37, domain: "Domain 4", category: "Audit, Assurance & Review", coverageType: "PRACTICED" },

  // Level 38 — Advanced Frameworks
  { level: 38, domain: "Domain 2", category: "Regulatory Interpretation & Guidance", coverageType: "PRACTICED" },
  { level: 38, domain: "Domain 2", category: "Emerging & Future Regulation", coverageType: "PRACTICED" },
  { level: 38, domain: "Domain 1", category: "Operating Models", coverageType: "PRACTICED" },

  // Level 39 — Expert Synthesis
  { level: 39, domain: "Domain 1", category: "Governance Principles", coverageType: "PRACTICED" },
  { level: 39, domain: "Domain 1", category: "Strategy & Value Realisation", coverageType: "PRACTICED" },
  { level: 39, domain: "Domain 3", category: "Risk Identification & Assessment", coverageType: "PRACTICED" },
  { level: 39, domain: "Domain 4", category: "Operational Monitoring & Controls", coverageType: "PRACTICED" },

  // Level 40 — AI Governance Master (Final Boss) - ASSESS ALL categories from entire program
  // Domain 1 — Foundations
  { level: 40, domain: "Domain 1", category: "AI Fundamentals", coverageType: "ASSESSED" },
  { level: 40, domain: "Domain 1", category: "Governance Principles", coverageType: "ASSESSED" },
  { level: 40, domain: "Domain 1", category: "Governance Structures & Roles", coverageType: "ASSESSED" },
  { level: 40, domain: "Domain 1", category: "Policies & Standards (Internal)", coverageType: "ASSESSED" },
  { level: 40, domain: "Domain 1", category: "AI Lifecycle Governance", coverageType: "ASSESSED" },
  { level: 40, domain: "Domain 1", category: "Decision-Making & Escalation", coverageType: "ASSESSED" },
  { level: 40, domain: "Domain 1", category: "Operating Models", coverageType: "ASSESSED" },
  { level: 40, domain: "Domain 1", category: "Organisational Change & Adoption", coverageType: "ASSESSED" },
  { level: 40, domain: "Domain 1", category: "Strategy & Value Realisation", coverageType: "ASSESSED" },

  // Domain 2 — Laws & Frameworks
  { level: 40, domain: "Domain 2", category: "Data Protection & Privacy Law", coverageType: "ASSESSED" },
  { level: 40, domain: "Domain 2", category: "AI-Specific Regulation", coverageType: "ASSESSED" },
  { level: 40, domain: "Domain 2", category: "Other Relevant Laws", coverageType: "ASSESSED" },
  { level: 40, domain: "Domain 2", category: "Cross-Border Data & Jurisdiction", coverageType: "ASSESSED" },
  { level: 40, domain: "Domain 2", category: "Regulatory Oversight & Authorities", coverageType: "ASSESSED" },
  { level: 40, domain: "Domain 2", category: "Enforcement & Penalties", coverageType: "ASSESSED" },
  { level: 40, domain: "Domain 2", category: "International Standards & Frameworks", coverageType: "ASSESSED" },
  { level: 40, domain: "Domain 2", category: "Regulatory Interpretation & Guidance", coverageType: "ASSESSED" },
  { level: 40, domain: "Domain 2", category: "Emerging & Future Regulation", coverageType: "ASSESSED" },

  // Domain 3 — Development Governance
  { level: 40, domain: "Domain 3", category: "Use Case Definition & Scoping", coverageType: "ASSESSED" },
  { level: 40, domain: "Domain 3", category: "Data Governance & Management", coverageType: "ASSESSED" },
  { level: 40, domain: "Domain 3", category: "Risk Identification & Assessment", coverageType: "ASSESSED" },
  { level: 40, domain: "Domain 3", category: "Impact Assessments", coverageType: "ASSESSED" },
  { level: 40, domain: "Domain 3", category: "Model Development & Training Controls", coverageType: "ASSESSED" },
  { level: 40, domain: "Domain 3", category: "Bias, Fairness & Harm Mitigation", coverageType: "ASSESSED" },
  { level: 40, domain: "Domain 3", category: "Testing, Validation & Evaluation", coverageType: "ASSESSED" },
  { level: 40, domain: "Domain 3", category: "Documentation & Record-Keeping", coverageType: "ASSESSED" },
  { level: 40, domain: "Domain 3", category: "Human Oversight in Development", coverageType: "ASSESSED" },

  // Domain 4 — Deployment & Use
  { level: 40, domain: "Domain 4", category: "Deployment Models & Architecture", coverageType: "ASSESSED" },
  { level: 40, domain: "Domain 4", category: "Vendor & Third-Party Governance", coverageType: "ASSESSED" },
  { level: 40, domain: "Domain 4", category: "Operational Monitoring & Controls", coverageType: "ASSESSED" },
  { level: 40, domain: "Domain 4", category: "Transparency & Communication", coverageType: "ASSESSED" },
  { level: 40, domain: "Domain 4", category: "Human Oversight in Operations", coverageType: "ASSESSED" },
  { level: 40, domain: "Domain 4", category: "Incident & Issue Management", coverageType: "ASSESSED" },
  { level: 40, domain: "Domain 4", category: "Audit, Assurance & Review", coverageType: "ASSESSED" },
  { level: 40, domain: "Domain 4", category: "Change Management & Updates", coverageType: "ASSESSED" },
  { level: 40, domain: "Domain 4", category: "Decommissioning & Exit", coverageType: "ASSESSED" },
];

// Combine all coverage entries
const ALL_COVERAGE = [...FOUNDATION_COVERAGE, ...BUILDING_COVERAGE, ...ADVANCED_COVERAGE, ...MASTERY_COVERAGE];

async function main() {
  console.log("🌱 Seeding LevelCategoryCoverage for all 40 levels:");
  console.log("   - Foundation (1-10)");
  console.log("   - Building (11-20)");
  console.log("   - Advanced (21-30)");
  console.log("   - Mastery (31-40)\n");

  // Get all categories
  const categories = await (prisma as any).category.findMany({
    include: { domain: true },
  });
  
  const categoryMap = new Map<string, typeof categories[0]>();
  categories.forEach((cat: any) => {
    const key = `${cat.domain.name}:${cat.name}`.toLowerCase();
    categoryMap.set(key, cat);
  });

  let created = 0;
  let skipped = 0;
  const errors: string[] = [];

  // Process coverage entries
  for (const entry of ALL_COVERAGE) {
    const categoryKey = `${entry.domain}:${entry.category}`.toLowerCase();
    const category = categoryMap.get(categoryKey);

    if (!category) {
      console.log(`⚠️  Category "${entry.category}" in "${entry.domain}" not found - skipping`);
      skipped++;
      continue;
    }

    try {
      await (prisma as any).levelCategoryCoverage.upsert({
        where: {
          levelNumber_categoryId_coverageType: {
            levelNumber: entry.level,
            categoryId: category.id,
            coverageType: entry.coverageType,
          },
        },
        update: {
          weight: 1.0,
        },
        create: {
          levelNumber: entry.level,
          categoryId: category.id,
          coverageType: entry.coverageType,
          weight: 1.0,
        },
      });
      created++;
      
      const icon = entry.coverageType === "INTRODUCED" ? "🆕" : entry.coverageType === "PRACTICED" ? "🔄" : "✅";
      console.log(`  ${icon} Level ${entry.level}: ${entry.category} (${entry.coverageType})`);
    } catch (error: any) {
      const errorMsg = `Error creating coverage for level ${entry.level}, category ${category.name}: ${error.message}`;
      errors.push(errorMsg);
      console.error(`  ❌ ${errorMsg}`);
    }
  }

  // Summary by level
  console.log(`\n📊 Coverage Summary by Level:`);
  for (let level = 1; level <= 40; level++) {
    const levelEntries = ALL_COVERAGE.filter((e) => e.level === level);
    const introduced = levelEntries.filter((e) => e.coverageType === "INTRODUCED").length;
    const practiced = levelEntries.filter((e) => e.coverageType === "PRACTICED").length;
    const assessed = levelEntries.filter((e) => e.coverageType === "ASSESSED").length;
    
    const bossIcon = level === 10 || level === 20 || level === 30 || level === 40 ? " 👑 BOSS" : "";
    let blockLabel = "";
    if (level <= 10) blockLabel = " (Foundation)";
    else if (level <= 20) blockLabel = " (Building)";
    else if (level <= 30) blockLabel = " (Advanced)";
    else if (level <= 40) blockLabel = " (Mastery)";
    
    console.log(
      `  Level ${level}${blockLabel}: ${introduced} introduced, ${practiced} practiced, ${assessed} assessed${bossIcon}`
    );
  }

  // Category introduction order check
  console.log(`\n📋 Category Introduction Order (First Appearance):`);
  const firstAppearance = new Map<string, number>();
  ALL_COVERAGE.forEach((entry) => {
    if (entry.coverageType === "INTRODUCED") {
      const key = `${entry.domain}:${entry.category}`;
      if (!firstAppearance.has(key)) {
        firstAppearance.set(key, entry.level);
      }
    }
  });

  const sorted = Array.from(firstAppearance.entries()).sort((a, b) => a[1] - b[1]);
  sorted.forEach(([category, level]) => {
    console.log(`  Level ${level}: ${category}`);
  });

  console.log(`\n✅ Seeding complete!`);
  console.log(`   - Coverage entries created: ${created}`);
  console.log(`   - Skipped: ${skipped}`);
  console.log(`   - Errors: ${errors.length}`);

  if (errors.length > 0) {
    console.log(`\n❌ Errors:`);
    errors.forEach((err) => console.log(`   - ${err}`));
  }

  // Validation: Check that no category is PRACTICED/ASSESSED before being INTRODUCED
  console.log(`\n🔍 Validating progressive coverage...`);
  const validationErrors: string[] = [];
  
  for (const entry of ALL_COVERAGE) {
    if (entry.coverageType !== "INTRODUCED") {
      const introLevel = firstAppearance.get(`${entry.domain}:${entry.category}`);
      if (!introLevel || introLevel >= entry.level) {
        validationErrors.push(
          `${entry.category} is ${entry.coverageType} at level ${entry.level} but was never INTRODUCED before`
        );
      }
    }
  }

  if (validationErrors.length > 0) {
    console.log(`❌ Validation errors found:`);
    validationErrors.forEach((err) => console.log(`   - ${err}`));
  } else {
    console.log(`✅ All categories follow INTRODUCED → PRACTICED → ASSESSED progression`);
  }
}

main()
  .catch((e) => {
    console.error("❌ Error seeding level category coverage:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
