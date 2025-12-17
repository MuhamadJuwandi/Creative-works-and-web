# 🏢 Balda Corporate ID Automation Suite

![Banner](https://capsule-render.vercel.app/api?type=waving&color=0:333333,100:000000&height=200&section=header&text=Corporate%20Automation&fontSize=40&fontAlignY=40&desc=Data%20Processing%20%7C%20Dynamic%20PDF%20%7C%20Identity%20Management&descAlignY=65&descSize=18&animation=fadeIn)

<div align="center">

<img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" />
<img src="https://img.shields.io/badge/Pandas-150458?style=for-the-badge&logo=pandas&logoColor=white" />
<img src="https://img.shields.io/badge/ReportLab-FF9900?style=for-the-badge&logo=adobeacrobatreader&logoColor=white" />
<img src="https://img.shields.io/badge/Security-Data_Privacy-success?style=flat-square" />

[English](#-english) | [日本語](#-japanese) | [Bahasa Indonesia](#-bahasa-indonesia)

</div>

---

## 🔒 Confidentiality Notice / Privasi Data
> **Note:** Real employee data (photos, NIK, names) and production output files are **excluded** from this repository to comply with Data Privacy regulations. The CSV files provided in the `examples/` folder contain **synthetic/dummy data** for demonstration purposes only.

---

## 🇬🇧 English

### ⚡ Overview
This is a custom Desktop Automation Tool built for **Balda Company**. It bridges the gap between HR Database (CSV) and Graphic Design. Previously, ID Cards were designed manually one by one. This tool automates the process using Python.

### 🚀 Key Features
* **Batch Processing:** Converts raw CSV data (hundreds of employees) into ID Cards in seconds.
* **Dynamic Asset Loading:** Auto-imports employee photos based on ID numbers.
* **Smart QR Generation:** Automatically generates QR Codes linking to employee digital profiles.
* **Print-Ready Export:** Outputs high-resolution PDFs ready for the ID Card printer.

### 🔧 Tech Logic
1.  **Pandas**: Cleans and validates the `employee.csv` input.
2.  **QRcode Lib**: Generates unique QR images.
3.  **ReportLab / PIL**: Composites the photo, text, and QR onto the company ID template canvas.

---

## 🇯🇵 Japanese

### ⚡ 概要 (Overview)
これは「Balda社」向けに開発された**業務自動化ツール**です。人事データ（CSV）とデザイン作業を連携させます。従来の手作業によるIDカード作成プロセスをPythonで完全自動化しました。

> **注意:** 個人情報保護のため、実際社員データや写真は本リポジトリには含まれていません。デモ用にはダミーデータを使用しています。

### 🚀 主な機能
* **一括処理 (Batch Processing):** 数百人分の従業員データを数秒でIDカードに変換。
* **動的アセット読み込み:** 社員番号に基づいて顔写真を自動マッチング。
* **QRコード自動生成:** デジタルプロフィールにリンクするQRコードを瞬時に作成。
* **PDF出力:** 印刷機にそのまま送信可能な高解像度PDFを生成。

---

## 🇮🇩 Bahasa Indonesia

### ⚡ Gambaran Umum
Aplikasi desktop otomatisasi yang dibuat khusus untuk kebutuhan operasional **Perusahaan Balda**. Alat ini menghubungkan database HR (CSV) dengan output desain grafis, menghilangkan proses manual pembuatan ID Card satu per satu.

### 🚀 Fitur Utama
* **Import Data Massal:** Membaca data CSV karyawan dan memprosesnya sekaligus.
* **Auto-Design:** Menempelkan Foto, Nama, Jabatan, dan NIK ke template desain secara presisi.
* **QR Code Generator:** Membuat QR Code unik untuk setiap karyawan secara otomatis.
* **Ekspor PDF:** Hasil akhir berupa file PDF yang siap dicetak oleh mesin printer ID Card.

---

### 💻 How to Run (Demo)

Because the real data is private, use the provided dummy generator:

```bash
# 1. Install Dependencies
pip install -r requirements.txt

# 2. Run the application (using dummy data in /examples)
python src/app.py --demo
