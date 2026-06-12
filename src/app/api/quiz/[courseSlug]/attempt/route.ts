import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { gradeEssay } from "@/lib/gemini";
import { createNotif } from "@/lib/notify";

export async function POST(req: NextRequest, { params }: { params: Promise<{ courseSlug: string }> }) {
  let session;
  try { session = await requireSession(); } catch { return NextResponse.json({ message: "Unauthorized" }, { status: 401 }); }

  const { courseSlug } = await params;
  const { answers } = await req.json();

  const course = await prisma.course.findUnique({ where: { slug: courseSlug }, select: { id: true } });
  if (!course) return NextResponse.json({ message: "Course tidak ditemukan." }, { status: 404 });

  const quiz = await prisma.quiz.findUnique({
    where: { courseId: course.id },
    include: { questions: { include: { options: true } } },
  });
  if (!quiz) return NextResponse.json({ message: "Quiz tidak ditemukan." }, { status: 404 });

  const totalQuestions = quiz.questions.length;
  if (totalQuestions === 0) return NextResponse.json({ message: "Quiz tidak memiliki pertanyaan." }, { status: 400 });

  // Score MCQ questions (0 or 100 per question)
  const questionScores: Record<string, { score: number; feedback?: string }> = {};

  for (const q of quiz.questions) {
    const answer = answers.find((a: { questionId: string }) => a.questionId === q.id);

    if (q.type === "MULTIPLE_CHOICE") {
      const correctOption = q.options.find((o) => o.isCorrect);
      const isCorrect = correctOption && answer?.selectedOptionId === correctOption.id;
      questionScores[q.id] = { score: isCorrect ? 100 : 0 };
    } else {
      // ESSAY — grade with Gemini
      const essayAnswer = answer?.essayAnswer?.trim() ?? "";
      if (!essayAnswer) {
        questionScores[q.id] = { score: 0, feedback: "Tidak ada jawaban." };
      } else if (!q.expectedAnswer) {
        // No rubric set — give full score (manual review needed)
        questionScores[q.id] = { score: 100, feedback: "Tidak ada rubrik, perlu review manual." };
      } else {
        const result = await gradeEssay(q.question, q.expectedAnswer, essayAnswer);
        questionScores[q.id] = result;
      }
    }
  }

  // Final score = average of all question scores
  const totalScore = Object.values(questionScores).reduce((sum, s) => sum + s.score, 0);
  const score = Math.round(totalScore / totalQuestions);
  const passed = score >= quiz.passingScore;

  // Enrich answers with AI feedback before storing
  const enrichedAnswers = answers.map((a: { questionId: string }) => ({
    ...a,
    aiScore: questionScores[a.questionId]?.score,
    aiFeedback: questionScores[a.questionId]?.feedback,
  }));

  const attempt = await prisma.quizAttempt.create({
    data: { userId: session.id, quizId: quiz.id, score, passed, answers: enrichedAnswers },
  });

  // Notify quiz result
  await createNotif(
    session.id,
    "quiz_result",
    passed ? `Quiz Lulus! Skor ${score}% 🏆` : `Hasil Quiz: ${score}%`,
    passed
      ? `Selamat! Kamu lulus quiz dengan skor ${score}%. Sertifikat akan segera diterbitkan jika semua modul selesai.`
      : `Kamu mendapat skor ${score}%. Passing score: ${quiz.passingScore}%. Coba lagi untuk lulus!`,
  );

  // Auto-generate certificate if passed and all modules completed
  if (passed) {
    const publishedModules = await prisma.module.findMany({
      where: { courseId: course.id, isPublished: true },
      select: { id: true },
    });
    const completedModules = await prisma.progress.findMany({
      where: { userId: session.id, completed: true, moduleId: { in: publishedModules.map((m) => m.id) } },
    });
    const allCompleted = publishedModules.length > 0 && completedModules.length >= publishedModules.length;

    if (allCompleted) {
      const existing = await prisma.certificate.findUnique({
        where: { userId_courseId: { userId: session.id, courseId: course.id } },
      });
      if (!existing) {
        const setting = await prisma.setting.findUnique({ where: { id: "singleton" } });
        const prefix = setting?.certPrefix ?? "CERT";
        const year = new Date().getFullYear();
        const count = await prisma.certificate.count();
        const certNumber = `${prefix}-${year}-${String(count + 1).padStart(4, "0")}`;
        await prisma.certificate.create({
          data: { userId: session.id, courseId: course.id, certificateNumber: certNumber },
        });
        const courseData = await prisma.course.findUnique({ where: { id: course.id }, select: { title: true } });
        await createNotif(session.id, "cert_issued", "Sertifikat Diterbitkan! 🎉", `Sertifikat kamu untuk kursus "${courseData?.title}" telah diterbitkan. Nomor: ${certNumber}. Lihat di halaman Sertifikat.`);
      }
    }
  }

  return NextResponse.json({ score, passed, passingScore: quiz.passingScore, attemptId: attempt.id, questionScores });
}
