#!/usr/bin/env python3
"""Run reviewed tutorial projects in disposable directories, never in static/."""
import argparse
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import shutil
import subprocess
import sys
from tempfile import TemporaryDirectory
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[2]
MANIFEST = ROOT / 'hugo/data/content-quality.json'


def run(arguments, cwd, timeout=300):
    print('+ ' + ' '.join(map(str, arguments)), flush=True)
    subprocess.run(list(map(str, arguments)), cwd=cwd, check=True, timeout=timeout)


class References(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links, self.ids = [], []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if attrs.get('id'):
            self.ids.append(attrs['id'])
        for key in ('href', 'src', 'action', 'poster'):
            if attrs.get(key):
                self.links.append(attrs[key])


def check_static(source):
    pages = {}
    for path in source.rglob('*.html'):
        parsed = References()
        parsed.feed(path.read_text())
        if len(parsed.ids) != len(set(parsed.ids)):
            raise ValueError(f'{path}: duplicate element ID')
        pages[path.resolve()] = parsed
    for path, parsed in pages.items():
        for destination in parsed.links:
            url = urlsplit(destination)
            if url.scheme or url.netloc:
                continue
            target = ((ROOT / 'static' / unquote(url.path).lstrip('/')) if url.path.startswith('/') else path.parent / unquote(url.path)).resolve() if url.path else path
            if target.is_dir():
                target /= 'index.html'
            if not target.is_file():
                raise ValueError(f'{path}: missing asset/link {destination}')
            if url.fragment and target in pages and unquote(url.fragment) not in pages[target].ids:
                raise ValueError(f'{path}: missing fragment {destination}')
    print(f'Static references: {len(pages)} HTML files in {source.name}')


def check_python(project):
    if sys.version_info < (3, 12):
        raise RuntimeError('Pinned scikit-learn example requires Python 3.12 or later')
    environment = project.parent / 'environment'
    run([sys.executable, '-m', 'venv', environment], project)
    python = environment / ('Scripts/python.exe' if sys.platform == 'win32' else 'bin/python')
    run([python, '-m', 'pip', 'install', '--disable-pip-version-check', '-r', 'requirements.txt'], project, 600)
    for name in ('first', 'second'):
        run([python, 'train.py', '--output-dir', name, '--save-model'], project)
    first = json.loads((project / 'first/report.json').read_text())
    second = json.loads((project / 'second/report.json').read_text())
    if first != second:
        raise AssertionError('Repeated same-environment reports differ')
    assert first['rows'] == {'development': 640, 'test': 160}
    assert first['candidate_count'] == 6 and first['cv_folds'] == 4
    assert len(first['raw_feature_columns']) == 6
    assert len(first['transformed_feature_names']) == 8
    assert first['selection_metric'] == 'balanced_accuracy'
    for name in ('baseline_test', 'model_test'):
        metrics = first[name]
        for metric in ('accuracy', 'balanced_accuracy', 'f1_positive', 'average_precision', 'roc_auc'):
            assert 0 <= metrics[metric] <= 1, (name, metric)
        assert sum(map(sum, metrics['confusion_matrix_labels_0_1'])) == 160
    assert first['baseline_test']['balanced_accuracy'] == 0.5
    assert (project / 'first/model.joblib').is_file()
    print('ML: repeat reports match; schema, split counts, metrics, and trusted model round trips passed.')


def main():
    manifest = json.loads(MANIFEST.read_text())
    examples = {example['id']: example for example in manifest['examples']}
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('example', choices=[*examples, 'static'])
    args = parser.parse_args()
    selected = [ex for ex in examples.values() if ex['kind'] == 'static'] if args.example == 'static' else [examples[args.example]]
    for example in selected:
        source = ROOT / example['sourceRoot']
        # Dependency installation/generated model files must never be published.
        prohibited = [p for p in source.rglob('*') if p.name in ('node_modules', '.venv', '__pycache__') or p.suffix in ('.joblib', '.pyc')]
        if prohibited:
            raise RuntimeError(f'Generated dependencies/artifacts in public source: {prohibited}')
        check_static(source)
        if example['kind'] == 'static':
            continue
        with TemporaryDirectory(prefix=f"cnr-{example['id']}-") as temp:
            project = Path(temp) / 'project'
            shutil.copytree(source, project)
            if example['kind'] == 'node':
                run(['npm', 'ci', '--ignore-scripts', '--no-audit', '--no-fund'], project)
                run(['npm', 'test'], project)
                # Same report command as Actions: a passing process creates TAP.
                result = subprocess.run(['node', '--test', '--test-reporter=tap'], cwd=project, text=True, capture_output=True, timeout=120)
                if result.returncode or not re.search(r'# pass [1-9]', result.stdout):
                    raise AssertionError(f'Missing successful TAP evidence: {result.stdout}\n{result.stderr}')
            elif example['kind'] == 'tailwind':
                original = (project / 'output.css').read_bytes()
                run(['npm', 'ci', '--no-audit', '--no-fund'], project)
                (project / 'output.css').unlink()
                run(['npm', 'run', 'build'], project)
                compiled = (project / 'output.css').read_bytes()
                if original != compiled:
                    raise AssertionError('Committed Tailwind output.css is stale: regenerate it with npm ci && npm run build')
                if len(compiled) < 1000 or b'@apply' in compiled or b'@import "tailwindcss"' in compiled:
                    raise AssertionError('Tailwind output is missing or contains uncompiled directives')
            elif example['kind'] == 'python':
                check_python(project)
            else:
                raise ValueError(f"Unknown example kind {example['kind']}")
    print(f'Example checks passed: {args.example}')


if __name__ == '__main__':
    main()
