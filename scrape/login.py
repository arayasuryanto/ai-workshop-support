#!/usr/bin/env python3
"""Open a real Chrome window at the site's login page. Araya signs in with Google himself; the script
waits until the NextAuth session cookie appears, then saves the session to auth/state.json (0600).
The saved state is a credential: never commit it, never send it anywhere."""
import json, os, sys, time
from playwright.sync_api import sync_playwright

BASE = (sys.argv[1] if len(sys.argv) > 1 else 'https://workshop-ahm.vercel.app').rstrip('/')
HERE = os.path.dirname(os.path.abspath(__file__))
AUTH = os.path.join(HERE, 'auth'); os.makedirs(AUTH, exist_ok=True); os.chmod(AUTH, 0o700)
STATE = os.path.join(AUTH, 'state-' + BASE.split('//')[1].split('.')[0] + '.json')
PROFILE = os.path.join(AUTH, 'chrome-profile')

with sync_playwright() as pw:
    # real Chrome + a persistent profile: Google refuses sign-in inside bare automated Chromium
    ctx = pw.chromium.launch_persistent_context(PROFILE, channel='chrome', headless=False,
            args=['--disable-blink-features=AutomationControlled'], ignore_default_args=['--enable-automation'],
            viewport={'width': 1200, 'height': 820})
    pg = ctx.pages[0] if ctx.pages else ctx.new_page()
    pg.goto(BASE + '/auth/login')
    print('WINDOW OPEN — sign in with Google in the Chrome window.', flush=True)
    deadline = time.time() + 900
    while time.time() < deadline:
        names = {c['name'] for c in ctx.cookies(BASE)}
        if any('session-token' in n for n in names):
            time.sleep(2)
            ctx.storage_state(path=STATE); os.chmod(STATE, 0o600)
            me = pg.evaluate("fetch('/api/auth/session').then(r=>r.json()).catch(()=>null)")
            u = (me or {}).get('user') or {}
            print(f"SIGNED IN as {u.get('name','?')} <{u.get('email','?')}> role={u.get('role','?')} — session saved", flush=True)
            break
        time.sleep(1.5)
    else:
        print('TIMEOUT — no session after 15 minutes', flush=True)
    ctx.close()
