# Peta situs & spesifikasi — workshop-ai-pamjaya.vercel.app (24 Sep 2026)

**Sumber:** https://workshop-ai-pamjaya.vercel.app — "Gen AI for Business Productivity 2026 · From Understanding
AI to Applying AI at Work", in-house training **Perumda Air Minum Jaya (PAM Jaya) × BusinessFirst**, 2 hari,
08.30–16.30 WIB, Jakarta. Milik/dijalankan Pak Guntar (BusinessFirst).
**Stack sumber:** Next.js App Router di Vercel · NextAuth (email/sandi + Google) · API sendiri `/api/*`.
**Hasil scrape:** `scrape/out/workshop-ai-pamjaya.vercel.app/` — **107 halaman nyata, 92.655 kata**, 34 aset,
screenshot desktop + mobile tiap halaman. **Semua prompt:** `PROMPTS.json` (55 template library + 9 alat case study).

---

## 1. Arsitektur informasi

```
/                         Landing — hero, 3 pilar (Understand & Explore · Practice & Apply · Integrate), jadwal
├── /materi               Indeks materi (3 kelompok)
│   ├── Hari 1 — Fondasi & Praktik Gen AI      Sesi 1–12 + Penutup "Dari Prompt ke Agent"   (13 halaman)
│   ├── Hari 2 — Praktik Agentic AI            Sesi 11–16, 18, 19                            (8 halaman)
│   └── Framework Analisis, Teknik Prompting & Bacaan Tambahan
│        5 Why · Fishbone · Pareto · Design Thinking · AI Analyst Assistant (9 langkah) ·
│        Mengapa AI & Prompt Engineering · Pengantar PE · Role Prompting · Context Stuffing ·
│        Prompt Chaining · Kisi-Kisi & Pembahasan Soal                                    (11 halaman)
├── /dashboard            "Workshop AI Dashboard" — 9 Langkah Analysis · 55 Curated Prompts · 5 Modul Praktik
│   ├── /workshop-analysis     Wizard 9 Langkah Analysis & Judgement   🔒 langkah-langkahnya butuh login
│   ├── /prompt-library        59 prompt (klaim) / 55 halaman · 11 kategori
│   │   └── /prompt-library/1…55   detail: form isian → Salin Prompt / Simpan 🔒 / Kirim ke Email
│   ├── /case-study            9 alat: 2 generik · 4 per isu PAM Jaya · 3 per unit kerja
│   │   └── /case-study/<slug>     form → Generate Prompt → Copy Prompt / Kirim ke Email
│   ├── /pre-test · /post-test  🔒 kuis — isinya di balik login (belum tertangkap)
│   └── /leaderboard           XP dari Workshop Analysis, Case Study, Prompt Library, Quiz · Individu/Kelompok · Live
└── /auth/login · /auth/register   Google + email
```

## 2. Alur inti (inilah yang harus sama persis di platform baru)

### A. Belajar satu sesi
Buka sesi → header (gambar, "Sesi 03 · Hari 1", slot jam, "8 menit baca") → isi berurutan:
**Yang Akan Anda Kuasai** (tujuan) → bagian bernomor (konsep, tabel lemah-vs-kuat, contoh prompt) →
**Latihan** (dengan menit per latihan) → **Rangkuman Sesi** → **Diskusi**.
Di setiap sesi: tombol melayang **Catatan Materi** (catatan pribadi) + panel **Komentar / Pertanyaan**.

### B. Prompt Library — "salin-tempel ke AI Anda sendiri"
Tertulis di halamannya sendiri: **1** pilih prompt → **2** isi form di halaman detail → **3** klik **Salin Prompt**
→ **4** buka ChatGPT / DeepSeek / Qwen / Gemini → **5** paste & kirim.
Mekanik salin (terverifikasi): nilai isian **disisipkan di tempat** ke template (`…untuk «Nama Perusahaan» di industri
«Nama Industri»`). Isian kosong = teks hilang, jadi salinan tanpa isi menghasilkan prompt cacat. Pengecualian: prompt #1
**menempelkan** `[Teks]=nilai` di akhir. **Simpan** tetap nonaktif tanpa login.

### C. Case Study Tools
Tiap alat: konteks + **Contoh Kasus** → **Panduan Penggunaan** (bisa disembunyikan) → **Tips Mengisi Form** →
**Tips Membaca Hasil AI** → form (2–10 isian + pilihan chip, mis. Target Audiens: Media/Pers · Media Sosial) →
**Generate Prompt** → prompt muncul → **Copy Prompt** → (opsional) **Kirim ke Email**.
Prompt yang dihasilkan panjang (3.300–4.700 karakter) dan terstruktur (Executive Summary, Action Plan, KPI Monitoring…).

### D. Workshop Analysis (wizard)
**1 Pilih Kasus** (4 kasus latihan / Kasus Sendiri) → **2 Pilih Mode**: *Simple* 4 langkah ±30 mnt (Analisis Masalah
Fishbone+5 Why · Rancang Solusi · Rencana Aksi · Framework Monitoring) atau *Advanced* 6 langkah ±45 mnt (Problem
Framing · Fishbone · 5 Why Deep Dive · Ideation & Evaluasi · Decision & Action Plan · Monitoring & Review) → **Mulai
Analisis** 🔒. Panduan 5 slide: "Anda memakai akun AI pribadi — platform menyiapkan prompt, Anda menjalankannya."

### E. Gamifikasi
XP dikumpulkan dari Workshop Analysis, Case Study, Prompt Library, dan Quiz → **Leaderboard** individu & kelompok,
mode Live, tombol Kriteria. Dashboard menunjukkan progres (`/api/dashboard/progress`).

## 3. Fitur & model data (dari kode publik)
| Fitur | API | Perilaku |
|---|---|---|
| Catatan per materi | `/api/materi/{id}/notes` GET·POST · `/notes/{id}` PATCH·DELETE | tambah/ubah/hapus, **isPublic** (catatan bisa dibagikan) |
| Diskusi per materi | `/api/materi/{id}/posts?type=comment` · `?type=question&sort=` | dua jenis: **komentar** & **pertanyaan**, balasan berutas (`parentId`), ubah/hapus |
| "Saya juga" | `/posts/{id}/metoo` POST | upvote pertanyaan |
| Jawaban trainer | `/posts/{id}/trainer-answer[/{id}]` | slot jawaban resmi per pertanyaan |
| Progres | `/api/dashboard/progress` | progres peserta |
| Pengguna | `/api/users/` | admin |
| Peran | — | **admin · trainer · peserta** |
| Login | NextAuth | kredensial + **Google** |

## 4. Isi (inventaris)
| Kelompok | Halaman | Kata |
|---|---:|---:|
| Materi (sesi + suplemen + soal) | 33 | 65.047 |
| Prompt Library | 56 | 22.128 |
| Case Study | 10 | 3.490 |
| Lainnya (landing, dashboard, auth, wizard) | 8 | ±2.000 |
| **Prompt template** | 55 + 9 | 111.683 + 34.786 karakter |
Kategori library: Business 11 · PAM Jaya 10 · Productivity 6 · Education 6 · Assistant 5 · Copywriting 4 ·
Marketing 3 · Health 3 · Project Management 3 · Coding 2 · Travel 2. **PRO**: 23 prompt.

## 5. Belum tertangkap (butuh login)
- **Pre-test & post-test** — isi soal.
- **Langkah-langkah Workshop Analysis** setelah "Mulai Analisis" — prompt tiap langkah.
- Catatan & diskusi yang sudah ada, isi Leaderboard, dashboard progres.
→ Perlu akun (sebaiknya dari Pak Guntar/trainer). **Tidak membuat akun di situs produksi mereka tanpa izin.**

## 6. Cacat di sumber (jangan ikut dipindahkan)
- **Kasus latihan Workshop Analysis bukan PAM Jaya** — keempatnya tentang **AHASS** (bengkel Honda) di Yogyakarta,
  Surabaya, Semarang: sisa workshop klien sebelumnya.
- **Penomoran sesi bertabrakan:** Hari 1 memakai Sesi 1–12, Hari 2 mulai lagi di **Sesi 11–12**; **Sesi 17 tidak ada**.
  Sesi 7–12 tertulis "Hari 1" padahal slot jamnya berulang dari pagi (08.30) — kemungkinan seharusnya Hari 2.
  Teks indeks: "sepuluh sesi Hari 1" padahal ada 12 + penutup.
- **15 tautan mati (404):** semua `.md` Hari 2 (`/02-menyiapkan-alat/materi.md` … `/08-…`), `/README.md`,
  `/lampiran/{faq,kartu-saku,tips-dan-trik,troubleshooting}.md`, kurikulum 2 hari, **/terms**, **/privacy**
  (dua terakhir ditautkan dari halaman daftar).
- `/materi/*.md` membalas 200 berisi "Opps!!! page not found" (soft-404).
- Klaim "59 Prompts" vs 55 halaman prompt yang ada.
- Tidak ada tombol salin di materi — prompt contoh harus diseleksi manual.

## 7. Implikasi untuk platform baru
1. **Alur dipertahankan** (A–E di atas), wajah baru. Prompt jadi komponen kelas satu: kartu dengan **Salin sekali
   ketuk**, **pratinjau hidup** yang mengisi «…» saat mengetik, dan tempat untuk **"Jalankan di Intelligence"** kelak.
2. **Satu model konten:** Program → Hari → Sesi → blok (tujuan · konsep · contoh prompt · latihan · rangkuman) +
   Suplemen + Asesmen. Prompt Library & Case Study jadi *tools* yang ditautkan dari sesi terkait.
3. **PDF per modul** diturunkan dari model yang sama (sesi, suplemen, kartu prompt).
4. **Mobile-first**: sesi sebagai bacaan dengan progres, prompt sebagai kartu, peta perjalanan Hari 1 → Hari 2.
5. Perbaiki cacat §6 saat migrasi (dengan persetujuan Pak Guntar untuk yang menyangkut isi).

---

# Tambahan 24 Sep, siang — versi AHM & area yang butuh login

## Kenapa AHM
Login Google di situs PAM Jaya **gagal di sisi mereka** ("Callback" — redirect OAuth belum diatur untuk domain
itu), jadi tidak ada yang bisa masuk ke sana saat ini. Araya menunjuk **https://workshop-ahm.vercel.app**
("SE Summit 2026", Astra Honda Motor — Service Engineer). Ini **platform yang sama**: rute, penyedia login,
dan fiturnya identik. Situs PAM Jaya adalah salinannya — itu sebabnya kasus latihan AHASS tertinggal di sana.
➜ Platform = **satu mesin, beberapa klien**. Rancang platform baru multi-klien sejak awal.

## Temuan keamanan — laporkan ke Pak Guntar (dengan halus)
Login Google pertama dengan akun Araya **langsung mendapat role `admin`** (terverifikasi dari `/api/auth/session`).
Kalau setiap akun Google jadi admin, orang asing pun bisa masuk dan melihat **User Management** serta data
peserta. Kami **tidak** membuka halaman data peserta; tangkapan leaderboard (berisi nama & skor peserta) yang
sempat terambil **sudah dihapus**.

## Menu admin (yang tidak terlihat tanpa login)
WORKSHOP AI: Dashboard · Workshop Homepage · **Mengapa DT & AI** (`/bridging`) · **Takeaway** · **Prompting** ·
**Insights** (`/insights-feed`) · **Status PrePost** (`/admin/status-pre-post-feedback`)
PRACTICE MODULES: Case Study Tools (Semua Tools · **Progress Peserta** · 6 alat) · 9 Langkah Analysis
(Workshop Analysis · **Monitoring Progress** · **Sesi Pleno**) · Prompt Library
SYSTEM: User Management · Profile · tautan ke **guntar.vercel.app** (kemungkinan hub semua workshop Pak Guntar)
→ Sisi **trainer/admin** adalah fitur tersendiri untuk platform baru: pantau progres, sesi pleno, status pre/post.

## Yang tertangkap dengan login (`scrape/out/workshop-ahm.vercel.app-auth/`, `scrape/out/decks/`)
- **Mengapa DT & AI** = dek slide HTML **22 slide** (`/slides/14-relevansi-modul-design-thinking-slides/`) —
  semua slide: teks + gambar. Nomor "14" menandakan ada dek lain (01–13…) yang namanya belum diketahui.
- **Takeaway** = dek "bumper" **81 slide**.
- **Prompting** = 4 materi (`/tambahan/*.html`, 500–800 kata): Tiga Teknik Prompting (analogi) · Role Prompting &
  Context Stuffing — Contoh Ekstrim · Prompt Chaining — Contoh Ekstrim · AI Merancang Prompt Sendiri.
- **Pre-test / post-test — mekaniknya:** 10 soal **esai** (5 topik × 2), **timer 15 menit** yang tetap jalan walau
  browser ditutup, **satu kali kesempatan**, **dinilai AI** langsung setelah submit, **2 level petunjuk** dengan
  batas skor (Lv.1 maks 8, Lv.2 maks 6), hasil = baseline dibandingkan post-test.
  **Soalnya belum tertangkap:** baru muncul setelah "Mulai Pre-Test", yang memulai timer dan **menghabiskan satu-
  satunya kesempatan** akun itu di platform produksi mereka → menunggu keputusan Araya.
- **Workshop Analysis** setelah "Mulai Analisis" — belum dijalankan (kemungkinan menyimpan progres/XP ke DB mereka).

## Batas yang dijaga
Hanya konten kursus. Tidak dibuka: `/users`, `/profile`, `/admin/*`, `/case-study/progress`,
`/workshop-analysis/progress`, `/workshop-analysis/plenary` (data peserta). Tidak ada submit/simpan/catatan/post.
Crawler kini menolak rute tersebut secara otomatis. Sesi login disimpan `scrape/auth/state-workshop-ahm.json` (0600, di .gitignore).

## AHM vs PAM Jaya — crawl publik AHM selesai (79 halaman nyata, 53.521 kata)
| | AHM (SE Summit) | PAM Jaya |
|---|---:|---:|
| Materi | 11 (framework/teknik prompting + soal) | 32 (Hari 1 + Hari 2 + framework yang sama) |
| Prompt Library | 55 | 55 |
| Case Study | 6 (semua AHASS) | 9 |
| Pre/post-test | di balik login | halaman pembuka publik |

**Kerangkanya sama, isinya dilokalkan per klien.** Judul, urutan dan struktur tiap materi & prompt identik,
tetapi **contoh-contohnya ditulis ulang** untuk industri klien (AHM: "SE, kepala bengkel, mekanik, spare part" →
PAM Jaya: "staf, Kepala Unit Pelayanan, petugas lapangan, material"). Tidak ada halaman prompt yang identik
kata-per-kata, bahkan setelah nama klien dinormalisasi.
➜ Model untuk platform baru: **Program (klien) → modul inti bersama + lapisan lokalisasi per klien**
(contoh, kasus latihan, logo, jadwal). Workshop berikutnya cukup menulis lapisan kliennya, tanpa menyalin situs.

## Pre-test — sudah tertangkap (24 Sep, 11.27 WIB, atas izin Araya)
Pre-test dimulai dengan akun Araya; **tidak ada jawaban yang dikirim dan tidak ada petunjuk yang dibuka**. Percobaan itu
kedaluwarsa dengan skor 0 sekitar pukul 11.42 WIB.
Hasil: `scrape/out/workshop-ahm.vercel.app-auth/pretest-run/SOAL-PRE-POST-TEST.md` — 10 soal dengan petunjuk Lv.1/Lv.2,
**jawaban ideal**, jawaban yang masih diterima, dan alokasi waktu per soal.
- API: `GET/POST /api/quiz/pre-test/attempt` (attempt id, `timeLimitSeconds` 900, answers[], nextQuestion).
- **Temuan keamanan #2:** seluruh kunci jawaban (idealAnswer, acceptableAnswer, kedua level petunjuk) **ikut terkirim ke
  browser** di bundel JS. Peserta yang membuka DevTools bisa membacanya sebelum menjawab. Di platform baru, kunci
  jawaban hanya boleh ada di server.
- /post-test memuat bundel yang sama (hash identik) dengan satu bank 10 soal, jadi post-test hampir pasti memakai soal
  yang sama (timer 12 menit). Pre dan post dengan soal identik = perbandingannya mengukur ingatan, bukan pemahaman.
  Ini masukan untuk Pak Guntar.
