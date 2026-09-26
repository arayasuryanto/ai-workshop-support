import { useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';

/* Until the platform owner wires this in, only the landing is public. Every other route redirects to the
   original platform. Preview of the built modules: run `localStorage.setItem('wl:preview','1')` in the console. */
const SRC = 'https://workshop-ai-pamjaya.vercel.app';
const MAP = { '/peta': '/materi', '/lab': '/case-study', '/prompt': '/prompt-library', '/latihan': '/pre-test', '/sesi': '/materi' };
const preview = () => { try { return localStorage.getItem('wl:preview') === '1'; } catch { return false; } };
function Gate({ children }) {
  const { pathname } = useLocation();
  const open = pathname === '/' || preview();
  useEffect(() => { if (!open) { const k = Object.keys(MAP).find((m) => pathname.startsWith(m)); window.location.replace(SRC + (k ? MAP[k] : '/')); } }, [open, pathname]);
  return open ? children : null;
}
import { DataProvider } from './lib/data.jsx';
import { ToastHost, Shell } from './components/ui';
import { Home } from './pages/Home';
import { Landing } from './pages/Landing';
import { Player } from './pages/Player';
import { LabHub, Builder, Fishbone, FiveWhy, Pareto } from './pages/Lab';
import { Library, Tool } from './pages/Library';
import { QuizHome, QuizQ, QuizResult } from './pages/Quiz';

function ScrollTop() { const { pathname } = useLocation(); useEffect(() => { if (!pathname.startsWith('/sesi')) window.scrollTo({ top: 0 }); }, [pathname]); return null; }
const S = (el, tone) => <Shell tone={tone}>{el}</Shell>;

export default function App() {
  return (
    <DataProvider><ToastHost><HashRouter><ScrollTop /><Gate>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/peta" element={S(<Home />)} />
        <Route path="/sesi/:slug/:step?" element={<Player />} />
        <Route path="/lab" element={S(<LabHub />)} />
        <Route path="/lab/prompt" element={S(<Builder />)} />
        <Route path="/lab/fishbone" element={S(<Fishbone />)} />
        <Route path="/lab/5why" element={S(<FiveWhy />)} />
        <Route path="/lab/pareto" element={S(<Pareto />)} />
        <Route path="/prompt" element={S(<Library />)} />
        <Route path="/prompt/:id" element={S(<Tool />)} />
        <Route path="/latihan" element={S(<QuizHome />, 'peach')} />
        <Route path="/latihan/hasil" element={S(<QuizResult />, 'peach')} />
        <Route path="/latihan/:n" element={S(<QuizQ />, 'peach')} />
        <Route path="*" element={<Landing />} />
      </Routes>
    </Gate></HashRouter></ToastHost></DataProvider>
  );
}
