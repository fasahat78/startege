import { prisma } from "../lib/db";

async function checkPreGeneratedExams() {
  console.log("🔍 Checking pre-generated exams for all 40 levels...\n");

  try {
    // Get all exams
    const exams = await (prisma as any).exam.findMany({
      where: {
        type: "LEVEL",
        levelNumber: { not: null },
      },
      select: {
        id: true,
        levelNumber: true,
        type: true,
        status: true,
        questions: true,
      },
      orderBy: {
        levelNumber: "asc",
      },
    });

    console.log(`Found ${exams.length} pre-generated level exams\n`);

    // Create a map of level numbers
    const examMap = new Map<number, any>();
    exams.forEach((exam: any) => {
      examMap.set(exam.levelNumber, exam);
    });

    // Check all 40 levels
    const allLevels = Array.from({ length: 40 }, (_, i) => i + 1);
    const missingLevels: number[] = [];
    const levelsWithExams: number[] = [];
    const levelsWithEmptyExams: number[] = [];

    for (const level of allLevels) {
      const exam = examMap.get(level);
      if (!exam) {
        missingLevels.push(level);
      } else {
        levelsWithExams.push(level);
        // Check if exam has questions
        // questions is stored as JSON, so it might be a string or object
        let questions: any[] = [];
        if (exam.questions) {
          if (typeof exam.questions === 'string') {
            try {
              questions = JSON.parse(exam.questions);
            } catch (e) {
              // Not valid JSON string
            }
          } else if (Array.isArray(exam.questions)) {
            questions = exam.questions;
          } else if (typeof exam.questions === 'object') {
            // Might be an object with a questions array property
            questions = (exam.questions as any).questions || [];
          }
        }
        if (!questions || questions.length === 0) {
          levelsWithEmptyExams.push(level);
        }
      }
    }

    // Print results
    console.log("📊 Summary:");
    console.log(`  ✅ Levels with exams: ${levelsWithExams.length}/40`);
    console.log(`  ❌ Missing exams: ${missingLevels.length}`);
    console.log(`  ⚠️  Empty exams: ${levelsWithEmptyExams.length}\n`);

    if (missingLevels.length > 0) {
      console.log("❌ Missing Exams:");
      missingLevels.forEach((level) => {
        console.log(`   Level ${level}`);
      });
      console.log("");
    }

    if (levelsWithEmptyExams.length > 0) {
      console.log("⚠️  Empty Exams (no questions):");
      levelsWithEmptyExams.forEach((level) => {
        console.log(`   Level ${level}`);
      });
      console.log("");
    }

    if (levelsWithExams.length > 0) {
      console.log("✅ Levels with exams:");
      levelsWithExams.forEach((level) => {
        const exam = examMap.get(level);
        let questions: any[] = [];
        if (exam.questions) {
          if (typeof exam.questions === 'string') {
            try {
              questions = JSON.parse(exam.questions);
            } catch (e) {
              // Not valid JSON string
            }
          } else if (Array.isArray(exam.questions)) {
            questions = exam.questions;
          } else if (typeof exam.questions === 'object') {
            questions = (exam.questions as any).questions || [];
          }
        }
        const questionCount = Array.isArray(questions) ? questions.length : 0;
        console.log(`   Level ${level}: ${questionCount} questions`);
      });
      console.log("");
    }

    // Detailed breakdown by level
    console.log("📋 Detailed Breakdown:");
    for (const level of allLevels) {
      const exam = examMap.get(level);
      if (exam) {
        let questions: any[] = [];
        if (exam.questions) {
          if (typeof exam.questions === 'string') {
            try {
              questions = JSON.parse(exam.questions);
            } catch (e) {
              // Not valid JSON string
            }
          } else if (Array.isArray(exam.questions)) {
            questions = exam.questions;
          } else if (typeof exam.questions === 'object') {
            questions = (exam.questions as any).questions || [];
          }
        }
        const questionCount = Array.isArray(questions) ? questions.length : 0;
        const status = exam.status;
        const isBoss = level === 10 || level === 20 || level === 30 || level === 40;
        const badge = isBoss ? "👑" : "  ";
        console.log(
          `${badge} Level ${level.toString().padStart(2, " ")}: ${questionCount.toString().padStart(2, " ")} questions | Status: ${status}`
        );
      } else {
        console.log(`   Level ${level.toString().padStart(2, " ")}: ❌ MISSING`);
      }
    }

    console.log("\n✅ Check complete!");
  } catch (error) {
    console.error("❌ Error checking exams:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

checkPreGeneratedExams();

