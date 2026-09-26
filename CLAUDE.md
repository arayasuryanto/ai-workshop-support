# workshop-platform — AI workshop / masterclass platform (workspace: starlabs)

Origin: **Pak Guntar** runs AI workshops (multiple sessions, groups). His method = **case-study based**: a
guided use case → a prompt → participants copy-paste it into their own ChatGPT / DeepSeek / Claude.
He has a workshop website for this. Araya (24 Sep 2026): mirror that site's **entire content and flow**
faithfully, re-wrapped as a brand-new interactive platform (Masterclass-grade), mobile-first-ready,
with a **downloadable PDF per module**. Later (not now): plug into **Intelligence**
(`~/starlabs/intelligence`, live labs.digital360.id/intelligenceai) so prompts run in-platform instead of
copy-paste — that is the "branded AI" pitch from 7–8 Sep (`~/friday/pdf-studio/library/onepagers-cheatsheets/D360-Branded-AI-Concept-Architecture.pdf`).

## Phases
1. **Map + scrape** the source site completely (this folder's `scrape/`). ← current
2. **Mobbin reference pass** — find best-in-class flows for course/lesson/prompt/progress UX.
3. Build the platform (flow identical to source, new interface), per-module PDF export.
4. (later) Intelligence integration.

## Hard rules
- **Flow fidelity:** the order, steps and mechanics of the source must survive the redesign — the
  scrape is the spec. Restyle freely; do not reorder or drop steps without Araya.
- **Content belongs to Pak Guntar.** Mirror it for his platform, not for resale/republication elsewhere.
- Inherit the global Araya rules (terse, EN/ID, options + reco, verify after every change).

## Tools
- `scrape/crawl.py <url>` — rendered-browser crawl (Playwright): sitemap.xml + link BFS, same-origin,
  per page: rendered HTML, clean markdown, headings, **copyable blocks (prompts)**, images, forms/buttons,
  desktop + mobile screenshots. Output → `scrape/out/<host>/`.

## Status — 26 Sep 2026 (latest)
- **Landing is the public face; everything else links to the ORIGINAL site for now** (Araya, 26 Sep): nav = Workshop
  (`/materi`) · Materi (#materi) · Dashboard (`/dashboard`); "Masuk" + "Mulai Training" → `/auth/login`; Baca materi →
  `/materi/<slug>`; closing tiles → materi / prompt-library / case-study / dashboard — all on workshop-ai-pamjaya.vercel.app
  (`SRC` const in `pages/Landing.jsx`). Our built modules stay reachable but UNLINKED: `/#/peta`, `/#/lab`, `/#/prompt`,
  `/#/latihan`. Plan: enhance outward-in — landing first, dashboard/modules later.
- **Git + public repo (26 Sep):** https://github.com/arayasuryanto/ai-workshop-support (main). `.gitignore` excludes
  `scrape/auth`, `scrape/out` (467 MB raw dump), PDFs, dist, node_modules, `_publish`. Repo carries the course text in
  app/public/*.json — content is Pak Guntar's; flip private with `gh repo edit ... --visibility private` if he prefers.
  Commit author: `Claudy · workshop-platform`. Push only on Araya's "push it".
- Telegram summary + a forwardable draft note for Pak Guntar sent to Araya's chat 26 Sep via mastercontrol `tg.sh`.

## Status — 24 Sep 2026
- **Phase 1 done.** Source: https://workshop-ai-pamjaya.vercel.app (PAM Jaya × BusinessFirst, 2-day in-house).
  - Map & spec: `notes/PETA-SITUS-2026-09-24.md` (IA tree, flows A–E, API/data model, inventory, gated, source defects).
  - Scrape: `scrape/out/workshop-ai-pamjaya.vercel.app/` — 107 real pages, 92.655 words, per-page `content.md`,
    `blocks.json`, desktop/mobile PNG; `SITEMAP.md` + `sitemap.json`.
  - **`PROMPTS.json`** = every prompt: 55 library templates + 9 case-study tools, with fields and «marker»
    templates (captured by filling each field with its own label, then copying).
  - `scrape/generate_pass.py` re-runs the form-driven capture.
- **Phase 2 started:** `reference/mobbin-referensi-2026-09-24.md` (lesson page, Q&A, prompt card + copy, mobile journey).
- **Second source: https://workshop-ahm.vercel.app** (SE Summit 2026, AHM). PAM Jaya's Google login is broken
  ("Callback"), so Araya logged in on AHM instead → `scrape/out/workshop-ahm.vercel.app{,-auth}/`, decks in
  `scrape/out/decks/`. It runs on the same engine; the content is the same skeleton **re-localised per client**.
  Build it multi-client: shared core modules + a per-client layer.
- **Security flaw to raise gently with Pak Guntar:** Araya's first Google sign-in on AHM got role=admin.
- **Pre/post-test captured** (24 Sep, Araya OK'd using his attempt): `scrape/out/workshop-ahm.vercel.app-auth/pretest-run/SOAL-PRE-POST-TEST.md`
  — 10 Qs + hints + ideal answers. The answer key ships in the client JS bundle (flaw #2), and post-test reuses the same bank.
- **Still not captured:** Workshop Analysis step prompts (Mulai writes to their DB), /insights-feed.
- **Scrape limits:** read-only; never submit/save/post; never capture participant data (/users, /profile,
  /admin/*, leaderboard, progress/pleno pages). Auth state in `scrape/auth/` (0600, gitignored) is a credential.
- **v3 = the live app (24 Sep): `app/` — Vite + React 19 + Tailwind 3 + Motion + lucide + canvas-confetti, HashRouter.**
  **PAM Jaya brand (26 Sep 2026):** clear white + pale-blue aurora, PAM blue `#0256f4` → sky `#22b8f5` primary (no violet/pink),
  real logo `app/public/assets/pam-jaya-logo.png` + drop-only `pam-mark.png` (cropped from the scraped webp), favicon + og.png rebuilt.
  Anatomy colours (PERAN/KONTEKS/… in `core.js` KCOLOR + Prompt Builder card) and the orange Latihan card are intentional exceptions.
  Plus Jakarta Sans + Geist Mono. Same mechanics as v2, ported.
  **Landing (26 Sep 2026): `/` = `pages/Landing.jsx`** — mirrors the source home section-for-section (hero → 3 pilar → jadwal → 12 sesi
  cards → alur 5 langkah → CTA/footer), own header (no XP/bottom tabs), data in `app/public/landing.json` (built from
  `scrape/.../pages/index/content.md`). The learning map moved to **`/peta`** (NAV + Player links updated).
  Source truncates each card's "Why Important" at ~120 chars and shows only 3 of 5 key points — the full text exists
  nowhere in the scrape; landing shows the last complete sentence. **Ask Pak Guntar for the full sentences.**
  **Upper landing retouched (26 Sep, `pages/LandingHero.jsx`):** word-by-word blur headline (gradient class must sit on each word —
  a filter on a child breaks the parent's background-clip:text), water rings + float behind the logo, cursor parallax, 3 pilar cards
  auto-cycle every 5.2 s (hover/click activates + pauses) each with a live mini-UI from real course content (AI⊃ML⊃GenAI rings;
  prompt typing itself in PERAN–KONTEKS–TUGAS–BATASAN–FORMAT anatomy colours + strength meter; 4-node workflow with human
  checkpoint), 3D tilt on hover, CTA shine sweep, jadwal tiles + real slot strip (Hari 1 = sesi 1–6, Hari 2 = 7–12, slots from
  program.json; hover = title, click = open). Below "Workshop Content" untouched.
  **Podia-style fan (26 Sep, Araya's reference https://mobbin.com/screens/edace237-fe37-4002-a43a-0fe08b58890a):** the 3 pilar
  cards are big tilted cards (-5° / 0° / +5°, pale blue · PAM blue · sky) under the CTAs, mini-UI as an inner white panel, cut off
  by a curved white edge (`rounded-t-[100%_100%]`, negative margins clipped by an overflow-hidden wrapper or mobile gets a
  horizontal scroll). Hover/tap = card straightens, lifts to front, mini-UI replays; others dim. Tilt only ≥768px (matchMedia).
  Mobile grid needs `grid-cols-1` (minmax(0,1fr)) or the nowrap chips inside a mini widen the column past the viewport.
  Shapes = the PAM drop mark (CSS mask of `pam-mark.png`, pale-blue tints, rotated) on a full-bleed `w-screen` layer so they get
  cut by the viewport edge; the curve is full-bleed too (`w-screen` wrapper, 130vw inner). Centre logo removed (26 Sep, Araya) so
  copy + cards sit higher. Jadwal sits below the curve.
  **Per-session hours are NOT shown anywhere (26 Sep, Araya: "not legit")** — the source's `slot` values repeat identically for sesi
  1–6 and 7–12 (all tagged Hari 1), so they're template leftovers. Jadwal strip = 12 numbered session chips (hover title, click opens);
  `slot` hidden on /peta nodes and in the Player header. Only the program-level 08.30–16.30 stays. Data field kept in program.json.
  **Workshop Content (26 Sep, `pages/LandingContent.jsx`):** curriculum explorer instead of a 12-card wall — sticky numbered list
  (desktop) / snap chip rail (mobile) + detail panel (image 16:9 + Kenapa-penting + progress bar | title, desc, poin kunci, Baca
  materi, prev/next). Auto-advances every 6.5 s once in view, pauses on hover, ← → keys work, done sessions show a green check.
  List + panel are equal height (grid items-stretch, rows flex-1; no sticky). Panel gaps filled with real per-session data from
  program.json: "Isi materi" outline (content section headings, max 6) under the callout; "Setelah sesi ini, Anda mampu" (goals
  section, max 3; falls back to the Rangkuman list for sesi 7/11 and the first content list for sesi 12) + stats chips under poin
  kunci. Panel is a fixed `lg:h-[780px]` so the list rows don't jump while it auto-cycles. **Alur belajar (`pages/LandingJourney.jsx`, 26 Sep, Araya's Mobbin ref was login-walled; built FLORA-style):** light section,
  title + lead + stat counters, then 5 step cards (big gradient numeral · name · 150px live mini visual · one-line cue): AI⊃ML⊃GenAI
  rings · frekuensi×beban-waktu matrix · anatomy bars + strength meter · function chips + draft with [PERLU DILENGKAPI] · 4-node
  workflow with human check. Minis replay on hover/viewport enter. Cues paraphrase pillar copy, no per-session mapping claimed.
  **Closing:** 4 entry tiles (Peta/Lab/Pustaka/Latihan) + Mulai Training; footer is one brand line (tiles were duplicating it).
  `cd app && npm run dev` (:8768). Deploy: `bash deploy.sh` (builds, mirrors app/dist, verifies). Data in app/public (copied from prototype/).
  Araya rejected v2's navy/mono look: "not modern, want brighter clean white gradient" + expects React + real motion.
- **Prototype v2 (24 Sep, superseded — still used by `scrape/make_pdfs.py` for the PDFs)** — `prototype/` (serve: `cd prototype && python3 -m http.server 8767`). v1 archived in `prototype/_v1/`.
  Araya rejected v1 as "same as the source, nothing interactive". v2 = practice lab, navy I360 palette, mechanisms from Mobbin:
  map path + session sheet (Mimo/Noom) · step player with segmented progress + celebration (Liven/Tiimo) · prompt cards colour-coded
  by the course's own PERAN–KONTEKS–TUGAS–BATASAN–FORMAT anatomy + Salin / open in ChatGPT·Claude·Gemini / Remix · weak→strong flip
  tables · Lab: Prompt Builder (strength meter), Fishbone 6M, 5 Why (chain unlocks), Pareto (live chart) — each emits a prompt ·
  Pustaka with search + live variable preview + "Pakai contoh" · Latihan Soal from the public kisi-kisi (`quiz.json`,
  `scrape/build_quiz.py`) with the real mechanics (timer, hints cap 8/6), self-check rubric + AI grading prompt · XP/levels.
  - **PDF per module:** `scrape/make_pdfs.py` prints `#/cetak/<slug>` → `prototype/pdf/*.pdf` (32 files, ~14 MB).
  - **LIVE: https://workshoplab.dockbay.xyz** (24 Sep; noindex + robots Disallow; rays-dockbay tenant, LE cert). Redeploy: `bash deploy.sh` (now the React app).
    Regenerate PDFs first if content changed: `python3 scrape/make_pdfs.py` (prototype served on :8767).
  - Pareto example numbers are illustrative and labelled so on the page; 5 Why example = the source's own Soal 5.
- Source traps: templates **substitute inline** (blank field = text disappears), except #1 which appends
  `[Teks]=`; `/materi/*.md` are soft-404s (200 + "Opps!!!"); Workshop Analysis cases are AHASS leftovers.
