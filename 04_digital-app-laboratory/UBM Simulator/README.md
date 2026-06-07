# 📱 UBM Simulator: Aplikasi Ujian UT Berbasis Mobile
![Banner](https://capsule-render.vercel.app/api?type=waving&color=0:004073,100:00BCD4&height=250&section=header&text=UBM%20Simulator&fontSize=45&fontAlignY=40&desc=Simulasi%20Ujian%20Mobile%20UT%20%7C%20PWA%20Ready%20%7C%20No%20Backend&descAlignY=60&descSize=18&animation=fadeIn&fontColor=ffffff)

<div align="center">

  
  <br><br>

  <img src="https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" />
  <img src="https://img.shields.io/badge/HTML5-Mobile_First-E34F26?style=for-the-badge&logo=html5&logoColor=white" />
  <img src="https://img.shields.io/badge/IndexedDB-Local_Database-1572B6?style=for-the-badge&logo=databricks&logoColor=white" />
  <img src="https://img.shields.io/badge/PDF.js-Renderer-B30B00?style=for-the-badge&logo=adobe-acrobat-reader&logoColor=white" />

  <br/>

  [English](#-english) | [Bahasa Indonesia](#-bahasa-indonesia)

</div>

---

## 🎯 Core Concept
> **Unique Selling Point:** Aplikasi ini berjalan 100% di sisi klien (*client-side*) tanpa memerlukan backend server. Dibangun menyerupai antarmuka asli Ujian Berbasis Mobile Universitas Terbuka, aplikasi ini memberikan pengalaman simulasi ujian UAS sesungguhnya langsung dari *browser* atau layar beranda HP Anda (sebagai PWA).

---

## 🇮🇩 Bahasa Indonesia

### ⚡ Gambaran Umum
**UBM Simulator** adalah aplikasi web ringan (*Single Page Application*) yang dibuat khusus sebagai sarana simulasi Ujian Akhir Semester (UAS) Universitas Terbuka. Aplikasi ini mengimitasi UI/UX aplikasi resmi UT secara presisi. Mulai dari pengunggahan modul PDF hingga perhitungan skor otomatis, semuanya berjalan mulus dan cepat.

### 🛠️ Fitur Teknis
* **📱 Mobile-First PWA:** Terasa seperti aplikasi *native* di HP Anda. Bisa diinstal ke layar beranda tanpa perlu lewat Play Store.
* **📄 Integrasi PDF Dinamis:** Menggunakan `PDF.js` untuk merender soal secara langsung. Termasuk *floating toolbar* untuk fitur *Zoom In/Out*, *Fullscreen*, dan dukungan *drag/pan* layar sentuh.
* **💾 Database Lokal (`IndexedDB`):** Progress ujian, jawaban, hingga file PDF tersimpan di memori lokal browser. Anda bisa melanjutkan (resume) sesi ujian kapan saja walau aplikasi tak sengaja tertutup.
* **⏱️ Timer & Auto-Scoring:** Menyimulasikan durasi ujian nyata (2 Jam) beserta sistem skoring langsung, lengkap dengan opsi *review* jawaban salah.

---

## 🇬🇧 English

### ⚡ Project Overview
**UBM Simulator** is a lightweight, client-side web application designed to simulate the Mobile-Based Exam (UBM) environment of Universitas Terbuka. It accurately replicates the official app's UI/UX, allowing students to practice and familiarize themselves with the testing system using their own PDF question banks.

### 🛠️ Key Features
* **📱 Progressive Web App (PWA):** Installs directly to your home screen. Fully responsive mobile-first design.
* **📄 Native PDF Rendering:** Leverages `PDF.js` to render PDF questions inside the app, complete with zoom controls, fullscreen mode, and touch-drag panning capabilities.
* **💾 Persistent Offline Storage:** Utilizes `IndexedDB` to securely save your active session, timer, and answers. Close the app accidentally? Just open it back up and resume exactly where you left off.
* **⏱️ Realistic Exam Mechanics:** Features a built-in 2-hour countdown timer, automated scoring with confetti animations, and an interactive review system for incorrect answers.

---

### 💻 Cara Menggunakan (How to Use)

1. **Akses Aplikasi**: Buka file `index.html` di browser Anda atau gunakan *Live Server* / GitHub Pages.
2. **Tambah Ujian**: Di halaman *Dashboard*, tekan tombol `(+)` di pojok kanan bawah.
3. **Upload Modul Soal**: Masukkan file PDF soal Anda. 
4. **Input Kunci Jawaban**: Ketik kunci jawaban dengan format rapat (contoh: `AABBCD...`) atau bernomor (contoh: `1.A 2.B...`).
5. **Mulai Latihan**: Kembali ke *Dashboard*, klik **Mulai Ujian ▶**, dan selamat berlatih!

---
*Dibuat untuk memudahkan simulasi pembelajaran mandiri mahasiswa Universitas Terbuka.*
