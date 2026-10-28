#!/usr/bin/env python3
"""Create (or verify) the WAF custom rules that keep non-browser traffic away from the Workers.

Why: every request that reaches a Worker counts against the Workers free tier (100k/day). Search-engine renderers
and, worse, proxy "traffic" bots fetch /api/auth/session like a page (Accept: text/html); in 2026-10 one such swarm
was ~22k requests/day, two thirds of compilenrun-worker's traffic. WAF custom rules run before the Worker and are
free (5 per zone on the Free plan). The site's own JavaScript always sends `Accept: application/json`
(hugo/assets/js/auth-ui.js and profile.js), so rule 2 never blocks a real reader.

Needs an API token with "Zone → Zone WAF → Edit" (and Zone → Zone → Read) for both zones; wrangler's OAuth token has no
firewall scope. Put the token in $CLOUDFLARE_WAF_TOKEN or in ~/.config/cloudflare/waf-token (chmod 600). Never paste
it into a chat. Idempotent: rules are matched by description and updated in place when the expression changed.

    python3 cloudflare_waf_rules.py            # apply
    python3 cloudflare_waf_rules.py --dry-run  # show what would change
"""
import json, os, sys, urllib.request

ZONES = {'compilenrun.com': '0de2724f60afab0044d020f06be73c83', 'echo.cool': 'b03873da18da747c42295f30c4512e45'}
PHASE = 'http_request_firewall_custom'
RULES = [
    {'description': 'API: block known crawlers (search engines never need API responses)',
     'expression': '(starts_with(http.request.uri.path, "/api/") and not starts_with(http.request.uri.path, "/api/auth/wechat/") and cf.client.bot)',
     'action': 'block', 'enabled': True},
    {'description': 'API: session fetch must accept JSON (the site JS always does; page-style fetches are bots)',
     'expression': '(http.request.uri.path eq "/api/auth/session" and http.request.method eq "GET" and not any(http.request.headers["accept"][*] contains "application/json"))',
     'action': 'block', 'enabled': True},
]


def token():
    t = os.environ.get('CLOUDFLARE_WAF_TOKEN', '').strip()
    if t: return t
    path = os.path.expanduser('~/.config/cloudflare/waf-token')
    try:
        with open(path) as f: t = f.read().strip()
    except OSError:
        sys.exit(f'no token: set CLOUDFLARE_WAF_TOKEN or create {path} (mode 600)')
    if not t: sys.exit(f'{path} is empty')
    return t


def call(method, path, body=None):
    req = urllib.request.Request('https://api.cloudflare.com/client/v4' + path, method=method,
                                 data=json.dumps(body).encode() if body is not None else None,
                                 headers={'Authorization': 'Bearer ' + token(), 'content-type': 'application/json'})
    try:
        return json.load(urllib.request.urlopen(req, timeout=30))
    except urllib.error.HTTPError as e:
        try: return json.loads(e.read())
        except Exception: return {'success': False, 'errors': [{'code': e.code, 'message': str(e)}]}


def main():
    dry = '--dry-run' in sys.argv
    failed = False
    for name, zone in ZONES.items():
        current = call('GET', f'/zones/{zone}/rulesets/phases/{PHASE}/entrypoint')
        if current.get('success'):
            ruleset = current['result']; existing = ruleset.get('rules', [])
        elif any(e.get('code') == 10000 for e in current.get('errors', [])):
            print(f'{name}: token cannot read WAF rules ({current["errors"][0].get("message")})'); failed = True; continue
        else:
            ruleset = None; existing = []   # no custom ruleset yet
        by_desc = {r.get('description'): r for r in existing}
        for rule in RULES:
            have = by_desc.get(rule['description'])
            if have and have.get('expression') == rule['expression'] and have.get('action') == rule['action'] and have.get('enabled', True):
                print(f'{name}: ok      {rule["description"]}'); continue
            verb = 'update' if have else 'create'
            print(f'{name}: {verb:7} {rule["description"]}')
            if dry: continue
            if have:
                r = call('PATCH', f'/zones/{zone}/rulesets/{ruleset["id"]}/rules/{have["id"]}', rule)
            elif ruleset:
                r = call('POST', f'/zones/{zone}/rulesets/{ruleset["id"]}/rules', rule)
            else:
                r = call('PUT', f'/zones/{zone}/rulesets/phases/{PHASE}/entrypoint', {'rules': [rule]})
                if r.get('success'): ruleset = r['result']
            if not r.get('success'):
                print(f'{name}: FAILED {r.get("errors")}'); failed = True
        if ruleset and not dry:
            final = call('GET', f'/zones/{zone}/rulesets/phases/{PHASE}/entrypoint')
            if final.get('success'): print(f'{name}: {len(final["result"].get("rules", []))} custom rule(s) in place')
    sys.exit(1 if failed else 0)


if __name__ == '__main__':
    main()
