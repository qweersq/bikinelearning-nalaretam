import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import {
  CheckCircle2, Calculator, Infinity, Compass,
  BookOpen, ChevronRight, ArrowRight
} from "lucide-react";

export default function MateriPage() {
  return (
    <div className="min-h-screen bg-[#f6f8fc] flex flex-col">
      <Header />
      
      <main className="flex-grow pt-20 pb-20">
        <div className="mx-auto max-w-[768px] px-5">
          {/* Badge & Title */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-stone-200 text-stone-700 font-semibold text-xs mb-5 shadow-sm">
              <CheckCircle2 className="text-emerald-500" size={16} />
              Sesuai Kerangka Asesmen TKA Pusmendik
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight leading-tight">
              Cakupan Materi <span className="text-[#2563eb]">TKA Matematika</span>
            </h1>
            <p className="mt-4 text-sm sm:text-base text-stone-600 max-w-xl mx-auto leading-relaxed">
              Daftar lengkap topik yang akan kamu pelajari di Nalar Etam. Tidak ada materi hafalan yang terbuang percuma, semuanya terfokus pada kompetensi resmi.
            </p>
          </div>

          <div className="space-y-8">
            {/* BAB 1: BILANGAN */}
            <div className="bg-white rounded-[28px] border border-blue-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgba(37,99,235,0.05)]">
              <div className="bg-blue-50/50 border-b border-blue-50 p-6 sm:p-8 flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-xl font-black shadow-md shadow-blue-500/20 shrink-0">
                  1
                </div>
                <div>
                  <h2 className="text-xl font-bold text-blue-900">Bilangan</h2>
                  <p className="text-xs sm:text-sm text-blue-800/80 font-semibold mt-0.5">Memahami, mengaplikasikan, dan bernalar terkait bilangan real.</p>
                </div>
              </div>
              <div className="p-6 sm:p-8">
                <h3 className="text-sm font-bold text-stone-850 mb-4 flex items-center gap-2">
                  <Calculator className="text-blue-600" size={16} /> Bilangan Real
                </h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-stone-600 text-xs sm:text-sm">
                  {[
                    "Jenis bilangan",
                    "Sifat bilangan",
                    "Operasi bilangan",
                    "Operasi campuran",
                    "Bilangan berpangkat bulat",
                    "Bilangan berpangkat pecahan",
                    "Bentuk akar",
                  ].map((topic) => (
                    <li key={topic} className="flex items-center gap-2">
                      <ChevronRight className="text-blue-400 shrink-0" size={14} />
                      <span>{topic}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* BAB 2: ALJABAR */}
            <div className="bg-white rounded-[28px] border border-purple-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgba(147,51,234,0.05)]">
              <div className="bg-purple-50/50 border-b border-purple-50 p-6 sm:p-8 flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-600 text-white rounded-2xl flex items-center justify-center text-xl font-black shadow-md shadow-purple-500/20 shrink-0">
                  2
                </div>
                <div>
                  <h2 className="text-xl font-bold text-purple-900">Aljabar</h2>
                  <p className="text-xs sm:text-sm text-purple-800/80 font-semibold mt-0.5">Fungsi, sistem persamaan, serta pola barisan dan deret.</p>
                </div>
              </div>
              <div className="p-6 sm:p-8 space-y-6">
                {/* A. Persamaan */}
                <div className="bg-stone-50/50 p-5 rounded-2xl border border-stone-100">
                  <h3 className="text-sm font-bold text-stone-850 mb-3 border-b border-stone-200/60 pb-1.5 flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-100 text-purple-700 text-[10px] font-bold">A</span>
                    Persamaan & Pertidaksamaan Linear
                  </h3>
                  <ul className="space-y-2 text-stone-600 text-xs sm:text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="text-purple-500 shrink-0 mt-0.5" size={14} />
                      <span>Sistem Persamaan Linear Multivariabel (maks 3 variabel)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="text-purple-500 shrink-0 mt-0.5" size={14} />
                      <span>Sistem Pertidaksamaan Linear Multivariabel (maks 3 variabel)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="text-purple-500 shrink-0 mt-0.5" size={14} />
                      <span>Program Linear</span>
                    </li>
                  </ul>
                </div>

                {/* B. Fungsi */}
                <div className="bg-stone-50/50 p-5 rounded-2xl border border-stone-100">
                  <h3 className="text-sm font-bold text-stone-850 mb-3 border-b border-stone-200/60 pb-1.5 flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-100 text-purple-700 text-[10px] font-bold">B</span>
                    Fungsi
                  </h3>
                  <ul className="space-y-2 text-stone-600 text-xs sm:text-sm">
                    {[
                      "Domain, Kodomain, Range",
                      "Fungsi Linear, Kuadrat, Rasional",
                      "Representasi Fungsi secara analitis & grafis",
                      "Invers Fungsi",
                      "Komposisi Fungsi",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <CheckCircle2 className="text-purple-500 shrink-0 mt-0.5" size={14} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* C. Barisan */}
                <div className="bg-stone-50/50 p-5 rounded-2xl border border-stone-100">
                  <h3 className="text-sm font-bold text-stone-850 mb-3 border-b border-stone-200/60 pb-1.5 flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-100 text-purple-700 text-[10px] font-bold">C</span>
                    Barisan & Deret
                  </h3>
                  <ul className="space-y-2 text-stone-600 text-xs sm:text-sm">
                    {[
                      "Barisan & Deret Aritmetika",
                      "Barisan & Deret Geometri",
                      "Pertumbuhan & Peluruhan",
                      "Bunga Tunggal & Majemuk",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <CheckCircle2 className="text-purple-500 shrink-0 mt-0.5" size={14} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* BAB 3: GEOMETRI DAN PENGUKURAN */}
            <div className="bg-white rounded-[28px] border border-emerald-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgba(16,185,129,0.05)]">
              <div className="bg-emerald-50/50 border-b border-emerald-50 p-6 sm:p-8 flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center text-xl font-black shadow-md shadow-emerald-500/20 shrink-0">
                  3
                </div>
                <div>
                  <h2 className="text-xl font-bold text-emerald-900">Geometri dan Pengukuran</h2>
                  <p className="text-xs sm:text-sm text-emerald-800/80 font-semibold mt-0.5">Relasi objek spasial, transformasi, dan pemecahan masalah dimensi.</p>
                </div>
              </div>
              <div className="p-6 sm:p-8 space-y-6">
                {/* A. Objek Geometri */}
                <div className="bg-stone-50/50 p-5 rounded-2xl border border-stone-100">
                  <h3 className="text-sm font-bold text-stone-850 mb-3 border-b border-stone-200/60 pb-1.5 flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">A</span>
                    Objek Geometri
                  </h3>
                  <ul className="space-y-2 text-stone-600 text-xs sm:text-sm">
                    {[
                      "Hubungan sudut, garis, dan bidang",
                      "Bangun datar (Segitiga, Segiempat, Lingkaran, Gabungan)",
                      "Bangun ruang (Sisi datar, Sisi lengkung)",
                      "Kesebangunan & Kekongruenan",
                      "Teorema Pythagoras",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={14} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* B. Transformasi Geometri */}
                <div className="bg-stone-50/50 p-5 rounded-2xl border border-stone-100">
                  <h3 className="text-sm font-bold text-stone-850 mb-3 border-b border-stone-200/60 pb-1.5 flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">B</span>
                    Transformasi Geometri
                  </h3>
                  <ul className="space-y-2 text-stone-600 text-xs sm:text-sm">
                    {[
                      "Translasi (Pergeseran) & Refleksi (Pencerminan)",
                      "Rotasi (Perputaran) & Dilatasi (Perkalian)",
                      "Komposisi transformasi geometri",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={14} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* C. Pengukuran */}
                <div className="bg-stone-50/50 p-5 rounded-2xl border border-stone-100">
                  <h3 className="text-sm font-bold text-stone-850 mb-3 border-b border-stone-200/60 pb-1.5 flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">C</span>
                    Pengukuran
                  </h3>
                  <ul className="space-y-2 text-stone-600 text-xs sm:text-sm">
                    {[
                      "Keliling & Luas bangun datar",
                      "Volume & Luas permukaan ruang",
                      "Jarak (dua titik, titik ke garis/bidang, dua garis/bidang)",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={14} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* BAB 4: TRIGONOMETRI */}
            <div className="bg-white rounded-[28px] border border-rose-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgba(244,63,94,0.05)]">
              <div className="bg-rose-50/50 border-b border-rose-50 p-6 sm:p-8 flex items-center gap-4">
                <div className="w-12 h-12 bg-rose-500 text-white rounded-2xl flex items-center justify-center text-xl font-black shadow-md shadow-rose-500/20 shrink-0">
                  4
                </div>
                <div>
                  <h2 className="text-xl font-bold text-rose-900">Trigonometri</h2>
                  <p className="text-xs sm:text-sm text-rose-800/80 font-semibold mt-0.5">Analisis perbandingan dan rasio sudut.</p>
                </div>
              </div>
              <div className="p-6 sm:p-8">
                <h3 className="text-sm font-bold text-stone-850 mb-4 flex items-center gap-2">
                  <Compass className="text-rose-600" size={16} /> Rasio & Fungsi Trigonometri
                </h3>
                <div className="flex flex-wrap gap-2.5">
                  {["Sinus (Sin)", "Cosinus (Cos)", "Tangen (Tan)", "Cotangen (Cot)", "Secan (Sec)", "Cosecan (Csc)"].map((item) => (
                    <span key={item} className="px-4 py-2 bg-rose-50 text-rose-700 border border-rose-100 rounded-xl text-xs sm:text-sm font-semibold">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* BAB 5: DATA DAN PELUANG */}
            <div className="bg-white rounded-[28px] border border-amber-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgba(245,158,11,0.05)]">
              <div className="bg-amber-50/50 border-b border-amber-50 p-6 sm:p-8 flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-500 text-white rounded-2xl flex items-center justify-center text-xl font-black shadow-md shadow-amber-500/20 shrink-0">
                  5
                </div>
                <div>
                  <h2 className="text-xl font-bold text-amber-900">Data dan Peluang</h2>
                  <p className="text-xs sm:text-sm text-amber-800/80 font-semibold mt-0.5">Pengolahan statistik dan analisis probabilitas kejadian.</p>
                </div>
              </div>
              <div className="p-6 sm:p-8 space-y-6">
                {/* A. Data */}
                <div className="bg-stone-50/50 p-5 rounded-2xl border border-stone-100">
                  <h3 className="text-sm font-bold text-stone-850 mb-3 border-b border-stone-200/60 pb-1.5 flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold">A</span>
                    Data (Statistika)
                  </h3>
                  <ul className="space-y-2 text-stone-600 text-xs sm:text-sm">
                    {[
                      "Diagram (batang, garis, lingkaran, grafik, tabel)",
                      "Visualisasi data",
                      "Ukuran pemusatan data (Mean, Median, Modus)",
                      "Ukuran penyebaran data",
                      "Data tunggal & Data kelompok",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <CheckCircle2 className="text-amber-500 shrink-0 mt-0.5" size={14} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* B. Peluang */}
                <div className="bg-stone-50/50 p-5 rounded-2xl border border-stone-100">
                  <h3 className="text-sm font-bold text-stone-850 mb-3 border-b border-stone-200/60 pb-1.5 flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold">B</span>
                    Peluang
                  </h3>
                  <ul className="space-y-2 text-stone-600 text-xs sm:text-sm">
                    {[
                      "Kaidah pencacahan",
                      "Permutasi & Kombinasi",
                      "Peluang kejadian tunggal & majemuk",
                      "Frekuensi harapan",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <CheckCircle2 className="text-amber-500 shrink-0 mt-0.5" size={14} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* CTA SECTION */}
          <div className="mt-16 text-center">
            <div className="bg-gradient-to-b from-[#111827] to-[#0f172a] p-8 sm:p-10 rounded-[30px] shadow-xl text-white relative overflow-hidden border border-white/5">
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#2563eb]/20 rounded-full blur-3xl opacity-50"></div>
              
              <h2 className="text-2xl sm:text-3xl font-extrabold mb-4 relative z-10">Siap untuk memulai?</h2>
              <p className="text-white/70 mb-8 max-w-md mx-auto text-sm sm:text-base leading-relaxed relative z-10">
                Mari mulai perjalanan belajarmu dari fondasi paling dasar. Kuasai konsep Bilangan sebelum melangkah lebih jauh.
              </p>
              
              <Link href="/register">
                <button className="inline-flex items-center justify-center gap-2 bg-[#2563eb] text-white px-8 h-14 rounded-2xl font-bold hover:bg-[#3b82f6] hover:shadow-[0_4px_20px_rgba(37,99,235,0.4)] active:scale-98 transition-all duration-300 relative z-10 w-full sm:w-auto">
                  Mulai Belajar Bab 1: Bilangan
                  <ArrowRight size={16} />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
