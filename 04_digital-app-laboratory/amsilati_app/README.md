# Panduan Deployment Aplikasi Ngarti (Amsilati)

Aplikasi ini adalah Progressive Web App (PWA) yang menggunakan Google Sheets sebagai database.

## 1. Persiapan Google Sheets & Apps Script
Agar aplikasi bisa memuat materi & soal, Anda perlu mengaktifkan "API" sederhana menggunakan Google Apps Script.

### Langkah-langkah:
1. **Buka Google Sheets**
   - Gunakan Template Materi: [Link Spreadsheet Materi](https://docs.google.com/spreadsheets/d/16iKrQEe6FW4LUP5F7HP4dvyUM-qvjaZ2tH95x0WkZdw/edit?usp=sharing)
   - Gunakan Template Quiz: [Link Spreadsheet Quiz](https://docs.google.com/spreadsheets/d/1sTQUgJ9fOFh1zWNgW4BiSDHmvjx9F-4KFHSJA9uz3xg/edit?usp=sharing)
   - *Disarankan menggabungkan keduanya dalam satu Spreadsheet (beda tab) agar lebih mudah, atau sesuaikan kode script jika terpisah.*

   **PENTING**: Pastikan nama Sheet (Tab) adalah `Materi` dan `Quiz` (Perhatikan huruf besar/kecil).

2. **Pasang Apps Script**
   - Di Google Sheet, klik menu **Extensions > Apps Script**.
   - Hapus semua kode yang ada disana.
   - Buka file `google_apps_script.js` yang ada di folder proyek ini (atau copy dari bawah).
   - Paste kode tersebut ke editor Apps Script.

3. **Deploy sebagai Web App**
   - Klik tombol biru **Deploy** > **New Deployment**.
   - Klik icon roda gigi (Select type) > **Web App**.
   - Description: `v1`
   - Execute as: **Me** (Gmail Anda).
   - **Who has access: Anyone** (Penting: agar aplikasi bisa akses data).
   - Klik **Deploy**.
   - Salin **Web App URL** (yang berakhiran `/exec`).

## 2. Konfigurasi Aplikasi
1. Buka file `js/app.js` di folder proyek ini.
2. Cari bagian paling atas `const CONF`.
3. Ganti `API_URL` dengan URL yang Anda dapatkan dari langkah deploy di atas.

```javascript
const CONF = {
    API_URL: 'https://script.google.com/macros/s/XXXXX/exec', // Ganti ini!
    ...
};
```

## 3. Upload ke GitHub Pages
1. Upload folder `amsilati_app` ke repository GitHub baru.
2. Masuk ke **Settings > Pages**.
3. Pada **Source**, pilih `Deploy from a branch`.
4. Pilih branch `main` dan folder `/ (root)`.
5. Klik **Save**.
6. Tunggu beberapa menit, link website akan muncul.

## 4. Cara Install di HP (Android)
1. Buka link website di Google Chrome.
2. Tunggu sebentar, biasanya muncul notifikasi "Add to Home Screen".
3. Jika tidak, klik titik tiga di pojok kanan atas > **Install App** atau **Tambahkan ke Layar Utama**.

## 5. Dokumentasi Kolom Spreadsheet (DETAIL)

Berikut adalah penjelasan lengkap untuk setiap kolom yang **WAJIB** ada di spreadsheet Anda. Copy header kolomnya ke baris pertama (Row 1).

### A. Sheet "Materi"
**Header:** `id` | `jilid` | `judul` | `urutan` | `konten_md` | `status`

| Kolom | Penjelasan | Contoh Isi |
| :--- | :--- | :--- |
| **id** | Kode unik untuk identitas materi. Tidak boleh ada yang kembar. | `m1-01`, `mat-j1-02` |
| **jilid** | Menentukan materi ini masuk ke folder Jilid berapa di aplikasi. (Angka 1-5). | `1` |
| **judul** | Judul bab atau fasal yang akan tampil di daftar materi. | `Pengenalan Isim` |
| **urutan** | Angka untuk mengatur urutan materi dari atas ke bawah. | `1`, `2`, `10` |
| **konten_md** | Isi lengkap materi. Bisa menggunakan HTML dasar atau format teks biasa. Gunakan tanda bintang dua `**teks**` untuk menebalkan huruf. | `Ini adalah **Isim**. Contohnya...` |
| **status** | Status publikasi. Jika diisi `draft`, materi tidak akan muncul di aplikasi. | `publish` |

---

### B. Sheet "Quiz"
**Header:** `question_id` | `jilid` | `nomor` | `pertanyaan` | `opsi_a` | `opsi_b` | `opsi_c` | `opsi_d` | `jawaban_benar` | `pembahasan` | `status`

| Kolom | Penjelasan | Contoh Isi |
| :--- | :--- | :--- |
| **question_id** | Kode unik soal. Wajib beda tiap baris. | `q1-01`, `soal-005` |
| **jilid** | Level jilid untuk soal ini (1-5). | `1` |
| **nomor** | (Opsional) Hanya untuk bantuan Anda mengurutkan nomor soal di Excel. | `1` |
| **pertanyaan** | Teks pertanyaan soal. Bisa mengandung HTML jika perlu. | `Apa tanda isim yang pertama?` |
| **opsi_a** | Pilihan Jawaban A. | `Tanwin` |
| **opsi_b** | Pilihan Jawaban B. | `Alif Lam` |
| **opsi_c** | Pilihan Jawaban C. | `Jer` |
| **opsi_d** | Pilihan Jawaban D. | `Huruf Nida` |
| **jawaban_benar** | Kunci jawaban. **PENTING**: Isi teks harus PERSIS sama (huruf besar/kecil/spasi) dengan salah satu kolom opsi. JANGAN isi "A" atau "B", tapi isi teks jawabannya. | `Tanwin` |
| **pembahasan** | Penjelasan yang muncul ketika siswa salah menjawab. Gunakan untuk edukasi. | `Tanda isim pertama adalah Tanwin...` |
| **status** | Status soal. Isi `publish` agar muncul. | `publish` |
