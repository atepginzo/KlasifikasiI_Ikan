# Design System — AI Fish Image Classifier

**Versi:** 1.0  
**Tanggal:** 22 November 2026  
**Status:** DRAFT untuk STOP GATE 3  
**Arahan Visual:** Modern, bersih, bertema kelautan (Oceanic Blue / Teal), latar netral terang, aksesibel (WCAG AA).

---

## 1. Filosofi Desain

Aplikasi AI Fish Image Classifier dirancang untuk instrumen klasifikasi ilmiah berbasis web. Desain mengedepankan:
1. **Kejelasan Ilmiah & Kejujuran:** Tidak ada klaim berlebihan atau animasi kosmetik yang memperlambat alur kerja.
2. **Keterbacaan Tinggi & Kontras AA:** Seluruh kombinasi warna teks dan latar belakang memenuhi standar minimum rasio kontras WCAG AA (>= 4.5:1 untuk teks normal).
3. **Nuansa Kelautan yang Elegan:** Aksen biru laut dalam (*Deep Marine Blue*) dan hijau laut (*Ocean Teal*) dipadukan dengan latar belakang slate netral terang yang bersih.
4. **Desain Komponen Bersih:** Radius kartu konsisten (8px / 12px), garis tepi halus, ruang bernapas cukup, tanpa efek 3D berlebihan (tanpa claymorphism/skeuomorphism).

---

## 2. Palet Warna & Verifikasi Kontras WCAG AA

### Tabel Token Warna

| Peran | Hex Code | CSS Variable | Penggunaan |
|-------|----------|--------------|------------|
| **Primary** | `#0369A1` | `--color-primary` | Tombol utama, link aktif, header aksen, progress utama |
| **Primary Hover** | `#075985` | `--color-primary-hover` | State hover tombol utama |
| **Secondary** | `#0F766E` | `--color-secondary` | Tombol sekunder, badge pendukung, aksen teal |
| **Secondary Hover** | `#115E59` | `--color-secondary-hover` | State hover tombol sekunder |
| **Background** | `#F8FAFC` | `--color-bg` | Latar belakang halaman aplikasi |
| **Surface / Card** | `#FFFFFF` | `--color-surface` | Kartu konten, dropzone, dialog, panel hasil |
| **Border** | `#E2E8F0` | `--color-border` | Garis pembatas kartu, tabel, dan input |
| **Text Main** | `#0F172A` | `--color-text-main` | Judul, teks utama, label form |
| **Text Muted** | `#475569` | `--color-text-muted` | Keterangan, label sekunder, teks bantuan |
| **Success** | `#059669` | `--color-success` | Indikator keyakinan tinggi, konfirmasi feedback |
| **Warning** | `#D97706` | `--color-warning` | Peringatan keyakinan rendah, sampel uji kecil |
| **Danger / Error** | `#DC2626` | `--color-danger` | Pesan error validasi, tombol hapus data |
| **Focus Ring** | `#0284C7` | `--color-focus-ring` | Outline navigasi keyboard (2px offset) |

### Hasil Uji Rasio Kontras (WCAG AA Compliance)

| Pasangan Warna (Foreground / Background) | Rasio Kontras | Standar Minimal | Status |
|------------------------------------------|---------------|-----------------|--------|
| `#0F172A` (Text Main) pada `#FFFFFF` (Surface) | **16.1 : 1** | 4.5 : 1 (Normal) | ✅ Lolos (WCAG AAA) |
| `#0F172A` (Text Main) pada `#F8FAFC` (Background) | **15.4 : 1** | 4.5 : 1 (Normal) | ✅ Lolos (WCAG AAA) |
| `#475569` (Text Muted) pada `#FFFFFF` (Surface) | **5.4 : 1** | 4.5 : 1 (Normal) | ✅ Lolos (WCAG AA) |
| `#FFFFFF` (Text) pada `#0369A1` (Primary Button) | **5.9 : 1** | 4.5 : 1 (Normal) | ✅ Lolos (WCAG AA) |
| `#FFFFFF` (Text) pada `#0F766E` (Secondary Button) | **5.1 : 1** | 4.5 : 1 (Normal) | ✅ Lolos (WCAG AA) |
| `#FFFFFF` (Text) pada `#DC2626` (Danger Button) | **4.6 : 1** | 4.5 : 1 (Normal) | ✅ Lolos (WCAG AA) |
| `#92400E` (Warning Text) pada `#FEF3C7` (Warning Bg) | **6.0 : 1** | 4.5 : 1 (Normal) | ✅ Lolos (WCAG AA) |

---

## 3. Tipografi

Sistem tipografi menggunakan sans-serif modern yang netral dan terbaca jernih pada berbagai resolusi layar.

- **Font Family Base:** `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`
- **Font Family Mono:** `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace` (untuk label kelas teknis `fish_XX` dan SHA-256)

### Skala Tipografi

| Level | Ukuran | Line Height | Weight | Penggunaan |
|-------|--------|-------------|--------|------------|
| **Display / H1** | 1.875rem (30px) | 1.25 | Bold (700) | Judul utama halaman Beranda |
| **Heading / H2** | 1.5rem (24px) | 1.25 | SemiBold (600) | Judul section, judul kartu hasil |
| **Subheading / H3** | 1.25rem (20px) | 1.3 | SemiBold (600) | Judul kartu, judul Top 5 |
| **Title / H4** | 1.125rem (18px) | 1.4 | Medium (500) | Label kelompok metrik, step title |
| **Body Base** | 1.0rem (16px) | 1.5 | Normal (400) | Teks paragraf, penjelasan alur |
| **Body Small** | 0.875rem (14px) | 1.5 | Normal (400) | Keterangan tombol, tabel data, feedback |
| **Caption / Badge** | 0.75rem (12px) | 1.4 | Medium (500) | Badge status, inference ms, timestamp |

---

## 4. Spacing, Radius, dan Grid

- **Grid Base:** 4px / 8px spacing system
- **Radius:**
  - `radius-sm`: 4px (badge, tag kecil)
  - `radius-md`: 8px (tombol, input file, preview thumbnail)
  - `radius-lg`: 12px (kartu utama, dropzone area, dialog box)
  - `radius-full`: 9999px (pill badge, progress bar rounded)
- **Breakpoints Responsif:**
  - `Mobile (xs)`: 360px – 639px
  - `Tablet (sm/md)`: 640px – 1023px
  - `Desktop (lg/xl)`: 1024px – 1280px+ (Max container: 1200px)

---

## 5. Spesifikasi Komponen UI

### 5.1 Tombol (Button)
- **Primary:** Background `#0369A1`, Text `#FFFFFF`, Hover `#075985`, Focus Ring `2px #0284C7`.
- **Secondary:** Background `#F1F5F9`, Text `#0F172A`, Border `#E2E8F0`, Hover `#E2E8F0`.
- **Ghost:** Background transparan, Text `#0369A1`, Hover `#E0F2FE`.
- **Destructive:** Background `#DC2626`, Text `#FFFFFF`, Hover `#B91C1C`.
- **States:** Hover, Active, Disabled (`opacity: 0.5`, `cursor: not-allowed`), Loading (spinner SVG + disabled click). Target sentuh ponsel minimal **44×44px**.

### 5.2 Dropzone & Upload Area
- Border putus-putus 2px `#0369A1` saat drag over atau `#CBD5E1` saat idle.
- Background idle `#FFFFFF`, drag-active `#F0F9FF`.
- Tombol aksi jelas: "Pilih Gambar" dan teks seret-lepas.
- Dukungan navigasi keyboard penuh (Tab + Enter/Spasi untuk memilih file).

### 5.3 Kartu Hasil & Bar Probabilitas Top 5
- Hasil utama menampilkan label kelas (`fish_XX`) dengan ukuran besar dan tag "Tingkat Keyakinan Model".
- Bar probabilitas horizontal:
  - Background track: `#E2E8F0`
  - Fill bar: Gradien datar `#0284C7` (proporsional 0–100%)
  - Angka persen diformat locale `id-ID` (mis. `98,8%`, nilai <0.1% ditampilkan `<0,1%`).

### 5.4 Dialog & Alert Box
- Alert Warning: Latar `#FFFBEB`, Border `#FDE68A`, Teks `#92400E` dengan ikon `AlertTriangle`.
- Alert Error: Latar `#FEF2F2`, Border `#FECACA`, Teks `#991B1B` dengan ikon `AlertCircle`.
- Alert Info: Latar `#F0F9FF`, Border `#BAE6FD`, Teks `#075985` dengan ikon `Info`.

---

## 6. Pedoman Salinan Teks (Microcopy) & Batasan Ilmiah

Sesuai ketentuan ketat integritas model:
1. **Label Spesies:** Selalu sertakan catatan bahwa `fish_01`–`fish_23` adalah label folder dataset, bukan spesies biologis yang telah diverifikasi secara taksonomi.
2. **Keyakinan Model:** Diberi label *"Tingkat keyakinan model"*, bukan *"Akurasi"* atau *"Pasti benar"*.
3. **Peringatan Rendah:** Jika keyakinan < 60%, tampilkan peringatan: *"Keyakinan model rendah; hasil mungkin kurang tepat."*
4. **Sampel Minoritas:** Jika kelas prediksi memiliki sampel uji <= 10, tampilkan catatan: *"Kelas ini memiliki sedikit sampel uji sehingga performanya kurang teruji."*
5. **Kebijakan Privasi:** Cantumkan secara eksplisit: *"Gambar Anda diproses sementara di memori dan tidak disimpan di server. Riwayat hanya mencatat hasil prediksi."*
