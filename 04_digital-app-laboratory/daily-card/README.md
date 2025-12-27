# Daily Card 🇯🇵
> **Master Your Japanese Vocabulary (Daily Card)**

![Daily Card Banner](assets/Spanduk%20App.png)

**Daily Card** adalah aplikasi Flashcard interaktif berbasis Progressive Web App (PWA) yang dirancang khusus untuk membantu pembelajar bahasa Jepang menguasai **Kanji** dan **Kotoba** (Kosakata) dari level **JLPT N5 hingga N1**.

Aplikasi ini dibuat dengan antarmuka yang modern, responsif, dan mudah digunakan, serta mendukung penggunaan offline.

## ✨ Fitur Utama

- **📚 Lengkap N5-N1**: Materi terstruktur berdasarkan level JLPT dengan opsi belajar Kanji atau Kotoba.
- **🎨 Tema Dinamis**: Warna antarmuka berubah sesuai level yang dipilih (N5 Biru, N4 Merah, N3 Hijau, dst) untuk pengalaman visual yang menarik.
- **⚡ Progressive Web App (PWA)**: Dapat diinstal langsung ke perangkat (HP/Desktop) dan berjalan secara **Offline**.
- **📝 Google Sheets Backend**: Data materi dikelola dengan mudah melalui Google Sheets (CSV), memungkinkan update konten tanpa coding ulang.
- **🔄 Sistem Review Pintar**: Tandai kartu sebagai "Sulit" untuk memasukkannya ke daftar Review dan pelajari ulang secara terfokus.
- **📖 Contoh Kalimat & Detail**: Kartu dilengkapi dengan cara baca (Onyomi/Kunyomi), arti, dan contoh kalimat yang diberi warna (Kanji/Kana/Arti) untuk memudahkan pemahaman.

## 🛠️ Teknologi

Project ini dibangun menggunakan web technologies murni (Vanilla) tanpa framework berat, menjadikannya sangat ringan dan cepat.

- **HTML5** & **CSS3** (CSS Variables, Flexbox/Grid)
- **JavaScript (ES6+)**
- **Service Worker** (Offline Capabilities)
- **Google Sheets** (sebagai Database/CMS)

## 📂 Struktur Folder

```
Daily Card/
├── assets/          # Gambar & Icon Aplikasi (Logo, Banner, dll)
├── css/             # (Jika ada)
├── index.html       # Halaman Utama
├── app.js           # Logika Aplikasi (Fetch Data, UI Logic, PWA)
├── style.css        # Styling & Tema
├── sw.js            # Service Worker untuk Cache & Offline
├── manifest.json    # Konfigurasi PWA (Icon, Nama, Warna)
└── README.md        # Dokumentasi ini
```

## 🚀 Cara Penggunaan

1.  **Buka Aplikasi**: Kunjungi link deploy (misal: GitHub Pages).
2.  **Pilih Level**: Tekan kartu level (N5 - N1).
3.  **Pilih Mode**: Pilih belajar **Kanji** atau **Kotoba**.
4.  **Mulai Belajar**:
    -   Tap kartu untuk membalik (melihat arti/detail).
    -   Tekan **Mudah** (✓) untuk lanjut ke kartu berikutnya.
    -   Tekan **Sulit** (✕) untuk menyimpan kartu ke daftar Review.
5.  **Review**: Di dashboard level, akses menu "Daftar Sulit" untuk mempelajari kembali kartu yang belum dikuasai.
6.  **Install**: Klik "Add to Home Screen" atau ikon install di browser untuk memasang aplikasi.

## 👤 Credits

Created by **Muhamad Juwandi** (Jwn Project)
&copy; 2026

---
*Dibuat dengan dedikasi untuk komunitas pembelajar Bahasa Jepang.*
