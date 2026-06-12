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

  // ── Modules ────────────────────────────────────────────────────────────────
  const modules = [
    {
      title: "Bab 1: Bilangan",
      slug: "bilangan",
      youtubeId: "dQw4w9WgXcQ",
      duration: 45,
      order: 1,
      courseId: courseMath.id,
      isFree: true,
      isPublished: true,
      description: "Pemahaman konsep bilangan real, pola bilangan, dan operasi dasar."
    },
    {
      title: "Bab 2: Aljabar",
      slug: "aljabar",
      youtubeId: "dQw4w9WgXcQ",
      duration: 60,
      order: 2,
      courseId: courseMath.id,
      isFree: false,
      isPublished: true,
      description: "Persamaan, pertidaksamaan, fungsi kuadrat, dan sistem persamaan linear."
    },
    {
      title: "Bab 3: Geometri & Pengukuran",
      slug: "geometri-pengukuran",
      youtubeId: "dQw4w9WgXcQ",
      duration: 75,
      order: 3,
      courseId: courseMath.id,
      isFree: false,
      isPublished: true,
      description: "Geometri bidang datar, bangun ruang, teorema Pythagoras, dan transformasi."
    },
    {
      title: "Bab 4: Trigonometri",
      slug: "trigonometri",
      youtubeId: "dQw4w9WgXcQ",
      duration: 50,
      order: 4,
      courseId: courseMath.id,
      isFree: false,
      isPublished: true,
      description: "Perbandingan trigonometri, fungsi trigonometri, dan identitas trigonometri."
    },
    {
      title: "Bab 5: Data & Peluang",
      slug: "data-peluang",
      youtubeId: "dQw4w9WgXcQ",
      duration: 55,
      order: 5,
      courseId: courseMath.id,
      isFree: false,
      isPublished: true,
      description: "Statistika deskriptif, ukuran pemusatan data, kombinatorika, dan peluang kejadian."
    }
  ];

  for (const m of modules) {
    await prisma.module.upsert({ where: { slug: m.slug }, update: {}, create: m });
    console.log("  ✓", m.title);
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

  console.log("\nDone! Login admin:");
  console.log("  Email   : admin@nalaretam.com");
  console.log("  Password: admin123");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
