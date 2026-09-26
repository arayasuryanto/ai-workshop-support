#!/usr/bin/env python3
"""Capture HTML slide decks slide-by-slide: text + screenshot for every slide.
    python3 decks.py <base> <deck-path> [<deck-path> ...]
Out: out/decks/<deck-name>/slide-NN.png, deck.json (per-slide text), deck.md."""
import json, os, re, sys
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'out', 'decks')

VISIBLE_TEXT = r"""
() => {
  // the slide that is actually on screen: largest visible element that looks like a slide
  const cands = [...document.querySelectorAll('section, .slide, [class*="slide"], [data-slide], article')]
    .filter(e => { const r = e.getBoundingClientRect(), s = getComputedStyle(e);
      return r.width > innerWidth * .5 && r.height > innerHeight * .4 && s.visibility !== 'hidden' && s.display !== 'none' && +s.opacity > .5
        && r.left < innerWidth * .5 && r.right > innerWidth * .5; });
  const el = cands.sort((a, b) => (b.getBoundingClientRect().width * b.getBoundingClientRect().height) - (a.getBoundingClientRect().width * a.getBoundingClientRect().height))
    .find(e => (e.innerText || '').trim().length > 0) || document.body;
  return (el.innerText || '').trim();
}
"""


def capture(base, path):
    name = re.sub(r'[^a-zA-Z0-9\-_]', '_', path.strip('/').replace('/index.html', '').replace('.html', ''))
    d = os.path.join(OUT, name); os.makedirs(d, exist_ok=True)
    slides, prev = [], None
    with sync_playwright() as pw:
        b = pw.chromium.launch()
        pg = b.new_page(viewport={'width': 1440, 'height': 810}, device_scale_factor=1)
        pg.goto(base.rstrip('/') + path, wait_until='networkidle'); pg.wait_for_timeout(900)
        title = pg.title()
        # counter like "1 / 22" if the deck shows one
        total = None
        m = re.search(r'\b1\s*/\s*(\d{1,3})\b', pg.inner_text('body'))
        if m: total = int(m.group(1))
        limit = (total or 80) + 2
        same = 0
        for i in range(limit):
            txt = pg.evaluate(VISIBLE_TEXT)
            shot = os.path.join(d, f'slide-{len(slides) + 1:02d}.png')
            if txt == prev:
                same += 1
                if same >= 2: break          # the deck stopped advancing
            else:
                same = 0
                pg.screenshot(path=shot)
                slides.append({'n': len(slides) + 1, 'text': txt})
            prev = txt
            pg.keyboard.press('ArrowRight'); pg.wait_for_timeout(450)
        b.close()
    json.dump({'title': title, 'url': base + path, 'declared_total': total, 'slides': slides},
              open(os.path.join(d, 'deck.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    md = [f'# {title}', '', f'Source: {base}{path} · {len(slides)} slide', '']
    for s in slides: md += [f'## Slide {s["n"]}', '', f'![](slide-{s["n"]:02d}.png)', '', s['text'], '']
    open(os.path.join(d, 'deck.md'), 'w', encoding='utf-8').write('\n'.join(md))
    return name, len(slides), total


if __name__ == '__main__':
    base = sys.argv[1]
    for p in sys.argv[2:]:
        try:
            n, got, tot = capture(base, p)
            print(f'  {n:58s} slides={got:3d}  declared={tot}')
        except Exception as e:
            print(f'  {p:58s} FAILED {str(e)[:80]}')
