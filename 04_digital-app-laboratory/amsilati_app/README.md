<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=1F7A3F&height=280&section=header&text=Ngarti%20(Ngaji%20Amsilati)&fontSize=70&fontColor=ffffff&fontAlignY=40&desc=Serverless%20PWA%20Learning%20Platform%20integrated%20with%20Google%20Sheets%20Database&descAlignY=60&descSize=20&animation=fadeIn" alt="Ngarti Banner" width="100%"/>

<p align="center">
  <img src="https://img.shields.io/badge/PWA-Progressive%20Web%20App-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white" alt="PWA" />
  <img src="https://img.shields.io/badge/Google%20Sheets-API%20Integration-34A853?style=for-the-badge&logo=google-sheets&logoColor=white" alt="Google Sheets" />
  <img src="https://img.shields.io/badge/Javascript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JS" />
  <img src="https://img.shields.io/badge/PDF.js-Document%20Rendering-EC1C24?style=for-the-badge&logo=adobeacrobatreader&logoColor=white" alt="PDF.js" />
</p>

<h4>
  <a href="#english">🇬🇧 English</a> | 
  <a href="#japanese">🇯🇵 日本語</a> | 
  <a href="#indonesian">🇮🇩 Bahasa Indonesia</a>
</h4>

<br>

<img src="https://via.placeholder.com/800x400/165c2f/ffffff?text=App+Dashboard+Screenshot+(Desktop+%26+Mobile)" alt="App Demo" style="border-radius: 15px; box-shadow: 0px 10px 20px rgba(0,0,0,0.2);">

</div>

<hr>

<a id="english"></a>

## 🇬🇧 Project Overview

**Ngarti (Ngaji Amsilati)** is a Progressive Web App (PWA) designed to digitize the learning process of the Amsilati method. Unlike traditional apps that require complex backend infrastructure, this project leverages a **Serverless Data Pipeline** approach using **Google Sheets as a CMS (Content Management System)**.

By utilizing Google Apps Script, the app transforms spreadsheet rows into a JSON API endpoint, which is then fetched asynchronously by the frontend. This architecture demonstrates cost-effective data handling suitable for educational institutions.

### 🚀 Key Features
* **Dynamic Data Fetching:** Content (Lessons & Quizzes) is managed in Google Sheets and updated in real-time without app redeployment.
* **Integrated PDF Viewer:** Embedded `PDF.js` for reading "Hafalan" materials seamlessly within the app.
* **Offline First:** Built with Service Workers to ensure accessibility even with unstable internet connections (PWA Standard).
* **Interactive Quiz:** Logic-based assessment system parsing JSON data directly from the spreadsheet.

### 🛠 Tech Stack
* **Frontend:** HTML5, CSS3 (Custom Variables), Vanilla JavaScript (ES6+).
* **Backend/Data:** Google Sheets API, Google Apps Script (GAS).
* **Tools:** PDF.js, PWA Manifest, Service Workers.

---

<a id="japanese"></a>

## 🇯🇵 プロジェクト概要 (Project Overview)

**Ngarti（ンガルティ）**は、アムシラティ（Amsilati）学習メソッドをデジタル化するために設計されたプログレッシブウェブアプリ（PWA）です。このプロジェクトは、複雑なバックエンドサーバーを使用せず、**GoogleスプレッドシートをCMS（コンテンツ管理システム）として活用**するサーバーレス・データパイプラインを採用しています。

Google Apps Script (GAS) を利用してスプレッドシートのデータをJSON形式のAPIエンドポイントに変換し、フロントエンド側で非同期に取得します。このアーキテクチャは、教育機関向けに低コストかつ効率的なデータ運用を実現するモデルケースです。

### 🚀 主な機能 (Key Features)
* **動的データ取得 (Dynamic Fetching):** 教材やクイズの内容はGoogleスプレッドシートで管理され、アプリを再デプロイすることなくリアルタイムで更新されます。
* **PDFリーダー統合:** `PDF.js` を組み込み、アプリ内でシームレスに学習資料（Hafalan）を閲覧可能です。
* **オフライン対応 (PWA):** Service Workerを実装しており、不安定なインターネット環境でも学習を継続できます。
* **インタラクティブ・クイズ:** スプレッドシートから解析されたJSONデータに基づくロジックベースの評価システム。

### 🛠 使用技術 (Tech Stack)
* **フロントエンド:** HTML5, CSS3, JavaScript (Vanilla ES6+).
* **バックエンド/データ:** Google Sheets API, Google Apps Script.
* **ツール:** PDF.js, Service Worker.

---

<a id="indonesian"></a>

## 🇮🇩 Dokumentasi & Panduan Deployment

Aplikasi ini menggunakan pendekatan **"No-Code Database"** di mana seluruh data materi dan kuis dikontrol penuh melalui Google Sheets. Berikut adalah panduan teknis untuk menghubungkan aplikasi dengan database Anda.

### 📂 Struktur Data & Deployment

#### 1. Persiapan Database (Google Sheets)
Untuk menjalankan aplikasi ini, Anda memerlukan endpoint API sendiri.
1.  **Duplikasi Template Database**:
    * [Template Materi (Spreadsheet)](https://docs.google.com/spreadsheets/d/16iKrQEe6FW4LUP5F7HP4dvyUM-qvjaZ2tH95x0WkZdw/edit?usp=sharing)
    * [Template Quiz (Spreadsheet)](https://docs.google.com/spreadsheets/d/1sTQUgJ9fOFh1zWNgW4BiSDHmvjx9F-4KFHSJA9uz3xg/edit?usp=sharing)
    * *Note: Pastikan nama Tab Sheet adalah `Materi` dan `Quiz` (Case sensitive).*
2.  **Setup Google Apps Script**:
    * Di Google Sheets, buka menu **Extensions > Apps Script**.
    * Copy-Paste kode dari file `google_apps_script.js` di repository ini.
3.  **Generate API Endpoint**:
    * Klik **Deploy > New Deployment**.
    * Pilih type: **Web App**.
    * Who has access: **Anyone** (Wajib, agar app bisa membaca data JSON).
    * Klik **Deploy** dan salin URL yang berakhiran `/
