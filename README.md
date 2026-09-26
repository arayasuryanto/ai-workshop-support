# AI Workshop Support — PAM Jaya × BusinessFirst

A refreshed landing page for **Gen AI for Business Productivity 2026**, the two-day in-house workshop run by
BusinessFirst for PAM Jaya. It sits in front of the existing workshop platform at
https://workshop-ai-pamjaya.vercel.app: same content, same order, new presentation.

**Live:** https://workshoplab.dockbay.xyz

## What's here

- **Landing page** (`app/`) — Vite + React 19 + Tailwind + Motion.
  - Hero with fanned cards: the three pillars (Understand & Explore, Practice & Apply, Integrate), each with a
    small live interface drawn from the workshop material.
  - Curriculum explorer for the twelve sessions: session list plus a detail panel (key points, why it matters,
    outline, learning goals).
  - Five-step learning journey, one visual per step.
  - Every action (Masuk, Baca materi, Workshop, Dashboard, Prompt Library, Case Study) goes to the existing platform.
- `app/public/program.json`, `landing.json`, `quiz.json` — the content the page renders, derived from the platform.
  **The material belongs to BusinessFirst / Pak Guntar.**
- `notes/PETA-SITUS-2026-09-24.md` — site map and flows of the existing platform.
- `scrape/` — the mapping scripts (raw output is not in the repo).

## Run

```bash
cd app && npm install && npm run dev      # http://localhost:8768
npm run build                              # output in app/dist
```

Deploy: `bash deploy.sh` (build → rsync to workshoplab.dockbay.xyz → verify).

## Notes

- Per-session times are not shown (the source values are inconsistent); only the programme hours 08.30–16.30.
- The source truncates each "Why Important" text at about 120 characters; the landing shows up to the last full sentence.
- The page is `noindex` until publishing is decided.
