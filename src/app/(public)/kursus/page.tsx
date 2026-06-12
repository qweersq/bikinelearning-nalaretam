import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { getSession } from "@/lib/auth";

const modules = [
  { no: "01", title: "Bab 1: Bilangan", desc: "Pemahaman konsep bilangan real, pola bilangan, dan operasi dasar.", duration: "45 mnt" },
  { no: "02", title: "Bab 2: Aljabar", desc: "Persamaan, pertidaksamaan, fungsi kuadrat, dan sistem persamaan linear.", duration: "60 mnt" },
  { no: "03", title: "Bab 3: Geometri & Pengukuran", desc: "Geometri bidang datar, bangun ruang, teorema Pythagoras, dan transformasi.", duration: "75 mnt" },
  { no: "04", title: "Bab 4: Trigonometri", desc: "Perbandingan trigonometri, fungsi trigonometri, dan identitas trigonometri.", duration: "50 mnt" },
  { no: "05", title: "Bab 5: Data & Peluang", desc: "Statistika deskriptif, ukuran pemusatan data, kombinatorika, dan peluang kejadian.", duration: "55 mnt" },
];

const faqs = [
  { q: "Apakah cocok untuk pemula / lintas jurusan?", a: "Ya, materi dimulai dari pemahaman konsep paling mendasar (Level 1) hingga penalaran tingkat tinggi (Level 3), sangat cocok untuk siapa saja." },
  { q: "Berapa lama akses belajar berlaku?", a: "Selamanya. Bayar sekali, tonton dan pelajari kapan pun serta sesering yang kamu mau." },
  { q: "Apa yang saya butuhkan untuk mulai?", a: "Cukup HP atau laptop dengan koneksi internet. Kamu bisa langsung mengakses visualisasi dan modul belajar kami." },
  { q: "Apakah ada sertifikat?", a: "Ya. Setelah menyelesaikan semua materi dan tes penalaran, kamu bisa mengunduh sertifikat kelulusan resmi." },
];

export default async function KursusPage() {
  const session = await getSession();

  return (
    <div className="bg-[#F7F6F2]">
      <Navbar />

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_340px]">

          {/* Kiri — info kursus */}
          <div>
            <Badge variant="teal" dot className="mb-4">Program Unggulan</Badge>
            <h1 className="font-[family-name:var(--font-sora)] text-4xl font-bold leading-tight text-stone-900 sm:text-5xl">
              Kuasai UTBK TKA<br />Matematika Lebih Nalar
            </h1>
            <p className="mt-4 max-w-lg text-lg leading-relaxed text-stone-500">
              Beralih dari hafalan ke pemahaman konsep yang kuat. Pelajari materi UTBK Matematika terstruktur dengan visualisasi interaktif dan latihan penalaran bertingkat.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              {[
                { icon: "📚", label: "5 Bab Materi" },
                { icon: "⏱", label: "±5 Jam Belajar" },
                { icon: "📱", label: "Akses Selamanya" },
                { icon: "🎓", label: "Sertifikat Kelulusan" },
              ].map((f) => (
                <div key={f.label} className="flex items-center gap-2 rounded-full bg-white border border-stone-200 px-4 py-2 text-sm font-medium text-stone-700 shadow-sm">
                  <span>{f.icon}</span>
                  <span>{f.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Kanan — pricing card */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <Card className="overflow-hidden">
              <div className="bg-blue-700 px-6 py-5 text-white">
                <p className="font-[family-name:var(--font-sora)] text-2xl font-bold">Nalar Etam Premium</p>
                <p className="mt-1 text-sm text-blue-200">Bayar sekali · Akses selamanya</p>
              </div>
              <div className="p-6">
                <ul className="mb-6 space-y-2.5">
                  {["5 bab materi interaktif", "40+ simulasi visual", "Roadmap TKA terstruktur", "Sertifikat kelulusan resmi", "Akses selamanya"].map((item) => (
                    <li key={item} className="flex items-center gap-2.5 text-sm text-stone-600">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-bold">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>

                {session?.hasAccess ? (
                  <Link href="/dashboard">
                    <Button fullWidth>Mulai Belajar →</Button>
                  </Link>
                ) : (
                  <Link href={session ? "/checkout" : "/register"}>
                    <Button fullWidth>
                      {session ? "Beli Sekarang" : "Daftar & Beli"}
                    </Button>
                  </Link>
                )}

                <p className="mt-3 text-center text-xs text-stone-400">
                  Pembayaran aman via QRIS, transfer bank & e-wallet
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Kurikulum */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="font-[family-name:var(--font-sora)] text-2xl font-bold text-stone-900 mb-2">Kurikulum</h2>
          <p className="text-stone-500 mb-8">Total ±5 jam materi dan simulasi visual interaktif yang bisa dipelajari kapan saja.</p>
          <div className="grid gap-3 max-w-2xl">
            {modules.map((m) => (
              <Card key={m.no} className="flex items-center gap-4 px-5 py-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-700 text-white text-sm font-bold">
                  {m.no}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-stone-900 text-sm">{m.title}</p>
                  <p className="text-xs text-stone-400 mt-0.5">{m.desc}</p>
                </div>
                <span className="shrink-0 text-xs text-stone-400">{m.duration}</span>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="font-[family-name:var(--font-sora)] text-2xl font-bold text-stone-900 mb-8">Pertanyaan Umum</h2>
          <div className="grid gap-4 max-w-2xl">
            {faqs.map((f) => (
              <Card key={f.q} className="p-5">
                <p className="font-semibold text-stone-900 text-sm mb-2">{f.q}</p>
                <p className="text-sm text-stone-500 leading-relaxed">{f.a}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
