import Logo from "@/components/ui/Logo";
import Link from "next/link";

const sections = [
  {
    title: "Platform",
    links: [
      { label: "Materi", href: "/materi" },
      { label: "Program", href: "/program" },
      { label: "Roadmap", href: "/roadmap" },
    ],
  },
  {
    title: "Akun",
    links: [
      { label: "Masuk", href: "/login" },
      { label: "Daftar", href: "/register" },
      { label: "Dashboard", href: "/dashboard" },
    ],
  },
  {
    title: "Bantuan",
    links: [
      { label: "FAQ", href: "/#faq" },
      { label: "Hubungi Kami", href: "mailto:halo@nalaretam.com" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-stone-200 bg-white">
      <div className="mx-auto max-w-[768px] px-5 py-14">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <Logo size="sm" />
            <p className="mt-3 text-sm leading-relaxed text-stone-500">
              Platform belajar UTBK TKA Matematika yang melatih pemahaman konsep berbasis penalaran dan visualisasi.
            </p>
          </div>
          {sections.map((s) => (
            <div key={s.title}>
              <p className="mb-4 text-xs font-bold uppercase tracking-widest text-stone-400">{s.title}</p>
              <ul className="flex flex-col gap-2.5">
                {s.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm text-stone-500 transition-colors hover:text-blue-700">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 border-t border-stone-100 pt-6 text-center text-xs text-stone-400">
          © {new Date().getFullYear()} Nalar Etam. Dibuat dengan ❤ di Indonesia.
        </div>
      </div>
    </footer>
  );
}
