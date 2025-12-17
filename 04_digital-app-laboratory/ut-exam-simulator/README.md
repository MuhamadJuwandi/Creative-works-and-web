# 🎓 UT Exam Simulator (CBT Engine)

<div align="center">
  <img src="assets/Dashboard.png" width="100%" alt="Exam Simulator Interface">
  
  <br><br>

  <img src="https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />
  <img src="https://img.shields.io/badge/IndexedDB-Local_Storage-green?style=for-the-badge&logo=google-cloud&logoColor=white" />
  <img src="https://img.shields.io/badge/PDF.js-Rendering-red?style=for-the-badge&logo=adobeacrobatreader&logoColor=white" />

  <br/>

  [English](#-english) | [日本語](#-japanese) | [Bahasa Indonesia](#-bahasa-indonesia)

</div>

---

## 💾 Local Storage Architecture
> **Engineering Note:** This application uses **Native IndexedDB** (`db.js`) to store exam history and sessions locally within the user's browser. It demonstrates a **Serverless Architecture** approach where the client handles data persistence without an external backend.

---

## 🇬🇧 English

### ⚡ Project Overview
A custom **Computer Based Test (CBT)** engine designed to simulate the exact examination environment of *Universitas Terbuka*. I built this to solve a personal pain point: the lack of a realistic platform to practice with custom question sets (PDFs).

### 🛠️ Key Technical Features
* **PDF.js Integration:** Renders exam question papers (PDF) directly in the browser canvas, allowing split-screen viewing (Question vs. Answer Sheet).
* **Smart Answer Parsing:** The system accepts answer keys as a raw string (e.g., "1.A, 2.B") and automatically parses them into a grading logic using Regex.
* **Custom IndexedDB Wrapper:** I wrote a custom `db.js` module to manage CRUD operations for Exam History and Sessions, ensuring data persists even after refreshing the page.
* **Responsive Logic:** State management in `app.js` ensures the timer and answers are synced across mobile and desktop views.

---

## 🇯🇵 Japanese

### ⚡ 概要 (Overview)
インドネシアのオープン大学（Universitas Terbuka）のCBT試験環境を完全に再現した**模擬試験エンジン**です。既存の学習ツールではPDFの問題集を本番形式で解くことができなかったため、自らの学習効率を最大化するために開発しました。

### 🛠️ 技術的特徴
* **PDFレンダリング:** `PDF.js`ライブラリを使用し、ブラウザ上で問題用紙（PDF）を直接描画します。
* **自動採点ロジック:** 解答キー（例: "1.A, 2.B"）を文字列として入力すると、正規表現を用いて自動的に採点システムに変換します。
* **ローカルDB設計:** 外部サーバーを使わず、ブラウザ標準の `IndexedDB` を直接操作する `db.js` を自作し、試験履歴やセッションデータを永続化しています。
* **UXデザイン:** 本番の試験特有の「緊張感」やUIの操作感をTailwind CSSで忠実に再現しました。

---

## 🇮🇩 Bahasa Indonesia

### ⚡ Gambaran Umum
Mesin **Computer Based Test (CBT)** yang dirancang khusus untuk mensimulasikan antarmuka ujian asli **Universitas Terbuka**. Aplikasi ini lahir dari kebutuhan pribadi saya untuk berlatih mengerjakan soal-soal Latihan Mandiri (LM) yang biasanya hanya berupa file PDF, kini bisa dikerjakan layaknya ujian sungguhan.

### 🛠️ Fitur Teknis
* **Simulasi Realistis:** Meniru UI, penghitung waktu mundur, dan navigasi soal persis seperti aplikasi ujian asli kampus.
* **PDF Parser:** Mengintegrasikan `PDF.js` untuk menampilkan soal ujian di sisi kiri layar sambil menjawab di sisi kanan.
* **Manajemen Database Client-Side:** Menggunakan **IndexedDB** (tanpa database server) untuk menyimpan riwayat nilai dan sesi ujian. Saya menulis kode `db.js` secara manual untuk mengontrol performa penyimpanan data.
* **Analisis Hasil:** Menampilkan skor otomatis dan kunci jawaban yang benar setelah ujian selesai.

---

### 💻 How to Run

1.  Clone this repository.
2.  Open `index.html` in your browser.
3.  **Create New Exam:** Upload your PDF question file and input the answer key.
4.  **Start Simulation:** The app will lock into "Exam Mode".
