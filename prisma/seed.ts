import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  // ── Admin ──────────────────────────────────────────────────────────────────
  const hashed = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@nalaretam.com" },
    update: {},
    create: {
      name: "Owner Nalar Etam",
      email: "admin@nalaretam.com",
      password: hashed,
      role: "ADMIN",
      hasAccess: true,
    },
  });
  console.log("✓ Admin:", admin.email);

  // ── Categories ─────────────────────────────────────────────────────────────
  const catMath = await prisma.category.upsert({
    where: { slug: "matematika" },
    update: {},
    create: { name: "Matematika", slug: "matematika", order: 1 }
  });
  console.log("✓ Categories:", catMath.name);

  // ── Courses ────────────────────────────────────────────────────────────────
  const courseMath = await prisma.course.upsert({
    where: { slug: "tka-matematika" },
    update: {},
    create: {
      title: "UTBK TKA Matematika",
      slug: "tka-matematika",
      description: "Pahami konsep matematika secara logis, interaktif, dan terstruktur untuk persiapan UTBK TKA Matematika.",
      price: 0,
      status: "PUBLISHED",
      order: 1,
      categoryId: catMath.id,
    },
  });
  console.log("✓ Courses:", courseMath.title);

  // ── Chapters & Modules ──────────────────────────────────────────────────────
  const seedData = [
    {
      chapterTitle: "Bab 1: Bilangan",
      modules: [
        {
          title: "Konsep Bilangan",
          slug: "bilangan",
          youtubeId: "dQw4w9WgXcQ",
          duration: 45,
          order: 1,
          isFree: true,
          isPublished: true,
          description: "Pemahaman konsep bilangan real, pola bilangan, dan operasi dasar."
        }
      ]
    },
    {
      chapterTitle: "Bab 2: Aljabar",
      modules: [
        {
          title: "Persamaan dan Fungsi Kuadrat",
          slug: "aljabar",
          youtubeId: "dQw4w9WgXcQ",
          duration: 60,
          order: 1,
          isFree: false,
          isPublished: true,
          description: "Persamaan, pertidaksamaan, fungsi kuadrat, dan sistem persamaan linear."
        }
      ]
    },
    {
      chapterTitle: "Bab 3: Geometri & Pengukuran",
      modules: [
        {
          title: "Teorema Pythagoras dan Geometri Bidang",
          slug: "geometri-pengukuran",
          youtubeId: "dQw4w9WgXcQ",
          duration: 75,
          order: 1,
          isFree: false,
          isPublished: true,
          description: "Geometri bidang datar, bangun ruang, teorema Pythagoras, dan transformasi."
        }
      ]
    },
    {
      chapterTitle: "Bab 4: Trigonometri",
      modules: [
        {
          title: "Perbandingan dan Fungsi Trigonometri",
          slug: "trigonometri",
          youtubeId: "dQw4w9WgXcQ",
          duration: 50,
          order: 1,
          isFree: false,
          isPublished: true,
          description: "Perbandingan trigonometri, fungsi trigonometri, dan identitas trigonometri."
        }
      ]
    },
    {
      chapterTitle: "Bab 5: Data & Peluang",
      modules: [
        {
          title: "Statistika dan Kombinatorika",
          slug: "data-peluang",
          youtubeId: "dQw4w9WgXcQ",
          duration: 55,
          order: 1,
          isFree: false,
          isPublished: true,
          description: "Statistika deskriptif, ukuran pemusatan data, kombinatorika, dan peluang kejadian."
        }
      ]
    }
  ];

  let chapterOrder = 1;
  for (const group of seedData) {
    let chapter = await prisma.chapter.findFirst({
      where: { title: group.chapterTitle, courseId: courseMath.id }
    });
    if (!chapter) {
      chapter = await prisma.chapter.create({
        data: {
          title: group.chapterTitle,
          courseId: courseMath.id,
          order: chapterOrder++,
        }
      });
    }

    console.log("✓ Chapter:", chapter.title);

    for (const m of group.modules) {
      await prisma.module.upsert({
        where: { slug: m.slug },
        update: { chapterId: chapter.id },
        create: {
          title: m.title,
          slug: m.slug,
          youtubeId: m.youtubeId,
          duration: m.duration,
          order: m.order,
          isFree: m.isFree,
          isPublished: m.isPublished,
          description: m.description,
          chapterId: chapter.id,
        }
      });
      console.log("  ✓ Module:", m.title);
    }
  }

  // ── Promo Code ─────────────────────────────────────────────────────────────
  await prisma.promoCode.upsert({
    where: { code: "NALAR50" },
    update: {},
    create: { code: "NALAR50", discount: 50, maxUses: 100 },
  });
  console.log("✓ Promo: NALAR50 (50% off)");

  await prisma.promoCode.upsert({
    where: { code: "NL-FREE-UTBK2026" },
    update: {},
    create: {
      code: "NL-FREE-UTBK2026",
      discount: 100,
      maxUses: 5,
      isActive: true,
      expiresAt: new Date("2026-12-31T23:59:59Z"),
    },
  });
  console.log("✓ Promo: NL-FREE-UTBK2026 (100% off, max 5 uses)");

  // ── Seed Quizzes ───────────────────────────────────────────────────────────
  console.log("\n── Seeding Quizzes...");

  // 1. Chapter Quiz for Bab 1
  const chapter1 = await prisma.chapter.findFirst({
    where: { title: "Bab 1: Bilangan", courseId: courseMath.id }
  });

  if (chapter1) {
    const quizChapter1 = await prisma.quiz.upsert({
      where: { id: "seed-quiz-chap1" },
      update: {},
      create: {
        id: "seed-quiz-chap1",
        courseId: courseMath.id,
        chapterId: chapter1.id,
        title: "Kuis Bab 1: Pemahaman Bilangan",
        description: "Uji pemahaman dasar konsep bilangan real, pola bilangan, dan operasi dasar.",
        passingScore: 70,
        timeLimit: 15,
        isPublished: true,
      }
    });

    // Seed questions for Chapter 1 Quiz
    const q1 = await prisma.quizQuestion.upsert({
      where: { id: "seed-q-c1-1" },
      update: {},
      create: {
        id: "seed-q-c1-1",
        quizId: quizChapter1.id,
        question: "<p>Manakah dari bilangan berikut yang merupakan bilangan irasional?</p>",
        type: "MULTIPLE_CHOICE",
        order: 1,
      }
    });

    await prisma.quizOption.deleteMany({ where: { questionId: q1.id } });
    await prisma.quizOption.createMany({
      data: [
        { questionId: q1.id, text: "0.5", isCorrect: false, order: 1 },
        { questionId: q1.id, text: "√4", isCorrect: false, order: 2 },
        { questionId: q1.id, text: "π (pi)", isCorrect: true, order: 3 },
        { questionId: q1.id, text: "2/3", isCorrect: false, order: 4 },
        { questionId: q1.id, text: "-10", isCorrect: false, order: 5 },
      ]
    });

    console.log("✓ Chapter Quiz: Kuis Bab 1");
  }

  // 2. Evaluasi Akhir (Main Graduation Quiz)
  const finalQuiz = await prisma.quiz.upsert({
    where: { id: "seed-quiz-final" },
    update: {},
    create: {
      id: "seed-quiz-final",
      courseId: courseMath.id,
      title: "Evaluasi Akhir Utama: UTBK TKA Matematika",
      description: "Ujian komprehensif kelulusan kelas UTBK TKA Matematika. Selesaikan untuk mendapatkan sertifikat.",
      passingScore: 75,
      timeLimit: 60,
      isPublished: true,
    }
  });

  const qf1 = await prisma.quizQuestion.upsert({
    where: { id: "seed-q-f-1" },
    update: {},
    create: {
      id: "seed-q-f-1",
      quizId: finalQuiz.id,
      question: "<p>Jika x + y = 10 dan x - y = 4, berapakah nilai x * y?</p>",
      type: "MULTIPLE_CHOICE",
      order: 1,
    }
  });

  await prisma.quizOption.deleteMany({ where: { questionId: qf1.id } });
  await prisma.quizOption.createMany({
    data: [
      { questionId: qf1.id, text: "14", isCorrect: false, order: 1 },
      { questionId: qf1.id, text: "21", isCorrect: true, order: 2 },
      { questionId: qf1.id, text: "40", isCorrect: false, order: 3 },
      { questionId: qf1.id, text: "28", isCorrect: false, order: 4 },
      { questionId: qf1.id, text: "16", isCorrect: false, order: 5 },
    ]
  });

  console.log("✓ Evaluasi Akhir: Ujian Kelulusan");

  // 3. Try Out 1 (Another Course-Wide Quiz)
  const tryOutQuiz = await prisma.quiz.upsert({
    where: { id: "seed-quiz-to1" },
    update: {},
    create: {
      id: "seed-quiz-to1",
      courseId: courseMath.id,
      title: "Simulasi Try Out 1: Penalaran Matematika",
      description: "Latihan simulasi ujian nasional/UTBK untuk mengukur kesiapan mental dan ketepatan menjawab.",
      passingScore: 65,
      timeLimit: 45,
      isPublished: true,
    }
  });

  const qt1 = await prisma.quizQuestion.upsert({
    where: { id: "seed-q-t-1" },
    update: {},
    create: {
      id: "seed-q-t-1",
      quizId: tryOutQuiz.id,
      question: "<p>Berapakah jumlah sudut dalam sebuah segi lima?</p>",
      type: "MULTIPLE_CHOICE",
      order: 1,
    }
  });

  await prisma.quizOption.deleteMany({ where: { questionId: qt1.id } });
  await prisma.quizOption.createMany({
    data: [
      { questionId: qt1.id, text: "180°", isCorrect: false, order: 1 },
      { questionId: qt1.id, text: "360°", isCorrect: false, order: 2 },
      { questionId: qt1.id, text: "540°", isCorrect: true, order: 3 },
      { questionId: qt1.id, text: "720°", isCorrect: false, order: 4 },
      { questionId: qt1.id, text: "900°", isCorrect: false, order: 5 },
    ]
  });

  console.log("✓ Evaluasi Akhir: Try Out 1");

  console.log("\nDone! Login admin:");
  console.log("  Email   : admin@nalaretam.com");
  console.log("  Password: admin123");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
