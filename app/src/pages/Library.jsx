import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useParams } from 'react-router-dom';
import { Search, ArrowLeft, Zap, Sparkles, Check, ChevronUp } from 'lucide-react';
import { useData, Btn, Card, Eyebrow, Page, PageHead, Ring, CopyBtn, AIButtons, Chip, Tag, cx } from '../components/ui';
import { store, useStore, fieldLabel, fillTemplate, templateParts } from '../lib/core';

const desc = (t) => (t.page_text || []).find((x) => x.length > 50 && !/^Contoh/.test(x)) || '';
const CAT_TONE = ['blue', 'sky', 'green', 'amber'];

export function Library() {
  const { P } = useData(); const lib = P.tools.prompt_library, cs = P.tools.case_study;
  const tab = useStore('ltab', 'lib'); const [cat, setCat] = useState(''); const [q, setQ] = useState(''); const inp = useRef();
  const cats = [...new Set(lib.map((p) => p.category).filter(Boolean))];
  useEffect(() => { const f = (e) => { if (e.key === '/' && document.activeElement.tagName !== 'INPUT') { e.preventDefault(); inp.current?.focus(); } }; addEventListener('keydown', f); return () => removeEventListener('keydown', f); }, []);
  const list = useMemo(() => {
    const src = tab === 'lib' ? lib.filter((p) => !cat || p.category === cat) : cs, ql = q.toLowerCase();
    return src.filter((p) => !ql || (p.title + ' ' + (p.category || '') + ' ' + (p.page_text || []).join(' ')).toLowerCase().includes(ql));
  }, [tab, cat, q]);
  return (
    <Page>
      <PageHead eyebrow="Pustaka prompt" title={<><span className="grad-text">{lib.length + cs.length} prompt</span> siap isi.</>}
        sub="Pilih → isi → lihat prompt terbentuk → kirim ke AI Anda. Alurnya sama dengan situs workshop; bedanya Anda melihat hasilnya sebelum menyalin." />
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex-1 min-w-[260px] flex items-center gap-3 h-[52px] px-4 rounded-2xl bg-white border border-line shadow-soft focus-within:border-brand focus-within:ring-4 focus-within:ring-brand/10 transition">
          <Search size={19} className="text-ink-4" /><input ref={inp} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari: ringkas, email, analisis, pelanggan…" className="flex-1 bg-transparent outline-none text-[15px] min-w-0" />
          <kbd className="hidden md:block text-[11px] font-bold text-ink-4 border border-line rounded-md px-1.5">/</kbd>
        </label>
        <div className="inline-flex p-1 rounded-2xl bg-slate-100/80 border border-line">
          {[['lib', 'Pustaka', lib.length], ['cs', 'Studi kasus', cs.length]].map(([k, l, n]) => (
            <button key={k} onClick={() => { store.set('ltab', k); setCat(''); }} className={cx('relative h-10 px-4 rounded-xl text-[14px] font-bold', tab === k ? 'text-ink' : 'text-ink-3')}>
              {tab === k && <motion.span layoutId="libtab" className="absolute inset-0 bg-white rounded-xl shadow-soft" transition={{ type: 'spring', stiffness: 500, damping: 38 }} />}
              <span className="relative">{l} <span className="text-ink-4 text-[12px]">{n}</span></span>
            </button>
          ))}
        </div>
      </div>
      {tab === 'lib' && (
        <div className="flex gap-2 mt-4 overflow-x-auto no-scrollbar pb-1">
          <Chip on={!cat} onClick={() => setCat('')}>Semua</Chip>
          {cats.map((c) => <Chip key={c} on={c === cat} onClick={() => setCat(c)} className="shrink-0">{c} <span className="text-ink-4 ml-0.5">{lib.filter((p) => p.category === c).length}</span></Chip>)}
        </div>
      )}
      <motion.div layout className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        <AnimatePresence mode="popLayout">
          {list.map((p, i) => { const id = tab === 'lib' ? String(p.id) : 'cs-' + p.slug; return (
            <motion.div key={id} layout initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1, transition: { delay: Math.min(i, 12) * 0.02 } }} exit={{ opacity: 0, scale: 0.96 }}>
              <LibCard p={p} id={id} isCase={tab !== 'lib'} tone={CAT_TONE[cats.indexOf(p.category) % 4]} />
            </motion.div>); })}
        </AnimatePresence>
      </motion.div>
      {!list.length && <p className="text-center text-ink-4 py-16">Tidak ada prompt yang cocok.</p>}
    </Page>
  );
}
function LibCard({ p, id, isCase, tone }) {
  const used = useStore('vals:' + id, []).some((x) => (x || '').trim());
  return (
    <Link to={`/prompt/${id}`} className="group h-full flex flex-col gap-2.5 p-5 rounded-3xl bg-white border border-line shadow-soft hover:shadow-lift hover:-translate-y-1 hover:border-brand-100 transition-all">
      <div className="flex items-center gap-1.5">{isCase ? <Tag tone="green">Studi kasus PAM Jaya</Tag> : <Tag tone={tone}>{p.category}</Tag>}{p.level && <Tag tone="amber">{p.level}</Tag>}
        {used && <span className="ml-auto inline-flex items-center gap-1 text-[11.5px] font-bold text-emerald-600"><Check size={13} strokeWidth={3} />terisi</span>}</div>
      <h3 className="text-[16.5px] font-extrabold leading-snug tracking-tight group-hover:text-brand-700 transition-colors">{p.title}</h3>
      <p className="text-[13.5px] text-ink-3 leading-relaxed line-clamp-2 flex-1">{desc(p)}</p>
      <div className="flex flex-wrap gap-1.5">
        {p.fields.length ? <>{p.fields.slice(0, 3).map((f, i) => <span key={i} className="text-[11.5px] font-semibold text-amber-700 bg-amber-50 rounded-lg px-2 py-0.5 max-w-full truncate">{fieldLabel(f).slice(0, 26)}</span>)}{p.fields.length > 3 && <span className="text-[11.5px] font-semibold text-ink-4 px-1">+{p.fields.length - 3}</span>}</>
          : <span className="text-[11.5px] font-semibold text-emerald-700 bg-emerald-50 rounded-lg px-2 py-0.5">langsung salin</span>}
      </div>
    </Link>
  );
}

export function Tool() {
  const { id } = useParams(); const { P } = useData(); const isCase = id.startsWith('cs-');
  const t = isCase ? P.tools.case_study.find((c) => 'cs-' + c.slug === id) : P.tools.prompt_library.find((p) => String(p.id) === id);
  const vals = useStore('vals:' + id, []); const [focus, setFocus] = useState(null); const refs = useRef({}); const prevRef = useRef(); const [sent, setSent] = useState(false);
  if (!t) return null;
  const fields = t.fields, n = fields.length, filled = fields.filter((_, k) => (vals[k] || '').trim()).length, p = n ? filled / n : 1;
  const set = (k, v) => { const a = [...store.get('vals:' + id, [])]; a[k] = v; store.set('vals:' + id, a); };
  const hasEx = fields.some((f) => /^contoh\s*:/i.test(f.placeholder || ''));
  const text = () => { setSent(true); return fillTemplate(t.template, fields, vals); };
  const parts = templateParts(t.template, fields);
  const steps = [['Isi formulir', p === 1], ['Periksa pratinjau', p === 1], ['Kirim ke AI', sent]];
  return (
    <Page>
      <Link to="/prompt" className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-ink-3 hover:text-ink mb-4"><ArrowLeft size={16} />Pustaka prompt</Link>
      <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] gap-6 items-start">
        <Card className="p-6">
          <div className="flex gap-1.5">{isCase ? <Tag tone="green">Studi kasus PAM Jaya</Tag> : <Tag tone="blue">{t.category}</Tag>}{t.level && <Tag tone="amber">{t.level}</Tag>}</div>
          <h1 className="text-[26px] md:text-[30px] leading-tight font-extrabold tracking-[-0.02em] mt-3">{t.title}</h1>
          <p className="text-[15px] text-ink-3 mt-2 leading-relaxed">{desc(t)}</p>
          <div className="flex flex-wrap gap-4 mt-5 mb-5">
            {steps.map(([l, ok], i) => (
              <span key={l} className={cx('inline-flex items-center gap-2 text-[13px] font-semibold', ok ? 'text-ink' : 'text-ink-4')}>
                <motion.span animate={{ scale: ok ? [1, 1.25, 1] : 1 }} className={cx('w-6 h-6 rounded-full grid place-items-center text-[11px] font-extrabold', ok ? 'bg-mint text-white' : 'bg-slate-100 text-ink-3')}>{ok ? <Check size={13} strokeWidth={3.5} /> : i + 1}</motion.span>{l}
              </span>
            ))}
          </div>
          {hasEx && <Btn variant="soft" size="sm" className="mb-5" onClick={() => fields.forEach((f, k) => { if (/^contoh\s*:/i.test(f.placeholder || '')) set(k, f.placeholder.replace(/^contoh\s*:\s*/i, '').replace(/\.\.\.$/, '')); })}><Zap size={15} fill="currentColor" />Pakai contoh kasus</Btn>}
          {n ? fields.map((f, k) => (
            <div key={k} className="mb-5 last:mb-0">
              <label className="flex items-center gap-2 font-bold text-[14px] mb-2">{fieldLabel(f)}
                <AnimatePresence>{(vals[k] || '').trim() && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="w-5 h-5 rounded-full bg-mint text-white grid place-items-center"><Check size={12} strokeWidth={3.5} /></motion.span>}</AnimatePresence>
                {/\*$/.test(f.label || '') && <span className="ml-auto text-[11.5px] font-semibold text-ink-4">wajib</span>}</label>
              {/textarea/.test(f.type)
                ? <textarea ref={(e) => (refs.current[k] = e)} rows={4} value={vals[k] || ''} placeholder={f.placeholder} onFocus={() => setFocus(k)} onBlur={() => setFocus(null)} onChange={(e) => set(k, e.target.value)} className="w-full rounded-2xl border border-line px-4 py-3 text-[15px] leading-relaxed outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 resize-y" />
                : <input ref={(e) => (refs.current[k] = e)} value={vals[k] || ''} placeholder={f.placeholder} inputMode={/number/.test(f.type) ? 'numeric' : undefined} onFocus={() => setFocus(k)} onBlur={() => setFocus(null)} onChange={(e) => set(k, e.target.value)} className="w-full rounded-2xl border border-line px-4 py-3 text-[15px] outline-none focus:border-brand focus:ring-4 focus:ring-brand/10" />}
            </div>
          )) : <p className="text-emerald-600 font-semibold">Prompt ini tidak perlu diisi — langsung kirim ke AI.</p>}
        </Card>
        <div ref={prevRef} className="lg:sticky lg:top-24">
          <Card className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <Ring value={p} size={50} stroke={5} color={p === 1 ? '#10b981' : '#f59e0b'}><span className="text-[11px]">{n ? `${filled}/${n}` : '✓'}</span></Ring>
              <div><b className="block text-[16px] font-extrabold">Prompt Anda</b><span className="text-[13px] text-ink-3">{n ? (p === 1 ? 'Semua isian lengkap — siap dikirim' : `${n - filled} isian lagi`) : 'Tanpa isian'}</span></div>
              <span className="flex-1" /><CopyBtn get={text} />
            </div>
            <div className="font-mono text-[13px] leading-[1.8] text-ink-2 whitespace-pre-wrap break-words bg-paper border border-line rounded-2xl p-4 max-h-[58vh] overflow-auto scroll-thin">
              {parts.map((x, i) => x.slot == null ? <span key={i}>{x.t}</span> : (vals[x.slot] || '').trim()
                ? <motion.span key={i + 'f'} initial={{ backgroundColor: 'rgba(16,185,129,.35)' }} animate={{ backgroundColor: 'rgba(16,185,129,.12)' }} className={cx('text-emerald-700 rounded-md px-1', focus === x.slot && 'ring-2 ring-brand')}>{vals[x.slot].trim()}</motion.span>
                : <button key={i} onClick={() => { refs.current[x.slot]?.focus(); refs.current[x.slot]?.scrollIntoView({ block: 'center', behavior: 'smooth' }); }}
                    className={cx('font-sans text-[12.5px] font-bold text-amber-700 bg-amber-50 border border-dashed border-amber-300 rounded-md px-1.5 hover:bg-amber-100', focus === x.slot && 'ring-2 ring-brand')}>{fieldLabel(fields[x.slot])}</button>)}
            </div>
            <AIButtons get={text} className="mt-3" />
            <p className="text-[12.5px] text-ink-4 mt-3">Kotak kuning = isian yang belum diisi. Klik untuk langsung ke kolomnya.</p>
          </Card>
        </div>
      </div>
      <button onClick={() => prevRef.current?.scrollIntoView({ behavior: 'smooth' })} className="lg:hidden fixed left-4 right-4 bottom-[84px] z-30 flex items-center gap-3 h-14 px-5 rounded-2xl grad-btn text-white font-bold shadow-glow">
        <Sparkles size={18} />Lihat prompt<span className="flex-1" /><span className="tabular-nums">{n ? `${filled}/${n}` : ''}</span><ChevronUp size={18} className="rotate-180" />
      </button>
    </Page>
  );
}
