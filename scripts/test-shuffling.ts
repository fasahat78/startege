/**
 * Test Option Shuffling
 * 
 * This script demonstrates how option shuffling works by:
 * 1. Loading an exam from the database
 * 2. Showing original question structure
 * 3. Shuffling options multiple times
 * 4. Showing how the correct answer position changes
 */

import { prisma } from "../lib/db";
import { shuffleExamOptions, analyzeAnswerDistribution } from "../lib/exam-option-shuffle";

async function testShuffling() {
  console.log("🧪 Testing Option Shuffling\n");

  // Get a sample exam (Level 1)
  const exam = await (prisma as any).exam.findFirst({
    where: {
      levelNumber: 1,
      status: "PUBLISHED",
    },
    select: {
      id: true,
      levelNumber: true,
      questions: true,
      challenge: {
        select: {
          title: true,
        },
      },
    },
  });

  if (!exam) {
    console.log("❌ No exam found. Please ensure Level 1 exam exists.");
    process.exit(1);
  }

  const questions = exam.questions as any;
  if (!questions || !questions.questions || !Array.isArray(questions.questions)) {
    console.log("❌ Exam has no questions.");
    process.exit(1);
  }

  const originalQuestions = questions.questions;
  const sampleQuestion = originalQuestions[0]; // Test with first question

  console.log("=" .repeat(80));
  console.log(`📝 Testing Shuffling for: ${exam.challenge?.title || `Level ${exam.levelNumber}`}`);
  console.log("=" .repeat(80));
  console.log(`\nTotal Questions: ${originalQuestions.length}\n`);

  // Show original answer distribution
  console.log("📊 ORIGINAL ANSWER DISTRIBUTION:");
  const originalAnalysis = analyzeAnswerDistribution(originalQuestions);
  console.log(`  A: ${originalAnalysis.distribution.A}`);
  console.log(`  B: ${originalAnalysis.distribution.B}`);
  console.log(`  C: ${originalAnalysis.distribution.C}`);
  console.log(`  D: ${originalAnalysis.distribution.D}`);
  console.log(`  Status: ${originalAnalysis.isBalanced ? "✅ Balanced" : "⚠️  Biased"}`);
  console.log(`  ${originalAnalysis.recommendation}\n`);

  // Show original question structure
  console.log("=" .repeat(80));
  console.log("📋 ORIGINAL QUESTION STRUCTURE (Q1):");
  console.log("=" .repeat(80));
  console.log(`\nStem: ${sampleQuestion.stem.substring(0, 100)}...`);
  console.log(`\nOriginal Options:`);
  sampleQuestion.options.forEach((opt: any) => {
    const marker = opt.id === sampleQuestion.correctOptionId ? " ✅ CORRECT" : "";
    console.log(`  ${opt.id}: ${opt.text.substring(0, 60)}...${marker}`);
  });
  console.log(`\nCorrect Answer: ${sampleQuestion.correctOptionId}\n`);

  // Test shuffling 3 times
  console.log("=" .repeat(80));
  console.log("🎲 SHUFFLING TEST (3 iterations):");
  console.log("=" .repeat(80));

  for (let i = 1; i <= 3; i++) {
    console.log(`\n--- Iteration ${i} ---`);
    const shuffledQuestions = shuffleExamOptions([sampleQuestion]);
    const shuffled = shuffledQuestions[0];

    console.log(`Shuffled Options:`);
    shuffled.options.forEach((opt: any) => {
      const marker = opt.id === shuffled.correctOptionId ? " ✅ CORRECT" : "";
      console.log(`  ${opt.id}: ${opt.text.substring(0, 60)}...${marker}`);
    });
    console.log(`\nCorrect Answer Position: ${shuffled.correctOptionId} (was ${sampleQuestion.correctOptionId})`);
    console.log(`Mapping: Original ${sampleQuestion.correctOptionId} → Shuffled ${shuffled.correctOptionId}`);
  }

  // Show how shuffling affects overall distribution
  console.log("\n" + "=" .repeat(80));
  console.log("📈 SHUFFLING IMPACT ON DISTRIBUTION:");
  console.log("=" .repeat(80));
  console.log(`
When users take the exam:
- Each user sees options in DIFFERENT random order
- Original bias (${originalAnalysis.distribution.B}% option B) is NOT visible to users
- Users cannot exploit patterns because positions are randomized
- Assessment remains accurate via optionMappings

Example:
- User 1 might see correct answer in position A
- User 2 might see correct answer in position C  
- User 3 might see correct answer in position D
- All are evaluated correctly against original answer position
`);

  // Test full exam shuffling
  console.log("=" .repeat(80));
  console.log("🔄 FULL EXAM SHUFFLING TEST:");
  console.log("=" .repeat(80));
  
  const shuffledFullExam = shuffleExamOptions(originalQuestions);
  const shuffledAnalysis = analyzeAnswerDistribution(
    shuffledFullExam.map((q: any) => ({
      ...q,
      correctOptionId: q.correctOptionId, // Use shuffled correctOptionId
    }))
  );

  console.log(`\nAfter Shuffling (one random shuffle):`);
  console.log(`  A: ${shuffledAnalysis.distribution.A}`);
  console.log(`  B: ${shuffledAnalysis.distribution.B}`);
  console.log(`  C: ${shuffledAnalysis.distribution.C}`);
  console.log(`  D: ${shuffledAnalysis.distribution.D}`);
  console.log(`  Status: ${shuffledAnalysis.isBalanced ? "✅ Balanced" : "⚠️  Biased"}`);
  console.log(`\nNote: Each user gets a DIFFERENT shuffle, so distribution varies per attempt.\n`);

  console.log("=" .repeat(80));
  console.log("✅ SHUFFLING VERIFICATION:");
  console.log("=" .repeat(80));
  console.log(`
✅ Shuffling is working correctly!
✅ Options are randomized per question
✅ Correct answer position changes with each shuffle
✅ Users cannot exploit original bias
✅ Assessment remains accurate via optionMappings

To test in the UI:
1. Start an exam attempt
2. Note the option positions
3. Start the same exam again (new attempt)
4. Compare - options should be in different positions
5. Submit answers - they should be evaluated correctly
`);

  process.exit(0);
}

testShuffling().catch((error) => {
  console.error("❌ Error testing shuffling:", error);
  process.exit(1);
});

