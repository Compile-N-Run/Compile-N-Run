#!/usr/bin/env python3
"""Keep the Worker's pool of WeChat temporary parametric QR tickets topped up.

Runs on a server whose IP is on the Official Account's IP whitelist (the Worker has no fixed IP, and WeChat only
issues access_tokens to whitelisted IPs). Standard library only. See tools/README.md for the systemd units.

Environment:
  WECHAT_APP_ID       Official Account AppID (wx...)
  WECHAT_APP_SECRET   Official Account AppSecret
  WECHAT_POOL_SECRET  same value as the Worker secret WECHAT_POOL_SECRET
  WORKER_ORIGIN       site origin that routes /api/auth/* to the Worker (default https://www.echo.cool)
  POOL_TARGET         tickets to keep available (default 300)

Flags:
  --dry-run  print what would be done; never calls WeChat and never uploads (still reads the pool status unless
             --mock is also given)
  --mock     use fake tickets instead of WeChat (to exercise the upload path against a test server); with
             --dry-run, nothing touches the network at all
"""
import argparse
import json
import os
import secrets
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

TICKET_SECONDS = 2592000      # 30 days, the maximum for temporary QR codes
UPLOAD_BATCH = 100
CREATE_DELAY = 0.05           # seconds between qrcode/create calls
TIMEOUT = 20
USER_AGENT = 'cnr-wechat-qr-pool/1.0'
WECHAT_API = 'https://api.weixin.qq.com/cgi-bin'


class PoolError(Exception):
    pass


def http_json(url, *, method='GET', body=None, headers=None):
    data = json.dumps(body).encode('utf-8') if body is not None else None
    request = urllib.request.Request(url, data=data, method=method, headers={
        'user-agent': USER_AGENT, 'accept': 'application/json',
        **({'content-type': 'application/json'} if data is not None else {}), **(headers or {})})
    try:
        with urllib.request.urlopen(request, timeout=TIMEOUT) as response:
            return json.loads(response.read().decode('utf-8'))
    except urllib.error.HTTPError as error:
        detail = error.read(300).decode('utf-8', 'replace')
        raise PoolError(f'{method} {redact(url)} -> HTTP {error.code}: {detail}') from None
    except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as error:
        raise PoolError(f'{method} {redact(url)} failed: {error}') from None


def redact(url):
    """Never print the AppSecret or the access_token."""
    parts = urllib.parse.urlsplit(url)
    query = [(k, '***' if k in ('secret', 'access_token') else v) for k, v in urllib.parse.parse_qsl(parts.query)]
    return urllib.parse.urlunsplit(parts._replace(query=urllib.parse.urlencode(query, safe='*')))


# ---- Worker ----
def pool_status(origin, pool_secret):
    result = http_json(origin + '/api/auth/wechat/pool', headers={'authorization': 'Bearer ' + pool_secret})
    return int(result['available']), int(result['expiringSoon'])


def upload(origin, pool_secret, tickets):
    inserted, available = 0, None
    for start in range(0, len(tickets), UPLOAD_BATCH):
        batch = tickets[start:start + UPLOAD_BATCH]
        result = http_json(origin + '/api/auth/wechat/pool', method='POST', body={'tickets': batch},
                           headers={'authorization': 'Bearer ' + pool_secret})
        if not result.get('ok'):
            raise PoolError(f'upload rejected: {result}')
        inserted += int(result['inserted'])
        available = int(result['available'])
    return inserted, available


# ---- WeChat ----
def access_token(app_id, app_secret):
    query = urllib.parse.urlencode({'grant_type': 'client_credential', 'appid': app_id, 'secret': app_secret})
    result = http_json(f'{WECHAT_API}/token?{query}')
    if result.get('errcode') == 40164:
        raise PoolError('WeChat refused the access_token: this server\'s IP is not on the Official Account\'s IP '
                        'whitelist (公众平台 → 设置与开发 → 基本配置 → IP白名单). ' + str(result.get('errmsg', '')))
    if 'access_token' not in result:
        raise PoolError(f'access_token request failed: errcode {result.get("errcode")} {result.get("errmsg", "")}')
    return result['access_token']


def new_scene():
    return secrets.token_urlsafe(24)   # 32 characters of [A-Za-z0-9_-]


def wechat_ticket(token, scene):
    body = {'expire_seconds': TICKET_SECONDS, 'action_name': 'QR_STR_SCENE',
            'action_info': {'scene': {'scene_str': scene}}}
    created = int(time.time())
    result = http_json(f'{WECHAT_API}/qrcode/create?access_token={urllib.parse.quote(token)}', method='POST', body=body)
    if 'ticket' not in result:
        raise PoolError(f'qrcode/create failed: errcode {result.get("errcode")} {result.get("errmsg", "")}')
    # Count from before the call and take WeChat's own expire_seconds, so the Worker never outlives the real ticket.
    return {'scene': scene, 'ticket': result['ticket'], 'expiresAt': created + int(result.get('expire_seconds', TICKET_SECONDS))}


def mock_ticket(_token, scene):
    return {'scene': scene, 'ticket': 'mock' + secrets.token_urlsafe(48), 'expiresAt': int(time.time()) + TICKET_SECONDS}


def main(argv=None):
    parser = argparse.ArgumentParser(description='Top up the Worker\'s WeChat QR ticket pool.')
    parser.add_argument('--dry-run', action='store_true', help='print what would be done without calling WeChat or uploading')
    parser.add_argument('--mock', action='store_true', help='use fake tickets instead of WeChat')
    args = parser.parse_args(argv)

    env = os.environ
    origin = env.get('WORKER_ORIGIN', 'https://www.echo.cool').rstrip('/')
    try:
        target = int(env.get('POOL_TARGET', '300'))
    except ValueError:
        target = -1
    if target < 0:
        print('POOL_TARGET must be a non-negative integer', file=sys.stderr)
        return 2
    required = ['WECHAT_POOL_SECRET'] + ([] if args.mock else ['WECHAT_APP_ID', 'WECHAT_APP_SECRET'])
    if args.dry_run and args.mock:
        required = []
    missing = [name for name in required if not env.get(name, '').strip()]
    if missing:
        print('missing environment: ' + ', '.join(missing), file=sys.stderr)
        return 2
    pool_secret = env.get('WECHAT_POOL_SECRET', '').strip()

    try:
        if args.dry_run and args.mock:
            available, expiring = 0, 0
            print(f'[dry-run] would GET {origin}/api/auth/wechat/pool; assuming an empty pool')
        else:
            available, expiring = pool_status(origin, pool_secret)
        usable = available - expiring          # what will still be there at the next run
        need = max(0, target - usable)
        if need == 0:
            print(f'pool ok: available={available} expiringSoon={expiring} target={target}')
            return 0
        source = 'mock tickets' if args.mock else 'WeChat qrcode/create (QR_STR_SCENE, 30 days)'
        if args.dry_run:
            batches = (need + UPLOAD_BATCH - 1) // UPLOAD_BATCH
            print(f'[dry-run] available={available} expiringSoon={expiring} target={target}: would create {need} tickets '
                  f'from {source} and upload them to {origin}/api/auth/wechat/pool in {batches} batch(es) of up to {UPLOAD_BATCH}')
            return 0
        token = None if args.mock else access_token(env['WECHAT_APP_ID'].strip(), env['WECHAT_APP_SECRET'].strip())
        make = mock_ticket if args.mock else wechat_ticket
        # Uploaded as they are created, so a long first fill (a WeChat call takes about half a second) starts
        # serving scans right away and nothing is lost if the run is interrupted.
        created = inserted = 0
        now_available = available
        pending = []

        def flush():
            nonlocal created, inserted, now_available, pending
            if pending:
                added, now_available = upload(origin, pool_secret, pending)
                created += len(pending)
                inserted += added
                pending = []
        try:
            for index in range(need):
                if index and not args.mock:
                    time.sleep(CREATE_DELAY)
                pending.append(make(token, new_scene()))
                if len(pending) >= UPLOAD_BATCH:
                    flush()
        except PoolError:
            flush()   # keep what was created; the error is still reported below
            raise
        flush()
        print(f'pool topped up: created={created} inserted={inserted} available={now_available} target={target}'
              + (' (mock)' if args.mock else ''))
        return 0
    except PoolError as error:
        print(f'wechat_qr_pool: {error}', file=sys.stderr)
        return 1


if __name__ == '__main__':
    sys.exit(main())
