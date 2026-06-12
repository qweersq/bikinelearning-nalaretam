"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, BookOpen, Clock } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Course {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  categoryId: string;
  category: Category;
  moduleCount: number;
  totalDuration: number;
  completedCount: number;
}

interface Props {
  courses: Course[];
  categories: Category[];
}

export default function CoursesUI({ courses, categories }: Props) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return courses.filter((c) => {
      const matchCat = activeCategory === null || c.categoryId === activeCategory;
      const matchSearch = search.trim() === "" || c.title.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [courses, activeCategory, search]);

  const featured = courses[0];

  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[30px] font-extrabold text-stone-900">Materi Belajar</h1>
        <p className="mt-1 text-[#8c8c8c]">Ayo persiapkan UTBK TKA Matematika dengan materi terstruktur!</p>

        {/* Search */}
        <div className="mt-5 flex h-[56px] items-center gap-3 rounded-[18px] bg-white px-[18px] shadow-[0_5px_20px_rgba(0,0,0,.05)]">
          <Search size={18} className="shrink-0 text-stone-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari bab atau materi..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-stone-400"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex gap-[10px] overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
        <button
          onClick={() => setActiveCategory(null)}
          className={`shrink-0 whitespace-nowrap rounded-full px-[18px] py-3 text-sm font-semibold transition-colors ${
            activeCategory === null ? "bg-[#2563eb] text-white" : "bg-white text-stone-700"
          }`}
        >
          Semua
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
            className={`shrink-0 whitespace-nowrap rounded-full px-[18px] py-3 text-sm font-semibold transition-colors ${
              activeCategory === cat.id ? "bg-[#2563eb] text-white" : "bg-white text-stone-700"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Learning Path Banner */}
      <div className="mt-[25px] rounded-[28px] bg-gradient-to-br from-[#2563eb] to-[#1db96b] p-6 text-white">
        <p className="text-sm opacity-80">Rekomendasi Jalur Belajar</p>
        <h2 className="mt-2 text-lg font-bold leading-snug">
          Kuasai Konsep Penalaran Matematika UTBK Bersama Nalar Etam!
        </h2>
        <Link
          href={courses[0] ? `/dashboard/modul/${courses[0].slug}` : "#"}
          className="mt-4 inline-block rounded-full bg-white px-[18px] py-[10px] text-sm font-bold text-[#2563eb]"
        >
          Mulai Belajar Sekarang →
        </Link>
      </div>

      {/* Featured Course */}
      {featured && !search && !activeCategory && (
        <div className="mt-[30px]">
          <h3 className="mb-[15px] text-[22px] font-bold text-stone-900">Materi Unggulan</h3>
          <Link href={`/dashboard/modul/${featured.slug}`}>
            <div className="overflow-hidden rounded-[26px] bg-white shadow-[0_5px_20px_rgba(0,0,0,.05)]">
              <div className="h-[180px] overflow-hidden bg-gradient-to-br from-[#eff6ff] to-[#dbeafe]">
                {featured.thumbnail && (
                  <img src={featured.thumbnail} alt={featured.title} className="h-full w-full object-cover" />
                )}
              </div>
              <div className="p-5">
                <span className="inline-block rounded-full bg-[#e8f8ee] px-3 py-1.5 text-xs font-bold text-[#2563eb]">
                  MOST POPULAR
                </span>
                <h3 className="mb-2 mt-3 text-lg font-bold text-stone-900">{featured.title}</h3>
                {featured.description && (
                  <p className="line-clamp-2 text-sm leading-relaxed text-[#888]">{featured.description}</p>
                )}
                <div className="mt-[18px] flex h-[50px] w-full items-center justify-center rounded-[15px] bg-[#2563eb] text-sm font-bold text-white">
                  Buka Materi
                </div>
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* All Courses */}
      <div className="mt-[30px]">
        <div className="mb-[15px] flex items-center justify-between">
          <h3 className="text-[22px] font-bold text-stone-900">
            {activeCategory || search ? "Hasil Filter" : "Semua Materi"}
          </h3>
          <span className="text-sm text-stone-400">{filtered.length} materi</span>
        </div>

        <div className="flex flex-col gap-[15px]">
          {filtered.map((course) => {
            const donePercent = course.moduleCount > 0
              ? Math.round((course.completedCount / course.moduleCount) * 100)
              : 0;

            return (
              <Link key={course.id} href={`/dashboard/modul/${course.slug}`}>
                <div className="flex gap-[15px] rounded-[22px] bg-white p-[14px] shadow-[0_5px_20px_rgba(0,0,0,.05)]">
                  {/* Thumbnail */}
                  <div className="relative flex h-[90px] w-[90px] shrink-0 items-center justify-center overflow-hidden rounded-[18px] bg-gradient-to-br from-[#eff6ff] to-[#dbeafe]">
                    {course.thumbnail && (
                      <img src={course.thumbnail} alt={course.title} className="h-full w-full object-cover" />
                    )}
                    {donePercent === 100 && (
                      <div className="absolute inset-0 flex items-center justify-center bg-[#2563eb]/80 text-white text-2xl font-bold">
                        ✓
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-bold text-[#2563eb]">
                      {course.category.name.toUpperCase()}
                    </span>
                    <h4 className="mt-1.5 mb-1.5 text-sm font-bold leading-snug text-stone-900">
                      {course.title}
                    </h4>
                    {course.description && (
                      <p className="line-clamp-1 text-xs text-[#888]">{course.description}</p>
                    )}
                    <div className="mt-2 flex gap-3 text-xs text-[#666]">
                      <span className="flex items-center gap-1">
                        <BookOpen size={11} />
                        {course.moduleCount} Bab
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={11} />
                        {course.totalDuration} mnt
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}

          {filtered.length === 0 && (
            <p className="py-8 text-center text-sm text-stone-400">Tidak ada materi ditemukan.</p>
          )}
        </div>
      </div>
    </>
  );
}
