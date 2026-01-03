/**
 * Analyze Exam Structure Requirements
 * 
 * Checks if existing exams meet structural requirements:
 * - Regular levels: 1+ concept per question, 1+ category per question
 * - Boss levels: 2-3 concepts per question, 2+ categories per question
 */

import { prisma } from "../lib/db";

async function analyzeExamStructure() {
  console.log("🔍 Analyzing exam structure requirements...\n");

  // Get all exams
  const exams = await (prisma as any).exam.findMany({
    where: {
      status: "PUBLISHED",
    },
    select: {
      id: true,
      levelNumber: true,
      questions: true,
      challenge: {
        select: {
          title: true,
          isBoss: true,
        },
      },
    },
    orderBy: {
      levelNumber: "asc",
    },
  });

  if (exams.length === 0) {
    console.log("❌ No published exams found.");
    return;
  }

  console.log(`📊 Analyzing ${exams.length} exams\n`);

  const bossLevels = [10, 20, 30, 40];
  let regularLevelIssues = 0;
  let bossLevelIssues = 0;
  const issues: Array<{
    level: number;
    title: string;
    isBoss: boolean;
    issue: string;
  }> = [];

  for (const exam of exams) {
    const questions = exam.questions as any;
    if (!questions || !questions.questions || !Array.isArray(questions.questions)) {
      continue;
    }

    const questionList = questions.questions;
    const isBoss = exam.challenge?.isBoss || bossLevels.includes(exam.levelNumber || 0);
    const levelTitle = exam.challenge?.title || `Level ${exam.levelNumber || 'N/A'}`;

    // Check each question
    for (let i = 0; i < questionList.length; i++) {
      const q = questionList[i];
      const questionNum = i + 1;

      // Check conceptIds
      const conceptIds = q.conceptIds || [];
      const conceptCount = conceptIds.length;

      // Check categoryIds
      const categoryIds = q.categoryIds || [];
      const categoryCount = categoryIds.length;

      if (isBoss) {
        // Boss level requirements: 2-3 concepts, 2+ categories
        if (conceptCount < 2 || conceptCount > 3) {
          issues.push({
            level: exam.levelNumber || 0,
            title: levelTitle,
            isBoss: true,
            issue: `Q${questionNum}: Has ${conceptCount} concept(s), needs 2-3`,
          });
          bossLevelIssues++;
        }

        if (categoryCount < 2) {
          issues.push({
            level: exam.levelNumber || 0,
            title: levelTitle,
            isBoss: true,
            issue: `Q${questionNum}: Has ${categoryCount} category(ies), needs 2+`,
          });
          bossLevelIssues++;
        }
      } else {
        // Regular level requirements: 1+ concepts, 1+ categories
        if (conceptCount < 1) {
          issues.push({
            level: exam.levelNumber || 0,
            title: levelTitle,
            isBoss: false,
            issue: `Q${questionNum}: Has ${conceptCount} concept(s), needs 1+`,
          });
          regularLevelIssues++;
        }

        if (categoryCount < 1) {
          issues.push({
            level: exam.levelNumber || 0,
            title: levelTitle,
            isBoss: false,
            issue: `Q${questionNum}: Has ${categoryCount} category(ies), needs 1+`,
          });
          regularLevelIssues++;
        }
      }
    }
  }

  // Print results
  console.log("=" .repeat(80));
  console.log("📊 EXAM STRUCTURE ANALYSIS RESULTS");
  console.log("=" .repeat(80));

  const totalIssues = regularLevelIssues + bossLevelIssues;
  const bossExams = exams.filter(
    (e: any) => e.challenge?.isBoss || bossLevels.includes(e.levelNumber || 0)
  );
  const regularExams = exams.filter(
    (e: any) => !e.challenge?.isBoss && !bossLevels.includes(e.levelNumber || 0)
  );

  console.log(`\nTotal Exams: ${exams.length}`);
  console.log(`  Regular Levels: ${regularExams.length}`);
  console.log(`  Boss Levels: ${bossExams.length}`);
  console.log(`\nTotal Issues Found: ${totalIssues}`);
  console.log(`  Regular Level Issues: ${regularLevelIssues}`);
  console.log(`  Boss Level Issues: ${bossLevelIssues}\n`);

  if (totalIssues === 0) {
    console.log("✅ All exams meet structural requirements!\n");
  } else {
    // Group issues by level
    const issuesByLevel = new Map<number, Array<{ issue: string; isBoss: boolean }>>();
    issues.forEach((issue) => {
      if (!issuesByLevel.has(issue.level)) {
        issuesByLevel.set(issue.level, []);
      }
      issuesByLevel.get(issue.level)!.push({ issue: issue.issue, isBoss: issue.isBoss });
    });

    console.log("⚠️  ISSUES FOUND:\n");
    issuesByLevel.forEach((levelIssues, level) => {
      const exam = exams.find((e: any) => e.levelNumber === level);
      const title = exam?.challenge?.title || `Level ${level}`;
      const isBoss = exam?.challenge?.isBoss || bossLevels.includes(level);
      const type = isBoss ? "BOSS" : "REGULAR";

      console.log(`Level ${level} (${type}): ${title}`);
      levelIssues.forEach((item) => {
        console.log(`  - ${item.issue}`);
      });
      console.log();
    });
  }

  // Answer the user's question
  console.log("=" .repeat(80));
  console.log("💡 ANSWER TO YOUR QUESTION");
  console.log("=" .repeat(80));
  console.log(`
Question: Is external question generation required given that shuffling solves bias?

Answer:

✅ REGULAR LEVELS (1-9, 11-19, 21-29, 31-39):
   - Shuffling solves the bias problem ✅
   - If exams meet structural requirements (1+ concepts, 1+ categories), 
     regeneration is NOT required for bias reasons
   - Regeneration is OPTIONAL for:
     * Better answer distribution in source data (for analytics)
     * Quality improvements
     * Performance (pre-generation vs on-demand)

⚠️  BOSS LEVELS (10, 20, 30, 40):
   - Shuffling solves bias ✅
   - BUT boss levels have STRICT structural requirements:
     * 2-3 concepts per question (MANDATORY)
     * 2+ categories per question (MANDATORY)
   - If current boss exams don't meet these requirements, 
     they MUST be regenerated for structural reasons
   - This is NOT about bias - it's about meeting boss exam standards

Current Status:
${totalIssues === 0 ? "✅ All exams meet requirements - regeneration NOT required for structural reasons" : `⚠️  ${totalIssues} structural issues found - may need regeneration`}
`);

  // Check if boss levels specifically have issues
  const bossIssuesOnly = issues.filter((i) => i.isBoss);
  if (bossIssuesOnly.length > 0) {
    console.log(`
🚨 BOSS LEVELS NEED ATTENTION:
   - ${bossIssuesOnly.length} structural issues found
   - Boss levels MUST have 2-3 concepts and 2+ categories per question
   - These need to be fixed regardless of shuffling
`);
  } else if (bossExams.length > 0) {
    console.log(`
✅ BOSS LEVELS ARE COMPLIANT:
   - All boss levels meet structural requirements
   - Shuffling solves bias problem
   - Regeneration NOT required
`);
  }

  process.exit(0);
}

analyzeExamStructure().catch((error) => {
  console.error("❌ Error analyzing exam structure:", error);
  process.exit(1);
});

