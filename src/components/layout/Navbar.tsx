import Link from "next/link";
import Logo from "@/components/ui/Logo";
import Button from "@/components/ui/Button";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-stone-200/60 bg-[#F7F6F2]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Logo />
        <nav className="hidden items-center gap-6 sm:flex">
          <Link href="#modul" className="text-sm font-medium text-stone-500 transition-colors hover:text-stone-900">
            Kurikulum
          </Link>
          <Link href="#testimoni" className="text-sm font-medium text-stone-500 transition-colors hover:text-stone-900">
            Testimoni
          </Link>
          <Link href="/kursus#faq" className="text-sm font-medium text-stone-500 transition-colors hover:text-stone-900">
            FAQ
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-semibold text-stone-600 transition-colors hover:text-stone-900">
            Masuk
          </Link>
          <Link href="/kursus">
            <Button size="sm">Mulai Belajar</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
