import { prisma } from "@/lib/prisma";
import CheckoutClient from "./CheckoutClient";

export const dynamic = "force-dynamic";

const programs: Record<string, { price: number; originalPrice: number; name: string; description: string; badge: string }> = {
  group: {
    price: 30000,
    originalPrice: 50000,
    name: "Kelas Group - Nalar Etam",
    description: "Sesi kelas belajar intensif secara berkelompok (maksimal 5 siswa) dengan pendampingan interaktif dari tutor.",
    badge: "KELAS GROUP"
  },
  semiprivat: {
    price: 60000,
    originalPrice: 100000,
    name: "Kelas Semiprivat - Nalar Etam",
    description: "Sesi bimbingan belajar eksklusif (maksimal 2 siswa) untuk pendampingan konsep yang intensif dan terarah.",
    badge: "KELAS SEMIPRIVAT"
  },
  privat: {
    price: 100000,
    originalPrice: 150000,
    name: "Kelas Privat - Nalar Etam",
    description: "Sesi privat 1-on-1 eksklusif dengan tutor untuk bimbingan konsep personal dan jadwal fleksibel.",
    badge: "KELAS PRIVAT"
  }
};

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ program?: string }> }) {
  const setting = await prisma.setting.upsert({ where: { id: "singleton" }, create: {}, update: {} });
  const resolvedParams = await searchParams;
  const program = resolvedParams.program;

  const programDetails = program && programs[program] ? programs[program] : {
    price: setting.coursePrice,
    originalPrice: setting.originalPrice,
    name: "Nalar Etam Premium",
    description: "Akses selamanya ke seluruh materi pembelajaran UTBK TKA Matematika interaktif, visualisasi konsep, dan bank soal penalaran bertingkat.",
    badge: "LIFETIME ACCESS"
  };

  return (
    <CheckoutClient
      basePrice={programDetails.price}
      displayOriginal={programDetails.originalPrice}
      adminPhone={setting.phone ?? ""}
      programId={program && programs[program] ? program : "premium"}
      programName={programDetails.name}
      programDescription={programDetails.description}
      programBadge={programDetails.badge}
    />
  );
}
