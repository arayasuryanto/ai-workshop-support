'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import landing from '../../data/landing.json';
import { ArrowRight, Play, FlaskConical, Library, BookOpen, LayoutDashboard, LogIn } from 'lucide-react';
import { Aurora, Btn, Eyebrow, cx } from './ui';
import { Hero } from './LandingHero';
import { WorkshopContent } from './LandingContent';
import { Journey } from './LandingJourney';
import { useStore } from './core';

/* Landing — mirrors the source site's home (hero → 3 pilar → jadwal → 12 sesi → alur 5 langkah), restyled for PAM Jaya. */
export const SRC = ''; // links are relative inside the platform
const fade = { initial: { opacity: 0, y: 18 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: '-60px' }, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } };

function Header() {
  const [solid, setSolid] = useState(false);
  useEffect(() => { const f = () => setSolid(window.scrollY > 24); f(); addEventListener('scroll', f, { passive: true }); return () => removeEventListener('scroll', f); }, []);
  const links = [[`${SRC}/materi`, 'Workshop'], [`${SRC}/materi`, 'Materi'], [`${SRC}/dashboard`, 'Dashboard']];
  return (
    <header className="sticky top-0 z-40 px-4 pt-3 md:pt-4">
      <div className={cx('mx-auto max-w-[1180px] flex items-center gap-3 h-14 pl-3 pr-2 rounded-2xl border transition-all', solid ? 'glass border-white/70 shadow-soft' : 'border-transparent')}>
        <Link href="/" className="flex items-center gap-2.5 mr-2">
          <img src="/assets/pam-mark.png" alt="PAM Jaya" className="w-9 h-9 object-contain" />
          <span className="leading-tight"><b className="block text-[14.5px] font-extrabold tracking-tight">PAM Jaya <span className="text-brand">· Workshop AI</span></b><span className="hidden sm:block text-[11.5px] text-ink-3 font-medium">Gen AI for Business Productivity · BusinessFirst</span></span>
        </Link>
        <nav className="hidden md:flex items-center gap-1 ml-2">
          {links.map(([h, l]) => <a key={h} href={h} {...(h.startsWith('http') ? { target: '_self' } : {})} className="px-3.5 h-10 inline-flex items-center rounded-xl text-[14px] font-semibold text-ink-3 hover:text-ink transition-colors">{l}</a>)}
        </nav>
        <span className="flex-1" />
        <Btn as="a" href={`${SRC}/auth/login`} size="md" className="!h-10"><LogIn size={15} />Masuk</Btn>
      </div>
    </header>
  );
}

const ENTRY = [
  [`${SRC}/materi`, 'Materi workshop', '32 materi, dua hari + bacaan tambahan', BookOpen],
  [`${SRC}/prompt-library`, 'Prompt Library', 'Template prompt siap isi & salin', Library],
  [`${SRC}/case-study`, 'Case Study Tools', 'Fishbone, 5 Why, Pareto, Design Thinking', FlaskConical],
  [`${SRC}/dashboard`, 'Dashboard', 'Workshop Analysis & Judgement, pre/post-test', LayoutDashboard],
];
function Closing() {
  return (
    <motion.section {...fade} className="mt-16 md:mt-20 text-center">
      <Eyebrow className="text-brand">Siap mulai?</Eyebrow>
      <h2 className="mt-2 text-[28px] md:text-[38px] font-extrabold tracking-[-0.03em] leading-[1.05]">Semua materi, prompt, dan latihan<br className="hidden md:block" /> <span className="grad-text">sudah menunggu di dalam.</span></h2>
      <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-3 text-left">
        {ENTRY.map(([to, t, d, Ic], i) => (
          <motion.div key={to} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }} whileHover={{ y: -4 }}>
            <a href={to} className="group block h-full bg-white border border-line rounded-3xl p-5 shadow-soft hover:shadow-lift hover:border-brand-100 transition-[box-shadow,border-color]">
              <span className="w-11 h-11 rounded-2xl bg-brand-50 text-brand grid place-items-center group-hover:grad-btn group-hover:text-white transition-colors"><Ic size={20} /></span>
              <b className="block mt-4 text-[15.5px] font-extrabold tracking-tight">{t}</b>
              <span className="block mt-1 text-[13px] text-ink-3 leading-snug">{d}</span>
              <span className="mt-3 inline-flex items-center gap-1 text-[12.5px] font-bold text-brand">Buka<ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" /></span>
            </a>
          </motion.div>
        ))}
      </div>
      <div className="mt-8 flex justify-center">
        <motion.span whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} className="relative overflow-hidden rounded-2xl">
          <Btn as="a" href={`${SRC}/auth/login`} size="lg"><Play size={17} fill="currentColor" />Mulai Training</Btn>
          <motion.span className="pointer-events-none absolute inset-y-0 w-14 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-18deg]" initial={{ left: '-30%' }} animate={{ left: '130%' }} transition={{ delay: 1, duration: 1, repeat: Infinity, repeatDelay: 3.2 }} />
        </motion.span>
      </div>
    </motion.section>
  );
}

function Footer() {
  return (
    <footer className="mt-16 md:mt-20 border-t border-line pt-8 pb-10 flex flex-col md:flex-row md:items-center gap-4">
      <div className="flex items-center gap-3"><img src="/assets/pam-mark.png" alt="" className="w-8 h-8" /><span className="leading-tight"><b className="block text-[14.5px] font-extrabold tracking-tight">Gen AI for Business Productivity 2026</b><span className="block text-[12.5px] text-ink-3">In-House Training PAM Jaya × BusinessFirst</span></span></div>
      <span className="flex-1" />
      <p className="text-[12.5px] text-ink-4">© 2026 PAM Jaya × BusinessFirst · Platform praktik workshop.</p>
    </footer>
  );
}

export function Landing() {
  const L = landing;
  return (
    <div className="relative min-h-screen">
      <Aurora tone="blue" />
      <Header />
      <main className="relative z-10 mx-auto max-w-[1180px] px-4 md:px-6 pb-8">
        <div id="program"><Hero L={L} /></div>

        <WorkshopContent L={L} />

        <Journey L={L} />

        <Closing />

        <Footer />
      </main>
    </div>
  );
}
