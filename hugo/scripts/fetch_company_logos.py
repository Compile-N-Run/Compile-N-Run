#!/usr/bin/env python3
"""Download company logos for the Interview pages into static/img/companies/<slug>.png (64x64).

Domains come from interview/data/company-domains.json (null = no logo; the page shows an initial instead).
Logos are fetched once and committed, so page views never call a third-party logo service.

  python3 hugo/scripts/fetch_company_logos.py            # fetch missing logos
  python3 hugo/scripts/fetch_company_logos.py --refresh  # re-download all
"""
import argparse
import concurrent.futures
import io
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DOMAINS = os.path.join(ROOT, 'interview', 'data', 'company-domains.json')
OUT = os.path.join(ROOT, 'static', 'img', 'companies')
MANIFEST = os.path.join(ROOT, 'interview', 'data', 'company-logos.json')
SIZE = 64
# Google's favicon service returns the site's best icon, or 404 when it has none (with fallback_opts).
SERVICE = 'https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&size=128&url='


def download(url):
    request = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (compatible; CompileNRun-logo-fetch/1.0)'})
    with urllib.request.urlopen(request, timeout=20) as response:
        return response.read(2_000_000)


def candidates(domain):
    """Best sources first: Google's favicon service, the site's own touch icon, then DuckDuckGo's icon cache."""
    hosts = [domain] if domain.startswith('www.') else [domain, 'www.' + domain]
    for host in hosts:
        yield SERVICE + urllib.parse.quote('https://' + host, safe='')
    for host in hosts:
        yield f'https://{host}/apple-touch-icon.png'
    yield f'https://icons.duckduckgo.com/ip3/{domain}.ico'


def fetch(slug, domain):
    best, reasons = None, []
    for url in candidates(domain):
        try:
            image = Image.open(io.BytesIO(download(url)))
            if getattr(image, 'n_frames', 1) > 1 or image.format == 'ICO':  # pick the largest icon in .ico files
                sizes = getattr(image, 'ico', None) and image.ico.sizes()
                if sizes:
                    image.size = max(sizes)
            image.load()
        except urllib.error.HTTPError as e:
            reasons.append(f'HTTP {e.code}')
            continue
        except Exception as e:  # noqa: BLE001 - network errors and undecodable responses both mean "try the next source"
            reasons.append(type(e).__name__)
            continue
        if best is None or min(image.size) > min(best.size):
            best = image
        if min(image.size) >= 64:
            break
    if best is None or min(best.size) < 30:
        return slug, 'too small' if best else ', '.join(reasons)
    image = best.convert('RGBA')
    image.thumbnail((SIZE, SIZE), Image.LANCZOS)
    canvas = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
    canvas.paste(image, ((SIZE - image.width) // 2, (SIZE - image.height) // 2))
    canvas.save(os.path.join(OUT, slug + '.png'), optimize=True)
    return slug, None


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--refresh', action='store_true')
    args = parser.parse_args()
    domains = json.load(open(DOMAINS, encoding='utf-8'))
    os.makedirs(OUT, exist_ok=True)
    todo = {slug: d for slug, d in domains.items()
            if d and (args.refresh or not os.path.isfile(os.path.join(OUT, slug + '.png')))}
    failures = {}
    with concurrent.futures.ThreadPoolExecutor(12) as pool:
        for slug, error in pool.map(lambda item: fetch(*item), todo.items()):
            if error:
                failures[slug] = error
    # Remove logos for companies that no longer have a domain.
    for name in os.listdir(OUT):
        if name.endswith('.png') and not domains.get(name[:-4]):
            os.remove(os.path.join(OUT, name))
    have = sorted(name[:-4] for name in os.listdir(OUT) if name.endswith('.png'))
    with open(MANIFEST, 'w', encoding='utf-8') as f:
        json.dump(have, f, separators=(',', ':'))
        f.write('\n')
    for slug, error in sorted(failures.items()):
        print(f'no logo for {slug} ({domains[slug]}): {error}')
    print(f'{len(have)} logos, {len(failures)} failed, {sum(1 for d in domains.values() if not d)} without a domain')
    return 0


if __name__ == '__main__':
    sys.exit(main())
