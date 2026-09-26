'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, ArrowLeft, Lightbulb, Check, Play } from 'lucide-react';
import { Btn, Eyebrow, cx } from './ui';
import { useStore } from './core';
import { SRC } from './Landing';
import sessions from '../../data/sessions.json';
import { FileText, Copy, Clock, Layers } from 'lucide-react';

/* Workshop Content as a curriculum explorer: numbered list (auto-advances) + detail panel. All 12 sessions, same fields as the source cards. */
const EASE = [0.22, 1, 0.36, 1];
const CYCLE = 6500;

export function WorkshopContent({ L }) {
  const cards = L.content.cards; const n = cards.length;
  const done = new Set(useStore('done', []));
  const [i, setI] = useState(0); const [dir, setDir] = useState(1); const [pause, setPause] = useState(false); const [seen, setSeen] = useState(false);
  const go = (k, d) => { setDir(d ?? (k > i ? 1 : -1)); setI(((k % n) + n) % n); };
  useEffect(() => { if (pause || !seen) return; const id = setTimeout(() => go(i + 1, 1), CYCLE); return () => clearTimeout(id); }, [i, pause, seen]);
  useEffect(() => { const f = (e) => { if (e.key === 'ArrowRight') go(i + 1, 1); if (e.key === 'ArrowLeft') go(i - 1, -1); }; addEventListener('keydown', f); return () => removeEventListener('keydown', f); }, [i]);
  const chipsRef = useRef();
  useEffect(() => { chipsRef.current?.children[i]?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' }); }, [i]);
  const c = cards[i];
  const S = sessions[c.slug] || {};
  const outline = (S.sections || []).filter((x) => x.role === 'content').map((x) => x.heading.replace(/^\d+\.\s*/, '')).slice(0, 6);
  const listOf = (role) => (S.sections || []).filter((x) => x.role === role).flatMap((x) => x.blocks.filter((b) => b.type === 'list').flatMap((b) => b.items));
  let goals = listOf('goals').slice(0, 3), goalsLabel = 'Setelah sesi ini, Anda mampu';
  if (!goals.length) { goals = listOf('summary').slice(0, 3); goalsLabel = 'Rangkuman sesi'; }
  if (!goals.length) { const sec = (S.sections || []).find((x) => x.role === 'content' && x.blocks.some((b) => b.type === 'list' || b.type === 'subheading')); goals = (sec?.blocks || []).filter((b) => b.type === 'list' || b.type === 'subheading').flatMap((b) => b.items || [b.text]).slice(0, 3); goalsLabel = sec?.heading || ''; }
  const stats = [[Layers, `${S.stats?.sections || outline.length} bagian`], [Copy, `${S.stats?.copyable || 0} prompt siap salin`], [Clock, `${S.read_min || 5} mnt baca`]];
  return (
    <section id="materi" className="mt-20 md:mt-28 scroll-mt-24">
      <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} onViewportEnter={() => setSeen(true)} transition={{ duration: 0.5, ease: EASE }} className="text-center max-w-2xl mx-auto">
        <Eyebrow className="text-brand">Workshop content</Eyebrow>
        <h2 className="mt-2 text-[30px] md:text-[42px] leading-[1.05] font-extrabold tracking-[-0.035em]">Dua belas sesi, <span className="grad-text">dua hari.</span></h2>
        <p className="mt-3 text-[15.5px] leading-relaxed text-ink-3">{L.content.lead}</p>
      </motion.div>

      {/* mobile: chip rail */}
      <div ref={chipsRef} className="lg:hidden mt-8 -mx-4 px-4 flex gap-2 overflow-x-auto no-scrollbar snap-x">
        {cards.map((x, k) => (
          <button key={x.n} onClick={() => go(k)} className={cx('snap-center shrink-0 h-10 pl-1.5 pr-3.5 rounded-full border text-[13px] font-bold inline-flex items-center gap-2 transition-colors', k === i ? 'grad-btn text-white border-transparent shadow-glow' : 'bg-white border-line text-ink-2')}>
            <span className={cx('w-7 h-7 rounded-full grid place-items-center text-[12px] font-extrabold', k === i ? 'bg-white/20' : 'bg-brand-50 text-brand-700')}>{x.n}</span>{x.title}
          </button>
        ))}
      </div>

      <div className="mt-6 lg:mt-10 grid lg:grid-cols-[380px_minmax(0,1fr)] gap-6 lg:items-stretch" onMouseEnter={() => setPause(true)} onMouseLeave={() => setPause(false)}>
        {/* desktop: numbered list */}
        <ol className="hidden lg:flex flex-col bg-white border border-line rounded-3xl shadow-soft p-2">
          {cards.map((x, k) => { const act = k === i; return (
            <li key={x.n} className="flex-1 flex">
              <button onClick={() => go(k)} className={cx('relative w-full text-left flex items-center gap-3 px-3 min-h-[52px] rounded-2xl transition-colors', act ? 'bg-brand-50/80' : 'hover:bg-paper')}>
                {act && <motion.span layoutId="ws-pill" className="absolute inset-0 rounded-2xl border border-brand-100 bg-brand-50" transition={{ type: 'spring', stiffness: 420, damping: 36 }} />}
                <span className={cx('relative w-8 h-8 rounded-xl grid place-items-center text-[12.5px] font-extrabold shrink-0', done.has(x.slug) ? 'bg-emerald-500 text-white' : act ? 'grad-btn text-white shadow-glow' : 'bg-paper text-ink-3 border border-line')}>{done.has(x.slug) ? <Check size={14} strokeWidth={3} /> : x.n}</span>
                <span className="relative min-w-0 leading-tight"><b className={cx('block text-[13.5px] truncate', act ? 'text-ink' : 'text-ink-2')}>{x.title}</b><span className="block text-[11.5px] text-ink-4 truncate">{x.desc}</span></span>
                {act && !pause && <motion.span key={'p' + i} className="absolute left-3 right-3 bottom-1 h-[2px] rounded-full grad-btn origin-left" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: CYCLE / 1000, ease: 'linear' }} />}
              </button>
            </li>
          ); })}
        </ol>

        {/* detail panel */}
        <div className="relative min-w-0 flex flex-col lg:h-[780px] bg-white border border-line rounded-[28px] shadow-soft overflow-hidden">
          <AnimatePresence mode="wait" custom={dir} initial={false}>
            <motion.article key={c.n} custom={dir} initial={{ opacity: 0, x: dir * 36 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: dir * -36 }} transition={{ duration: 0.38, ease: EASE }}
              className="flex-1 grid md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
              <div className="p-4 md:p-5 md:pr-0 flex flex-col gap-4">
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-brand-50 shadow-soft">
                  <motion.img key={c.image} src={c.image} alt="" initial={{ scale: 1.06 }} animate={{ scale: 1 }} transition={{ duration: 6, ease: 'linear' }} className="absolute inset-0 w-full h-full object-cover" />
                  {done.has(c.slug) && <span className="absolute right-3 top-3 h-7 px-2.5 rounded-full bg-emerald-500 text-white text-[11.5px] font-bold grid place-items-center">Selesai</span>}
                </div>
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex gap-2.5 rounded-2xl bg-sky-50/70 border border-sky-100 p-3.5">
                  <Lightbulb size={16} className="text-brand shrink-0 mt-0.5" />
                  <p className="text-[13px] leading-relaxed text-ink-2"><b className="text-ink">Kenapa penting: </b>{c.why}</p>
                </motion.div>
                {outline.length > 0 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="rounded-2xl border border-line bg-paper/60 p-4">
                    <div className="flex items-center gap-2 mb-2.5"><FileText size={14} className="text-brand" /><span className="text-[11px] font-bold uppercase tracking-[.14em] text-ink-4">Isi materi</span></div>
                    <ol className="grid gap-1.5">
                      {outline.map((h, k) => <li key={h} className="flex gap-2.5 text-[12.5px] leading-snug text-ink-2"><span className="w-4 shrink-0 text-right tabular-nums font-extrabold text-brand">{k + 1}</span><span className="truncate">{h}</span></li>)}
                    </ol>
                  </motion.div>
                )}
                <div className="hidden md:flex mt-auto items-center gap-2 px-1">
                  <span className="text-[11px] font-bold uppercase tracking-[.14em] text-ink-4">Sesi {String(c.n).padStart(2, '0')} / {n}</span>
                  <span className="flex-1 h-1 rounded-full bg-slate-100 overflow-hidden"><motion.span className="block h-full grad-btn" animate={{ width: `${((i + 1) / n) * 100}%` }} transition={{ duration: 0.5, ease: EASE }} /></span>
                </div>
              </div>
              <div className="p-5 md:p-7 flex flex-col">
                <h3 className="text-[22px] md:text-[26px] font-extrabold tracking-tight leading-tight">{c.title}</h3>
                <p className="mt-2.5 text-[14.5px] leading-relaxed text-ink-3">{c.desc}</p>
                <Eyebrow className="mt-5 mb-2 text-brand">Poin kunci</Eyebrow>
                <ul className="space-y-1.5">
                  {c.points.map((p, k) => (
                    <motion.li key={p} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + k * 0.08 }} className="flex gap-2.5 text-[14px] leading-snug text-ink-2"><span className="mt-[7px] w-1.5 h-1.5 rounded-full bg-brand shrink-0" />{p}</motion.li>
                  ))}
                  {c.more > 0 && <li><a href={`${SRC}/materi/${c.slug}`} className="ml-4 text-[12.5px] font-bold text-brand">+{c.more} topik lagi →</a></li>}
                </ul>
                {goals.length > 0 && (<>
                  <Eyebrow className="mt-5 mb-2 text-brand">{goalsLabel}</Eyebrow>
                  <ul className="space-y-1.5">
                    {goals.map((g, k) => <motion.li key={g} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 + k * 0.07 }} className="flex gap-2.5 text-[13px] leading-snug text-ink-2"><Check size={14} strokeWidth={3} className="mt-[3px] text-emerald-500 shrink-0" />{g}</motion.li>)}
                  </ul>
                </>)}
                <div className="mt-5 flex flex-wrap gap-1.5">
                  {stats.map(([Ic, t]) => <span key={t} className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full bg-brand-50 text-brand-700 text-[11.5px] font-bold"><Ic size={12} />{t}</span>)}
                </div>
                <div className="mt-auto pt-6 flex items-center gap-2">
                  <Btn as="a" href={`${SRC}/materi/${c.slug}`} size="md"><Play size={15} fill="currentColor" />Baca materi</Btn>
                  <span className="flex-1" />
                  <button onClick={() => go(i - 1, -1)} aria-label="Sebelumnya" className="w-10 h-10 rounded-xl border border-line bg-white grid place-items-center text-ink-2 hover:border-brand-100 hover:text-brand transition-colors"><ArrowLeft size={17} /></button>
                  <button onClick={() => go(i + 1, 1)} aria-label="Berikutnya" className="w-10 h-10 rounded-xl border border-line bg-white grid place-items-center text-ink-2 hover:border-brand-100 hover:text-brand transition-colors"><ArrowRight size={17} /></button>
                </div>
              </div>
            </motion.article>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
