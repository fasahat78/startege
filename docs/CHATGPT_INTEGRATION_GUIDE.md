# ChatGPT Integration Guide

## Overview

This guide documents the ChatGPT API integration for dynamic exam generation. Exams are generated at runtime when a user starts an exam attempt.

## Architecture

### Components

1. **ChatGPT Service** (`lib/chatgpt.ts`)
   - Handles OpenAI API communication
   - Generates exam questions from prompts
   - Validates JSON response structure

2. **Exam Prompts** (`lib/exam-prompts.ts`)
   - Global base prompt (EXAM_BASE_PROMPT)
   - Category exam prompt template
   - Level exam prompt template
   - Prompt composition functions

3. **Exam Start API** (`/api/exams/[examId]/start`)
   - Checks if exam already generated
   - Fetches concepts for level/category
   - Composes prompt
   - Calls ChatGPT API
   - Stores generated questions
   - Returns questions to client

## Environment Variables

Add to `.env`:

```bash
OPENAI_API_KEY=sk-... # or CHATGPT_API_KEY
```

The service checks both `OPENAI_API_KEY` and `CHATGPT_API_KEY` environment variables.

## Exam Generation Flow

```
1. User starts exam
   → POST /api/exams/[examId]/start

2. Check if exam already generated
   → If yes: Return existing questions
   → If no: Generate new exam

3. Fetch concepts
   → Category exam: Get concepts from Category
   → Level exam: Get concepts from Challenge.concepts

4. Compose prompt
   → EXAM_BASE_PROMPT
   + Category/Level-specific prompt
   + Concepts list
   + Exam parameters (difficulty, questionCount)

5. Call ChatGPT API
   → generateExamQuestions()
   → Returns JSON with questions

6. Store in Exam model
   → questions: JSON payload
   → systemPromptSnapshot: Full prompt used
   → generationConfig: Parameters
   → status: ACTIVE

7. Return questions to client
   → Without correctOptionId or rationale
```

## ChatGPT API Configuration

### Model
- **Model**: `gpt-4o` (GPT-4 Optimized)
- **Temperature**: 0.7 (balance creativity/consistency)
- **Response Format**: JSON object (enforced)

### Prompt Structure

```
SYSTEM PROMPT:
- EXAM_BASE_PROMPT (global rules)
- Category/Level-specific instructions
- Concepts in scope
- Exam parameters

USER PROMPT:
- Request for N questions
- JSON schema specification
- Output format requirements
```

## Response Format

ChatGPT returns JSON matching this schema:

```json
{
  "questions": [
    {
      "id": "Q1",
      "stem": "Question text here",
      "options": [
        { "id": "A", "text": "Option A text" },
        { "id": "B", "text": "Option B text" },
        { "id": "C", "text": "Option C text" },
        { "id": "D", "text": "Option D text" }
      ],
      "correctOptionId": "B",
      "rationale": {
        "correct": "Why this option is correct",
        "incorrect": {
          "A": "Why option A is incorrect",
          "C": "Why option C is incorrect",
          "D": "Why option D is incorrect"
        }
      }
    }
  ]
}
```

## Validation

The service validates:
- ✅ Response is valid JSON
- ✅ Contains `questions` array
- ✅ Each question has required fields
- ✅ Exactly 4 options per question
- ✅ `correctOptionId` matches an option ID
- ✅ Question count matches request

## Error Handling

### API Key Missing
```json
{
  "error": "OpenAI API key not found in environment variables"
}
```

### API Error
```json
{
  "error": "Failed to generate exam questions: [error message]"
}
```

### Invalid Response
- Attempts to extract JSON from markdown code blocks
- Validates structure
- Throws descriptive errors

## Caching Strategy

- **First attempt**: Generate exam, store in `Exam.questions`
- **Subsequent attempts**: Return stored questions
- **Regeneration**: Not currently supported (would require new Exam record)

## Cost Considerations

- **Model**: GPT-4o (cost-effective for structured output)
- **Tokens**: ~2000-3000 tokens per exam generation
- **Caching**: Questions stored after first generation (no re-generation)

## Testing

### Test Connection
```typescript
import { testChatGPTConnection } from "@/lib/chatgpt";

const connected = await testChatGPTConnection();
console.log("ChatGPT connected:", connected);
```

### Generate Test Exam
```typescript
import { generateExamQuestions } from "@/lib/chatgpt";

const exam = await generateExamQuestions({
  systemPrompt: EXAM_BASE_PROMPT + "...",
  questionCount: 10,
  difficulty: "beginner",
});
```

## Next Steps

1. ✅ ChatGPT service implemented
2. ✅ Exam generation integrated
3. ⏭️ Test with Level 1 exam
4. ⏭️ Monitor API costs
5. ⏭️ Add retry logic for API failures
6. ⏭️ Add rate limiting
7. ⏭️ Add exam regeneration option

## Troubleshooting

### "No response content from ChatGPT"
- Check API key is set correctly
- Verify API quota/credits
- Check network connectivity

### "Failed to parse JSON response"
- ChatGPT may have returned markdown-wrapped JSON
- Service attempts to extract JSON from code blocks
- Check logs for raw response

### "Invalid question structure"
- Response doesn't match expected schema
- Check prompt clarity
- Verify model is gpt-4o (better JSON output)

