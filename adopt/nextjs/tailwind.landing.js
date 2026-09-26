/* Tailwind v3: merge into theme.extend of your tailwind.config.js */
module.exports = {
  fontFamily: { sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'], mono: ['"Geist Mono"', 'ui-monospace', 'monospace'] },
  colors: {
    ink: { DEFAULT: '#0f172a', 2: '#334155', 3: '#64748b', 4: '#94a3b8' },
    line: '#e6ebf3', paper: '#f7f9fc',
    brand: { DEFAULT: '#0256f4', 50: '#eaf1ff', 100: '#d3e2ff', 200: '#a9c6ff', 600: '#024ad6', 700: '#023db0' },
    sky: { DEFAULT: '#22b8f5', 50: '#e9f8ff', 100: '#cdefff', 400: '#38bdf8', 600: '#0891c9' },
    mint: '#10b981',
  },
  boxShadow: {
    soft: '0 1px 2px rgba(15,23,42,.04), 0 8px 24px -8px rgba(15,23,42,.08)',
    lift: '0 2px 4px rgba(15,23,42,.04), 0 18px 40px -12px rgba(15,23,42,.16)',
    glow: '0 10px 30px -8px rgba(2,86,244,.45)',
  },
  borderRadius: { '4xl': '28px' },
};
