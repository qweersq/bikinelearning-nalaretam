import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import {
  Heart, HelpCircle, Search, Sparkles, Database,
  GraduationCap, TrendingUp, Coffee, Lock, QrCode, Smile, CheckCircle2
} from "lucide-react";

export default function DonasiPage() {
  return (
    <div className="min-h-screen bg-[#f6f8fc] flex flex-col">
      <Header />
      
      <main className="flex-grow pt-20 pb-20">
        <div className="mx-auto max-w-[768px] px-5">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-rose-50 border border-rose-100 text-rose-500 mb-6 shadow-sm">
              <Heart className="animate-pulse fill-rose-500" size={32} />
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight leading-tight">
              Dukung <span className="bg-gradient-to-r from-[#2563eb] to-rose-500 bg-clip-text text-transparent">Nalar Etam</span>
            </h1>
            <p className="mt-4 text-sm sm:text-base text-stone-600 max-w-xl mx-auto leading-relaxed">
              Platform ini dikembangkan secara mandiri. Dukungan Anda membantu kami memastikan pendidikan matematika yang berkualitas tetap gratis untuk seluruh siswa Indonesia.
            </p>
          </div>

          {/* Mengapa Donasi & Transparansi */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            {/* Mengapa Berdonasi */}
            <div className="bg-white p-6 sm:p-8 rounded-[28px] border border-stone-200/60 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-blue-50 text-[#2563eb] rounded-xl flex items-center justify-center">
                  <HelpCircle size={20} />
                </div>
                <h2 className="text-lg font-bold text-stone-900">Mengapa Berdonasi?</h2>
              </div>
              <p className="text-xs sm:text-sm text-stone-600 mb-5 leading-relaxed">
                Kami tidak memasang iklan yang mengganggu agar fokus belajar siswa tetap terjaga. Donasi Anda disalurkan untuk:
              </p>
              <ul className="space-y-3 text-xs sm:text-sm text-stone-600">
                {[
                  "Pengembangan teknis website & optimasi performa",
                  "Pembuatan simulasi konsep visual interaktif baru",
                  "Produksi materi pembahasan & ilustrasi visual premium",
                  "Subsidi program kelas gratis mingguan komunitas",
                  "Biaya hosting server dan infrastruktur cloud"
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={14} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Transparansi Dana */}
            <div className="bg-gradient-to-b from-[#111827] to-[#0f172a] p-6 sm:p-8 rounded-[28px] border border-white/5 text-white shadow-md">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-white/5 text-blue-400 rounded-xl flex items-center justify-center">
                  <Search size={18} />
                </div>
                <h2 className="text-lg font-bold text-white">Transparansi Dana</h2>
              </div>
              <p className="text-xs sm:text-sm text-white/70 mb-5 leading-relaxed">
                Kepercayaan Anda adalah amanah. Kami berkomitmen menyalurkan donasi secara efisien untuk ekosistem belajar:
              </p>
              
              <div className="space-y-4">
                {[
                  { label: "Operasional Platform & Server", value: "40%", width: "w-[40%]", color: "bg-[#2563eb]" },
                  { label: "Produksi Konten & Simulasi", value: "35%", width: "w-[35%]", color: "bg-emerald-500" },
                  { label: "Program Kelas Gratis & Komunitas", value: "25%", width: "w-[25%]", color: "bg-rose-500" }
                ].map(({ label, value, width, color }) => (
                  <div key={label}>
                    <div className="flex justify-between text-xs mb-1 font-semibold">
                      <span className="text-white/80">{label}</span>
                      <span>{value}</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                      <div className={`${color} h-full rounded-full ${width}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Target Pengembangan */}
          <div className="mb-16">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-stone-900">Target Pengembangan</h2>
              <p className="text-sm text-stone-500 mt-1">Fitur-fitur yang sedang kami persiapkan dengan dukungan donasi Anda.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: Sparkles, color: "text-blue-500 bg-blue-50", title: "Simulasi Interaktif Baru", desc: "Penambahan 20+ simulasi interaktif untuk visualisasi konsep geometri ruang." },
                { icon: Database, color: "text-purple-500 bg-purple-50", title: "Bank Soal TKA Komprehensif", desc: "Database berisi 1.000+ soal latihan tipe penalaran tinggi (HOTS)." },
                { icon: GraduationCap, color: "text-emerald-500 bg-emerald-50", title: "Mentoring Kelas Gratis", desc: "Mentoring online tatap muka gratis secara terjadwal setiap akhir pekan." },
                { icon: TrendingUp, color: "text-amber-500 bg-amber-50", title: "Dashboard Progress Siswa", desc: "Analitik performa personal untuk melacak materi yang belum dikuasai." }
              ].map(({ icon: Icon, color, title, desc }) => (
                <div key={title} className="bg-white p-5 rounded-2xl border border-stone-200/60 transition-colors duration-300 hover:border-stone-300">
                  <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center mb-3`}>
                    <Icon size={18} />
                  </div>
                  <h3 className="text-sm font-bold text-stone-900 mb-1">{title}</h3>
                  <p className="text-xs text-stone-500 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Opsi Donasi */}
          <div className="mb-16">
            <div className="bg-white rounded-[28px] border border-stone-200/60 shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden">
              <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-400">Pilih Metode</span>
                  <h3 className="text-xl font-bold text-stone-900 mt-1 mb-3">Mulai Berdonasi</h3>
                  <p className="text-xs sm:text-sm text-stone-600 mb-6 leading-relaxed">
                    Pilih nominal secara bebas. Anda bisa mendukung kami mulai dari Rp 10.000 melalui e-Wallet (GoPay, OVO, Dana) atau Transfer Bank.
                  </p>
                  
                  <a href="https://saweria.co/" target="_blank" className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-[#E5A93D] text-white px-6 h-12 rounded-xl font-bold hover:bg-[#d6992d] hover:shadow-lg transition-all duration-300 shadow-sm text-sm">
                    <Coffee size={16} />
                    Dukung via Saweria
                  </a>
                  <p className="text-[10px] text-stone-400 mt-3 flex items-center gap-1.5">
                    <Lock size={12} />
                    Transaksi aman difasilitasi oleh payment gateway resmi.
                  </p>
                </div>

                <div className="flex flex-col items-center justify-center p-6 bg-stone-50 rounded-2xl border border-stone-200/60 relative">
                  <div className="absolute -top-3 bg-white px-3 py-0.5 text-[10px] font-bold text-stone-400 border border-stone-200 rounded-full uppercase tracking-wider">
                    Scan QRIS Langsung
                  </div>
                  
                  {/* QRIS SVG Mockup */}
                  <div className="bg-white p-3.5 rounded-xl shadow-sm border border-stone-100 mt-2 mb-3">
                    <div className="w-40 h-40 bg-stone-50 flex flex-col items-center justify-center border border-stone-200/80 rounded-lg relative overflow-hidden">
                      {/* Anchor points */}
                      <div className="absolute top-2.5 left-2.5 w-6 h-6 border-[3px] border-stone-800 rounded-sm"></div>
                      <div className="absolute top-2.5 right-2.5 w-6 h-6 border-[3px] border-stone-800 rounded-sm"></div>
                      <div className="absolute bottom-2.5 left-2.5 w-6 h-6 border-[3px] border-stone-800 rounded-sm"></div>
                      <QrCode className="text-stone-300" size={54} />
                      <span className="text-[9px] text-stone-400 font-bold uppercase tracking-wider mt-1.5">Nalar Etam QRIS</span>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-xs font-bold text-stone-800">Yayasan Nalar Etam Edukasi</p>
                    <p className="text-[10px] text-stone-500">Scan via M-Banking atau e-Wallet favoritmu</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Terima Kasih Quote */}
          <div className="max-w-xl mx-auto text-center">
            <div className="inline-flex text-rose-500 mb-3 text-2xl">
              <Smile size={24} className="fill-rose-100" />
            </div>
            <h3 className="text-base font-bold text-stone-900 mb-2">Terima Kasih, Orang Baik!</h3>
            <p className="text-xs sm:text-sm text-stone-600 italic leading-relaxed">
              &ldquo;Setiap rupiah yang Anda sisihkan adalah bata penyusun fondasi masa depan bagi siswa yang sedang berjuang menembus kampus impian mereka. Nalar Etam tidak akan ada tanpa dukungan Anda.&rdquo;
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
