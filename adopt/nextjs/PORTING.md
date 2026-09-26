# Porting the landing into the existing Next.js platform

This folder is the landing page already converted for a Next.js App Router project (Tailwind v3 or v4).
Verified with `next build` on Next 16 + Tailwind 4: the page prerenders statically, no runtime errors.

## Contents

| Path | What it is |
|---|---|
| `components/landing/*.jsx` | Client components: `Landing` (page shell, header, closing, footer), `LandingHero`, `LandingContent` (12-session explorer), `LandingJourney` (5 steps). `ui.jsx` and `core.js` are the only helpers they need. |
| `data/landing.json` | Hero, pillars, schedule, the 12 session cards, journey copy. |
| `data/sessions.json` | Per-session outline, goals and stats used by the explorer panel (slimmed from the material). |
| `public/assets/*`, `public/og.png`, `public/favicon.png` | Logo mark, session images, share image, favicon. |
| `styles/landing.css` | Aurora, glass header, gradient text/button, no-scrollbar. |
| `tailwind.landing.js` | Theme tokens for Tailwind **v3** (`theme.extend`). |
| `styles/tailwind-v4.css` | Same tokens as an `@theme` block for Tailwind **v4**. |
| `app/page.jsx`, `app/layout.example.jsx` | Example route and root layout (fonts, favicon). |

## Steps

1. **Install one dependency**: `npm i motion` (`lucide-react` too if not already present).
2. **Copy** `components/landing/`, `data/`, and everything in `public/` into the project (keep the paths; images are referenced as `/assets/...`).
3. **Theme tokens**
   - Tailwind v3: merge `tailwind.landing.js` into `theme.extend` in `tailwind.config.js`. Make sure `content` covers `components/**/*.jsx`.
   - Tailwind v4: paste `styles/tailwind-v4.css` into the global CSS after `@import "tailwindcss";`.
4. **Styles**: append `styles/landing.css` to the global CSS. Add the Google Fonts link for Plus Jakarta Sans + Geist Mono (see `app/layout.example.jsx`).
5. **Route**: use `app/page.jsx` as the home page (or render `<Landing />` wherever the landing should live).
6. **Links**: all actions are relative and match the platform's own routes: `/auth/login`, `/materi`, `/materi/<slug>`, `/dashboard`, `/prompt-library`, `/case-study`. If a route differs, change it in one place: the `links` array and `ENTRY` list in `components/landing/Landing.jsx`, and the `href` in `LandingContent.jsx` / `LandingHero.jsx`.

That's it. The build in this repo's `app/` is the same landing running standalone, so the two stay visually identical.

## Editing content

- Copy and the 12 cards: `data/landing.json` (the "why" texts are cut at the last full sentence because the source truncates them; paste the full sentences here).
- Outline / goals per session: `data/sessions.json`.
- Brand colours: the `brand` and `sky` scales in the tokens file. Prompt-anatomy colours (PERAN, KONTEKS, TUGAS, BATASAN, FORMAT) live in `core.js` and carry meaning, so they are kept as they are in the course.
- Session images: `public/assets/images_materi_sesi-XX-*.jpg`, 1200×630.

## Notes

- Progress pills ("Selesai") read `localStorage` under the `wl:` prefix; they simply stay hidden if nothing is stored. Wire them to real progress by setting `done` (array of slugs) in `core.js`'s store, or remove `useStore` calls.
- Per-session hours are intentionally not shown; only the programme hours 08.30–16.30.
