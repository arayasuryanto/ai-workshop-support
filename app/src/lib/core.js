/* Shared logic: persisted per-viewer state (localStorage, reactive), XP, prompt anatomy, scoring helpers.
   Ported from the v2 prototype so behaviour stays identical; only the interface is new. */
import { useSyncExternalStore } from 'react';

/* ── store ── */
const PFX = 'ws3:';
const subs = new Set();
const cache = new Map();
export const store = {
  get(k, d) {
    if (cache.has(k)) return cache.get(k) ?? d;
    let v = null;
    try { v = JSON.parse(localStorage.getItem(PFX + k)); } catch (_) {}
    cache.set(k, v);
    return v ?? d;
  },
  set(k, v) {
    cache.set(k, v);
    try { localStorage.setItem(PFX + k, JSON.stringify(v)); } catch (_) {}
    subs.forEach((f) => f());
  },
  del(k) { cache.delete(k); try { localStorage.removeItem(PFX + k); } catch (_) {} subs.forEach((f) => f()); },
};
let ver = 0;
subs.add(() => ver++);
export function useStore(k, d) {
  useSyncExternalStore((f) => { subs.add(f); return () => subs.delete(f); }, () => ver);
  return store.get(k, d);
}

/* ── XP ── */
export const level = (x) => ({ lv: Math.floor(x / 200) + 1, into: x % 200 });
const xpListeners = new Set();
export const onXP = (f) => { xpListeners.add(f); return () => xpListeners.delete(f); };
export function addXP(n, el) {
  store.set('xp', store.get('xp', 0) + n);
  const r = el && el.getBoundingClientRect ? el.getBoundingClientRect() : null;
  xpListeners.forEach((f) => f(n, r));
}
export function once(key, n, el) {
  const s = new Set(store.get('once', []));
  if (s.has(key)) return false;
  s.add(key); store.set('once', [...s]); addXP(n, el); return true;
}
export const hash = (s) => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return String(h); };

/* ── prompt anatomy (course framework: PERAN – KONTEKS – TUGAS – BATASAN – FORMAT) ── */
export const KEYS = ['peran', 'konteks', 'tugas', 'batasan', 'format'];
export const KNAME = { peran: 'Peran', konteks: 'Konteks', tugas: 'Tugas', batasan: 'Batasan', format: 'Format' };
export const KCOLOR = { peran: '#3b82f6', konteks: '#8b5cf6', tugas: '#f59e0b', batasan: '#f43f5e', format: '#10b981', lain: '#94a3b8' };
export const LABEL_RE = /^\s*(?:\[([A-Z][A-Z0-9 /&\-]{1,28})\]|([A-Z][A-Z0-9 /&\-]{1,28})\s*:)\s?(.*)$/;
export const DETECT = {
  peran: /\b(anda adalah|kamu adalah|bertindak(lah)? sebagai|berperan(lah)? sebagai|sebagai (seorang|konsultan|analis|staf|ahli|spesialis))/i,
  konteks: /\b(konteks|latar|situasi|berikut (data|catatan|laporan|teks|isi)|data berikut|saya (bekerja|staf|sedang)|kami|di pam jaya|unit|wilayah)/i,
  tugas: /\b(buat(kan|lah)?|tulis(kan|lah)?|susun(lah)?|ringkas(kan|lah)?|analisis(lah)?|jelaskan|bandingkan|identifikasi(kan)?|berikan|rancang(lah)?|hitung(lah)?|kelompokkan|kategorikan|klasifikasikan|periksa|terjemahkan|ubah(lah)?|perbaiki|evaluasi|nilai(lah)?|simpulkan|sebutkan|daftarkan|tentukan|urutkan|prioritaskan|cari(kan)?|rekomendasikan|sarankan)\b/i,
  batasan: /\b(jangan|maksimal|maks\.?|hanya|tanpa|tidak boleh|minimal|paling banyak|hindari|pastikan)\b/i,
  format: /\b(tabel|poin|bullet|format|paragraf|daftar|kolom|kalimat|bagian|judul|markdown|langkah bernomor)\b/i,
};
export const detect = (t) => Object.fromEntries(KEYS.map((k) => [k, DETECT[k].test(t)]));
export const cleanPrompt = (t) => String(t).replace(/^\s*["“]|["”]\s*$/g, '').trim();
export function parsePrompt(text) {
  const segs = []; let cur = null;
  for (const ln of cleanPrompt(text).split('\n')) {
    const m = ln.match(LABEL_RE);
    if (m) {
      const lab = (m[1] || m[2]).trim();
      cur = { k: KEYS.find((x) => x === lab.toLowerCase()) || 'lain', label: lab, lines: [m[3]] }; segs.push(cur);
    } else if (cur) cur.lines.push(ln);
    else { cur = { k: null, lines: [ln] }; segs.push(cur); }
  }
  return segs.map((s) => ({ ...s, text: s.lines.join('\n') }));
}
export function anatomy(text) {
  const segs = parsePrompt(text), labelled = segs.filter((s) => s.k && s.k !== 'lain').map((s) => s.k);
  const f = labelled.length >= 2 ? Object.fromEntries(KEYS.map((k) => [k, labelled.includes(k)])) : detect(text);
  return { segs, f, n: KEYS.filter((k) => f[k]).length };
}
export const isPromptBlock = (b) => b.type === 'code' || /^\s*["“]/.test(b.text) || LABEL_RE.test(b.text.split('\n')[0]) ||
  DETECT.peran.test(b.text.slice(0, 60)) || /^(buat|tulis|susun|ringkas|analisis|jelaskan|bandingkan|identifikasi|berikan|rancang|saya|tolong|bantu)/i.test(b.text.trim());

/* remix: labelled segments go to their component; an unlabelled prompt is split per sentence */
export function remixToFields(text) {
  const segs = parsePrompt(text); let v = {};
  const put = (k, t) => (v[k] = ((v[k] || '') + ' ' + t).trim());
  if (segs.some((x) => x.k && x.k !== 'lain')) {
    segs.forEach((sg) => (sg.k && sg.k !== 'lain' ? put(sg.k, sg.text) : put('tugas', (sg.label ? sg.label + ': ' : '') + sg.text)));
    return v;
  }
  cleanPrompt(text).replace(/\s+/g, ' ').split(/(?<=[.!?])\s+(?=[A-Z"“])/).forEach((t) => {
    if (DETECT.peran.test(t)) put('peran', t);
    else if (/^(jangan|maksimal|maks|hanya|tanpa|hindari|pastikan)\b|\b(jangan|tidak boleh)\b/i.test(t)) put('batasan', t);
    else if (/^(format|gunakan format|sertakan|tulis dalam|sajikan|nada)\b|\b(tabel|bullet|poin bernomor|placeholder|paragraf)\b/i.test(t) && !v.format) put('format', t);
    else if (DETECT.tugas.test(t.split(' ').slice(0, 3).join(' '))) put('tugas', t);
    else put('konteks', t);
  });
  return v;
}

/* ── template fill (library tools) ── */
export const fieldLabel = (f) => (f.label || f.placeholder || '').replace(/\s*\*$/, '');
export function fillTemplate(tpl, fields, vals) {
  let out = tpl;
  fields.forEach((f, k) => {
    const key = '«' + (f.label || f.placeholder || 'field' + k).slice(0, 60) + '»';
    out = out.split(key).join((vals[k] || '').trim() || `[${fieldLabel(f)}]`);
  });
  return out;
}
/* split template into text + slot parts for rich preview */
export function templateParts(tpl, fields) {
  let parts = [{ t: tpl }];
  fields.forEach((f, k) => {
    const key = '«' + (f.label || f.placeholder || 'field' + k).slice(0, 60) + '»';
    parts = parts.flatMap((p) => (p.t == null ? [p] : p.t.split(key).flatMap((x, i) => (i ? [{ slot: k }, { t: x }] : [{ t: x }]))));
  });
  return parts;
}

/* ── quiz helpers ── */
const STOP = new Set('yang dan untuk dengan dari pada dalam atau adalah akan ini itu tidak bukan hanya juga sebagai secara setiap lebih bisa dapat harus serta oleh karena agar kita anda mereka para bagi saat ketika bahwa sudah telah'.split(' '));
const words = (s) => String(s).toLowerCase().replace(/[^a-z0-9à-ÿ\s]/g, ' ').split(/\s+/).filter((w) => w.length > 3 && !STOP.has(w));
export function detectHit(ans, item) {
  const a = [...new Set(words(ans))], it = [...new Set(words(item))];
  if (!it.length) return false;
  const hit = it.filter((w) => a.some((x) => x === w || (x.length > 5 && (x.startsWith(w.slice(0, 6)) || w.startsWith(x.slice(0, 6)))))).length;
  return hit >= Math.min(3, Math.ceil(it.length * 0.3));
}
export const PRED = [[90, 'Sempurna'], [80, 'Sangat Baik'], [70, 'Baik'], [60, 'Cukup'], [50, 'Kurang'], [0, 'Perlu Belajar Lagi']];

/* ── clipboard + AI hand-off ── */
export async function copyRaw(text) {
  try { await navigator.clipboard.writeText(text); return true; } catch (_) {
    const ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = 0;
    document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); } catch (__) {} ta.remove(); return true;
  }
}
export const AIS = {
  chatgpt: { name: 'ChatGPT', url: (q) => 'https://chatgpt.com/?q=' + encodeURIComponent(q), base: 'https://chatgpt.com/' },
  claude: { name: 'Claude', url: (q) => 'https://claude.ai/new?q=' + encodeURIComponent(q), base: 'https://claude.ai/new' },
  gemini: { name: 'Gemini', url: null, base: 'https://gemini.google.com/app' },
};

/* ── program helpers ── */
export const shortTitle = (t) => String(t).replace(/^(Sesi \d+|Penutup)\s*—\s*/, '').replace(/\s—\s.*$/, '');
export const stepsOf = (s) => [{ intro: true }, ...s.sections.filter((x) => x.role !== 'goals' && x.blocks.length)];
export const goalsOf = (s) => ((s.sections.find((x) => x.role === 'goals') || { blocks: [] }).blocks.find((b) => b.type === 'list') || { items: [] }).items;
export const groupLabel = (g) => (g.kind === 'supplement' ? 'Framework' : g.title.split('—')[0].trim());
