#!/usr/bin/env python3
"""Validate interview problem write-ups and run every solution against its tests.

  python3 hugo/scripts/check_interview.py              # all problems
  python3 hugo/scripts/check_interview.py two-sum      # selected problems
  python3 hugo/scripts/check_interview.py --no-run     # structure only (no compilers needed)

Layout (one write-up per LeetCode problem, never duplicated):
  interview/problems/<leetcode-slug>.md   front matter + sections + one code block per language
  interview/tests/<leetcode-slug>/         test.py, test.js, test.cpp, test.go, Main.java
  interview/tests/_prelude/                ListNode/TreeNode and helpers per language
"""
import argparse
import concurrent.futures
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile

import yaml

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
INTERVIEW = os.path.join(ROOT, 'interview')
PROBLEMS = os.path.join(INTERVIEW, 'problems')
TESTS = os.path.join(INTERVIEW, 'tests')
PRELUDE = os.path.join(TESTS, '_prelude')
DATA = os.path.join(INTERVIEW, 'data', 'leetcode-companies.json')

SECTIONS = ['Problem', 'Examples', 'Key idea', 'Approach', 'Complexity', 'Solutions']
OPTIONAL = {'Common mistakes', 'Follow-up questions', 'Related problems'}
LANGUAGES = ['python', 'java', 'cpp', 'javascript', 'go']
TEST_FILES = {'python': 'test.py', 'java': 'Main.java', 'cpp': 'test.cpp', 'javascript': 'test.js', 'go': 'test.go'}
FENCE = re.compile(r'^```([a-z+#]*)[^\n]*\n(.*?)^```\s*$', re.S | re.M)


def parse(path):
    text = open(path, encoding='utf-8').read()
    match = re.match(r'^---\n(.*?)\n---\n(.*)$', text, re.S)
    if not match:
        raise ValueError('missing front matter')
    return yaml.safe_load(match.group(1)) or {}, match.group(2)


def sections(body):
    parts = re.split(r'^## +(.+?)\s*$', body, flags=re.M)
    return {parts[i].strip(): parts[i + 1] for i in range(1, len(parts), 2)}, [parts[i].strip() for i in range(1, len(parts), 2)]


def solutions(body):
    found, order = {}, []
    for lang, code in FENCE.findall(sections(body)[0].get('Solutions', '')):
        order.append(lang)
        found.setdefault(lang, code)
    return found, order


def validate(slug, problems):
    errors = []
    path = os.path.join(PROBLEMS, slug + '.md')
    try:
        fm, body = parse(path)
    except (ValueError, yaml.YAMLError) as e:
        return [f'{slug}: {e}']
    if fm.get('leetcode') != slug:
        errors.append(f"{slug}: front matter 'leetcode' must equal the file name ({fm.get('leetcode')!r})")
    if slug not in problems:
        errors.append(f'{slug}: not a problem in the company data snapshot')
    for key in ('title', 'description'):
        if not isinstance(fm.get(key), str) or not fm[key].strip():
            errors.append(f'{slug}: front matter needs a {key}')
    if slug in problems and fm.get('title') != problems[slug]['title']:
        errors.append(f"{slug}: title should match LeetCode's title {problems[slug]['title']!r}")
    found, names = sections(body)
    required = [name for name in names if name in SECTIONS]
    if required != SECTIONS:
        errors.append(f'{slug}: sections must be ## {" / ## ".join(SECTIONS)} in that order (found {names})')
    for name in names:
        if name not in SECTIONS and name not in OPTIONAL:
            errors.append(f'{slug}: unexpected section "## {name}"')
    # Links to other write-ups must point at problems that exist (others stay plain text until written).
    for target in re.findall(r'\]\(/interview/problems/([a-z0-9-]+)/\)', body):
        if not os.path.isfile(os.path.join(PROBLEMS, target + '.md')):
            errors.append(f'{slug}: links to /interview/problems/{target}/, which has no write-up yet')
    code, order = solutions(body)
    if order != LANGUAGES:
        errors.append(f'{slug}: Solutions must contain exactly one block each, in order: {", ".join(LANGUAGES)} (found {order})')
    for lang in LANGUAGES:
        if not os.path.isfile(os.path.join(TESTS, slug, TEST_FILES[lang])):
            errors.append(f'{slug}: missing tests/{slug}/{TEST_FILES[lang]}')
    return errors


def run(cmd, cwd, timeout=60):
    result = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True, timeout=timeout)
    if result.returncode != 0:
        raise RuntimeError((result.stdout + result.stderr).strip()[-1500:] or f'exit {result.returncode}')


def read(*parts):
    return open(os.path.join(*parts), encoding='utf-8').read()


def extra(tests, name):
    """Optional per-problem prelude (types LeetCode provides for this problem only, e.g. a Node with `random`)."""
    path = os.path.join(tests, name)
    return read(path) + '\n' if os.path.isfile(path) else ''


def run_language(slug, lang, code):
    tests = os.path.join(TESTS, slug)
    with tempfile.TemporaryDirectory(prefix=f'cnr-{slug}-{lang}-') as work:
        if lang == 'python':
            open(os.path.join(work, 'solution.py'), 'w').write(read(PRELUDE, 'prelude.py') + '\n\n' + extra(tests, 'prelude.py') + code)
            shutil.copy(os.path.join(tests, 'test.py'), work)
            run([sys.executable, 'test.py'], work)
        elif lang == 'javascript':
            open(os.path.join(work, 'main.js'), 'w').write('"use strict";\n' + read(PRELUDE, 'prelude.js') + '\n' + extra(tests, 'prelude.js') + code + '\n' + read(tests, 'test.js'))
            run(['node', 'main.js'], work)
        elif lang == 'cpp':
            open(os.path.join(work, 'main.cpp'), 'w').write(read(PRELUDE, 'prelude.hpp') + '\n' + extra(tests, 'prelude.hpp') + code + '\n' + read(tests, 'test.cpp'))
            run(['g++', '-std=c++17', '-O1', '-Wall', '-Werror=return-type', '-o', 'main', 'main.cpp'], work, 120)
            run(['./main'], work)
        elif lang == 'go':
            open(os.path.join(work, 'go.mod'), 'w').write('module check\n\ngo 1.21\n')
            open(os.path.join(work, 'solution.go'), 'w').write('package main\n\n' + code)
            shutil.copy(os.path.join(PRELUDE, 'prelude.go'), work)
            shutil.copy(os.path.join(tests, 'test.go'), os.path.join(work, 'main.go'))
            if os.path.isfile(os.path.join(tests, 'prelude.go')):
                shutil.copy(os.path.join(tests, 'prelude.go'), os.path.join(work, 'extra.go'))
            run(['go', 'run', '.'], work, 180)
        elif lang == 'java':
            imports = '' if re.search(r'^import java\.util\.\*;', code, re.M) else 'import java.util.*;\n'
            open(os.path.join(work, 'Solution.java'), 'w').write(imports + code)
            for name in ('ListNode.java', 'TreeNode.java', 'Check.java'):
                shutil.copy(os.path.join(PRELUDE, name), work)
            for name in os.listdir(tests):  # Main.java plus any per-problem types (e.g. Node.java)
                if name.endswith('.java'):
                    shutil.copy(os.path.join(tests, name), work)
            run(['javac', '-encoding', 'UTF-8', '-d', 'out'] + sorted(f for f in os.listdir(work) if f.endswith('.java')), work, 120)
            run(['java', '-cp', 'out', 'Main'], work)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('slugs', nargs='*')
    parser.add_argument('--no-run', action='store_true', help='validate structure without compiling')
    parser.add_argument('--jobs', type=int, default=os.cpu_count() or 4)
    args = parser.parse_args()
    problems = json.load(open(DATA, encoding='utf-8'))['problems']
    files = sorted(f[:-3] for f in os.listdir(PROBLEMS) if f.endswith('.md'))
    slugs = args.slugs or files
    errors = []
    # One write-up per problem: titles must be unique too (catches the same problem saved under a second slug).
    titles = {}
    for slug in files:
        try:
            title = parse(os.path.join(PROBLEMS, slug + '.md'))[0].get('title')
        except (ValueError, yaml.YAMLError):
            continue
        if title in titles:
            errors.append(f'{slug}: duplicates {titles[title]} (one write-up per problem)')
        titles[title] = slug
    for slug in slugs:
        if slug not in files:
            errors.append(f'{slug}: no interview/problems/{slug}.md')
            continue
        errors += validate(slug, problems)
    if not args.slugs:  # full runs only, so parallel writers checking their own slugs do not block each other
        orphans = sorted(set(os.listdir(TESTS)) - set(files) - {'_prelude'})
        errors += [f'tests/{name}: test folder without a write-up' for name in orphans]
    if errors or args.no_run:
        print('\n'.join(errors) or f'{len(slugs)} write-ups valid')
        return 1 if errors else 0
    jobs = [(slug, lang, code) for slug in slugs for lang, code in solutions(parse(os.path.join(PROBLEMS, slug + '.md'))[1])[0].items()]

    def task(job):
        slug, lang, code = job
        try:
            run_language(slug, lang, code)
            return None
        except (RuntimeError, subprocess.TimeoutExpired) as e:
            return f'{slug} [{lang}]: {e}'
    with concurrent.futures.ThreadPoolExecutor(args.jobs) as pool:
        failures = [f for f in pool.map(task, jobs) if f]
    print('\n\n'.join(failures) if failures else f'{len(slugs)} write-ups, {len(jobs)} solutions passed')
    return 1 if failures else 0


if __name__ == '__main__':
    sys.exit(main())
