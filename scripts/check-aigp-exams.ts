import { prisma } from '../lib/db';

async function checkAIGPExams() {
  console.log('🔍 Checking AIGP Exams in database...\n');

  try {
    // Check if table exists
    const examCount = await prisma.aIGPExam.count();
    console.log(`✅ AIGPExam table exists`);
    console.log(`📊 Total exams in database: ${examCount}\n`);

    if (examCount === 0) {
      console.log('⚠️  No exams found in database!');
      console.log('💡 Run: tsx scripts/ingest-aigp-exams.ts\n');
      return;
    }

    // Get all exams with their status
    const allExams = await prisma.aIGPExam.findMany({
      select: {
        id: true,
        examId: true,
        title: true,
        status: true,
        isActive: true,
        totalQuestions: true,
      },
      orderBy: { examId: 'asc' },
    });

    console.log('📋 Exam Details:');
    allExams.forEach((exam) => {
      const status = exam.status === 'PUBLISHED' ? '✅' : '❌';
      const active = exam.isActive ? '✅' : '❌';
      console.log(`  ${status} ${active} ${exam.examId}: ${exam.title}`);
      console.log(`     Status: ${exam.status}, Active: ${exam.isActive}, Questions: ${exam.totalQuestions}`);
    });

    // Check published and active exams
    const publishedActiveExams = await prisma.aIGPExam.findMany({
      where: {
        isActive: true,
        status: 'PUBLISHED',
      },
      select: {
        examId: true,
        title: true,
      },
    });

    console.log(`\n✅ Published & Active Exams: ${publishedActiveExams.length}`);
    if (publishedActiveExams.length === 0) {
      console.log('⚠️  No exams are published and active!');
      console.log('💡 This is why exams are not showing on the page.');
      console.log('💡 Run: tsx scripts/ingest-aigp-exams.ts to fix\n');
    } else {
      publishedActiveExams.forEach((exam) => {
        console.log(`   - ${exam.examId}: ${exam.title}`);
      });
    }

    // Check questions
    const questionCount = await prisma.aIGPQuestion.count();
    console.log(`\n📝 Total questions in database: ${questionCount}`);

    if (questionCount === 0) {
      console.log('⚠️  No questions found!');
      console.log('💡 Run: tsx scripts/ingest-aigp-exams.ts to import questions\n');
    } else {
      // Check questions per exam
      const questionsPerExam = await prisma.aIGPQuestion.groupBy({
        by: ['examId'],
        _count: true,
      });
      console.log('\n📊 Questions per exam:');
      questionsPerExam.forEach(({ examId, _count }) => {
        const exam = allExams.find((e) => e.id === examId);
        console.log(`   ${exam?.examId || examId}: ${_count} questions`);
      });
    }
  } catch (error: any) {
    if (error.code === 'P2021' || error.message?.includes('does not exist')) {
      console.log('❌ AIGPExam table does not exist!');
      console.log('💡 Run database migrations first, then: tsx scripts/ingest-aigp-exams.ts\n');
    } else {
      console.error('❌ Error checking exams:', error);
      throw error;
    }
  } finally {
    await prisma.$disconnect();
  }
}

checkAIGPExams()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

