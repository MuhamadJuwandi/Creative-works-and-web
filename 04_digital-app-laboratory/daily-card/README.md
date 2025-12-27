# 🇯🇵 Daily Card: JLPT Flashcard PWA

<div align="center">

<img src="assets/Spanduk%20App.png" alt="Daily Card Dashboard" width="100%" style="border-radius: 12px; margin-bottom: 20px;">

[![Status](https://img.shields.io/badge/Status-Production-success?style=for-the-badge&logo=google-play&logoColor=white)](https://github.com/MuhamadJuwandi)
[![Tech](https://img.shields.io/badge/Core-Vanilla%20JS%20%7C%20PWA-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](app.js)
[![Data](https://img.shields.io/badge/Data-Google%20Sheets%20CMS-34A853?style=for-the-badge&logo=googlesheets&logoColor=white)](https://docs.google.com)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

<br>

<b>
<a href="#english">🇬🇧 English</a> &nbsp;|&nbsp; 
<a href="#japanese">🇯🇵 日本語</a> &nbsp;|&nbsp; 
<a href="#indonesian">🇮🇩 Bahasa Indonesia</a>
</b>

</div>

---

<table>
<tr>
<td width="65%" valign="top">

<h2 id="english">🇬🇧 English</h2>

### ⚡ Overview
**Daily Card** is a high-performance **Progressive Web App (PWA)** engineered to streamline Japanese vocabulary mastery (JLPT N5–N1). Unlike traditional apps, it utilizes a **CSV-based Backend** (Google Sheets) to allow dynamic content updates without redeploying code.

Designed with a **"No-Framework"** philosophy, the app runs on pure Vanilla JS, ensuring instant load times and offline capability via Service Workers.

### 🚀 Key Features
* **📚 Full Spectrum (N5-N1)**: Structured curriculum for both *Kanji* and *Kotoba*.
* **🎨 Dynamic Theming**: UI colors adapt algorithmically based on the selected JLPT level (e.g., N5=Blue, N4=Red).
* **🔄 Smart Review System**: Logic that segregates "Hard" cards into a specific review queue for Spaced Repetition.
* **⚡ Offline First**: Service Worker implementation guarantees functionality without internet.

<br>

<h2 id="japanese">🇯🇵 Japanese</h2>

### ⚡ 概要 (Overview)
**Daily Card**は、JLPT N5からN1までの**漢字**と**言葉**を効率的に習得するために設計された**PWA (Progressive Web App)** です。Googleスプレッドシートをデータベースとして使用し、コンテンツの更新をリアルタイムに行います。

**「フレームワーク不使用」** という設計思想により、Vanilla JSのみで構築され、高速な動作とオフライン学習を実現しました。

### 🚀 主な機能
* **📚 全レベル対応**: N5〜N1の教材を網羅。
* **🎨 動的テーマ**: レベルに合わせてUIカラーが自動変化（例：N5=青、N3=緑）。
* **🔄 復習アルゴリズム**: 「難しい」とマークされたカードを自動的にリスト化し、重点的な復習をサポート。
* **⚡ オフライン対応**: インターネット接続がなくても学習可能。

</td>

<td width="35%" valign="top" align="center">
  <br>
  <img src="assets/Mobile_Screenshot_Placeholder.png" alt="Mobile View" width="100%" style="border-radius: 15px; border: 2px solid #30363d;">
  <br><br>
  <div align="center">
    <i>📱 Mobile Interface</i>
    <br>
    <sub>(Responsive & Touch Friendly)</sub>
  </div>
</td>
</tr>
</table>

---

<h2 id="indonesian">🇮🇩 Indonesian</h2>

### ⚡ Ringkasan
**Daily Card** adalah aplikasi Flashcard interaktif yang saya rancang untuk menyelesaikan masalah "manajemen memori" dalam belajar bahasa. Menggunakan arsitektur **PWA**, aplikasi ini dapat diinstal layaknya aplikasi native namun berjalan di atas teknologi web yang ringan.

Poin unik proyek ini adalah penggunaan **Google Sheets sebagai CMS**. Artinya, penambahan kosakata baru cukup dilakukan di Excel/Spreadsheet, dan aplikasi akan otomatis memperbaruinya via CSV fetching.

### 🛠️ Tech Stack & Optimization
Project ini dibangun dengan **Vanilla Technologies** untuk performa maksimal:

* **Core**: HTML5, CSS3 (CSS Variables/Flexbox), JavaScript (ES6+).
* **PWA Engine**: `manifest.json` untuk installability & `sw.js` untuk caching asset.
* **Data Pipeline**: `fetch()` API yang mengonsumsi data mentah CSV dari Google Sheets.
* **UI Logic**: Custom DOM Manipulation (Tanpa React/Vue) untuk menjaga ukuran bundle tetap kecil (<50KB).

---

## 📂 Repository Structure

```bash
Daily-Card/
├── 📂 assets/         # App Icons, Banners, & UX Assets
├── 📄 index.html      # Main DOM Structure (SEO Optimized)
├── 🧠 app.js          # Core Logic (Fetch Data, Flashcard Logic)
├── 🎨 style.css       # Dynamic CSS (Theming System)
├── ⚙️ sw.js           # Service Worker (Offline Strategy)
└── 📱 manifest.json   # PWA Configuration

```

## 🚀 Installation & Usage

### Method 1: Direct Usage (Web/Mobile)

1. **Open Link**: Visit the GitHub Pages deployment.
2. **Install**: Click "Add to Home Screen" on iOS/Android.
3. **Start**: Select Level (N5-N1) -> Choose Mode (Kanji/Kotoba).

### Method 2: Local Development

```bash
# Clone repository
git clone [https://github.com/MuhamadJuwandi/Daily-Card.git](https://github.com/MuhamadJuwandi/Daily-Card.git)

# Navigate
cd Daily-Card

# Run simple server (Python 3)
python -m http.server 8000

```

*Access at `http://localhost:8000*`

---

<div align="center">

**Developed by Muhamad Juwandi**


*Jwn Project • © 20
