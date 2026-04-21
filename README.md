# CONSERVE Journal of Community Services

Website jurnal akademik ilmiah yang dibangun dengan **Next.js 14**, **TypeScript**, dan **Tailwind CSS**.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/USERNAME/conserve-journal)

---

## ✨ Fitur Utama

- **Beranda Dinamis** — Menampilkan sampul visual edisi terbaru dan daftar artikel secara otomatis
- **Halaman Detail Artikel** — Judul lengkap, abstrak, penulis, DOI, tombol unduh PDF, dan salin kutipan APA
- **Halaman Tentang Jurnal** — Profil, ruang lingkup topik, kebijakan review, dan dewan editor
- **Desain Responsif** — Tampil sempurna di desktop, tablet, dan smartphone
- **Data Berbasis JSON** — Artikel disimpan di `data/articles.json`, mudah diedit tanpa menyentuh kode UI
- **SEO-Ready** — Metadata dinamis per halaman untuk mesin pencari dan berbagi media sosial
- **Tanpa Variabel Lingkungan** — Langsung jalan setelah `npm install`, tidak perlu konfigurasi tambahan

---

## 🏗️ Struktur Proyek

```
conserve-journal/
├── app/                        # App Router Next.js 14
│   ├── layout.tsx              # Layout akar: Header + Footer yang selalu tampil
│   ├── page.tsx                # Halaman Beranda
│   ├── globals.css             # CSS global: font, variabel, animasi
│   ├── not-found.tsx           # Halaman 404 kustom
│   ├── about/
│   │   └── page.tsx            # Halaman Tentang Jurnal
│   └── articles/
│       └── [id]/
│           └── page.tsx        # Halaman Detail Artikel (dinamis)
│
├── components/                 # Komponen React yang bisa dipakai ulang
│   ├── Header.tsx              # Navigasi atas (sticky, responsive + mobile menu)
│   ├── Footer.tsx              # Footer dengan info jurnal dan kontak
│   ├── ArticleCard.tsx         # Kartu ringkasan artikel di beranda
│   └── JournalCover.tsx        # Hero section bergaya sampul jurnal
│
├── data/
│   └── articles.json           # ← EDIT FILE INI untuk menambah/ubah artikel
│
├── lib/
│   └── articles.ts             # Tipe TypeScript & fungsi utilitas data
│
├── public/
│   └── papers/                 # Letakkan file PDF artikel di sini
│
├── next.config.js              # Konfigurasi Next.js
├── tailwind.config.ts          # Token desain & konfigurasi Tailwind
├── tsconfig.json               # Konfigurasi TypeScript
└── package.json
```

---

## 🚀 Menjalankan Secara Lokal

### Prasyarat

Pastikan Node.js versi 18 atau lebih baru sudah terinstal:

```bash
node --version   # Harus menampilkan v18.x.x atau lebih tinggi
```

### Langkah Instalasi

**1. Clone atau unduh proyek ini:**

```bash
git clone https://github.com/USERNAME/conserve-journal.git
cd conserve-journal
```

**2. Instal semua dependensi:**

```bash
npm install
```

**3. Jalankan server pengembangan:**

```bash
npm run dev
```

**4. Buka browser dan kunjungi:**

```
http://localhost:3000
```

Selesai! Setiap perubahan pada kode akan otomatis terlihat di browser tanpa perlu refresh manual (Hot Module Replacement).

---

## 🏭 Build untuk Produksi

Untuk menghasilkan versi produksi yang dioptimalkan:

```bash
# Membuat build produksi
npm run build

# Menjalankan server produksi secara lokal (untuk pengujian akhir)
npm run start
```

Perintah `npm run build` akan menampilkan ukuran setiap halaman dan memastikan tidak ada error TypeScript sebelum deploy.

---

## ☁️ Deploy ke Vercel

Vercel adalah platform deployment resmi untuk Next.js — paling mudah dan gratis untuk proyek seperti ini.

### Cara 1: Satu Klik (Termudah)

Klik tombol di bawah ini untuk langsung men-deploy fork dari repositori ini:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/USERNAME/conserve-journal)

### Cara 2: Melalui Dashboard Vercel (Direkomendasikan)

1. Push kode ke GitHub terlebih dahulu (lihat bagian selanjutnya).
2. Buka [vercel.com](https://vercel.com) dan daftar/masuk dengan akun GitHub.
3. Klik **"Add New Project"**.
4. Pilih repositori `conserve-journal` dari daftar.
5. Vercel otomatis mendeteksi ini adalah proyek Next.js.
6. Klik **"Deploy"** — tidak perlu mengubah pengaturan apapun.
7. Dalam 1–2 menit, proyek live dengan URL seperti `conserve-journal.vercel.app`.

> **Catatan:** Proyek ini tidak memerlukan variabel lingkungan (.env) apapun. Langsung bisa deploy.

---

## 📦 Push ke GitHub

Jika Anda memulai dari awal (bukan clone), ikuti langkah berikut:

```bash
# 1. Inisialisasi repository Git di folder proyek
git init

# 2. Tambahkan semua file ke staging area
git add .

# 3. Buat commit pertama
git commit -m "feat: initial commit - CONSERVE Journal website"

# 4. Hubungkan ke repository GitHub yang sudah dibuat di github.com
git remote add origin https://github.com/USERNAME/conserve-journal.git

# 5. Set branch utama menjadi 'main'
git branch -M main

# 6. Push kode ke GitHub
git push -u origin main
```

Ganti `USERNAME` dengan username GitHub Anda.

---

## 📝 Menambah Artikel Baru

Untuk menambah artikel, cukup buka file `data/articles.json` dan tambahkan objek baru mengikuti format berikut:

```json
{
  "id": "7",
  "title": "Judul Lengkap Artikel Anda",
  "authors": ["Nama Penulis 1", "Nama Penulis 2"],
  "abstract": "Teks abstrak lengkap di sini...",
  "pages": "75-88",
  "publishedDate": "2024-02-11",
  "volume": "01",
  "number": "01",
  "doi": "10.12345/conserve.v1i1.007",
  "keywords": ["kata kunci 1", "kata kunci 2"],
  "pdfUrl": "/papers/artikel-07.pdf",
  "category": "Konservasi Pesisir"
}
```

Lalu letakkan file PDF-nya di folder `public/papers/artikel-07.pdf`. Perubahan akan langsung terlihat setelah simpan.

---

## 🛠️ Teknologi yang Digunakan

| Teknologi | Versi | Fungsi |
|-----------|-------|--------|
| Next.js | 14.x | Framework React dengan App Router & SSG |
| TypeScript | 5.x | Pengetikan statis untuk mencegah bug |
| Tailwind CSS | 3.x | Styling utility-first yang cepat |
| React | 18.x | Library UI komponen |
| Google Fonts | — | Font Playfair Display & Source Sans 3 |

---

## 📄 Lisensi

Proyek ini dibuat untuk keperluan akademik dan pengembangan. Konten artikel milik masing-masing penulis.
