#!/usr/bin/env python3
"""Rendered-browser crawl of a workshop site — the scrape is the spec for the rebuild.

    python3 crawl.py https://workshop-ai-pamjaya.vercel.app [--max 400]

Per page (out/<host>/pages/<slug>/):
  page.html        rendered DOM after JS
  content.md       readable content in document order (headings, text, lists, tables, code, images)
  blocks.json      the same content as typed blocks — the structure the new UI is built from
  copies.json      EXACTLY what every copy button puts on the clipboard (clipboard is intercepted)
  meta.json        title, url, links in/out, forms, buttons, word count, status
  desktop.png / mobile.png   full-page screenshots
Site level (out/<host>/): sitemap.json, SITEMAP.md, assets/ (every image, original file).
"""
import argparse, hashlib, json, os, re, sys, time, urllib.parse, urllib.request
from collections import deque
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))

EXTRACT_JS = r"""
() => {
  const root = document.querySelector('main') || document.body;
  const out = [];
  const seen = new Set();
  const txt = (e) => (e.innerText || '').replace(/ /g,' ').trim();
  const hidden = (e) => { const s = getComputedStyle(e); return s.display === 'none' || s.visibility === 'hidden'; };
  const walk = (e, depth) => {
    if (!e || e.nodeType !== 1 || seen.has(e)) return;
    const tag = e.tagName.toLowerCase();
    if (['script','style','noscript','svg','nav','footer'].includes(tag) && e !== root) {
      if (tag === 'nav' || tag === 'footer') { const t = txt(e); if (t) out.push({type: tag, text: t}); }
      return;
    }
    const collapsed = hidden(e);
    if (/^h[1-6]$/.test(tag)) { seen.add(e); out.push({type:'heading', level:+tag[1], text: txt(e) || (e.textContent||'').trim(), hidden: collapsed}); return; }
    if (tag === 'pre' || tag === 'textarea') { seen.add(e); out.push({type:'code', text: tag==='textarea' ? e.value : (e.textContent||''), hidden: collapsed}); return; }
    if (tag === 'img') { seen.add(e); out.push({type:'image', src: e.currentSrc || e.src, alt: e.alt || ''}); return; }
    if (tag === 'table') {
      seen.add(e);
      const rows = [...e.querySelectorAll('tr')].map(r => [...r.children].map(c => (c.innerText||c.textContent||'').trim()));
      out.push({type:'table', rows}); return;
    }
    if (tag === 'ul' || tag === 'ol') {
      seen.add(e);
      const items = [...e.children].filter(c => c.tagName === 'LI').map(li => (li.innerText || li.textContent || '').trim());
      out.push({type:'list', ordered: tag==='ol', items, hidden: collapsed}); return;
    }
    if (tag === 'blockquote') { seen.add(e); out.push({type:'quote', text: txt(e) || e.textContent.trim()}); return; }
    if (tag === 'button' || (tag === 'a' && e.getAttribute('role') === 'button')) {
      seen.add(e); const t = txt(e) || e.getAttribute('aria-label') || e.title || '';
      if (t) out.push({type:'button', text: t}); return;
    }
    if (tag === 'details') {
      seen.add(e); const s = e.querySelector('summary');
      out.push({type:'details', summary: s ? s.textContent.trim() : '', text: (e.textContent||'').trim()}); return;
    }
    if (tag === 'p' || tag === 'figcaption' || tag === 'label') {
      seen.add(e); const t = txt(e) || (e.textContent||'').trim();
      if (t) out.push({type:'text', text: t, hidden: collapsed}); return;
    }
    // leaf block with direct text (div/span-built UIs)
    const direct = [...e.childNodes].filter(n => n.nodeType === 3 && n.textContent.trim()).map(n => n.textContent.trim()).join(' ');
    const blockish = ['div','section','article','span','li','td','strong','header','aside'].includes(tag);
    if (blockish && direct && e.children.length === 0) { seen.add(e); out.push({type:'text', text: direct, hidden: collapsed}); return; }
    for (const c of e.children) walk(c, depth + 1);
    if (blockish && direct && e.children.length > 0) out.push({type:'text', text: direct, hidden: collapsed, mixed: true});
  };
  walk(root, 0);
  const links = [...document.querySelectorAll('a[href]')].map(a => ({href: a.href, text: (a.innerText||'').trim().slice(0,120)}));
  const forms = [...document.querySelectorAll('form')].map(f => ({
    action: f.getAttribute('action') || '', method: f.method,
    fields: [...f.querySelectorAll('input,select,textarea')].map(i => ({name: i.name, type: i.type, placeholder: i.placeholder || '', label: (i.labels && i.labels[0] ? i.labels[0].innerText : '')}))
  }));
  return {title: document.title, h1: (document.querySelector('h1')||{}).innerText || '', blocks: out, links, forms,
          words: (root.innerText || '').split(/\s+/).filter(Boolean).length};
}
"""

# Record everything written to the clipboard, and make copy buttons think they succeeded.
CLIPBOARD_HOOK = r"""
window.__copies = [];
const rec = (t, how) => window.__copies.push({text: String(t), how, at: Date.now()});
try {
  const cb = navigator.clipboard || {};
  Object.defineProperty(navigator, 'clipboard', {configurable: true, value: {
    writeText: (t) => { rec(t, 'writeText'); return Promise.resolve(); },
    write: async (items) => {
      for (const it of items || []) for (const ty of (it.types || [])) {
        try { const b = await it.getType(ty); rec(await b.text(), 'write:' + ty); } catch (e) {}
      }
      return Promise.resolve();
    },
    readText: () => Promise.resolve(''),
  }});
} catch (e) {}
document.addEventListener('copy', (e) => {
  const s = (window.getSelection && String(window.getSelection())) || '';
  if (s) rec(s, 'selection');
}, true);
const oldExec = document.execCommand ? document.execCommand.bind(document) : null;
document.execCommand = function (cmd) {
  if (String(cmd).toLowerCase() === 'copy') {
    const s = (window.getSelection && String(window.getSelection())) || (document.activeElement && document.activeElement.value) || '';
    rec(s, 'execCommand');
    return true;
  }
  return oldExec ? oldExec.apply(document, arguments) : false;
};
"""

COPY_LABEL = re.compile(r"(salin|copy|kopi|copied|tersalin)", re.I)


def slug_for(url, base):
    p = urllib.parse.urlparse(url).path.strip('/') or 'index'
    return re.sub(r'[^a-zA-Z0-9\-_/]', '_', p).replace('/', '__')


def to_md(title, url, blocks, copies):
    L = [f"# {title}", "", f"Source: {url}", ""]
    for b in blocks:
        t = b.get('type')
        tag = ' *(tersembunyi / collapsed)*' if b.get('hidden') else ''
        if t == 'heading': L += ['', '#' * min(6, b['level'] + 1) + ' ' + b['text'] + tag, '']
        elif t == 'text': L += [b['text'] + tag, '']
        elif t == 'list':
            for i, it in enumerate(b['items'], 1):
                L.append((f"{i}. " if b.get('ordered') else '- ') + it.replace('\n', ' '))
            L.append('')
        elif t == 'code': L += ['```', b['text'].rstrip(), '```' + tag, '']
        elif t == 'quote': L += ['> ' + b['text'].replace('\n', '\n> '), '']
        elif t == 'image': L += [f"![{b.get('alt','')}]({b.get('local') or b['src']})", '']
        elif t == 'table' and b['rows']:
            rows = b['rows']; w = max(len(r) for r in rows)
            rows = [r + [''] * (w - len(r)) for r in rows]
            L.append('| ' + ' | '.join(c.replace('\n', ' ') for c in rows[0]) + ' |')
            L.append('|' + '---|' * w)
            for r in rows[1:]: L.append('| ' + ' | '.join(c.replace('\n', ' ') for c in r) + ' |')
            L.append('')
        elif t == 'details': L += [f"<details><summary>{b['summary']}</summary>", '', b['text'], '</details>', '']
        elif t == 'button': L += [f"`[tombol: {b['text']}]`", '']
    if copies:
        L += ['', '---', '', '## Teks yang disalin oleh tombol salin', '']
        for i, c in enumerate(copies, 1):
            L += [f"### Salinan {i} — tombol: {c.get('button','?')}", '', '```', c['text'].rstrip(), '```', '']
    return '\n'.join(L)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('url'); ap.add_argument('--max', type=int, default=400)
    ap.add_argument('--seeds', nargs='*', default=[])
    ap.add_argument('--state', default=None, help='saved login session (storage_state json)')
    ap.add_argument('--only', action='store_true', help='visit the seeds only, do not follow links')
    ap.add_argument('--tag', default='', help='suffix for the output folder, e.g. -auth')
    a = ap.parse_args()
    start = a.url.rstrip('/')
    host = urllib.parse.urlparse(start).netloc
    OUT = os.path.join(HERE, 'out', host + a.tag); PAGES = os.path.join(OUT, 'pages'); ASSETS = os.path.join(OUT, 'assets')
    os.makedirs(PAGES, exist_ok=True); os.makedirs(ASSETS, exist_ok=True)

    def norm(u):
        u = urllib.parse.urljoin(start + '/', u)
        pu = urllib.parse.urlparse(u)
        if pu.netloc != host or pu.scheme not in ('http', 'https'): return None
        # never touch pages that hold participants' personal data, or that change state
        if re.match(r'^/(users|profile|admin|auth|logout|signout)(/|$)', pu.path): return None
        if pu.path.startswith(('/_next/', '/api/')) or re.search(r'\.(png|jpe?g|webp|gif|svg|ico|pdf|js|css|woff2?)$', pu.path, re.I):
            return None
        return f"{pu.scheme}://{pu.netloc}{pu.path.rstrip('/') or '/'}"

    first = [] if a.only else [start + '/']
    q = deque([norm(s) for s in [*first, *[start + s for s in a.seeds]] if norm(s)])
    seen = set(q); sitemap = []; asset_map = {}

    with sync_playwright() as pw:
        b = pw.chromium.launch()
        ctx = b.new_context(viewport={'width': 1366, 'height': 900}, device_scale_factor=1,
                            permissions=['clipboard-read', 'clipboard-write'], storage_state=a.state)
        ctx.add_init_script(CLIPBOARD_HOOK)
        mctx = b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True,
                             storage_state=a.state)
        while q and len(sitemap) < a.max:
            url = q.popleft()
            slug = slug_for(url, start); pdir = os.path.join(PAGES, slug); os.makedirs(pdir, exist_ok=True)
            pg = ctx.new_page()
            status = None
            try:
                r = pg.goto(url, wait_until='networkidle', timeout=45000); status = r.status if r else None
            except Exception as e:
                print('  ! goto', url, e); status = 'error'
            pg.wait_for_timeout(700)
            # open every collapsed thing so its content is in the rendered DOM
            try:
                pg.evaluate("""() => { document.querySelectorAll('details').forEach(d => d.open = true); }""")
                for sel in ['[aria-expanded="false"]', 'button[data-state="closed"]', '[role="tab"]']:
                    for el in pg.query_selector_all(sel)[:60]:
                        try: el.click(timeout=800); pg.wait_for_timeout(80)
                        except Exception: pass
            except Exception: pass

            data = pg.evaluate(EXTRACT_JS)
            # press every copy button and record what lands on the clipboard
            copies = []
            try:
                btns = [x for x in pg.query_selector_all('button, [role="button"]')
                        if COPY_LABEL.search((x.inner_text() or '') + ' ' + (x.get_attribute('aria-label') or '') + ' ' + (x.get_attribute('title') or ''))]
                for btn in btns[:120]:
                    label = ((btn.inner_text() or '').strip() or btn.get_attribute('aria-label') or btn.get_attribute('title') or '').strip()
                    before = pg.evaluate('window.__copies.length')
                    try:
                        btn.scroll_into_view_if_needed(timeout=1500); btn.click(timeout=1500); pg.wait_for_timeout(180)
                    except Exception: continue
                    new = pg.evaluate(f'window.__copies.slice({before})')
                    for c in new:
                        if c['text'].strip(): copies.append({'button': label[:80], 'text': c['text'], 'how': c['how']})
            except Exception as e:
                print('  ! copy pass', e)
            # de-duplicate identical copies
            u = []; seen_c = set()
            for c in copies:
                h = hashlib.md5(c['text'].encode()).hexdigest()
                if h not in seen_c: seen_c.add(h); u.append(c)
            copies = u

            # images → local assets
            for blk in data['blocks']:
                if blk.get('type') != 'image' or not blk.get('src'): continue
                src = blk['src']
                m = re.search(r'[?&]url=([^&]+)', src)
                orig = urllib.parse.urljoin(start + '/', urllib.parse.unquote(m.group(1))) if m else src
                if orig not in asset_map:
                    name = re.sub(r'[^a-zA-Z0-9\.\-_]', '_', urllib.parse.urlparse(orig).path.strip('/')) or hashlib.md5(orig.encode()).hexdigest()
                    dest = os.path.join(ASSETS, name)
                    try:
                        if not os.path.exists(dest):
                            with urllib.request.urlopen(urllib.request.Request(orig, headers={'User-Agent': 'Mozilla/5.0'}), timeout=30) as resp:
                                open(dest, 'wb').write(resp.read())
                        asset_map[orig] = 'assets/' + name
                    except Exception:
                        asset_map[orig] = orig
                blk['local'] = '../../' + asset_map[orig] if asset_map[orig].startswith('assets/') else asset_map[orig]

            open(os.path.join(pdir, 'page.html'), 'w', encoding='utf-8').write(pg.content())
            json.dump(data['blocks'], open(os.path.join(pdir, 'blocks.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
            json.dump(copies, open(os.path.join(pdir, 'copies.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
            open(os.path.join(pdir, 'content.md'), 'w', encoding='utf-8').write(to_md(data['h1'] or data['title'], url, data['blocks'], copies))
            try: pg.screenshot(path=os.path.join(pdir, 'desktop.png'), full_page=True)
            except Exception: pass
            pg.close()
            try:
                mp = mctx.new_page(); mp.goto(url, wait_until='networkidle', timeout=45000); mp.wait_for_timeout(500)
                mp.screenshot(path=os.path.join(pdir, 'mobile.png'), full_page=True); mp.close()
            except Exception: pass

            outlinks = []
            for l in data['links']:
                n = norm(l['href'])
                if n: outlinks.append(n)
                if n and n not in seen and not a.only: seen.add(n); q.append(n)
            meta = {'url': url, 'slug': slug, 'status': status, 'title': data['title'], 'h1': data['h1'],
                    'words': data['words'], 'blocks': len(data['blocks']), 'copies': len(copies),
                    'headings': [bk['text'] for bk in data['blocks'] if bk.get('type') == 'heading'],
                    'buttons': sorted({bk['text'] for bk in data['blocks'] if bk.get('type') == 'button'}),
                    'forms': data['forms'], 'links_out': sorted(set(outlinks))}
            json.dump(meta, open(os.path.join(pdir, 'meta.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
            sitemap.append(meta)
            print(f"  [{len(sitemap):3d}] {status} {url[len(start):] or '/':52s} words={data['words']:5d} blocks={len(data['blocks']):4d} copies={len(copies):3d}")
        b.close()

    # inbound links
    inbound = {m['url']: [] for m in sitemap}
    for m in sitemap:
        for l in m['links_out']:
            if l in inbound and m['url'] not in inbound[l]: inbound[l].append(m['url'])
    for m in sitemap: m['links_in'] = sorted(inbound.get(m['url'], []))
    json.dump(sitemap, open(os.path.join(OUT, 'sitemap.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    tot_w = sum(m['words'] for m in sitemap); tot_c = sum(m['copies'] for m in sitemap)
    with open(os.path.join(OUT, 'SITEMAP.md'), 'w', encoding='utf-8') as f:
        f.write(f"# Sitemap — {host}\n\nCrawled {time.strftime('%Y-%m-%d %H:%M')} · {len(sitemap)} pages · {tot_w:,} words · {tot_c} copy blocks · {len(asset_map)} assets\n\n")
        f.write('| # | Path | Title / H1 | Words | Copies | Status |\n|---|---|---|---|---|---|\n')
        for i, m in enumerate(sitemap, 1):
            f.write(f"| {i} | `{urllib.parse.urlparse(m['url']).path}` | {(m['h1'] or m['title']).replace('|','/')[:70]} | {m['words']} | {m['copies']} | {m['status']} |\n")
    print(f"\nDONE {len(sitemap)} pages · {tot_w:,} words · {tot_c} copy blocks · {len(asset_map)} assets → {OUT}")


if __name__ == '__main__':
    main()
