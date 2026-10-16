#!/usr/bin/env python3
"""Generate the Interview section (run after convert.py, which recreates hugo/content).

Inputs:  interview/data/leetcode-problems.json  (every LeetCode problem, from import_leetcode_problems.py)
         interview/data/leetcode-companies.json (company lists, from import_leetcode.py; a subset of the above)
         interview/problems/<slug>.md           (one write-up per LeetCode problem)
         interview/topics/<topic-slug>.md       (optional guide per topic tag)
Outputs: hugo/data/interview.json                (problems, rankings, companies, topics, for templates)
         hugo/static/interview-index.json        (slug -> [number, difficulty, written], for the learning dashboard)
         hugo/static/interview-runtime.json      (Python/JavaScript test preludes for the in-browser editor)
         hugo/content/interview*/...             (stub pages; templates read the data file)
"""
import json
import os
import re
import sys

import yaml

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from check_interview import solutions as parse_solutions, topic_slug  # noqa: E402
from interview_stubs import stubs  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC = os.path.join(ROOT, 'interview')
CONTENT = os.path.join(ROOT, 'hugo', 'content')
DATA = os.path.join(ROOT, 'hugo', 'data', 'interview.json')
INDEX = os.path.join(ROOT, 'hugo', 'static', 'interview-index.json')
RUNTIME = os.path.join(ROOT, 'hugo', 'static', 'interview-runtime.json')
TESTS = os.path.join(SRC, 'tests')
GROUPS = [('patterns', 'Patterns and techniques', 'Ways of thinking that solve whole families of problems.'),
          ('structures', 'Data structures', 'The containers the problems are built on and the operations each one makes cheap.'),
          ('graphs', 'Trees and graphs', 'Traversals and algorithms on connected data.'),
          ('math', 'Math and more', 'Counting, number theory, simulation and the rest.')]
WINDOWS = ['d30', 'm3', 'm6', 'older', 'all']


def page(path, fm, body=''):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write('---\n' + yaml.safe_dump(fm, allow_unicode=True, sort_keys=False) + '---\n\n' + body)


def read(*parts):
    path = os.path.join(*parts)
    return open(path, encoding='utf-8').read() if os.path.isfile(path) else ''


def workspace(slug, body):
    """Editor data for a problem page: starter code per language, the test cases (run in the browser for
    Python and JavaScript, shown for the others) and any problem-specific prelude."""
    code = parse_solutions(body)[0]
    tests = os.path.join(TESTS, slug)
    return {'stubs': stubs(slug, code),
            'tests': {'python': read(tests, 'test.py').replace('from solution import *\n', ''),
                      'javascript': read(tests, 'test.js'), 'java': read(tests, 'Main.java'),
                      'cpp': read(tests, 'test.cpp'), 'go': read(tests, 'test.go')},
            'prelude': {'python': read(tests, 'prelude.py'), 'javascript': read(tests, 'prelude.js')}}


def main():
    universe = json.load(open(os.path.join(SRC, 'data', 'leetcode-problems.json'), encoding='utf-8'))
    snapshot = json.load(open(os.path.join(SRC, 'data', 'leetcode-companies.json'), encoding='utf-8'))
    catalog = universe['problems']
    tagged = snapshot['problems']
    written = {}
    for name in sorted(os.listdir(os.path.join(SRC, 'problems'))):
        if not name.endswith('.md'):
            continue
        text = open(os.path.join(SRC, 'problems', name), encoding='utf-8').read()
        fm_text, body = re.match(r'^---\n(.*?)\n---\n(.*)$', text, re.S).groups()
        written[name[:-3]] = (yaml.safe_load(fm_text), body)
    guides = {}
    topics_dir = os.path.join(SRC, 'topics')
    for name in sorted(os.listdir(topics_dir)) if os.path.isdir(topics_dir) else []:
        if name.endswith('.md'):
            fm_text, body = re.match(r'^---\n(.*?)\n---\n(.*)$', open(os.path.join(topics_dir, name), encoding='utf-8').read(), re.S).groups()
            guides[name[:-3]] = (yaml.safe_load(fm_text), body)
    unknown = sorted(set(tagged) - set(catalog)) + sorted(set(written) - set(catalog))
    if unknown:
        sys.exit(f'not in interview/data/leetcode-problems.json (rerun import_leetcode_problems.py): {unknown[:10]}')

    # Global ranking: a company's frequency (0-100) for a problem adds to the problem's score, so problems asked
    # often by many companies rank highest. "recent" only counts the last six months.
    stats = {slug: {'companies': [], 'all': 0.0, 'recent': 0.0} for slug in tagged}
    for company in snapshot['companies']:
        for slug, freq in company['problems']:
            s = stats[slug]
            s['companies'].append([company['slug'], freq.get('all', 0)])
            s['all'] += freq.get('all', 0) / 100
            s['recent'] += freq.get('m6', 0) / 100
    order = sorted(tagged, key=lambda slug: (-stats[slug]['all'], -len(stats[slug]['companies']), slug))
    rank = {slug: i for i, slug in enumerate(order, 1)}
    names = {c['slug']: c['name'] for c in snapshot['companies']}
    out_problems = {}
    for slug, p in catalog.items():
        s = stats.get(slug, {'companies': [], 'all': 0.0, 'recent': 0.0})
        s['companies'].sort(key=lambda c: (-c[1], names[c[0]].lower()))
        out_problems[slug] = {'number': p['number'], 'title': p['title'], 'difficulty': p['difficulty'], 'paid': p['paid'],
                              'topics': tagged[slug]['topics'] if slug in tagged else [],
                              'rank': rank.get(slug, 0), 'count': len(s['companies']), 'score': round(s['all'], 2),
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
        # Compact rows for assets/js/interview.js:
        # [slug, number, title, difficulty, topics, frequencies (or null), written, companies, premium].
        return json.dumps([[slug, out_problems[slug]['number'], out_problems[slug]['title'], out_problems[slug]['difficulty'],
                            out_problems[slug]['topics'], freq, 1 if out_problems[slug]['written'] else 0,
                            out_problems[slug]['count'], 1 if out_problems[slug]['paid'] else 0] for slug, freq in rows],
                          ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')
    for c in companies:
        c['json'] = table(c['problems'])
    ranking = [[slug, {'all': out_problems[slug]['score'], **({'m6': out_problems[slug]['recent']} if out_problems[slug]['recent'] else {})}]
               for slug in order]
    # Topics: every tag in the company data, problems in global-rank order, with a guide when one is written.
    topics = []
    for tag in sorted({t for slug in tagged for t in tagged[slug]['topics']}):
        slugs = [slug for slug in order if tag in tagged[slug]['topics']]
        guide = guides.get(topic_slug(tag))
        if guide and guide[0].get('topic') != tag:
            sys.exit(f'interview/topics/{topic_slug(tag)}.md: topic {guide[0].get("topic")!r} does not match {tag!r}')
        topic = {'name': tag, 'slug': topic_slug(tag), 'count': len(slugs), 'written': sum(1 for s in slugs if s in written),
                 'slugs': slugs, 'guide': bool(guide), 'group': guide[0]['group'] if guide else '',
                 'title': guide[0]['title'] if guide else tag, 'description': guide[0]['description'] if guide else '',
                 'json': table([[slug, {'all': out_problems[slug]['score']}] for slug in slugs])}
        for level in ('Easy', 'Medium', 'Hard'):
            topic[level.lower()] = sum(1 for s in slugs if catalog[s]['difficulty'] == level)
        topics.append(topic)
    topics.sort(key=lambda t: (-t['count'], t['name']))
    topic_slugs = {t['name']: t['slug'] for t in topics}
    for name, (fm, _) in guides.items():
        if name not in {t['slug'] for t in topics}:
            sys.exit(f'interview/topics/{name}.md: {fm.get("topic")!r} is not a topic tag in the company data')
    by_number = sorted(catalog, key=lambda slug: catalog[slug]['number'])
    counts = {'total': len(catalog), 'premium': sum(1 for p in catalog.values() if p['paid']), 'written': len(written),
              'tagged': len(tagged)}
    for level in ('Easy', 'Medium', 'Hard'):
        counts[level.lower()] = sum(1 for p in catalog.values() if p['difficulty'] == level)
        counts['written' + level] = sum(1 for slug in written if catalog[slug]['difficulty'] == level)
    data = {'source': snapshot['source'], 'catalogSource': universe['source'], 'order': order, 'ranking': ranking,
            'rankingJson': table(ranking), 'recentCount': sum(1 for r in ranking if 'm6' in r[1]),
            'byNumber': by_number, 'catalogJson': table([[slug, None] for slug in by_number]), 'counts': counts,
            'names': names, 'logos': sorted(logos), 'problems': out_problems, 'companies': companies,
            'popular': [c['slug'] for c in sorted(companies, key=lambda c: -c['count'])[:12]],
            'writtenCount': len(written), 'topics': topics, 'topicSlugs': topic_slugs,
            'groups': [{'key': k, 'title': t, 'blurb': b} for k, t, b in GROUPS], 'guideCount': len(guides)}
    with open(DATA, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, separators=(',', ':'))
    os.makedirs(os.path.dirname(INDEX), exist_ok=True)
    with open(INDEX, 'w', encoding='utf-8') as f:
        json.dump({'v': 1, 'counts': counts, 'problems': {slug: [p['number'], p['difficulty'], 1 if slug in written else 0]
                                                           for slug, p in catalog.items()}},
                  f, ensure_ascii=False, separators=(',', ':'))

    with open(RUNTIME, 'w', encoding='utf-8') as f:
        json.dump({'v': 1, 'python': read(TESTS, '_prelude', 'prelude.py'), 'javascript': read(TESTS, '_prelude', 'prelude.js')},
                  f, ensure_ascii=False, separators=(',', ':'))

    base = {'type': 'interview'}
    page(os.path.join(CONTENT, 'interview', '_index.md'), {**base, 'title': 'Coding Interview Questions by Company',
         'layout': 'directory', 'url': '/interview/',
         'description': f'Search {len(companies)} companies and see the LeetCode questions each one asks in coding interviews, '
                        'with explanations and solutions in Python, Java, C++, JavaScript and Go.'})
    page(os.path.join(CONTENT, 'interview-most-asked.md'), {**base, 'title': 'Most Asked LeetCode Interview Questions',
         'layout': 'ranking', 'url': '/interview/most-asked/',
         'description': f'A global ranking of {len(tagged)} LeetCode problems by how often companies ask them in '
                        'coding interviews. Start general practice from the top.'})
    page(os.path.join(CONTENT, 'interview-problems.md'), {**base, 'title': 'All LeetCode Problems',
         'layout': 'problems', 'url': '/interview/problems/',
         'description': f'Every LeetCode problem by number, {len(catalog)} in all, showing the {len(written)} with a full '
                        'explanation and solutions in Python, Java, C++, JavaScript and Go, and which ones you have solved.'})
    page(os.path.join(CONTENT, 'interview-topics.md'), {**base, 'title': 'LeetCode Problems by Topic',
         'layout': 'topics', 'url': '/interview/topics/',
         'description': f'Learn the techniques behind coding interview questions ({len(guides)} guides, from Two Pointers and '
                        f'Sliding Window to Heaps, Tries and Graphs), then practice the LeetCode problems tagged with each of {len(topics)} topics.'})
    for t in topics:
        guide = guides.get(t['slug'])
        page(os.path.join(CONTENT, 'interview-topic', t['slug'] + '.md'), {**base, 'layout': 'topic', 'topic': t['slug'],
             'title': f"{t['title']}: {'Guide and ' if guide else ''}LeetCode Problems", 'url': f"/interview/topics/{t['slug']}/",
             'description': guide[0]['description'] if guide else
             f"{t['count']} LeetCode problems tagged {t['name']}, sorted by how often companies ask them in coding interviews, "
             'with explanations and solutions in Python, Java, C++, JavaScript and Go.'}, guide[1] if guide else '')
    for c in companies:
        page(os.path.join(CONTENT, 'interview-company', c['slug'] + '.md'), {**base, 'layout': 'company',
             'title': f"{c['name']} Coding Interview Questions", 'company': c['slug'],
             'url': f"/interview/company/{c['slug']}/",
             'description': f"{c['count']} LeetCode questions asked in {c['name']} coding interviews, sorted by "
                            'frequency with recent-question filters, explanations and solutions.'})
    for slug, (fm, body) in written.items():
        page(os.path.join(CONTENT, 'interview-problem', slug + '.md'), {**base, 'layout': 'problem',
             'title': f"{catalog[slug]['number']}. {fm['title']}", 'problem': slug, 'url': f'/interview/problems/{slug}/',
             'description': fm['description'], 'workspace': workspace(slug, body)}, body)
    print(f'interview: {len(companies)} companies, {len(catalog)} problems ({len(tagged)} company-tagged), {len(written)} write-ups, '
          f'{len(topics)} topics ({len(guides)} guides)')


if __name__ == '__main__':
    main()
