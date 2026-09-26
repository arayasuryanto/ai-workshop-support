'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, animate } from 'motion/react';

export const cx = (...a) => a.filter(Boolean).join(' ');
const MC = new globalThis.Map();
const motionOf = (As) => { if (!MC.has(As)) MC.set(As, motion.create(As)); return MC.get(As); };

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

export const Eyebrow = ({ className, children }) => <div className={cx('text-[11.5px] font-bold uppercase tracking-[.14em] text-ink-4', className)}>{children}</div>;

export function Num({ value, className }) {
  const [v, setV] = useState(value);
  const prev = useRef(value);
  useEffect(() => { const c = animate(prev.current, value, { duration: 0.8, ease: 'easeOut', onUpdate: (x) => setV(Math.round(x)) }); prev.current = value; return () => c.stop(); }, [value]);
  return <span className={cx('tabular-nums', className)}>{v}</span>;
}

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
