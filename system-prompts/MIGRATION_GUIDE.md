# Migration Guide: System Prompts to Configurable Files

## Overview

System prompts have been moved from hardcoded strings in TypeScript files to configurable Markdown files in the `system-prompts/` directory.

## What Changed

### Before
- Prompts were hardcoded in TypeScript files:
  - `lib/exam-prompts.ts` - Base exam prompt
  - `lib/exam-analysis.ts` - Exam analysis prompt
  - `lib/level-exam-prompt.ts` - Level exam prompts

### After
- Prompts are now in Markdown files:
  - `system-prompts/base/exam-base.md` - Base exam prompt
  - `system-prompts/level/level-exam-template.md` - Level exam template
  - `system-prompts/level/coverage-first-template.md` - Coverage-first template
  - `system-prompts/category/category-exam-template.md` - Category exam template
  - `system-prompts/analysis/exam-analysis.md` - Exam analysis prompt

## Benefits

1. **Easy Editing**: Edit prompts without touching code
2. **Version Control**: Track prompt changes in git
3. **No Restart Required**: Changes take effect immediately (prompts loaded at runtime)
4. **Better Organization**: All prompts in one place
5. **Documentation**: Markdown format is easier to read and document

## Current Status

### ✅ Completed
- Created `system-prompts/` directory structure
- Extracted all prompts to Markdown files
- Created `lib/prompt-loader.ts` utility
- Updated `lib/exam-prompts.ts` to load from file
- Updated `lib/exam-analysis.ts` to load from file
- Added fallback to hardcoded prompts if files not found

### ⚠️ Partial Migration
- `lib/level-exam-prompt.ts` - Still uses hardcoded prompt building logic
  - The `generateCoverageFirstLevelExamPrompt()` function builds prompts dynamically
  - This is intentional - it combines the base prompt with dynamic content
  - The base prompt is now loaded from file, but the dynamic parts remain in code

### 🔄 Future Improvements
- Consider extracting more dynamic prompt building logic
- Add prompt validation
- Add prompt versioning
- Create admin UI for editing prompts

## How to Edit Prompts

1. Navigate to `system-prompts/` directory
2. Edit the relevant `.md` file
3. Save changes
4. Changes take effect immediately (no restart needed)

## File Structure

```
system-prompts/
├── base/
│   └── exam-base.md              # Base prompt (loaded by exam-prompts.ts)
├── level/
│   ├── level-exam-template.md    # Level exam template
│   └── coverage-first-template.md # Coverage-first template
├── category/
│   └── category-exam-template.md  # Category exam template
├── analysis/
│   └── exam-analysis.md          # Analysis prompt (loaded by exam-analysis.ts)
├── README.md                     # Documentation
└── MIGRATION_GUIDE.md           # This file
```

## Testing

After editing prompts:

1. Generate a test exam to verify the prompt works
2. Check console for any loading errors
3. Verify JSON output format is correct
4. Test with different exam types (level, category, boss)

## Rollback

If you need to rollback to hardcoded prompts:

1. The code includes fallback logic - if files are missing, it uses hardcoded prompts
2. To disable file loading, comment out the import/load calls in:
   - `lib/exam-prompts.ts`
   - `lib/exam-analysis.ts`

## Notes

- Prompts are loaded synchronously at module initialization
- File system errors will throw exceptions
- Ensure `system-prompts/` directory exists in production
- Consider adding prompt caching for performance
- Prompts are not validated - ensure they follow expected format

