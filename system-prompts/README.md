# System Prompts Directory

This directory contains all configurable system prompts used by ChatGPT/OpenAI API for exam generation and analysis.

## Structure

```
system-prompts/
├── base/
│   └── exam-base.md              # Foundational prompt for all exams
├── level/
│   ├── level-exam-template.md    # Template for level exams
│   └── coverage-first-template.md # Coverage-first template for levels 1-9
├── category/
│   └── category-exam-template.md  # Template for category exams
├── analysis/
│   └── exam-analysis.md          # Prompt for exam attempt analysis
└── README.md                     # This file
```

## Usage

### Editing Prompts

1. **Base Exam Prompt** (`base/exam-base.md`)
   - Foundational prompt inherited by all exams
   - Defines core rules for MCQ generation
   - **DO NOT** modify unless changing core exam generation rules

2. **Level Exam Templates** (`level/`)
   - `level-exam-template.md`: General template for level exams
   - `coverage-first-template.md`: Specific template for coverage-first exams (levels 1-9)
   - Use placeholders `<<LEVEL_NUMBER>>`, `<<LEVEL_TITLE>>`, etc.

3. **Category Exam Template** (`category/category-exam-template.md`)
   - Template for category-specific exams
   - Use placeholders `<<CATEGORY_NAME>>`, `<<DOMAIN_NAME>>`, etc.

4. **Exam Analysis Prompt** (`analysis/exam-analysis.md`)
   - Prompt for analyzing exam attempts
   - Provides feedback and recommendations

### Placeholders

Templates use placeholders in the format `<<PLACEHOLDER_NAME>>` that are replaced at runtime:

- `<<LEVEL_NUMBER>>` - Level number (1-40)
- `<<LEVEL_TITLE>>` - Level title
- `<<SUPER_LEVEL_GROUP>>` - Super level group (FOUNDATION, BUILDING, ADVANCED, MASTERY)
- `<<IS_BOSS_LEVEL>>` - Whether this is a boss level (true/false)
- `<<CATEGORY_NAME>>` - Category name
- `<<DOMAIN_NAME>>` - Domain name
- `<<CONCEPTS_LIST>>` - List of concepts in scope
- `<<QUESTION_COUNT>>` - Number of questions to generate
- And more...

### Loading Prompts in Code

Use the `prompt-loader.ts` utility:

```typescript
import { loadBaseExamPrompt, loadLevelExamTemplate, replaceTemplatePlaceholders } from "@/lib/prompt-loader";

// Load base prompt
const basePrompt = loadBaseExamPrompt();

// Load and fill template
const template = loadLevelExamTemplate();
const filledPrompt = replaceTemplatePlaceholders(template, {
  LEVEL_NUMBER: "5",
  LEVEL_TITLE: "Introduction to AI Governance",
  // ... other placeholders
});
```

## Best Practices

1. **Version Control**: Always commit prompt changes to git
2. **Testing**: Test prompt changes with a sample exam generation
3. **Documentation**: Document any significant changes in commit messages
4. **Backup**: Keep backups of working prompts before major changes
5. **Validation**: Ensure prompts follow the expected JSON output format

## Current Prompts

### Base Exam Prompt
- **Purpose**: Foundational rules for all exam generation
- **Last Updated**: [Date]
- **Key Rules**: MCQ format, 4 options, JSON output, governance framing

### Level Exam Templates
- **Purpose**: Generate level-specific exams
- **Coverage-First**: Ensures every concept is tested at least once
- **Boss Levels**: Special handling for levels 10, 20, 30, 40

### Category Exam Template
- **Purpose**: Generate category-specific exams
- **Focus**: Single category mastery assessment

### Exam Analysis Prompt
- **Purpose**: Analyze exam attempts and provide feedback
- **Output**: JSON with strengths, weaknesses, recommendations, study plan

## Notes

- Prompts are loaded at runtime, so changes take effect immediately
- No server restart required for prompt updates
- Prompts are cached in memory for performance
- File system errors will throw exceptions - ensure prompts directory exists

