# Ask AI Worker

Backs the "Ask AI" chat and the "Was this page helpful?" votes on www.compilenrun.com (widget code: `hugo/assets/js/main.js`, styles: `hugo/assets/css/extra.css`).

`POST https://www.compilenrun.com/api/ask` with `{path, question, history}`. The Worker fetches the tutorial at
`path`, extracts its text, and streams an answer from Workers AI (`@cf/ibm-granite/granite-4.0-h-micro`).

Limits, so the free 10,000 Neurons/day are not exceeded (~8–12 Neurons per answer):
- 5 questions per minute per IP (`ASK_LIMIT` rate-limit binding)
- `DAILY_LIMIT` answers per UTC day site-wide (counter in the `ASK_KV` namespace)
- A Cloudflare Turnstile token with every question (site key in `hugo/hugo.toml`, secret in the `TURNSTILE_SECRET` Worker secret)
- Requests only from https://www.compilenrun.com (and localhost for testing)

## Quiz me

`POST https://www.compilenrun.com/api/quiz` with `{path, round, turnstile}` returns a multiple-choice quiz for the page:
`{title, round, questions: [{question, code, options[4], answer, explanation}]}`. The page checks the answers itself.

- Written by `@cf/google/gemma-4-26b-a4b-it`, which reasons through each question before giving the answer letter.
  A second call answers the quiz without the key, and questions where the two disagree are dropped (smaller models
  such as Granite micro and Llama 3.1 8B marked wrong answers as correct in tests). About 90 Neurons per new quiz.
- Cached in `ASK_KV` for 30 days per page and round (3 rounds, for "Try another quiz"), so most requests cost nothing.
- `QUIZ_DAILY_LIMIT` new quizzes per UTC day; Turnstile and the `ASK_LIMIT` rate limit apply as for questions.
- To regenerate a page's quizzes, delete its keys: `npx wrangler@4 kv key list --namespace-id f5aeb7b0e57d46bf9e5f80d816231cb5 --prefix "quiz:v1:" --remote`.

## Page feedback

`POST https://www.compilenrun.com/api/feedback` with `{path, vote: 1 | -1, comment?}` stores one vote per page and
reader in the D1 database `compilenrun-feedback` (table in `schema.sql`). Readers are told apart by a salted hash of
their IP (`IP_SALT` Worker secret); the IP itself is not stored. 20 votes per minute per IP (`FEEDBACK_LIMIT`).

Pages readers found least helpful, and their comments:

```sh
npx wrangler@4 d1 execute compilenrun-feedback --remote --command \
  "SELECT path, SUM(vote = 1) AS up, SUM(vote = -1) AS down FROM votes GROUP BY path ORDER BY down DESC, up LIMIT 30"
npx wrangler@4 d1 execute compilenrun-feedback --remote --command \
  "SELECT updated_at, path, comment FROM votes WHERE comment IS NOT NULL ORDER BY updated_at DESC LIMIT 50"
```

## Deploy

`cd worker/ask-ai && npx wrangler@4 deploy` (needs `wrangler login` with Workers, Workers AI and D1 access).
Use wrangler 4: the repo's own wrangler 3 drops the `ratelimits` bindings, and the Worker then fails on every request.
Logs: `npx wrangler@4 tail compilenrun-ask-ai`.

Test the widget locally against production:
`HUGO_PARAMS_ASKAI_ENDPOINT=https://www.compilenrun.com/api/ask hugo server`
