#!/usr/bin/env python3
"""Behaviour reports from the first-party event log (cnr_events in the compilenrun-data D1 database).

Every query joins events to the account tables, so signed-in activity shows the learner's name and email.
Runs wrangler from this Worker's folder; needs `npx wrangler@4` logged in to Cloudflare.

  tools/events_report.py overview [--days 30]        daily visitors, signed-in learners, events; top event names
  tools/events_report.py users [--days 30]           one row per signed-in learner: name, email, activity summary
  tools/events_report.py user <id|email|name> [--limit 200]   that learner's timeline, newest first
  tools/events_report.py pages [--days 30]           top pages: views, visitors, engaged seconds, scroll depth
  tools/events_report.py events [--days 30]          counts by event name and site
  tools/events_report.py funnel [--days 30]          site promo click -> Moodle visit -> enrol -> quiz, per learner
  tools/events_report.py moodle [--days 30]          Moodle activity by course page and learner
  tools/events_report.py sql "SELECT ..."            any read-only query (the `people` view is available)
  tools/events_report.py export out.csv [--days 30]  the joined rows as CSV for a spreadsheet or BigQuery
"""
import csv, json, subprocess, sys, os, shlex
from datetime import datetime, timezone

HERE = os.path.dirname(os.path.abspath(__file__))
WORKER = os.path.dirname(HERE)
DB = 'compilenrun-data'

# One row per account with the best-known email: verified email/password first, then Google, then GitHub.
PEOPLE = """people AS (
  SELECT u.id, u.display_name AS name, COALESCE(
    (SELECT c.email FROM cnr_account_password_credentials c WHERE c.user_id = u.id),
    (SELECT gp.email FROM cnr_account_google_identities g JOIN cnr_account_google_profiles gp ON gp.google_sub = g.google_sub WHERE g.user_id = u.id),
    (SELECT hp.email FROM cnr_account_github_identities h JOIN cnr_account_github_profiles hp ON hp.github_id = h.github_id WHERE h.user_id = u.id)
  ) AS email, u.created_at FROM cnr_account_users u)"""

def since(days):
    return int((datetime.now(timezone.utc).timestamp() - days * 86400) * 1000)

def query(sql):
    cmd = ['npx', 'wrangler@4', 'd1', 'execute', DB, '--remote', '--json', '--command', sql]
    out = subprocess.run(cmd, cwd=WORKER, capture_output=True, text=True)
    if out.returncode != 0:
        sys.exit(out.stderr.strip() or out.stdout.strip())
    text = out.stdout[out.stdout.index('['):]
    data = json.loads(text)
    return data[0].get('results', [])

def table(rows, limit=None):
    if not rows:
        print('(no rows)'); return
    rows = rows[:limit] if limit else rows
    cols = list(rows[0].keys())
    widths = {c: min(60, max(len(c), *(len(fmt(r.get(c))) for r in rows))) for c in cols}
    print('  '.join(c.ljust(widths[c]) for c in cols))
    print('  '.join('-' * widths[c] for c in cols))
    for r in rows:
        print('  '.join(fmt(r.get(c))[:60].ljust(widths[c]) for c in cols))

def fmt(v):
    if v is None: return ''
    if isinstance(v, float): return f'{v:.1f}'
    return str(v)

def arg(flag, default):
    if flag in sys.argv:
        i = sys.argv.index(flag); v = sys.argv[i + 1]; del sys.argv[i:i + 2]; return type(default)(v)
    return default

TS = "datetime(e.ts/1000, 'unixepoch')"
WHO = "COALESCE(p.name, json_extract(e.props,'$.moodle_name'), '(guest)') AS who, COALESCE(p.email, json_extract(e.props,'$.moodle_email'), '') AS email"

def overview(days):
    print(f'== Daily activity, last {days} days ==')
    table(query(f"""SELECT date(ts/1000,'unixepoch') AS day, COUNT(DISTINCT visitor_id) AS visitors,
      COUNT(DISTINCT user_id) AS signed_in, SUM(name='page_view') AS page_views, COUNT(*) AS events,
      SUM(site='moodle') AS moodle_events FROM cnr_events WHERE ts >= {since(days)} GROUP BY day ORDER BY day DESC"""))
    print(f'\n== Event names, last {days} days ==')
    table(query(f"""SELECT name, site, COUNT(*) AS n, COUNT(DISTINCT visitor_id) AS visitors, COUNT(DISTINCT user_id) AS learners
      FROM cnr_events WHERE ts >= {since(days)} GROUP BY name, site ORDER BY n DESC"""))

def users(days):
    table(query(f"""WITH {PEOPLE} SELECT p.name, p.email, e.user_id AS id, COUNT(*) AS events, SUM(e.name='page_view') AS views,
      SUM(e.site='moodle') AS moodle, SUM(e.name IN ('run_code','answer_check','quiz_submit')) AS practice,
      ROUND(SUM(CASE WHEN e.name='page_engaged' THEN json_extract(e.props,'$.seconds') END)/60.0, 1) AS minutes,
      datetime(MIN(e.ts)/1000,'unixepoch') AS first_seen, datetime(MAX(e.ts)/1000,'unixepoch') AS last_seen
      FROM cnr_events e JOIN people p ON p.id = e.user_id WHERE e.ts >= {since(days)} GROUP BY e.user_id ORDER BY last_seen DESC"""))

def user(who, limit):
    who = who.replace("'", "''")
    table(query(f"""WITH {PEOPLE} SELECT {TS} AS at, e.site, e.name, e.path, e.props, e.country, p.name AS who, p.email
      FROM cnr_events e LEFT JOIN people p ON p.id = e.user_id
      WHERE e.user_id = '{who}' OR lower(p.email) = lower('{who}') OR p.name = '{who}' OR json_extract(e.props,'$.moodle_email') = '{who}'
      ORDER BY e.ts DESC LIMIT {limit}"""))

def pages(days):
    table(query(f"""SELECT e.site, e.path, SUM(e.name='page_view') AS views, COUNT(DISTINCT e.visitor_id) AS visitors,
      COUNT(DISTINCT e.user_id) AS learners,
      ROUND(AVG(CASE WHEN e.name='page_engaged' THEN json_extract(e.props,'$.seconds') END), 0) AS avg_seconds,
      ROUND(AVG(CASE WHEN e.name='page_engaged' THEN json_extract(e.props,'$.scroll') END), 0) AS avg_scroll_pct
      FROM cnr_events e WHERE e.ts >= {since(days)} AND e.name IN ('page_view','page_engaged')
      GROUP BY e.site, e.path HAVING views > 0 ORDER BY views DESC LIMIT 60"""))

def events(days):
    table(query(f"""SELECT name, site, COUNT(*) AS n, COUNT(DISTINCT visitor_id) AS visitors, COUNT(DISTINCT user_id) AS learners,
      MIN(datetime(ts/1000,'unixepoch')) AS first, MAX(datetime(ts/1000,'unixepoch')) AS last
      FROM cnr_events WHERE ts >= {since(days)} GROUP BY name, site ORDER BY n DESC"""))

def funnel(days):
    s = since(days)
    print('== Promo clicks on www -> visits on Moodle -> enrolment -> quiz work (same signed-in learner, or same browser) ==')
    table(query(f"""WITH {PEOPLE}, keyed AS (
        SELECT COALESCE(user_id, 'v:' || visitor_id) AS k, user_id, name, site, path, props, ts FROM cnr_events WHERE ts >= {s})
      SELECT COALESCE(p.name, '(guest)') AS who, p.email,
        SUM(k.name='moodle_promo_click') AS promo_clicks,
        SUM(k.site='moodle' AND k.name='page_view') AS moodle_views,
        SUM(k.name='enrol_submit') AS enrolments,
        SUM(k.name IN ('answer_check','quiz_submit')) AS quiz_actions,
        datetime(MAX(k.ts)/1000,'unixepoch') AS last_seen
      FROM keyed k LEFT JOIN people p ON p.id = k.user_id GROUP BY k.k
      HAVING promo_clicks > 0 OR moodle_views > 0 ORDER BY quiz_actions DESC, moodle_views DESC LIMIT 100"""))
    print('\n== Totals ==')
    table(query(f"""SELECT COUNT(DISTINCT CASE WHEN name='moodle_promo_click' THEN visitor_id END) AS clicked_promo,
      COUNT(DISTINCT CASE WHEN site='moodle' AND name='page_view' THEN visitor_id END) AS visited_moodle,
      COUNT(DISTINCT CASE WHEN name='enrol_submit' THEN visitor_id END) AS enrolled,
      COUNT(DISTINCT CASE WHEN name IN ('answer_check','quiz_submit') THEN visitor_id END) AS did_quiz
      FROM cnr_events WHERE ts >= {s}"""))

def moodle(days):
    print(f'== Moodle pages, last {days} days ==')
    table(query(f"""SELECT json_extract(props,'$.course') AS course, json_extract(props,'$.modname') AS module, path,
      SUM(name='page_view') AS views, COUNT(DISTINCT visitor_id) AS visitors, SUM(name IN ('answer_check','quiz_submit')) AS quiz_actions
      FROM cnr_events WHERE site='moodle' AND ts >= {since(days)} GROUP BY course, module, path ORDER BY views DESC LIMIT 60"""))
    print(f'\n== Moodle learners, last {days} days ==')
    table(query(f"""WITH {PEOPLE} SELECT {WHO}, json_extract(e.props,'$.moodle_user_id') AS moodle_id, COUNT(*) AS events,
      SUM(e.name='page_view') AS views, SUM(e.name IN ('answer_check','quiz_submit')) AS quiz_actions,
      ROUND(SUM(CASE WHEN e.name='page_engaged' THEN json_extract(e.props,'$.seconds') END)/60.0, 1) AS minutes,
      datetime(MAX(e.ts)/1000,'unixepoch') AS last_seen
      FROM cnr_events e LEFT JOIN people p ON p.id = e.user_id WHERE e.site='moodle' AND e.ts >= {since(days)}
      GROUP BY COALESCE(e.user_id, moodle_id, e.visitor_id) ORDER BY last_seen DESC LIMIT 100"""))

def export(path, days):
    rows = query(f"""WITH {PEOPLE} SELECT e.id, {TS} AS at, e.site, e.user_id, p.name, p.email, e.visitor_id, e.session_id, e.name AS event,
      e.path, e.props, e.referrer, e.country FROM cnr_events e LEFT JOIN people p ON p.id = e.user_id WHERE e.ts >= {since(days)} ORDER BY e.ts""")
    with open(path, 'w', newline='') as f:
        if rows:
            w = csv.DictWriter(f, fieldnames=list(rows[0].keys())); w.writeheader(); w.writerows(rows)
    print(f'{len(rows)} rows -> {path}')

def main():
    if len(sys.argv) < 2 or sys.argv[1] in ('-h', '--help'):
        print(__doc__); return
    days = arg('--days', 30); limit = arg('--limit', 200)
    cmd, rest = sys.argv[1], sys.argv[2:]
    if cmd == 'overview': overview(days)
    elif cmd == 'users': users(days)
    elif cmd == 'user': user(' '.join(rest), limit)
    elif cmd == 'pages': pages(days)
    elif cmd == 'events': events(days)
    elif cmd == 'funnel': funnel(days)
    elif cmd == 'moodle': moodle(days)
    elif cmd == 'sql': table(query(f"WITH {PEOPLE} " + ' '.join(rest) if 'people' in ' '.join(rest) else ' '.join(rest)))
    elif cmd == 'export': export(rest[0], days)
    else: sys.exit(f'unknown command {cmd}\n{__doc__}')

if __name__ == '__main__':
    main()
