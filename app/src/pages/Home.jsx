import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { Play, Check, Clock, FileDown, Wand2, Fish, Link2, BarChart3, Trophy, ArrowRight, Sparkles, BookOpen } from 'lucide-react';
import { useData, Btn, Card, Eyebrow, Num, Page, Stagger, Item, Tag, cx } from '../components/ui';
import { useStore, shortTitle, stepsOf, goalsOf, groupLabel } from '../lib/core';

const OFFS = [0, 78, 118, 78, 0, -78, -118, -78];

export function Home() {
  const { P, all } = useData();
  const done = new Set(useStore('done', [])); const xp = useStore('xp', 0); const copied = useStore('copied', []).length; const best = useStore('quizBest', null);
  const next = all.find((s) => !done.has(s)); const ns = next && P.sessions[next];
  const [gi, setGi] = useState(() => Math.max(0, P.groups.findIndex((g) => g.sessions.includes(next))));
  const vis = useStore('vis:' + next, []); const nsteps = ns ? stepsOf(ns).length : 0;
  const hour = new Date().getHours(); const greet = hour < 11 ? 'Selamat pagi' : hour < 15 ? 'Selamat siang' : hour < 18 ? 'Selamat sore' : 'Selamat malam';
  return (
    <Page>
      <div className="mb-7">
        <Eyebrow className="text-brand mb-2">{greet} 👋</Eyebrow>
        <h1 className="text-[32px] md:text-[46px] leading-[1.05] font-extrabold tracking-[-0.035em] max-w-3xl">
          Dari memahami AI <br className="hidden md:block" />sampai <span className="grad-text">memakainya di pekerjaan.</span>
        </h1>
        <p className="mt-3 text-ink-3 text-[15.5px] max-w-xl">Gen AI for Business Productivity 2026 · PAM Jaya × BusinessFirst · 2 hari, 32 materi, 64 alat prompt.</p>
      </div>
      <div className="grid lg:grid-cols-[minmax(0,1fr)_360px] gap-7 items-start">
        <div className="min-w-0">
          {ns ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
              className="relative overflow-hidden rounded-4xl p-6 md:p-7 text-white shadow-lift" style={{ background: 'linear-gradient(135deg,#0247cc 0%,#0256f4 45%,#1a8df6 100%)' }}>
              <div className="absolute -right-16 -top-20 w-72 h-72 rounded-full bg-white/10 blur-2xl" />
              <div className="absolute right-24 -bottom-24 w-64 h-64 rounded-full bg-sky-300/30 blur-3xl" />
              <div className="relative grid md:grid-cols-[1fr_224px] gap-6 items-center">
                <div>
                  <span className="inline-flex items-center gap-1.5 h-7 px-3 rounded-full bg-white/15 text-[12px] font-bold backdrop-blur">
                    <Sparkles size={13} />{done.size ? 'Lanjutkan belajar' : 'Mulai perjalanan'} · {groupLabel(P.groups.find((x) => x.sessions.includes(next)))}
                  </span>
                  <h2 className="mt-3 text-[24px] md:text-[28px] leading-tight font-extrabold tracking-tight">{shortTitle(ns.title)}</h2>
                  <p className="mt-2 text-white/80 text-[14.5px] leading-relaxed line-clamp-2">{ns.subtitle}</p>
                  <div className="flex gap-1 mt-5 mb-5 max-w-md">
                    {Array.from({ length: nsteps }, (_, k) => <motion.i key={k} initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.2 + k * 0.04 }} className={cx('block h-1.5 flex-1 rounded-full origin-left', vis.includes(k) ? 'bg-white' : 'bg-white/25')} />)}
                  </div>
                  <Btn as={Link} to={`/sesi/${next}/${vis.length ? Math.min(nsteps - 1, Math.max(...vis)) : 0}`} variant="ghost" size="lg" className="!text-brand-700 !border-white">
                    <Play size={17} fill="currentColor" />{vis.length ? 'Lanjutkan' : 'Mulai'} · {ns.read_min || 5} menit
                  </Btn>
                </div>
                <motion.div whileHover={{ rotate: -2, scale: 1.03 }} className="hidden md:block aspect-video rounded-2xl bg-cover bg-center ring-4 ring-white/20 shadow-lift" style={{ backgroundImage: `url('${ns.image}')` }} />
              </div>
            </motion.div>
          ) : (
            <Card className="p-7"><h2 className="text-2xl font-extrabold">Semua materi selesai 🎉</h2><p className="text-ink-3 mt-1 mb-4">Uji pemahaman Anda di Latihan Soal.</p><Btn as={Link} to="/latihan">Mulai latihan</Btn></Card>
          )}

          <div className="mt-9 flex items-center gap-3 flex-wrap">
            <div className="inline-flex p-1 rounded-2xl bg-slate-100/80 border border-line">
              {P.groups.map((g, k) => (
                <button key={k} onClick={() => setGi(k)} className={cx('relative h-10 px-4 rounded-xl text-[14px] font-bold transition-colors', gi === k ? 'text-ink' : 'text-ink-3 hover:text-ink')}>
                  {gi === k && <motion.span layoutId="daytab" className="absolute inset-0 bg-white rounded-xl shadow-soft" transition={{ type: 'spring', stiffness: 500, damping: 38 }} />}
                  <span className="relative">{groupLabel(g)} <span className="text-ink-4 font-semibold text-[12px] ml-1 tabular-nums">{g.sessions.filter((s) => done.has(s)).length}/{g.sessions.length}</span></span>
                </button>
              ))}
            </div>
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={gi} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
              <p className="mt-3 text-ink-3 text-[14.5px]">{P.groups[gi].kind === 'supplement' ? 'Framework analisis, teknik prompting, dan kisi-kisi soal — bacaan pendukung untuk semua sesi.' : `${P.groups[gi].title.split('—')[1]?.trim()} · ${P.groups[gi].sessions.length} sesi`}</p>
              <PathMap group={P.groups[gi]} done={done} />
            </motion.div>
          </AnimatePresence>
        </div>

        <Stagger className="lg:sticky lg:top-24 flex flex-col gap-3.5">
          <Item className="grid grid-cols-3 gap-2.5">
            {[[done.size, 'sesi selesai', 'text-ink'], [xp, 'XP', 'text-amber-500'], [copied, 'prompt disalin', 'text-brand']].map(([v, l, c]) => (
              <Card key={l} className="p-3.5 !rounded-2xl"><b className={cx('block text-[22px] font-extrabold', c)}><Num value={v} /></b><span className="text-[11.5px] text-ink-3 font-medium">{l}</span></Card>
            ))}
          </Item>
          <Item className="flex items-center justify-between mt-2 px-1"><Eyebrow>Lab praktik</Eyebrow><Link to="/lab" className="text-[13px] font-bold text-brand inline-flex items-center gap-1">Semua <ArrowRight size={14} /></Link></Item>
          {LABS.map((l) => <Item key={l.k}><LabRow {...l} /></Item>)}
          <Item>
            <Link to="/latihan" className="group flex items-center gap-4 p-4 rounded-3xl text-white shadow-lift" style={{ background: 'linear-gradient(135deg,#f59e0b,#f97316)' }}>
              <span className="w-12 h-12 rounded-2xl bg-white/20 grid place-items-center"><Trophy size={22} /></span>
              <span className="flex-1"><b className="block text-[15px]">Latihan Soal</b><span className="text-[13px] text-white/85">{best != null ? `Skor terbaik ${best}/100` : '10 soal esai · simulasi post-test'}</span></span>
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </Item>
        </Stagger>
      </div>
    </Page>
  );
}

export const LABS = [
  { k: 'prompt', t: 'Prompt Builder', d: 'Rakit 5 komponen, lihat skornya naik', c: '#f59e0b', bg: '#fff7e6', Ic: Wand2, m: 'sesi-03-dasar-dasar-prompting' },
  { k: 'fishbone', t: 'Fishbone 6M', d: 'Petakan penyebab, uji dengan AI', c: '#0891c9', bg: '#e6f6fe', Ic: Fish, m: 'fishbone-analysis' },
  { k: '5why', t: '5 Why', d: 'Gali sampai akar, satu per satu', c: '#3b82f6', bg: '#eaf2ff', Ic: Link2, m: '5-why-analysis' },
  { k: 'pareto', t: 'Pareto 80/20', d: 'Masukkan data, temukan yang vital', c: '#10b981', bg: '#e6f8f1', Ic: BarChart3, m: 'pareto-analysis' },
];
function LabRow({ k, t, d, c, bg, Ic }) {
  return (
    <Link to={`/lab/${k}`} className="group flex items-center gap-3.5 p-3.5 rounded-3xl bg-white border border-line shadow-soft hover:shadow-lift hover:-translate-y-0.5 transition-all">
      <span className="w-12 h-12 rounded-2xl grid place-items-center transition-transform group-hover:scale-110 group-hover:-rotate-6" style={{ background: bg, color: c }}><Ic size={22} /></span>
      <span className="flex-1 min-w-0"><b className="block text-[14.5px]">{t}</b><span className="block text-[13px] text-ink-3 truncate">{d}</span></span>
      <ArrowRight size={17} className="text-ink-4 transition-transform group-hover:translate-x-1 group-hover:text-ink" />
    </Link>
  );
}

function PathMap({ group, done }) {
  const { P } = useData(); const nav = useNavigate();
  const ref = useRef(null); const [W, setW] = useState(600); const [open, setOpen] = useState(null);
  useLayoutEffect(() => {
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width)); if (ref.current) ro.observe(ref.current); return () => ro.disconnect();
  }, []);
  useEffect(() => setOpen(null), [group]);
  const GAP = 124, cx0 = W / 2, sc = W < 460 ? 0.55 : Math.min(1, W / 600);
  const cur = group.sessions.find((s) => !done.has(s));
  const pts = group.sessions.map((s, i) => ({ s, x: cx0 + OFFS[i % 8] * sc, y: 70 + i * GAP }));
  let dash = '', solid = '';
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i], seg = `M${a.x},${a.y} C${a.x},${a.y + GAP / 2} ${b.x},${b.y - GAP / 2} ${b.x},${b.y} `;
    if (done.has(a.s) && done.has(b.s)) solid += seg; else dash += seg;
  }
  return (
    <div ref={ref} className="relative mt-8 mx-auto max-w-[600px]" style={{ height: pts.length * GAP + 60 }}>
      <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none">
        <motion.path d={dash} fill="none" stroke="#cfd9ea" strokeWidth="6" strokeLinecap="round" strokeDasharray="0.5 14" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} />
        <path d={solid} fill="none" stroke="url(#pg)" strokeWidth="6" strokeLinecap="round" />
        <defs><linearGradient id="pg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#10b981" /><stop offset="1" stopColor="#0256f4" /></linearGradient></defs>
      </svg>
      {pts.map((p, i) => {
        const s = P.sessions[p.s], st = done.has(p.s) ? 'done' : p.s === cur ? 'cur' : 'todo', left = p.x - cx0 > 1;
        const n = s.number || i + 1, isOpen = open === p.s;
        return (
          <div key={p.s} className="absolute" style={{ left: p.x, top: p.y }}>
            {st === 'cur' && !isOpen && (
              <motion.span animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 1.6 }}
                className="absolute -top-[74px] left-0 -translate-x-1/2 whitespace-nowrap rounded-xl bg-white border border-line shadow-lift px-3 py-1.5 text-[12px] font-extrabold text-brand-700 tracking-wide">
                MULAI
                <i className="absolute left-1/2 -bottom-[6px] w-3 h-3 -translate-x-1/2 rotate-45 bg-white border-r border-b border-line" />
              </motion.span>
            )}
            <motion.button initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1 + i * 0.05, type: 'spring', stiffness: 380, damping: 18 }}
              whileHover={{ scale: 1.08, y: -3 }} whileTap={{ scale: 0.92 }} onClick={() => setOpen(isOpen ? null : p.s)}
              className={cx('absolute -left-9 -top-9 w-[72px] h-[72px] rounded-full grid place-items-center text-[20px] font-extrabold', {
                done: 'bg-gradient-to-b from-emerald-400 to-emerald-500 text-white shadow-[0_6px_0_#059669,0_12px_24px_-6px_rgba(16,185,129,.5)]',
                cur: 'grad-btn text-white shadow-[0_6px_0_#023db0,0_14px_30px_-6px_rgba(2,86,244,.55)]',
                todo: 'bg-white text-ink-3 border-2 border-line shadow-[0_6px_0_#e2e8f0]',
              }[st])}>
              {st === 'cur' && <motion.span className="absolute inset-0 rounded-full border-[3px] border-brand/50" animate={{ scale: [1, 1.45], opacity: [0.7, 0] }} transition={{ repeat: Infinity, duration: 1.8, ease: 'easeOut' }} />}
              {st === 'done' ? <Check size={28} strokeWidth={3} /> : n}
            </motion.button>
            <button onClick={() => setOpen(isOpen ? null : p.s)}
              className={cx('absolute -top-6 text-[13.5px] leading-snug font-bold', W < 460 ? 'w-[124px]' : 'w-[200px]', left ? 'right-12 text-right' : 'left-12 text-left', st === 'todo' ? 'text-ink-2' : 'text-ink')}>
              {shortTitle(s.title)}
              <span className="block mt-1 text-[11.5px] font-semibold text-ink-4">{s.read_min || 5} mnt</span>
            </button>
            <AnimatePresence>
              {isOpen && (
                <motion.div initial={{ opacity: 0, y: -8, scale: 0.94 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.96 }}
                  transition={{ type: 'spring', stiffness: 420, damping: 30 }}
                  className="absolute z-30 top-12 rounded-3xl bg-white border border-line shadow-lift p-4 origin-top"
                  style={{ width: Math.min(340, W - 16), left: Math.min(Math.max(-Math.min(340, W - 16) / 2, 8 - p.x), W - 8 - Math.min(340, W - 16) - p.x) }}>
                  {s.image && <div className="h-28 rounded-2xl bg-cover bg-center mb-3" style={{ backgroundImage: `url('${s.image}')` }} />}
                  <div className="flex items-center gap-2 mb-1"><Tag tone={st === 'done' ? 'green' : 'blue'}>{s.number ? `Sesi ${s.number} · Hari ${s.day}` : 'Materi pendukung'}</Tag>{st === 'done' && <Tag tone="green">Selesai</Tag>}</div>
                  <h3 className="text-[17px] font-extrabold leading-snug tracking-tight">{shortTitle(s.title)}</h3>
                  <p className="text-[13px] text-ink-3 mt-1 line-clamp-3">{s.subtitle}</p>
                  <ul className="mt-3 space-y-1.5">{goalsOf(s).slice(0, 3).map((g, j) => <li key={j} className="flex gap-2 text-[13px] text-ink-2"><Check size={15} className="text-mint mt-0.5 shrink-0" />{g}</li>)}</ul>
                  <div className="flex items-center gap-2 mt-3 text-[12px] font-semibold text-ink-3"><Clock size={13} />{s.read_min || 5} mnt · {stepsOf(s).length - 1} langkah · {s.stats.copyable} prompt</div>
                  <div className="grid grid-cols-[1fr_auto] gap-2 mt-4">
                    <Btn onClick={() => nav(`/sesi/${p.s}/0`)}><Play size={15} fill="currentColor" />{st === 'done' ? 'Ulangi' : 'Mulai'} · +50 XP</Btn>
                    <Btn as="a" href={`pdf/${p.s}.pdf`} target="_blank" variant="ghost"><FileDown size={16} />PDF</Btn>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
