#!/usr/bin/env python3
"""Snapshot LeetCode's public problem list into interview/data/leetcode-problems.json.

Gives every problem its number, title, slug, difficulty and whether it is Premium (paid only). This is the
universe for /interview/problems/; the company lists (import_leetcode.py) are a subset of it.

  python3 hugo/scripts/import_leetcode_problems.py          # fetch from leetcode.com
  python3 hugo/scripts/import_leetcode_problems.py all.json # from a saved copy of https://leetcode.com/api/problems/all/
"""
import datetime
import json
import os
import sys
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'interview', 'data', 'leetcode-problems.json')
URL = 'https://leetcode.com/api/problems/all/'
LEVELS = {1: 'Easy', 2: 'Medium', 3: 'Hard'}


def main(source=None):
    if source:
        raw = json.load(open(source, encoding='utf-8'))
    else:
        request = urllib.request.Request(URL, headers={'User-Agent': 'Mozilla/5.0 (compatible; CompileNRun/1.0)', 'Accept': 'application/json'})
        with urllib.request.urlopen(request, timeout=60) as response:
            raw = json.load(response)
    problems = {}
    for pair in raw['stat_status_pairs']:
        stat = pair['stat']
        slug, number = stat['question__title_slug'], int(stat['frontend_question_id'])
        if not slug or number <= 0 or pair['difficulty']['level'] not in LEVELS:
            continue
        problems[slug] = {'number': number, 'title': ' '.join(stat['question__title'].split()),
                          'difficulty': LEVELS[pair['difficulty']['level']], 'paid': bool(pair['paid_only'])}
    numbers = [p['number'] for p in problems.values()]
    if len(numbers) != len(set(numbers)):
        sys.exit('duplicate problem numbers in the LeetCode list')
    snapshot = {'source': {'url': URL, 'date': datetime.date.today().isoformat()},
                'problems': dict(sorted(problems.items(), key=lambda item: item[1]['number']))}
    with open(OUT, 'w', encoding='utf-8') as f:
        json.dump(snapshot, f, ensure_ascii=False, separators=(',', ':'))
        f.write('\n')
    print(f"{len(problems)} problems (max #{max(numbers)}, {sum(p['paid'] for p in problems.values())} premium) -> {os.path.relpath(OUT, ROOT)}")


if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else None)
