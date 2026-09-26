"""Soal & Pembahasan (PAM Jaya, public) -> prototype/quiz.json for Latihan Soal."""
import json, re
S = json.load(open('prototype/program.json'))['sessions']['soal-dan-pembahasan']
qs, cur, mode, topic = [], None, None, None
for sec in S['sections']:
    if not sec['heading'].startswith('TOPIK'): continue
    topic = re.sub(r'^TOPIK \d+ — ', '', sec['heading'])
    for b in sec['blocks']:
        t = b['type']
        if t == 'subheading' and b['level'] == 3 and b['text'].startswith('Soal'):
            cur = {'n': len(qs) + 1, 'title': re.sub(r'^Soal \d+ — ', '', b['text']), 'topic': topic,
                   'question': '', 'concepts': [], 'ideal': [], 'minimum': '', 'mistakes': [], 'links': []}
            qs.append(cur); mode = 'q'; continue
        if not cur: continue
        if t == 'subheading':
            mode = {'Konsep Kunci yang Diuji': 'concepts', 'Jawaban Ideal': 'ideal', 'Kesalahan Umum': 'mistakes',
                    'Kaitan Lintas Materi': 'links'}.get(b['text'], 'ideal'); continue
        if mode == 'q':
            if t == 'quote': cur['question'] = b['text']
            continue
        if t == 'text' and b['text'].startswith('Poin minimum'):
            cur['minimum'] = b['text'].split(':', 1)[1].strip(); continue
        if mode in ('concepts', 'mistakes', 'links') and t == 'list': cur[mode] += b['items']; continue
        if mode == 'ideal': cur['ideal'].append(b)
json.dump({'duration_pre': 15, 'duration_post': 12, 'questions': qs}, open('prototype/quiz.json', 'w'), ensure_ascii=False, indent=1)
for q in qs: print(q['n'], q['title'][:50], len(q['question']), len(q['concepts']), len(q['ideal']), bool(q['minimum']), len(q['mistakes']))
