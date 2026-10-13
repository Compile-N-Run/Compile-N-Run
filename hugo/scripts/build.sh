#!/bin/bash
# Build the Hugo pilot: convert docs, build the site, then the Pagefind index into a separate folder.
# Usage: HUGO=/path/to/hugo PAGEFIND=/path/to/pagefind hugo/scripts/build.sh
set -euo pipefail
cd "$(dirname "$0")/.."
python3 scripts/convert.py
"${HUGO:-hugo}" --quiet --gc --minify
rm -rf search-dist && mkdir -p search-dist
"${PAGEFIND:-npx -y pagefind@1.3.0}" --site public --output-path search-dist/pagefind
printf '/*\n  Access-Control-Allow-Origin: *\n  X-Robots-Tag: noindex, nofollow\n' > search-dist/_headers
echo "site: $(find public -type f | wc -l) files, search: $(find search-dist -type f | wc -l) files"
