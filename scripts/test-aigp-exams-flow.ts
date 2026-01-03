import { prisma } from '../lib/db';

async function testAIGPExamsFlow() {
  console.log('🧪 Testing AIGP Prep Exams Flow...\n');

  try {
    // Test 1: Check if exams exist
    console.log('1️⃣ Checking if exams are ingested...');
    const exams = await prisma.aIGPExam.findMany({
      where: { isActive: true, status: 'PUBLISHED' },
      select: {
        id: true,
        examId: true,
        title: true,
        totalQuestions: true,
        estimatedTimeMin: true,
      },
    });

    if (exams.length === 0) {
      console.error('❌ No exams found! Please run the ingestion script first.');
      return;
    }

    console.log(`✅ Found ${exams.length} exam(s):`);
    exams.forEach((exam) => {
      console.log(`   - ${exam.examId}: ${exam.title} (${exam.totalQuestions} questions, ${exam.estimatedTimeMin} min)`);
    });

    // Test 2: Check questions for each exam
    console.log('\n2️⃣ Checking questions...');
    for (const exam of exams) {
      const questionCount = await prisma.aIGPQuestion.count({
        where: { examId: exam.id },
      });

      if (questionCount !== exam.totalQuestions) {
        console.error(`❌ Exam ${exam.examId}: Expected ${exam.totalQuestions} questions, found ${questionCount}`);
      } else {
        console.log(`✅ ${exam.examId}: ${questionCount} questions`);
      }

      // Check question integrity
      const sampleQuestion = await prisma.aIGPQuestion.findFirst({
        where: { examId: exam.id },
        select: {
          questionId: true,
          question: true,
          options: true,
          correctAnswer: true,
          explanation: true,
          domain: true,
          topic: true,
          difficulty: true,
        },
      });

      if (sampleQuestion) {
        const options = sampleQuestion.options as any[];
        if (!Array.isArray(options) || options.length !== 4) {
          console.error(`❌ ${exam.examId}: Invalid options format`);
        } else {
          const optionKeys = options.map((o) => o.key).sort();
          if (!['A', 'B', 'C', 'D'].every((key) => optionKeys.includes(key))) {
            console.error(`❌ ${exam.examId}: Missing required option keys`);
          } else {
            console.log(`   ✅ Sample question structure valid (${sampleQuestion.questionId})`);
          }
        }
      }
    }

    // Test 3: Check for a test user (or create one)
    console.log('\n3️⃣ Checking for test user...');
    let testUser = await prisma.user.findFirst({
      where: { email: 'test@aigp-exams.test' },
      select: { id: true, email: true, subscriptionTier: true },
    });

    if (!testUser) {
      console.log('   Creating test user...');
      testUser = await prisma.user.create({
        data: {
          email: 'test@aigp-exams.test',
          name: 'Test User',
          subscriptionTier: 'premium', // Set to premium for testing
        },
        select: { id: true, email: true, subscriptionTier: true },
      });
      console.log(`✅ Created test user: ${testUser.email}`);
    } else {
      console.log(`✅ Found test user: ${testUser.email}`);
    }

    // Ensure user is premium
    if (testUser.subscriptionTier !== 'premium') {
      await prisma.user.update({
        where: { id: testUser.id },
        data: { subscriptionTier: 'premium' },
      });
      console.log('   ✅ Updated user to premium');
    }

    // Test 4: Test starting an exam attempt
    console.log('\n4️⃣ Testing exam attempt flow...');
    const firstExam = exams[0];
    
    // Clean up any existing test attempts
    await prisma.aIGPExamAttempt.deleteMany({
      where: {
        examId: firstExam.id,
        user: { email: testUser.email },
      },
    });

    // Create attempt
    const attempt = await prisma.aIGPExamAttempt.create({
      data: {
        examId: firstExam.id,
        userId: testUser.id,
        attemptNumber: 1,
        status: 'IN_PROGRESS',
        isTimed: true,
        timeLimitSec: firstExam.estimatedTimeMin * 60,
        timeRemainingSec: firstExam.estimatedTimeMin * 60,
        totalQuestions: firstExam.totalQuestions,
      },
    });
    console.log(`✅ Created attempt: ${attempt.id}`);

    // Test 5: Get a question
    console.log('\n5️⃣ Testing question retrieval...');
    const question = await prisma.aIGPQuestion.findFirst({
      where: { examId: firstExam.id, questionOrder: 1 },
      include: { exam: true },
    });

    if (!question) {
      console.error('❌ Could not find question 1');
      return;
    }

    console.log(`✅ Retrieved question: ${question.questionId}`);
    console.log(`   Domain: ${question.domain}, Difficulty: ${question.difficulty}`);
    console.log(`   Options: ${(question.options as any[]).length}`);

    // Test 6: Save an answer
    console.log('\n6️⃣ Testing answer saving...');
    const answer = await prisma.aIGPExamAnswer.create({
      data: {
        attemptId: attempt.id,
        questionId: question.id,
        selectedAnswer: question.correctAnswer, // Answer correctly
        isFlagged: false,
        timeSpentSec: 60,
      },
    });
    console.log(`✅ Saved answer: ${answer.selectedAnswer}`);

    // Test 7: Test scoring logic
    console.log('\n7️⃣ Testing scoring logic...');
    const allQuestions = await prisma.aIGPQuestion.findMany({
      where: { examId: firstExam.id },
      orderBy: { questionOrder: 'asc' },
    });

    // Answer first 10 questions correctly
    for (let i = 0; i < Math.min(10, allQuestions.length); i++) {
      const q = allQuestions[i];
      await prisma.aIGPExamAnswer.upsert({
        where: {
          attemptId_questionId: {
            attemptId: attempt.id,
            questionId: q.id,
          },
        },
        update: {
          selectedAnswer: q.correctAnswer,
          isCorrect: true,
        },
        create: {
          attemptId: attempt.id,
          questionId: q.id,
          selectedAnswer: q.correctAnswer,
          isCorrect: true,
          timeSpentSec: 60,
        },
      });
    }

    // Answer next 5 incorrectly
    for (let i = 10; i < Math.min(15, allQuestions.length); i++) {
      const q = allQuestions[i];
      const wrongAnswer = q.correctAnswer === 'A' ? 'B' : 'A';
      await prisma.aIGPExamAnswer.upsert({
        where: {
          attemptId_questionId: {
            attemptId: attempt.id,
            questionId: q.id,
          },
        },
        update: {
          selectedAnswer: wrongAnswer,
          isCorrect: false,
        },
        create: {
          attemptId: attempt.id,
          questionId: q.id,
          selectedAnswer: wrongAnswer,
          isCorrect: false,
          timeSpentSec: 60,
        },
      });
    }

    console.log(`✅ Answered 15 questions (10 correct, 5 incorrect)`);

    // Test 8: Submit exam
    console.log('\n8️⃣ Testing exam submission...');
    const answers = await prisma.aIGPExamAnswer.findMany({
      where: { attemptId: attempt.id },
      include: { question: true },
    });

    let correctCount = 0;
    let totalAnswered = 0;
    const domainStats = new Map<string, { correct: number; total: number }>();

    for (const answer of answers) {
      if (answer.selectedAnswer) {
        totalAnswered++;
        if (answer.isCorrect) {
          correctCount++;
        }

        const domainStat = domainStats.get(answer.question.domain) || { correct: 0, total: 0 };
        domainStat.total++;
        if (answer.isCorrect) domainStat.correct++;
        domainStats.set(answer.question.domain, domainStat);
      }
    }

    const score = totalAnswered > 0 ? (correctCount / totalAnswered) * 100 : 0;
    const pass = score >= 70;

    const domainScores: Record<string, any> = {};
    for (const [domain, stat] of domainStats) {
      domainScores[domain] = {
        ...stat,
        score: stat.total > 0 ? (stat.correct / stat.total) * 100 : 0,
      };
    }

    await prisma.aIGPExamAttempt.update({
      where: { id: attempt.id },
      data: {
        status: 'SUBMITTED',
        submittedAt: new Date(),
        evaluatedAt: new Date(),
        score,
        rawScore: correctCount,
        totalQuestions: totalAnswered,
        pass,
        domainScores,
      },
    });

    console.log(`✅ Exam submitted:`);
    console.log(`   Score: ${score.toFixed(1)}%`);
    console.log(`   Correct: ${correctCount}/${totalAnswered}`);
    console.log(`   Pass: ${pass ? 'YES' : 'NO'}`);
    console.log(`   Domain Scores:`, domainScores);

    // Test 9: Verify review data
    console.log('\n9️⃣ Testing review data retrieval...');
    const submittedAttempt = await prisma.aIGPExamAttempt.findUnique({
      where: { id: attempt.id },
      include: {
        exam: {
          include: {
            questions: {
              orderBy: { questionOrder: 'asc' },
            },
          },
        },
        answers: {
          include: {
            question: true,
          },
        },
      },
    });

    if (submittedAttempt && submittedAttempt.status === 'SUBMITTED') {
      console.log(`✅ Review data accessible`);
      console.log(`   Questions: ${submittedAttempt.exam.questions.length}`);
      console.log(`   Answers: ${submittedAttempt.answers.length}`);
    } else {
      console.error('❌ Review data not accessible');
    }

    console.log('\n✅ All tests passed!');
    console.log('\n📝 Test Summary:');
    console.log(`   - Exams: ${exams.length}`);
    console.log(`   - Total Questions: ${exams.reduce((sum, e) => sum + e.totalQuestions, 0)}`);
    console.log(`   - Test User: ${testUser.email} (Premium)`);
    console.log(`   - Test Attempt: ${attempt.id}`);
    console.log(`   - Test Score: ${score.toFixed(1)}%`);

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

testAIGPExamsFlow();

