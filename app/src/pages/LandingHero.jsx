import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'motion/react';
import { Link } from 'react-router-dom';
import { Compass, Wrench, Workflow, Play, ChevronDown, MapPin, Clock, CalendarDays, Users, Check, UserCheck, Sparkles } from 'lucide-react';
import { Btn, Eyebrow, cx } from '../components/ui';
import { useStore, KCOLOR } from '../lib/core';
import { SRC } from './Landing';

/* Upper landing: hero → 3 pilar (auto-cycling, live mini-UI per pilar) → CTA → jadwal with the real slot strip.
   Copy and order are the source's; only the presentation is new. */

const EASE = [0.22, 1, 0.36, 1];
const ICON = { compass: Compass, wrench: Wrench, workflow: Workflow };
const CYCLE = 5200;

/* ---------- headline: word-by-word blur reveal ---------- */
function Words({ text, className, delay = 0 }) {
  return (
    <span>
      {text.split(' ').map((w, i) => (
        <motion.span key={i} className={cx('inline-block mr-[0.22em] last:mr-0', className)} initial={{ opacity: 0, y: 26, filter: 'blur(10px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ delay: delay + i * 0.09, duration: 0.7, ease: EASE }}>{w}</motion.span>
      ))}
    </span>
  );
}

/* ---------- water rings behind the logo ---------- */
function Rings() {
  return (
    <span className="absolute inset-0 grid place-items-center pointer-events-none" aria-hidden>
      {[0, 1, 2].map((i) => (
        <motion.span key={i} className="absolute w-24 h-24 rounded-full border border-brand/20" initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: [0.6, 2.1], opacity: [0, 0.4, 0] }} transition={{ duration: 4.2, repeat: Infinity, delay: i * 1.4, ease: 'easeOut' }} />
      ))}
      <motion.span className="absolute w-40 h-40 rounded-full bg-brand/10 blur-2xl" animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} />
    </span>
  );
}

/* ---------- mini interfaces (real course content) ---------- */
function MiniUnderstand() {
  const layers = [['Artificial Intelligence', 'payung besar', 128], ['Machine Learning', 'belajar pola dari data', 92], ['Generative AI', 'menghasilkan teks, tabel, kode', 56]];
  return (
    <div className="h-[192px] flex flex-col">
      <div className="flex-1 flex items-center gap-3">
        <div className="relative w-[128px] h-[128px] shrink-0">
          {layers.map(([t, , sz], i) => (
            <motion.span key={t} className={cx('absolute rounded-full border', i === 2 ? 'grad-btn border-transparent shadow-glow' : 'bg-brand-50/70 border-brand-100')}
              style={{ width: sz, height: sz, left: (128 - sz) / 2, top: (128 - sz) / 2 }} initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: i * 0.18, type: 'spring', stiffness: 220, damping: 20 }} />
          ))}
          <motion.span className="absolute inset-0 grid place-items-center text-white text-[10px] font-extrabold text-center leading-tight" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>Gen<br />AI</motion.span>
        </div>
        <ul className="space-y-2 min-w-0 flex-1">
          {layers.map(([t, d], i) => (
            <motion.li key={t} initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 + i * 0.18 }} className="flex items-start gap-2">
              <span className={cx('mt-[5px] w-2 h-2 rounded-full shrink-0', i === 2 ? 'bg-brand' : 'bg-brand-200')} />
              <span className="leading-tight min-w-0"><b className="block text-[12px] text-ink truncate">{t}</b><span className="block text-[10.5px] text-ink-3 truncate">{d}</span></span>
            </motion.li>
          ))}
        </ul>
      </div>
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }} className="mt-2 flex gap-1.5">
        {[['Bisa', 'draft · ringkas · analisis', 'bg-emerald-50 text-emerald-700'], ['Hati-hati', 'fakta tanpa verifikasi', 'bg-rose-50 text-rose-600']].map(([k, v, c]) => (
          <span key={k} className={cx('flex-1 min-w-0 inline-flex items-center gap-1 h-6 px-2 rounded-full text-[10.5px] font-bold whitespace-nowrap overflow-hidden', c)}>{k}<span className="font-medium opacity-80 truncate">· {v}</span></span>
        ))}
      </motion.div>
    </div>
  );
}

const PROMPT = [
  ['peran', 'PERAN', 'Analis pelayanan pelanggan PAM Jaya.'],
  ['konteks', 'KONTEKS', 'Data keluhan kuartal ini (terlampir).'],
  ['tugas', 'TUGAS', 'Ringkas 5 pola keluhan terbesar.'],
  ['batasan', 'BATASAN', 'Jangan mengarang; tandai [PERLU DILENGKAPI].'],
  ['format', 'FORMAT', 'Tabel: pola · jumlah · contoh.'],
];
function MiniPractice() {
  const [n, setN] = useState(0); // characters typed across all lines
  const total = PROMPT.reduce((a, [, , t]) => a + t.length, 0);
  useEffect(() => { let i = 0; const id = setInterval(() => { i += 2; setN(i); if (i >= total) clearInterval(id); }, 26); return () => clearInterval(id); }, [total]);
  let left = n; const lines = PROMPT.map(([k, l, t]) => { const shown = t.slice(0, Math.max(0, left)); left -= t.length; return [k, l, shown, shown.length === t.length]; });
  const filled = lines.filter((l) => l[3]).length;
  return (
    <div className="h-[192px] flex flex-col">
      <div className="flex-1 rounded-2xl bg-ink text-white/90 px-3.5 py-3 font-mono text-[10.5px] leading-[1.5] overflow-hidden">
        {lines.map(([k, l, s, done], i) => (s.length || i === 0) && (
          <div key={k} className="flex gap-2"><span className="font-bold shrink-0" style={{ color: KCOLOR[k] }}>{l}:</span><span>{s}{!done && s.length < PROMPT[i][2].length && <span className="inline-block w-[7px] h-[13px] bg-white/80 align-middle animate-pulse ml-0.5" />}</span></div>
        ))}
      </div>
      <div className="mt-2.5 flex items-center gap-2.5">
        <span className="text-[11px] font-bold text-ink-3 shrink-0">Kekuatan prompt</span>
        <span className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden flex gap-[2px]">
          {PROMPT.map(([k], i) => <motion.span key={k} className="flex-1 h-full rounded-sm" style={{ background: KCOLOR[k] }} initial={{ scaleX: 0 }} animate={{ scaleX: i < filled ? 1 : 0 }} transition={{ type: 'spring', stiffness: 260, damping: 24 }} />)}
        </span>
        <span className="text-[11.5px] font-extrabold text-brand tabular-nums w-8 text-right">{filled}/5</span>
      </div>
    </div>
  );
}

function MiniIntegrate() {
  const nodes = [['Data keluhan', 'masuk tiap Senin'], ['AI meringkas', 'prompt tersimpan'], ['Cek manusia', 'verifikasi & tanda tangan'], ['Laporan', 'siap kirim ke pimpinan']];
  return (
    <div className="h-[192px] flex flex-col justify-center">
      <div className="relative grid grid-cols-4 gap-2">
        <span className="absolute left-[12%] right-[12%] top-[22px] h-[3px] rounded-full bg-brand-100" />
        <motion.span className="absolute top-[17px] w-3.5 h-3.5 rounded-full grad-btn shadow-glow" initial={{ left: '12%' }} animate={{ left: ['12%', '88%'] }} transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.4 }} />
        {nodes.map(([t, d], i) => (
          <motion.div key={t} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.14 }} className="relative flex flex-col items-center text-center">
            <span className={cx('w-11 h-11 rounded-2xl grid place-items-center border', i === 2 ? 'bg-amber-50 border-amber-200 text-amber-600' : i === 3 ? 'grad-btn border-transparent text-white shadow-glow' : 'bg-white border-brand-100 text-brand')}>
              {i === 2 ? <UserCheck size={18} /> : i === 3 ? <Check size={18} strokeWidth={3} /> : i === 1 ? <Sparkles size={18} /> : <span className="text-[12px] font-extrabold">{i + 1}</span>}
            </span>
            <b className="mt-2 text-[11.5px] text-ink leading-tight">{t}</b>
            <span className="text-[10.5px] text-ink-3 leading-tight mt-0.5">{d}</span>
          </motion.div>
        ))}
      </div>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }} className="mt-4 text-center text-[11px] text-ink-3">Titik kontrol manusia tetap ada · dipakai setiap minggu, bukan sekali</motion.p>
    </div>
  );
}
const MINI = [MiniUnderstand, MiniPractice, MiniIntegrate];

/* ---------- tilt card ---------- */
function Tilt({ children, className, ...p }) {
  const rx = useSpring(useMotionValue(0), { stiffness: 220, damping: 20 }), ry = useSpring(useMotionValue(0), { stiffness: 220, damping: 20 });
  const onMove = (e) => { const r = e.currentTarget.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5; rx.set(-y * 8); ry.set(x * 10); };
  const onLeave = () => { rx.set(0); ry.set(0); };
  return <motion.div style={{ rotateX: rx, rotateY: ry, transformPerspective: 900 }} onMouseMove={onMove} onMouseLeave={onLeave} className={className} {...p}>{children}</motion.div>;
}

/* ---------- floating PAM drop marks, full-bleed (cut by the viewport edge like the reference) ---------- */
const DROPS = [
  { c: '#bfd6ff', w: 165, l: '-3%', t: 60, rot: -18, d: 0 },
  { c: '#cdeeff', w: 105, l: '9%', t: 470, rot: 22, d: -3 },
  { c: '#a9c6ff', w: 120, l: '84%', t: 30, rot: 28, d: -6 },
  { c: '#cdeeff', w: 185, l: '93%', t: 300, rot: -14, d: -9 },
  { c: '#d3e2ff', w: 88, l: '80%', t: 560, rot: 40, d: -2 },
  { c: '#bfd6ff', w: 130, l: '-4%', t: 760, rot: 12, d: -5 },
  { c: '#dbe8ff', w: 100, l: '95%', t: 820, rot: -30, d: -7 },
  { c: '#dbe8ff', w: 72, l: '22%', t: 120, rot: 35, d: -4 },
  { c: '#cdeeff', w: 64, l: '72%', t: 250, rot: -24, d: -8 },
  { c: '#d3e2ff', w: 96, l: '12%', t: 1000, rot: -8, d: -1 },
];
function Shapes() {
  return (
    <div className="absolute left-1/2 -translate-x-1/2 top-0 w-screen h-full pointer-events-none overflow-hidden" aria-hidden>
      {DROPS.map((x, i) => (
        <motion.span key={i} className={cx('absolute', i > 4 && i < 7 ? 'hidden lg:block' : i > 1 ? 'hidden md:block' : '')}
          style={{ left: x.l, top: x.t, width: x.w, height: x.w, background: x.c, WebkitMaskImage: 'url(assets/pam-mark.png)', maskImage: 'url(assets/pam-mark.png)', WebkitMaskSize: 'contain', maskSize: 'contain', WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskPosition: 'center' }}
          initial={{ rotate: x.rot }} animate={{ y: [0, -16, 0], rotate: [x.rot, x.rot + 6, x.rot] }} transition={{ duration: 8 + i, repeat: Infinity, ease: 'easeInOut', delay: x.d }} />
      ))}
    </div>
  );
}

/* ---------- fanned pillar cards (Podia-style) ---------- */
const CARD = [
  { bg: '#dbe8ff', fg: 'text-ink', sub: 'text-ink-2', rot: -5, y: 46 },
  { bg: 'linear-gradient(160deg,#0256f4 0%,#1a8df6 100%)', fg: 'text-white', sub: 'text-white/85', rot: 0, y: 0 },
  { bg: '#cdeeff', fg: 'text-ink', sub: 'text-ink-2', rot: 5, y: 46 },
];
function useDesktop() { const [d, setD] = useState(() => typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches); useEffect(() => { const m = window.matchMedia('(min-width: 768px)'); const f = () => setD(m.matches); m.addEventListener('change', f); return () => m.removeEventListener('change', f); }, []); return d; }
function Pillars({ pillars }) {
  const [on, setOn] = useState(null); const [runs, setRuns] = useState(0); const desk = useDesktop();
  const enter = (i) => { setOn(i); setRuns((r) => r + 1); };
  return (
    <div className="relative mt-12 md:mt-16 md:h-[560px]">
      <div className="md:absolute md:inset-x-0 md:top-0 grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-0 md:px-2">
        {pillars.map((p, i) => { const Ic = ICON[p.ic]; const Mini = MINI[i]; const c = desk ? CARD[i] : { ...CARD[i], rot: 0, y: 0 }; const act = on === i; return (
          <motion.div key={p.t} onMouseEnter={() => enter(i)} onMouseLeave={() => setOn(null)} onClick={() => enter(i)}
            initial={{ opacity: 0, y: 80, rotate: c.rot }} animate={{ opacity: 1, y: act ? c.y - 26 : c.y, rotate: act ? 0 : c.rot, scale: act ? 1.03 : 1 }}
            transition={{ type: 'spring', stiffness: 170, damping: 22, delay: on === null && runs === 0 ? 0.55 + i * 0.12 : 0 }}
            style={{ background: c.bg, zIndex: act ? 30 : i === 1 ? 20 : 10, transformOrigin: '50% 100%' }}
            className={cx("relative min-w-0 cursor-pointer rounded-[28px] p-6 md:p-7 text-left md:-mx-3 shadow-lift will-change-transform", on !== null && !act && 'md:opacity-80')}>
            <div className="flex items-center gap-3">
              <span className={cx('w-11 h-11 rounded-2xl grid place-items-center shrink-0', i === 1 ? 'bg-white text-brand' : 'bg-white text-brand shadow-soft')}><Ic size={20} /></span>
              <span className={cx('text-[11px] font-bold uppercase tracking-[.14em]', i === 1 ? 'text-white/70' : 'text-ink-4')}>Langkah 0{i + 1}</span>
            </div>
            <h3 className={cx('mt-4 text-[26px] md:text-[30px] font-extrabold tracking-tight leading-none flex items-center gap-2', c.fg)}>{p.t}<motion.span animate={{ x: act ? 4 : 0 }} className="text-[18px] opacity-70">▸</motion.span></h3>
            <p className={cx('mt-3 text-[14.5px] leading-relaxed', c.sub)}>{p.d}</p>
            <div className="mt-5 rounded-2xl bg-white p-3.5 shadow-soft"><Mini key={act ? 'on' + runs : 'off'} /></div>
          </motion.div>
        ); })}
      </div>
    </div>
  );
}

/* ---------- jadwal + session map (no per-session hours: the source's slots aren't reliable) ---------- */
function Jadwal({ rows, cards }) {
  const [hov, setHov] = useState(null);
  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.95, duration: 0.6, ease: EASE }} className="mt-10 mx-auto max-w-4xl bg-white border border-line rounded-3xl shadow-soft overflow-hidden">
      <div className="grid grid-cols-2 md:grid-cols-4 p-2">
        {rows.map(([k, v], i) => { const Ic = [MapPin, Clock, CalendarDays, Users][i]; return (
          <motion.div key={k} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.05 + i * 0.08 }} className="flex items-center gap-3 p-3.5 md:p-4 text-left">
            <span className="w-9 h-9 rounded-xl bg-brand-50 text-brand grid place-items-center shrink-0"><Ic size={17} /></span>
            <span className="leading-tight min-w-0"><span className="block text-[10.5px] font-bold uppercase tracking-[.12em] text-ink-4">{k}</span><b className="block text-[13px] font-bold text-ink leading-snug">{v}</b></span>
          </motion.div>
        ); })}
      </div>
      <div className="border-t border-line bg-paper/70 px-4 md:px-5 py-4 text-left">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[12px] font-extrabold text-ink">12 sesi · 2 hari</span>
          <span className="text-[11px] text-ink-4 hidden sm:block">arahkan kursor untuk judul · klik untuk membuka materi</span>
        </div>
        <div className="grid grid-cols-6 md:grid-cols-12 gap-1.5">
          {cards.map((c) => (
            <a key={c.n} href={`${SRC}/materi/${c.slug}`} onMouseEnter={() => setHov(c.n)} onMouseLeave={() => setHov(null)}
              className={cx('relative h-9 rounded-lg grid place-items-center text-[12px] font-extrabold transition-colors', hov === c.n ? 'grad-btn text-white shadow-glow' : 'bg-brand-50 text-brand-700 hover:bg-brand-100')}>
              {c.n}
              <AnimatePresence>{hov === c.n && (
                <motion.span initial={{ opacity: 0, y: 6, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 4 }} transition={{ duration: 0.18 }}
                  className="absolute left-1/2 -translate-x-1/2 bottom-[calc(100%+8px)] z-20 whitespace-nowrap rounded-xl bg-ink text-white text-[12px] font-semibold px-3 py-2 shadow-lift">
                  Sesi {c.n} · {c.title}
                </motion.span>
              )}</AnimatePresence>
            </a>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ---------- hero ---------- */
export function Hero({ L }) {
  const done = useStore('done', []).length;
  const mx = useMotionValue(0), my = useMotionValue(0);
  const px = useSpring(useTransform(mx, [-1, 1], [-14, 14]), { stiffness: 60, damping: 20 }), py = useSpring(useTransform(my, [-1, 1], [-10, 10]), { stiffness: 60, damping: 20 });
  const onMove = (e) => { mx.set((e.clientX / innerWidth) * 2 - 1); my.set((e.clientY / innerHeight) * 2 - 1); };
  return (
    <>
      <section className="relative pt-8 md:pt-12 text-center" onMouseMove={onMove}>
        <Shapes />
        <div className="relative">
          <motion.span initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="relative overflow-hidden inline-flex items-center gap-2 h-8 px-4 rounded-full bg-white border border-brand-100 text-brand-700 text-[12.5px] font-bold shadow-soft">
            <span className="relative w-1.5 h-1.5 rounded-full bg-brand"><span className="absolute inset-0 rounded-full bg-brand animate-ping" /></span>{L.hero.badge}
            <motion.span className="absolute inset-y-0 w-16 bg-gradient-to-r from-transparent via-white/80 to-transparent" initial={{ left: '-30%' }} animate={{ left: '120%' }} transition={{ delay: 1.2, duration: 1.1, repeat: Infinity, repeatDelay: 4 }} />
          </motion.span>
          <h1 className="mt-5 text-[40px] md:text-[70px] leading-[1.02] font-extrabold tracking-[-0.04em]">
            <Words text={L.hero.title[0]} delay={0.3} /><br /><Words text={L.hero.title[1]} className="grad-text" delay={0.5} />
          </h1>
          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.75, ease: EASE, duration: 0.6 }} className="mt-4 text-[17px] md:text-[20px] font-semibold text-ink-2">{L.hero.tagline}</motion.p>
          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.85, ease: EASE, duration: 0.6 }} className="mt-4 mx-auto max-w-2xl text-[15.5px] md:text-[16.5px] leading-relaxed text-ink-3">{L.hero.lead}</motion.p>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.95 }} className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <motion.span whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} className="relative overflow-hidden rounded-2xl">
              <Btn as="a" href={`${SRC}/auth/login`} size="lg"><Play size={17} fill="currentColor" />Mulai Training</Btn>
              <motion.span className="pointer-events-none absolute inset-y-0 w-14 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-18deg]" initial={{ left: '-30%' }} animate={{ left: '130%' }} transition={{ delay: 2, duration: 1, repeat: Infinity, repeatDelay: 3.2 }} />
            </motion.span>
            <Btn variant="ghost" size="lg" onClick={() => document.getElementById('materi')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>Pelajari lebih lanjut<motion.span animate={{ y: [0, 3, 0] }} transition={{ duration: 1.4, repeat: Infinity }}><ChevronDown size={17} /></motion.span></Btn>
          </motion.div>

          <Pillars pillars={L.pillars} />
        </div>
      </section>
      {/* curved white edge that cuts the fanned cards, like the reference */}
      <div className="relative z-40 -mt-6 md:-mt-40 pointer-events-none left-1/2 -translate-x-1/2 w-screen overflow-hidden">
        <div className="w-[130vw] -ml-[15vw] h-[90px] md:h-[150px] bg-[#fafcff] rounded-t-[100%_100%] shadow-[0_-30px_60px_-30px_rgba(2,86,244,.10)]" />
      </div>
      <div className="relative z-40 -mt-10 md:-mt-16 text-center">
        <Jadwal rows={L.jadwal} cards={L.content.cards} />
      </div>
    </>
  );
}
