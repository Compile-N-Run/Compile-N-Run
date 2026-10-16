"""Regression tests exercise validator behavior, not the course prose."""
from contextlib import redirect_stderr, redirect_stdout
import importlib.util
import io
import json
from pathlib import Path
import subprocess
import sys
from tempfile import TemporaryDirectory
import unittest
from unittest.mock import patch

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[2]
spec = importlib.util.spec_from_file_location('check_content', ROOT / 'hugo/scripts/check_content.py')
check = importlib.util.module_from_spec(spec)
spec.loader.exec_module(check)


class ContentChecks(unittest.TestCase):
    def setUp(self):
        self.temp = TemporaryDirectory(prefix='cnr-validator-test-')
        self.root = Path(self.temp.name)
        self.manifest = self.root / 'manifest.json'
        self.manifest.write_text(json.dumps({'courses': [{
            'id': 'managed', 'sourceRoot': 'docs/managed',
            'lastReviewed': '2020-01-01', 'testedVersions': {'test': '1'},
            'references': ['https://example.com'],
        }]}))
        self.patches = [patch.object(check, 'ROOT', self.root), patch.object(check, 'MANIFEST', self.manifest), patch.object(check.converter, 'sidebar_tutorials', return_value=[])]
        for item in self.patches:
            item.start()
        check.document.cache_clear()
        check.parsed.cache_clear()

    def tearDown(self):
        for item in reversed(self.patches):
            item.stop()
        self.temp.cleanup()

    def write(self, path, body='', slug=None):
        target = self.root / path
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text('---\ntitle: Test\ndescription: Test document\n' + (f'slug: {slug}\n' if slug else '') + '---\n\n# Test\n\n' + body)

    def validate(self, *args):
        output = io.StringIO()
        with patch.object(sys, 'argv', ['check_content.py', *args]), redirect_stdout(output), redirect_stderr(output):
            failed = check.main()
        return failed, output.getvalue()

    def git(self, *args):
        return subprocess.check_output(['git', *args], cwd=self.root, stderr=subprocess.DEVNULL, text=True).strip()

    def commit(self):
        self.git('add', '.')
        self.git('-c', 'user.name=Content Tests', '-c', 'user.email=tests@example.invalid', 'commit', '-m', 'fixture')
        return self.git('rev-parse', 'HEAD')

    def test_reference_links_and_code_fences(self):
        self.write('docs/managed/index.mdx', '[Reference][target]\n\n[target]: ./1-target.mdx#real-heading\n\n```md\n[Not a live link](missing.mdx)\n```')
        self.write('docs/managed/1-target.mdx', '## Real heading\n')
        failed, output = self.validate()
        self.assertFalse(failed, output)

    def test_missing_heading_fails(self):
        self.write('docs/managed/index.mdx', '[Bad](#does-not-exist)')
        failed, output = self.validate()
        self.assertTrue(failed)
        self.assertIn('missing heading or ID', output)

    def test_unrelated_legacy_links_are_outside_scope(self):
        self.write('docs/managed/index.mdx')
        self.write('docs/legacy/index.mdx', '[Old](missing.mdx)')
        failed, output = self.validate()
        self.assertFalse(failed, output)
        self.assertIn('Boundary:', output)

    def test_duplicate_urls_fail_even_outside_managed_scope(self):
        self.write('docs/managed/index.mdx')
        self.write('docs/legacy/a.mdx', slug='/duplicate')
        self.write('docs/legacy/b.mdx', slug='/duplicate')
        failed, output = self.validate()
        self.assertTrue(failed)
        self.assertIn('duplicate URL /docs/duplicate/', output)

    def test_deleted_target_breaks_incoming_legacy_link(self):
        self.git('init')
        self.write('docs/managed/index.mdx')
        self.write('docs/legacy/source.mdx', '[Existing](/docs/legacy/target/)')
        self.write('docs/legacy/target.mdx')
        base = self.commit()
        (self.root / 'docs/legacy/target.mdx').unlink()
        failed, output = self.validate('--base', base)
        self.assertTrue(failed)
        self.assertIn('source.mdx', output)
        self.assertIn('missing public route', output)

    def test_changed_legacy_document_is_checked(self):
        self.git('init')
        self.write('docs/managed/index.mdx')
        self.write('docs/legacy/source.mdx')
        base = self.commit()
        self.write('docs/legacy/source.mdx', '[New bad link](missing.mdx)')
        failed, output = self.validate('--base', base)
        self.assertTrue(failed)
        self.assertIn('missing source file', output)

    def test_literal_html_links_and_ids(self):
        self.write('docs/managed/index.mdx', '<div id="target"></div>\n\n<a href="#target">Works</a>\n')
        failed, output = self.validate()
        self.assertFalse(failed, output)

    def test_duplicate_front_matter_key_fails(self):
        self.write('docs/managed/index.mdx')
        path = self.root / 'docs/managed/index.mdx'
        path.write_text(path.read_text().replace('title: Test', 'title: Test\ntitle: Ambiguous'))
        failed, output = self.validate()
        self.assertTrue(failed)
        self.assertIn('duplicate front-matter key', output)

    def test_new_untracked_document_is_checked(self):
        self.git('init')
        self.write('docs/managed/index.mdx')
        base = self.commit()
        self.write('docs/new-course/new.mdx', '[New bad link](missing.mdx)')
        failed, output = self.validate('--base', base)
        self.assertTrue(failed)
        self.assertIn('new-course/new.mdx', output)


if __name__ == '__main__':
    unittest.main()
