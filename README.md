# AI Workshop Support — PAM Jaya × BusinessFirst

Landing page baru untuk **Gen AI for Business Productivity 2026** (workshop 2 hari, PAM Jaya × BusinessFirst),
dibangun sebagai lapisan tampilan di atas platform workshop yang sudah berjalan di
https://workshop-ai-pamjaya.vercel.app.

**Live:** https://workshoplab.dockbay.xyz

## Apa yang ada di sini

- **Landing page** (`app/`) — Vite + React 19 + Tailwind + Motion. Isi dan urutannya mengikuti halaman depan
  platform asli (hero → 3 pilar → jadwal → 12 sesi → alur belajar), dengan tampilan dan animasi baru:
  - Hero bergaya kartu bertumpuk, 3 pilar masing-masing dengan mini-interface hidup dari materi workshop.
  - *Curriculum explorer* 12 sesi: daftar + panel detail (poin kunci, "kenapa penting", isi materi, tujuan sesi).
  - Alur belajar 5 langkah, tiap langkah punya visual sendiri.
  - Semua tombol (Masuk, Baca materi, Dashboard, Prompt Library, Case Study) mengarah ke platform asli.
- **Modul interaktif (belum diaktifkan di menu)** — peta belajar, lab praktik (Prompt Builder, Fishbone, 5 Why,
  Pareto), pustaka prompt, latihan soal. Masih bisa dibuka di `/#/peta`, `/#/lab`, `/#/prompt`, `/#/latihan`
  untuk pratinjau. Ini calon pengganti dashboard, dibahas belakangan.
- `app/public/program.json`, `landing.json`, `quiz.json` — data materi yang dipakai halaman (diturunkan dari
  platform asli). **Isi materi adalah milik BusinessFirst / Pak Guntar.**
- `notes/PETA-SITUS-2026-09-24.md` — peta situs & alur platform asli.
- `scrape/` — skrip pemetaan (hasil mentahnya tidak ikut di repo).

## Menjalankan

```bash
cd app && npm install && npm run dev      # http://localhost:8768
npm run build                              # output ke app/dist
```

Deploy: `bash deploy.sh` (build → rsync ke workshoplab.dockbay.xyz → verifikasi).

## Catatan

- Jam per sesi sengaja tidak ditampilkan (data sumber tidak konsisten); hanya jam program 08.30–16.30.
- Teks "Why Important" di sumber terpotong ±120 karakter; di landing ditampilkan sampai kalimat lengkap terakhir.
- Halaman diberi `noindex` sampai diputuskan mau dipublikasikan atau tidak.
