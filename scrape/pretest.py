import json, os, sys
from playwright.sync_api import sync_playwright
OUT='out/workshop-ahm.vercel.app-auth/pretest-run'; BASE='https://workshop-ahm.vercel.app'
log=[]
with sync_playwright() as pw:
    b=pw.chromium.launch(); ctx=b.new_context(storage_state='auth/state-workshop-ahm.json', viewport={'width':1280,'height':900})
    pg=ctx.new_page()
    def on_resp(r):
        if '/api/' in r.url:
            e={'method':r.request.method,'url':r.url,'status':r.status,'req':r.request.post_data}
            try: e['body']=r.json()
            except Exception:
                try: e['text']=r.text()[:4000]
                except Exception: pass
            log.append(e)
    pg.on('response', on_resp)
    pg.goto(BASE+'/pre-test', wait_until='networkidle'); pg.wait_for_timeout(1500)
    pg.screenshot(path=f'{OUT}/00-before.png', full_page=True)
    if sys.argv[1:]==['start']:
        pg.get_by_role('button', name='Mulai Pre-Test Sekarang').click()
        pg.wait_for_load_state('networkidle'); pg.wait_for_timeout(3000)
    pg.screenshot(path=f'{OUT}/01-after.png', full_page=True)
    open(f'{OUT}/after.txt','w').write(pg.inner_text('body'))
    btns=[x.inner_text().strip() for x in pg.query_selector_all('button')]
    json.dump({'url':pg.url,'buttons':btns,'api':log}, open(f'{OUT}/net.json','w'), ensure_ascii=False, indent=1)
    ctx.storage_state(path='auth/state-workshop-ahm.json'); os.chmod('auth/state-workshop-ahm.json',0o600)
    b.close()
print('url', pg.url); print('buttons', btns); print('api', [(e['method'],e['url'].split('.app')[1],e['status']) for e in log])
