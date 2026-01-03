/**
 * Boss Exam Prompt Generator
 * 
 * Generates prompts for Boss Exams (Levels 10, 20, 30, 40)
 * These exams test integration and mastery across multiple concepts and categories
 */

import { loadBossExamTemplate } from "./prompt-loader";

export interface BossExamPromptParams {
  levelNumber: number;
  levelTitle: string;
  superLevelGroup: string;
  questionCount: number;
  levelRange: [number, number]; // e.g., [11, 19] for Level 20
  concepts: Array<{ 
    id: string; 
    name?: string | null; 
    concept?: string; 
    categoryId?: string | null;
  }>;
  categoryIdMap: Record<string, string>; // categoryId -> categoryName
  requiredCategoryIds: string[];
  levelClusters: Array<{ levels: number[]; theme: string }>;
  difficultyMix: {
    apply: number;
    analyse: number;
    judgement: number;
  };
  maxConceptFrequency: number;
}

/**
 * Generate boss exam prompt
 */
export function generateBossExamPrompt(params: BossExamPromptParams): string {
  const {
    levelNumber,
    levelTitle,
    superLevelGroup,
    questionCount,
    levelRange,
    concepts,
    categoryIdMap,
    requiredCategoryIds,
    levelClusters,
    difficultyMix,
    maxConceptFrequency,
  } = params;

  // Load boss exam template
  const template = loadBossExamTemplate();

  // Optimize: For large concept lists (Level 30), use a more concise format
  // Limit concept details in prompt if there are too many (reduce token usage)
  const MAX_CONCEPTS_IN_PROMPT = 50; // Limit to prevent huge prompts
  
  let conceptsList: string;
  let conceptIdMapping: string;
  
  if (concepts.length > MAX_CONCEPTS_IN_PROMPT) {
    // For large lists, use compact format with just IDs and names
    conceptsList = concepts
      .slice(0, MAX_CONCEPTS_IN_PROMPT)
      .map((c, i) => {
        const name = c.name || c.concept || `Concept ${i + 1}`;
        return `${i + 1}. ${name} (${c.id})`;
      })
      .join("\n") + `\n... and ${concepts.length - MAX_CONCEPTS_IN_PROMPT} more concepts (see full list in conceptIdMapping)`;
    
    // Include ALL concept IDs in mapping (needed for validation)
    conceptIdMapping = concepts
      .map((c) => {
        const name = c.name || c.concept || "Unknown";
        return `  "${c.id}": "${name}"`;
      })
      .join(",\n");
  } else {
    // For smaller lists, use full format
    conceptsList = concepts
      .map((c, i) => {
        const name = c.name || c.concept || `Concept ${i + 1}`;
        return `${i + 1}. ${name} (ID: ${c.id})`;
      })
      .join("\n");

    conceptIdMapping = concepts
      .map((c) => {
        const name = c.name || c.concept || "Unknown";
        return `  "${c.id}": "${name}"`;
      })
      .join(",\n");
  }

  // Build category ID mapping
  const categoryIdMapping = Object.entries(categoryIdMap)
    .map(([id, name]) => `  "${id}": "${name}"`)
    .join(",\n");

  // Build required categories list
  const requiredCategoriesList = requiredCategoryIds
    .map((catId) => {
      const name = categoryIdMap[catId] || catId;
      return `- ${name} (ID: ${catId})`;
    })
    .join("\n");

  // Build level clusters list
  const levelClustersList = levelClusters
    .map((cluster) => {
      const levelsStr = cluster.levels.join(", ");
      return `- Levels ${levelsStr}: ${cluster.theme}`;
    })
    .join("\n");

  // Calculate difficulty counts
  const applyCount = Math.round(questionCount * difficultyMix.apply);
  const analyseCount = Math.round(questionCount * difficultyMix.analyse);
  const judgementCount = questionCount - applyCount - analyseCount; // Ensure total equals questionCount

  // Special handling for Level 40 (Final Boss)
  let finalBossInstructions = "";
  if (levelNumber === 40) {
    finalBossInstructions = `

## FINAL BOSS EXAM - CRITICAL INSTRUCTIONS

This is the FINAL BOSS EXAM for an AI Governance mastery platform.
This exam evaluates whether a learner can be trusted with the highest level of AI governance responsibility.

**Core Philosophy:**
- Every question must involve conflicting values, pressures, or risks
- There is NO "safe" or "perfect" option
- Correct answers are those that are MOST DEFENSIBLE OVER TIME
- Each question must reference multiple concepts and domains
- Avoid textbook, compliance-only, or procedural questions
- Do NOT invent laws, regulators, or obligations
- Use ONLY the provided ConceptCard IDs and Category IDs

**The learner should feel:**
- Accountability
- Uncertainty
- Responsibility for long-term outcomes

**Question Requirements:**
- Every question must be deeply scenario-based
- Must span multiple time horizons (now / later / future)
- Must involve conflicting stakeholder pressures
- Must require a governance position, not a tactic
- Must reference 3-5 concepts
- Must reference 3+ domains
- Must contain NO obviously "correct" answer

**If a question can be answered without internal debate, it is INVALID.**

`;
  }

  // Replace template placeholders
  let prompt = template
    .replace(/<<LEVEL_NUMBER>>/g, levelNumber.toString())
    .replace(/<<LEVEL_TITLE>>/g, levelTitle)
    .replace(/<<SUPER_LEVEL_GROUP>>/g, superLevelGroup)
    .replace(/<<QUESTION_COUNT>>/g, questionCount.toString())
    .replace(/<<CONCEPT_COUNT>>/g, concepts.length.toString())
    .replace(/<<LEVEL_RANGE>>/g, `${levelRange[0]}-${levelRange[1]}`)
    .replace(/<<APPLY_COUNT>>/g, applyCount.toString())
    .replace(/<<ANALYSE_COUNT>>/g, analyseCount.toString())
    .replace(/<<JUDGEMENT_COUNT>>/g, judgementCount.toString())
    .replace(/<<MAX_CONCEPT_FREQUENCY>>/g, maxConceptFrequency.toString())
    .replace(/<<CONCEPTS_LIST>>/g, conceptsList)
    .replace(/<<CONCEPT_ID_MAPPING>>/g, conceptIdMapping)
    .replace(/<<CATEGORY_ID_MAPPING>>/g, categoryIdMapping)
    .replace(/<<REQUIRED_CATEGORIES_LIST>>/g, requiredCategoriesList)
    .replace(/<<LEVEL_CLUSTERS_LIST>>/g, levelClustersList);

  // Append final boss instructions if Level 40
  if (levelNumber === 40) {
    prompt = prompt + finalBossInstructions;
  }

  return prompt;
}

