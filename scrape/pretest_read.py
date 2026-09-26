import json, re
from playwright.sync_api import sync_playwright
OUT='out/workshop-ahm.vercel.app-auth/pretest-run'; BASE='https://workshop-ahm.vercel.app'
qs=[]; scripts=set()
with sync_playwright() as pw:
    b=pw.chromium.launch(); ctx=b.new_context(storage_state='auth/state-workshop-ahm.json', viewport={'width':1280,'height':900})
    pg=ctx.new_page()
    pg.on('response', lambda r: scripts.add(r.url) if r.url.endswith('.js') else None)
    pg.goto(BASE+'/pre-test', wait_until='networkidle'); pg.wait_for_timeout(1500)
    for i in range(1,11):
        pg.get_by_role('button', name=str(i), exact=True).first.click(); pg.wait_for_timeout(700)
        t=pg.inner_text('body')
        m=re.search(r'Saat ini\n(\d+)\n(.+?)\n(\d\d:\d\d)\n(.+?)\nPetunjuk', t, re.S)
        q={'n':i,'topic':m.group(2).strip() if m else None,'question':m.group(4).strip() if m else t[:1500]}
        qs.append(q); pg.screenshot(path=f'{OUT}/q{i:02d}.png')
        print(i, q['topic'], '|', q['question'][:90])
    b.close()
json.dump(qs, open(f'{OUT}/questions.json','w'), ensure_ascii=False, indent=1)
open(f'{OUT}/scripts.txt','w').write('\n'.join(sorted(scripts)))
