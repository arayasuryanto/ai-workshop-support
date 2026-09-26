import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Play, Plus, Trash2, X, Sparkles, Check, ArrowRight } from 'lucide-react';
import { useData, Btn, Card, Eyebrow, Page, PageHead, Ring, CopyBtn, AIButtons, Chip, Stagger, Item, cx } from '../components/ui';
import { store, useStore, once, KEYS, KNAME, KCOLOR, DETECT, shortTitle } from '../lib/core';
import { LABS } from './Home';

/* ── hub ── */
const MINI = {
  prompt: (<svg viewBox="0 0 220 110" className="w-full h-full">{KEYS.map((k, i) => <motion.rect key={k} x="20" y={12 + i * 19} height="11" rx="5.5" fill={KCOLOR[k]} initial={{ width: 0 }} whileInView={{ width: [120, 180, 150, 100, 140][i] }} transition={{ delay: i * 0.08, type: 'spring' }} />)}</svg>),
  fishbone: (<svg viewBox="0 0 220 110" className="w-full h-full"><motion.path d="M15 55h160" stroke="#0256f4" strokeWidth="4" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} /><rect x="175" y="40" width="34" height="30" rx="8" fill="#0256f4" />{[50, 95, 140].map((x, i) => <motion.path key={x} d={`M${x} 55 ${x - 26} 16M${x} 55 ${x - 26} 94`} stroke="#22b8f5" strokeWidth="3" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} transition={{ delay: 0.2 + i * 0.15 }} />)}</svg>),
  '5why': (<svg viewBox="0 0 220 110" className="w-full h-full">{[0, 1, 2, 3, 4].map((i) => <g key={i}>{i < 4 && <motion.path d={`M${34 + i * 40} 55h16`} stroke="#c7d6f5" strokeWidth="4" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} transition={{ delay: i * 0.12 }} />}<motion.circle cx={24 + i * 40} cy="55" r="12" fill={i === 4 ? '#f59e0b' : '#0256f4'} initial={{ scale: 0 }} whileInView={{ scale: 1 }} transition={{ delay: i * 0.12, type: 'spring' }} /></g>)}</svg>),
  pareto: (<svg viewBox="0 0 220 110" className="w-full h-full">{[74, 50, 28, 18, 11, 7].map((h, i) => <motion.rect key={i} x={18 + i * 32} width="24" rx="4" fill={i < 2 ? '#0256f4' : '#dbe5f7'} initial={{ height: 0, y: 100 }} whileInView={{ height: h, y: 100 - h }} transition={{ delay: i * 0.07, type: 'spring' }} />)}<motion.path d="M30 44 62 26 94 17 126 12 158 9 190 8" fill="none" stroke="#f59e0b" strokeWidth="3" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} transition={{ delay: 0.4, duration: 0.8 }} /></svg>),
};
const DESC = {
  prompt: 'Rakit prompt dengan kerangka PERAN – KONTEKS – TUGAS – BATASAN – FORMAT dari Sesi 3. Skornya naik setiap komponen terisi.',
  fishbone: 'Tulis masalah di kepala ikan, isi penyebab per kategori 6M. Hasilnya prompt yang meminta AI menguji dan memprioritaskan.',
  '5why': 'Tanya "kenapa?" lima kali — pertanyaan berikutnya baru terbuka setelah dijawab. Uji balik rantainya dengan AI.',
  pareto: 'Masukkan kategori dan jumlah kejadian. Grafik mengurutkan dan menandai penyebab vital penyumbang ±80% masalah.',
};
export function LabHub() {
  const { P } = useData();
  return (
    <Page>
      <PageHead eyebrow="Lab praktik" title={<>Kerjakan, <span className="grad-text">jangan hanya baca.</span></>} sub="Empat alat dari materi workshop, dibuat bisa dipakai. Setiap alat menghasilkan prompt yang siap dikirim ke ChatGPT, Claude, atau Gemini." />
      <Stagger className="grid md:grid-cols-2 gap-5">
        {LABS.map((l) => (
          <Item key={l.k}>
            <Link to={`/lab/${l.k}`} className="group block rounded-4xl bg-white border border-line shadow-soft hover:shadow-lift hover:-translate-y-1 transition-all p-6">
              <div className="h-[130px] rounded-3xl mb-5 p-4 grid place-items-center" style={{ background: `linear-gradient(135deg, ${l.bg}, #fff)` }}>{MINI[l.k]}</div>
              <div className="flex items-center gap-3 mb-2"><span className="w-10 h-10 rounded-2xl grid place-items-center" style={{ background: l.bg, color: l.c }}><l.Ic size={20} /></span><h3 className="text-[20px] font-extrabold tracking-tight">{l.t}</h3></div>
              <p className="text-[14.5px] text-ink-3 leading-relaxed">{DESC[l.k]}</p>
              <div className="mt-4 flex items-center justify-between text-[13px] font-bold"><span className="text-ink-4">Materi: {shortTitle(P.sessions[l.m].title)}</span><span className="inline-flex items-center gap-1 text-brand">Buka <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" /></span></div>
            </Link>
          </Item>
        ))}
      </Stagger>
    </Page>
  );
}

function LabLayout({ k, title, sub, left, right }) {
  const l = LABS.find((x) => x.k === k);
  return (
    <Page>
      <Link to="/lab" className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-ink-3 hover:text-ink mb-4"><ArrowLeft size={16} />Lab praktik</Link>
      <PageHead title={<span className="inline-flex items-center gap-3"><span className="w-12 h-12 rounded-2xl grid place-items-center" style={{ background: l.bg, color: l.c }}><l.Ic size={24} /></span>{title}</span>} sub={sub}
        right={<Btn as={Link} to={`/sesi/${l.m}/0`} variant="ghost"><Play size={15} />Pelajari materinya</Btn>} />
      <div className="grid lg:grid-cols-2 gap-6 items-start"><div className="min-w-0">{left}</div><div className="lg:sticky lg:top-24 min-w-0">{right}</div></div>
    </Page>
  );
}
function OutPanel({ title, text }) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-3 mb-3"><Sparkles size={18} className="text-brand" /><h3 className="font-extrabold text-[16px]">{title}</h3><span className="flex-1" /><CopyBtn get={() => text} /></div>
      <pre className="font-mono text-[13px] leading-[1.75] text-ink-2 whitespace-pre-wrap break-words bg-paper border border-line rounded-2xl p-4 max-h-[46vh] overflow-auto scroll-thin">{text}</pre>
      <AIButtons get={() => text} className="mt-3" />
    </Card>
  );
}
const inputCls = 'w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px] outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10';

/* ── Prompt Builder ── */
const PRESETS = [
  { n: 'Ringkas laporan gangguan', v: { peran: 'Anda adalah staf analis operasional distribusi air minum di PAM Jaya.', konteks: 'Saya punya catatan gangguan harian dari 3 wilayah layanan selama seminggu (terlampir di bawah). Laporan ini akan dibaca Kepala Divisi dalam rapat Senin pagi.', tugas: 'Ringkas catatan tersebut menjadi laporan mingguan: pola gangguan terbanyak, wilayah paling terdampak, dan 3 tindak lanjut yang disarankan.', batasan: 'Maksimal 250 kata. Jangan menambah angka yang tidak ada di catatan — tandai "perlu dicek" jika data kurang.', format: 'Judul, 3 poin temuan, tabel singkat (wilayah | jumlah gangguan | penyebab utama), lalu 3 tindak lanjut bernomor.' } },
  { n: 'Balas keluhan pelanggan', v: { peran: 'Anda adalah petugas layanan pelanggan PAM Jaya yang ramah dan tenang.', konteks: 'Pelanggan mengeluh tagihan bulan ini naik dua kali lipat, padahal pemakaian merasa sama. Pemeriksaan awal: ada kemungkinan salah baca meter.', tugas: 'Tulis balasan WhatsApp yang meminta maaf, menjelaskan langkah pengecekan, dan meminta foto meter terbaru.', batasan: 'Jangan menjanjikan pengembalian dana sebelum verifikasi. Hindari istilah teknis.', format: 'Maksimal 5 kalimat pendek, bahasa sehari-hari, tanpa poin.' } },
  { n: 'Notulen rapat', v: { peran: 'Anda adalah sekretaris rapat yang teliti.', konteks: 'Berikut transkrip rapat koordinasi penanganan kebocoran pipa di wilayah Jakarta Utara (45 menit, 6 peserta).', tugas: 'Susun notulen: keputusan, tindak lanjut beserta PIC dan tenggat, serta isu yang belum selesai.', batasan: 'Hanya tulis yang benar-benar disebut di transkrip. Jika PIC atau tenggat tidak disebut, tulis "belum ditetapkan".', format: 'Tiga bagian berjudul; tindak lanjut dalam tabel (tindakan | PIC | tenggat).' } },
];
const BHINT = {
  peran: ['Siapa yang Anda minta menjawab?', ['Anda adalah analis data layanan pelanggan PAM Jaya.', 'Anda adalah konsultan komunikasi publik BUMD.', 'Anda adalah auditor internal yang skeptis.']],
  konteks: ['Situasi, data, dan untuk siapa hasilnya.', ['Hasilnya untuk rapat direksi minggu depan.', 'Data terlampir: 800 komplain/bulan, 25% pindah kanal.', 'Pembacanya pelanggan awam, bukan staf teknis.']],
  tugas: ['Apa persisnya yang harus dikerjakan? Pakai kata kerja.', ['Identifikasi 3 penyebab utama dan urutkan dampaknya.', 'Buat draf surat pemberitahuan gangguan.', 'Bandingkan dua opsi dan beri rekomendasi.']],
  batasan: ['Apa yang tidak boleh, dan rambu-rambunya.', ['Maksimal 200 kata.', 'Jangan mengarang angka — tandai jika data kurang.', 'Jangan menyebut nama pelanggan.']],
  format: ['Bentuk keluaran yang Anda inginkan.', ['Tabel: masalah | penyebab | tindakan.', '5 poin bernomor, masing-masing 1 kalimat.', 'Email formal dengan subjek.']],
};
function score(v) {
  let s = 0; const tips = [];
  KEYS.forEach((k) => { if ((v[k] || '').trim().length >= 12) s += 16; else tips.push({ ok: false, t: `Isi ${KNAME[k]} — ${BHINT[k][0].toLowerCase()}` }); });
  if (/\d/.test(v.konteks || '')) { s += 7; tips.push({ ok: true, t: 'Konteks memuat angka / data konkret' }); } else tips.push({ ok: false, t: 'Tambahkan angka atau data ke Konteks — AI tidak bisa menebak situasi Anda' });
  if (DETECT.batasan.test(v.batasan || '')) { s += 7; tips.push({ ok: true, t: 'Batasan tegas (jangan / maksimal / hanya)' }); }
  if (DETECT.format.test(v.format || '')) { s += 6; tips.push({ ok: true, t: 'Format keluaran jelas' }); }
  return { s: Math.min(100, s), tips };
}
export function Builder() {
  const v = useStore('builder', {});
  const set = (k, t) => store.set('builder', { ...store.get('builder', {}), [k]: t });
  const { s, tips } = score(v); const col = s >= 80 ? '#10b981' : s >= 45 ? '#f59e0b' : '#f43f5e';
  const label = s >= 95 ? 'Siap dipakai 🚀' : s >= 80 ? 'Kuat' : s >= 45 ? 'Cukup — bisa lebih tajam' : 'Masih lemah';
  useEffect(() => { if (s >= 95) once('builder:strong', 15, document.getElementById('bring')); }, [s >= 95]);
  const out = KEYS.filter((k) => (v[k] || '').trim()).map((k) => `${KNAME[k].toUpperCase()}: ${v[k].trim()}`).join('\n\n');
  const left = (
    <Card className="p-5 md:p-6">
      <Eyebrow className="mb-2.5">Mulai dari contoh</Eyebrow>
      <div className="flex flex-wrap gap-2 mb-6">{PRESETS.map((p) => <Chip key={p.n} onClick={() => store.set('builder', p.v)}>{p.n}</Chip>)}<Chip onClick={() => store.set('builder', {})}>Kosongkan</Chip></div>
      {KEYS.map((k) => (
        <div key={k} className="mb-6 last:mb-0">
          <label className="flex items-center gap-2 font-extrabold text-[14.5px] mb-1"><span className="w-3 h-3 rounded-[4px]" style={{ background: KCOLOR[k] }} />{KNAME[k]}
            <AnimatePresence>{(v[k] || '').trim().length >= 12 && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="w-5 h-5 rounded-full bg-mint text-white grid place-items-center"><Check size={12} strokeWidth={3.5} /></motion.span>}</AnimatePresence>
            <span className="ml-auto text-[12px] font-semibold text-ink-4">{(v[k] || '').trim() ? (v[k] || '').trim().split(/\s+/).length + ' kata' : ''}</span></label>
          <p className="text-[13px] text-ink-3 mb-2">{BHINT[k][0]}</p>
          <textarea rows={k === 'konteks' || k === 'tugas' ? 3 : 2} value={v[k] || ''} onChange={(e) => set(k, e.target.value)} placeholder={BHINT[k][1][0]}
            className={cx(inputCls, 'resize-y leading-relaxed')} style={{ borderLeft: `4px solid ${KCOLOR[k]}` }} />
          <div className="flex flex-wrap gap-1.5 mt-2">{BHINT[k][1].map((x) => (
            <button key={x} onClick={() => set(k, ((v[k] || '').trim() ? (v[k] || '').trim() + ' ' : '') + x)} className="text-[12.5px] px-3 py-1.5 rounded-full border border-dashed border-slate-300 text-ink-3 hover:border-solid hover:border-brand hover:text-brand hover:bg-brand-50 transition-colors text-left">+ {x}</button>
          ))}</div>
        </div>
      ))}
    </Card>
  );
  const right = (
    <div className="space-y-4">
      <Card className="p-5">
        <div className="flex items-center gap-4" id="bring">
          <Ring value={s / 100} size={76} stroke={8} color={col}><span className="text-[18px]" style={{ color: col }}>{s}</span></Ring>
          <div><AnimatePresence mode="wait"><motion.b key={label} initial={{ y: 6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -6, opacity: 0 }} className="block text-[18px] font-extrabold">{label}</motion.b></AnimatePresence><span className="text-[13px] text-ink-3">Kekuatan prompt · kerangka Sesi 3</span></div>
        </div>
        <div className="mt-4 space-y-1.5">{tips.slice(0, 5).map((t) => (
          <motion.div layout key={t.t} className={cx('flex gap-2 text-[13.5px]', t.ok ? 'text-emerald-600 font-semibold' : 'text-ink-2')}>{t.ok ? <Check size={16} className="shrink-0 mt-0.5" /> : <ArrowRight size={16} className="shrink-0 mt-0.5 text-amber-500" />}{t.t}</motion.div>
        ))}</div>
      </Card>
      <Card className="p-5">
        <div className="flex items-center gap-3 mb-3"><Sparkles size={18} className="text-brand" /><h3 className="font-extrabold text-[16px]">Prompt Anda</h3><span className="flex-1" /><CopyBtn get={() => out} /></div>
        <div className="font-mono text-[13px] leading-[1.75] bg-paper border border-line rounded-2xl p-4 min-h-[140px] max-h-[46vh] overflow-auto scroll-thin">
          {out ? <AnimatePresence initial={false}>{KEYS.filter((k) => (v[k] || '').trim()).map((k) => (
            <motion.div layout key={k} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="border-l-[3px] pl-3 mb-3 last:mb-0" style={{ borderColor: KCOLOR[k] }}>
              <b style={{ color: KCOLOR[k] }}>{KNAME[k].toUpperCase()}:</b> <span className="text-ink-2 whitespace-pre-wrap">{v[k].trim()}</span>
            </motion.div>))}</AnimatePresence>
            : <span className="text-ink-4">Isi komponen di kiri, atau pilih contoh — prompt terbentuk di sini.</span>}
        </div>
        <AIButtons get={() => out} className="mt-3" />
      </Card>
    </div>
  );
  return <LabLayout k="prompt" title="Prompt Builder" sub="Lima komponen dari Sesi 3. Setiap komponen yang terisi menambah kekuatan prompt, dan hasilnya terbentuk saat Anda mengetik." left={left} right={right} />;
}

/* ── Fishbone ── */
const CATS = [['Manusia', 'Man'], ['Metode', 'Method'], ['Mesin & Alat', 'Machine'], ['Material', 'Material'], ['Pengukuran', 'Measurement'], ['Lingkungan', 'Environment']];
const FISH_EX = { problem: 'Keluhan tagihan naik 40% di satu wilayah layanan dalam 3 bulan', causes: { 0: ['Petugas baca meter kurang pelatihan', 'Beban kerja petugas tinggi'], 1: ['Tidak ada verifikasi ulang tagihan anomali'], 2: ['Meter tua sulit dibaca'], 4: ['Pembacaan meter manual, rawan salah catat'], 5: ['Kenaikan tarif belum tersosialisasi'] } };
export function Fishbone() {
  const st = useStore('fish', FISH_EX); const [sel, setSel] = useState(0); const [inp, setInp] = useState('');
  const save = (x) => store.set('fish', x);
  const add = () => { const t = inp.trim(); if (!t) return; const c = { ...st.causes, [sel]: [...(st.causes[sel] || []), t] }; save({ ...st, causes: c }); setInp(''); if (CATS.every((_, i) => (c[i] || []).length)) once('fish:full', 15, document.getElementById('fsvg')); };
  const prompt = `Anda adalah analis perbaikan proses (continuous improvement) yang berpengalaman di BUMD layanan air minum.

KONTEKS: Saya sedang menganalisis masalah berikut dengan Fishbone Diagram (6M):
MASALAH: ${st.problem || '[tulis masalah]'}

Penyebab yang sudah saya identifikasi:
${CATS.map(([n, e], i) => `- ${n} (${e}): ${(st.causes[i] || []).join('; ') || '(belum ada)'}`).join('\n')}

TUGAS:
1. Uji setiap penyebab: apakah itu penyebab atau hanya gejala?
2. Tambahkan penyebab penting yang terlewat, terutama di kategori yang masih kosong.
3. Pilih 3 penyebab paling mungkin dan jelaskan alasannya.
4. Untuk 3 penyebab itu, sarankan data apa yang perlu dikumpulkan untuk membuktikannya, dan lanjutkan dengan 5 Why singkat.

BATASAN: Jangan mengarang data. Tandai asumsi dengan "ASUMSI".
FORMAT: Tabel (kategori | penyebab | penyebab/gejala | bukti yang dibutuhkan), lalu daftar 3 prioritas.`;
  const trunc = (s, n) => (s.length > n ? s.slice(0, n - 1) + '…' : s);
  const bx = [218, 368, 516];
  const svg = (
    <svg id="fsvg" viewBox="0 0 640 330" className="w-full h-auto">
      <motion.path d="M14 165 H530" stroke="#0256f4" strokeWidth="4" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.7 }} />
      {[0, 1, 2, 3, 4, 5].map((ci, idx) => {
        const up = idx < 3, x = bx[idx % 3], y0 = 165, y1 = up ? 42 : 288, x1 = x - 96, cs = st.causes[ci] || [], on = ci === sel;
        return (
          <g key={ci} onClick={() => setSel(ci)} className="cursor-pointer">
            <motion.path d={`M${x} ${y0} L${x1} ${y1}`} stroke={on ? '#f59e0b' : '#c9b8fb'} strokeWidth={on ? 4 : 3} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.3 + idx * 0.08 }} />
            <rect x={x1 - 70} y={up ? y1 - 30 : y1 + 4} width="160" height="28" fill="transparent" />
            <text x={x1} y={up ? y1 - 12 : y1 + 22} textAnchor="middle" style={{ font: '800 12px "Plus Jakarta Sans"', fill: on ? '#d97706' : '#475569', letterSpacing: '.06em' }}>{CATS[ci][0].toUpperCase()}</text>
            <AnimatePresence>
              {cs.slice(0, 3).map((c, j) => { const t = (j + 1) / 4, px = x + (x1 - x) * t, py = y0 + (y1 - y0) * t;
                return (<motion.g key={c + j} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                  <path d={`M${px} ${py} h-34`} stroke="#cbd5e1" strokeWidth="1.5" /><text x={px - 38} y={py + 4} textAnchor="end" style={{ font: '500 11.5px "Plus Jakarta Sans"', fill: '#334155' }}>{trunc(c, 17)}</text></motion.g>); })}
            </AnimatePresence>
            {cs.length > 3 && <text x={x - 6} y={up ? 152 : 184} textAnchor="end" style={{ font: '700 11px "Plus Jakarta Sans"', fill: '#d97706' }}>+{cs.length - 3} lagi</text>}
          </g>
        );
      })}
      <rect x="530" y="118" width="106" height="94" rx="16" fill="url(#hg)" /><defs><linearGradient id="hg" x1="0" x2="1"><stop offset="0" stopColor="#0256f4" /><stop offset="1" stopColor="#22b8f5" /></linearGradient></defs>
      <foreignObject x="538" y="122" width="92" height="86"><div xmlns="http://www.w3.org/1999/xhtml" style={{ font: '700 11px/1.3 "Plus Jakarta Sans",sans-serif', color: '#fff', height: 86, display: 'flex', alignItems: 'center', overflow: 'hidden' }}>{trunc(st.problem || 'Masalah', 90)}</div></foreignObject>
    </svg>
  );
  const left = (
    <Card className="p-5 md:p-6">
      <label className="font-extrabold text-[14.5px] block mb-2">Masalah (kepala ikan)</label>
      <input className={inputCls} value={st.problem} onChange={(e) => save({ ...st, problem: e.target.value })} placeholder="Apa, di mana, seberapa besar" />
      <Eyebrow className="mt-6 mb-2.5">Pilih kategori — atau klik tulangnya</Eyebrow>
      <div className="flex flex-wrap gap-2">{CATS.map(([n], i) => (
        <Chip key={n} on={i === sel} onClick={() => setSel(i)}>{n}{(st.causes[i] || []).length > 0 && <span className="ml-1.5 inline-grid place-items-center w-5 h-5 rounded-full bg-amber-400 text-white text-[11px]">{st.causes[i].length}</span>}</Chip>
      ))}</div>
      <div className="mt-4 space-y-2 min-h-[48px]">
        <AnimatePresence initial={false}>
          {(st.causes[sel] || []).map((c, j) => (
            <motion.div key={c + j} layout initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex items-center gap-2 rounded-2xl bg-paper border border-line px-4 py-2.5 text-[14.5px]">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />{c}<span className="flex-1" />
              <button onClick={() => { const a = [...st.causes[sel]]; a.splice(j, 1); save({ ...st, causes: { ...st.causes, [sel]: a } }); }} className="text-ink-4 hover:text-rose-500"><X size={16} /></button>
            </motion.div>
          ))}
        </AnimatePresence>
        {!(st.causes[sel] || []).length && <p className="text-[14px] text-ink-4 py-2">Belum ada penyebab di {CATS[sel][0]}.</p>}
      </div>
      <div className="flex gap-2 mt-3"><input className={inputCls} value={inp} onChange={(e) => setInp(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add()} placeholder={`Tambah penyebab untuk ${CATS[sel][0]}…`} /><Btn className="!w-12 !px-0 shrink-0" onClick={add}><Plus size={20} /></Btn></div>
      <div className="flex gap-2 mt-5"><Btn variant="ghost" size="sm" onClick={() => save(FISH_EX)}>Pakai contoh</Btn><Btn variant="ghost" size="sm" onClick={() => save({ problem: '', causes: {} })}><Trash2 size={14} />Kosongkan</Btn></div>
    </Card>
  );
  const right = <div className="space-y-4"><Card className="p-3 md:p-4">{svg}</Card><OutPanel title="Prompt untuk AI" text={prompt} /></div>;
  return <LabLayout k="fishbone" title="Fishbone 6M" sub="Petakan semua kemungkinan penyebab sebelum memilih solusi. Isi per kategori, lalu bawa ke AI untuk diuji dan dilengkapi." left={left} right={right} />;
}

/* ── 5 Why (example = the source's own Soal 5) ── */
const WHY_EX = { problem: 'Hanya 20% pelanggan merespons undangan pemeliharaan berkala dari Unit Pelayanan', why: ['Undangan dikirim lewat SMS massal yang jarang dibaca', 'Tidak ada data nomor WhatsApp pelanggan yang aktif', 'Data kontak tidak diperbarui sejak pendaftaran sambungan', 'Tidak ada proses pembaruan data di setiap interaksi layanan', 'SOP layanan tidak mewajibkan verifikasi kontak — tidak ada pemilik proses data pelanggan'] };
export function FiveWhy() {
  const st = useStore('why', { problem: '', why: ['', '', '', '', ''] }); const save = (x) => store.set('why', x);
  const ok = (i) => (st.why[i] || '').trim().length >= 6;
  const rootOk = (st.why[4] || '').trim().length >= 6;
  useEffect(() => { if (rootOk) once('why:root', 15, document.getElementById('chain')); }, [rootOk]);
  const prompt = `Anda adalah fasilitator root cause analysis yang kritis.

KONTEKS: Saya melakukan 5 Why Analysis untuk masalah berikut:
MASALAH: ${st.problem || '[tulis masalah]'}
${st.why.map((w, i) => `Why ${i + 1}: ${w || '(belum dijawab)'}`).join('\n')}

TUGAS:
1. Periksa apakah setiap jawaban benar-benar penyebab langsung dari jawaban sebelumnya (bukan loncatan atau asosiasi).
2. Tunjukkan titik di mana rantai melemah, dan usulkan perbaikannya.
3. Nilai apakah Why terakhir sudah akar masalah yang bisa ditindaklanjuti (ada pemilik proses), atau perlu digali lagi.
4. Usulkan 3 tindakan perbaikan untuk akar masalah, masing-masing dengan indikator keberhasilan.

BATASAN: Jangan mengganti masalah awal. Jika butuh data tambahan, sebutkan data apa.
FORMAT: Tabel (Why | penilaian | saran), lalu 3 tindakan bernomor.`;
  const got = st.why.filter((_, i) => ok(i));
  const left = (
    <Card className="p-5 md:p-6">
      <label className="font-extrabold text-[14.5px] block mb-2">Masalah</label>
      <input className={inputCls} value={st.problem} onChange={(e) => save({ ...st, problem: e.target.value })} placeholder="Gejala yang terlihat — spesifik dan terukur" />
      <div id="chain" className="mt-6">
        {st.why.map((w, i) => { const lock = i > 0 && !ok(i - 1), root = i === 4 && ok(4);
          return (
            <motion.div key={i} animate={{ opacity: lock ? 0.35 : 1 }} className="relative pl-14 pb-5 last:pb-0">
              {i < 4 && <span className="absolute left-[19px] top-11 bottom-0 w-[3px] rounded-full bg-slate-200"><motion.span className="block w-full rounded-full grad-btn" animate={{ height: ok(i) ? '100%' : '0%' }} /></span>}
              <motion.span animate={{ scale: ok(i) ? [1, 1.2, 1] : 1 }} className={cx('absolute left-0 top-0 w-10 h-10 rounded-full grid place-items-center text-[12px] font-extrabold border-2',
                root ? 'bg-amber-400 border-amber-400 text-white' : ok(i) ? 'grad-btn border-transparent text-white' : 'bg-white border-slate-200 text-ink-3')}>{root ? '★' : `W${i + 1}`}</motion.span>
              <p className="!mb-1.5 text-[12px] font-bold uppercase tracking-wider text-ink-4 pt-2.5">Kenapa {i === 0 ? (st.problem ? `"${st.problem.slice(0, 50)}${st.problem.length > 50 ? '…' : ''}"` : 'masalah ini') : 'itu terjadi'}?</p>
              <input disabled={lock} className={inputCls} value={w} onChange={(e) => { const a = [...st.why]; a[i] = e.target.value; save({ ...st, why: a }); }} placeholder={lock ? `Terbuka setelah Why ${i} dijawab` : 'Karena…'} />
            </motion.div>
          ); })}
      </div>
      <div className="flex gap-2 mt-5"><Btn variant="ghost" size="sm" onClick={() => save(WHY_EX)}>Pakai contoh (Soal 5)</Btn><Btn variant="ghost" size="sm" onClick={() => save({ problem: '', why: ['', '', '', '', ''] })}><Trash2 size={14} />Kosongkan</Btn></div>
    </Card>
  );
  const right = (
    <div className="space-y-4">
      <Card className="p-5">
        <Eyebrow className="mb-3">Uji balik — baca dari akar ke masalah</Eyebrow>
        {got.length ? (
          <div className="space-y-2 text-[14.5px] text-ink-2">
            {[...got].reverse().map((w, i) => <motion.div key={w} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}><b className="text-amber-500">{i ? '→ sehingga ' : 'Karena '}</b>{w}</motion.div>)}
            <div><b className="text-amber-500">→ sehingga </b><b className="text-ink">{st.problem || 'masalah'}</b></div>
            {ok(4) && <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mt-3 rounded-2xl p-4 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200"><Eyebrow className="!text-amber-600 mb-1">Akar masalah</Eyebrow><p className="!mb-0 text-ink font-semibold">{st.why[4]}</p></motion.div>}
          </div>
        ) : <p className="text-ink-4 text-[14px]">Jawab Why pertama untuk mulai membangun rantai.</p>}
      </Card>
      <OutPanel title="Prompt untuk AI" text={prompt} />
    </div>
  );
  return <LabLayout k="5why" title="5 Why" sub='Jawab "kenapa?" lima kali. Pertanyaan berikutnya baru terbuka setelah yang sebelumnya dijawab, supaya rantainya tetap sebab-akibat.' left={left} right={right} />;
}

/* ── Pareto (illustrative numbers, labelled as such) ── */
const PAR_EX = [['Tagihan tidak sesuai', 320], ['Air tidak mengalir', 210], ['Air keruh', 120], ['Kebocoran pipa', 90], ['Meter rusak', 45], ['Sikap petugas', 25], ['Lainnya', 15]];
export function Pareto() {
  const rows = useStore('par', PAR_EX); const save = (x) => store.set('par', x);
  const r = rows.filter((x) => String(x[0]).trim() && +x[1] > 0).map((x) => [String(x[0]).trim(), +x[1]]).sort((a, b) => b[1] - a[1]);
  const tot = r.reduce((a, x) => a + x[1], 0); let c = 0;
  const out = r.map((x) => { c += x[1]; return { n: x[0], v: x[1], cum: tot ? (c / tot) * 100 : 0 }; });
  let vital = 0; out.forEach((x, i) => { if (!vital || Math.abs(x.cum - 80) < Math.abs(out[vital - 1].cum - 80)) vital = i + 1; });
  const prompt = `Anda adalah analis kualitas layanan di BUMD air minum.

KONTEKS: Berikut data jumlah kejadian per kategori masalah (total ${tot}):
${out.map((x, i) => `${i + 1}. ${x.n}: ${x.v} (${((x.v / (tot || 1)) * 100).toFixed(1)}%, kumulatif ${x.cum.toFixed(1)}%)`).join('\n')}

Analisis Pareto menunjukkan ${vital} kategori teratas menyumbang ±80% masalah.

TUGAS:
1. Konfirmasi kategori vital dan jelaskan mengapa fokus ke sana paling berdampak.
2. Untuk setiap kategori vital, uraikan kemungkinan akar masalah (gunakan 5 Why singkat).
3. Usulkan rencana aksi 30 hari untuk kategori vital, dengan target penurunan yang realistis.

BATASAN: Gunakan hanya angka di atas; tandai asumsi.
FORMAT: Tabel (kategori | % | akar masalah dugaan | aksi | target), lalu ringkasan 3 kalimat untuk pimpinan.`;
  const W = 560, H = 290, L = 36, R = 40, T = 22, B = 74, cw = W - L - R, ch = H - T - B, max = out.length ? out[0].v : 1, bw = out.length ? cw / out.length : cw;
  const pts = out.map((x, i) => [L + i * bw + bw / 2, T + ch - (x.cum / 100) * ch]);
  const chart = (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      <line x1={L} x2={W - R} y1={T + ch} y2={T + ch} stroke="#e2e8f0" />
      <line x1={L} x2={W - R} y1={T + ch * 0.2} y2={T + ch * 0.2} stroke="#f43f5e" strokeDasharray="5 5" strokeWidth="1.5" />
      <text x={W - R + 4} y={T + ch * 0.2 + 4} style={{ font: '700 11px "Plus Jakarta Sans"', fill: '#f43f5e' }}>80%</text>
      {out.map((x, i) => { const h = (x.v / max) * ch, xx = L + i * bw + bw * 0.14;
        return (<g key={x.n}>
          <motion.rect x={xx} width={bw * 0.72} rx="7" fill={i < vital ? 'url(#bg)' : '#e2e8f3'} initial={false} animate={{ y: T + ch - h, height: h }} transition={{ type: 'spring', stiffness: 160, damping: 20 }} />
          <motion.text animate={{ y: T + ch - h - 7 }} initial={false} x={xx + bw * 0.36} textAnchor="middle" style={{ font: '800 11.5px "Plus Jakarta Sans"', fill: i < vital ? '#2449c0' : '#94a3b8' }}>{x.v}</motion.text>
          <text transform={`translate(${xx + bw * 0.36},${T + ch + 14}) rotate(28)`} style={{ font: '600 10.5px "Plus Jakarta Sans"', fill: '#64748b' }}>{x.n.length > 16 ? x.n.slice(0, 15) + '…' : x.n}</text>
        </g>); })}
      {pts.length > 0 && <polyline points={pts.map((p) => p.join(',')).join(' ')} fill="none" stroke="#f59e0b" strokeWidth="3" strokeLinejoin="round" />}
      {pts.map((p, i) => <motion.circle key={i} initial={false} animate={{ cx: p[0], cy: p[1] }} r="4.5" fill="#fff" stroke="#f59e0b" strokeWidth="2.5" />)}
      <defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0256f4" /><stop offset="1" stopColor="#22b8f5" /></linearGradient></defs>
    </svg>
  );
  const left = (
    <Card className="p-5 md:p-6">
      <div className="grid grid-cols-[1fr_96px_32px] gap-2 mb-2 text-[12px] font-bold uppercase tracking-wider text-ink-4"><span>Kategori masalah</span><span className="text-right">Jumlah</span><span /></div>
      <AnimatePresence initial={false}>
        {rows.map((x, i) => (
          <motion.div key={i} layout initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="grid grid-cols-[1fr_96px_32px] gap-2 mb-2 items-center">
            <input className={cx(inputCls, '!py-2.5')} value={x[0]} onChange={(e) => { const a = rows.map((y) => [...y]); a[i][0] = e.target.value; save(a); }} placeholder="Kategori" />
            <input className={cx(inputCls, '!py-2.5 text-right tabular-nums font-bold')} inputMode="numeric" value={x[1]} onChange={(e) => { const a = rows.map((y) => [...y]); a[i][1] = e.target.value.replace(/\D/g, ''); save(a); }} placeholder="0" />
            <button onClick={() => save(rows.filter((_, j) => j !== i))} className="text-ink-4 hover:text-rose-500 grid place-items-center"><X size={17} /></button>
          </motion.div>
        ))}
      </AnimatePresence>
      <div className="flex flex-wrap gap-2 mt-4"><Btn variant="soft" size="sm" onClick={() => save([...rows, ['', '']])}><Plus size={15} />Tambah baris</Btn><Btn variant="ghost" size="sm" onClick={() => save(PAR_EX)}>Pakai contoh</Btn><Btn variant="ghost" size="sm" onClick={() => save([['', ''], ['', ''], ['', '']])}><Trash2 size={14} />Kosongkan</Btn></div>
      <p className="text-[12.5px] text-ink-4 mt-4">Angka contoh hanya ilustrasi untuk latihan — ganti dengan data unit Anda.</p>
    </Card>
  );
  const right = (
    <div className="space-y-4">
      <Card className="p-4">{chart}
        {out.length > 0 && <div className="mt-3 rounded-2xl p-4 bg-brand-50/70 border border-brand-100 text-[14px] text-ink-2"><b className="text-brand-700">{vital} dari {out.length} kategori</b> menyumbang {out[vital - 1]?.cum.toFixed(0)}% dari {tot} kejadian: {out.slice(0, vital).map((x) => x.n).join(', ')}. Fokuskan perbaikan di sini dulu.</div>}
      </Card>
      <OutPanel title="Prompt untuk AI" text={prompt} />
    </div>
  );
  return <LabLayout k="pareto" title="Pareto 80/20" sub="Masukkan kategori dan jumlahnya. Grafik mengurutkan otomatis, menggambar garis kumulatif, dan menandai penyebab vital." left={left} right={right} />;
}
