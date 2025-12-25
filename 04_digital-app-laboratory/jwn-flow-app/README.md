# 🌊 JWN Flow: Algorithmic Habit Architecture
<div align="center">
  <table>
    <tr>
      <td align="center" width="50%">
        <img src="PATH_FOTO_1.png" alt="Main Interface" style="width: 100%; border-radius: 10px;">
        <br>
        <b>🏠 Dashboard View</b>
      </td>
      <td align="center" width="50%">
        <img src="PATH_FOTO_2.png" alt="Journal Feature" style="width: 100%; border-radius: 10px;">
        <br>
        <b>📝 Journal Input</b>
      </td>
    </tr>
  </table>
</div>
![Project Banner](https://via.placeholder.com/1200x400/121212/1E6FD9?text=JWN+FLOW+|+Self-Optimization+PWA)
<div align="center">

[![Status](https://img.shields.io/badge/Status-Active-success?style=for-the-badge&logo=activitypub)](https://github.com/MuhamadJuwandi)
[![Tech](https://img.shields.io/badge/Stack-PWA%20%7C%20Vanilla%20JS-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Style](https://img.shields.io/badge/Design-Minimalist%20Dark-121212?style=for-the-badge&logo=figma&logoColor=white)](style.css)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

[English](#-english) | [日本語](#-japanese) | [Bahasa Indonesia](#-indonesian)

</div>

---

## 🇬🇧 English

### ⚡ Overview
**JWN Flow** is a Progressive Web App (PWA) designed to engineer personal productivity through a **7-Day Cyclic Algorithm**. Unlike standard to-do lists, this application treats habit formation as a progressive data stream, guiding the user through specific phases of "Self-Upgrade" before entering a maintenance loop.

As a **Data Scientist & Graphic Designer**, I built this to merge aesthetic usability with strict behavioral logic.

### 🚀 Key Features
* **Algorithmic Scheduling**: Automatically rotates schedules based on `START_DATE` logic (Day 1-7 Initialization $\rightarrow$ Day 8+ Maintenance Loop).
* **Local Data Persistence**: Uses Browser `localStorage` to save journal entries and state without external database dependencies (Privacy-first).
* **PWA Standard**: Installable on iOS/Android with offline capabilities (Service Worker implementation).
* **Journaling System**: Integrated fast-logging for daily retrospective data collection.

### 🛠 Tech Stack
* **Core**: HTML5, CSS3 (Variables for Dark Mode), Vanilla JavaScript (ES6+).
* **PWA**: `manifest.json`, `sw.js` (Cache & Network-First Strategy).
* **Data**: JSON-based local state management.

---

## 🇯🇵 Japanese

### ⚡ 概要 (Overview)
**JWN Flow**は、7日間のサイクルアルゴリズムを通じて個人の生産性を設計するために開発された**プログレッシブウェブアプリ (PWA)** です。一般的なToDoリストとは異なり、このアプリは習慣形成を「データストリーム」として扱い、ユーザーを特定の「自己改善フェーズ」へと導きます。

**データサイエンティスト**兼**グラフィックデザイナー**として、機能的なロジックと美しいUIを融合させることを目指しました。

### 🚀 主な機能 (Key Features)
* **アルゴリズムによるスケジュール管理**: `START_DATE` に基づいてスケジュールを自動的に回転させます（1〜7日目の導入期 $\rightarrow$ 8日目以降の維持期）。
* **ローカルデータ永続化**: ブラウザの `localStorage` を使用して日記や状態を保存します。外部データベースに依存しないため、プライバシーが守られます。
* **PWA対応**: iOS/Androidにインストール可能で、オフラインでも動作します（Service Worker実装）。
* **日誌システム (Journaling)**: 日々の振り返りデータを迅速に記録・収集するための機能を統合。

### 🛠 技術スタック (Tech Stack)
* **コア**: HTML5, CSS3, Vanilla JavaScript.
* **PWA**: Service Workerによるキャッシュ戦略.
* **データ**: JSONベースのローカルステート管理.

---

## 🇮🇩 Indonesian

### ⚡ Ringkasan
**JWN Flow** adalah Progressive Web App (PWA) yang dirancang untuk membangun produktivitas pribadi menggunakan **Logika Siklus 7-Hari**. Aplikasi ini tidak sekadar mencatat tugas, tetapi mengatur pembentukan kebiasaan (habit) melalui fase "Upgrade Diri" yang terstruktur secara matematis.

Proyek ini menggabungkan kemampuan **Logic Coding** dan **UI/UX Design** untuk menciptakan alat bantu produktivitas yang ringan, cepat, dan estetis.

### 🚀 Fitur Utama
* **Penjadwalan Otomatis**: Logika kode `script.js` secara otomatis mendeteksi hari ke-berapa pengguna berada sejak `START_DATE`.
* **Fase Maintenance**: Setelah Hari ke-7, sistem otomatis beralih ke jadwal "Loop" untuk menjaga konsistensi jangka panjang.
* **Manajemen Jurnal**: Fitur input cepat untuk mencatat evaluasi harian (data disimpan di memori HP masing-masing).
* **Mode Offline**: Berjalan tanpa internet berkat teknologi Service Worker.

---

## 📂 Repository Structure

```bash
JWN-Flow/
├── index.html        # Main App Interface (DOM Structure)
├── script.js         # Core Logic (Time Calculation, State Management)
├── style.css         # UI/UX Design (CSS Variables, Flexbox/Grid)
├── sw.js             # Service Worker (Caching & Offline Support)
├── manifest.json     # PWA Configuration (Icons, Standalone Mode)
└── README.md         # Documentation

```

## 💻 Installation & Usage

### Method 1: Direct Usage (Web)

Simply open the `index.html` file in a modern browser.

### Method 2: Local Server (Recommended for PWA testing)

If you have Python installed:

```bash
# Clone the repository
git clone [https://github.com/MuhamadJuwandi/JWN-Flow.git](https://github.com/MuhamadJuwandi/JWN-Flow.git)

# Navigate to directory
cd JWN-Flow

# Start a simple HTTP server
python -m http.server 8000

```

*Access the app at `http://localhost:8000*`

### Method 3: Future Data Analysis (Planned)

Planned Python script to analyze the `localStorage` JSON dump for habit consistency metrics.

```python
# Coming soon: Data extraction script
import pandas as pd
import json
# ...

```

---

<div align="center">

**Developed by Muhamad Juwandi**





*Data Science Student | Graphic Designer | Japanese Learner*

[Instagram](https://www.google.com/search?q=https://instagram.com/muhamadjuwandi) • [LinkedIn](https://www.google.com/search?q=https://linkedin.com/in/muhamadjuwandi)

</div>

```

```
