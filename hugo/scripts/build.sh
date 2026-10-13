#!/bin/bash
# Build the Hugo pilot.
#   HUGO=/path/to/hugo PAGEFIND=/path/to/pagefind hugo/scripts/build.sh          # search index inside public/
#   SPLIT_SEARCH=1 hugo/scripts/build.sh   # index in search-dist/ (for hosts with a per-deployment file limit)
set -euo pipefail
cd "$(dirname "$0")/.."
python3 scripts/convert.py
node scripts/site_config.mjs > data/site.json
rm -rf public
if [ -n "${SPLIT_SEARCH:-}" ]; then
  "${HUGO:-hugo}" --quiet --gc --minify
  rm -rf search-dist && mkdir -p search-dist
  ${PAGEFIND:-npx -y pagefind@1.3.0} --site public --output-path search-dist/pagefind
  printf '/*\n  Access-Control-Allow-Origin: *\n  X-Robots-Tag: noindex, nofollow\n' > search-dist/_headers
else
  HUGO_PARAMS_PAGEFINDBUNDLE=/pagefind/ "${HUGO:-hugo}" --quiet --gc --minify
  ${PAGEFIND:-npx -y pagefind@1.3.0} --site public
fi
echo "built $(find public -name index.html | wc -l) pages"
