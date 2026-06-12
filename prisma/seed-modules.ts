// @ts-nocheck — file ini obsolete, sudah digabung ke seed.ts
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Pastikan kategori ada
  const cats = await prisma.category.findMany({ orderBy: { order: "asc" } });
  console.log("Kategori:", cats.map((c) => `${c.name} (${c.id})`));

  const reglue  = cats.find((c) => c.slug === "reglue-dasar")!;
  const lanjut  = cats.find((c) => c.slug === "reglue-lanjutan")!;
  const cuci    = cats.find((c) => c.slug === "cuci-sepatu")!;

  if (!reglue || !lanjut || !cuci) {
    console.error("Kategori belum ada, jalankan npm run seed dulu.");
    return;
  }

  const modules = [
    // Reglue Dasar
    { title: "Pengenalan Alat & Bahan Reglue",     slug: "pengenalan-alat-bahan",       youtubeId: "dQw4w9WgXcQ", duration: 12, order: 1, categoryId: reglue.id, isFree: true,  isPublished: true,
      description: "Kenali jenis lem, primer, dan tools wajib untuk reglue profesional. Mana yang perlu dibeli dan mana yang bisa diganti." },
    { title: "Teknik Sole Separation Yang Benar",  slug: "sole-separation",              youtubeId: "dQw4w9WgXcQ", duration: 18, order: 2, categoryId: reglue.id, isFree: false, isPublished: true,
      description: "Cara melepas sole tanpa merusak upper sepatu. Teknik panas, teknik dingin, dan kapan menggunakannya." },
    { title: "Surface Prep & Aplikasi Primer",     slug: "surface-prep-primer",          youtubeId: "dQw4w9WgXcQ", duration: 15, order: 3, categoryId: reglue.id, isFree: false, isPublished: true,
      description: "Persiapan permukaan yang benar adalah kunci lem tidak lepas lagi. Pelajari teknik amplas, bersih, dan primer." },
    { title: "Aplikasi Lem & Teknik Bonding",      slug: "aplikasi-lem-bonding",         youtubeId: "dQw4w9WgXcQ", duration: 20, order: 4, categoryId: reglue.id, isFree: false, isPublished: true,
      description: "Cara oleskan lem secara merata, waktu tunggu yang tepat, dan teknik menekan sole agar hasil kuat dan tahan lama." },

    // Reglue Lanjutan
    { title: "Reglue Midsole Retak & EVA",         slug: "reglue-midsole-eva",           youtubeId: "dQw4w9WgXcQ", duration: 22, order: 1, categoryId: lanjut.id, isFree: false, isPublished: true,
      description: "Menangani midsole EVA yang gembur, retak, atau mengelupas. Material ini membutuhkan teknik khusus agar lem melekat." },
    { title: "Outsole Rubber — Teknik Lanjutan",   slug: "outsole-rubber-lanjutan",      youtubeId: "dQw4w9WgXcQ", duration: 25, order: 2, categoryId: lanjut.id, isFree: false, isPublished: true,
      description: "Rubber outsole yang licin atau berlapis kotoran. Cara membersihkan, mengamplas, dan merekatkan dengan presisi tinggi." },
    { title: "Quality Control & Finishing",        slug: "quality-control-finishing",    youtubeId: "dQw4w9WgXcQ", duration: 14, order: 3, categoryId: lanjut.id, isFree: false, isPublished: true,
      description: "Cara cek kualitas hasil reglue sebelum dikembalikan ke customer. Standar yang digunakan di Katsikat setiap hari." },

    // Cuci Sepatu
    { title: "Deep Clean Sepatu Kanvas & Mesh",    slug: "deep-clean-kanvas-mesh",       youtubeId: "dQw4w9WgXcQ", duration: 16, order: 1, categoryId: cuci.id,   isFree: false, isPublished: true,
      description: "Teknik cuci sepatu kanvas dan mesh yang benar agar serat tidak rusak dan warna tetap cerah setelah dicuci." },
    { title: "Cuci Sepatu Kulit & Suede",          slug: "cuci-kulit-suede",             youtubeId: "dQw4w9WgXcQ", duration: 20, order: 2, categoryId: cuci.id,   isFree: false, isPublished: true,
      description: "Material kulit dan suede membutuhkan perlakuan berbeda. Produk yang tepat, teknik kering, dan cara conditioning setelahnya." },
  ];

  let created = 0;
  for (const m of modules) {
    await prisma.module.upsert({
      where: { slug: m.slug },
      update: {},
      create: m,
    });
    console.log(`✓ ${m.title}`);
    created++;
  }

  console.log(`\n${created} modul berhasil dibuat.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
