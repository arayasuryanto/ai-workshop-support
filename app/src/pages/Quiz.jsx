import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { X, Clock, FlaskConical, Lightbulb, Play, ArrowLeft, ArrowRight, Check, Trophy, RotateCcw, AlertTriangle, BookOpen } from 'lucide-react';
import { useData, Btn, Card, Eyebrow, Page, PageHead, CopyBtn, AIButtons, Tag, Num, cx } from '../components/ui';
import { store, useStore, once, detectHit, PRED } from '../lib/core';

export function QuizHome() {
  const { Q } = useData(); const nav = useNavigate(); const st = useStore('quiz', null); const best = useStore('quizBest', null);
  const [mode, setMode] = useState(st?.mode || 'bebas');
  const topics = [...new Set(Q.questions.map((q) => q.topic))];
  const start = () => { store.set('quiz', { mode, a: {}, at: 0, startAt: Date.now() }); nav('/latihan/1'); };
  const answered = st ? Object.values(st.a || {}).filter((x) => x.checked).length : 0;
  return (
    <Page className="max-w-[860px] mx-auto">
      <PageHead eyebrow="Latihan soal · kisi-kisi resmi workshop" title={<>Siap untuk <span className="grad-text">post-test?</span></>}
        sub="10 soal esai dengan mekanik yang sama seperti tes asli: dua level petunjuk yang membatasi skor. Setelah menjawab, bandingkan dengan konsep kunci dan jawaban ideal." />
      <Card className="p-6 md:p-7">
        <Eyebrow className="mb-3">5 topik · 2 soal per topik · 20 poin per topik</Eyebrow>
        <div className="grid gap-2">{topics.map((t, i) => (
          <motion.div key={t} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }} className="flex items-center gap-3 p-3 rounded-2xl bg-paper border border-line">
            <span className="w-8 h-8 rounded-xl grad-btn text-white grid place-items-center text-[13px] font-extrabold">{i + 1}</span><span className="text-[14.5px] font-semibold">{t}</span>
          </motion.div>))}</div>
        <Eyebrow className="mt-7 mb-3">Pilih mode</Eyebrow>
        <div className="grid sm:grid-cols-2 gap-3">
          {[['bebas', FlaskConical, 'Latihan bebas', 'Tanpa timer. Pelajari tiap soal pelan-pelan.'], ['simulasi', Clock, 'Simulasi 12 menit', 'Seperti post-test sungguhan — timer jalan terus.']].map(([k, Ic, t, d]) => (
            <motion.button key={k} whileTap={{ scale: 0.98 }} onClick={() => { setMode(k); if (st && !st.finished) store.set('quiz', { ...st, mode: k }); }}
              className={cx('relative text-left p-5 rounded-3xl border-2 transition-colors', mode === k ? 'border-brand bg-brand-50/60' : 'border-line bg-white hover:border-slate-300')}>
              {mode === k && <motion.span layoutId="modecheck" className="absolute top-4 right-4 w-6 h-6 rounded-full grad-btn text-white grid place-items-center"><Check size={14} strokeWidth={3.5} /></motion.span>}
              <Ic size={22} className={mode === k ? 'text-brand' : 'text-ink-3'} /><b className="block text-[16px] mt-3">{t}</b><span className="text-[13.5px] text-ink-3">{d}</span>
            </motion.button>
          ))}
        </div>
        <div className="mt-5 rounded-2xl p-4 bg-amber-50 border border-amber-200 text-[13.5px] text-amber-900"><b>Aturan petunjuk (sama dengan tes asli):</b> tanpa petunjuk maks 10 · Petunjuk Lv.1 maks 8 · Petunjuk Lv.2 maks 6.</div>
        <div className="flex flex-wrap gap-3 mt-6">
          {st && !st.finished ? <><Btn size="lg" as={Link} to={`/latihan/${(st.at || 0) + 1}`}><Play size={17} fill="currentColor" />Lanjutkan · {answered}/10</Btn><Btn size="lg" variant="ghost" onClick={start}><RotateCcw size={16} />Mulai ulang</Btn></>
            : <Btn size="lg" onClick={start}><Play size={17} fill="currentColor" />Mulai latihan</Btn>}
          {best != null && <span className="inline-flex items-center gap-2 h-[52px] px-5 rounded-2xl bg-amber-50 text-amber-700 font-bold"><Trophy size={18} />Terbaik {best}/100</span>}
        </div>
      </Card>
    </Page>
  );
}

export function QuizQ() {
  const { n: ns } = useParams(); const n = +ns; const { Q } = useData(); const nav = useNavigate();
  const st = useStore('quiz', null); const q = Q.questions[n - 1];
  const [now, setNow] = useState(Date.now());
  useEffect(() => { if (st?.mode !== 'simulasi') return; const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, [st?.mode]);
  useEffect(() => { if (st && st.at !== n - 1) store.set('quiz', { ...st, at: n - 1 }); window.scrollTo({ top: 0 }); }, [n]);
  const left = st?.mode === 'simulasi' ? Math.max(0, 12 * 60 - Math.floor((now - st.startAt) / 1000)) : null;
  useEffect(() => { if (left === 0) nav('/latihan/hasil'); }, [left]);
  if (!st) return <Navigate to="/latihan" replace />;
  if (!q) return null;
  const a = st.a[n] || { text: '', hint: 0, checked: false, ticks: [] };
  const save = (x) => store.set('quiz', { ...store.get('quiz'), a: { ...store.get('quiz').a, [n]: { ...a, ...x } } });
  const rub = [...q.concepts, ...(q.minimum ? ['Poin minimum: ' + q.minimum] : [])];
  const cap = a.hint === 2 ? 6 : a.hint === 1 ? 8 : 10;
  const score = Math.min(cap, Math.round((a.ticks.length / rub.length) * 10));
  const check = (e) => { const ticks = rub.map((r, i) => (detectHit(a.text, r) ? i : -1)).filter((i) => i >= 0); save({ checked: true, ticks }); once(`q:${n}:${st.startAt}`, 10, e.currentTarget); };
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
  return (
    <div className="max-w-[820px] mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Btn as={Link} to="/latihan" variant="ghost" size="sm" className="!w-10 !px-0"><X size={18} /></Btn>
        <div className="flex-1 flex gap-1.5">{Q.questions.map((_, i) => (
          <button key={i} onClick={() => nav(`/latihan/${i + 1}`)} className="relative flex-1 h-2 rounded-full bg-slate-200/80 overflow-hidden">
            {(i + 1 === n || st.a[i + 1]?.checked) && <motion.span className={cx('absolute inset-0', i + 1 === n ? 'grad-btn' : 'bg-emerald-400')} initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} style={{ originX: 0 }} />}
          </button>))}</div>
        {left != null ? <span className={cx('inline-flex items-center gap-1.5 font-extrabold tabular-nums', left < 60 ? 'text-rose-500' : 'text-amber-600')}><Clock size={16} />{Math.floor(left / 60)}:{String(left % 60).padStart(2, '0')}</span>
          : <span className="text-[13px] font-bold text-ink-3 tabular-nums">{n}/10</span>}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={n} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ type: 'spring', stiffness: 300, damping: 32 }}>
          <Card className="p-6 md:p-7">
            <div className="flex items-center gap-2 mb-3"><Tag tone="blue">Soal {n}</Tag><Tag tone="violet">{q.topic}</Tag></div>
            <p className="text-[18px] md:text-[20px] leading-[1.55] font-semibold text-ink">{q.question}</p>
            {!a.checked ? (
              <>
                <textarea rows={8} value={a.text} onChange={(e) => save({ text: e.target.value })} placeholder="Tulis jawaban Anda… (minimal 10 karakter)"
                  className="mt-5 w-full rounded-2xl border border-line p-4 text-[15px] leading-relaxed outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 resize-y" />
                <div className="flex items-center gap-2 mt-2 text-[12.5px] font-semibold text-ink-4"><span className="tabular-nums">{a.text.length} karakter</span><span className="flex-1" /><Tag tone={cap === 10 ? 'green' : 'amber'}>maks {cap}/10</Tag></div>
                <div className="flex flex-wrap gap-2 mt-4">
                  {a.hint < 1 && <Btn variant="ghost" size="sm" onClick={() => save({ hint: 1 })}><Lightbulb size={15} />Petunjuk Lv.1 · maks 8</Btn>}
                  {a.hint === 1 && <Btn variant="ghost" size="sm" onClick={() => save({ hint: 2 })}><Lightbulb size={15} />Petunjuk Lv.2 · maks 6</Btn>}
                </div>
                <AnimatePresence>
                  {a.hint >= 1 && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-3 rounded-2xl p-4 bg-amber-50 border border-amber-200 text-[14px] text-amber-950"><Eyebrow className="!text-amber-600 mb-1.5">Lv.1 — Arah kompas</Eyebrow><ul className="list-disc pl-5 space-y-1">{q.concepts.map((x) => <li key={x}>{x}</li>)}</ul></motion.div>}
                  {a.hint >= 2 && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-3 rounded-2xl p-4 bg-amber-50 border border-amber-200 text-[14px] text-amber-950"><Eyebrow className="!text-amber-600 mb-1.5">Lv.2 — Peta jalan</Eyebrow>{q.minimum}</motion.div>}
                </AnimatePresence>
                <Btn size="lg" className="w-full mt-6" disabled={a.text.trim().length < 10} onClick={check}>Periksa jawaban</Btn>
                <p className="text-center text-[12.5px] text-ink-4 mt-2">Setelah diperiksa, jawaban dikunci — sama seperti tes asli.</p>
              </>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="mt-5 rounded-2xl p-4 bg-paper border border-line text-[15px] leading-relaxed whitespace-pre-wrap text-ink-2">{a.text}</div>
                <div className="flex items-end justify-between mt-6 mb-3"><Eyebrow>Centang yang benar-benar ada di jawaban Anda</Eyebrow>
                  <span className="text-[34px] leading-none font-extrabold text-amber-500"><Num value={score} /><span className="text-[16px] text-ink-4">/10</span></span></div>
                <div className="space-y-2">{rub.map((r, i) => { const hit = detectHit(a.text, r), on = a.ticks.includes(i); return (
                  <motion.label key={i} whileTap={{ scale: 0.99 }} className={cx('flex items-start gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-colors', on ? 'border-emerald-300 bg-emerald-50/60' : 'border-line bg-white')}>
                    <input type="checkbox" checked={on} onChange={() => save({ ticks: on ? a.ticks.filter((x) => x !== i) : [...a.ticks, i] })} className="mt-1 w-[18px] h-[18px] accent-emerald-500 shrink-0" />
                    <span className="text-[14.5px] text-ink-2 flex-1">{r}</span>{hit && <Tag tone="green">terdeteksi</Tag>}
                  </motion.label>); })}</div>
                <div className="mt-6 rounded-3xl p-5 bg-gradient-to-br from-emerald-50 to-white border border-emerald-200">
                  <Eyebrow className="!text-emerald-600 mb-2">Jawaban ideal</Eyebrow>
                  <div className="text-[14.5px] leading-relaxed text-ink-2 space-y-2">{q.ideal.map((b, i) => b.type === 'table'
                    ? <div key={i} className="overflow-x-auto rounded-2xl border border-emerald-100 bg-white"><table className="w-full text-[13.5px]"><tbody>{b.rows.map((r, j) => <tr key={j} className={cx('border-b border-emerald-50 last:border-0', !j && 'bg-emerald-50/60 font-bold')}>{r.map((c, m) => <td key={m} className={cx('px-3 py-2 align-top', !m && 'font-semibold whitespace-nowrap')}>{c}</td>)}</tr>)}</tbody></table></div>
                    : b.type === 'list' ? <ul key={i} className="list-disc pl-5 space-y-1">{b.items.map((x) => <li key={x}>{x}</li>)}</ul> : <p key={i}>{b.text}</p>)}</div>
                </div>
                {q.mistakes.length > 0 && <div className="mt-4 rounded-3xl p-5 bg-rose-50/70 border border-rose-100"><Eyebrow className="!text-rose-500 mb-2 flex items-center gap-1.5"><AlertTriangle size={13} />Kesalahan umum</Eyebrow><ul className="list-disc pl-5 space-y-1 text-[14px] text-ink-2">{q.mistakes.map((x) => <li key={x}>{x}</li>)}</ul></div>}
                <div className="mt-5 rounded-3xl p-5 border border-brand-100 bg-brand-50/50"><b className="block text-[15px] mb-1">Minta AI menilai jawaban Anda</b><p className="text-[13.5px] text-ink-3 mb-3">Prompt penilaian lengkap dengan rubrik dan jawaban ideal — tempel ke AI Anda.</p><div className="flex flex-wrap gap-2"><CopyBtn get={gp} label="Salin prompt penilaian" sub="Tempel ke AI untuk penilaian mendalam" /><AIButtons get={gp} /></div></div>
                <div className="flex gap-3 mt-6">
                  {n > 1 && <Btn as={Link} to={`/latihan/${n - 1}`} variant="ghost" size="lg" className="!w-14 !px-0"><ArrowLeft size={19} /></Btn>}
                  <Btn as={Link} to={n < 10 ? `/latihan/${n + 1}` : '/latihan/hasil'} size="lg" className="flex-1">{n < 10 ? 'Soal berikutnya' : 'Lihat hasil'}<ArrowRight size={18} /></Btn>
                </div>
              </motion.div>
            )}
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export function QuizResult() {
  const { Q } = useData(); const nav = useNavigate(); const st = useStore('quiz', null);
  const rows = Q.questions.map((q, i) => ({ q, a: st?.a?.[i + 1] }));
  const sc = (a) => { if (!a?.checked) return 0; const q = Q.questions.find((_, i) => st.a[i + 1] === a); const rub = q.concepts.length + (q.minimum ? 1 : 0); const cap = a.hint === 2 ? 6 : a.hint === 1 ? 8 : 10; return Math.min(cap, Math.round((a.ticks.length / rub) * 10)); };
  const total = rows.reduce((s, r) => s + sc(r.a), 0); const pred = PRED.find(([m]) => total >= m)[1];
  useEffect(() => {
    if (!st) return;
    if (!st.finished) store.set('quiz', { ...st, finished: true });
    const b = store.get('quizBest', null); if (b == null || total > b) store.set('quizBest', total);
    if (total >= 70) confetti({ particleCount: 140, spread: 90, origin: { y: 0.4 }, colors: ['#0256f4', '#22b8f5', '#10b981', '#f59e0b'] });
  }, []);
  if (!st) return <Navigate to="/latihan" replace />;
  return (
    <Page className="max-w-[820px] mx-auto">
      <Card className="relative overflow-hidden p-8 text-center">
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-brand-50 to-transparent" />
        <div className="relative">
          <Eyebrow>Hasil latihan · {st.mode === 'simulasi' ? 'simulasi 12 menit' : 'latihan bebas'}</Eyebrow>
          <div className="text-[72px] font-extrabold leading-none tracking-tight mt-4 grad-text"><Num value={total} /><span className="text-[28px] text-ink-4">/100</span></div>
          <span className="inline-block mt-3 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-700 font-extrabold">{pred}</span>
          <p className="mt-4 text-[14.5px] text-ink-3 max-w-md mx-auto">Skor ini dari penilaian mandiri Anda terhadap konsep kunci. Untuk penilaian yang lebih ketat, pakai "Minta AI menilai" di setiap soal.</p>
        </div>
      </Card>
      <div className="mt-5 space-y-2.5">{rows.map((r, i) => (
        <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
          <Link to={`/latihan/${i + 1}`} className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-line shadow-soft hover:shadow-lift transition-shadow">
            <span className="w-8 h-8 rounded-xl bg-paper border border-line grid place-items-center text-[12px] font-extrabold">{i + 1}</span>
            <span className="text-[14.5px] font-semibold flex-1">{r.q.title}</span>
            <span className={cx('font-extrabold tabular-nums', r.a?.checked ? 'text-amber-500' : 'text-ink-4')}>{r.a?.checked ? `${sc(r.a)}/10` : 'belum'}</span>
          </Link>
        </motion.div>))}</div>
      <div className="flex flex-wrap gap-3 mt-6"><Btn size="lg" onClick={() => { store.del('quiz'); nav('/latihan'); }}><RotateCcw size={16} />Ulangi latihan</Btn><Btn as={Link} to="/sesi/soal-dan-pembahasan/0" variant="ghost" size="lg"><BookOpen size={16} />Baca kisi-kisi & pembahasan</Btn></div>
    </Page>
  );
}
