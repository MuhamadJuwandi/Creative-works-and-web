<div align="center">
  <img src="assets/logo.png" alt="Logo UT" width="120" />
  # UBM Simulator
  **Aplikasi Simulasi Ujian Berbasis Mobile (UBM) Universitas Terbuka**
  
  <p align="center">
    <a href="#fitur-utama">Fitur Utama</a> •
    <a href="#teknologi">Teknologi</a> •
    <a href="#cara-penggunaan">Cara Penggunaan</a> •
    <a href="#instalasi">Instalasi & PWA</a>
  </p>
  ![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
  ![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
  ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
  ![PWA Ready](https://img.shields.io/badge/PWA-Ready-4CAF50?style=for-the-badge&logo=pwa&logoColor=white)
</div>
<br/>
## 📖 Tentang Aplikasi
**UBM Simulator** adalah sebuah aplikasi web (Single Page Application) yang dirancang khusus untuk mahasiswa Universitas Terbuka (UT) sebagai sarana latihan soal Ujian Akhir Semester (UAS). Aplikasi ini meniru secara akurat *User Interface* (UI) dan *User Experience* (UX) dari aplikasi resmi Ujian Berbasis Mobile UT, sehingga mahasiswa dapat membiasakan diri dengan lingkungan ujian sesungguhnya.
---
## ✨ Fitur Utama
- 📱 **Mobile-First Design**: Tampilan yang dioptimalkan untuk layar ponsel, memberikan pengalaman yang identik dengan aplikasi asli.
- 📄 **Integrasi Modul PDF**: Mendukung pengunggahan soal dalam bentuk PDF. Termasuk fitur *Zoom In/Out*, *Pan/Drag*, dan *Fullscreen* untuk membaca soal dengan nyaman.
- 💾 **Local Storage & Auto-Save**: Menggunakan `IndexedDB`. Progres ujian Anda tidak akan hilang meski aplikasi tertutup tanpa sengaja. Anda bisa melanjutkannya (Resume) kapan saja!
- ⏱️ **Real-time Timer & Auto Submit**: Simulasi waktu ujian selama 2 Jam secara *real-time*.
- 📊 **Skoring & Review Otomatis**: Ketahui skor Anda segera setelah ujian selesai, lengkap dengan animasi *confetti* 🎉, serta fitur review untuk melihat jawaban yang salah beserta kunci jawaban yang benar.
- 📥 **Progressive Web App (PWA)**: Dapat diinstal langsung ke *Homescreen* HP Anda seperti aplikasi native dengan logo UT!
---
## 🛠️ Teknologi yang Digunakan
Aplikasi ini dibangun menggunakan teknologi web dasar yang kuat, tanpa bergantung pada framework berat (seperti React/Vue), memastikan performa yang secepat kilat:
| Komponen | Teknologi |
| :--- | :--- |
| **Struktur** | `HTML5` Semantic |
| **Styling** | `CSS3` Vanilla (Flexbox, Grid, CSS Variables) |
| **Logika** | `Vanilla JavaScript` (ES6+) |
| **Database** | `IndexedDB` (Penyimpanan lokal asinkron) |
| **PDF Renderer**| `PDF.js` (oleh Mozilla) |
---
## 🚀 Cara Penggunaan
1. **Buka Aplikasi**: Akses aplikasi ini melalui browser (disarankan via Chrome/Safari di HP).
2. **Tambah Ujian**: Di halaman *Dashboard*, klik tombol **(+)**.
3. **Upload Soal**: Pilih file PDF soal latihan Anda. *(Catatan: 1 halaman PDF diasumsikan berisi 1 soal untuk tampilan optimal)*.
4. **Masukkan Kunci Jawaban**: Masukkan kunci jawaban dengan format huruf yang rapat (Contoh: `ABCDABCD`) atau penomoran (Contoh: `1.A 2.B`). Sistem akan otomatis mendeteksi jumlah soal.
5. **Simpan & Mulai**: Klik Simpan, lalu tekan tombol **Mulai Ujian ▶** di dashboard.
6. **Selesaikan Ujian**: Ujian dapat diakhiri kapan saja dengan menekan tombol **Selesai Ujian**.
---
## 📲 Instalasi (PWA)
Anda tidak perlu mengunduh aplikasi ini dari Play Store. Anda dapat menginstalnya langsung dari browser:
**Pengguna Android (Chrome):**
1. Buka link web aplikasi ini di Chrome.
2. Ketuk ikon titik tiga di pojok kanan atas browser.
3. Pilih **"Tambahkan ke Layar Utama"** (*Add to Homescreen*).
4. Aplikasi akan terinstal dan logonya muncul di deretan aplikasi HP Anda.
**Pengguna iOS (Safari):**
1. Buka link web aplikasi ini di Safari.
2. Ketuk tombol **Share** (ikon kotak dengan panah ke atas) di bagian bawah.
3. Scroll ke bawah dan pilih **"Add to Home Screen"**.
4. Selesai!
---
## 📂 Cara Menjalankan Secara Lokal (Untuk Developer)
Karena aplikasi ini adalah *static web app*, Anda bisa langsung menjalankannya dengan *Live Server* atau server HTTP lokal.
```bash
# Menggunakan Python
python -m http.server 8080
# Menggunakan Node.js (http-server)
npx http-server -p 8080
```
Lalu buka `http://localhost:8080` di browser Anda.
---
<div align="center">
  <p>Dibuat dengan ❤️ untuk kemudahan belajar mahasiswa UT.</p>
</div>
<!DOCTYPE html>
<html lang="id">
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
    </script>
    <!-- Custom Styles -->
    <!-- Custom Styles & PWA -->
    <link rel="stylesheet" href="styles.css">
    <link rel="icon" href="assets/logo.png" type="image/png">
    <link rel="manifest" href="manifest.json">
    <link rel="apple-touch-icon" href="assets/logo.png">
</head>
<body>
</html>
{
  "name": "UBM Simulator (Universitas Terbuka)",
  "short_name": "UBM Sim",
  "description": "Aplikasi simulator latihan soal Ujian Akhir Semester (UAS) Universitas Terbuka berbasis mobile.",
  "start_url": "./index.html",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#004073",
  "icons": [
    {
      "src": "assets/logo.png",
      "sizes": "192x192 512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
