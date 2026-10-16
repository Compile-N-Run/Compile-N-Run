# Content quality checks

These checks use a small independent tool installation, not the site's Docusaurus dependencies.
The reusable `content-quality.yml` workflow is called by the publishing workflow as a required prerequisite; it also supports an explicit manual run. It does not independently duplicate push or pull-request runs.

```sh
python3 -m venv /tmp/cnr-quality-env
/tmp/cnr-quality-env/bin/python -m pip install -r tests/content-quality/requirements.txt
npm ci --prefix tests/content-quality
PYTHONDONTWRITEBYTECODE=1 /tmp/cnr-quality-env/bin/python hugo/scripts/check_content.py --base origin/main --write-mdx-list /tmp/cnr-mdx.json
node hugo/scripts/check_mdx.mjs /tmp/cnr-mdx.json
python3 hugo/scripts/check_examples.py static
python3 hugo/scripts/check_examples.py nodejs
python3 hugo/scripts/check_examples.py github-actions
python3 hugo/scripts/check_examples.py tailwind
python3 hugo/scripts/check_examples.py scikit-learn
cd tests/content-quality
npx playwright install chromium
npm run test:browser
```

From the repository root, also run the learning, playground, account, and profile fixtures with the same pinned dependencies:

```sh
NODE_PATH="$PWD/tests/content-quality/node_modules" CNR_PLAYWRIGHT_MODULE="$PWD/tests/content-quality/node_modules/playwright" node --test --test-concurrency=1 tests/learning.spec.js tests/playground.spec.js tests/profile.spec.js tests/auth-ui.spec.js tests/learning-sync.spec.js
```

Account API and security tests use in-memory SQLite and mocked Google/Brevo endpoints; they do not send real email or need production secrets:

```sh
node --test tests/accounts-*.test.mjs tests/auth-security.test.mjs
```

The quality workflow runs these fixtures alongside static example checks. Application tests against the generated Hugo site run separately after the publishing workflow builds that site.

The Python example checker creates its own temporary virtual environment and installs the example's pinned requirements. Node projects are also copied before installation or execution. No dependencies, generated models, or test reports are written under `static/`.

## Validation boundary

- Route collisions are checked across every source document and generated tutorial category.
- All seven courses listed in `hugo/data/content-quality.json` are always checked for metadata, local links, anchors, and MDX compilation.
- Added and modified documentation is also checked against the merge base supplied with `--base`. Untouched documents are inspected for incoming references to changed or deleted targets, catching removals and slug changes.
- Unrelated legacy documents are not comprehensively audited. There is no hidden legacy-error allowlist. Expanding the managed set is a deliberate review decision.
- Markdown links, reference links, images, and literal HTML `href`/`src` references are checked. Runtime-computed JSX destinations and external URLs require review; the checker does not execute MDX imports. Anchor checks cover Markdown headings and literal IDs, not application-generated elements.
- Browser tests verify specific native controls, narrow layouts, error recovery, and the JavaScript-disabled fallback. They do not establish full WCAG conformance or substitute for screen-reader testing.
- The GitHub Actions sample is locally checked; this workflow does not activate its teaching workflow or claim its hosted jobs were tested.

## Review metadata contract

`schemaVersion: 1` identifies the manifest format. `courses` is an array keyed by unique `id`; each record supplies `title`, `sourceRoot` (repository-relative), `lastReviewed` (ISO date of an actual human/agent editorial review), `reviewStatus`, `testedVersions` (display labels mapped to reviewed version strings), and `references` (official source URLs). CI never advances review dates automatically. Version updates require running relevant checks and reviewing the corresponding tutorial text before updating metadata.

`examples` maps `id`, `sourceRoot`, `kind` (`static`, `node`, `tailwind`, or `python`), and `courseIds`. CI uses only known example IDs; workflow event text is not interpolated into shell commands or published output.
