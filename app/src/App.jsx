import { useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
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
    <DataProvider><ToastHost><HashRouter><ScrollTop />
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
        <Route path="*" element={S(<Home />)} />
      </Routes>
    </HashRouter></ToastHost></DataProvider>
  );
}
