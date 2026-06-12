import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import {
  GraduationCap, CheckCircle2, Layers, BookOpen,
  MessageCircle, Calendar, Video, ChevronDown, ArrowRight,
  PencilLine, ShieldAlert, Award
} from "lucide-react";

export default function KelasGratisPage() {
  return (
    <div className="min-h-screen bg-[#f6f8fc] flex flex-col">
      <Header />
      
      <main className="flex-grow pt-20 pb-20">
        <div className="mx-auto max-w-[768px] px-5">
          {/* Hero Section */}
          <div className="text-center mb-16 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-emerald-100/50 rounded-full blur-3xl opacity-60 -z-10" />
            
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-500 mb-6 shadow-sm rotate-3">
              <GraduationCap size={28} />
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight leading-tight">
              Program <span className="bg-gradient-to-r from-emerald-500 to-[#2563eb] bg-clip-text text-transparent">Kelas Gratis</span>
            </h1>
            <p className="mt-4 text-sm sm:text-base text-stone-600 max-w-xl mx-auto leading-relaxed">
              Belajar matematika bersama tanpa biaya. Kesempatan terbuka lebar untuk semua siswa yang memiliki tekad kuat menembus kampus impian.
            </p>
          </div>

          {/* Tentang Program */}
          <div className="bg-white p-6 sm:p-8 rounded-[28px] border border-stone-200/60 shadow-[0_4px_20px_rgba(0,0,0,0.02)] mb-12 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />
            <h2 className="text-lg font-bold text-stone-900 mb-3">Tentang Program Ini</h2>
            <p className="text-sm text-stone-600 leading-relaxed">
              Kami percaya bahwa pendidikan berkualitas bukanlah hak eksklusif bagi mereka yang mampu membayar mahal. Program ini didedikasikan secara khusus agar siswa yang memiliki keterbatasan finansial tetap mendapatkan pendampingan belajar TKA Matematika yang setara dan bermutu tinggi.
            </p>
          </div>

          {/* Benefits & Audience */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            {/* Benefit Utama */}
            <div>
              <h3 className="text-base font-bold text-stone-900 mb-4 flex items-center gap-2">
                <Award className="text-amber-500" size={18} /> Benefit Program
              </h3>
              <div className="space-y-3">
                {[
                  { title: "Pembelajaran Terstruktur", desc: "Mengikuti kurikulum berjenjang dari dasar.", icon: Layers },
                  { title: "Materi TKA Komplit", desc: "Akses lengkap pembahasan semua bab.", icon: BookOpen },
                  { title: "Sesi Diskusi Interaktif", desc: "Tanya jawab langsung dengan tutor & komunitas.", icon: MessageCircle }
                ].map(({ title, desc, icon: Icon }) => (
                  <div key={title} className="bg-white p-4 rounded-xl border border-stone-200/60 flex items-start gap-3.5 shadow-sm">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#2563eb] flex items-center justify-center shrink-0 mt-0.5">
                      <Icon size={16} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-stone-850">{title}</h4>
                      <p className="text-xs text-stone-500 mt-0.5">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Siapa yang Cocok */}
            <div className="bg-[#111827] rounded-[28px] p-6 sm:p-8 text-white shadow-lg flex flex-col justify-center border border-white/5">
              <h3 className="text-base font-bold mb-4 text-emerald-400 flex items-center gap-2">
                <CheckCircle2 size={16} /> Siapa yang cocok bergabung?
              </h3>
              <ul className="space-y-3 text-xs sm:text-sm text-white/80">
                {[
                  "Siswa aktif SMA/MA/SMK sederajat",
                  "Alumni / Gap Year pejuang UTBK",
                  "Siswa yang sedang mempersiapkan diri menghadapi TKA Matematika",
                  "Siswa yang memiliki keterbatasan finansial namun bertekad kuat"
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 bg-white/5 p-3 rounded-xl border border-white/5">
                    <CheckCircle2 className="text-emerald-400 shrink-0 mt-0.5" size={14} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Mekanisme Bergabung */}
          <div className="mb-16">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-stone-900">Mekanisme Bergabung</h2>
              <p className="text-sm text-stone-500 mt-1">4 langkah mudah untuk memulai perjalanan belajarmu.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              {[
                { step: "1", title: "Isi Formulir", desc: "Daftar melalui formulir online yang disediakan." },
                { step: "2", title: "Seleksi Cepat", desc: "Review singkat untuk memastikan kuota tepat sasaran." },
                { step: "3", title: "Masuk Grup", desc: "Bergabung ke komunitas via tautan undangan resmi." },
                { step: "4", title: "Mulai Kelas", desc: "Akses materi dan ikuti live class akhir pekan." }
              ].map(({ step, title, desc }) => (
                <div key={step} className="bg-white p-5 rounded-2xl border border-stone-200/60 text-center relative flex flex-col items-center">
                  <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center text-sm font-black mb-3 border border-emerald-100">
                    {step}
                  </div>
                  <h4 className="text-sm font-bold text-stone-900 mb-1">{title}</h4>
                  <p className="text-xs text-stone-500 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Jadwal & FAQ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {/* Jadwal */}
            <div>
              <h3 className="text-base font-bold text-stone-900 mb-4 flex items-center gap-2">
                <Calendar className="text-[#2563eb]" size={18} /> Jadwal Kelas
              </h3>
              <div className="bg-gradient-to-b from-[#2563eb] to-[#1d4ed8] rounded-[28px] p-6 text-white text-center flex flex-col justify-center h-[280px] border border-blue-400/20 shadow-md">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Video size={20} className="text-white" />
                </div>
                <h4 className="text-lg font-bold mb-1">Reguler Akhir Pekan</h4>
                <div className="bg-white/20 px-4 py-1.5 rounded-lg font-mono text-lg mb-3 inline-block backdrop-blur-sm mx-auto font-bold">
                  15.00 - 16.30 WIB
                </div>
                <p className="text-blue-100 text-xs font-semibold mb-2">Setiap Sabtu & Minggu</p>
                <p className="text-[10px] text-blue-200">Live Interactive via Zoom / Google Meet</p>
              </div>
            </div>

            {/* FAQ */}
            <div>
              <h3 className="text-base font-bold text-stone-900 mb-4 flex items-center gap-2">
                <MessageCircle className="text-emerald-500" size={18} /> Tanya Jawab (FAQ)
              </h3>
              <div className="space-y-3">
                {[
                  { q: "Apakah benar-benar 100% gratis?", a: "Ya, mutlak gratis. Tidak ada biaya pendaftaran, biaya bulanan, ataupun biaya tersembunyi lainnya." },
                  { q: "Apakah wajib membeli modul cetak?", a: "Tidak. Semua modul bacaan, simulasi interaktif, dan latihan soal disediakan digital dan dapat diakses bebas di website." },
                  { q: "Apakah luar daerah bisa ikut?", a: "Tentu saja. Selama Anda memiliki koneksi internet stabil, Anda bisa bergabung dari mana saja di seluruh Indonesia." }
                ].map(({ q, a }, idx) => (
                  <details key={idx} className="bg-white border border-stone-200/60 rounded-2xl group cursor-pointer shadow-sm overflow-hidden" open={idx === 0}>
                    <summary className="font-bold text-xs sm:text-sm text-stone-850 p-4 flex justify-between items-center outline-none select-none">
                      {q}
                      <ChevronDown size={14} className="text-stone-400 group-open:rotate-180 transition-transform" />
                    </summary>
                    <div className="px-4 pb-4 text-xs sm:text-sm text-stone-600 border-t border-stone-100 pt-3 leading-relaxed">
                      {a}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <div className="bg-gradient-to-b from-emerald-50/50 to-emerald-100/40 p-8 sm:p-10 rounded-[30px] border border-emerald-250 shadow-inner relative overflow-hidden">
              <div className="absolute top-0 right-0 w-60 h-60 bg-white rounded-full blur-3xl opacity-60 pointer-events-none"></div>
              
              <h2 className="text-2xl font-bold text-stone-900 mb-2 relative z-10">Ambil langkah pertamamu hari ini!</h2>
              <p className="text-sm text-stone-600 mb-8 max-w-md mx-auto leading-relaxed relative z-10">
                Kuota untuk gelombang berikutnya terbatas. Segera daftarkan diri dan bersiap kuasai TKA Matematika bersama.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-3 relative z-10">
                <Link href="/register" className="w-full sm:w-auto">
                  <button className="w-full bg-emerald-500 text-white h-12 px-8 rounded-xl font-bold hover:bg-emerald-600 transition-all text-sm shadow-md flex items-center justify-center gap-2">
                    <PencilLine size={14} />
                    Daftar Sekarang
                  </button>
                </Link>
                <a href="https://wa.me/" target="_blank" className="w-full sm:w-auto">
                  <button className="w-full bg-white text-emerald-700 border border-emerald-200 h-12 px-8 rounded-xl font-bold hover:border-emerald-500 transition-all text-sm shadow-sm">
                    Hubungi via WhatsApp
                  </button>
                </a>
              </div>
              <p className="text-[10px] text-stone-400 mt-5 relative z-10">*Tombol Daftar akan mengarahkan ke halaman pendaftaran akun Nalar Etam.</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
