#!/usr/bin/env python3
"""Snapshot company-tagged LeetCode problem lists into interview/data/leetcode-companies.json.

Source: https://github.com/liquidslr/leetcode-company-wise-problems (one folder per company, five CSVs per
folder: 30 days, 3 months, 6 months, older, all). Only factual fields are kept: title, difficulty, topics,
link and per-window frequency. The CSV "Acceptance Rate" column is not used.

  git clone --depth 1 https://github.com/liquidslr/leetcode-company-wise-problems /tmp/lc
  python3 hugo/scripts/import_leetcode.py /tmp/lc
"""
import csv
import json
import os
import re
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'interview', 'data', 'leetcode-companies.json')
REPO = 'https://github.com/liquidslr/leetcode-company-wise-problems'
# File name -> window key used by the site.
WINDOWS = {'1. Thirty Days.csv': 'd30', '2. Three Months.csv': 'm3', '3. Six Months.csv': 'm6',
           '4. More Than Six Months.csv': 'older', '5. All.csv': 'all'}
DIFFICULTY = {'EASY': 'Easy', 'MEDIUM': 'Medium', 'HARD': 'Hard'}
LINK = re.compile(r'^https://leetcode\.com/problems/([a-z0-9-]+)/?$')


def company_slug(name):
    return re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')


def main(src):
    commit = subprocess.run(['git', '-C', src, 'log', '-1', '--format=%H %cs'], capture_output=True, text=True,
                            check=True).stdout.split()
    problems, companies, slugs = {}, [], {}
    for name in sorted(os.listdir(src), key=str.lower):
        folder = os.path.join(src, name)
        if name.startswith('.') or not os.path.isdir(folder):
            continue
        windows = {}
        for filename, key in WINDOWS.items():
            path = os.path.join(folder, filename)
            if not os.path.isfile(path):
                continue
            with open(path, encoding='utf-8', newline='') as f:
                for row in csv.DictReader(f):
                    match = LINK.match((row.get('Link') or '').strip())
                    if not match or row.get('Difficulty') not in DIFFICULTY:
                        continue
                    slug = match.group(1)
                    topics = [t.strip() for t in (row.get('Topics') or '').split(',') if t.strip()]
                    problems.setdefault(slug, {'title': row['Title'].strip(), 'difficulty': DIFFICULTY[row['Difficulty']],
                                               'topics': topics})
                    try:
                        frequency = round(float(row.get('Frequency') or 0), 1)
                    except ValueError:
                        frequency = 0.0
                    windows.setdefault(slug, {})[key] = frequency
        if not windows:
            continue  # some company folders have empty CSVs
        cslug = company_slug(name)
        if cslug in slugs:
            sys.exit(f'company slug collision: {name!r} and {slugs[cslug]!r}')
        slugs[cslug] = name
        # Rows: [problem slug, {window: frequency}], most frequent overall first.
        rows = sorted(windows.items(), key=lambda item: (-item[1].get('all', 0), item[0]))
        companies.append({'name': name, 'slug': cslug, 'problems': [[slug, freq] for slug, freq in rows]})
    snapshot = {'source': {'repo': REPO, 'commit': commit[0], 'date': commit[1]},
                'problems': dict(sorted(problems.items())), 'companies': companies}
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, 'w', encoding='utf-8') as f:
        json.dump(snapshot, f, ensure_ascii=False, separators=(',', ':'))
        f.write('\n')
    print(f'{len(companies)} companies, {len(problems)} problems -> {os.path.relpath(OUT, ROOT)}')


if __name__ == '__main__':
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    main(sys.argv[1])
