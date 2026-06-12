import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import {
  Map, CheckCircle2, Calculator, Infinity, Compass,
  TrendingUp, BookOpen, Info, ArrowRight
} from "lucide-react";

export default function RoadmapPage() {
  return (
    <div className="min-h-screen bg-[#f6f8fc] flex flex-col">
      <Header />
      
      <main className="flex-grow pt-20 pb-20">
        <div className="mx-auto max-w-[768px] px-5">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-50 text-[#2563eb] mb-5 shadow-sm">
              <Map size={26} />
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight leading-tight">
              Roadmap Belajar
            </h1>
            <p className="mt-4 text-sm sm:text-base text-stone-600 max-w-xl mx-auto leading-relaxed">
              Alur terstruktur untuk menguasai TKA Matematika berdasarkan Kerangka Asesmen Pusmendik secara bertahap dan mendalam.
            </p>
            <div className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-stone-200 text-stone-700 font-semibold text-xs shadow-sm">
              <CheckCircle2 className="text-emerald-500" size={14} />
              Mengikuti Matriks Asesmen Kemendikdasmen
            </div>
          </div>

          {/* Timeline Path */}
          <div className="relative before:absolute before:bottom-2 before:top-2 before:left-4 before:w-0.5 before:bg-stone-200">
            {[
              {
                bab: "Bab 1",
                title: "Bilangan",
                desc: "Memahami, mengaplikasikan, dan bernalar terkait bilangan real dan sifat-sifatnya sebagai fondasi matematika.",
                icon: Calculator,
                color: "bg-blue-600 text-white",
                borderColor: "hover:border-blue-300",
                topics: ["Jenis-Jenis Bilangan", "Operasi Bilangan", "Pangkat Bulat & Pecahan"]
              },
              {
                bab: "Bab 2",
                title: "Aljabar",
                desc: "Penyelesaian sistem multivariabel, analisis fungsi grafis, dan penerapan praktis konsep barisan/deret.",
                icon: Infinity,
                color: "bg-purple-600 text-white",
                borderColor: "hover:border-purple-300",
                topics: ["SPL & Program Linear", "Fungsi, Invers & Komposisi", "Barisan & Deret (Bunga/Pertumbuhan)"]
              },
              {
                bab: "Bab 3",
                title: "Geometri & Pengukuran",
                desc: "Hubungan garis, bangun ruang dan datar, hingga aplikasi transformasi dan analisis dimensi spasial.",
                icon: Compass,
                color: "bg-emerald-600 text-white",
                borderColor: "hover:border-emerald-300",
                topics: ["Kekongruenan & Pythagoras", "Transformasi Geometri", "Luas, Volume & Jarak Objek"]
              },
              {
                bab: "Bab 4",
                title: "Trigonometri",
                desc: "Analisis komprehensif nilai perbandingan sudut segitiga siku-siku dan grafiknya secara logis.",
                icon: TrendingUp,
                color: "bg-rose-600 text-white",
                borderColor: "hover:border-rose-300",
                topics: ["Sin, Cos, Tan", "Sec, Csc, Cot", "Identitas Trigonometri"]
              },
              {
                bab: "Bab 5",
                title: "Data & Peluang",
                desc: "Penyajian data, pengolahan statistik deskriptif, dan perhitungan aturan peluang kejadian majemuk.",
                icon: BookOpen,
                color: "bg-amber-600 text-white",
                borderColor: "hover:border-amber-300",
                topics: ["Penyajian Data Visual", "Pemusatan & Penyebaran", "Aturan Peluang"]
              }
            ].map(({ bab, title, desc, icon: Icon, color, borderColor, topics }) => (
              <div key={title} className="relative mb-8 last:mb-0 group">
                {/* Timeline dot */}
                <div className={`absolute left-4 top-1.5 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full border-2 border-white ${color} shadow-sm transition-transform duration-300 group-hover:scale-110 z-10`}>
                  <Icon size={14} />
                </div>
                {/* Card content */}
                <div className={`ml-10 rounded-[24px] border border-stone-250 bg-white p-6 shadow-[0_2px_10px_rgba(0,0,0,0.03)] transition-all duration-300 hover:shadow-md ${borderColor}`}>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">{bab}</span>
                  <h3 className="text-lg font-bold text-stone-900 mt-0.5">{title}</h3>
                  <p className="mt-2 text-sm text-stone-600 leading-relaxed mb-4">{desc}</p>
                  
                  {/* Topic Badges */}
                  <div className="flex flex-wrap gap-2">
                    {topics.map((t) => (
                      <span key={t} className="text-xs font-semibold bg-stone-50 text-stone-700 px-3 py-1 rounded-lg border border-stone-150/70">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Info Banner */}
          <div className="mt-12 bg-blue-50/60 border border-blue-100 rounded-2xl p-5 flex gap-3 text-[#2563eb]">
            <Info className="shrink-0 mt-0.5" size={18} />
            <p className="text-sm font-semibold leading-relaxed text-blue-800">
              Setiap bab dirancang untuk diselesaikan secara berurutan agar pemahamanmu saling terhubung dan terstruktur dengan sempurna.
            </p>
          </div>

          {/* CTA */}
          <div className="mt-16 text-center">
            <h2 className="text-2xl font-extrabold text-stone-900 tracking-tight">Siap Melangkah Sesuai Roadmap?</h2>
            <p className="mt-2 text-sm text-stone-600 leading-relaxed">
              Mulai belajar dari Bab 1 hari ini juga dan kuasai konsepnya secara mendalam.
            </p>
            <Link href="/register" className="mt-5 inline-flex items-center justify-center gap-2 bg-[#2563eb] text-white px-8 h-12 rounded-xl font-bold hover:bg-blue-600 active:scale-98 transition-all shadow-md">
              Daftar Kelas & Mulai Belajar
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
