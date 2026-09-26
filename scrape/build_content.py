#!/usr/bin/env python3
"""Scrape → one clean content model (content/program.json) that the new platform AND the per-module
PDFs are both built from.

Program → Days → Sessions → Sections → Blocks, plus Supplements, Assessment, and Tools
(Prompt Library + Case Study from PROMPTS.json). Site chrome is stripped; the lesson ORDER and
every block are kept exactly as the source has them (flow fidelity is the rule).
"""
import json, os, re, glob

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, 'out', 'workshop-ai-pamjaya.vercel.app')
PAGES = os.path.join(SRC, 'pages')
OUTDIR = os.path.join(os.path.dirname(HERE), 'content'); os.makedirs(OUTDIR, exist_ok=True)

def load(slug, name):
    return json.load(open(os.path.join(PAGES, slug, name), encoding='utf-8'))

def is_prompt(b):
    """quote/code blocks that a participant would copy into an AI tool"""
    t = (b.get('text') or '').strip()
    if b['type'] == 'code': return True
    if b['type'] == 'quote':
        return t.startswith(('"', '“', "'")) or len(t) > 140 or bool(re.search(r'\b(Anda adalah|Buatkan|Buat|Tuliskan|Analisis|Susun|Jelaskan|Berikan)\b', t))
    return False

SECTION_ROLE = [
    (r'^yang akan anda kuasai|^tujuan', 'goals'),
    (r'^latihan|^praktik|^tugas', 'practice'),
    (r'^rangkuman|^ringkasan|^kesimpulan', 'summary'),
    (r'^kartu contek|^template', 'cheatsheet'),
]

def role_of(h):
    h = h.lower()
    for pat, r in SECTION_ROLE:
        if re.search(pat, h): return r
    return 'content'

def session(slug, index_desc):
    blocks = load(slug, 'blocks.json'); meta = load(slug, 'meta.json')
    head = {'slug': slug.replace('materi__', ''), 'title': meta['h1'], 'subtitle': index_desc,
            'number': None, 'day': None, 'slot': None, 'read_min': None, 'image': None, 'program_line': None}
    for b in blocks[:14]:
        t = b.get('text') or ''
        if b['type'] == 'image' and not head['image']: head['image'] = b.get('local', '').replace('../../', '')
        m = re.match(r'^Sesi\s*(\d+)\s*·\s*Hari\s*(\d+)', t)
        if m: head['number'], head['day'] = int(m.group(1)), int(m.group(2))
        m = re.match(r'^(\d+)\s*menit baca', t)
        if m: head['read_min'] = int(m.group(1))
        if b['type'] == 'quote' and 'In-House Training' in t:
            head['program_line'] = t
            m = re.search(r'Hari\s*\d+\s*·\s*([0-9\.]+\s*[–-]\s*[0-9\.]+)', t)
            if m: head['slot'] = m.group(1)
    # body = from the first real L2 heading, stopping before the discussion panel
    start = next((i for i, b in enumerate(blocks) if b['type'] == 'heading' and b['level'] == 2), None)
    body = blocks[start:] if start is not None else []
    stop = next((i for i, b in enumerate(body) if b['type'] == 'heading' and b['text'].strip().lower() in ('diskusi', 'komentar', 'pertanyaan')), len(body))
    body = [b for b in body[:stop] if b['type'] not in ('nav', 'footer', 'button')]
    sections, cur = [], None
    for b in body:
        if b['type'] == 'heading' and b['level'] == 2:
            cur = {'heading': b['text'], 'role': role_of(b['text']), 'blocks': []}; sections.append(cur); continue
        if cur is None: cur = {'heading': '', 'role': 'intro', 'blocks': []}; sections.append(cur)
        blk = {k: v for k, v in b.items() if k not in ('hidden', 'mixed', 'src')}
        if b['type'] == 'image': blk['src'] = b.get('local', '').replace('../../', '')
        if b['type'] in ('quote', 'code') and is_prompt(b): blk['copyable'] = True
        if b['type'] == 'heading': blk = {'type': 'subheading', 'level': b['level'], 'text': b['text']}
        cur['blocks'].append(blk)
    head['sections'] = sections
    head['stats'] = {'sections': len(sections), 'blocks': sum(len(s['blocks']) for s in sections),
                     'copyable': sum(1 for s in sections for b in s['blocks'] if b.get('copyable')), 'words': meta['words']}
    return head


def main():
    idx = load('materi', 'blocks.json')
    home = load('index', 'blocks.json')
    # walk the /materi index: group headings (L3) → session cards (L4 title + following text = description)
    groups, cur, desc_for = [], None, {}
    links = [l for l in load('materi', 'meta.json')['links_out'] if '/materi/' in l and not l.endswith('.md')]
    order = []
    for i, b in enumerate(idx):
        if b['type'] == 'heading' and b['level'] == 2 and b['text'].strip() != 'Materi Workshop':
            cur = {'title': b['text'], 'intro': '', 'items': []}; groups.append(cur)
            nxt = idx[i + 1] if i + 1 < len(idx) else {}
            if nxt.get('type') == 'text': cur['intro'] = nxt['text']
        elif b['type'] == 'heading' and b['level'] == 3 and cur is not None:
            d = idx[i + 1]['text'] if i + 1 < len(idx) and idx[i + 1].get('type') == 'text' else ''
            cur['items'].append({'title': b['text'], 'desc': d}); order.append(b['text'])
    # title → slug via each page's h1
    by_title = {}
    for d in glob.glob(os.path.join(PAGES, 'materi__*')):
        s = os.path.basename(d)
        if s.endswith('_md') or not os.path.exists(os.path.join(d, 'meta.json')): continue
        by_title[load(s, 'meta.json')['h1'].strip()] = s
    program = {
        'program': {'title': 'Gen AI for Business Productivity 2026', 'tagline': 'From Understanding AI to Applying AI at Work',
                    'client': 'Perumda Air Minum Jaya (PAM Jaya)', 'provider': 'BusinessFirst', 'format': '2 Hari — In-House Training',
                    'hours': '08.30 - 16.30 WIB', 'city': 'Jakarta, 2026',
                    'pillars': [b['text'] for b in home if b['type'] == 'heading' and b['level'] == 4][:3],
                    'source': 'https://workshop-ai-pamjaya.vercel.app'},
        'groups': [], 'sessions': {}, 'unmatched': []}
    for g in groups:
        kind = 'day' if g['title'].lower().startswith('hari') else ('supplement' if 'framework' in g['title'].lower() else 'other')
        entry = {'title': g['title'], 'kind': kind, 'intro': g['intro'], 'sessions': []}
        for it in g['items']:
            s = by_title.get(it['title'].strip())
            if not s: program['unmatched'].append(it['title']); continue
            ses = session(s, it['desc'])
            program['sessions'][ses['slug']] = ses
            entry['sessions'].append(ses['slug'])
        program['groups'].append(entry)
    tools = json.load(open(os.path.join(SRC, 'PROMPTS.json'), encoding='utf-8'))
    program['tools'] = {'prompt_library': tools['prompt_library'], 'case_study': tools['case_study_tools']}
    json.dump(program, open(os.path.join(OUTDIR, 'program.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

    print(f"groups: {[(g['title'][:34], len(g['sessions'])) for g in program['groups']]}")
    print('unmatched:', program['unmatched'])
    tot = program['sessions'].values()
    print(f"sessions: {len(tot)} · sections {sum(s['stats']['sections'] for s in tot)} · blocks {sum(s['stats']['blocks'] for s in tot)} · copyable prompts {sum(s['stats']['copyable'] for s in tot)}")
    print(f"tools: {len(program['tools']['prompt_library'])} library prompts · {len(program['tools']['case_study'])} case-study tools")


if __name__ == '__main__':
    main()
