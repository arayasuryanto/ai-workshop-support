/* Workshop Lab — v2 prototype. One data source (program.json + quiz.json, from the scrape).
   #/                 Peta: continue card + winding path per day, bottom sheet per session
   #/sesi/<slug>/<n>  Player: one section per step, segmented progress, interactive blocks, celebration
   #/lab/...          Prompt Builder · Fishbone · 5 Why · Pareto (the frameworks from the Materi, made hands-on)
   #/prompt[/<id>]    Pustaka: search + filter, fill-in tool with live variable preview
   #/latihan[/...]    Latihan Soal: 10 questions, same mechanics as the real pre/post-test (timer, capped hints)
   #/cetak/<slug>     Print layout → PDF per module (scrape/make_pdfs.py)
   Progress lives in localStorage: a per-viewer convenience, not durable data. */
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const I = {
  map: '<path d="M9 4 4 6v14l5-2 6 2 5-2V4l-5 2z"/><path d="M9 4v14M15 6v14"/>',
  flask: '<path d="M9 3h6M10 3v6L4.5 18.5A1.7 1.7 0 0 0 6 21h12a1.7 1.7 0 0 0 1.5-2.5L14 9V3"/><path d="M7 15h10"/>',
  wand: '<path d="M4 20 15 9M14 4v3M18 8h3M17.5 4.5l-2 2M20 12l-1.5-1.5"/>',
  target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r=".6"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2.5"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  spark: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>',
  arrow: '<path d="M5 12h13M12.5 6l6 6-6 6"/>',
  left: '<path d="M19 12H6M11.5 6l-6 6 6 6"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  list: '<path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r=".8"/><circle cx="4.5" cy="12" r=".8"/><circle cx="4.5" cy="18" r=".8"/>',
  pdf: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 14h6M9 17h4"/>',
  bolt: '<path d="M13 3 5 13.5h6L10 21l8-10.5h-6z"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>',
  ext: '<path d="M14 5h5v5M19 5l-8 8M17 14v4a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 5 18V8.5A1.5 1.5 0 0 1 6.5 7H10"/>',
  play: '<path d="M8 5.5v13l10.5-6.5z"/>',
  trash: '<path d="M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  fish: '<path d="M3 12h13M16 12l4-4v8zM6 12 3.5 7M10 12 7.5 7M6 12l-2.5 5M10 12l-2.5 5"/>',
  chain: '<circle cx="6" cy="6" r="2.5"/><circle cx="12" cy="12" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M7.8 7.8l2.4 2.4M13.8 13.8l2.4 2.4"/>',
  chart: '<path d="M4 20V10M9 20V6M14 20v-6M19 20v-3"/><path d="M4 8c5-4 10-3 15 1"/>',
  trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H5a2.5 2.5 0 0 0 3 4M16 6h3a2.5 2.5 0 0 1-3 4M12 13v4M8.5 20h7"/>',
  aa: '<path d="M3 18 7.5 6 12 18M4.7 14h5.6M14 18l3-8 3 8M15 15.5h4"/>',
};
const svg = (k, c = '') => `<svg class="i ${c}" viewBox="0 0 24 24">${I[k]}</svg>`;

let P = null, Q = null;
const store = {
  get(k, d) { try { const v = JSON.parse(localStorage.getItem('ws2:' + k)); return v == null ? d : v; } catch (_) { return d; } },
  set(k, v) { try { localStorage.setItem('ws2:' + k, JSON.stringify(v)); } catch (_) {} },
  del(k) { try { localStorage.removeItem('ws2:' + k); } catch (_) {} },
};
const done = () => new Set(store.get('done', []));
const shortTitle = (t) => String(t).replace(/^(Sesi \d+|Penutup)\s*—\s*/, '').replace(/\s—\s.*$/, '');
const hash = (s) => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return String(h); };

/* ── XP ── */
const xp = () => store.get('xp', 0);
const level = (x = xp()) => ({ lv: Math.floor(x / 200) + 1, into: x % 200 });
function addXP(n, el) {
  store.set('xp', xp() + n);
  if (el && el.getBoundingClientRect) {
    const r = el.getBoundingClientRect(), f = document.createElement('div');
    f.className = 'xpfly'; f.textContent = '+' + n + ' XP'; f.style.left = r.left + r.width / 2 - 30 + 'px'; f.style.top = r.top - 8 + 'px';
    document.body.appendChild(f); setTimeout(() => f.remove(), 1000);
  }
  const me = $('#meXP'); if (me) paintMe();
}
function once(key, n, el) { const s = new Set(store.get('once', [])); if (s.has(key)) return false; s.add(key); store.set('once', [...s]); addXP(n, el); return true; }

function toast(title, sub) {
  let t = $('#toast');
  t.innerHTML = `<span class="ok">${svg('check', 'i-sm')}</span><span><b>${esc(title)}</b>${sub ? `<span>${esc(sub)}</span>` : ''}</span>`;
  t.hidden = false; t.style.animation = 'none'; void t.offsetWidth; t.style.animation = '';
  clearTimeout(t._h); t._h = setTimeout(() => (t.hidden = true), 2400);
}
async function copyRaw(text) {
  try { await navigator.clipboard.writeText(text); return true; } catch (_) {
    const ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = 0; document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); } catch (__) {} ta.remove(); return true;
  }
}
async function copyText(text, btn, sub) {
  await copyRaw(text);
  if (btn) { const old = btn.innerHTML; btn.classList.add('ok'); btn.innerHTML = svg('check', 'i-sm') + 'Tersalin'; setTimeout(() => { btn.classList.remove('ok'); btn.innerHTML = old; }, 1600); }
  toast('Prompt tersalin', sub || 'Tempel di ChatGPT, Claude, Gemini, DeepSeek, atau Qwen');
  const c = store.get('copied', []); if (!c.includes(hash(text))) { c.push(hash(text)); store.set('copied', c); addXP(2, btn); }
}
const AIS = {
  chatgpt: { name: 'ChatGPT', url: (q) => 'https://chatgpt.com/?q=' + encodeURIComponent(q), base: 'https://chatgpt.com/' },
  claude: { name: 'Claude', url: (q) => 'https://claude.ai/new?q=' + encodeURIComponent(q), base: 'https://claude.ai/new' },
  gemini: { name: 'Gemini', url: null, base: 'https://gemini.google.com/app' },
};
async function openIn(ai, text) {
  const a = AIS[ai]; await copyRaw(text);
  const url = a.url && text.length < 6000 ? a.url(text) : a.base;
  window.open(url, '_blank', 'noopener');
  toast(`Membuka ${a.name}`, a.url && text.length < 6000 ? 'Prompt sudah terisi — tinggal kirim' : 'Prompt sudah disalin — tempel (Ctrl/⌘+V) lalu kirim');
}
const aiButtons = (id) => `<button class="mini" data-ai="chatgpt" data-for="${id}">${svg('ext', 'i-sm')}ChatGPT</button>
  <button class="mini" data-ai="claude" data-for="${id}">${svg('ext', 'i-sm')}Claude</button>
  <button class="mini" data-ai="gemini" data-for="${id}">${svg('ext', 'i-sm')}Gemini</button>`;

/* ── shell ── */
function paintMe() {
  const x = xp(), l = level(x), me = $('#meXP'); if (!me) return;
  me.innerHTML = `<div class="row"><span class="eyebrow">Level ${l.lv}</span><span class="lv">${l.into}/200</span></div>
    <div class="row" style="margin-top:6px"><span class="xp">${x} XP</span><span class="lv">${done().size}/${allSlugs().length} sesi</span></div>
    <div class="bar"><i style="width:${(l.into / 200) * 100}%"></i></div>`;
  const mx = $('#mXP'); if (mx) mx.textContent = x + ' XP';
}
const allSlugs = () => P.groups.flatMap((g) => g.sessions);
function shell(active, inner) {
  document.body.className = '';
  const nav = [['peta', '#/', 'map', 'Peta Belajar', allSlugs().length], ['lab', '#/lab', 'flask', 'Lab Praktik', 4],
    ['prompt', '#/prompt', 'wand', 'Pustaka Prompt', P.tools.prompt_library.length + P.tools.case_study.length], ['latihan', '#/latihan', 'target', 'Latihan Soal', Q.questions.length]];
  $('#app').innerHTML = `<aside class="side">
      <a class="brand" href="#/"><span class="mk">${svg('spark')}</span><span><b>Gen AI Workshop</b><small>PAM Jaya × BusinessFirst</small></span></a>
      <nav class="nav">${nav.map(([k, h, ic, l, n]) => `<a href="${h}" class="${active === k ? 'on' : ''}">${svg(ic)}${l}<span class="ct">${n}</span></a>`).join('')}</nav>
      <div class="me" id="meXP"></div></aside>
    <div class="main"><div class="page">
      <div class="mhd"><a class="brand" href="#/"><span class="mk">${svg('spark', 'i-sm')}</span><span><b>Gen AI Workshop</b><small>PAM Jaya × BusinessFirst</small></span></a><span class="xpchip" id="mXP"></span></div>
      ${inner}</div></div>
    <nav class="tabbar">${nav.map(([k, h, ic, l]) => `<a href="${h}" class="${active === k ? 'on' : ''}">${svg(ic)}${l.split(' ')[0]}</a>`).join('')}</nav>`;
  paintMe(); window.scrollTo(0, 0);
}
function wireAI(root = document, getText) {
  $$('[data-ai]', root).forEach((b) => (b.onclick = () => openIn(b.dataset.ai, getText(b.dataset.for, b))));
}

/* ── prompt anatomy ── */
const KEYS = ['peran', 'konteks', 'tugas', 'batasan', 'format'];
const KNAME = { peran: 'Peran', konteks: 'Konteks', tugas: 'Tugas', batasan: 'Batasan', format: 'Format' };
const LABEL_RE = /^\s*(?:\[([A-Z][A-Z0-9 /&\-]{1,28})\]|([A-Z][A-Z0-9 /&\-]{1,28})\s*:)\s?(.*)$/;
const DETECT = {
  peran: /\b(anda adalah|kamu adalah|bertindak(lah)? sebagai|berperan(lah)? sebagai|sebagai (seorang|konsultan|analis|staf|ahli|spesialis))/i,
  konteks: /\b(konteks|latar|situasi|berikut (data|catatan|laporan|teks|isi)|data berikut|saya (bekerja|staf|sedang)|kami|di pam jaya|unit|wilayah)/i,
  tugas: /\b(buat(kan|lah)?|tulis(kan|lah)?|susun(lah)?|ringkas(kan|lah)?|analisis(lah)?|jelaskan|bandingkan|identifikasi(kan)?|berikan|rancang(lah)?|hitung(lah)?|kelompokkan|kategorikan|klasifikasikan|periksa|terjemahkan|ubah(lah)?|perbaiki|evaluasi|nilai(lah)?|simpulkan|sebutkan|daftarkan|tentukan|urutkan|prioritaskan|cari(kan)?|rekomendasikan|sarankan)\b/i,
  batasan: /\b(jangan|maksimal|maks\.?|hanya|tanpa|tidak boleh|minimal|paling banyak|hindari|pastikan)\b/i,
  format: /\b(tabel|poin|bullet|format|paragraf|daftar|kolom|kalimat|bagian|judul|markdown|langkah bernomor)\b/i,
};
function detect(text) { const f = {}; KEYS.forEach((k) => (f[k] = DETECT[k].test(text))); return f; }
function parsePrompt(text) {
  const lines = String(text).replace(/^["“]|["”]$/g, '').split('\n'); const segs = []; let cur = null;
  for (const ln of lines) {
    const m = ln.match(LABEL_RE);
    if (m) {
      const lab = (m[1] || m[2]).trim(), k = KEYS.find((x) => x === lab.toLowerCase()) || 'lain';
      cur = { k, label: lab, lines: [m[3]] }; segs.push(cur);
    } else if (cur) cur.lines.push(ln); else { cur = { k: null, lines: [ln] }; segs.push(cur); }
  }
  return segs.map((s) => ({ ...s, text: s.lines.join('\n') }));
}
function anatomyHtml(text) {
  const segs = parsePrompt(text), labelled = segs.filter((s) => s.k && s.k !== 'lain').map((s) => s.k);
  const f = labelled.length >= 2 ? Object.fromEntries(KEYS.map((k) => [k, labelled.includes(k)])) : detect(text);
  const n = KEYS.filter((k) => f[k]).length;
  const body = segs.map((s) => s.k ? `<span class="sg k-${s.k}"><span class="k">${esc(s.label)}${s.label ? ':' : ''}</span> ${esc(s.text)}</span>`
    : `${esc(s.text)}\n`).join('').replace(/\n$/, '');
  return { n, f, body, labelled: labelled.length >= 2 };
}
const anatBar = (f, n) => `<span class="anat" title="Komponen prompt terdeteksi">${KEYS.map((k) => `<i class="k-${k} ${f[k] ? 'on' : ''}" title="${KNAME[k]}"></i>`).join('')}<span>${n}/5 komponen</span></span>`;
const isPromptBlock = (b) => b.type === 'code' || /^\s*["“]/.test(b.text) || LABEL_RE.test(b.text.split('\n')[0]) || DETECT.peran.test(b.text.slice(0, 60)) ||
  /^(buat|tulis|susun|ringkas|analisis|jelaskan|bandingkan|identifikasi|berikan|rancang|saya|tolong|bantu)/i.test(b.text.trim());

/* ── blocks (player) ── */
let PROMPTS = {};
function promptCard(text, label = 'Contoh prompt') {
  const id = 'p' + Object.keys(PROMPTS).length; const clean = String(text).replace(/^\s*["“]|["”]\s*$/g, '').trim(); PROMPTS[id] = clean;
  const a = anatomyHtml(clean);
  return `<div class="pc" data-pid="${id}"><div class="pc-hd"><span class="lbl">${svg('spark', 'i-sm')}${label}</span><span class="sp"></span>${anatBar(a.f, a.n)}</div>
    <div class="pc-body">${a.body}</div>
    <div class="pc-acts"><button class="mini pri" data-copy="${id}">${svg('copy', 'i-sm')}Salin</button>${aiButtons(id)}
      <span style="flex:1"></span><button class="mini" data-remix="${id}">${svg('wand', 'i-sm')}Remix di Builder</button></div></div>`;
}
function tableHtml(rows) {
  if (!rows || !rows.length) return '';
  const [h, ...r] = rows;
  if (h.length === 2 && /lemah|sebelum|buruk|kurang/i.test(h[0]) && /kuat|sesudah|baik/i.test(h[1]) && r.length) {
    return `<div class="flip">${r.map((row, k) => { const id = 'p' + Object.keys(PROMPTS).length; PROMPTS[id] = row[1];
      return `<div class="fc weak" data-flip="${k}"><div class="st">${svg('x', 'i-sm')}${esc(h[0])}<span class="cnt">· ${k + 1}/${r.length}</span></div><div class="txt">${esc(row[0])}</div>
        <div class="foot"><button class="mini pri" data-strong="${id}">${svg('bolt', 'i-sm')}Perkuat</button></div></div>
        <div class="fc strong" id="st-${id}" hidden><div class="st">${svg('check', 'i-sm')}${esc(h[1])}</div><div class="txt">${esc(row[1])}</div>
        <div class="foot"><button class="mini" data-copy="${id}">${svg('copy', 'i-sm')}Salin versi kuat</button>${aiButtons(id)}</div></div>`; }).join('')}</div>`;
  }
  return `<div class="tbl"><table><thead><tr>${h.map((c) => `<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>${r.map((row) => `<tr>${row.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}
function blockHtml(b) {
  switch (b.type) {
    case 'text': return `<p>${esc(b.text)}</p>`;
    case 'subheading': return b.level >= 4 ? `<h4>${esc(b.text)}</h4>` : `<h3>${esc(b.text)}</h3>`;
    case 'list': return `<${b.ordered ? 'ol' : 'ul'}>${b.items.map((x) => `<li>${esc(x)}</li>`).join('')}</${b.ordered ? 'ol' : 'ul'}>`;
    case 'table': return tableHtml(b.rows);
    case 'quote': case 'code':
      if (isPromptBlock(b)) return promptCard(b.text);
      return `<div class="callout"><span class="eyebrow">Catatan</span>${esc(b.text)}</div>`;
    default: return '';
  }
}
function wireBlocks(root) {
  $$('[data-copy]', root).forEach((b) => (b.onclick = () => copyText(PROMPTS[b.dataset.copy], b)));
  wireAI(root, (id) => PROMPTS[id]);
  $$('[data-remix]', root).forEach((b) => (b.onclick = () => { store.set('remix', PROMPTS[b.dataset.remix]); location.hash = '#/lab/prompt'; }));
  $$('[data-strong]', root).forEach((b) => (b.onclick = () => {
    const s = $('#st-' + b.dataset.strong); s.hidden = false; s.classList.add('pop'); b.remove(); once('flip:' + hash(PROMPTS[b.dataset.strong]), 3, s);
  }));
}

/* ═════ PETA ═════ */
const OFFS = [0, 70, 105, 70, 0, -70, -105, -70];
function groupLabel(g) { return g.kind === 'supplement' ? 'Framework' : g.title.split('—')[0].trim(); }
function home() {
  const dn = done(), all = allSlugs(), next = all.find((s) => !dn.has(s));
  let gi = store.get('tab', null);
  if (gi == null) gi = Math.max(0, P.groups.findIndex((g) => g.sessions.includes(next)));
  const g = P.groups[gi];
  const ns = next ? P.sessions[next] : null, vis = next ? store.get('vis:' + next, []) : [], nsteps = ns ? stepsOf(ns).length : 0;
  const copied = store.get('copied', []).length, best = store.get('quizBest', null);
  shell('peta', `
    <div class="home"><div>
      ${ns ? `<div class="cont"><div><span class="eyebrow">${dn.size ? 'Lanjutkan belajar' : 'Mulai perjalanan'} · ${esc(groupLabel(P.groups.find((x) => x.sessions.includes(next))))}</span>
          <h2>${esc(ns.title)}</h2><p>${esc(ns.subtitle).slice(0, 150)}${ns.subtitle.length > 150 ? '…' : ''}</p>
          <div class="steps">${Array.from({ length: nsteps }, (_, k) => `<i class="${vis.includes(k) ? 'on' : ''}"></i>`).join('')}</div>
          <a class="btn btn-p btn-lg" href="#/sesi/${next}/${Math.min(nsteps - 1, vis.length ? Math.max(...vis) : 0)}">${svg('play', 'i-sm')}${vis.length ? 'Lanjutkan' : 'Mulai'} · ${ns.read_min || 5} mnt</a></div>
        <div class="thumb" style="background-image:url('${ns.image || ''}')"></div></div>`
      : `<div class="cont"><div><span class="eyebrow">Semua sesi selesai</span><h2>Anda menuntaskan seluruh materi 🎉</h2><p>Uji pemahaman Anda di Latihan Soal.</p><a class="btn btn-gold btn-lg" href="#/latihan">Mulai latihan</a></div></div>`}
      <div class="seg" id="tabs">${P.groups.map((x, k) => `<button data-g="${k}" class="${k === gi ? 'on' : ''}">${esc(groupLabel(x))}<span class="n">${x.sessions.filter((s) => dn.has(s)).length}/${x.sessions.length}</span></button>`).join('')}</div>
      <p class="daydesc">${esc(g.kind === 'supplement' ? 'Framework analisis, teknik prompting, dan kisi-kisi soal — bacaan pendukung yang dipakai di semua sesi.' : g.title.split('—')[1] ? g.title.split('—')[1].trim() + ' · ' + g.sessions.length + ' sesi' : '')}</p>
      <div class="map" id="map"></div>
    </div>
    <aside class="rail-r">
      <div class="stat3"><div><b>${dn.size}</b><span>sesi selesai</span></div><div><b style="color:var(--gold)">${xp()}</b><span>XP</span></div><div><b>${copied}</b><span>prompt disalin</span></div></div>
      <div class="sechd"><span class="eyebrow">Lab praktik</span><a class="eyebrow" href="#/lab" style="color:var(--accent)">Semua →</a></div>
      ${labCard('prompt', 'Prompt Builder', 'Rakit prompt 5 komponen, lihat skornya naik', 'var(--c-tugas)', 'wand')}
      ${labCard('fishbone', 'Fishbone 6M', 'Petakan penyebab, lalu minta AI mengujinya', 'var(--c-konteks)', 'fish')}
      ${labCard('5why', '5 Why', 'Gali sampai akar — rantai terbuka satu per satu', 'var(--c-peran)', 'chain')}
      ${labCard('pareto', 'Pareto 80/20', 'Masukkan data, lihat penyebab vital', 'var(--c-format)', 'chart')}
      <a class="labcard" href="#/latihan" style="border-color:rgba(245,200,66,.4)"><span class="ic" style="background:rgba(245,200,66,.12);color:var(--gold)">${svg('trophy')}</span>
        <span><b>Latihan Soal</b><span>${best != null ? `Skor terbaik ${best}/100 · ulangi kapan saja` : '10 soal esai · simulasi pre/post-test'}</span></span></a>
    </aside></div>`);
  drawMap(g, dn);
  $$('#tabs button').forEach((b) => (b.onclick = () => { store.set('tab', +b.dataset.g); home(); }));
}
const labCard = (k, t, d, c, ic) => `<a class="labcard" href="#/lab/${k}"><span class="ic" style="background:color-mix(in srgb, ${c} 14%, transparent);color:${c}">${svg(ic)}</span><span><b>${t}</b><span>${d}</span></span></a>`;
function drawMap(g, dn) {
  const el = $('#map'); const W = el.clientWidth || 560, sc = Math.min(1, W / 560), cx = W / 2, GAP = 118;
  const cur = g.sessions.find((s) => !dn.has(s));
  const pts = g.sessions.map((s, i) => ({ s, x: cx + OFFS[i % OFFS.length] * sc * (W < 420 ? 0.62 : 1), y: 60 + i * GAP }));
  el.style.height = pts.length * GAP + 30 + 'px';
  let d = '', sd = '';
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i], seg = `M${a.x},${a.y} C${a.x},${a.y + GAP / 2} ${b.x},${b.y - GAP / 2} ${b.x},${b.y} `;
    if (dn.has(a.s) && dn.has(b.s)) sd += seg; else d += seg;
  }
  el.innerHTML = `<svg class="trail"><path class="d" d="${d}"/><path class="s" d="${sd}"/></svg>` + pts.map((p, i) => {
    const s = P.sessions[p.s], st = dn.has(p.s) ? 'done' : p.s === cur ? 'cur' : '', side = p.x - cx > 1 ? 'l' : 'r';
    const num = s.number ? s.number : i + 1;
    return `<div class="nd ${st} ${side}" style="left:${p.x}px;top:${p.y}px">${st === 'cur' ? `<span class="go">${store.get('vis:' + p.s, []).length ? 'LANJUT' : 'MULAI'}</span>` : ''}
      <button class="dot" data-open="${p.s}" aria-label="${esc(s.title)}">${st === 'done' ? svg('check') : num}</button>
      <div class="lab" data-open="${p.s}">${esc(shortTitle(s.title))}<small>${s.slot ? s.slot + ' · ' : ''}${s.read_min || 5} mnt${s.stats.copyable ? ' · ' + s.stats.copyable + ' prompt' : ''}</small></div></div>`;
  }).join('');
  $$('[data-open]', el).forEach((b) => (b.onclick = () => sheet(b.dataset.open)));
}
function sheet(slug) {
  const s = P.sessions[slug], dn = done(), vis = store.get('vis:' + slug, []), n = stepsOf(s).length;
  const goals = (s.sections.find((x) => x.role === 'goals') || { blocks: [] }).blocks.find((b) => b.type === 'list');
  closeSheet();
  const sc = document.createElement('div'); sc.className = 'scrim'; sc.id = 'scrim';
  const sh = document.createElement('div'); sh.className = 'sheet'; sh.id = 'sheet';
  sh.innerHTML = `<div class="grab"></div>${s.image ? `<div class="cover" style="background-image:url('${s.image}')"></div>` : ''}
    <div class="in"><span class="eyebrow">${s.number ? `Sesi ${s.number} · Hari ${s.day}` : 'Materi pendukung'}${dn.has(slug) ? ' · selesai ✓' : ''}</span>
      <h3>${esc(shortTitle(s.title))}</h3><p>${esc(s.subtitle)}</p>
      <div class="facts">${s.slot ? `<span class="chip">${svg('clock', 'i-sm')}${s.slot}</span>` : ''}<span class="chip">${s.read_min || 5} mnt</span><span class="chip">${n} langkah</span>${s.stats.copyable ? `<span class="chip">${s.stats.copyable} prompt</span>` : ''}</div>
      ${goals ? `<span class="eyebrow">Yang akan Anda kuasai</span><ul class="gl">${goals.items.slice(0, 4).map((x) => `<li>${svg('check', 'i-sm')}${esc(x)}</li>`).join('')}</ul>` : ''}
      <div class="acts"><a class="btn btn-p btn-lg" href="#/sesi/${slug}/${vis.length && !dn.has(slug) ? Math.min(n - 1, Math.max(...vis)) : 0}">${svg('play', 'i-sm')}${dn.has(slug) ? 'Ulangi' : vis.length ? `Lanjutkan · ${vis.length}/${n}` : 'Mulai sesi'}</a>
        <a class="btn btn-g btn-lg" href="pdf/${slug}.pdf" download>${svg('pdf', 'i-sm')}PDF</a>
        <a class="btn btn-g btn-lg" href="#/cetak/${slug}" target="_blank">Baca utuh</a></div></div>`;
  document.body.append(sc, sh); requestAnimationFrame(() => { sc.classList.add('show'); sh.classList.add('show'); });
  sc.onclick = closeSheet;
}
function closeSheet() { $('#scrim')?.remove(); $('#sheet')?.remove(); }

/* ═════ PLAYER ═════ */
function stepsOf(s) { return [{ intro: true }, ...s.sections.filter((x) => x.role !== 'goals' && x.blocks.length)]; }
let lastStep = 0;
function player(slug, k) {
  const s = P.sessions[slug]; if (!s) return home();
  closeSheet(); PROMPTS = {};
  const steps = stepsOf(s); k = Math.max(0, Math.min(steps.length - 1, k | 0));
  const vis = new Set(store.get('vis:' + slug, [])); const first = !vis.has(k); vis.add(k); store.set('vis:' + slug, [...vis]);
  const st = steps[k], goals = (s.sections.find((x) => x.role === 'goals') || { blocks: [] }).blocks.find((b) => b.type === 'list');
  let body;
  if (st.intro) {
    const got = new Set(store.get('goals:' + slug, []));
    body = `<div class="cover-xl" style="background-image:url('${s.image || ''}')"></div>
      <div class="kicker">${s.number ? `<span class="chip">Sesi ${s.number} · Hari ${s.day}</span>` : '<span class="chip">Materi pendukung</span>'}${s.slot ? `<span class="chip">${svg('clock', 'i-sm')}${s.slot}</span>` : ''}<span class="chip">${s.read_min || 5} mnt · ${steps.length - 1} langkah</span></div>
      <h1>${esc(shortTitle(s.title))}</h1><p>${esc(s.subtitle)}</p>
      ${goals ? `<div class="goals"><span class="eyebrow">Yang akan Anda kuasai — centang yang sudah Anda yakini</span>${goals.items.map((x, i) => `<div class="g ${got.has(i) ? 'ok' : ''}" data-goal="${i}"><span class="bx">${svg('check', 'i-sm')}</span><span>${esc(x)}</span></div>`).join('')}</div>` : ''}`;
  } else if (st.role === 'summary') {
    const lists = st.blocks.filter((b) => b.type === 'list').flatMap((b) => b.items);
    body = `<span class="eyebrow">Rangkuman</span><h2>${esc(st.heading || 'Rangkuman Sesi')}</h2>` +
      st.blocks.filter((b) => b.type !== 'list').map(blockHtml).join('') +
      (lists.length ? `<div class="takeaways">${lists.map((x, i) => `<div><b>${String(i + 1).padStart(2, '0')}</b><span>${esc(x)}</span></div>`).join('')}</div>` : '');
  } else {
    const mins = ((st.heading || '').match(/(\d+)\s*menit/) || [])[1];
    const isPrac = st.role === 'practice' || /latihan|praktik|tantangan/i.test(st.heading || '');
    body = `<span class="eyebrow">Langkah ${k} dari ${steps.length - 1}${isPrac ? ' · Latihan' : ''}</span><h2>${esc(st.heading || '')}</h2>` + st.blocks.map(blockHtml).join('') +
      (isPrac ? `<div class="prac"><div class="top">${svg('flask', 'i-sm')}<b>Kerjakan sekarang</b><span style="flex:1"></span>
        <span class="timer" id="tmr">${mins ? mins + ':00' : ''}</span>${mins ? `<button class="mini" id="tgo">${svg('play', 'i-sm')}Mulai ${mins} menit</button>` : ''}</div>
        <textarea rows="5" id="pnote" placeholder="Tulis prompt atau hasil latihan Anda di sini — tersimpan otomatis di perangkat ini.">${esc(store.get('note:' + slug + ':' + k, ''))}</textarea>
        <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap"><button class="mini" id="pcopy">${svg('copy', 'i-sm')}Salin tulisan saya</button>${aiButtons('note')}</div></div>` : '');
  }
  document.body.className = 'play' + (store.get('big', false) ? ' big' : '');
  const last = k === steps.length - 1;
  $('#app').innerHTML = `<div class="pl-top"><div class="in">
      <a class="icon-btn" href="#/" title="Kembali ke peta">${svg('x')}</a>
      <button class="icon-btn" id="olb" title="Daftar langkah">${svg('list')}</button>
      <div class="segs">${steps.map((_, i) => `<button data-go="${i}" class="${i === k ? 'c' : vis.has(i) ? 'v' : ''}" title="Langkah ${i}"></button>`).join('')}</div>
      <span class="stepno">${String(k).padStart(2, '0')}/${String(steps.length - 1).padStart(2, '0')}</span>
      <button class="icon-btn" id="aa" title="Ukuran teks">${svg('aa')}</button></div></div>
    <div class="outline" id="ol"><div class="eyebrow" style="padding:6px 10px 12px">${esc(shortTitle(s.title))}</div>
      ${steps.map((x, i) => `<a data-go="${i}" class="${i === k ? 'on' : ''} ${vis.has(i) ? 'v' : ''}"><span class="n">${vis.has(i) ? '✓' : String(i).padStart(2, '0')}</span><span>${esc(x.intro ? 'Pembuka & tujuan' : x.heading || 'Bagian ' + i)}</span></a>`).join('')}
      <a href="pdf/${slug}.pdf" download style="margin-top:12px;color:var(--accent)"><span class="n">${svg('pdf', 'i-sm')}</span><span>Unduh PDF modul</span></a></div>
    <main class="stage ${k < lastStep ? 'back' : ''}">${body}</main>
    <div class="pl-bot"><div class="in">
      ${k > 0 ? `<button class="btn btn-g btn-lg" data-go="${k - 1}">${svg('left', 'i-sm')}</button>` : ''}
      <button class="btn ${last ? 'btn-mint' : 'btn-p'} btn-lg grow" id="nx">${last ? svg('check', 'i-sm') + 'Selesaikan sesi' : k === 0 ? 'Mulai ' + svg('arrow', 'i-sm') : 'Lanjut ' + svg('arrow', 'i-sm')}</button></div></div>`;
  lastStep = k; window.scrollTo(0, 0);
  if (first && k > 0) once('step:' + slug + ':' + k, 5, $('#nx'));
  const go = (i) => (location.hash = `#/sesi/${slug}/${i}`);
  $$('[data-go]').forEach((b) => (b.onclick = () => go(+b.dataset.go)));
  $('#nx').onclick = () => (last ? finish(slug) : go(k + 1));
  $('#olb').onclick = (e) => { e.stopPropagation(); $('#ol').classList.toggle('show'); };
  $('#aa').onclick = () => { store.set('big', !store.get('big', false)); document.body.classList.toggle('big'); };
  document.onclick = (e) => { const ol = $('#ol'); if (ol && ol.classList.contains('show') && !ol.contains(e.target)) ol.classList.remove('show'); };
  $$('[data-goal]').forEach((g) => (g.onclick = () => {
    const got = new Set(store.get('goals:' + slug, [])); const i = +g.dataset.goal; got.has(i) ? got.delete(i) : got.add(i); store.set('goals:' + slug, [...got]); g.classList.toggle('ok');
  }));
  const pn = $('#pnote');
  if (pn) {
    pn.oninput = () => store.set('note:' + slug + ':' + k, pn.value);
    $('#pcopy').onclick = () => copyText(pn.value, $('#pcopy'), 'Tulisan Anda tersalin');
    wireAI($('.prac'), () => pn.value);
    const tg = $('#tgo');
    if (tg) tg.onclick = () => {
      let left = parseInt($('#tmr').textContent, 10) * 60; clearInterval(window._tm); tg.remove();
      window._tm = setInterval(() => { left--; const t = $('#tmr'); if (!t) return clearInterval(window._tm);
        t.textContent = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`; if (left <= 0) { clearInterval(window._tm); t.textContent = 'Waktu habis'; toast('Waktu latihan habis', 'Bandingkan hasil Anda dengan rekan satu kelompok'); } }, 1000);
    };
  }
  wireBlocks($('.stage'));
  document.onkeydown = (e) => {
    if (/INPUT|TEXTAREA/.test(document.activeElement.tagName)) return;
    if (e.key === 'ArrowRight' && !last) go(k + 1); else if (e.key === 'ArrowLeft' && k > 0) go(k - 1); else if (e.key === 'Escape') location.hash = '#/';
  };
}
function finish(slug) {
  const d = done(), fresh = !d.has(slug); d.add(slug); store.set('done', [...d]);
  if (fresh) addXP(50);
  const all = allSlugs(), next = all.find((s) => !d.has(s)), ns = next && P.sessions[next];
  const c = document.createElement('div'); c.className = 'confetti';
  const cols = ['#4dabf7', '#34e8a0', '#f5c842', '#b197fc', '#ff8787'];
  c.innerHTML = Array.from({ length: 70 }, () => `<i style="left:${Math.random() * 100}%;background:${cols[Math.random() * 5 | 0]};animation-duration:${1.6 + Math.random() * 1.6}s;animation-delay:${Math.random() * .5}s"></i>`).join('');
  const box = document.createElement('div'); box.className = 'celebrate';
  box.innerHTML = `<div class="box"><div class="big">${svg('check')}</div><h2>Sesi selesai!</h2>
    <div class="xpg">${fresh ? '+50 XP' : 'Diulang — XP sudah tercatat'} · Level ${level().lv}</div>
    ${ns ? `<a class="nx" href="#/sesi/${next}/0"><span class="th" style="background-image:url('${ns.image || ''}')"></span><span><span class="eyebrow">Berikutnya</span><b>${esc(shortTitle(ns.title))}</b><span>${ns.read_min || 5} mnt · ${stepsOf(ns).length - 1} langkah</span></span></a>` : ''}
    ${ns ? `<a class="btn btn-p btn-lg btn-block" href="#/sesi/${next}/0">Lanjut ke sesi berikutnya ${svg('arrow', 'i-sm')}</a>` : `<a class="btn btn-gold btn-lg btn-block" href="#/latihan">Uji diri di Latihan Soal</a>`}
    <div class="row2"><a class="btn btn-g" href="pdf/${slug}.pdf" download>${svg('pdf', 'i-sm')}PDF modul</a><a class="btn btn-g" href="#/">Ke peta</a></div></div>`;
  document.body.append(box, c); setTimeout(() => c.remove(), 3600);
  const kill = () => { box.remove(); c.remove(); removeEventListener('hashchange', kill); };
  addEventListener('hashchange', kill);
}

/* ═════ LAB ═════ */
const MINI = {
  prompt: `<svg viewBox="0 0 200 90">${KEYS.map((k, i) => `<rect x="10" y="${8 + i * 16}" width="${[120, 170, 150, 100, 130][i]}" height="10" rx="5" fill="var(--c-${k})" opacity=".85"/>`).join('')}</svg>`,
  fishbone: `<svg viewBox="0 0 200 90"><path d="M15 45h150" stroke="var(--accent)" stroke-width="3"/><rect x="165" y="33" width="30" height="24" rx="5" fill="var(--accent)"/>${[40, 85, 130].map((x) => `<path d="M${x} 45 ${x - 22} 12M${x} 45 ${x - 22} 78" stroke="var(--c-konteks)" stroke-width="2.5"/>`).join('')}</svg>`,
  '5why': `<svg viewBox="0 0 200 90">${[0, 1, 2, 3, 4].map((i) => `<circle cx="${22 + i * 38}" cy="45" r="11" fill="${i === 4 ? 'var(--gold)' : 'var(--accent)'}"/>${i < 4 ? `<path d="M${34 + i * 38} 45h14" stroke="var(--line2)" stroke-width="3"/>` : ''}`).join('')}</svg>`,
  pareto: `<svg viewBox="0 0 200 90">${[70, 48, 26, 16, 10, 6].map((h, i) => `<rect x="${14 + i * 30}" y="${84 - h}" width="22" height="${h}" rx="3" fill="${i < 2 ? 'var(--accent)' : 'var(--panel3)'}"/>`).join('')}<path d="M25 40 55 22 85 13 115 8 145 5 175 4" fill="none" stroke="var(--gold)" stroke-width="2.5"/></svg>`,
};
function labHub() {
  const t = [['prompt', 'Prompt Builder', 'Rakit prompt dengan kerangka PERAN – KONTEKS – TUGAS – BATASAN – FORMAT dari Sesi 3. Skor naik setiap komponen terisi; kirim langsung ke AI Anda.', 'sesi-03-dasar-dasar-prompting'],
    ['fishbone', 'Fishbone 6M', 'Tulis masalah di kepala ikan, isi penyebab per kategori 6M. Hasilnya prompt yang meminta AI menguji, melengkapi, dan memprioritaskan penyebab.', 'fishbone-analysis'],
    ['5why', '5 Why', 'Tanya "kenapa?" lima kali — setiap jawaban membuka pertanyaan berikutnya. Uji balik rantainya, lalu minta AI mencari celah.', '5-why-analysis'],
    ['pareto', 'Pareto 80/20', 'Masukkan kategori dan jumlah kejadian. Grafik mengurutkan dan menandai penyebab vital yang menyumbang 80% masalah.', 'pareto-analysis']];
  shell('lab', `<div class="pagehd"><div><span class="eyebrow">Lab praktik</span><h1>Kerjakan, jangan hanya baca</h1>
      <p>Empat alat dari materi workshop, dibuat bisa dipakai. Setiap alat menghasilkan prompt yang siap dikirim ke ChatGPT, Claude, atau Gemini.</p></div></div>
    <div class="labgrid">${t.map(([k, n, d, m]) => `<a class="lab-t" href="#/lab/${k}"><div class="vis">${MINI[k]}</div><h3>${n}</h3><p>${d}</p>
      <span class="eyebrow" style="color:var(--accent)">Materi: ${esc(shortTitle(P.sessions[m].title))} →</span></a>`).join('')}</div>`);
}
function labPage(title, sub, material, left, right) {
  return `<a class="crumb" href="#/lab">${svg('left', 'i-sm')}Lab praktik</a>
    <div class="pagehd"><div><h1>${title}</h1><p>${sub}</p></div><span style="flex:1"></span>
      ${material ? `<a class="btn btn-g" href="#/sesi/${material}/0">${svg('play', 'i-sm')}Pelajari materinya</a>` : ''}</div>
    <div class="two"><div>${left}</div><div class="sticky">${right}</div></div>`;
}
function outPanel(id, title) {
  return `<div class="panel"><div style="display:flex;align-items:center;gap:10px;margin-bottom:12px"><h3>${title}</h3><span style="flex:1"></span>
    <button class="mini pri" id="cp-${id}">${svg('copy', 'i-sm')}Salin</button></div>
    <div class="pv" id="pv-${id}"></div><div class="aitarget">${aiButtons(id)}</div></div>`;
}

/* Prompt Builder */
const PRESETS = [
  { n: 'Ringkas laporan gangguan', v: { peran: 'Anda adalah staf analis operasional distribusi air minum di PAM Jaya.', konteks: 'Saya punya catatan gangguan harian dari 3 wilayah layanan selama seminggu (terlampir di bawah). Laporan ini akan dibaca Kepala Divisi dalam rapat Senin pagi.', tugas: 'Ringkas catatan tersebut menjadi laporan mingguan: pola gangguan terbanyak, wilayah paling terdampak, dan 3 tindak lanjut yang disarankan.', batasan: 'Maksimal 250 kata. Jangan menambah angka yang tidak ada di catatan — tandai "perlu dicek" jika data kurang.', format: 'Judul, 3 poin temuan, tabel singkat (wilayah | jumlah gangguan | penyebab utama), lalu 3 tindak lanjut bernomor.' } },
  { n: 'Balas keluhan pelanggan', v: { peran: 'Anda adalah petugas layanan pelanggan PAM Jaya yang ramah dan tenang.', konteks: 'Pelanggan mengeluh tagihan bulan ini naik dua kali lipat, padahal pemakaian merasa sama. Pemeriksaan awal: ada kemungkinan salah baca meter.', tugas: 'Tulis balasan WhatsApp yang meminta maaf, menjelaskan langkah pengecekan, dan meminta foto meter terbaru.', batasan: 'Jangan menjanjikan pengembalian dana sebelum verifikasi. Hindari istilah teknis.', format: 'Maksimal 5 kalimat pendek, bahasa sehari-hari, tanpa poin.' } },
  { n: 'Notulen rapat', v: { peran: 'Anda adalah sekretaris rapat yang teliti.', konteks: 'Berikut transkrip rapat koordinasi penanganan kebocoran pipa di wilayah Jakarta Utara (45 menit, 6 peserta).', tugas: 'Susun notulen: keputusan, tindak lanjut beserta PIC dan tenggat, serta isu yang belum selesai.', batasan: 'Hanya tulis yang benar-benar disebut di transkrip. Jika PIC atau tenggat tidak disebut, tulis "belum ditetapkan".', format: 'Tiga bagian berjudul; tindak lanjut dalam tabel (tindakan | PIC | tenggat).' } },
];
const BHINT = {
  peran: ['Siapa yang Anda minta menjawab?', ['Anda adalah analis data layanan pelanggan PAM Jaya.', 'Anda adalah konsultan komunikasi publik BUMD.', 'Anda adalah auditor internal yang skeptis.']],
  konteks: ['Situasi, data, dan untuk siapa hasilnya.', ['Hasilnya untuk rapat direksi minggu depan.', 'Data terlampir: 800 komplain/bulan, 25% pindah kanal.', 'Pembacanya pelanggan awam, bukan staf teknis.']],
  tugas: ['Apa persisnya yang harus dikerjakan? Pakai kata kerja.', ['Identifikasi 3 penyebab utama dan urutkan dampaknya.', 'Buat draf surat pemberitahuan gangguan.', 'Bandingkan dua opsi dan beri rekomendasi.']],
  batasan: ['Apa yang tidak boleh, dan rambu-rambunya.', ['Maksimal 200 kata.', 'Jangan mengarang angka — tandai jika data kurang.', 'Jangan menyebut nama pelanggan.']],
  format: ['Bentuk keluaran yang Anda inginkan.', ['Tabel: masalah | penyebab | tindakan.', '5 poin bernomor, masing-masing 1 kalimat.', 'Email formal dengan subjek.']],
};
function builderScore(v) {
  let s = 0; const tips = [];
  KEYS.forEach((k) => { const t = (v[k] || '').trim(); if (t.length >= 12) s += 16; else tips.push({ ok: false, t: `Isi ${KNAME[k]} — ${BHINT[k][0].toLowerCase()}` }); });
  if (/\d/.test(v.konteks || '')) { s += 7; tips.push({ ok: true, t: 'Konteks memuat angka/data konkret' }); } else tips.push({ ok: false, t: 'Tambahkan angka atau data ke Konteks — AI tidak bisa menebak situasi Anda' });
  if (DETECT.batasan.test(v.batasan || '')) { s += 7; tips.push({ ok: true, t: 'Batasan tegas (jangan/maksimal/hanya)' }); }
  if (DETECT.format.test(v.format || '')) { s += 6; tips.push({ ok: true, t: 'Format keluaran jelas' }); }
  return { s: Math.min(100, s), tips };
}
function builder() {
  let v = store.get('builder', {});
  const remix = store.get('remix', null);
  if (remix) {
    store.del('remix'); const segs = parsePrompt(remix); v = {};
    segs.forEach((sg) => { if (sg.k && sg.k !== 'lain') v[sg.k] = ((v[sg.k] || '') + ' ' + sg.text).trim(); else v.tugas = ((v.tugas || '') + '\n' + (sg.label ? sg.label + ': ' : '') + sg.text).trim(); });
    if (!segs.some((x) => x.k && x.k !== 'lain')) {
      // unlabelled prompt: sort each sentence into the component it reads as
      v = {}; const put = (k, t) => (v[k] = ((v[k] || '') + ' ' + t).trim());
      remix.replace(/\s+/g, ' ').split(/(?<=[.!?])\s+(?=[A-Z"“])/).forEach((t) => {
        if (DETECT.peran.test(t)) put('peran', t);
        else if (/^(jangan|maksimal|maks|hanya|tanpa|hindari|pastikan)\b|\b(jangan|tidak boleh)\b/i.test(t)) put('batasan', t);
        else if (/^(format|gunakan format|sertakan|tulis dalam|sajikan|nada)\b|\b(tabel|bullet|poin bernomor|placeholder|paragraf)\b/i.test(t) && !v.format) put('format', t);
        else if (!v.tugas && DETECT.tugas.test(t.split(' ').slice(0, 3).join(' '))) put('tugas', t);
        else if (DETECT.tugas.test(t.split(' ').slice(0, 2).join(' '))) put('tugas', t);
        else put('konteks', t);
      });
    }
  }
  const left = `<div class="panel"><span class="eyebrow">Mulai dari contoh</span><div class="sugg" style="margin:8px 0 18px">${PRESETS.map((p, i) => `<button data-pre="${i}">${esc(p.n)}</button>`).join('')}<button data-pre="-1">Kosongkan</button></div>
    ${KEYS.map((k) => `<div class="field k-${k}"><label><span class="dotc"></span>${KNAME[k]}<small id="ln-${k}"></small></label><div class="hint">${BHINT[k][0]}</div>
      <textarea rows="${k === 'konteks' || k === 'tugas' ? 3 : 2}" data-b="${k}" placeholder="${esc(BHINT[k][1][0])}">${esc(v[k] || '')}</textarea>
      <div class="sugg">${BHINT[k][1].map((x) => `<button data-add="${k}">${esc(x)}</button>`).join('')}</div></div>`).join('')}</div>`;
  const right = `<div class="panel" style="margin-bottom:14px"><div class="meter"><div class="ring" id="ring"><b id="rsc">0</b></div><div class="t"><b id="rlab"></b><span>Kekuatan prompt · kerangka Sesi 3</span></div></div>
      <div class="legend">${KEYS.map((k) => `<span class="k-${k}">${KNAME[k]}</span>`).join('')}</div><div class="tips" id="tips"></div></div>` + outPanel('b', 'Prompt Anda');
  shell('lab', labPage('Prompt Builder', 'Lima komponen dari Sesi 3. Setiap komponen yang terisi menambah kekuatan prompt, dan pratinjau prompt terbentuk saat Anda mengetik.', 'sesi-03-dasar-dasar-prompting', left, right));
  const out = () => { const v = store.get('builder', {}); return KEYS.filter((k) => (v[k] || '').trim()).map((k) => `${KNAME[k].toUpperCase()}: ${v[k].trim()}`).join('\n\n'); };
  const paint = () => {
    const v = {}; $$('[data-b]').forEach((e) => (v[e.dataset.b] = e.value)); store.set('builder', v);
    const { s, tips } = builderScore(v), col = s >= 80 ? 'var(--mint)' : s >= 45 ? 'var(--gold)' : 'var(--red)';
    $('#ring').style.background = `conic-gradient(${col} ${s * 3.6}deg, #0a1322 0)`; $('#rsc').textContent = s;
    $('#rlab').textContent = s >= 95 ? 'Siap dipakai' : s >= 80 ? 'Kuat' : s >= 45 ? 'Cukup — bisa lebih tajam' : 'Masih lemah';
    $('#tips').innerHTML = tips.slice(0, 5).map((t) => `<div class="${t.ok ? 'ok' : ''}">${esc(t.t)}</div>`).join('');
    KEYS.forEach((k) => ($('#ln-' + k).textContent = (v[k] || '').trim() ? (v[k] || '').trim().split(/\s+/).length + ' kata' : ''));
    const has = KEYS.filter((k) => (v[k] || '').trim());
    $('#pv-b').innerHTML = has.length ? has.map((k) => `<span class="sg k-${k}" style="display:block;border-left:3px solid var(--k);padding:2px 0 2px 12px;margin:0 0 10px"><span style="color:var(--k);font-weight:700">${KNAME[k].toUpperCase()}:</span> ${esc(v[k].trim())}</span>`).join('')
      : '<span style="color:var(--dim)">Mulai isi komponen di kiri, atau pilih contoh.</span>';
    if (s >= 95) once('builder:strong', 15, $('#ring'));
  };
  $$('[data-b]').forEach((e) => (e.oninput = paint));
  $$('[data-add]').forEach((b) => (b.onclick = () => { const t = $(`[data-b="${b.dataset.add}"]`); t.value = (t.value.trim() ? t.value.trim() + ' ' : '') + b.textContent; paint(); t.focus(); }));
  $$('[data-pre]').forEach((b) => (b.onclick = () => { const p = PRESETS[+b.dataset.pre]; $$('[data-b]').forEach((e) => (e.value = p ? p.v[e.dataset.b] : '')); paint(); }));
  $('#cp-b').onclick = () => copyText(out(), $('#cp-b'));
  wireAI(document, out);
  paint();
}

/* Fishbone */
const CATS = [['Manusia', 'Man'], ['Metode', 'Method'], ['Mesin & Alat', 'Machine'], ['Material', 'Material'], ['Pengukuran', 'Measurement'], ['Lingkungan', 'Environment']];
const FISH_EX = { problem: 'Keluhan tagihan naik 40% di satu wilayah layanan dalam 3 bulan', causes: { 0: ['Petugas baca meter kurang pelatihan', 'Beban kerja petugas tinggi'], 1: ['Tidak ada verifikasi ulang tagihan anomali'], 2: ['Meter tua sulit dibaca'], 4: ['Pembacaan meter manual, rawan salah catat'], 5: ['Kenaikan tarif belum tersosialisasi'] } };
function fishbone() {
  let st = store.get('fish', null) || JSON.parse(JSON.stringify(FISH_EX)); let sel = 0;
  const left = `<div class="panel"><div class="field"><label>Masalah (kepala ikan)</label><input id="fp" value="${esc(st.problem)}" placeholder="Tulis masalah secara spesifik: apa, di mana, seberapa besar"></div>
      <span class="eyebrow">Pilih kategori — atau klik tulangnya</span><div class="mlist" id="ml"></div>
      <div class="causes" id="cl"></div>
      <div class="addrow"><input id="ci" placeholder="Tambah penyebab untuk kategori ini…"><button class="btn btn-p" id="ca">${svg('plus', 'i-sm')}</button></div>
      <div style="display:flex;gap:8px;margin-top:14px"><button class="mini" id="fex">Pakai contoh</button><button class="mini" id="fclr">${svg('trash', 'i-sm')}Kosongkan</button></div></div>`;
  const right = `<div class="panel" style="margin-bottom:14px;padding:12px"><svg class="fish" id="fsvg" viewBox="0 0 640 330"></svg></div>` + outPanel('f', 'Prompt untuk AI');
  shell('lab', labPage('Fishbone 6M', 'Petakan semua kemungkinan penyebab sebelum memilih solusi. Isi per kategori, lalu bawa ke AI untuk diuji dan dilengkapi.', 'fishbone-analysis', left, right));
  const save = () => store.set('fish', st);
  const prompt = () => `Anda adalah analis perbaikan proses (continuous improvement) yang berpengalaman di BUMD layanan air minum.

KONTEKS: Saya sedang menganalisis masalah berikut dengan Fishbone Diagram (6M):
MASALAH: ${st.problem || '[tulis masalah]'}

Penyebab yang sudah saya identifikasi:
${CATS.map(([n, e], i) => `- ${n} (${e}): ${(st.causes[i] || []).join('; ') || '(belum ada)'}`).join('\n')}

TUGAS:
1. Uji setiap penyebab: apakah itu penyebab atau hanya gejala?
2. Tambahkan penyebab penting yang terlewat, terutama di kategori yang masih kosong.
3. Pilih 3 penyebab paling mungkin dan jelaskan alasannya.
4. Untuk 3 penyebab itu, sarankan data apa yang perlu dikumpulkan untuk membuktikannya, dan lanjutkan dengan 5 Why singkat.

BATASAN: Jangan mengarang data. Tandai asumsi dengan "ASUMSI".
FORMAT: Tabel (kategori | penyebab | penyebab/gejala | bukti yang dibutuhkan), lalu daftar 3 prioritas.`;
  const paint = () => {
    $('#ml').innerHTML = CATS.map(([n], i) => `<button class="chip ${i === sel ? 'on' : ''}" data-c="${i}">${n} <b>${(st.causes[i] || []).length || ''}</b></button>`).join('');
    $('#cl').innerHTML = (st.causes[sel] || []).map((c, j) => `<div>${esc(c)}<button data-del="${j}" title="Hapus">${svg('x', 'i-sm')}</button></div>`).join('') || `<div style="color:var(--dim)">Belum ada penyebab di ${CATS[sel][0]}.</div>`;
    $('#ci').placeholder = `Tambah penyebab untuk ${CATS[sel][0]}…`;
    const bx = [218, 368, 516], top = [0, 1, 2], bot = [3, 4, 5]; let g = '';
    const trunc = (s, n) => (s.length > n ? s.slice(0, n - 1) + '…' : s);
    [...top, ...bot].forEach((ci, idx) => {
      const up = idx < 3, x = bx[idx % 3], y0 = 165, y1 = up ? 42 : 288, x1 = x - 96, cs = st.causes[ci] || [];
      g += `<g class="cat ${ci === sel ? 'on' : ''}" data-c="${ci}"><path class="bone" d="M${x} ${y0} L${x1} ${y1}"/>
        <rect x="${x1 - 70}" y="${up ? y1 - 30 : y1 + 4}" width="160" height="28" fill="transparent"/>
        <text class="cn" x="${x1}" y="${up ? y1 - 12 : y1 + 22}" text-anchor="middle">${CATS[ci][0].toUpperCase()}</text>
        ${cs.slice(0, 3).map((c, j) => { const t = (j + 1) / 4, px = x + (x1 - x) * t, py = y0 + (y1 - y0) * t;
          return `<path d="M${px} ${py} h-34" stroke="#2a5298" stroke-width="1.5"/><text class="cause" x="${px - 38}" y="${py + 4}" text-anchor="end">${esc(trunc(c, 17))}</text>`; }).join('')}
        ${cs.length > 3 ? `<text class="cause" x="${x - 6}" y="${up ? 152 : 184}" text-anchor="end" style="fill:var(--gold)">+${cs.length - 3} lagi</text>` : ''}</g>`;
    });
    $('#fsvg').innerHTML = `<path class="spine" d="M14 165 H530"/>${g}<rect class="headbox" x="530" y="118" width="106" height="94" rx="12"/>
      <foreignObject x="536" y="122" width="96" height="86"><div xmlns="http://www.w3.org/1999/xhtml" style="font:700 11px/1.3 Inter,sans-serif;color:#06243f;height:86px;display:flex;align-items:center;overflow:hidden">${esc(trunc(st.problem || 'Masalah', 90))}</div></foreignObject>`;
    $('#pv-f').textContent = prompt();
    $$('[data-c]').forEach((b) => (b.onclick = () => { sel = +b.dataset.c; paint(); $('#ci').focus(); }));
    $$('[data-del]').forEach((b) => (b.onclick = () => { st.causes[sel].splice(+b.dataset.del, 1); save(); paint(); }));
    const filled = CATS.filter((_, i) => (st.causes[i] || []).length).length; if (filled === 6) once('fish:full', 15, $('#fsvg'));
  };
  const add = () => { const v = $('#ci').value.trim(); if (!v) return; (st.causes[sel] = st.causes[sel] || []).push(v); $('#ci').value = ''; save(); paint(); };
  $('#ca').onclick = add; $('#ci').onkeydown = (e) => { if (e.key === 'Enter') add(); };
  $('#fp').oninput = (e) => { st.problem = e.target.value; save(); paint(); };
  $('#fex').onclick = () => { st = JSON.parse(JSON.stringify(FISH_EX)); $('#fp').value = st.problem; save(); paint(); };
  $('#fclr').onclick = () => { st = { problem: '', causes: {} }; $('#fp').value = ''; save(); paint(); };
  $('#cp-f').onclick = () => copyText(prompt(), $('#cp-f'));
  wireAI(document, prompt); paint();
}

/* 5 Why — the example is the source's own Soal 5 case */
const WHY_EX = { problem: 'Hanya 20% pelanggan merespons undangan pemeliharaan berkala dari Unit Pelayanan', why: ['Undangan dikirim lewat SMS massal yang jarang dibaca', 'Tidak ada data nomor WhatsApp pelanggan yang aktif', 'Data kontak tidak diperbarui sejak pendaftaran sambungan', 'Tidak ada proses pembaruan data di setiap interaksi layanan', 'SOP layanan tidak mewajibkan verifikasi kontak — tidak ada pemilik proses data pelanggan'] };
function fiveWhy() {
  let st = store.get('why', null) || { problem: '', why: ['', '', '', '', ''] };
  const left = `<div class="panel"><div class="field"><label>Masalah</label><input id="wp" value="${esc(st.problem)}" placeholder="Tulis gejala yang terlihat — spesifik dan terukur"></div>
      <div id="chain"></div><div style="display:flex;gap:8px;margin-top:6px"><button class="mini" id="wex">Pakai contoh (Soal 5)</button><button class="mini" id="wclr">${svg('trash', 'i-sm')}Kosongkan</button></div></div>`;
  const right = `<div class="panel" style="margin-bottom:14px"><span class="eyebrow">Uji balik — baca dari akar ke masalah</span><div id="back" style="margin-top:10px;font-size:14px;color:var(--soft);line-height:1.7"></div></div>` + outPanel('w', 'Prompt untuk AI');
  shell('lab', labPage('5 Why', 'Jawab "kenapa?" lima kali. Pertanyaan berikutnya baru terbuka setelah yang sebelumnya dijawab, supaya rantainya tetap sebab-akibat.', '5-why-analysis', left, right));
  const ok = (i) => (st.why[i] || '').trim().length >= 6;
  const prompt = () => `Anda adalah fasilitator root cause analysis yang kritis.

KONTEKS: Saya melakukan 5 Why Analysis untuk masalah berikut:
MASALAH: ${st.problem || '[tulis masalah]'}
${st.why.map((w, i) => `Why ${i + 1}: ${w || '(belum dijawab)'}`).join('\n')}

TUGAS:
1. Periksa apakah setiap jawaban benar-benar penyebab langsung dari jawaban sebelumnya (bukan loncatan atau asosiasi).
2. Tunjukkan titik di mana rantai melemah, dan usulkan perbaikannya.
3. Nilai apakah Why terakhir sudah akar masalah yang bisa ditindaklanjuti (ada pemilik proses), atau perlu digali lagi.
4. Usulkan 3 tindakan perbaikan untuk akar masalah, masing-masing dengan indikator keberhasilan.

BATASAN: Jangan mengganti masalah awal. Jika butuh data tambahan, sebutkan data apa.
FORMAT: Tabel (Why | penilaian | saran), lalu 3 tindakan bernomor.`;
  const paint = (focus) => {
    $('#chain').innerHTML = st.why.map((w, i) => { const lock = i > 0 && !ok(i - 1), root = i === 4 && ok(4);
      return `<div class="why ${ok(i) ? 'ok' : ''} ${root ? 'root' : ''} ${lock ? 'lock' : ''}"><span class="n">${root ? 'AKAR' : 'W' + (i + 1)}</span>
        <div class="q">KENAPA ${i === 0 ? esc((st.problem || 'masalah ini').slice(0, 60).toUpperCase()) : 'ITU TERJADI'}?</div>
        <input data-w="${i}" value="${esc(w)}" placeholder="${lock ? 'Terbuka setelah Why ' + i + ' dijawab' : 'Karena…'}" ${lock ? 'tabindex="-1"' : ''}></div>`; }).join('');
    const got = st.why.filter((_, i) => ok(i));
    $('#back').innerHTML = got.length ? [...got].reverse().map((w, i) => `<div>${i ? '<span style="color:var(--gold);font-family:var(--mono)">→ sehingga </span>' : '<span style="color:var(--gold);font-family:var(--mono)">Karena </span>'}${esc(w)}</div>`).join('') +
      `<div><span style="color:var(--gold);font-family:var(--mono)">→ sehingga </span><b style="color:#fff">${esc(st.problem || 'masalah')}</b></div>` +
      (ok(4) ? `<div class="rootbox" style="margin-top:12px"><span class="eyebrow">Akar masalah</span>${esc(st.why[4])}<div style="font-size:12.5px;color:var(--dim);margin-top:6px">Jika dibaca terbalik terdengar masuk akal di setiap langkah, rantainya kuat.</div></div>` : '')
      : '<span style="color:var(--dim)">Jawab Why pertama untuk mulai membangun rantai.</span>';
    $('#pv-w').textContent = prompt();
    $$('[data-w]').forEach((e) => (e.oninput = () => { const i = +e.dataset.w, was = ok(i); st.why[i] = e.value; store.set('why', st);
      if (was !== ok(i)) { paint(i); } else { $('#pv-w').textContent = prompt(); paint2(); } }));
    if (focus != null) { const e = $(`[data-w="${focus}"]`); e.focus(); e.setSelectionRange(e.value.length, e.value.length); }
    if (ok(4)) once('why:root', 15, $('#chain'));
  };
  const paint2 = () => { const f = document.activeElement.dataset.w; paint(f != null ? +f : null); };
  $('#wp').oninput = (e) => { st.problem = e.target.value; store.set('why', st); $('#pv-w').textContent = prompt(); };
  $('#wex').onclick = () => { st = JSON.parse(JSON.stringify(WHY_EX)); $('#wp').value = st.problem; store.set('why', st); paint(); };
  $('#wclr').onclick = () => { st = { problem: '', why: ['', '', '', '', ''] }; $('#wp').value = ''; store.set('why', st); paint(); };
  $('#cp-w').onclick = () => copyText(prompt(), $('#cp-w'));
  wireAI(document, prompt); paint();
}

/* Pareto — example numbers are illustrative and labelled as such */
const PAR_EX = [['Tagihan tidak sesuai', 320], ['Air tidak mengalir', 210], ['Air keruh', 120], ['Kebocoran pipa', 90], ['Meter rusak', 45], ['Sikap petugas', 25], ['Lainnya', 15]];
function pareto() {
  let rows = store.get('par', null) || PAR_EX.map((r) => [...r]);
  const left = `<div class="panel"><span class="eyebrow">Kategori masalah · jumlah kejadian</span><div id="pr" style="margin-top:10px"></div>
      <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap"><button class="mini" id="padd">${svg('plus', 'i-sm')}Tambah baris</button><button class="mini" id="pex">Pakai contoh</button><button class="mini" id="pclr">${svg('trash', 'i-sm')}Kosongkan</button></div>
      <p style="font-size:12.5px;color:var(--dim);margin:12px 0 0">Angka contoh hanya ilustrasi untuk latihan — ganti dengan data unit Anda.</p></div>`;
  const right = `<div class="panel pareto" style="margin-bottom:14px"><svg id="psvg" viewBox="0 0 560 280"></svg><div id="pvn"></div></div>` + outPanel('pa', 'Prompt untuk AI');
  shell('lab', labPage('Pareto 80/20', 'Masukkan kategori dan jumlahnya. Grafik mengurutkan otomatis, menggambar garis kumulatif, dan menandai penyebab vital.', 'pareto-analysis', left, right));
  const calc = () => { const r = rows.filter((x) => x[0].trim() && +x[1] > 0).map((x) => [x[0].trim(), +x[1]]).sort((a, b) => b[1] - a[1]);
    const tot = r.reduce((a, x) => a + x[1], 0); let c = 0; let vital = 0;
    const out = r.map((x) => { c += x[1]; return { n: x[0], v: x[1], cum: tot ? (c / tot) * 100 : 0 }; });
    out.forEach((x, i) => { if (!vital || Math.abs(x.cum - 80) < Math.abs(out[vital - 1].cum - 80)) vital = i + 1; });
    return { r: out, tot, vital }; };
  const prompt = () => { const { r, tot, vital } = calc();
    return `Anda adalah analis kualitas layanan di BUMD air minum.

KONTEKS: Berikut data jumlah kejadian per kategori masalah (total ${tot}):
${r.map((x, i) => `${i + 1}. ${x.n}: ${x.v} (${((x.v / (tot || 1)) * 100).toFixed(1)}%, kumulatif ${x.cum.toFixed(1)}%)`).join('\n')}

Analisis Pareto menunjukkan ${vital} kategori teratas menyumbang ±80% masalah.

TUGAS:
1. Konfirmasi kategori vital dan jelaskan mengapa fokus ke sana paling berdampak.
2. Untuk setiap kategori vital, uraikan kemungkinan akar masalah (gunakan 5 Why singkat).
3. Usulkan rencana aksi 30 hari untuk kategori vital, dengan target penurunan yang realistis.

BATASAN: Gunakan hanya angka di atas; tandai asumsi.
FORMAT: Tabel (kategori | % | akar masalah dugaan | aksi | target), lalu ringkasan 3 kalimat untuk pimpinan.`; };
  const paint = (keep) => {
    if (!keep) $('#pr').innerHTML = rows.map((x, i) => `<div class="prow"><input data-pn="${i}" value="${esc(x[0])}" placeholder="Kategori"><input class="num" data-pv="${i}" value="${esc(x[1])}" inputmode="numeric" placeholder="0"><button data-pd="${i}" title="Hapus">${svg('x', 'i-sm')}</button></div>`).join('');
    const { r, tot, vital } = calc(), W = 560, H = 280, L = 40, R = 40, T = 16, B = 70, cw = W - L - R, ch = H - T - B;
    const max = r.length ? r[0].v : 1, bw = r.length ? cw / r.length : cw;
    let g = `<line x1="${L}" y1="${T + ch}" x2="${W - R}" y2="${T + ch}" stroke="#22395c"/><line class="th" x1="${L}" x2="${W - R}" y1="${T + ch * 0.2}" y2="${T + ch * 0.2}"/><text x="${W - R + 4}" y="${T + ch * 0.2 + 4}" style="fill:var(--red)">80%</text>`;
    r.forEach((x, i) => { const h = (x.v / max) * ch, xx = L + i * bw + bw * 0.14;
      g += `<rect class="bv ${i < vital ? 'vital' : ''}" x="${xx}" y="${T + ch - h}" width="${bw * 0.72}" height="${h}" rx="4"/>
        <text class="${i < vital ? 'vl' : ''}" x="${xx + bw * 0.36}" y="${T + ch - h - 5}" text-anchor="middle">${x.v}</text>
        <text transform="translate(${xx + bw * 0.36},${T + ch + 12}) rotate(28)" style="font-size:10px">${esc(x.n.length > 16 ? x.n.slice(0, 15) + '…' : x.n)}</text>`; });
    const pts = r.map((x, i) => [L + i * bw + bw / 2, T + ch - (x.cum / 100) * ch]);
    if (pts.length) g += `<polyline class="cum" points="${pts.map((p) => p.join(',')).join(' ')}"/>` + pts.map((p) => `<circle class="cumd" cx="${p[0]}" cy="${p[1]}" r="3.5"/>`).join('');
    $('#psvg').innerHTML = g;
    $('#pvn').innerHTML = r.length ? `<div class="vital-note"><b style="color:var(--accent)">${vital} dari ${r.length} kategori</b> menyumbang ${r[vital - 1] ? r[vital - 1].cum.toFixed(0) : 0}% dari ${tot} kejadian: ${r.slice(0, vital).map((x) => esc(x.n)).join(', ')}. Fokuskan perbaikan di sini dulu.</div>` : '';
    $('#pv-pa').textContent = prompt();
    $$('[data-pn]').forEach((e) => (e.oninput = () => { rows[+e.dataset.pn][0] = e.value; store.set('par', rows); paint(true); }));
    $$('[data-pv]').forEach((e) => (e.oninput = () => { rows[+e.dataset.pv][1] = e.value.replace(/\D/g, ''); store.set('par', rows); paint(true); }));
    $$('[data-pd]').forEach((b) => (b.onclick = () => { rows.splice(+b.dataset.pd, 1); store.set('par', rows); paint(); }));
  };
  $('#padd').onclick = () => { rows.push(['', '']); store.set('par', rows); paint(); $$('[data-pn]').pop().focus(); };
  $('#pex').onclick = () => { rows = PAR_EX.map((r) => [...r]); store.set('par', rows); paint(); };
  $('#pclr').onclick = () => { rows = [['', ''], ['', ''], ['', '']]; store.set('par', rows); paint(); };
  $('#cp-pa').onclick = () => copyText(prompt(), $('#cp-pa'));
  wireAI(document, prompt); paint();
}

/* ═════ PUSTAKA ═════ */
function libDesc(t) { return (t.page_text || []).find((x) => x.length > 50 && !/^Contoh/.test(x)) || ''; }
function library() {
  const lib = P.tools.prompt_library, cs = P.tools.case_study; let tab = store.get('ltab', 'lib'), cat = '', q = '';
  const cats = [...new Set(lib.map((p) => p.category).filter(Boolean))];
  shell('prompt', `<div class="pagehd"><div><span class="eyebrow">Pustaka prompt</span><h1>${lib.length + cs.length} prompt siap isi</h1>
      <p>Pilih → isi → lihat prompt terbentuk → kirim ke AI Anda. Alurnya sama dengan situs workshop; bedanya Anda melihat hasilnya sebelum menyalin, dan bisa langsung membukanya di ChatGPT atau Claude.</p></div></div>
    <div class="lhd"><div class="search">${svg('search')}<input id="q" placeholder="Cari: ringkas, email, analisis, pelanggan…"><kbd>/</kbd></div>
      <div class="seg" style="margin:0"><button data-t="lib">Pustaka<span class="n">${lib.length}</span></button><button data-t="cs">Studi kasus PAM Jaya<span class="n">${cs.length}</span></button></div></div>
    <div class="filters" id="cats"></div><div class="libg" id="lg"></div>`);
  const paint = () => {
    $$('[data-t]').forEach((b) => b.classList.toggle('on', b.dataset.t === tab));
    $('#cats').innerHTML = tab === 'lib' ? `<button class="chip ${!cat ? 'on' : ''}" data-cat="">Semua</button>` + cats.map((c) => `<button class="chip ${c === cat ? 'on' : ''}" data-cat="${esc(c)}">${esc(c)} · ${lib.filter((p) => p.category === c).length}</button>`).join('') : '';
    const src = tab === 'lib' ? lib.filter((p) => !cat || p.category === cat) : cs;
    const ql = q.toLowerCase(), list = src.filter((p) => !ql || (p.title + ' ' + (p.category || '') + ' ' + (p.page_text || []).join(' ')).toLowerCase().includes(ql));
    $('#lg').innerHTML = list.map((p) => { const id = tab === 'lib' ? p.id : 'cs-' + p.slug, used = store.get('vals:' + id, []).some((x) => (x || '').trim());
      return `<a class="lc" href="#/prompt/${id}"><div class="tp">${tab === 'lib' ? `<span class="tag">${esc(p.category)}</span>` : '<span class="tag cs">Studi kasus</span>'}${p.level ? `<span class="tag pro">${esc(p.level)}</span>` : ''}${used ? '<span class="used">● terisi</span>' : ''}</div>
        <h3>${esc(p.title)}</h3><p>${esc(libDesc(p))}</p>
        <div class="vars">${p.fields.length ? p.fields.slice(0, 3).map((f) => `<span>«${esc((f.label || '').replace(/\s*\*$/, '').slice(0, 26))}»</span>`).join('') + (p.fields.length > 3 ? `<span>+${p.fields.length - 3}</span>` : '') : '<span style="color:var(--mint);background:rgba(52,232,160,.08)">langsung salin</span>'}</div></a>`; }).join('') || '<div class="empty">Tidak ada prompt yang cocok.</div>';
    $$('[data-cat]').forEach((b) => (b.onclick = () => { cat = b.dataset.cat; paint(); }));
  };
  $$('[data-t]').forEach((b) => (b.onclick = () => { tab = b.dataset.t; store.set('ltab', tab); cat = ''; paint(); }));
  $('#q').oninput = (e) => { q = e.target.value; paint(); };
  document.onkeydown = (e) => { if (e.key === '/' && document.activeElement.tagName !== 'INPUT') { e.preventDefault(); $('#q').focus(); } };
  paint();
}
function renderTemplate(tpl, fields, vals, html) {
  let out = html ? esc(tpl) : tpl;
  fields.forEach((f, k) => {
    const key = '«' + (f.label || f.placeholder || 'field' + k).slice(0, 60) + '»', v = (vals[k] || '').trim(), lab = (f.label || '').replace(/\s*\*$/, '');
    const rep = html ? (v ? `<span class="filled" data-h="${k}">${esc(v)}</span>` : `<span class="hole" data-h="${k}">${esc(lab)}</span>`) : (v || `[${lab}]`);
    out = out.split(html ? esc(key) : key).join(rep);
  });
  return out;
}
function tool(id) {
  const isCase = String(id).startsWith('cs-');
  const t = isCase ? P.tools.case_study.find((c) => 'cs-' + c.slug === id) : P.tools.prompt_library.find((p) => String(p.id) === String(id));
  if (!t) return library();
  const fields = t.fields, vals = store.get('vals:' + id, []);
  const hasEx = fields.some((f) => /^contoh\s*:/i.test(f.placeholder || ''));
  const left = `<a class="crumb" href="#/prompt">${svg('left', 'i-sm')}Pustaka prompt</a>
    <div class="panel"><div style="display:flex;gap:6px">${isCase ? '<span class="tag cs">Studi kasus PAM Jaya</span>' : `<span class="tag">${esc(t.category)}</span>`}${t.level ? `<span class="tag pro">${esc(t.level)}</span>` : ''}</div>
      <h1 style="font-size:25px;letter-spacing:-.02em;margin:10px 0 6px;line-height:1.2">${esc(t.title)}</h1><p style="color:var(--soft);margin:0 0 6px;font-size:14.5px">${esc(libDesc(t))}</p>
      <div class="stepper" id="stp"><span id="s1"><b>1</b>Isi formulir</span><span id="s2"><b>2</b>Periksa pratinjau</span><span id="s3"><b>3</b>Kirim ke AI</span></div>
      ${hasEx ? `<button class="mini" id="ex" style="margin-bottom:14px">${svg('bolt', 'i-sm')}Pakai contoh kasus</button>` : ''}
      ${fields.length ? fields.map((f, k) => `<div class="field"><label>${esc((f.label || f.placeholder || '').replace(/\s*\*$/, ''))}<small>${/\*$/.test(f.label || '') ? 'wajib' : ''}</small></label>
        ${/textarea/.test(f.type) ? `<textarea rows="4" data-k="${k}" placeholder="${esc(f.placeholder)}">${esc(vals[k] || '')}</textarea>` : `<input data-k="${k}" ${/number/.test(f.type) ? 'inputmode="numeric"' : ''} placeholder="${esc(f.placeholder)}" value="${esc(vals[k] || '')}">`}</div>`).join('')
        : '<p style="color:var(--mint)">Prompt ini tidak perlu diisi — langsung kirim ke AI.</p>'}</div>`;
  const right = `<div class="panel" id="prevp"><div style="display:flex;align-items:center;gap:12px;margin-bottom:12px"><div class="ring" id="ring" style="width:46px;height:46px"><b id="rsc" style="width:36px;height:36px;font-size:11px"></b></div>
      <div><b style="font-size:15px">Prompt Anda</b><div style="font-size:12.5px;color:var(--dim)" id="cmp"></div></div><span style="flex:1"></span><button class="mini pri" id="cp">${svg('copy', 'i-sm')}Salin</button></div>
    <div class="pv" id="pv"></div><div class="aitarget">${aiButtons('t')}</div>
    <p style="font-size:12px;color:var(--dim);margin:12px 0 0">Kotak kuning = isian yang belum diisi. Klik untuk langsung ke kolomnya.</p></div>`;
  shell('prompt', `<div class="two">${`<div>${left}</div>`}<div class="sticky">${right}</div></div>
    <a class="mprev" href="#" id="mp">${svg('spark', 'i-sm')}<span>Lihat prompt</span><span class="sp"></span><span id="mpc"></span>${svg('arrow', 'i-sm')}</a>`);
  const cur = () => $$('[data-k]').map((e) => e.value);
  const paint = () => {
    const v = cur(); store.set('vals:' + id, v);
    $('#pv').innerHTML = renderTemplate(t.template, fields, v, true);
    const filled = v.filter((x) => x.trim()).length, n = fields.length, p = n ? filled / n : 1;
    $('#ring').style.background = `conic-gradient(${p === 1 ? 'var(--mint)' : 'var(--gold)'} ${p * 360}deg, #0a1322 0)`; $('#rsc').textContent = n ? `${filled}/${n}` : '✓';
    $('#cmp').textContent = n ? (p === 1 ? 'Semua isian lengkap — siap dikirim' : `${n - filled} isian lagi`) : 'Tanpa isian';
    $('#mpc').textContent = n ? `${filled}/${n}` : '';
    $('#s1').classList.toggle('ok', p === 1); $('#s2').classList.toggle('ok', p === 1);
    $$('#pv [data-h]').forEach((h) => (h.onclick = () => { const e = $(`[data-k="${h.dataset.h}"]`); e.focus(); e.scrollIntoView({ block: 'center', behavior: 'smooth' }); }));
  };
  const text = () => renderTemplate(t.template, fields, cur(), false);
  $$('[data-k]').forEach((e) => {
    e.oninput = paint;
    e.onfocus = () => $$(`#pv [data-h="${e.dataset.k}"]`).forEach((h, i) => { h.classList.add('focus'); if (!i && innerWidth > 1060) h.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); });
    e.onblur = () => $$('#pv .focus').forEach((h) => h.classList.remove('focus'));
  });
  if ($('#ex')) $('#ex').onclick = () => { $$('[data-k]').forEach((e) => { const f = fields[+e.dataset.k]; if (/^contoh\s*:/i.test(f.placeholder || '')) e.value = f.placeholder.replace(/^contoh\s*:\s*/i, '').replace(/\.\.\.$/, ''); }); paint(); };
  $('#cp').onclick = () => { copyText(text(), $('#cp')); $('#s3').classList.add('ok'); };
  wireAI(document, () => { $('#s3').classList.add('ok'); return text(); });
  $('#mp').onclick = (e) => { e.preventDefault(); $('#prevp').scrollIntoView({ behavior: 'smooth' }); };
  paint();
}

/* ═════ LATIHAN SOAL ═════ */
const STOP = new Set('yang dan untuk dengan dari pada dalam atau adalah akan ini itu tidak bukan hanya juga sebagai secara setiap lebih bisa dapat harus serta oleh karena agar oleh kita anda mereka para bagi saat ketika bahwa sudah telah'.split(' '));
const words = (s) => String(s).toLowerCase().replace(/[^a-z0-9à-ÿ\s]/g, ' ').split(/\s+/).filter((w) => w.length > 3 && !STOP.has(w));
function detectHit(ans, item) { const a = new Set(words(ans)), it = [...new Set(words(item))]; if (!it.length) return false; const hit = it.filter((w) => a.has(w) || [...a].some((x) => x.length > 5 && (x.startsWith(w.slice(0, 6)) || w.startsWith(x.slice(0, 6))))).length; return hit >= Math.min(3, Math.ceil(it.length * 0.3)); }
const qstate = () => store.get('quiz', null);
const PRED = [[90, 'Sempurna'], [80, 'Sangat Baik'], [70, 'Baik'], [60, 'Cukup'], [50, 'Kurang'], [0, 'Perlu Belajar Lagi']];
function quizHome() {
  const st = qstate(), topics = [...new Set(Q.questions.map((q) => q.topic))], best = store.get('quizBest', null);
  let mode = st ? st.mode : 'bebas';
  shell('latihan', `<div class="qwrap"><div class="pagehd"><div><span class="eyebrow">Latihan soal · kisi-kisi resmi workshop</span><h1>Siap untuk post-test?</h1>
      <p>10 soal esai dari kisi-kisi workshop, dengan mekanik yang sama seperti pre/post-test: dua level petunjuk yang membatasi skor maksimal. Setelah menjawab, bandingkan dengan konsep kunci dan jawaban ideal.</p></div></div>
    <div class="qcard"><span class="eyebrow">5 topik · 2 soal per topik</span><div class="topics">${topics.map((t, i) => `<div><b>0${i + 1}</b>${esc(t)}<span>20 poin</span></div>`).join('')}</div>
      <span class="eyebrow">Pilih mode</span><div class="modes">
        <button class="mode ${mode === 'bebas' ? 'on' : ''}" data-m="bebas">${svg('flask')}<b>Latihan bebas</b><span>Tanpa timer. Pelajari tiap soal pelan-pelan.</span></button>
        <button class="mode ${mode === 'simulasi' ? 'on' : ''}" data-m="simulasi">${svg('clock')}<b>Simulasi 12 menit</b><span>Seperti post-test sungguhan: timer jalan terus.</span></button></div>
      <div class="hintbox" style="margin-bottom:16px"><span class="eyebrow">Aturan petunjuk (sama dengan tes asli)</span>Tanpa petunjuk: maks 10 · Petunjuk Lv.1 (konsep kunci): maks 8 · Petunjuk Lv.2 (poin minimum): maks 6</div>
      <div style="display:flex;gap:10px;flex-wrap:wrap">${st && !st.finished ? `<a class="btn btn-p btn-lg" href="#/latihan/${(st.at || 0) + 1}">${svg('play', 'i-sm')}Lanjutkan · ${Object.keys(st.a || {}).filter((k) => st.a[k].checked).length}/10</a><button class="btn btn-g btn-lg" id="rst">Mulai ulang</button>`
        : `<button class="btn btn-p btn-lg" id="go">${svg('play', 'i-sm')}Mulai latihan</button>`}
        ${best != null ? `<span class="chip" style="height:52px;border-radius:13px">${svg('trophy', 'i-sm')}Terbaik: ${best}/100</span>` : ''}</div></div></div>`);
  $$('[data-m]').forEach((b) => (b.onclick = () => { mode = b.dataset.m; $$('[data-m]').forEach((x) => x.classList.toggle('on', x === b)); if (st && !st.finished) { st.mode = mode; store.set('quiz', st); } }));
  const start = () => { store.set('quiz', { mode, a: {}, at: 0, startAt: Date.now() }); location.hash = '#/latihan/1'; };
  if ($('#go')) $('#go').onclick = start; if ($('#rst')) $('#rst').onclick = start;
}
function quizQ(n) {
  const st = qstate(); if (!st) return quizHome();
  const q = Q.questions[n - 1]; if (!q) return quizResult();
  st.at = n - 1; store.set('quiz', st);
  const a = st.a[n] || { text: '', hint: 0, checked: null, ticks: [] };
  const rub = [...q.concepts, ...(q.minimum ? ['Poin minimum: ' + q.minimum] : [])];
  const cap = a.hint === 2 ? 6 : a.hint === 1 ? 8 : 10;
  const idealHtml = q.ideal.map((b) => b.type === 'table' ? tableHtml(b.rows) : b.type === 'list' ? `<ul>${b.items.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : `<p>${esc(b.text)}</p>`).join('');
  shell('latihan', `<div class="qwrap"><div class="qtop"><a class="icon-btn" href="#/latihan">${svg('x')}</a>
      <div class="qdots">${Q.questions.map((_, i) => `<button data-q="${i + 1}" class="${i + 1 === n ? 'c' : st.a[i + 1] && st.a[i + 1].checked ? 'a' : ''}" title="Soal ${i + 1}"></button>`).join('')}</div>
      ${st.mode === 'simulasi' ? `<span class="timer" id="qt"></span>` : `<span class="stepno">${n}/10</span>`}</div>
    <div class="qcard"><span class="eyebrow">Soal ${n} · ${esc(q.topic)}</span><div class="qt">${esc(q.question)}</div>
      ${a.checked == null ? `<textarea class="q-ans" id="ans" rows="8" placeholder="Tulis jawaban Anda… (minimal 10 karakter)">${esc(a.text)}</textarea>
        <div style="display:flex;align-items:center;gap:8px;margin-top:8px"><span style="font:12px var(--mono);color:var(--dim)" id="cc"></span><span style="flex:1"></span><span class="chip">maks ${cap}/10</span></div>
        <div class="hints">${a.hint < 1 ? `<button class="mini" id="h1">${svg('bolt', 'i-sm')}Petunjuk Lv.1 · maks 8</button>` : ''}${a.hint === 1 ? `<button class="mini" id="h2">${svg('bolt', 'i-sm')}Petunjuk Lv.2 · maks 6</button>` : ''}</div>
        ${a.hint >= 1 ? `<div class="hintbox"><span class="eyebrow">Lv.1 — Arah kompas</span><ul>${q.concepts.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>` : ''}
        ${a.hint >= 2 ? `<div class="hintbox"><span class="eyebrow">Lv.2 — Peta jalan</span>${esc(q.minimum)}</div>` : ''}
        <button class="btn btn-p btn-lg btn-block" id="chk" style="margin-top:14px" disabled>Periksa jawaban</button>
        <p style="font-size:12px;color:var(--dim);text-align:center;margin:8px 0 0">Setelah diperiksa, jawaban dikunci — sama seperti tes asli.</p>`
      : `<div style="padding:14px;border-radius:12px;background:#0a1322;border:1px solid var(--line);font-size:14.5px;white-space:pre-wrap;color:#d3e4f5">${esc(a.text)}</div>
        <div style="display:flex;align-items:center;gap:12px;margin:18px 0 4px"><span class="eyebrow">Centang yang benar-benar ada di jawaban Anda</span><span style="flex:1"></span><b class="mono" style="font:800 22px var(--mono);color:var(--gold)" id="sc"></b></div>
        <div class="rub">${rub.map((r, i) => { const hit = detectHit(a.text, r); return `<label class="${hit ? 'hit' : ''}"><input type="checkbox" data-t="${i}" ${a.ticks.includes(i) ? 'checked' : ''}><span>${esc(r)}</span>${hit ? '<span class="det">terdeteksi</span>' : ''}</label>`; }).join('')}</div>
        <div class="ideal"><span class="eyebrow">Jawaban ideal</span>${idealHtml}</div>
        ${q.mistakes.length ? `<div class="warn"><span class="eyebrow">Kesalahan umum</span><ul>${q.mistakes.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>` : ''}
        <div class="aitarget" style="margin-top:14px"><span class="eyebrow" style="width:100%">Minta AI menilai jawaban Anda</span><button class="mini pri" id="cpg">${svg('copy', 'i-sm')}Salin prompt penilaian</button>${aiButtons('g')}</div>
        <div style="display:flex;gap:10px;margin-top:18px">${n > 1 ? `<a class="btn btn-g btn-lg" href="#/latihan/${n - 1}">${svg('left', 'i-sm')}</a>` : ''}
          <a class="btn btn-p btn-lg" style="flex:1" href="#/latihan/${n < 10 ? n + 1 : 'hasil'}">${n < 10 ? 'Soal berikutnya' : 'Lihat hasil'} ${svg('arrow', 'i-sm')}</a></div>`}
    </div></div>`);
  $$('[data-q]').forEach((b) => (b.onclick = () => (location.hash = '#/latihan/' + b.dataset.q)));
  const save = () => { st.a[n] = a; store.set('quiz', st); };
  if (st.mode === 'simulasi') {
    const tick = () => { const el = $('#qt'); if (!el) return clearInterval(window._qt); const left = Math.max(0, 12 * 60 - Math.floor((Date.now() - st.startAt) / 1000));
      el.innerHTML = svg('clock', 'i-sm') + `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`; if (!left) { clearInterval(window._qt); toast('Waktu habis', 'Lihat hasil Anda'); location.hash = '#/latihan/hasil'; } };
    clearInterval(window._qt); window._qt = setInterval(tick, 1000); tick();
  }
  const ans = $('#ans');
  if (ans) {
    const cc = () => { $('#cc').textContent = ans.value.length + ' karakter'; $('#chk').disabled = ans.value.trim().length < 10; };
    ans.oninput = () => { a.text = ans.value; save(); cc(); }; cc();
    if ($('#h1')) $('#h1').onclick = () => { a.hint = 1; save(); quizQ(n); };
    if ($('#h2')) $('#h2').onclick = () => { a.hint = 2; save(); quizQ(n); };
    $('#chk').onclick = () => { a.checked = true; a.ticks = rub.map((r, i) => (detectHit(a.text, r) ? i : -1)).filter((i) => i >= 0); save(); once('q:' + n + ':' + st.startAt, 10, $('#chk')); quizQ(n); };
  } else {
    const score = () => { const s = Math.min(cap, Math.round((a.ticks.length / rub.length) * 10)); a.score = s; save(); $('#sc').textContent = s + '/10'; };
    $$('[data-t]').forEach((c) => (c.onchange = () => { const i = +c.dataset.t; a.ticks = c.checked ? [...new Set([...a.ticks, i])] : a.ticks.filter((x) => x !== i); score(); }));
    score();
    const gp = () => `Anda adalah penilai ujian esai workshop "Gen AI for Business Productivity" (PAM Jaya). Nilai jawaban peserta secara jujur dan konstruktif.

SOAL: ${q.question}

KONSEP KUNCI YANG DINILAI:
${q.concepts.map((x) => '- ' + x).join('\n')}
POIN MINIMUM: ${q.minimum}

JAWABAN IDEAL (acuan):
${q.ideal.map((b) => b.type === 'table' ? b.rows.map((r) => r.join(' | ')).join('\n') : b.type === 'list' ? b.items.map((x) => '- ' + x).join('\n') : b.text).join('\n')}

JAWABAN PESERTA:
${a.text}

TUGAS: Beri skor 0–10 (maksimal ${cap} karena peserta ${a.hint ? 'memakai petunjuk level ' + a.hint : 'tidak memakai petunjuk'}), sebutkan konsep yang sudah dan belum muncul, lalu beri 2 saran konkret agar jawabannya naik ke skor penuh.
FORMAT: Skor: x/10 · Sudah tepat (poin) · Belum ada (poin) · 2 saran.`;
    $('#cpg').onclick = () => copyText(gp(), $('#cpg'), 'Tempel ke AI untuk penilaian mendalam');
    wireAI(document, gp);
  }
}
function quizResult() {
  const st = qstate(); if (!st) return quizHome();
  st.finished = true; store.set('quiz', st); clearInterval(window._qt);
  const rows = Q.questions.map((q, i) => ({ q, a: st.a[i + 1] })), total = rows.reduce((s, r) => s + (r.a && r.a.checked ? r.a.score || 0 : 0), 0);
  const pred = PRED.find(([m]) => total >= m)[1], best = store.get('quizBest', null); if (best == null || total > best) store.set('quizBest', total);
  shell('latihan', `<div class="qwrap"><div class="qcard" style="text-align:center;padding:34px 24px"><span class="eyebrow">Hasil latihan · ${st.mode === 'simulasi' ? 'simulasi 12 menit' : 'latihan bebas'}</span>
      <div class="score-xl" style="margin:14px 0 10px">${total}<span style="font-size:.4em;color:var(--dim)">/100</span></div><span class="pred">${pred}</span>
      <p style="color:var(--soft);max-width:520px;margin:14px auto 0">Skor ini dari penilaian mandiri Anda terhadap konsep kunci. Untuk penilaian yang lebih ketat, pakai tombol "Minta AI menilai" di setiap soal.</p></div>
    <div style="margin-top:18px">${rows.map((r, i) => `<a class="res-row" href="#/latihan/${i + 1}"><span class="chip">${String(i + 1).padStart(2, '0')}</span><span style="font-size:14px">${esc(r.q.title)}</span>
      <span class="s" style="color:${r.a && r.a.checked ? 'var(--gold)' : 'var(--dim)'}">${r.a && r.a.checked ? (r.a.score || 0) + '/10' : 'belum'}</span></a>`).join('')}</div>
    <div style="display:flex;gap:10px;margin-top:16px;flex-wrap:wrap"><button class="btn btn-p btn-lg" id="again">Ulangi latihan</button><a class="btn btn-g btn-lg" href="#/sesi/soal-dan-pembahasan/0">Baca kisi-kisi & pembahasan</a></div></div>`);
  $('#again').onclick = () => { store.del('quiz'); location.hash = '#/latihan'; };
}

/* ═════ CETAK (PDF) ═════ */
function docBlock(b) {
  switch (b.type) {
    case 'text': return `<p>${esc(b.text)}</p>`;
    case 'subheading': return b.level >= 4 ? `<h4>${esc(b.text)}</h4>` : `<h3>${esc(b.text)}</h3>`;
    case 'list': return `<${b.ordered ? 'ol' : 'ul'}>${b.items.map((x) => `<li>${esc(x)}</li>`).join('')}</${b.ordered ? 'ol' : 'ul'}>`;
    case 'table': { if (!b.rows || !b.rows.length) return ''; const [h, ...r] = b.rows; return `<table><thead><tr>${h.map((c) => `<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>${r.map((row) => `<tr>${row.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`; }
    case 'quote': case 'code': {
      if (!isPromptBlock(b)) return `<div class="co">${esc(b.text)}</div>`;
      const segs = parsePrompt(b.text.replace(/^\s*["“]|["”]\s*$/g, '').trim()), col = { peran: '#1c7ed6', konteks: '#7048e8', tugas: '#b8860b', batasan: '#e03131', format: '#0ca678', lain: '#48617e' };
      return `<div class="pp"><span class="pl">PROMPT — SALIN KE AI ANDA</span>${segs.map((s) => s.k ? `<span class="k" style="color:${col[s.k]}">${esc(s.label)}:</span> ${esc(s.text)}\n` : esc(s.text) + '\n').join('').replace(/\n$/, '')}</div>`;
    }
    default: return '';
  }
}
function printDoc(slug) {
  const s = P.sessions[slug]; if (!s) return home();
  document.body.className = 'print';
  const goals = (s.sections.find((x) => x.role === 'goals') || { blocks: [] }).blocks.find((b) => b.type === 'list');
  $('#app').innerHTML = `<article class="doc"><div class="dh"><span>${esc(P.program.title)}</span><span>${esc(P.program.client.replace(/\s*\(.*\)/, ''))} × ${esc(P.program.provider)}</span></div>
    ${s.image ? `<div class="dcover" style="background-image:url('${s.image}')"></div>` : ''}
    <h1>${esc(shortTitle(s.title))}</h1><p class="dek">${esc(s.subtitle)}</p>
    <div class="meta">${s.number ? `<span>SESI ${s.number} · HARI ${s.day}</span>` : '<span>MATERI PENDUKUNG</span>'}${s.slot ? `<span>${s.slot} WIB</span>` : ''}<span>${s.read_min || 5} MENIT BACA</span><span>${s.stats.copyable} PROMPT</span></div>
    ${goals ? `<div class="goalsp"><b>Yang akan Anda kuasai</b><ul>${goals.items.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>` : ''}
    ${s.sections.filter((x) => x.role !== 'goals').map((sec) => `${sec.heading ? `<h2>${esc(sec.heading)}</h2>` : ''}${sec.blocks.map(docBlock).join('')}${sec.role === 'practice' ? '<div class="notes"></div>' : ''}`).join('')}
    <h2>Catatan saya</h2><div class="notes" style="height:180px"></div>
    <div class="foot">${esc(P.program.title)} — ${esc(P.program.tagline)} · Materi © ${esc(P.program.provider)} · Modul ini diunduh dari platform workshop.</div></article>`;
  document.title = shortTitle(s.title) + ' — Modul';
}

/* ═════ router ═════ */
function route() {
  document.onkeydown = null; document.onclick = null; clearInterval(window._tm); closeSheet();
  const h = location.hash.replace(/^#/, '') || '/';
  let m;
  if ((m = h.match(/^\/sesi\/([^/]+)(?:\/(\d+))?$/))) return player(decodeURIComponent(m[1]), +(m[2] || 0));
  if ((m = h.match(/^\/cetak\/(.+)$/))) return printDoc(decodeURIComponent(m[1]));
  if ((m = h.match(/^\/prompt\/(.+)$/))) return tool(decodeURIComponent(m[1]));
  if (h === '/prompt') return library();
  if (h === '/lab') return labHub();
  if (h === '/lab/prompt') return builder();
  if (h === '/lab/fishbone') return fishbone();
  if (h === '/lab/5why') return fiveWhy();
  if (h === '/lab/pareto') return pareto();
  if (h === '/latihan') return quizHome();
  if (h === '/latihan/hasil') return quizResult();
  if ((m = h.match(/^\/latihan\/(\d+)$/))) return quizQ(+m[1]);
  return home();
}
addEventListener('hashchange', route);
let rz; addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => { if ($('#map')) drawMap(P.groups[store.get('tab', 0)] || P.groups[0], done()); }, 150); });
Promise.all([fetch('program.json').then((r) => r.json()), fetch('quiz.json').then((r) => r.json())]).then(([p, q]) => { P = p; Q = q; route(); });
