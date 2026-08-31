# 📖 KomikID - Web Baca Komik / Manga Subtitle Indonesia

Aplikasi web modern, cepat, dan responsif untuk membaca ribuan komik, manga (Jepang), manhwa (Korea), dan manhua (China) dengan terjemahan Bahasa Indonesia lengkap.

---

## ✨ Fitur Utama

1. **Koleksi Database Lengkap**:
   - Mengambil data langsung dari database komik terjemahan Bahasa Indonesia terlengkap (*Komikindo* & *Komiku*).
   - Puluhan ribu judul komik dengan update chapter baru setiap hari.
2. **Beranda Interaktif**:
   - Hero Featured Slider komik trending hari ini.
   - Tab Filter Cepat (Semua, Manhwa, Manhua, Manga).
   - Daftar Rilis Chapter Terbaru dengan timestamp real-time.
   - Peringkat Komik Terpopuler.
3. **Pencarian Cepat & Filter**:
   - Pencarian judul komik dengan saran kata kunci populer.
   - Filter berdasarkan Tipe komik dan Urutan (Terpopuler / Terbaru).
4. **Halaman Detail Komik**:
   - Sampul HD, Skor Rating, Author, Status (Ongoing/Tamat), Tipe, dan Genre.
   - Sinopsis lengkap Bahasa Indonesia.
   - Tombol cepat: *"Mulai Baca (Ch. 1)"*, *"Lanjut Baca"*, dan *"Tambah ke Favorit"*.
   - Daftar Chapter interaktif dengan pencarian nomor chapter & pengurutan (Terbaru / Terlama).
5. **Mode Baca Komik Modern (Webtoon & Manga Reader)**:
   - **Mode Webtoon (Continuous Vertical Scroll)**: Scroll tanpa henti ke bawah (sangat nyaman untuk Manhwa/Manhua).
   - **Mode Manga (Single Page)**: Pindah halaman dengan klik atau panah keyboard (A/D atau ←/→).
   - Navigasi Chapter Sebelumnya & Berikutnya.
   - Pengaturan Reader: Ubah lebar tampilan (650px, 800px, 1000px, Full), warna latar belakang (Hitam Pekat, Dark Slate, Sepia).
   - Mode Layar Penuh (Fullscreen - tekan tombol `F`).
   - Image Proxy otomatis untuk mencegah error gambar rusak atau CORS.
6. **Koleksi & Riwayat Saya**:
   - **Favorit (Bookmarks)**: Simpan komik favoritmu di browser.
   - **Riwayat Bacaan (History)**: Otomatis mencatat chapter terakhir yang dibaca dan progress membaca.

---

## 🚀 Cara Menjalankan Aplikasi

### Cara 1: Menggunakan File Batch (1-Click)
Cukup klik ganda file **`start.bat`**.

### Cara 2: Melalui Terminal / Command Prompt
```bash
# Jalankan server
node server/src/index.js
```

Buka browser Anda di:
👉 **[http://localhost:5000](http://localhost:5000)**

---

## 🛠️ Struktur Proyek

```
BepInEx/
├── client/                     # Frontend (React + Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/         # Navbar, Footer, ComicCard, HeroBanner, SkeletonLoader
│   │   ├── context/            # LibraryContext (Bookmarks & History localStorage)
│   │   ├── pages/              # HomePage, BrowsePage, SearchPage, DetailPage, ReaderPage, LibraryPage
│   │   └── services/           # api.js client service
│   └── dist/                   # Production Build
├── server/                     # Backend API & Scraper Engine (Node.js Express)
│   ├── src/
│   │   ├── routes/             # api.js (/api/home, /api/comics, /api/search, /api/comic/:slug, /api/chapter/:slug, /api/proxy-image)
│   │   ├── services/           # komikindoScraper.js, cacheService.js
│   │   └── index.js            # Express server entry point
├── start.bat                   # 1-Click Startup script untuk Windows
└── README.md                   # Dokumentasi lengkap
```
