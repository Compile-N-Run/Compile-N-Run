#!/usr/bin/env python3
"""Generate the Interview section (run after convert.py, which recreates hugo/content).

Inputs:  interview/data/leetcode-companies.json (snapshot from import_leetcode.py)
         interview/problems/<slug>.md           (one write-up per LeetCode problem)
Outputs: hugo/data/interview.json                (problems, rankings, companies, for templates)
         hugo/content/interview*/...             (stub pages; templates read the data file)
"""
import json
import os
import re

import yaml

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC = os.path.join(ROOT, 'interview')
CONTENT = os.path.join(ROOT, 'hugo', 'content')
DATA = os.path.join(ROOT, 'hugo', 'data', 'interview.json')
WINDOWS = ['d30', 'm3', 'm6', 'older', 'all']


def page(path, fm, body=''):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write('---\n' + yaml.safe_dump(fm, allow_unicode=True, sort_keys=False) + '---\n\n' + body)


def main():
    snapshot = json.load(open(os.path.join(SRC, 'data', 'leetcode-companies.json'), encoding='utf-8'))
    problems = snapshot['problems']
    written = {}
    for name in sorted(os.listdir(os.path.join(SRC, 'problems'))):
        if not name.endswith('.md'):
            continue
        text = open(os.path.join(SRC, 'problems', name), encoding='utf-8').read()
        fm_text, body = re.match(r'^---\n(.*?)\n---\n(.*)$', text, re.S).groups()
        written[name[:-3]] = (yaml.safe_load(fm_text), body)

    # Global ranking: a company's frequency (0-100) for a problem adds to the problem's score, so problems asked
    # often by many companies rank highest. "recent" only counts the last six months.
    stats = {slug: {'companies': [], 'all': 0.0, 'recent': 0.0} for slug in problems}
    for company in snapshot['companies']:
        for slug, freq in company['problems']:
            s = stats[slug]
            s['companies'].append([company['slug'], freq.get('all', 0)])
            s['all'] += freq.get('all', 0) / 100
            s['recent'] += freq.get('m6', 0) / 100
    order = sorted(problems, key=lambda slug: (-stats[slug]['all'], -len(stats[slug]['companies']), slug))
    names = {c['slug']: c['name'] for c in snapshot['companies']}
    out_problems = {}
    for rank, slug in enumerate(order, 1):
        p, s = problems[slug], stats[slug]
        s['companies'].sort(key=lambda c: (-c[1], names[c[0]].lower()))
        out_problems[slug] = {'title': p['title'], 'difficulty': p['difficulty'], 'topics': p['topics'],
                              'rank': rank, 'count': len(s['companies']), 'score': round(s['all'], 2),
                              'recent': round(s['recent'], 2), 'written': slug in written,
                              'companies': [c[0] for c in s['companies']]}
    logos = set(json.load(open(os.path.join(SRC, 'data', 'company-logos.json'), encoding='utf-8')))
    companies = []
    for c in snapshot['companies']:
        windows = {w: sum(1 for _, f in c['problems'] if w in f) for w in WINDOWS}
        companies.append({'name': c['name'], 'slug': c['slug'], 'logo': c['slug'] in logos, 'count': len(c['problems']), 'windows': windows,
                          'written': sum(1 for slug, _ in c['problems'] if slug in written),
                          'problems': c['problems']})
    companies.sort(key=lambda c: c['name'].lower())

    def table(rows):
        # Compact rows for assets/js/interview.js: [slug, title, difficulty, topics, frequencies, written, companies].
        return json.dumps([[slug, out_problems[slug]['title'], out_problems[slug]['difficulty'], out_problems[slug]['topics'],
                            freq, 1 if out_problems[slug]['written'] else 0, out_problems[slug]['count']] for slug, freq in rows],
                          ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')
    for c in companies:
        c['json'] = table(c['problems'])
    ranking = [[slug, {'all': out_problems[slug]['score'], **({'m6': out_problems[slug]['recent']} if out_problems[slug]['recent'] else {})}]
               for slug in order]
    data = {'source': snapshot['source'], 'order': order, 'ranking': ranking, 'rankingJson': table(ranking), 'recentCount': sum(1 for r in ranking if 'm6' in r[1]), 'names': names, 'logos': sorted(logos), 'problems': out_problems, 'companies': companies,
            'popular': [c['slug'] for c in sorted(companies, key=lambda c: -c['count'])[:12]],
            'writtenCount': len(written)}
    with open(DATA, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, separators=(',', ':'))

    base = {'type': 'interview'}
    page(os.path.join(CONTENT, 'interview', '_index.md'), {**base, 'title': 'Coding Interview Questions by Company',
         'layout': 'directory', 'url': '/interview/',
         'description': f'Search {len(companies)} companies and see the LeetCode questions each one asks in coding interviews, '
                        'with explanations and solutions in Python, Java, C++, JavaScript and Go.'})
    page(os.path.join(CONTENT, 'interview-most-asked.md'), {**base, 'title': 'Most Asked LeetCode Interview Questions',
         'layout': 'ranking', 'url': '/interview/most-asked/',
         'description': f'A global ranking of {len(problems)} LeetCode problems by how often companies ask them in '
                        'coding interviews. Start general practice from the top.'})
    page(os.path.join(CONTENT, 'interview-problems.md'), {**base, 'title': 'LeetCode Solutions Explained',
         'layout': 'problems', 'url': '/interview/problems/',
         'description': 'Every interview problem we have explained: the idea, the approach, complexity, and solutions in '
                        'Python, Java, C++, JavaScript and Go.'})
    for c in companies:
        page(os.path.join(CONTENT, 'interview-company', c['slug'] + '.md'), {**base, 'layout': 'company',
             'title': f"{c['name']} Coding Interview Questions", 'company': c['slug'],
             'url': f"/interview/company/{c['slug']}/",
             'description': f"{c['count']} LeetCode questions asked in {c['name']} coding interviews, sorted by "
                            'frequency with recent-question filters, explanations and solutions.'})
    for slug, (fm, body) in written.items():
        page(os.path.join(CONTENT, 'interview-problem', slug + '.md'), {**base, 'layout': 'problem',
             'title': fm['title'], 'problem': slug, 'url': f'/interview/problems/{slug}/',
             'description': fm['description']}, body)
    print(f'interview: {len(companies)} companies, {len(problems)} problems, {len(written)} write-ups')


if __name__ == '__main__':
    main()
