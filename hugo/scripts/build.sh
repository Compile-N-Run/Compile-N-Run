#!/bin/bash
# Build the Hugo pilot.
#   HUGO=/path/to/hugo PAGEFIND=/path/to/pagefind hugo/scripts/build.sh          # search index inside public/
#   SPLIT_SEARCH=1 hugo/scripts/build.sh   # index in search-dist/ (for hosts with a per-deployment file limit)
set -euo pipefail
cd "$(dirname "$0")/.."
python3 scripts/convert.py
python3 scripts/interview.py
node scripts/site_config.mjs > data/site.json
rm -rf public
if [ -n "${SPLIT_SEARCH:-}" ]; then
  "${HUGO:-hugo}" --gc --minify --logLevel warn
  rm -rf search-dist && mkdir -p search-dist
  ${PAGEFIND:-npx -y pagefind@1.5.2} --site public --output-path search-dist/pagefind
  printf '/*\n  Access-Control-Allow-Origin: *\n  X-Robots-Tag: noindex, nofollow\n' > search-dist/_headers
else
  HUGO_PARAMS_PAGEFINDBUNDLE=/pagefind/ "${HUGO:-hugo}" --gc --minify --logLevel warn
  ${PAGEFIND:-npx -y pagefind@1.5.2} --site public
fi
n=$(find public -name index.html | wc -l)
echo "built $n pages"
# A template error in one partial can leave public/ almost empty; never let that reach a deploy.
if [ "$n" -lt 11000 ]; then echo "error: expected over 11000 pages" >&2; exit 1; fi
