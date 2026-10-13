// Dump the parts of docusaurus.config.js the Hugo templates reuse (navbar, footer, announcement bar).
// Usage: node hugo/scripts/site_config.mjs > hugo/data/site.json
const cfg = (await import(new URL('../../docusaurus.config.js', import.meta.url))).default;
const t = cfg.themeConfig;
const docs = cfg.presets?.[0]?.[1]?.docs ?? {};
const offers = (await import(new URL('../../src/components/ReferralDock/offers.js', import.meta.url))).default;
process.stdout.write(JSON.stringify({
  title: cfg.title, tagline: cfg.tagline, navbar: t.navbar, footer: t.footer,
  announcementBar: t.announcementBar, editUrl: docs.editUrl, offers,
}, null, 1));
