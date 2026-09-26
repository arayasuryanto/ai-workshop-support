'use client';
import { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, UserCheck, Check } from 'lucide-react';
import { Eyebrow, Num, cx } from './ui';
import { KCOLOR } from './core';

/* Alur belajar as FLORA-style step cards: big numeral + name + a live mini visual per step + one-line cue.
   Step names are the source's five; cues paraphrase the pillar copy (no per-session mapping is claimed). */
const EASE = [0.22, 1, 0.36, 1];
const CUE = [
  'Cara kerja, kemampuan, dan batas Generative AI',
  'Petakan pekerjaan yang layak dibantu AI',
  'Latih prompt: PERAN · KONTEKS · TUGAS · BATASAN · FORMAT',
  'Terapkan pada use case nyata di unit kerja',
  'Rangkai jadi alur kerja AI personal yang dipakai tiap minggu',
];

function VUnderstand({ run }) {
  const L = [['AI', 112, 'bg-brand-50 border-brand-100'], ['ML', 80, 'bg-brand-100/70 border-brand-200'], ['GenAI', 48, 'grad-btn border-transparent text-white shadow-glow']];
  return (
    <div className="relative w-[112px] h-[112px] mx-auto">
      {L.map(([t, s, c], i) => (
        <motion.span key={t + run} className={cx('absolute rounded-full border grid place-items-end pb-1 text-[10px] font-extrabold text-brand-700', c)} style={{ width: s, height: s, left: (112 - s) / 2, top: (112 - s) / 2 }}
          initial={{ scale: 0.3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: i * 0.15, type: 'spring', stiffness: 220, damping: 18 }}>{i < 2 ? t : ''}</motion.span>
      ))}
      <motion.span key={'c' + run} className="absolute inset-0 grid place-items-center text-white text-[10px] font-extrabold" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>GenAI</motion.span>
    </div>
  );
}
function VExplore({ run }) {
  const dots = [[0.25, 0.7, 0], [0.7, 0.3, 0], [0.8, 0.8, 1], [0.35, 0.3, 0], [0.62, 0.72, 1]];
  return (
    <div className="relative w-[128px] h-[112px] mx-auto">
      <span className="absolute left-5 right-0 top-0 bottom-5 rounded-xl border border-line bg-white" />
      <span className="absolute left-5 right-0 top-0 bottom-5 grid grid-cols-2 grid-rows-2"><i className="border-r border-b border-dashed border-line" /><i className="border-b border-dashed border-line bg-brand-50/70 rounded-tr-xl" /><i className="border-r border-dashed border-line" /><i /></span>
      <span className="absolute left-0 top-0 bottom-5 w-4 text-[8px] font-bold uppercase tracking-wider text-ink-4 [writing-mode:vertical-rl] rotate-180 text-center">Beban waktu</span>
      <span className="absolute left-5 right-0 bottom-0 h-4 text-[8px] font-bold uppercase tracking-wider text-ink-4 text-center">Frekuensi</span>
      {dots.map(([x, y, hot], i) => (
        <motion.span key={i + 'd' + run} className={cx('absolute w-3 h-3 rounded-full', hot ? 'grad-btn shadow-glow' : 'bg-brand-200')} style={{ left: 20 + x * 100, top: (1 - y) * 84 }}
          initial={{ scale: 0, opacity: 0 }} animate={{ scale: hot ? [1, 1.35, 1] : 1, opacity: 1 }} transition={{ delay: 0.1 + i * 0.12, scale: { delay: 0.1 + i * 0.12, duration: hot ? 1.6 : 0.4, repeat: hot ? Infinity : 0 } }} />
      ))}
    </div>
  );
}
function VPractice({ run }) {
  const K = ['peran', 'konteks', 'tugas', 'batasan', 'format'];
  return (
    <div className="w-[136px] mx-auto">
      <div className="rounded-xl bg-ink p-2.5 space-y-1.5">
        {K.map((k, i) => (
          <div key={k + run} className="flex items-center gap-1.5">
            <span className="w-[42px] text-[8px] font-extrabold uppercase" style={{ color: KCOLOR[k] }}>{k}</span>
            <motion.span className="h-1.5 rounded-full origin-left" style={{ background: KCOLOR[k], width: [70, 52, 62, 58, 44][i] }} initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.15 + i * 0.16, duration: 0.5, ease: EASE }} />
          </div>
        ))}
      </div>
      <div className="mt-2 flex items-center gap-1.5"><span className="text-[9px] font-bold text-ink-4">Kekuatan</span><span className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden"><motion.span key={'m' + run} className="block h-full grad-btn" initial={{ width: '0%' }} animate={{ width: '100%' }} transition={{ delay: 0.3, duration: 1, ease: EASE }} /></span><span className="text-[9px] font-extrabold text-brand">5/5</span></div>
    </div>
  );
}
function VApply({ run }) {
  const F = ['Operasional', 'Pelayanan', 'SDM', 'Keuangan', 'Humas', 'Pengadaan'];
  return (
    <div className="w-[150px] mx-auto">
      <div className="flex flex-wrap gap-1 justify-center">
        {F.map((f, i) => <motion.span key={f + run} className={cx('h-5 px-2 rounded-full text-[9px] font-bold', i === 1 ? 'grad-btn text-white shadow-glow' : 'bg-brand-50 text-brand-700')} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>{f}</motion.span>)}
      </div>
      <motion.div key={'b' + run} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="mt-2 rounded-xl bg-white border border-line p-2 text-[9px] leading-snug text-ink-2 shadow-soft">
        <span className="font-extrabold text-brand">Draft balasan</span> keluhan air keruh — <span className="px-1 rounded bg-amber-50 text-amber-700 font-bold">[PERLU DILENGKAPI]</span> nomor tiket
      </motion.div>
    </div>
  );
}
function VIntegrate({ run }) {
  const N = [['1', 'Data'], [Sparkles, 'AI'], [UserCheck, 'Cek'], [Check, 'Kirim']];
  return (
    <div className="relative w-[164px] mx-auto pt-1">
      <span className="absolute left-4 right-4 top-[17px] h-[2px] bg-brand-100" />
      <motion.span key={'p' + run} className="absolute top-[13px] w-2.5 h-2.5 rounded-full grad-btn shadow-glow" initial={{ left: 14 }} animate={{ left: [14, 140] }} transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.3 }} />
      <div className="relative grid grid-cols-4">
        {N.map(([Ic, t], i) => (
          <motion.div key={t + run} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.12 }} className="flex flex-col items-center gap-1">
            <span className={cx('w-8 h-8 rounded-xl grid place-items-center border text-[10px] font-extrabold', i === 2 ? 'bg-amber-50 border-amber-200 text-amber-600' : i === 3 ? 'grad-btn border-transparent text-white' : 'bg-white border-brand-100 text-brand')}>{typeof Ic === 'string' ? Ic : <Ic size={14} />}</span>
            <span className="text-[9px] font-bold text-ink-3">{t}</span>
          </motion.div>
        ))}
      </div>
      <p className="mt-1.5 text-center text-[9px] text-ink-4">titik kontrol manusia tetap ada</p>
    </div>
  );
}
const VIS = [VUnderstand, VExplore, VPractice, VApply, VIntegrate];

export function Journey({ L }) {
  const J = L.journey; const [runs, setRuns] = useState([0, 0, 0, 0, 0]);
  const replay = (i) => setRuns((r) => r.map((v, k) => (k === i ? v + 1 : v)));
  return (
    <section id="alur" className="mt-24 md:mt-32 scroll-mt-24">
      <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.5, ease: EASE }} className="text-center max-w-3xl mx-auto">
        <Eyebrow className="text-brand">Alur belajar</Eyebrow>
        <h2 className="mt-2 text-[30px] md:text-[42px] leading-[1.05] font-extrabold tracking-[-0.035em]">{J.title.replace(' to Applying AI at Work', '')}<br className="hidden md:block" /> <span className="grad-text">to Applying AI at Work</span></h2>
        <p className="mt-4 text-[15px] md:text-[15.5px] leading-relaxed text-ink-3">{J.lead}</p>
        <div className="mt-5 flex flex-wrap justify-center gap-2.5">
          {J.stats.map(([a, b]) => <span key={a} className="inline-flex items-baseline gap-1.5 h-10 px-3.5 rounded-xl bg-white border border-line shadow-soft"><b className="text-[18px] font-extrabold text-ink tabular-nums"><Num value={parseInt(a)} /> {a.replace(/^\d+\s*/, '')}</b><span className="text-[12.5px] text-ink-3">{b}</span></span>)}
        </div>
      </motion.div>

      <div className="mt-8 md:mt-10 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {J.steps.map((st, i) => { const V = VIS[i]; return (
          <motion.div key={st} initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }} transition={{ delay: i * 0.09, duration: 0.55, ease: EASE }}
            whileHover={{ y: -6 }} onMouseEnter={() => replay(i)} onViewportEnter={() => replay(i)}
            className="group relative flex flex-col bg-white border border-line rounded-3xl p-5 shadow-soft hover:shadow-lift hover:border-brand-100 transition-[box-shadow,border-color]">
            <div className="flex items-baseline gap-2">
              <span className="text-[44px] leading-none font-extrabold tracking-[-0.05em] grad-text">{String(i + 1).padStart(2, '0')}</span>
              <span className="text-[19px] font-extrabold tracking-tight">{st}</span>
            </div>
            <div className="mt-4 h-[150px] rounded-2xl bg-paper border border-line/70 grid place-items-center overflow-hidden group-hover:bg-brand-50/40 transition-colors"><V run={runs[i]} /></div>
            <p className="mt-4 text-[13px] leading-relaxed text-ink-3">{CUE[i]}</p>
            {i < 4 && <span className="hidden lg:block absolute -right-[13px] top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-white border border-line text-ink-4 text-[11px] grid place-items-center">→</span>}
          </motion.div>
        ); })}
      </div>
    </section>
  );
}
