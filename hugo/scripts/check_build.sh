#!/bin/bash
# Sanity checks on hugo/public before it is deployed. Fails loudly instead of publishing a broken or unindexable site.
set -euo pipefail
cd "$(dirname "$0")/../public"
fail() { echo "check failed: $*" >&2; exit 1; }

pages=$(find . -name index.html | wc -l)
[ "$pages" -ge 11000 ] || fail "only $pages pages"

urls=$(grep -o '<loc>' sitemap.xml | wc -l)
[ "$urls" -ge 11000 ] || fail "sitemap has only $urls URLs"
grep -q '<loc>https://www.compilenrun.com/docs/' sitemap.xml || fail "sitemap URLs are not on https://www.compilenrun.com"
lastmods=$(grep -o '<lastmod>' sitemap.xml | wc -l)
[ "$lastmods" -ge 11000 ] || fail "only $lastmods sitemap entries have lastmod (shallow git checkout?)"

# Search and account settings intentionally stay out of search engines (404.html is not an index.html).
noindex=$(grep -l 'name=robots content="noindex' -r . --include=index.html | grep -Ev '^./(search|profile)/index.html$' || true)
[ -z "$noindex" ] || fail "noindex on: $(echo "$noindex" | head -5)"
awk 'tolower($1)=="user-agent:"{ua=$2} tolower($1)=="disallow:" && $2=="/" && ua=="*"{bad=1} END{exit bad}' robots.txt \
  || fail "robots.txt disallows everything"

grep -q 'rel=canonical href=https://www.compilenrun.com/docs/language/python/' docs/language/python/index.html || fail "canonical URL missing on the Python intro page"
grep -q 'googletagmanager.com/gtag' docs/language/python/index.html || fail "analytics missing (not a production build?)"
[ -f pagefind/pagefind.js ] || fail "search index missing"
for f in blog/rss.xml blog/atom.xml 404.html opensearch.xml; do [ -f "$f" ] || fail "$f missing"; done

echo "checks passed: $pages pages, $urls sitemap URLs"
