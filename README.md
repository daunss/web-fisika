# 🚗 SIMULATOR FISIKA GLB & PENGOLAH DATA PRAKTIKUM
### Proyek Project-Based Learning (PBL) 1 • Mata Kuliah Fisika Dasar • Program Studi Informatika

Aplikasi web interaktif berkinerja tinggi yang mengintegrasikan **Konsep Fisika Dasar (Kinematika - Gerak Lurus Beraturan / GLB)** dengan **Teknologi Informatika Modern (Bun, Elysia.js, SQLite, React, HTML5 Canvas 60 FPS)** dan **Analisis Data Praktikum Riil**.

Desain antarmuka mengadopsi estetika **Cyber-Retro Pixel Art Sci-Fi** yang selaras 100% dengan video pembelajaran berbasis AI [pixel-glb-1080p.mp4](file:///home/daun/projek-konten/pixel-fisika-video/out/pixel-glb-1080p.mp4).

---

## 📌 Integrasi 3 Produk Utama (Sesuai Panduan PBL)

Sesuai ketentuan buku panduan proyek, seluruh produk mengusung 1 tema terpadu: **Kinematika - GLB ($v = \text{konstan}, a = 0$)**:
1. **Produk 1 – Simulasi / Program Komputer**: Web Simulator GLB interaktif (aplikasi ini) dengan kontrol parameter, visualisasi kanvas 60 FPS, grafik realtime dinamis ($s-t$ dan $v-t$), serta pembuktian rumus manual vs komputasi.
2. **Produk 2 – Video Pembelajaran Berbasis AI**: Video animasi pixel platformer 16:9 berdurasi **05:07 menit** dengan sulih suara Gemini 3.8 TTS dan render GPU Remotion di folder `tugas-kerkom` (`glb-pixel-video.mp4`).
3. **Produk 3 – Praktikum Fisika Sederhana**: Pengambilan data nyata gerak mobil mainan berkecepatan konstan pada lintasan 20 cm – 100 cm dengan pencatatan waktu stopwatch, analisis regresi linier ($R^2$), serta komparasi galat terhadap teori.

---

## 🛠️ Tech Stack & Arsitektur

* **Runtime**: [Bun](https://bun.sh/) (JavaScript/TypeScript runtime ultra-cepat).
* **Backend Web**: [Elysia.js](https://elysiajs.com/) (Ergonomic, high-performance web framework).
* **Database**: **SQLite** (Native via `bun:sqlite`, file tersimpan permanen di `server/fisika.db`).
* **API Documentation**: Swagger OpenAPI aktif di `http://localhost:3000/swagger`.
* **Frontend UI**: React 19 + TypeScript + Vite.
* **Engine Simulasi**: HTML5 Canvas API + `requestAnimationFrame` (60 FPS rendering).
* **Audio**: 8-bit Retro Synthesizer mandiri menggunakan Web Audio API murni.

---

## 🚀 Panduan Menjalankan Aplikasi

Aplikasi dapat dijalankan dengan sangat mudah menggunakan **Bun**:

### 1. Menjalankan Server & Web Sekaligus (Mode Production/Server Terpadu)
```bash
# Di direktori utama web-fisika:
bun run start
```
Buka browser di: **`http://localhost:3000`**  
Dokumentasi Swagger API: **`http://localhost:3000/swagger`**

### 2. Mode Pengembangan (Hot Reload Frontend & Backend)
Jika ingin mengedit kode dengan HMR aktif:
```bash
# Terminal 1 - Backend Elysia (Auto-reload):
bun run dev:server

# Terminal 2 - Frontend Vite (Port 5173):
bun run dev:client
```

### 3. Build Production Bundle
```bash
bun run build
```

---

## 🕹️ Fitur Utama Aplikasi

### 1. [ Tab 01 ] Simulator & Dual Grafik Realtime
* **Visualisasi Kanvas 60 FPS**: Mobil kuning piksel melaju di jalan aspal dengan latar pegunungan parallax bertingkat, partikel asap knalpot, sorot lampu depan, dan marka laser penanda jarak meteran.
* **Mode Siang / Malam**: Toggle tema latar belakang (Matahari terbit vs Langit malam bertabur bintang & gedung kota).
* **Kontrol Fleksibel**: Slider Kecepatan ($v$), Posisi Awal ($s_0$), Waktu Target ($t$), tombol *Play*, *Pause*, *Slow-Mo 0.5x*, *Step +0.5s*, dan *Reset*.
* **Preset Kasus Fisika**: Pilihan preset instan (Kasus Video 20 m/s, Mobil Mainan Lab 0.25 m/s, Offset Posisi Awal $s_0=50\text{ m}$).
* **Dual Live Charts**:
  * Grafik Posisi-Waktu ($s - t$): Garis linier warna mint green dengan pelacak titik koordinat berjalan.
  * Grafik Kecepatan-Waktu ($v - t$): Garis horizontal warna amber dengan visualisasi arsiran luas daerah di bawah kurva ($\text{Luas} = v \times t = \text{Perpindahan } \Delta s$).

### 2. [ Tab 02 ] Validasi Rumus Teori vs Komputasi
* Membuktikan secara matematis langkah per langkah:
  $$s = s_0 + (v \cdot t)$$
  $$a = \frac{\Delta v}{\Delta t} = \frac{v_2 - v_1}{t} = 0.00\text{ m/s}^2$$
* Membandingkan hasil manual matematika dengan hasil komputasi fungsi TypeScript: Menghasilkan **status 100% identik (Galat 0.00%)**.

### 3. [ Tab 03 ] Data Praktikum Riil & Regresi Linier (Produk 3)
* **Form Input Pengukuran Stopwatch**: Mencatat hasil uji nyata ($s$, $t_1, t_2, t_3$) langsung ke SQLite backend.
* **Analisis Regresi Linier Otomatis**: Menghitung kemiringan garis ($m = \bar{v}$), titik potong ($c$), dan koefisien determinasi ($R^2 \approx 0.999$) yang membuktikan derajat kelinearan data eksperimen.
* **Scatter Plot**: Menampilkan titik sebaran data aktual bersama garis *best-fit* regresi.

### 4. [ Tab 04 ] Perbandingan 3 Pilar (Panduan PBL Bagian I)
* Menampilkan tabel komparasi resmi: **Teori $\longleftrightarrow$ Simulasi $\longleftrightarrow$ Praktikum**.
* Menghitung persentase deviasi/error secara otomatis.
* Menyertakan pembahasan ilmiah mengapa data riil memiliki deviasi tipis (~1.5%) dibandingkan kondisi ideal (faktor gesekan lantai, hambatan udara, dan *reaction time delay* stopwatch).

### 5. [ Tab 05 ] Kuis Kilat Kinematika
* Pertanyaan interaktif pilihan ganda seputar GLB dengan sound effect retro (coin/buzzer), skor akhir, dan pembahasan rumus.

### 6. [ Tab 06 ] Riwayat Simulasi di SQLite
* Riwayat pengujian yang tersimpan di file database `fisika.db`.
* Fitur ekspor seluruh data pengujian ke format **JSON** untuk lampiran laporan.

---

## 📊 Hasil Komparasi 3 Pilar (PBL Bagian I)

| Jarak Target ($s$) | Waktu Rata-rata ($\bar{t}$) | Teori ($s = v \cdot t$) | Simulasi Program | Eksperimen Riil | Galat Error (%) |
| :---: | :---: | :---: | :---: | :---: | :---: |
| **0.20 m** | 0.810 s | 0.203 m | 0.203 m | 0.200 m | 1.48% |
| **0.40 m** | 1.627 s | 0.407 m | 0.407 m | 0.400 m | 1.72% |
| **0.60 m** | 2.437 s | 0.609 m | 0.609 m | 0.600 m | 1.48% |
| **0.80 m** | 3.257 s | 0.814 m | 0.814 m | 0.800 m | 1.72% |
| **1.00 m** | 4.063 s | 1.016 m | 1.016 m | 1.000 m | 1.57% |

* **Rata-rata Kecepatan Eksperimen**: $0.2461\text{ m/s}$ (Teori: $0.2500\text{ m/s}$).
* **Rata-rata Galat Total**: **1.56%** (Sangat akurat untuk praktikum alat sederhana).

---

## 📜 AI Disclosure (Klausul Wajib Panduan PBL Bagian E)

> **AI Disclosure:**  
> Dalam pelaksanaan proyek ini, kelompok memanfaatkan teknologi Artificial Intelligence (AI) untuk membantu perancangan storyboard, penyusunan narasi/audio TTS Gemini 3.8, visualisasi antarmuka pixel art, dan scaffolding algoritma komputasi. Seluruh konsep fisika kinematika, penurunan persamaan matematis, validasi komputasi, dan analisis data eksperimen telah diperiksa dan diverifikasi secara independen oleh anggota kelompok berdasarkan literatur ilmiah Fisika Dasar.
