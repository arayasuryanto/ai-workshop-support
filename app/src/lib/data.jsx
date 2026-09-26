import { createContext, useContext, useEffect, useState } from 'react';
const Ctx = createContext(null);
export const useData = () => useContext(Ctx);
export function DataProvider({ children }) {
  const [d, setD] = useState(null);
  useEffect(() => {
    Promise.all([fetch('program.json').then((r) => r.json()), fetch('quiz.json').then((r) => r.json())])
      .then(([P, Q]) => setD({ P, Q, all: P.groups.flatMap((g) => g.sessions) }));
  }, []);
  if (!d) return <div className="min-h-screen grid place-items-center"><div className="w-10 h-10 rounded-full border-4 border-brand-100 border-t-brand animate-spin" /></div>;
  return <Ctx.Provider value={d}>{children}</Ctx.Provider>;
}
