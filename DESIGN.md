# Katsikat Akademi — Design System

Referensi: Saweria (vibe & komponen) + light blue palette (warna)

---

## 1. Filosofi Design

| Aspek | Deskripsi |
|---|---|
| **Nuansa** | Friendly, clean, modern — terasa profesional tapi tidak kaku |
| **Pendekatan** | Minimal ornamen, fokus ke konten, breathing room yang lega |
| **Karakter** | Seperti Saweria: rounded, soft shadow, putih bersih, accent warna hidup |

---

## 2. Color Palette

### Primary — Sky Blue

```
sky-50   #f0f9ff   → background halaman, section alternating
sky-100  #e0f2fe   → badge, tag, subtle highlight
sky-200  #bae6fd   → border focus, ring
sky-400  #38bdf8   → icon accent, underline active
sky-500  #0ea5e9   → primary button, link utama
sky-600  #0284c7   → primary button hover, link hover
sky-700  #0369a1   → text accent, heading tinted
```

### Neutral

```
white    #ffffff   → card background, input background
zinc-50  #fafafa   → page background
zinc-100 #f4f4f5   → divider, subtle bg
zinc-300 #d4d4d8   → border input default
zinc-400 #a1a1aa   → placeholder text
zinc-500 #71717a   → body text sekunder, label
zinc-700 #3f3f46   → body text utama
zinc-900 #18181b   → heading, text gelap
```

### Semantic

```
green-500  #22c55e  → sukses, akses aktif
red-500    #ef4444  → error, validasi gagal
amber-400  #fbbf24  → warning (jarang dipakai)
```

---

## 3. Typography

### Font Family

```
Font utama : Inter (Google Fonts)
Fallback   : -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
```

Cara import di `layout.tsx`:
```ts
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"] });
```

### Type Scale

| Elemen | Size | Weight | Color |
|---|---|---|---|
| Landing H1 | `text-5xl` / 48px | `font-bold` 700 | `zinc-900` |
| Landing H2 | `text-3xl` / 30px | `font-bold` 700 | `zinc-900` |
| Card title | `text-xl` / 20px | `font-semibold` 600 | `zinc-900` |
| Section label | `text-sm` / 14px | `font-semibold` 600 | `zinc-500` uppercase |
| Body / paragraf | `text-base` / 16px | `font-normal` 400 | `zinc-600` |
| Caption / helper | `text-sm` / 14px | `font-normal` 400 | `zinc-400` |
| Input label | `text-sm` / 14px | `font-medium` 500 | `zinc-700` |
| Button text | `text-sm` / 14px | `font-semibold` 600 | white |
| Nav link | `text-sm` / 14px | `font-medium` 500 | `zinc-600` |

### Line Height
- Heading: `leading-tight` (1.25)
- Body: `leading-relaxed` (1.625)
- Form label: `leading-none`

---

## 4. Spacing & Layout

### Page Layout

```
Max width konten  : max-w-5xl (1024px) untuk landing
Max width form    : max-w-md (448px) untuk auth card
Padding horizontal: px-6 (24px) mobile, otomatis di desktop
```

### Vertical Rhythm

```
Antar section landing : py-20 (80px)
Dalam card auth       : p-8 (32px)
Antar elemen form     : space-y-5 (20px)
Label ke input        : mb-1.5 (6px)
```

---

## 5. Komponen

### 5.1 Card (Auth & Content)

Terinspirasi Saweria — putih, rounded besar, shadow lembut.

```
bg-white
rounded-2xl          → border-radius: 16px
border border-zinc-100
shadow-sm            → box-shadow: 0 1px 2px rgb(0 0 0 / 0.05)
p-8                  → padding: 32px
```

Untuk card hover (modul list):
```
hover:border-sky-200
hover:shadow-md
transition-all duration-200
```

---

### 5.2 Input Field

Terinspirasi Saweria — border tipis, focus ring biru soft, tidak ada shadow default.

```css
/* Default */
w-full
rounded-xl           → border-radius: 12px
border border-zinc-300
bg-white
px-4 py-3            → padding: 12px 16px
text-sm text-zinc-800
placeholder:text-zinc-400
outline-none
transition

/* Focus */
focus:border-sky-400
focus:ring-2
focus:ring-sky-100   → ring biru sangat muda, bukan keras

/* Error */
border-red-300
focus:border-red-400
focus:ring-red-100

/* Disabled */
bg-zinc-50
text-zinc-400
cursor-not-allowed
```

Tailwind class lengkap:
```
"w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-800 placeholder:text-zinc-400 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition"
```

---

### 5.3 Button

**Primary (CTA utama)**
```
rounded-full         → pill shape, ciri khas Saweria
bg-sky-500
hover:bg-sky-600
text-white
px-6 py-3
text-sm font-semibold
transition-colors
disabled:opacity-50 disabled:cursor-not-allowed
```

**Secondary / Outline**
```
rounded-full
border border-zinc-200
text-zinc-600
hover:bg-zinc-50
hover:border-zinc-300
px-6 py-3
text-sm font-medium
transition-colors
```

**Ghost / Link-like**
```
text-sky-600
hover:text-sky-700
font-medium
text-sm
underline-offset-2
hover:underline
```

**Danger**
```
rounded-full
bg-red-500
hover:bg-red-600
text-white
px-6 py-3
text-sm font-semibold
```

---

### 5.4 Badge / Tag

```
/* Sky (default) */
inline-flex items-center
rounded-full
bg-sky-50
text-sky-700
px-3 py-1
text-xs font-medium

/* Neutral */
bg-zinc-100 text-zinc-600

/* Green (akses aktif) */
bg-green-50 text-green-700

/* Bonus label */
bg-amber-50 text-amber-700
```

---

### 5.5 Navbar

Terinspirasi Saweria — sticky, transparan dengan blur, border bawah tipis.

```
sticky top-0 z-50
border-b border-zinc-100
bg-white/80
backdrop-blur-md
```

Tinggi: `h-16` (64px), konten `py-4`.

Logo: `text-xl font-bold tracking-tight` — "Katsikat" + `<span text-sky-500>Akademi</span>`

---

### 5.6 Alert / Error Message

```
/* Error */
rounded-xl
bg-red-50
border border-red-100
text-red-600
px-4 py-3
text-sm

/* Success */
rounded-xl
bg-green-50
border border-green-100
text-green-700
px-4 py-3
text-sm
```

---

### 5.7 Divider dengan teks

```html
<div class="relative my-6">
  <div class="absolute inset-0 flex items-center">
    <div class="w-full border-t border-zinc-200" />
  </div>
  <div class="relative flex justify-center text-sm">
    <span class="bg-white px-3 text-zinc-400">atau</span>
  </div>
</div>
```

---

## 6. Halaman Auth (Struktur)

Struktur layout auth pages (login, register, lupa password):

```
min-h-screen bg-zinc-50          ← full page background abu sangat muda
  flex items-center justify-center px-4

  div max-w-md w-full
    ← Logo + tagline (centered, mb-8)

    div card (bg-white rounded-2xl border shadow-sm p-8)
      ← Form content

    p text-center text-sm text-zinc-500 mt-6
      ← "Sudah punya akun? Login"
```

---

## 7. Landing Page (Struktur Section)

```
[Navbar sticky]
[Hero]        → bg-white, text center, max-w-5xl, py-24
[Benefits]    → bg-zinc-50, grid 4 kolom, py-20
[Kurikulum]   → bg-white, list card, py-20
[Testimoni]   → bg-zinc-50 (nanti)
[CTA Banner]  → bg-sky-600 (ganti dari zinc-900), py-20, text putih
[Footer]      → border-t, py-8, text-zinc-400
```

Perubahan dari versi awal:
- Hero accent: `text-sky-500` (ganti dari amber)
- CTA badge: `bg-sky-50 text-sky-700`
- CTA button: `bg-sky-500 hover:bg-sky-400`
- CTA Banner: `bg-sky-600` atau `bg-sky-700`
- Section alternating: putih ↔ `zinc-50` (bukan `zinc-900`)

---

## 8. Border Radius Summary

| Komponen | Class | Value |
|---|---|---|
| Card besar | `rounded-2xl` | 16px |
| Input | `rounded-xl` | 12px |
| Button primary | `rounded-full` | 9999px (pill) |
| Button secondary | `rounded-full` | 9999px (pill) |
| Badge / tag | `rounded-full` | 9999px |
| Alert / error box | `rounded-xl` | 12px |
| Modul list item | `rounded-2xl` | 16px |

---

## 9. Shadow Summary

| Komponen | Class | Kapan |
|---|---|---|
| Card auth | `shadow-sm` | Default |
| Card modul hover | `shadow-md` | On hover |
| Navbar | tidak ada shadow | pakai border-b saja |
| Button | tidak ada shadow | Saweria style — flat |

---

## 10. Animasi & Transisi

- Semua elemen interaktif: `transition-colors duration-150` atau `transition-all duration-200`
- Tidak ada animasi masuk (no fade-in, no slide) — keep it snappy
- Loading button: ganti teks, tambah `disabled:opacity-50`
- Hover card: `hover:shadow-md hover:border-sky-200`

---

## 11. Do's & Don'ts

### ✅ Do
- Rounded pill untuk semua button utama
- Padding lega di dalam card (p-8)
- Focus ring biru muda (sky-100) bukan biru keras
- White card di atas zinc-50 background
- Font Inter, bersih, tidak dekoratif
- Label selalu di atas input (bukan placeholder-only)

### ❌ Don't
- Jangan pakai shadow keras / drop shadow besar
- Jangan pakai warna terlalu banyak dalam satu halaman
- Jangan skip label input (accessibility)
- Jangan pakai gradient di button (flat is better)
- Jangan pakai font lebih dari 1 family
- Jangan terlalu banyak border (cukup yang penting saja)
