'use client';
import { useSyncExternalStore } from 'react';
/* Tiny localStorage store (progress pills). SSR-safe: returns the default on the server. */
const PFX = 'wl:'; const subs = new Set(); const cache = new Map(); let ver = 0;
export const store = {
  get(k, d) { if (cache.has(k)) return cache.get(k); if (typeof window === 'undefined') return d; try { const v = localStorage.getItem(PFX + k); const r = v == null ? d : JSON.parse(v); cache.set(k, r); return r; } catch { return d; } },
  set(k, v) { cache.set(k, v); try { localStorage.setItem(PFX + k, JSON.stringify(v)); } catch {} ver++; subs.forEach((f) => f()); },
};
export function useStore(k, d) {
  useSyncExternalStore((f) => { subs.add(f); return () => subs.delete(f); }, () => ver, () => 0);
  return store.get(k, d);
}
/* Course framework colours: PERAN – KONTEKS – TUGAS – BATASAN – FORMAT */
export const KCOLOR = { peran: '#3b82f6', konteks: '#8b5cf6', tugas: '#f59e0b', batasan: '#f43f5e', format: '#10b981', lain: '#94a3b8' };
