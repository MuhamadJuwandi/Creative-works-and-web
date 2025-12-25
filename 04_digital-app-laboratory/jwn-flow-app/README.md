<div align="center">

<img src="assets/Landscape.png" alt="JWN Flow Dashboard" width="100%" style="border-radius: 12px; margin-bottom: 20px;">

# 🌊 JWN Flow: Algorithmic Habit Architecture

[![Status](https://img.shields.io/badge/Status-Active-success?style=for-the-badge&logo=activitypub&logoColor=white)](https://github.com/MuhamadJuwandi)
[![Tech](https://img.shields.io/badge/Stack-PWA%20%7C%20Vanilla%20JS-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Style](https://img.shields.io/badge/Design-Minimalist%20Dark-121212?style=for-the-badge&logo=figma&logoColor=white)](style.css)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

<br>

<b>
[🇬🇧 English](#-english) | [🇯🇵 日本語](#-japanese) | [🇮🇩 Bahasa Indonesia](#-indonesian)
</b>

</div>

---

<table>
<tr>
<td width="65%" valign="top">

## 🇬🇧 English

### ⚡ Overview
**JWN Flow** is a Progressive Web App (PWA) designed to engineer personal productivity through a **7-Day Cyclic Algorithm**. Unlike standard to-do lists, this application treats habit formation as a progressive data stream.

As a **Data Scientist & Graphic Designer**, I built this to merge aesthetic usability with strict behavioral logic ($Day_n \pmod 7$).

### 🚀 Key Features
* **Algorithmic Scheduling**: Automatically rotates schedules based on `START_DATE`.
* **Local Data Persistence**: Uses Browser `localStorage` (No SQL required).
* **PWA Standard**: Offline-ready for iOS/Android.
* **Journaling**: Low-latency input for daily retrospectives.

<br>

## 🇯🇵 Japanese

### ⚡ 概要 (Overview)
**JWN Flow**は、7日間のサイクルアルゴリズムを通じて個人の生産性を設計する**PWA (Progressive Web App)** です。習慣形成を「データストリーム」として扱い、ユーザーを自己改善へと導きます。

**データサイエンティスト**兼**デザイナー**として、機能的ロジックと美的UIを融合させました。

### 🚀 主な機能
* **アルゴリズム管理**: `START_DATE` に基づく自動スケジュール回転。
* **ローカル保存**: `localStorage` を使用し、プライバシーを保護。
* **オフライン対応**: Service Workerによるキャッシュ戦略。

</td>

<td width="35%" valign="top" align="center">
  <br>
  <img src="assets/Potrait.png" alt="Mobile View" width="100%" style="border-radius: 15px; border: 2px solid #30363d;">
  <br><br>
  <div align="center">
    <i>📱 Mobile Interface</i>
  </div>
</td>
</tr>
</table>

---

## 🇮🇩 Indonesian

### ⚡ Ringkasan
**JWN Flow** adalah aplikasi PWA yang dirancang menggunakan **Logika Siklus 7-Hari**. Aplikasi ini tidak sekadar mencatat tugas, tetapi mengatur pembentukan kebiasaan melalui fase "Upgrade Diri" yang terstruktur secara matematis.

Menggabungkan **Logic Coding** dan **UI/UX Design**, proyek ini berfokus pada efisiensi memori dan estetika visual.

### 🛠 Tech Stack & Architecture
* **Core**: HTML5, CSS3 (Dark Mode Vars), Vanilla JS (ES6+).
* **Logic**: Date Object manipulation for cyclic rendering.
* **Storage**: JSON-based local state management.

---

## 📂 Repository Structure

```bash
JWN-Flow/
├── 📄 index.html      # DOM Structure & Layout
├── 🧠 script.js       # Core Logic (Time Calculation)
├── 🎨 style.css       # UI Design (CSS Variables)
├── ⚙️ sw.js           # Service Worker (Offline Cache)
└── 📱 manifest.json   # PWA Config (Installability)

```

## 💻 Installation

1. **Clone the Repo**
```bash
git clone [https://github.com/MuhamadJuwandi/JWN-Flow.git](https://github.com/MuhamadJuwandi/JWN-Flow.git)

```


2. **Run Locally (Python)**
```bash
cd JWN-Flow
python -m http.server 8000

```


3. **Access**
Open `http://localhost:8000` in your browser.

---

<div align="center">

**Developed by Muhamad Juwandi**

*Data Science Student | Graphic Designer | Japanese Learner*

<a href="https://www.google.com/search?q=https://linkedin.com/in/muhamadjuwandi"><img src="https://www.google.com/search?q=https://img.shields.io/badge/LinkedIn-Connect-0077B5%3Fstyle%3Dfor-the-badge%26logo%3Dlinkedin%26logoColor%3Dwhite"></a>
<a href="https://www.google.com/search?q=https://instagram.com/muhamadjuwandi"><img src="https://www.google.com/search?q=https://img.shields.io/badge/Instagram-Follow-E4405F%3Fstyle%3Dfor-the-badge%26logo%3Dinstagram%26logoColor%3Dwhite"></a>

</div>
