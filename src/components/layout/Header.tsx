"use client";

import { useState } from "react";
import Link from "next/link";
import { X, Menu } from "lucide-react";
import Logo from "@/components/ui/Logo";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200/40 bg-[#f6f8fc]/80 py-4 backdrop-blur-md transition-all duration-300">
      <div className="mx-auto flex max-w-[768px] items-center justify-between px-5">
        <Logo size="lg" />

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-4 sm:flex">
          <Link href="/materi" className="relative py-1 text-xs font-bold uppercase tracking-wider text-stone-500 transition-colors hover:text-[#2563eb] group">
            Materi
            <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-[#2563eb] transition-all duration-300 group-hover:w-full" />
          </Link>
          <Link href="/program" className="relative py-1 text-xs font-bold uppercase tracking-wider text-stone-500 transition-colors hover:text-[#2563eb] group">
            Program
            <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-[#2563eb] transition-all duration-300 group-hover:w-full" />
          </Link>
          <Link href="/roadmap" className="relative py-1 text-xs font-bold uppercase tracking-wider text-stone-500 transition-colors hover:text-[#2563eb] group">
            Roadmap
            <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-[#2563eb] transition-all duration-300 group-hover:w-full" />
          </Link>
          <Link href="/donasi" className="relative py-1 text-xs font-bold uppercase tracking-wider text-stone-500 transition-colors hover:text-[#2563eb] group">
            Donasi
            <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-[#2563eb] transition-all duration-300 group-hover:w-full" />
          </Link>
          <Link href="/kelas-gratis" className="relative py-1 text-xs font-bold uppercase tracking-wider text-stone-500 transition-colors hover:text-[#2563eb] group">
            Kelas Gratis
            <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-[#2563eb] transition-all duration-300 group-hover:w-full" />
          </Link>
        </nav>

        {/* Desktop Login */}
        <div className="hidden items-center gap-4 sm:flex">
          <Link
            href="/login"
            className="rounded-[12px] bg-white px-4 py-2 text-sm font-semibold text-stone-600 shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:text-[#2563eb] hover:shadow-[0_4px_20px_rgba(37,99,235,0.15)] transition-all duration-300 transform hover:-translate-y-0.5"
          >
            Masuk
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-white text-stone-600 shadow-[0_4px_12px_rgba(0,0,0,0.05)] transition-all hover:text-[#2563eb] active:scale-95 sm:hidden"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        <div className="absolute top-full left-0 right-0 z-40 border-b border-stone-200/50 bg-white/95 px-5 py-6 shadow-xl backdrop-blur-md transition-all duration-300 sm:hidden animate-in fade-in slide-in-from-top-5 duration-200">
          <nav className="flex flex-col gap-3">
            <Link
              href="/materi"
              onClick={() => setMenuOpen(false)}
              className="rounded-xl px-4 py-3 text-sm font-bold uppercase tracking-wider text-stone-500 hover:bg-[#eff6ff] hover:text-[#2563eb] transition-all"
            >
              Materi
            </Link>
            <Link
              href="/program"
              onClick={() => setMenuOpen(false)}
              className="rounded-xl px-4 py-3 text-sm font-bold uppercase tracking-wider text-stone-500 hover:bg-[#eff6ff] hover:text-[#2563eb] transition-all"
            >
              Program Belajar
            </Link>
            <Link
              href="/roadmap"
              onClick={() => setMenuOpen(false)}
              className="rounded-xl px-4 py-3 text-sm font-bold uppercase tracking-wider text-stone-500 hover:bg-[#eff6ff] hover:text-[#2563eb] transition-all"
            >
              Roadmap
            </Link>
            <Link
              href="/donasi"
              onClick={() => setMenuOpen(false)}
              className="rounded-xl px-4 py-3 text-sm font-bold uppercase tracking-wider text-stone-500 hover:bg-[#eff6ff] hover:text-[#2563eb] transition-all"
            >
              Donasi
            </Link>
            <Link
              href="/kelas-gratis"
              onClick={() => setMenuOpen(false)}
              className="rounded-xl px-4 py-3 text-sm font-bold uppercase tracking-wider text-stone-500 hover:bg-[#eff6ff] hover:text-[#2563eb] transition-all"
            >
              Kelas Gratis
            </Link>
            <hr className="my-2 border-stone-100" />
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="flex h-[52px] w-full items-center justify-center rounded-[14px] bg-[#2563eb] text-sm font-bold text-white shadow-md transition-opacity hover:opacity-90 active:scale-98"
            >
              Masuk
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
