#!/usr/bin/env python3
"""Validate routes globally; validate links/metadata in managed and changed docs.

Run from any directory. --base selects the merge base for changed-source checks.
--write-mdx-list emits the exact source scope consumed by check_mdx.mjs.
No content is converted or written by this command.
"""
import argparse
from collections import Counter, defaultdict
from datetime import date
from functools import lru_cache
from html import unescape
from html.parser import HTMLParser
import importlib.util
import json
from pathlib import Path
import re
import subprocess
import sys
from urllib.parse import unquote, urljoin, urlsplit

import yaml
from markdown_it import MarkdownIt

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[2]
spec = importlib.util.spec_from_file_location('tutorial_converter', ROOT / 'hugo/scripts/convert.py')
converter = importlib.util.module_from_spec(spec)
spec.loader.exec_module(converter)
MARKDOWN = MarkdownIt('commonmark')
MANIFEST = ROOT / 'hugo/data/content-quality.json'


class UniqueKeyLoader(yaml.SafeLoader):
    """Reject ambiguous front matter instead of accepting its last duplicate key."""


def unique_mapping(loader, node, deep=False):
    result = {}
    for key_node, value_node in node.value:
        key = loader.construct_object(key_node, deep=deep)
        if key in result:
            raise ValueError(f'duplicate front-matter key: {key}')
        result[key] = loader.construct_object(value_node, deep=deep)
    return result


UniqueKeyLoader.add_constructor(yaml.resolver.BaseResolver.DEFAULT_MAPPING_TAG, unique_mapping)


class HTMLReferences(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links, self.ids = [], set()

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if attrs.get('id'):
            self.ids.add(attrs['id'])
        for key in ('href', 'src', 'poster'):
            if attrs.get(key):
                self.links.append(attrs[key])
        if attrs.get('srcset'):
            self.links.extend(part.strip().split()[0] for part in attrs['srcset'].split(',') if part.strip())


def normalized(url):
    return '/' + unquote(url).strip('/') + '/' if url.strip('/') else '/'


def slug(text):
    # Goldmark's default heading identifier preserves Unicode letters/numbers.
    return re.sub(r'[^\w\- ]', '', unescape(text).lower()).replace(' ', '-')


@lru_cache(maxsize=None)
def document(path):
    source = (ROOT / path).read_text(encoding='utf-8')
    match = converter.FM.match(source)
    metadata = yaml.load(match.group(1), Loader=UniqueKeyLoader) if match else {}
    if not isinstance(metadata, dict):
        raise ValueError('front matter must be a mapping')
    return metadata, source[match.end():] if match else source


@lru_cache(maxsize=None)
def parsed(path):
    _, body = document(path)
    tokens = MARKDOWN.parse(body)
    links, anchors, seen = [], set(), Counter()
    for index, token in enumerate(tokens):
        if token.type == 'heading_open' and token.tag != 'h1':
            inline = tokens[index + 1]
            explicit = re.search(r'\s*\{#([^}]+)\}\s*$', inline.content)
            text = ''.join(child.content for child in (inline.children or []) if child.type in ('text', 'code_inline'))
            anchor = explicit.group(1) if explicit else slug(text)
            number = seen[anchor]
            seen[anchor] += 1
            anchors.add(anchor + (f'-{number}' if number else ''))
        for child in [token, *(token.children or [])]:
            if child.type == 'link_open':
                links.append(child.attrGet('href'))
            elif child.type == 'image':
                links.append(child.attrGet('src'))
            elif child.type in ('html_block', 'html_inline'):
                parser = HTMLReferences()
                parser.feed(child.content)
                links.extend(parser.links)
                anchors.update(parser.ids)
    return links, anchors


def changed_sources(base):
    if not base or set(base) == {'0'}:
        return set(), set()
    # Revision is an argument, never shell source. Merge base handles PR merges.
    revision = subprocess.check_output(['git', 'merge-base', base, 'HEAD'], cwd=ROOT, text=True).strip()
    output = subprocess.check_output(['git', 'diff', '--name-only', '-z', '--no-renames', revision, '--', 'docs'], cwd=ROOT)
    # Include new local files when run before staging; committed PR sources are
    # already included by git diff in CI.
    output += subprocess.check_output(['git', 'ls-files', '--others', '--exclude-standard', '-z', '--', 'docs'], cwd=ROOT)
    changed = {name for name in output.decode().split('\0') if name.endswith(('.md', '.mdx'))}
    return {name for name in changed if (ROOT / name).is_file()}, changed


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--base', help='Git revision; checks docs changed since its merge base with HEAD')
    parser.add_argument('--write-mdx-list', type=Path)
    args = parser.parse_args()
    manifest = json.loads(MANIFEST.read_text())
    errors = []
    managed = set()
    seen_courses = set()
    for course in manifest['courses']:
        if course['id'] in seen_courses:
            errors.append(f"manifest: duplicate course ID {course['id']}")
        seen_courses.add(course['id'])
        course_path = ROOT / course['sourceRoot']
        if not course_path.resolve().is_relative_to((ROOT / 'docs').resolve()):
            errors.append(f"manifest: course source must be inside docs/: {course['sourceRoot']}")
            continue
        if not course_path.is_dir():
            errors.append(f"manifest: missing course {course['sourceRoot']}")
        try:
            reviewed = date.fromisoformat(course['lastReviewed'])
            if reviewed > date.today():
                errors.append(f"manifest: future review date for {course['id']}")
        except ValueError:
            errors.append(f"manifest: invalid review date for {course['id']}")
        if not course.get('testedVersions') or not course.get('references'):
            errors.append(f"manifest: versions and references required for {course['id']}")
        course_sources = {str(p.relative_to(ROOT)) for p in course_path.rglob('*') if p.suffix in ('.md', '.mdx')}
        if not course_sources:
            errors.append(f"manifest: no documents in {course['sourceRoot']}")
        managed.update(course_sources)
    changed, all_changed = changed_sources(args.base)
    selected = managed | changed
    routes, source_routes = defaultdict(list), {}
    paths = sorted(p for p in (ROOT / 'docs').rglob('*') if p.suffix in ('.md', '.mdx'))
    for path in paths:
        relative = str(path.relative_to(ROOT))
        # Use converter behavior for untouched legacy front matter. Strict YAML
        # validation applies below to every managed/changed document.
        fm, _ = converter.read(path)
        route = converter.page_url(str(path.parent.relative_to(ROOT / 'docs')), path.stem, fm, path.stem.lower() in ('index', 'readme'))
        routes[normalized(route)].append(relative)
        source_routes[relative] = route
    for tutorial in converter.sidebar_tutorials():
        routes[normalized(tutorial['url'])].append('sidebars.js')
    for route, sources in routes.items():
        if len(sources) > 1:
            errors.append(f"duplicate URL {route}: {', '.join(sources)}")

    known_pages = {'/', '/roadmap/', '/search/', '/learn/', '/playground/', '/learning-catalog.json/', '/blog/', '/blog/archive/'}
    known_pages.update(normalized('/' + p.stem) for p in (ROOT / 'src/pages').glob('*.md'))
    # Blogs have their own converter path and slug convention.
    for path in (ROOT / 'blog').rglob('*'):
        if path.suffix in ('.md', '.mdx'):
            fm, _ = converter.read(path)
            name = path.parent.name if path.stem == 'index' else path.stem
            known_pages.add(normalized('/blog/' + str(fm.get('slug') or re.sub(r'^\d{4}-\d{2}-\d{2}-', '', name))))

    # A removal can break links from untouched docs. Check incoming links to
    # changed/deleted source paths and their old URLs, without baselining or
    # suppressing unrelated legacy link errors.
    affected_routes = {normalized(source_routes[p]) for p in all_changed if p in source_routes}
    if args.base and set(args.base) != {'0'}:
        revision = subprocess.check_output(['git', 'merge-base', args.base, 'HEAD'], cwd=ROOT, text=True).strip()
        for path in all_changed:
            result = subprocess.run(['git', 'show', f'{revision}:{path}'], cwd=ROOT, text=True, capture_output=True)
            if result.returncode == 0:
                match = converter.FM.match(result.stdout)
                fm = yaml.safe_load(match.group(1)) if match else {}
                item = Path(path).relative_to('docs')
                affected_routes.add(normalized(converter.page_url(str(item.parent), item.stem, fm or {}, item.stem.lower() in ('index', 'readme'))))

    def validate_link(source, destination):
        parts = urlsplit(destination)
        if parts.scheme or parts.netloc or destination.startswith(('mailto:', 'tel:', 'data:')):
            return None
        target_path, fragment = unquote(parts.path), unquote(parts.fragment)
        if not target_path:
            target_source = source
        elif not target_path.startswith('/') and target_path.endswith(('.md', '.mdx')):
            resolved = (ROOT / source).parent.joinpath(target_path).resolve()
            if not resolved.is_relative_to(ROOT):
                return 'source link escapes repository'
            if not resolved.is_file():
                return 'missing source file'
            target_source = str(resolved.relative_to(ROOT))
        else:
            route = normalized(target_path if target_path.startswith('/') else urljoin(source_routes[source], target_path))
            candidates = routes.get(route)
            target_source = candidates[0] if candidates else None
            if target_source is None:
                if route in known_pages:
                    return None
                relative = target_path.lstrip('/')
                static_paths = [ROOT / 'static' / relative, ROOT / 'hugo/static' / relative]
                if not target_path.startswith('/'):
                    static_paths.append((ROOT / source).parent / target_path)
                if any(p.is_file() or (p.is_dir() and (p / 'index.html').is_file()) for p in static_paths):
                    return None
                return 'missing public route or asset'
        if fragment and target_source and target_source.endswith(('.md', '.mdx')):
            try:
                if fragment not in parsed(target_source)[1]:
                    return f'missing heading or ID #{fragment}'
            except (ValueError, yaml.YAMLError):
                return 'target has invalid front matter'
        return None

    checked_links = 0
    for source in source_routes:
        in_scope = source in selected
        if not in_scope and not affected_routes:
            continue
        try:
            fm, _ = document(source)
            if in_scope:
                for key in ('title', 'description') if source in managed else ('title',):
                    if not isinstance(fm.get(key), str) or not fm[key].strip():
                        errors.append(f'{source}: missing nonempty {key} front matter')
                if 'last_reviewed' in fm:
                    try:
                        reviewed = date.fromisoformat(str(fm['last_reviewed']))
                        if reviewed > date.today():
                            raise ValueError('review date is in the future')
                    except ValueError as error:
                        errors.append(f'{source}: invalid last_reviewed: {error}')
                if 'tested_versions' in fm and (not isinstance(fm['tested_versions'], dict) or not fm['tested_versions'] or any(not isinstance(value, str) or not value.strip() for value in fm['tested_versions'].values())):
                    errors.append(f'{source}: tested_versions must map labels to nonempty version strings')
                if 'slug' in fm and (not isinstance(fm['slug'], str) or not fm['slug'].strip() or any(character in fm['slug'] for character in ('?', '#'))):
                    errors.append(f'{source}: slug must be a nonempty path without a query or fragment')
                if 'content_type' in fm and fm['content_type'] not in ('Lesson', 'Project', 'Reference'):
                    errors.append(f'{source}: content_type must be Lesson, Project, or Reference')
            links, _ = parsed(source)
        except (ValueError, yaml.YAMLError) as error:
            if in_scope:
                errors.append(f'{source}: invalid front matter: {error}')
            continue
        for destination in links:
            if not in_scope:
                path = unquote(urlsplit(destination).path)
                source_target = str(((ROOT / source).parent / path).resolve().relative_to(ROOT)) if path and not path.startswith('/') and ((ROOT / source).parent / path).resolve().is_relative_to(ROOT) else ''
                route_target = normalized(path if path.startswith('/') else urljoin(source_routes[source], path))
                if source_target not in all_changed and route_target not in affected_routes:
                    continue
            checked_links += 1
            failure = validate_link(source, destination)
            if failure:
                errors.append(f'{source}: {destination!r}: {failure}')
    if args.write_mdx_list:
        args.write_mdx_list.parent.mkdir(parents=True, exist_ok=True)
        args.write_mdx_list.write_text(json.dumps(sorted(selected), indent=2) + '\n')
    print(f'Content: {len(paths)} global routes; {len(managed)} mandatory managed docs + {len(changed - managed)} changed docs; {checked_links} internal/external references inspected.')
    print('Boundary: legacy docs outside this scope are checked only for route collisions and incoming references to changed targets. No existing failures are silently baselined.')
    for error in errors:
        print(error, file=sys.stderr)
    return bool(errors)


if __name__ == '__main__':
    sys.exit(main())
