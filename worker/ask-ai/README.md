# Ask AI Worker

Backs the "Ask AI" chat on www.compilenrun.com (widget code: `hugo/assets/js/main.js`, styles: `hugo/assets/css/extra.css`).

`POST https://www.compilenrun.com/api/ask` with `{path, question, history}`. The Worker fetches the tutorial at
`path`, extracts its text, and streams an answer from Workers AI (`@cf/ibm-granite/granite-4.0-h-micro`).

Limits, so the free 10,000 Neurons/day are not exceeded (~8–12 Neurons per answer):
- 5 questions per minute per IP (`ASK_LIMIT` rate-limit binding)
- `DAILY_LIMIT` answers per UTC day site-wide (counter in the `ASK_KV` namespace)
- A Cloudflare Turnstile token with every question (site key in `hugo/hugo.toml`, secret in the `TURNSTILE_SECRET` Worker secret)
- Requests only from https://www.compilenrun.com (and localhost for testing)

Deploy: `cd worker/ask-ai && npx wrangler deploy` (needs `wrangler login` with Workers + Workers AI access).
Logs: `npx wrangler tail compilenrun-ask-ai`.

Test the widget locally against production:
`HUGO_PARAMS_ASKAI_ENDPOINT=https://www.compilenrun.com/api/ask hugo server`
