import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Sora } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Nalar Etam — Platform Belajar UTBK TKA Matematika Interaktif",
  description: "Pahami konsep matematika secara logis, interaktif, dan terstruktur. Kelas persiapan UTBK TKA Matematika terbaik tanpa hafalan rumus.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${jakarta.variable} ${sora.variable}`}>
      <body className="min-h-screen font-[family-name:var(--font-jakarta)]">{children}</body>
    </html>
  );
}
