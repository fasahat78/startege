/**
 * System Prompt Loader
 * 
 * Loads system prompts from the system-prompts folder.
 * Allows prompts to be edited without code changes.
 */

import fs from "fs";
import path from "path";

const PROMPTS_DIR = path.join(process.cwd(), "system-prompts");

export interface PromptConfig {
  base: string;
  level: {
    template: string;
    coverageFirst: string;
  };
  category: {
    template: string;
  };
  boss: {
    template: string;
  };
  analysis: {
    examAnalysis: string;
  };
}

/**
 * Load a prompt file from the system-prompts directory
 */
function loadPromptFile(relativePath: string): string {
  const fullPath = path.join(PROMPTS_DIR, relativePath);
  
  try {
    return fs.readFileSync(fullPath, "utf-8");
  } catch (error) {
    console.error(`Failed to load prompt file: ${fullPath}`, error);
    throw new Error(`Prompt file not found: ${relativePath}`);
  }
}

/**
 * Load all system prompts
 */
export function loadAllPrompts(): PromptConfig {
  return {
    base: loadPromptFile("base/exam-base.md"),
    level: {
      template: loadPromptFile("level/level-exam-template.md"),
      coverageFirst: loadPromptFile("level/coverage-first-template.md"),
    },
    category: {
      template: loadPromptFile("category/category-exam-template.md"),
    },
    boss: {
      template: loadPromptFile("boss/boss-exam-template.md"),
    },
    analysis: {
      examAnalysis: loadPromptFile("analysis/exam-analysis.md"),
    },
  };
}

/**
 * Load base exam prompt
 */
export function loadBaseExamPrompt(): string {
  return loadPromptFile("base/exam-base.md");
}

/**
 * Load level exam template
 */
export function loadLevelExamTemplate(): string {
  return loadPromptFile("level/level-exam-template.md");
}

/**
 * Load coverage-first level exam template
 */
export function loadCoverageFirstTemplate(): string {
  return loadPromptFile("level/coverage-first-template.md");
}

/**
 * Load category exam template
 */
export function loadCategoryExamTemplate(): string {
  return loadPromptFile("category/category-exam-template.md");
}

/**
 * Load exam analysis prompt
 */
export function loadExamAnalysisPrompt(): string {
  return loadPromptFile("analysis/exam-analysis.md");
}

/**
 * Load boss exam template
 */
export function loadBossExamTemplate(): string {
  return loadPromptFile("boss/boss-exam-template.md");
}

/**
 * Replace placeholders in a template string
 */
export function replaceTemplatePlaceholders(
  template: string,
  placeholders: Record<string, string>
): string {
  let result = template;
  
  for (const [key, value] of Object.entries(placeholders)) {
    const regex = new RegExp(`<<${key}>>`, "g");
    result = result.replace(regex, value);
  }
  
  return result;
}

