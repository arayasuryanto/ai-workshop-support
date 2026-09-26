"""PDF per module: renders prototype #/cetak/<slug> in Chromium and prints A4 → prototype/pdf/<slug>.pdf.
    python3 scrape/make_pdfs.py [slug ...]      (needs the prototype served on :8767)"""
import json, os, sys
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'prototype', 'pdf'); os.makedirs(OUT, exist_ok=True)
P = json.load(open(os.path.join(ROOT, 'prototype', 'program.json')))
slugs = sys.argv[1:] or [s for g in P['groups'] for s in g['sessions']]
with sync_playwright() as pw:
    b = pw.chromium.launch(); pg = b.new_page()
    for s in slugs:
        pg.goto(f'http://127.0.0.1:8767/#/cetak/{s}', wait_until='networkidle')
        pg.evaluate("location.reload()"); pg.wait_for_load_state('networkidle'); pg.wait_for_selector('.doc h1'); pg.wait_for_timeout(300)
        pg.emulate_media(media='print')
        f = os.path.join(OUT, f'{s}.pdf')
        pg.pdf(path=f, format='A4', print_background=True, prefer_css_page_size=True,
               display_header_footer=True, header_template='<span></span>',
               footer_template='<div style="font:8px monospace;color:#7a8ea6;width:100%;text-align:center"><span class="pageNumber"></span> / <span class="totalPages"></span></div>')
        print(f'{s:45s} {os.path.getsize(f)//1024:5d} KB')
    b.close()
