import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { X, List, ALargeSmall, ArrowLeft, ArrowRight, Check, Clock, FlaskConical, Zap, FileDown, Lightbulb, Play } from 'lucide-react';
import { useData, Btn, Eyebrow, Tag, PromptCard, CopyBtn, AIButtons, Aurora, cx } from '../components/ui';
import { store, useStore, once, addXP, shortTitle, stepsOf, goalsOf, isPromptBlock, remixToFields, level } from '../lib/core';

/* ── content blocks ── */
export function Blocks({ blocks, onRemix }) {
  return blocks.map((b, i) => <Block key={i} b={b} onRemix={onRemix} />);
}
function Block({ b, onRemix }) {
  switch (b.type) {
    case 'text': return <p>{b.text}</p>;
    case 'subheading': return b.level >= 4 ? <h4>{b.text}</h4> : <h3>{b.text}</h3>;
    case 'list': return b.ordered ? <ol>{b.items.map((x, i) => <li key={i}>{x}</li>)}</ol> : <ul>{b.items.map((x, i) => <li key={i}>{x}</li>)}</ul>;
    case 'table': return <Table rows={b.rows} />;
    case 'quote': case 'code':
      if (isPromptBlock(b)) return <PromptCard text={b.text} onRemix={onRemix} />;
      return (
        <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="my-6 flex gap-3 rounded-3xl p-5 bg-gradient-to-br from-sky-50 to-brand-50/60 border border-sky-100">
          <span className="w-9 h-9 rounded-xl bg-white grid place-items-center text-brand shrink-0 shadow-soft"><Lightbulb size={18} /></span>
          <p className="!mb-0 !text-[15.5px] !text-ink-2">{b.text}</p>
        </motion.div>
      );
    default: return null;
  }
}
function Table({ rows }) {
  if (!rows || !rows.length) return null;
  const [h, ...r] = rows;
  if (h.length === 2 && /lemah|sebelum|buruk|kurang/i.test(h[0]) && /kuat|sesudah|baik/i.test(h[1]) && r.length) return <Flip h={h} rows={r} />;
  return (
    <div className="my-6 rounded-3xl border border-line bg-white shadow-soft overflow-x-auto scroll-thin">
      <table className="w-full text-[14px] min-w-[520px]">
        <thead><tr>{h.map((c, i) => <th key={i} className="text-left px-4 py-3 bg-paper text-[12px] font-bold uppercase tracking-wider text-ink-3 border-b border-line">{c}</th>)}</tr></thead>
        <tbody>{r.map((row, i) => <tr key={i} className="border-b border-line last:border-0 hover:bg-brand-50/30">{row.map((c, j) => <td key={j} className={cx('px-4 py-3 align-top leading-relaxed', j ? 'text-ink-2' : 'font-bold text-ink')}>{c}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}
function Flip({ h, rows }) {
  const [open, setOpen] = useState({});
  return (
    <div className="my-6 space-y-3">
      {rows.map((row, k) => (
        <div key={k} className="rounded-3xl border border-line bg-white shadow-soft overflow-hidden">
          <div className="p-5">
            <div className="flex items-center gap-2 mb-2"><span className="w-6 h-6 rounded-full bg-rose-50 text-rose-500 grid place-items-center"><X size={14} strokeWidth={3} /></span><span className="text-[12px] font-extrabold uppercase tracking-wider text-rose-500">{h[0]}</span><span className="text-[12px] text-ink-4 font-semibold">{k + 1}/{rows.length}</span></div>
            <p className="!mb-0 font-mono !text-[14px] !text-ink-2">{row[0]}</p>
            {!open[k] && <Btn size="sm" className="mt-4" onClick={(e) => { setOpen({ ...open, [k]: true }); once('flip:' + row[1].slice(0, 40), 3, e.currentTarget); }}><Zap size={15} fill="currentColor" />Perkuat prompt ini</Btn>}
          </div>
          <AnimatePresence>
            {open[k] && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 26 }}
                className="border-t border-emerald-100 bg-gradient-to-b from-emerald-50/80 to-white">
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2"><span className="w-6 h-6 rounded-full bg-mint text-white grid place-items-center"><Check size={14} strokeWidth={3} /></span><span className="text-[12px] font-extrabold uppercase tracking-wider text-emerald-600">{h[1]}</span></div>
                  <p className="!mb-3 font-mono !text-[14px] !text-ink">{row[1]}</p>
                  <div className="flex flex-wrap gap-2"><CopyBtn get={() => row[1]} label="Salin versi kuat" /><AIButtons get={() => row[1]} /></div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

/* ── player ── */
export function Player() {
  const { slug, step } = useParams(); const nav = useNavigate(); const { P, all } = useData();
  const s = P.sessions[slug]; const steps = s ? stepsOf(s) : []; const k = Math.max(0, Math.min(steps.length - 1, +(step || 0)));
  const vis = useStore('vis:' + slug, []); const big = useStore('big', false);
  const [outline, setOutline] = useState(false); const [dir, setDir] = useState(1); const [done, setDone] = useState(false);
  const prev = useRef(k);
  useEffect(() => { setDir(k >= prev.current ? 1 : -1); prev.current = k; window.scrollTo({ top: 0 }); }, [k]);
  useEffect(() => {
    if (!s) return;
    if (!vis.includes(k)) { store.set('vis:' + slug, [...vis, k]); if (k > 0) once(`step:${slug}:${k}`, 5, document.getElementById('nx')); }
  }, [slug, k]);
  const go = (i) => nav(`/sesi/${slug}/${i}`);
  const last = k === steps.length - 1;
  useEffect(() => {
    const f = (e) => { if (/INPUT|TEXTAREA/.test(document.activeElement.tagName)) return;
      if (e.key === 'ArrowRight' && !last) go(k + 1); if (e.key === 'ArrowLeft' && k > 0) go(k - 1); if (e.key === 'Escape') nav('/'); };
    addEventListener('keydown', f); return () => removeEventListener('keydown', f);
  }, [k, last]);
  if (!s) return null;
  const remix = (text) => { store.set('builder', remixToFields(text)); nav('/lab/prompt'); };
  const finish = () => {
    const d = new Set(store.get('done', [])); const fresh = !d.has(slug); d.add(slug); store.set('done', [...d]);
    if (fresh) addXP(50, document.getElementById('nx'));
    setDone({ fresh });
    const shoot = (o) => confetti({ particleCount: 90, spread: 75, startVelocity: 45, colors: ['#0256f4', '#22b8f5', '#10b981', '#f59e0b', '#ffffff'], ...o });
    shoot({ origin: { x: 0.2, y: 0.7 }, angle: 60 }); shoot({ origin: { x: 0.8, y: 0.7 }, angle: 120 });
  };
  const st = steps[k];
  return (
    <div className={cx('relative min-h-screen', big && 'big')}>
      <Aurora tone="blue" />
      <div className="sticky top-0 z-40 glass border-b border-line/70">
        <div className="max-w-[860px] mx-auto flex items-center gap-3 px-4 h-16">
          <Btn as={Link} to="/peta" variant="ghost" size="sm" className="!w-10 !px-0" aria-label="Tutup"><X size={18} /></Btn>
          <Btn variant="ghost" size="sm" className="!w-10 !px-0" onClick={() => setOutline(true)} aria-label="Daftar langkah"><List size={18} /></Btn>
          <div className="flex-1 flex gap-1.5">
            {steps.map((_, i) => (
              <button key={i} onClick={() => go(i)} className="relative flex-1 h-2 rounded-full bg-slate-200/80 overflow-hidden" aria-label={`Langkah ${i}`}>
                {(vis.includes(i) || i === k) && <motion.span layout className={cx('absolute inset-0 rounded-full', i === k ? 'grad-btn' : 'bg-emerald-400')} initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} style={{ originX: 0 }} />}
              </button>
            ))}
          </div>
          <span className="hidden sm:block text-[13px] font-bold text-ink-3 tabular-nums">{k}/{steps.length - 1}</span>
          <Btn variant="ghost" size="sm" className="!w-10 !px-0" onClick={() => store.set('big', !big)} aria-label="Ukuran teks"><ALargeSmall size={18} /></Btn>
        </div>
      </div>

      <AnimatePresence mode="wait" custom={dir}>
        <motion.main key={k} custom={dir} initial={{ opacity: 0, x: 40 * dir }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 * dir }}
          transition={{ type: 'spring', stiffness: 300, damping: 32 }} className="relative z-10 max-w-[760px] mx-auto px-5 pt-8 pb-40 prose-lab">
          {st.intro ? <Intro s={s} slug={slug} steps={steps} />
            : st.role === 'summary' ? <Summary st={st} onRemix={remix} />
            : <Section st={st} k={k} n={steps.length - 1} slug={slug} onRemix={remix} />}
        </motion.main>
      </AnimatePresence>

      <div className="fixed bottom-0 inset-x-0 z-30 pb-safe" style={{ background: 'linear-gradient(180deg,rgba(255,255,255,0),#fff 38%)' }}>
        <div className="max-w-[760px] mx-auto flex gap-3 px-5 pt-8 pb-5">
          {k > 0 && <Btn variant="ghost" size="lg" className="!w-14 !px-0" onClick={() => go(k - 1)} aria-label="Sebelumnya"><ArrowLeft size={20} /></Btn>}
          <Btn id="nx" size="lg" variant={last ? 'success' : 'primary'} className="flex-1" onClick={() => (last ? finish() : go(k + 1))}>
            {last ? <><Check size={19} strokeWidth={3} />Selesaikan sesi</> : k === 0 ? <>Mulai belajar<ArrowRight size={19} /></> : <>Lanjut<ArrowRight size={19} /></>}
          </Btn>
        </div>
      </div>

      <AnimatePresence>
        {outline && (
          <>
            <motion.div className="fixed inset-0 z-50 bg-ink/30 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOutline(false)} />
            <motion.aside className="fixed left-0 top-0 bottom-0 z-50 w-[330px] max-w-[88vw] bg-white shadow-lift p-5 overflow-auto"
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', stiffness: 320, damping: 34 }}>
              <Eyebrow className="mb-1">Isi sesi</Eyebrow><h3 className="text-lg font-extrabold leading-snug mb-4">{shortTitle(s.title)}</h3>
              {steps.map((x, i) => (
                <button key={i} onClick={() => { setOutline(false); go(i); }} className={cx('w-full flex gap-3 items-start text-left p-2.5 rounded-2xl mb-1 text-[14px] font-semibold', i === k ? 'bg-brand-50 text-brand-700' : 'text-ink-2 hover:bg-paper')}>
                  <span className={cx('w-6 h-6 rounded-full grid place-items-center text-[11px] font-extrabold shrink-0', vis.includes(i) ? 'bg-mint text-white' : 'bg-slate-100 text-ink-3')}>{vis.includes(i) ? <Check size={13} strokeWidth={3} /> : i}</span>
                  {x.intro ? 'Pembuka & tujuan' : x.heading || 'Bagian ' + i}
                </button>
              ))}
              <Btn as="a" href={`pdf/${slug}.pdf`} target="_blank" variant="soft" className="w-full mt-4"><FileDown size={17} />Unduh PDF modul</Btn>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>{done && <Celebrate slug={slug} fresh={done.fresh} onClose={() => setDone(false)} />}</AnimatePresence>
    </div>
  );
}

function Intro({ s, slug, steps }) {
  const got = useStore('goals:' + slug, []);
  const toggle = (i) => store.set('goals:' + slug, got.includes(i) ? got.filter((x) => x !== i) : [...got, i]);
  return (
    <>
      <motion.div initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="h-[200px] md:h-[250px] rounded-4xl bg-cover bg-center shadow-lift mb-7" style={{ backgroundImage: `url('${s.image}')` }} />
      <div className="flex flex-wrap gap-2 mb-4">
        <Tag tone="blue">{s.number ? `Sesi ${s.number} · Hari ${s.day}` : 'Materi pendukung'}</Tag>
        <Tag tone="violet">{s.read_min || 5} mnt · {steps.length - 1} langkah</Tag>
      </div>
      <h1 className="text-[32px] md:text-[42px] leading-[1.08] font-extrabold tracking-[-0.03em] mb-3">{shortTitle(s.title)}</h1>
      <p className="!text-[17px] !text-ink-3">{s.subtitle}</p>
      {goalsOf(s).length > 0 && (
        <div className="mt-6 rounded-4xl border border-line bg-white shadow-soft p-5">
          <Eyebrow className="mb-3">Yang akan Anda kuasai · ketuk yang sudah Anda yakini</Eyebrow>
          {goalsOf(s).map((g, i) => (
            <motion.button key={i} whileTap={{ scale: 0.98 }} onClick={() => toggle(i)} className="w-full flex items-start gap-3 text-left py-3 border-b border-dashed border-line last:border-0">
              <motion.span animate={got.includes(i) ? { scale: [1, 1.25, 1] } : {}} className={cx('w-6 h-6 rounded-lg grid place-items-center shrink-0 mt-0.5 border-2 transition-colors', got.includes(i) ? 'bg-mint border-mint text-white' : 'border-slate-300 text-transparent')}><Check size={14} strokeWidth={3} /></motion.span>
              <span className={cx('text-[15.5px] leading-relaxed', got.includes(i) ? 'text-ink' : 'text-ink-2')}>{g}</span>
            </motion.button>
          ))}
        </div>
      )}
    </>
  );
}
function Section({ st, k, n, slug, onRemix }) {
  const isPrac = st.role === 'practice' || /latihan|praktik|tantangan/i.test(st.heading || '');
  return (
    <>
      <Eyebrow className="text-brand mb-2">Langkah {k} dari {n}{isPrac ? ' · Latihan' : ''}</Eyebrow>
      <h2 className="text-[26px] md:text-[32px] leading-tight font-extrabold tracking-[-0.025em] mb-6">{st.heading}</h2>
      <Blocks blocks={st.blocks} onRemix={onRemix} />
      {isPrac && <Practice st={st} k={k} slug={slug} />}
    </>
  );
}
function Practice({ st, k, slug }) {
  const mins = +(((st.heading || '').match(/(\d+)\s*menit/) || [])[1] || 0);
  const note = useStore(`note:${slug}:${k}`, ''); const [left, setLeft] = useState(null);
  useEffect(() => { if (left == null || left <= 0) return; const t = setTimeout(() => setLeft(left - 1), 1000); return () => clearTimeout(t); }, [left]);
  return (
    <div className="mt-8 rounded-4xl p-5 border-2 border-dashed border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50/40">
      <div className="flex flex-wrap items-center gap-3 mb-3">
        <span className="w-10 h-10 rounded-2xl bg-amber-400 text-white grid place-items-center"><FlaskConical size={19} /></span>
        <b className="text-[16px]">Kerjakan sekarang</b><span className="flex-1" />
        {mins > 0 && (left == null ? <Btn size="sm" variant="dark" onClick={() => setLeft(mins * 60)}><Play size={14} fill="currentColor" />Mulai {mins} menit</Btn>
          : <span className={cx('font-extrabold tabular-nums text-[18px]', left ? 'text-amber-600' : 'text-rose-500')}>{left ? `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}` : 'Waktu habis'}</span>)}
      </div>
      <textarea rows={5} value={note} onChange={(e) => store.set(`note:${slug}:${k}`, e.target.value)} placeholder="Tulis prompt atau hasil latihan Anda di sini — tersimpan otomatis di perangkat ini."
        className="w-full rounded-2xl border border-amber-200 bg-white p-4 text-[15px] leading-relaxed outline-none focus:ring-4 focus:ring-amber-200/60 resize-y" />
      <div className="flex flex-wrap gap-2 mt-3"><CopyBtn get={() => note} label="Salin tulisan saya" variant="ghost" sub="Tulisan Anda tersalin" /><AIButtons get={() => note} /></div>
    </div>
  );
}
function Summary({ st, onRemix }) {
  const items = st.blocks.filter((b) => b.type === 'list').flatMap((b) => b.items);
  return (
    <>
      <Eyebrow className="text-emerald-600 mb-2">Rangkuman</Eyebrow>
      <h2 className="text-[26px] md:text-[32px] leading-tight font-extrabold tracking-[-0.025em] mb-6">{st.heading || 'Rangkuman Sesi'}</h2>
      <Blocks blocks={st.blocks.filter((b) => b.type !== 'list')} onRemix={onRemix} />
      <div className="space-y-3">
        {items.map((x, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
            className="flex gap-4 p-4 rounded-3xl bg-white border border-line shadow-soft">
            <span className="w-9 h-9 rounded-2xl grad-btn text-white grid place-items-center text-[13px] font-extrabold shrink-0">{i + 1}</span>
            <span className="text-[15.5px] leading-relaxed text-ink-2 pt-1">{x}</span>
          </motion.div>
        ))}
      </div>
    </>
  );
}
function Celebrate({ slug, fresh, onClose }) {
  const { P, all } = useData(); const xp = useStore('xp', 0);
  const d = new Set(useStore('done', [])); const next = all.find((x) => !d.has(x)); const ns = next && P.sessions[next];
  return (
    <motion.div className="fixed inset-0 z-[70] grid place-items-center p-5 bg-white/80 backdrop-blur-xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div initial={{ y: 30, scale: 0.9 }} animate={{ y: 0, scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 22 }} className="w-full max-w-[420px] text-center">
        <motion.div initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 14, delay: 0.1 }}
          className="w-28 h-28 mx-auto mb-6 rounded-full bg-gradient-to-b from-emerald-400 to-emerald-500 text-white grid place-items-center shadow-[0_0_0_14px_rgba(16,185,129,.12),0_0_0_30px_rgba(16,185,129,.06)]">
          <Check size={56} strokeWidth={3} />
        </motion.div>
        <h2 className="text-[30px] font-extrabold tracking-tight">Sesi selesai!</h2>
        <p className="mt-1 mb-6 font-extrabold text-amber-500 text-lg">{fresh ? '+50 XP' : 'Diulang — XP sudah tercatat'} · Level {level(xp).lv}</p>
        {ns && (
          <Link to={`/sesi/${next}/0`} onClick={onClose} className="flex items-center gap-3 p-3 rounded-3xl bg-white border border-line shadow-soft text-left mb-3 hover:shadow-lift transition-shadow">
            <span className="w-20 h-14 rounded-2xl bg-cover bg-center shrink-0" style={{ backgroundImage: `url('${ns.image}')` }} />
            <span><Eyebrow>Berikutnya</Eyebrow><b className="block text-[14.5px] leading-snug">{shortTitle(ns.title)}</b><span className="text-[12px] text-ink-3">{ns.read_min || 5} mnt · {stepsOf(ns).length - 1} langkah</span></span>
          </Link>
        )}
        {ns ? <Btn as={Link} to={`/sesi/${next}/0`} onClick={onClose} size="lg" className="w-full">Lanjut ke sesi berikutnya<ArrowRight size={18} /></Btn>
          : <Btn as={Link} to="/latihan" size="lg" className="w-full">Uji diri di Latihan Soal</Btn>}
        <div className="grid grid-cols-2 gap-3 mt-3">
          <Btn as="a" href={`pdf/${slug}.pdf`} target="_blank" variant="ghost"><FileDown size={16} />PDF modul</Btn>
          <Btn as={Link} to="/peta" variant="ghost">Ke peta</Btn>
        </div>
      </motion.div>
    </motion.div>
  );
}
