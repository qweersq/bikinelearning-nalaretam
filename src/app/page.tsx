import Link from "next/link";
import Header from "@/components/layout/Header";
import {
  X, CheckCircle2, GraduationCap, Infinity, BookOpen, Shield,
  Brain, Compass, Calculator, TrendingUp,
} from "lucide-react";

const problems = [
  { icon: X, text: "Hanya menghafal rumus cepat tanpa memahami konsep dasarnya" },
  { icon: X, text: "Bingung menerapkan rumus saat soal UTBK dimodifikasi atau divariasikan" },
  { icon: X, text: "Sulit membayangkan visualisasi grafik atau bangun ruang secara abstrak" },
  { icon: X, text: "Kehabisan waktu saat ujian karena cara pengerjaan yang terlalu panjang" },
];

const whys = [
  {
    icon: Brain,
    title: "Belajar dengan Nalar",
    desc: "Tidak sekadar menghafal rumus cepat, tetapi memahami konsep dasar di balik setiap materi matematika."
  },
  {
    icon: Compass,
    title: "Visual & Interaktif",
    desc: "Konsep abstrak dijelaskan secara menarik lewat visualisasi grafis dan simulasi interaktif."
  },
  {
    icon: Shield,
    title: "Sesuai Kerangka TKA",
    desc: "Seluruh silabus disusun presisi mengikuti Kerangka Asesmen TKA resmi dari Pusmendik."
  },
  {
    icon: TrendingUp,
    title: "Roadmap Terstruktur",
    desc: "Alur belajar yang dirancang khusus dari level pemula hingga pemecahan soal penalaran tinggi."
  },
];

const features = [
  { icon: BookOpen, text: "5 Bab Materi Pembelajaran Utama" },
  { icon: Brain, text: "3 Level Latihan Penalaran Bertingkat" },
  { icon: Compass, text: "40+ Simulasi Visual Interaktif" },
  { icon: TrendingUp, text: "Roadmap TKA Terstruktur" },
  { icon: Shield, text: "Akses Selamanya (Lifetime Access)" },
  { icon: GraduationCap, text: "Sertifikat Kelulusan Resmi" },
];

const faqs = [
  {
    q: "Apakah cocok untuk pemula / lintas jurusan?",
    a: "Ya, materi dimulai dari pemahaman konsep paling mendasar (Level 1) hingga penalaran tingkat tinggi (Level 3), sangat cocok untuk siapa saja.",
  },
  {
    q: "Apakah mendapatkan sertifikat?",
    a: "Ya, sertifikat digital kelulusan akan diberikan setelah kamu menyelesaikan seluruh bab materi dan tes penalaran.",
  },
  {
    q: "Apakah aksesnya selamanya?",
    a: "Ya, sekali terdaftar kamu bisa mengakses seluruh visualisasi, materi, dan latihan selamanya — termasuk semua update di masa depan.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f6f8fc]">
      {/* Sticky Header */}
      <Header />

      <div className="mx-auto max-w-[768px] px-5 pb-24 pt-6">

        {/* Hero */}
        <div className="rounded-[30px] bg-gradient-to-br from-[#1e1b4b] via-[#1d4ed8] to-[#2563eb] p-7 text-white shadow-xl relative overflow-hidden">
          <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-white/5 blur-2xl" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-2 text-xs font-semibold">
              <Brain size={13} />
              Belajar UTBK Lebih Cerdas
            </div>
            <h1 className="mt-4 text-[34px] font-extrabold leading-tight">
              Belajar dengan Nalar,<br />Bukan Hafalan.
            </h1>
            <p className="mt-3.5 leading-relaxed opacity-90 text-sm sm:text-base">
              Platform belajar TKA Matematika yang membantu siswa memahami konsep melalui visualisasi, simulasi interaktif, dan latihan berbasis penalaran.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link href="/register" className="flex-1">
                <button className="h-14 w-full rounded-[18px] bg-white text-[15px] font-bold text-[#2563eb] transition-all duration-300 hover:shadow-lg active:scale-98">
                  Mulai Belajar
                </button>
              </Link>
              <Link href="/kelas-gratis" className="flex-1">
                <button className="h-14 w-full rounded-[18px] border-2 border-white/40 bg-white/10 text-[15px] font-bold text-white transition-all duration-300 hover:bg-white/20 active:scale-98">
                  Gabung Kelas Gratis
                </button>
              </Link>
            </div>
            <div className="mt-5 flex h-44 items-center justify-center rounded-[20px] bg-white/10">
              <Compass size={80} className="text-white/60 animate-pulse" strokeWidth={1} />
            </div>
          </div>
        </div>

        {/* Masalah */}
        <div className="mt-12">
          <h2 className="mb-6 text-[26px] font-extrabold text-stone-900 leading-tight">Masalah Yang Sering Dialami</h2>
          <div className="space-y-3">
            {problems.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3.5 rounded-[22px] bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-stone-100/60 transition-all duration-300 hover:shadow-md">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-red-50">
                  <Icon size={16} className="text-red-400" strokeWidth={2.5} />
                </div>
                <span className="text-sm font-semibold text-stone-700 leading-relaxed">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Roadmap Materi TKA */}
        <div className="mt-12">
          <h2 className="mb-6 text-[26px] font-extrabold text-stone-900 leading-tight">Roadmap Materi TKA</h2>
          <div className="relative before:absolute before:bottom-2 before:top-2 before:left-4 before:w-0.5 before:bg-stone-200">
            {[
              { bab: "Bab 1", title: "Bilangan", desc: "Pemahaman konsep bilangan real, pola bilangan, dan operasi dasar.", icon: Calculator, color: "bg-blue-600 text-white" },
              { bab: "Bab 2", title: "Aljabar", desc: "Persamaan, pertidaksamaan, fungsi kuadrat, dan sistem persamaan linear.", icon: Infinity, color: "bg-purple-600 text-white" },
              { bab: "Bab 3", title: "Geometri & Pengukuran", desc: "Geometri bidang datar, bangun ruang, teorema Pythagoras, dan transformasi.", icon: Compass, color: "bg-emerald-600 text-white" },
              { bab: "Bab 4", title: "Trigonometri", desc: "Perbandingan trigonometri, fungsi trigonometri, dan identitas trigonometri.", icon: TrendingUp, color: "bg-rose-600 text-white" },
              { bab: "Bab 5", title: "Data & Peluang", desc: "Statistika deskriptif, ukuran pemusatan data, kombinatorika, dan peluang kejadian.", icon: BookOpen, color: "bg-amber-600 text-white" }
            ].map(({ bab, title, desc, icon: Icon, color }) => (
              <div key={title} className="relative mb-8 last:mb-0 group">
                {/* Timeline dot */}
                <div className={`absolute left-4 top-1.5 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full border-2 border-white ${color} shadow-sm transition-transform duration-300 group-hover:scale-110 z-10`}>
                  <Icon size={14} />
                </div>
                {/* Card content */}
                <div className="ml-10 rounded-[22px] border border-stone-100 bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)] transition-all duration-300 hover:shadow-md">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-400">{bab}</span>
                  <h3 className="text-lg font-bold text-stone-900 mt-0.5">{title}</h3>
                  <p className="mt-1 text-sm text-stone-600 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Kenapa Nalar Etam */}
        <div className="mt-12">
          <h2 className="mb-6 text-[26px] font-extrabold text-stone-900 leading-tight">Kenapa Belajar di Nalar Etam?</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {whys.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-[22px] bg-white p-6 shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-stone-100/60 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eff6ff] text-[#2563eb] mb-4">
                  <Icon size={20} />
                </div>
                <h3 className="text-base font-bold text-stone-900">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Program Promo Banner */}
        <div className="mt-12 rounded-[30px] bg-gradient-to-b from-[#111827] to-[#0f172a] p-8 text-white shadow-xl border border-white/5 relative overflow-hidden">
          <div className="absolute -right-24 -top-24 h-48 w-48 rounded-full bg-[#2563eb]/20 blur-3xl" />
          <div className="relative z-10">
            <span className="inline-block rounded-full bg-[#2563eb] px-3.5 py-1.5 text-[10px] font-extrabold uppercase tracking-widest">
              Program Belajar Nalar Etam
            </span>
            <h2 className="mt-4 text-[28px] font-extrabold tracking-tight">
              Temukan Program Belajar yang Tepat untuk Kamu
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/70">
              Mulai dari kelas kelompok belajar interaktif, kelas pendampingan intensif dengan sahabat, hingga bimbingan eksklusif 1-on-1 bersama tutor berpengalaman.
            </p>

            <div className="mt-6 space-y-3.5">
              {[
                { icon: Brain, text: "Kelas Group: Belajar seru berkelompok (Maks. 5 siswa)" },
                { icon: Compass, text: "Kelas Semiprivat: Pendampingan konsep lebih intens (Maks. 2 siswa)" },
                { icon: GraduationCap, text: "Kelas Privat: Perhatian penuh 100% tutor untuk 1 siswa" }
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3 text-sm text-white/90">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#2563eb]/20 text-blue-400">
                    <Icon size={12} />
                  </div>
                  <span>{text}</span>
                </div>
              ))}
            </div>

            <Link href="/program">
              <button className="mt-8 h-14 w-full rounded-[18px] bg-[#2563eb] text-[15px] font-bold text-white transition-all duration-300 hover:bg-[#3b82f6] hover:shadow-[0_4px_20px_rgba(37,99,235,0.4)] active:scale-98 cursor-pointer">
                Lihat Pilihan Program Belajar
              </button>
            </Link>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-12">
          <h2 className="mb-6 text-[26px] font-extrabold text-stone-900 leading-tight">Pertanyaan Umum (FAQ)</h2>
          <div className="space-y-3">
            {faqs.map((f) => (
              <div key={f.q} className="rounded-[22px] border border-stone-100 bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-all duration-300 hover:shadow-md">
                <h4 className="font-bold text-stone-900 text-sm sm:text-base flex gap-2">
                  <span className="text-[#2563eb]">Q.</span>
                  {f.q}
                </h4>
                <p className="mt-2 text-sm leading-relaxed text-stone-600 pl-5">{f.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Trust badges */}
        <div className="mt-8 grid grid-cols-3 gap-3">
          {[
            { icon: Shield, label: "Pembayaran Aman" },
            { icon: Infinity, label: "Akses Selamanya" },
            { icon: GraduationCap, label: "Sertifikat Kelulusan" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-2 rounded-[18px] bg-white p-4 text-center shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-stone-100/50">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#2563eb]">
                <Icon size={20} />
              </div>
              <span className="text-[10px] font-bold text-stone-600 tracking-tight mt-1">{label}</span>
            </div>
          ))}
        </div>

        {/* Final CTA */}
        <div className="mt-12 text-center">
          <h2 className="text-[28px] font-extrabold leading-tight text-stone-900">
            Siap Belajar TKA<br />Matematika Lebih Nalar?
          </h2>
          <p className="mt-3 leading-relaxed text-[#666]">
            Tingkatkan pemahaman konsep dan penalaran matematika kamu sekarang juga bersama Nalar Etam.
          </p>
          <Link href="/register">
            <button className="mt-5 h-14 w-full rounded-[18px] bg-[#2563eb] text-[15px] font-bold text-white transition-all duration-300 hover:shadow-lg active:scale-98">
              Daftar Sekarang
            </button>
          </Link>
          <p className="mt-4 text-sm text-[#888]">
            Sudah punya akun?{" "}
            <Link href="/login" className="font-bold text-[#2563eb] hover:underline">Masuk di sini</Link>
          </p>
        </div>

      </div>
    </div>
  );
}
