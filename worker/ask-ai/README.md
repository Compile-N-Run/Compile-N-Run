# Ask AI Worker

Backs the "Ask AI" chat on www.compilenrun.com (widget code: `hugo/assets/js/main.js`, styles: `hugo/assets/css/extra.css`).

`POST https://www.compilenrun.com/api/ask` with `{path, question, history}`. The Worker fetches the tutorial at
`path`, extracts its text, and streams an answer from Workers AI (`@cf/google/gemma-4-26b-a4b-it`, thinking off).

Limits, so the free 10,000 Neurons/day are not exceeded (~50 Neurons per answer):
- 5 questions per minute per IP (`ASK_LIMIT` rate-limit binding)
- `DAILY_LIMIT` answers per UTC day site-wide (counter in the `ASK_KV` namespace)
- Requests only from https://www.compilenrun.com (and localhost for testing)

Deploy: `cd worker/ask-ai && npx wrangler deploy` (needs `wrangler login` with Workers + Workers AI access).
Logs: `npx wrangler tail compilenrun-ask-ai`.

Test the widget locally against production:
`HUGO_PARAMS_ASKAI_ENDPOINT=https://www.compilenrun.com/api/ask hugo server`
