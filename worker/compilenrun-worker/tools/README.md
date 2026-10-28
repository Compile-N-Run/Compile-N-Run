# WeChat QR ticket pool generator

`wechat_qr_pool.py` keeps the echo.cool Worker's pool of temporary parametric QR tickets (带参数二维码) topped up, so
WeChat sign-in can be scan-only. It must run on a server whose public IP is on the Official Account's IP whitelist
(公众平台 → 设置与开发 → 基本配置 → IP白名单): WeChat issues an `access_token` only to whitelisted IPs, and the Worker
has none of its own. The design is described in `../README.md` under "WeChat Official Account login".

Python 3, standard library only. Each run:

1. `GET {WORKER_ORIGIN}/api/auth/wechat/pool` → `{available, expiringSoon}`.
2. If `available - expiringSoon` is below `POOL_TARGET`, fetch an `access_token` (error `40164` means the IP is not
   whitelisted), create the missing tickets (`QR_STR_SCENE`, random 32-character scene, 30 days) and upload them in
   batches of 100.
3. Print one summary line. Exit 0 on success, 1 on an API/upload failure, 2 on bad configuration.

```sh
python3 wechat_qr_pool.py --dry-run          # reads the pool status, prints what it would create
python3 wechat_qr_pool.py --mock --dry-run   # no network at all
WORKER_ORIGIN=http://127.0.0.1:8787 python3 wechat_qr_pool.py --mock   # fake tickets, real upload to a test server
```

## Environment file

`/etc/cnr-wechat-pool.env`, owned by root, mode 600 (`sudo install -m 600 -o root -g root /dev/null /etc/cnr-wechat-pool.env`):

```sh
WECHAT_APP_ID=wx1158ec5a67d0cedc
WECHAT_APP_SECRET=<AppSecret from 公众平台 → 设置与开发 → 基本配置>
WECHAT_POOL_SECRET=<same value as the Worker secret WECHAT_POOL_SECRET>
WORKER_ORIGIN=https://www.echo.cool
POOL_TARGET=2000
```

Resetting the AppSecret in the console invalidates the old one: update this file at the same time.

## systemd units

Copy the script to `/opt/cnr/wechat_qr_pool.py` (or adjust `ExecStart`).

`/etc/systemd/system/cnr-wechat-pool.service`:

```ini
[Unit]
Description=Top up the echo.cool WeChat QR ticket pool
Wants=network-online.target
After=network-online.target

[Service]
Type=oneshot
EnvironmentFile=/etc/cnr-wechat-pool.env
ExecStart=/usr/bin/python3 /opt/cnr/wechat_qr_pool.py
DynamicUser=yes
NoNewPrivileges=yes
ProtectSystem=strict
ProtectHome=yes
PrivateTmp=yes
```

`/etc/systemd/system/cnr-wechat-pool.timer`:

```ini
[Unit]
Description=Top up the echo.cool WeChat QR ticket pool every 20 minutes

[Timer]
OnCalendar=*-*-* *:00/20:00
RandomizedDelaySec=2min
# Runs a missed slot at boot if the server was off.
Persistent=true

[Install]
WantedBy=timers.target
```

```sh
sudo systemctl daemon-reload
sudo systemctl enable --now cnr-wechat-pool.timer
sudo systemctl start cnr-wechat-pool.service   # first fill right away
journalctl -u cnr-wechat-pool.service -n 20     # summary lines and errors
systemctl list-timers cnr-wechat-pool.timer
```

`EnvironmentFile` is read by systemd (as root) before `DynamicUser` drops privileges, so the env file can stay mode
600. If the job stops, logins fall back to the 6-digit code once the pool is empty; nothing breaks.

# Cloudflare WAF rules for the API (`cloudflare_waf_rules.py`)

Keeps crawlers and page-style bot fetches away from `/api/*` on both zones before they reach a Worker (each Worker
request counts against the Workers free tier, 100k/day; a proxy bot swarm was ~22k/day in 2026-10). Two custom rules per
zone: block `/api/*` (except the WeChat push/profile paths) for Cloudflare's known bots, and block `GET /api/auth/session`
without `Accept: application/json`, which the site's own JavaScript always sends. Needs an API token with Zone → Zone WAF
→ Edit for both zones, read from `$CLOUDFLARE_WAF_TOKEN` or `~/.config/cloudflare/waf-token` (mode 600); wrangler's
login has no firewall scope. Idempotent; `--dry-run` shows the plan.
