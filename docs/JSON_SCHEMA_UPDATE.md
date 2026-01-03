# JSON Schema Update for System Prompts

## Overview

Added formal JSON Schema specifications to all exam generation system prompts to ensure consistent, parseable responses from ChatGPT.

## Changes Made

### 1. Base Exam Prompt (`system-prompts/base/exam-base.md`)

Added complete JSON Schema specification with:
- Type definitions for all fields
- Required field constraints
- Enum constraints for option IDs ("A", "B", "C", "D")
- Pattern validation for question IDs (`Q1`, `Q2`, etc.)
- Minimum length constraints for text fields
- Example valid output

### 2. Coverage-First Template (`system-prompts/level/coverage-first-template.md`)

Added JSON Schema with additional fields:
- `conceptIds` array (exactly one ConceptCard database ID)
- `categoryIds` array (at least one category database ID)
- `difficultyTag` enum (recall, understand, apply, analyze, evaluate)
- Pattern validation for database IDs (`cmj[a-z0-9]+`)

### 3. Level Exam Template (`system-prompts/level/level-exam-template.md`)

Updated to reference the base prompt JSON Schema and emphasize strict adherence.

### 4. Category Exam Template (`system-prompts/category/category-exam-template.md`)

Updated to reference the base prompt JSON Schema and emphasize strict adherence.

## Benefits

1. **Reduced Parsing Errors**: Formal schema reduces ambiguity
2. **Consistent Structure**: ChatGPT knows exactly what format to return
3. **Validation**: Schema includes constraints (minLength, enum, pattern)
4. **Documentation**: Schema serves as documentation for expected format

## Technical Notes

- OpenAI API uses `response_format: { type: "json_object" }` which forces JSON output
- JSON Schema is included in the prompt text (OpenAI doesn't support JSON Schema directly in API)
- The schema uses JSON Schema Draft 7 format for maximum compatibility
- All required fields are explicitly marked
- Additional properties are disallowed to prevent unexpected fields

## Schema Structure

### Base Exam Format
```json
{
  "questions": [
    {
      "id": "Q1",
      "stem": "...",
      "options": [
        { "id": "A", "text": "..." },
        { "id": "B", "text": "..." },
        { "id": "C", "text": "..." },
        { "id": "D", "text": "..." }
      ],
      "correctOptionId": "B",
      "rationale": {
        "correct": "...",
        "incorrect": {
          "A": "...",
          "C": "...",
          "D": "..."
        }
      }
    }
  ]
}
```

### Coverage-First Format (Additional Fields)
```json
{
  "questions": [
    {
      "id": "Q1",
      "stem": "...",
      "options": [...],
      "correctOptionId": "B",
      "conceptIds": ["cmj..."],
      "categoryIds": ["cmj..."],
      "difficultyTag": "apply",
      "rationale": {...}
    }
  ]
}
```

## Testing

After this update, ChatGPT responses should:
- Always return valid JSON
- Match the exact schema structure
- Include all required fields
- Use correct data types and formats
- Be parseable without errors

