"""Convert the Docusaurus docs/ tree into a Hugo content tree.

Usage (from the repo root):  python3 hugo/scripts/convert.py
Writes hugo/content/ and hugo/static/docsrc/ (both generated, git-ignored).

Every page keeps the exact URL Docusaurus gives it (number prefixes stripped, `slug`
front matter honoured, trailing slash), so a switch would not change any public URL.
"""
import json
import os
import re
import shutil
import sys

import yaml

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DOCS = os.path.join(ROOT, 'docs')
OUT = os.path.join(ROOT, 'hugo', 'content')
STATIC = os.path.join(ROOT, 'hugo', 'static', 'docsrc')

# Same rule as Docusaurus' default numberPrefixParser.
NUM = re.compile(r'^(?P<n>\d+)\s*[-_.]+\s*(?P<rest>[^-_.\s].*)$')
FM = re.compile(r'\A---\n(.*?)\n---\n?', re.S)
ADMONITIONS = {'note': 'NOTE', 'tip': 'TIP', 'info': 'NOTE', 'important': 'IMPORTANT',
               'warning': 'WARNING', 'caution': 'CAUTION', 'danger': 'CAUTION', 'code': 'NOTE'}


IGNORED = re.compile(r'^\d+[-_.]\d+')


def strip_num(name):
    if IGNORED.match(name):
        return name, None
    m = NUM.match(name)
    return (m.group('rest'), int(m.group('n'))) if m else (name, None)


def dir_url(rel_dir):
    parts = [strip_num(p)[0] for p in rel_dir.split('/') if p]
    return '/docs/' + '/'.join(parts) if parts else '/docs'


def read(path):
    s = open(path, encoding='utf8').read()
    m = FM.match(s)
    fm = {}
    if m:
        try:
            fm = yaml.safe_load(m.group(1)) or {}
        except yaml.YAMLError:
            fm = {}
        if not isinstance(fm, dict):
            fm = {}
        s = s[m.end():]
    return fm, s


def page_url(rel_dir, stem, fm, is_index):
    base = dir_url(rel_dir)
    slug = fm.get('slug')
    if isinstance(slug, str) and slug:
        url = '/docs' + slug if slug.startswith('/') else base + '/' + slug
    elif is_index:
        url = base
    else:
        url = base + '/' + strip_num(stem)[0]
    url = re.sub(r'/+', '/', url)
    return url.rstrip('/') + '/'


def convert_body(body):
    # Docusaurus renders ```mdx-code-block fences as live MDX: unwrap them before converting.
    body = re.sub(r'^(`{3,})mdx-code-block[ \t]*\n(.*?)\n\1[ \t]*$', r'\2', body, flags=re.S | re.M)
    out, fence, adm = [], None, 0
    for line in body.split('\n'):
        stripped = line.lstrip()
        m = re.match(r'(`{3,}|~{3,})', stripped)
        if m:
            tok = m.group(1)
            if fence is None:
                fence = tok
            elif stripped.startswith(fence) and stripped.strip() == stripped[:len(stripped.strip())] and set(stripped.strip()) <= set(fence[0]) and len(stripped.strip()) >= len(fence):
                fence = None
            out.append(('> ' * adm) + line)
            continue
        if fence is None:
            # MDX-only syntax
            if re.match(r'^import\s.+\sfrom\s+[\'"]', line) or re.match(r'^export\s', line):
                continue
            line = re.sub(r'\{/\*.*?\*/\}', '', line)
            if re.match(r'^\s*</?Tabs\b[^>]*>\s*$', line):
                continue
            tm = re.match(r'^\s*<TabItem\b[^>]*?label=["\']([^"\']+)["\'][^>]*>\s*$', line)
            if tm:
                out.append(('> ' * adm) + f'**{tm.group(1)}**')
                out.append('> ' * adm)
                continue
            if re.match(r'^\s*</?TabItem\b[^>]*>\s*$', line):
                continue
            am = re.match(r'^\s*:::(\w+)\s*(.*)$', line)
            if am and am.group(1).lower() in ADMONITIONS:
                kind = ADMONITIONS[am.group(1).lower()]
                title = am.group(2).strip()
                out.append(('> ' * adm) + f'> [!{kind}]' + (f' {title}' if title else ''))
                adm += 1
                continue
            if re.match(r'^\s*:::\s*$', line) and adm:
                adm -= 1
                out.append('')
                continue
        out.append(('> ' * adm) + line if adm else line)
    return '\n'.join(out)


def category_meta(dir_path):
    p = os.path.join(dir_path, '_category_.json')
    if os.path.exists(p):
        try:
            return json.load(open(p, encoding='utf8'))
        except ValueError:
            pass
    return {}


def main():
    if os.path.exists(OUT):
        shutil.rmtree(OUT)
    if os.path.exists(STATIC):
        shutil.rmtree(STATIC)
    pages = 0
    urls = {}
    for dirpath, dirnames, filenames in os.walk(DOCS):
        rel_dir = os.path.relpath(dirpath, DOCS).replace(os.sep, '/')
        rel_dir = '' if rel_dir == '.' else rel_dir
        out_dir = os.path.join(OUT, 'docs', rel_dir)
        os.makedirs(out_dir, exist_ok=True)
        cat = category_meta(dirpath)
        dir_name = os.path.basename(dirpath)
        _, dir_weight = strip_num(dir_name)
        index_src = None
        for f in filenames:
            stem, ext = os.path.splitext(f)
            if ext in ('.md', '.mdx') and stem.lower() in ('index', 'readme'):
                index_src = f
        for f in sorted(filenames):
            src = os.path.join(dirpath, f)
            stem, ext = os.path.splitext(f)
            if ext not in ('.md', '.mdx'):
                if f != '_category_.json':
                    dst = os.path.join(STATIC, rel_dir, f)
                    os.makedirs(os.path.dirname(dst), exist_ok=True)
                    shutil.copy2(src, dst)
                continue
            is_index = f == index_src
            fm, body = read(src)
            url = page_url(rel_dir, stem, fm, is_index)
            _, w = strip_num(stem)
            title = fm.get('title') or (re.search(r'^# (.+)$', body, re.M) or [None, stem])[1]
            new_fm = {
                'title': str(title),
                'url': url,
                'weight': fm.get('sidebar_position', w if w is not None else 999),
                'srcdir': rel_dir,
            }
            for k in ('description', 'sidebar_label', 'keywords', 'tags'):
                if fm.get(k):
                    new_fm[k] = fm[k]
            if is_index:
                new_fm['weight'] = dir_weight if dir_weight is not None else cat.get('position', 999)
                if cat.get('label'):
                    new_fm['sidebar_label'] = cat['label']
            name = '_index.md' if is_index else re.sub(r'\.mdx$', '.md', f)
            text = '---\n' + yaml.safe_dump(new_fm, allow_unicode=True, sort_keys=False) + '---\n\n' + convert_body(body)
            open(os.path.join(out_dir, name), 'w', encoding='utf8').write(text)
            if url in urls:
                print('DUPLICATE URL', url, urls[url], src, file=sys.stderr)
            urls[url] = src
            pages += 1
        if not index_src:
            # Section without its own page in Docusaurus: list it in menus, render nothing.
            label = cat.get('label') or strip_num(dir_name)[0].replace('-', ' ').title()
            new_fm = {'title': label, 'weight': dir_weight if dir_weight is not None else cat.get('position', 999),
                      'build': {'render': 'never', 'list': 'always'}, 'srcdir': rel_dir}
            if rel_dir == '':
                new_fm = {'title': 'Docs', 'build': {'render': 'never', 'list': 'always'}}
            open(os.path.join(out_dir, '_index.md'), 'w', encoding='utf8').write(
                '---\n' + yaml.safe_dump(new_fm, allow_unicode=True, sort_keys=False) + '---\n')
    for f in ('about.md', 'contact.md', 'privacy-policy.md', 'terms.md'):
        fm, body = read(os.path.join(ROOT, 'src', 'pages', f))
        stem = f[:-3]
        new_fm = {'title': fm.get('title', stem.title()), 'url': f'/{stem}/', 'type': 'page'}
        if fm.get('description'):
            new_fm['description'] = fm['description']
        open(os.path.join(OUT, f), 'w', encoding='utf8').write(
            '---\n' + yaml.safe_dump(new_fm, allow_unicode=True, sort_keys=False) + '---\n\n' + convert_body(body))
    open(os.path.join(OUT, 'search.md'), 'w').write('---\ntitle: Search\nurl: /search/\ntype: search\n---\n')
    open(os.path.join(OUT, '_index.md'), 'w').write('---\ntitle: Compile N Run\n---\n')
    tutorials = sidebar_tutorials()
    write_category_pages(tutorials, urls)
    os.makedirs(os.path.join(ROOT, 'hugo', 'data'), exist_ok=True)
    json.dump(tutorials, open(os.path.join(ROOT, 'hugo', 'data', 'tutorials.json'), 'w'), indent=1)
    json.dump(urls, open(os.path.join(ROOT, 'hugo', 'urls.json'), 'w'), indent=0)
    print(f'converted {pages} pages')


def kebab(label):
    # Docusaurus drops punctuation outright (CI/CD -> cicd, "A & B" -> a--b), then maps spaces to "-".
    return re.sub(r'\s', '-', re.sub(r'[^a-z0-9\s-]', '', label.lower()).strip())


def sidebar_tutorials():
    """Read (label, dirName) pairs from sidebars.js in order, with Docusaurus' generated-index slugs."""
    src = open(os.path.join(ROOT, 'sidebars.js'), encoding='utf8').read()
    src = re.sub(r'^\s*//.*$', '', src, flags=re.M)
    seen = {}
    out = []
    for m in re.finditer(r"label:\s*'([^']+)'[\s\S]{0,400}?dirName:\s*'([^']+)'", src):
        label, d = m.group(1), m.group(2)
        base = kebab(label)
        n = seen.get(base, 0)
        seen[base] = n + 1
        slug = base if n == 0 else f'{base}-{n}'
        out.append({'label': label, 'dir': d, 'url': f'/docs/category/{slug}/', 'group': d.split('/')[0]})
    return out


def write_category_pages(tutorials, urls):
    d = os.path.join(OUT, 'tutorial-index')
    os.makedirs(d, exist_ok=True)
    open(os.path.join(d, '_index.md'), 'w').write('---\ntitle: Tutorials\nbuild:\n  render: never\n  list: never\n---\n')
    for i, t in enumerate(tutorials):
        fm = {'title': t['label'], 'url': t['url'], 'tutdir': t['dir'], 'type': 'tutorialindex',
              'description': f"All lessons in the {t['label']} on Compile N Run, organized by section."}
        open(os.path.join(d, f'{i:03d}.md'), 'w', encoding='utf8').write(
            '---\n' + yaml.safe_dump(fm, allow_unicode=True, sort_keys=False) + '---\n')
        urls[t['url']] = 'sidebars.js'


if __name__ == '__main__':
    main()
