# System Prompts Configuration - Summary

## ✅ Completed

All ChatGPT/OpenAI system prompts have been extracted to configurable Markdown files.

## System Prompts Found

### 1. **Base Exam Prompt** (`base/exam-base.md`)
- **Purpose**: Foundational prompt for all exam generation
- **Used by**: All exam types (level, category, boss)
- **Location in code**: `lib/exam-prompts.ts` → `EXAM_BASE_PROMPT`
- **Status**: ✅ Configurable

### 2. **Level Exam Templates** (`level/`)
- **`level-exam-template.md`**: General template for level exams
- **`coverage-first-template.md`**: Specific template for coverage-first exams (levels 1-9)
- **Used by**: Level exam generation
- **Location in code**: `lib/level-exam-prompt.ts` → `generateCoverageFirstLevelExamPrompt()`
- **Status**: ✅ Templates extracted (dynamic building remains in code)

### 3. **Category Exam Template** (`category/category-exam-template.md`)
- **Purpose**: Template for category-specific exams
- **Used by**: Category exam generation
- **Location in code**: `lib/exam-prompts.ts` → `CATEGORY_EXAM_PROMPT_TEMPLATE`
- **Status**: ✅ Configurable

### 4. **Exam Analysis Prompt** (`analysis/exam-analysis.md`)
- **Purpose**: Analyze exam attempts and provide feedback
- **Used by**: Post-exam analysis
- **Location in code**: `lib/exam-analysis.ts` → `analyzeExamAttempt()`
- **Status**: ✅ Configurable

## File Structure

```
system-prompts/
├── base/
│   └── exam-base.md              # Base prompt (loaded automatically)
├── level/
│   ├── level-exam-template.md    # Level exam template
│   └── coverage-first-template.md # Coverage-first template
├── category/
│   └── category-exam-template.md  # Category exam template
├── analysis/
│   └── exam-analysis.md          # Exam analysis prompt (loaded automatically)
├── README.md                     # Usage documentation
├── MIGRATION_GUIDE.md           # Migration details
└── SUMMARY.md                   # This file
```

## How It Works

1. **Prompt Loading**: `lib/prompt-loader.ts` loads prompts from Markdown files
2. **Fallback**: If files are missing, code falls back to hardcoded prompts
3. **Runtime**: Prompts are loaded at module initialization (no restart needed for changes)
4. **Dynamic Building**: Level prompts are built dynamically using templates + runtime data

## Usage

### Editing Prompts

Simply edit the `.md` files in `system-prompts/`:
- Changes take effect immediately (no restart needed)
- Version control friendly (track changes in git)
- Easy to read and document

### Example: Editing Base Prompt

1. Open `system-prompts/base/exam-base.md`
2. Make your changes
3. Save the file
4. Next exam generation will use the new prompt

## Code Changes

### Updated Files:
- ✅ `lib/exam-prompts.ts` - Now loads base prompt from file
- ✅ `lib/exam-analysis.ts` - Now loads analysis prompt from file
- ✅ `lib/prompt-loader.ts` - New utility for loading prompts

### No Changes Needed:
- `lib/level-exam-prompt.ts` - Still builds prompts dynamically (uses base prompt from file)
- `lib/chatgpt.ts` - Receives prompts as parameters (no changes needed)

## Testing

After editing prompts:
1. Generate a test exam to verify the prompt works
2. Check console for any loading errors
3. Verify JSON output format is correct

## Notes

- Prompts are loaded synchronously at module initialization
- File system errors will throw exceptions (ensure `system-prompts/` exists)
- Prompts are not validated - ensure they follow expected format
- Consider adding prompt caching for performance in production

