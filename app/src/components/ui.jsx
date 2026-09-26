import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useSpring, useTransform, animate } from 'motion/react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Check, Copy, ExternalLink, Wand2, Map, FlaskConical, Library, Target, Sparkles } from 'lucide-react';
import { store, useStore, level, onXP, copyRaw, AIS, hash, addXP, anatomy, KEYS, KNAME, KCOLOR, cleanPrompt } from '../lib/core';
import { useData } from '../lib/data.jsx';

export const cx = (...a) => a.filter(Boolean).join(' ');
const MC = new globalThis.Map();
const motionOf = (As) => { if (!MC.has(As)) MC.set(As, motion.create(As)); return MC.get(As); };

/* ── buttons ── */
export function Btn({ as: As = 'button', variant = 'primary', size = 'md', className, children, ...p }) {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold whitespace-nowrap select-none transition-colors disabled:opacity-40 disabled:pointer-events-none';
  const sz = { sm: 'h-9 px-3.5 text-[13px] rounded-xl', md: 'h-11 px-5 text-sm rounded-2xl', lg: 'h-[52px] px-6 text-[15px] rounded-2xl' }[size];
  const v = {
    primary: 'grad-btn text-white shadow-glow hover:brightness-110',
    ghost: 'bg-white text-ink border border-line shadow-soft hover:border-brand-100 hover:bg-brand-50/40',
    soft: 'bg-brand-50 text-brand-700 hover:bg-brand-100',
    dark: 'bg-ink text-white hover:bg-ink-2',
    success: 'bg-mint text-white shadow-[0_10px_30px_-8px_rgba(16,185,129,.6)] hover:brightness-105',
  }[variant];
  const M = motionOf(As);
  return <M whileTap={{ scale: 0.96 }} whileHover={{ y: -1 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }} className={cx(base, sz, v, className)} {...p}>{children}</M>;
}
export const Chip = ({ on, className, children, ...p }) => (
  <button className={cx('relative h-8 px-3.5 rounded-full text-[13px] font-semibold border transition-colors', on ? 'text-brand-700 border-brand-100 bg-brand-50' : 'text-ink-3 border-line bg-white hover:text-ink hover:border-slate-300', className)} {...p}>{children}</button>
);
export const Tag = ({ tone = 'slate', children }) => {
  const t = { slate: 'bg-slate-100 text-ink-3', blue: 'bg-brand-50 text-brand-700', amber: 'bg-amber-50 text-amber-700', green: 'bg-emerald-50 text-emerald-700', violet: 'bg-sky-50 text-sky-600', sky: 'bg-sky-50 text-sky-600' }[tone];
  return <span className={cx('inline-flex items-center gap-1 h-6 px-2.5 rounded-full text-[11.5px] font-bold tracking-wide', t)}>{children}</span>;
};
export const Card = ({ className, children, ...p }) => <div className={cx('bg-white border border-line rounded-3xl shadow-soft', className)} {...p}>{children}</div>;
export const Eyebrow = ({ className, children }) => <div className={cx('text-[11.5px] font-bold uppercase tracking-[.14em] text-ink-4', className)}>{children}</div>;

/* animated number */
export function Num({ value, className }) {
  const [v, setV] = useState(value);
  const prev = useRef(value);
  useEffect(() => { const c = animate(prev.current, value, { duration: 0.8, ease: 'easeOut', onUpdate: (x) => setV(Math.round(x)) }); prev.current = value; return () => c.stop(); }, [value]);
  return <span className={cx('tabular-nums', className)}>{v}</span>;
}

/* progress ring */
export function Ring({ value, size = 56, stroke = 6, color = '#0256f4', children }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r;
  return (
    <div className="relative grid place-items-center shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#eef2f8" strokeWidth={stroke} fill="none" />
        <motion.circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none" strokeLinecap="round"
          strokeDasharray={c} animate={{ strokeDashoffset: c * (1 - Math.min(1, Math.max(0, value))) }} initial={false} transition={{ type: 'spring', stiffness: 90, damping: 20 }} />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-[13px] font-extrabold tabular-nums">{children}</div>
    </div>
  );
}

/* ── toast + xp fly ── */
const ToastCtx = createContext(() => {});
export const useToast = () => useContext(ToastCtx);
export function ToastHost({ children }) {
  const [t, setT] = useState(null);
  const [fly, setFly] = useState([]);
  const timer = useRef();
  const show = (title, sub) => { setT({ title, sub, id: Date.now() }); clearTimeout(timer.current); timer.current = setTimeout(() => setT(null), 2400); };
  useEffect(() => onXP((n, r) => {
    const id = Math.random();
    setFly((f) => [...f, { id, n, x: r ? r.left + r.width / 2 : innerWidth - 120, y: r ? r.top : 80 }]);
    setTimeout(() => setFly((f) => f.filter((z) => z.id !== id)), 1100);
  }), []);
  return (
    <ToastCtx.Provider value={show}>
      {children}
      <div className="fixed top-4 inset-x-0 z-[90] flex justify-center pointer-events-none px-4">
        <AnimatePresence>
          {t && (
            <motion.div key={t.id} initial={{ y: -30, opacity: 0, scale: 0.95 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: -20, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 420, damping: 30 }}
              className="flex items-center gap-3 bg-white/95 backdrop-blur border border-line shadow-lift rounded-2xl pl-2.5 pr-5 py-2.5 max-w-md">
              <span className="w-8 h-8 rounded-full bg-mint text-white grid place-items-center shrink-0"><Check size={17} strokeWidth={3} /></span>
              <span><b className="block text-sm">{t.title}</b>{t.sub && <span className="block text-[12.5px] text-ink-3">{t.sub}</span>}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <AnimatePresence>
        {fly.map((f) => (
          <motion.div key={f.id} initial={{ opacity: 0, y: 0, scale: 0.6 }} animate={{ opacity: [0, 1, 1, 0], y: -70, scale: 1 }} transition={{ duration: 1.05 }}
            className="fixed z-[95] pointer-events-none font-extrabold text-[15px] px-2.5 py-1 rounded-full bg-amber-400 text-white shadow-lg" style={{ left: f.x - 34, top: f.y - 6 }}>
            +{f.n} XP
          </motion.div>
        ))}
      </AnimatePresence>
    </ToastCtx.Provider>
  );
}

/* copy / open-in-AI */
export function useCopy() {
  const toast = useToast();
  return async (text, el, sub) => {
    await copyRaw(text);
    toast('Prompt tersalin', sub || 'Tempel di ChatGPT, Claude, Gemini, DeepSeek, atau Qwen');
    const c = store.get('copied', []);
    if (!c.includes(hash(text))) { store.set('copied', [...c, hash(text)]); addXP(2, el); }
  };
}
export function AIButtons({ get, size = 'sm', className }) {
  const toast = useToast();
  const go = async (k) => {
    const text = get(), a = AIS[k]; await copyRaw(text);
    const pre = a.url && text.length < 6000;
    window.open(pre ? a.url(text) : a.base, '_blank', 'noopener');
    toast(`Membuka ${a.name}`, pre ? 'Prompt sudah terisi — tinggal kirim' : 'Prompt sudah disalin — tempel (Ctrl/⌘+V) lalu kirim');
  };
  return (
    <div className={cx('flex flex-wrap gap-2', className)}>
      {Object.entries(AIS).map(([k, a]) => (
        <Btn key={k} variant="ghost" size={size} onClick={() => go(k)}><ExternalLink size={14} />{a.name}</Btn>
      ))}
    </div>
  );
}
export function CopyBtn({ get, label = 'Salin', size = 'sm', variant = 'primary', sub }) {
  const copy = useCopy(); const [ok, setOk] = useState(false); const ref = useRef();
  return (
    <Btn ref={ref} variant={ok ? 'success' : variant} size={size} onClick={(e) => { copy(get(), e.currentTarget, sub); setOk(true); setTimeout(() => setOk(false), 1500); }}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span key={ok ? 'y' : 'n'} initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -8, opacity: 0 }} className="inline-flex items-center gap-2">
          {ok ? <><Check size={15} strokeWidth={3} />Tersalin</> : <><Copy size={15} />{label}</>}
        </motion.span>
      </AnimatePresence>
    </Btn>
  );
}

/* anatomy bar */
export function AnatBar({ f, n, compact }) {
  return (
    <span className="inline-flex items-center gap-1.5" title="Komponen prompt terdeteksi">
      {KEYS.map((k, i) => (
        <motion.i key={k} initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
          className="block h-1.5 w-4 rounded-full origin-left" style={{ background: f[k] ? KCOLOR[k] : '#e6ebf3' }} title={KNAME[k]} />
      ))}
      {!compact && <span className="ml-1 text-[12px] font-bold text-ink-3 tabular-nums">{n}/5</span>}
    </span>
  );
}

/* prompt card — colour-coded by the course's own framework */
export function PromptCard({ text, label = 'Contoh prompt', onRemix }) {
  const a = anatomy(text), clean = cleanPrompt(text);
  return (
    <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }}
      className="my-6 rounded-3xl border border-line bg-white shadow-soft overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-3 border-b border-line bg-gradient-to-r from-brand-50/70 via-white to-sky-50/70">
        <span className="inline-flex items-center gap-1.5 text-[12.5px] font-bold text-brand-700"><Sparkles size={15} />{label}</span>
        <span className="flex-1" /><AnatBar {...a} />
      </div>
      <div className="px-5 py-4 font-mono text-[13.5px] leading-[1.75] text-ink-2 whitespace-pre-wrap break-words max-h-[440px] overflow-auto scroll-thin">
        {a.segs.map((s, i) => s.k ? (
          <span key={i} className="block border-l-[3px] pl-3 my-1 rounded-r-lg py-0.5" style={{ borderColor: KCOLOR[s.k], background: KCOLOR[s.k] + '0d' }}>
            <b style={{ color: KCOLOR[s.k] }}>{s.label}:</b> {s.text}
          </span>
        ) : <span key={i}>{s.text}{'\n'}</span>)}
      </div>
      <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-t border-line bg-paper/60">
        <CopyBtn get={() => clean} />
        <AIButtons get={() => clean} />
        <span className="flex-1" />
        {onRemix && <Btn variant="soft" size="sm" onClick={() => onRemix(clean)}><Wand2 size={15} />Remix</Btn>}
      </div>
    </motion.div>
  );
}

/* ── shell ── */
export function Aurora({ tone = 'blue' }) {
  const sets = {
    blue: ['#bfd6ff', '#cdeeff', '#dfe9ff', '#e8f6ff'],
    peach: ['#ffe3d3', '#cdeeff', '#c9dcff', '#fff3d6'],
  }[tone];
  return (
    <div className="aurora" aria-hidden>
      <i style={{ width: 520, height: 420, left: '-8%', top: -160, background: sets[0] }} />
      <i style={{ width: 460, height: 380, left: '30%', top: -200, background: sets[1], animationDelay: '-6s' }} />
      <i style={{ width: 420, height: 360, right: '-6%', top: -120, background: sets[2], animationDelay: '-11s' }} />
      <i style={{ width: 300, height: 260, left: '55%', top: 60, background: sets[3], opacity: 0.45, animationDelay: '-3s' }} />
    </div>
  );
}
const NAV = [['/peta', 'Peta', Map], ['/lab', 'Lab', FlaskConical], ['/prompt', 'Pustaka', Library], ['/latihan', 'Latihan', Target]];
export function Shell({ children, tone }) {
  const xp = useStore('xp', 0), { lv, into } = level(xp); const loc = useLocation();
  const active = (to) => loc.pathname.startsWith(to);
  return (
    <div className="relative min-h-screen">
      <Aurora tone={tone} />
      <header className="sticky top-0 z-40 px-4 pt-3 md:pt-4">
        <div className="glass mx-auto max-w-[1180px] flex items-center gap-3 h-14 pl-3 pr-2 rounded-2xl border border-white/70 shadow-soft">
          <Link to="/" className="flex items-center gap-2.5 mr-2">
            <img src="assets/pam-mark.png" alt="PAM Jaya" className="w-9 h-9 object-contain" />
            <span className="leading-tight"><b className="block text-[14.5px] font-extrabold tracking-tight">PAM Jaya <span className="text-brand">· Workshop AI</span></b><span className="hidden sm:block text-[11.5px] text-ink-3 font-medium">Gen AI for Business Productivity · BusinessFirst</span></span>
          </Link>
          <nav className="hidden md:flex items-center gap-1 relative">
            {NAV.map(([to, l, Ic]) => (
              <NavLink key={to} to={to} className={cx('relative px-3.5 h-10 inline-flex items-center gap-2 rounded-xl text-[14px] font-semibold transition-colors', active(to) ? 'text-ink' : 'text-ink-3 hover:text-ink')}>
                {active(to) && <motion.span layoutId="navpill" className="absolute inset-0 bg-white rounded-xl shadow-soft border border-line" transition={{ type: 'spring', stiffness: 500, damping: 38 }} />}
                <Ic size={17} className="relative" /><span className="relative">{l}</span>
              </NavLink>
            ))}
          </nav>
          <span className="flex-1" />
          <div className="flex items-center gap-2.5 bg-white/80 border border-line rounded-xl pl-2 pr-3 h-10">
            <Ring value={into / 200} size={28} stroke={4} color="#f59e0b"><span className="text-[10px]">{lv}</span></Ring>
            <span className="text-[13.5px] font-extrabold text-amber-600 whitespace-nowrap"><Num value={xp} /> XP</span>
          </div>
        </div>
      </header>
      <main className="relative z-10 mx-auto max-w-[1180px] px-4 md:px-6 pt-6 md:pt-10 pb-32">{children}</main>
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 glass border-t border-line pb-safe">
        <div className="flex px-2 pt-1.5 pb-1.5">
          {NAV.map(([to, l, Ic]) => (
            <NavLink key={to} to={to} className={cx('relative flex-1 flex flex-col items-center gap-0.5 py-1.5 text-[11px] font-bold', active(to) ? 'text-brand' : 'text-ink-4')}>
              {active(to) && <motion.span layoutId="tabpill" className="absolute top-0 h-[3px] w-8 rounded-full grad-btn" />}
              <Ic size={21} strokeWidth={active(to) ? 2.4 : 1.9} />{l}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}

/* page transition wrapper */
export const Page = ({ children, className }) => (
  <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }} className={className}>{children}</motion.div>
);
export const Stagger = ({ children, className, delay = 0.05 }) => (
  <motion.div className={className} initial="h" animate="s" variants={{ s: { transition: { staggerChildren: delay } } }}>{children}</motion.div>
);
export const Item = ({ children, className, ...p }) => (
  <motion.div className={className} variants={{ h: { opacity: 0, y: 16 }, s: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 26 } } }} {...p}>{children}</motion.div>
);

export function PageHead({ eyebrow, title, sub, right }) {
  return (
    <div className="flex flex-wrap items-end gap-4 mb-8">
      <div className="max-w-2xl">
        {eyebrow && <Eyebrow className="mb-2 text-brand">{eyebrow}</Eyebrow>}
        <h1 className="text-[30px] md:text-[40px] leading-[1.08] font-extrabold tracking-[-0.03em]">{title}</h1>
        {sub && <p className="mt-3 text-[15.5px] leading-relaxed text-ink-3">{sub}</p>}
      </div>
      <span className="flex-1" />{right}
    </div>
  );
}
export { useData };
