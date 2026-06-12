import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import {
  Users, User, BookOpen, CheckCircle2, Phone,
  MessageSquare, HelpCircle, ArrowRight, ClipboardList, Flame
} from "lucide-react";
import { getSession } from "@/lib/auth";

export default async function ProgramPage() {
  const session = await getSession();
  return (
    <div className="min-h-screen bg-[#f6f8fc] flex flex-col">
      <Header />
      
      <main className="flex-grow pt-20 pb-20">
        <div className="mx-auto max-w-[768px] px-5">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight leading-tight">
              Program <span className="bg-gradient-to-r from-[#2563eb] to-[#3b82f6] bg-clip-text text-transparent">Nalar Etam</span>
            </h1>
            <p className="mt-4 text-sm sm:text-base text-stone-600 max-w-xl mx-auto leading-relaxed">
              Belajar matematika dengan nalar, bukan hafalan. Pilih jalur belajar yang paling sesuai dengan kebutuhan dan target persiapan UTBK kamu.
            </p>
          </div>

          {/* Program Gratis */}
          <div className="mb-14">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-px bg-stone-200 flex-grow"></div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-stone-400 px-3">
                Program Gratis
              </h2>
              <div className="h-px bg-stone-200 flex-grow"></div>
            </div>

            <div className="bg-white rounded-[28px] border border-blue-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden relative transition-all duration-300 hover:shadow-[0_8px_30px_rgba(37,99,235,0.05)]">
              <div className="absolute top-0 right-0 bg-blue-50 text-[#2563eb] font-bold text-[10px] px-4 py-1.5 rounded-bl-2xl uppercase tracking-wider">
                Kuota: Maks 50 Peserta
              </div>
              <div className="p-6 sm:p-8">
                <div className="w-12 h-12 bg-blue-50 text-[#2563eb] rounded-2xl flex items-center justify-center text-xl mb-5 mt-2">
                  <BookOpen size={22} />
                </div>
                <h3 className="text-xl font-bold text-stone-900 mb-2">Kelas Gratis</h3>
                <p className="text-sm text-stone-600 mb-6 leading-relaxed">
                  Akses ke kelas pembelajaran interaktif untuk membangun konsep dari dasar tanpa batasan finansial.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-5 border-t border-stone-100">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3">Cocok untuk:</h4>
                    <ul className="space-y-2 text-stone-600 text-xs sm:text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={14} />
                        <span>Siswa yang ingin belajar bersama komunitas</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={14} />
                        <span>Siswa dengan keterbatasan finansial</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={14} />
                        <span>Siswa yang ingin mencoba metode Nalar Etam</span>
                      </li>
                    </ul>
                  </div>
                  <div className="bg-stone-50/50 p-5 rounded-2xl border border-stone-100/60">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3">Fasilitas kelas:</h4>
                    <ul className="grid grid-cols-2 gap-x-2 gap-y-2 text-stone-700 text-xs font-semibold">
                      <li>• Materi belajar</li>
                      <li>• Pembahasan soal</li>
                      <li>• Diskusi grup</li>
                      <li>• Akses komunitas</li>
                      <li className="col-span-2">• Roadmap belajar TKA</li>
                    </ul>
                  </div>
                </div>
                <div className="mt-6 pt-5 border-t border-stone-100 flex justify-end">
                  <Link href="/kelas-gratis" className="w-full sm:w-auto">
                    <button className="w-full bg-stone-900 hover:bg-stone-850 text-white h-11 px-6 rounded-xl font-bold transition-all text-xs sm:text-sm shadow-sm flex items-center justify-center gap-1.5 cursor-pointer">
                      Detail Kelas Gratis
                      <ArrowRight size={14} />
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Program Berbayar */}
          <div className="mb-14">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-px bg-stone-200 flex-grow"></div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-stone-400 px-3">
                Program Berbayar
              </h2>
              <div className="h-px bg-stone-200 flex-grow"></div>
            </div>

            <div className="space-y-6">
              {/* Kelas Group */}
              <div className="bg-white p-6 sm:p-8 rounded-[28px] border border-stone-200/60 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-md transition-all relative">
                <div className="absolute top-4 right-4 bg-stone-100 text-stone-600 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Maks 5 Siswa
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-stone-400">Pilihan Terjangkau</span>
                <h3 className="text-xl font-bold text-stone-900 mt-1 mb-2">Kelas Group</h3>
                <div className="mb-5 flex items-baseline gap-1.5">
                  <span className="text-2xl sm:text-3xl font-black text-[#2563eb]">Rp 30.000</span>
                  <span className="text-xs text-stone-400">/ jam per siswa</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-stone-100">
                  <ul className="space-y-2 text-stone-600 text-xs sm:text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={14} />
                      <span>Lebih interaktif dibanding kelas besar</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={14} />
                      <span>Sesi diskusi tanya-jawab terarah</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={14} />
                      <span>Belajar seru bersama teman kelompok</span>
                    </li>
                  </ul>
                  <div className="bg-stone-50 p-4 rounded-xl text-xs sm:text-sm text-stone-600 border border-stone-100">
                    <span className="font-bold text-stone-850 block mb-1">Cocok untuk:</span>
                    Persiapan TKA dasar, evaluasi PR sekolah, dan latihan rutin mingguan bersama kelompok belajar.
                  </div>
                </div>
                <div className="mt-6 pt-5 border-t border-stone-100 flex justify-end">
                  <Link href={session ? "/checkout?program=group" : "/register?program=group"} className="w-full sm:w-auto">
                    <button className="w-full bg-[#2563eb] hover:bg-blue-600 text-white h-11 px-6 rounded-xl font-bold transition-all text-xs sm:text-sm shadow-sm flex items-center justify-center gap-1.5 cursor-pointer">
                      Pilih Program Group
                      <ArrowRight size={14} />
                    </button>
                  </Link>
                </div>
              </div>

              {/* Kelas Semiprivat */}
              <div className="bg-gradient-to-b from-[#111827] to-[#0f172a] p-6 sm:p-8 rounded-[28px] border border-white/5 shadow-xl text-white relative overflow-hidden">
                <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-[#2563eb]/20 blur-2xl" />
                <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-950 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm">
                  <Flame size={10} />
                  Maks 2 Siswa
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#2563eb]">Paling Populer</span>
                <h3 className="text-xl font-bold text-white mt-1 mb-2">Kelas Semiprivat</h3>
                <div className="mb-5 flex items-baseline gap-1.5">
                  <span className="text-2xl sm:text-3xl font-black text-white">Rp 60.000</span>
                  <span className="text-xs text-white/50">/ jam per siswa</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/10 relative z-10">
                  <ul className="space-y-2 text-white/80 text-xs sm:text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="text-blue-400 shrink-0 mt-0.5" size={14} />
                      <span>Pendampingan konsep lebih intensif</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="text-blue-400 shrink-0 mt-0.5" size={14} />
                      <span>Fokus pembelajaran personal & terarah</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="text-blue-400 shrink-0 mt-0.5" size={14} />
                      <span>Alur belajar mengikuti progres siswa</span>
                    </li>
                  </ul>
                  <div className="bg-white/5 p-4 rounded-xl text-xs sm:text-sm text-white/80 border border-white/5">
                    <span className="font-bold text-white block mb-1">Cocok untuk:</span>
                    Siswa yang butuh bimbingan intens, belajar bersama sahabat, dan mengejar materi TKA yang tertinggal.
                  </div>
                </div>
                <div className="mt-6 pt-5 border-t border-white/10 flex justify-end relative z-10">
                  <Link href={session ? "/checkout?program=semiprivat" : "/register?program=semiprivat"} className="w-full sm:w-auto">
                    <button className="w-full bg-white hover:bg-stone-100 text-stone-900 h-11 px-6 rounded-xl font-bold transition-all text-xs sm:text-sm shadow-md flex items-center justify-center gap-1.5 cursor-pointer">
                      Pilih Program Semiprivat
                      <ArrowRight size={14} />
                    </button>
                  </Link>
                </div>
              </div>

              {/* Kelas Privat */}
              <div className="bg-white p-6 sm:p-8 rounded-[28px] border border-stone-200/60 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-md transition-all relative">
                <div className="absolute top-4 right-4 bg-stone-900 text-stone-100 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Eksklusif (1 Siswa)
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-stone-400">Fokus Maksimal</span>
                <h3 className="text-xl font-bold text-stone-900 mt-1 mb-2">Kelas Privat</h3>
                <div className="mb-5 flex items-baseline gap-1.5">
                  <span className="text-2xl sm:text-3xl font-black text-stone-900">Rp 100.000</span>
                  <span className="text-xs text-stone-400">/ jam</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-stone-100">
                  <ul className="space-y-2 text-stone-600 text-xs sm:text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={14} />
                      <span>Perhatian guru terpusat 100% pada siswa</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={14} />
                      <span>Evaluasi rutin dan strategi personal</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={14} />
                      <span>Jadwal belajar sangat fleksibel</span>
                    </li>
                  </ul>
                  <div className="bg-stone-50 p-4 rounded-xl text-xs sm:text-sm text-stone-600 border border-stone-100">
                    <span className="font-bold text-stone-850 block mb-1">Cocok untuk:</span>
                    Persiapan UTBK intensif, pendampingan belajar materi berat, dan bimbingan akademik jangka panjang.
                  </div>
                </div>
                <div className="mt-6 pt-5 border-t border-stone-100 flex justify-end">
                  <Link href={session ? "/checkout?program=privat" : "/register?program=privat"} className="w-full sm:w-auto">
                    <button className="w-full bg-[#2563eb] hover:bg-blue-600 text-white h-11 px-6 rounded-xl font-bold transition-all text-xs sm:text-sm shadow-sm flex items-center justify-center gap-1.5 cursor-pointer">
                      Pilih Program Privat
                      <ArrowRight size={14} />
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Perbandingan Program Table */}
          <div className="mb-16">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-stone-900">Perbandingan Program</h2>
              <p className="text-sm text-stone-500 mt-1">Ringkasan singkat untuk membantumu memilih dengan tepat.</p>
            </div>
            
            <div className="overflow-x-auto bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-stone-200/60">
              <table className="w-full text-left border-collapse min-w-[550px]">
                <thead>
                  <tr className="bg-stone-50/50 border-b border-stone-200/60 text-stone-800 text-xs sm:text-sm">
                    <th className="p-4 sm:p-5 font-bold w-1/4">Program</th>
                    <th className="p-4 sm:p-5 font-bold w-1/4">Biaya</th>
                    <th className="p-4 sm:p-5 font-bold w-1/4">Kuota</th>
                    <th className="p-4 sm:p-5 font-bold w-1/4">Keunggulan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-xs sm:text-sm text-stone-600">
                  <tr className="hover:bg-stone-50/30 transition-colors">
                    <td className="p-4 sm:p-5 font-bold text-[#2563eb]">Kelas Gratis</td>
                    <td className="p-4 sm:p-5">
                      <span className="bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        GRATIS
                      </span>
                    </td>
                    <td className="p-4 sm:p-5">Maks 50 siswa</td>
                    <td className="p-4 sm:p-5">Belajar dalam komunitas</td>
                  </tr>
                  <tr className="hover:bg-stone-50/30 transition-colors">
                    <td className="p-4 sm:p-5 font-bold text-stone-800">Kelas Group</td>
                    <td className="p-4 sm:p-5 font-semibold text-stone-800">Rp 30.000<span className="text-stone-400 font-normal">/jam</span></td>
                    <td className="p-4 sm:p-5">Maks 5 siswa</td>
                    <td className="p-4 sm:p-5">Bisa belajar bareng teman</td>
                  </tr>
                  <tr className="hover:bg-blue-50/10 bg-blue-50/5 transition-colors">
                    <td className="p-4 sm:p-5 font-bold text-[#2563eb]">Kelas Semiprivat</td>
                    <td className="p-4 sm:p-5 font-semibold text-stone-800">Rp 60.000<span className="text-stone-400 font-normal">/jam</span></td>
                    <td className="p-4 sm:p-5">Maks 2 siswa</td>
                    <td className="p-4 sm:p-5 font-semibold text-[#2563eb]">Pendampingan terarah</td>
                  </tr>
                  <tr className="hover:bg-stone-50/30 transition-colors">
                    <td className="p-4 sm:p-5 font-bold text-stone-800">Kelas Privat</td>
                    <td className="p-4 sm:p-5 font-semibold text-stone-800">Rp 100.000<span className="text-stone-400 font-normal">/jam</span></td>
                    <td className="p-4 sm:p-5">1 siswa (Eksklusif)</td>
                    <td className="p-4 sm:p-5">Fokus penuh 100%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* CTA Box */}
          <div className="text-center">
            <div className="bg-gradient-to-b from-blue-50/60 to-blue-100/40 p-8 sm:p-10 rounded-[30px] border border-blue-200/50 shadow-inner relative overflow-hidden">
              <div className="absolute top-0 right-0 w-60 h-60 bg-white rounded-full blur-3xl opacity-60 pointer-events-none"></div>
              
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-2xl text-[#2563eb] shadow-md mx-auto mb-5 relative z-10">
                <HelpCircle size={24} />
              </div>
              <h2 className="text-2xl font-bold text-stone-900 mb-2 relative z-10">Masih bingung memilih program?</h2>
              <p className="text-sm sm:text-base text-stone-600 mb-8 max-w-md mx-auto leading-relaxed relative z-10">
                Hubungi kami untuk mendapatkan rekomendasi program belajar yang paling sesuai dengan kebutuhan dan target UTBK kamu.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-3 relative z-10">
                <Link href="/kelas-gratis" className="w-full sm:w-auto">
                  <button className="w-full bg-stone-900 text-white h-12 px-6 rounded-xl font-bold hover:bg-stone-850 transition-all text-sm shadow-md">
                    Daftar Kelas Gratis
                  </button>
                </Link>
                <a href="https://wa.me/" target="_blank" className="w-full sm:w-auto">
                  <button className="w-full bg-[#2563eb] text-white h-12 px-6 rounded-xl font-bold hover:bg-blue-600 transition-all text-sm shadow-md flex items-center justify-center gap-2">
                    <Phone size={14} />
                    Konsultasi Program
                  </button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
