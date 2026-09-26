#!/usr/bin/env python3
"""Second pass for form-driven prompt tools (Case Study, Workshop Analysis).

Their prompt only exists after you fill the form and press "Generate Prompt", so a plain crawl sees
nothing. For each tool page: fill every field with a labelled marker «Label», pick the first option of
every chip/select group, press Generate, then capture what Copy puts on the clipboard. The markers show
exactly where each input lands inside the template.

Writes pages/<slug>/generated.json and generated.md.
"""
import json, os, re, sys
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import importlib.util
spec = importlib.util.spec_from_file_location('crawl', os.path.join(HERE, 'crawl.py'))
crawl = importlib.util.module_from_spec(spec); spec.loader.exec_module(crawl)

BASE = 'https://workshop-ai-pamjaya.vercel.app'
OUT = os.path.join(HERE, 'out', 'workshop-ai-pamjaya.vercel.app', 'pages')

FIELDS_JS = r"""
() => [...document.querySelectorAll('input:not([type=hidden]):not([type=checkbox]):not([type=radio]), textarea, select')]
  .filter(e => e.offsetParent !== null)
  .map((e, i) => {
    let label = (e.labels && e.labels[0] ? e.labels[0].innerText : '') || e.getAttribute('aria-label') || e.placeholder || '';
    if (!label) {
      let p = e.parentElement, hops = 0;
      while (p && hops < 4 && !label) { const l = p.querySelector('label'); if (l) label = l.innerText; p = p.parentElement; hops++; }
    }
    e.setAttribute('data-gp', i);
    return {i, tag: e.tagName.toLowerCase(), type: e.type || '', label: label.trim().replace(/\s*\*$/, ''),
            placeholder: e.placeholder || '', required: !!e.required,
            options: e.tagName === 'SELECT' ? [...e.options].map(o => o.text) : []};
  })
"""


def run(slug_path):
    url = BASE + slug_path
    slug = crawl.slug_for(url, BASE)
    with sync_playwright() as pw:
        b = pw.chromium.launch()
        ctx = b.new_context(viewport={'width': 1366, 'height': 900}, permissions=['clipboard-read', 'clipboard-write'])
        ctx.add_init_script(crawl.CLIPBOARD_HOOK)
        pg = ctx.new_page(); pg.goto(url, wait_until='networkidle'); pg.wait_for_timeout(800)
        fields = pg.evaluate(FIELDS_JS)
        for f in fields:
            loc = pg.locator(f'[data-gp="{f["i"]}"]')
            try:
                if f['tag'] == 'select':
                    opts = [o for o in f['options'] if o.strip()]
                    if len(opts) > 1: loc.select_option(index=1)
                elif f['type'] == 'number':
                    loc.fill('123')
                elif f['type'] == 'date':
                    loc.fill('2026-09-24')
                else:
                    loc.fill('«' + (f['label'] or f['placeholder'] or f'field{f["i"]}')[:60] + '»')
            except Exception as e:
                f['fill_error'] = str(e)[:80]
        # chip / segmented choices: record every group's options, press the first of each
        chips = pg.evaluate(r"""() => {
          const out = [];
          document.querySelectorAll('button[aria-pressed], [role="radio"], [role="option"]').forEach(b => out.push((b.innerText||'').trim()));
          return out.filter(Boolean);
        }""")
        before = pg.evaluate('window.__copies.length')
        gen_text = ''
        for name in ['Generate Prompt', 'Generate', 'Buat Prompt', 'Susun Prompt']:
            btn = pg.get_by_role('button', name=re.compile(name, re.I))
            if btn.count():
                try:
                    btn.first.click(timeout=3000); pg.wait_for_timeout(700); break
                except Exception:
                    pass
        # the generated prompt usually renders in a <pre>/<textarea> — read it, then press Copy too
        gen_text = pg.evaluate(r"""() => {
          const c = [...document.querySelectorAll('pre, textarea[readonly], [data-generated], code')].map(e => e.value || e.innerText || '');
          return c.sort((a, b) => b.length - a.length)[0] || '';
        }""")
        for name in ['Copy Prompt', 'Salin Prompt', 'Copy', 'Salin']:
            btn = pg.get_by_role('button', name=re.compile('^' + name, re.I))
            if btn.count():
                try:
                    btn.first.click(timeout=3000); pg.wait_for_timeout(300); break
                except Exception:
                    pass
        copies = pg.evaluate(f'window.__copies.slice({before})')
        errors = pg.evaluate(r"""() => [...document.querySelectorAll('[role=alert], .text-red-500, .text-destructive')].map(e => e.innerText.trim()).filter(Boolean)""")
        b.close()
    copied = copies[-1]['text'] if copies else ''
    res = {'url': url, 'fields': fields, 'choices': chips, 'generated_visible': gen_text,
           'copied': copied, 'validation_errors': errors}
    d = os.path.join(OUT, slug); os.makedirs(d, exist_ok=True)
    json.dump(res, open(os.path.join(d, 'generated.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    text = copied or gen_text
    md = [f'# Generated prompt — {slug_path}', '', '## Form fields', '']
    for f in fields:
        md.append(f"- **{f['label'] or f['placeholder'] or '(tanpa label)'}** · {f['tag']}{'/'+f['type'] if f['type'] else ''}"
                  + (' · wajib' if f['required'] else '') + (f" · opsi: {', '.join(o for o in f['options'] if o)}" if f['options'] else ''))
    if chips: md += ['', '## Pilihan (chip)', '', ', '.join(chips)]
    md += ['', '## Prompt yang dihasilkan (penanda «…» = isian peserta)', '', '```', text.rstrip(), '```']
    open(os.path.join(d, 'generated.md'), 'w', encoding='utf-8').write('\n'.join(md))
    return slug_path, len(fields), len(text), bool(copied), errors


if __name__ == '__main__':
    sm = json.load(open(os.path.join(HERE, 'out', 'workshop-ai-pamjaya.vercel.app', 'sitemap.json')))
    targets = [m['url'][len(BASE):] for m in sm if m['url'][len(BASE):].startswith(('/case-study/', '/workshop-analysis'))]
    for t in targets:
        try:
            p, nf, nt, via_copy, err = run(t)
            print(f"  {p:42s} fields={nf:2d} prompt_chars={nt:5d} via_copy={via_copy} {('ERR ' + str(err)[:60]) if err else ''}")
        except Exception as e:
            print(f"  {t:42s} FAILED {str(e)[:90]}")
