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

`POST https://www.compilenrun.com/api/quiz` with `{path, round, turnstile, stream: true}`. A cached quiz comes back as JSON:
`{title, round, questions: [{question, code, options[4], answer, explanation}]}`. A new one is streamed as NDJSON, one
`{question}` line per question as soon as it is written and checked, then `{done, count}` (or `{error}`), so the reader
sees question 1 after ~3 s. Without `stream`, the answer is one JSON object as for a cached quiz. The page checks the
answers itself.

- Written by `@cf/qwen/qwen3-30b-a3b-fp8` (JSON mode; its output arrives in `message.reasoning`, which `aiText` reads),
  reasoning through each question before the answer letter. Each question is then solved again without the key, in
  parallel, and dropped if the two disagree (Granite micro and Llama 3.1 8B marked wrong answers as correct in tests;
  Gemma 4 26B was as accurate but took ~45 s per quiz). About 50 Neurons per new quiz, ~7 s in total.
- In streamed responses, read `choices[0].delta.content`, not `response`: Workers AI JSON-parses the latter, so a
  token like `" true"` arrives as `true` and loses its space.
- Cached in `ASK_KV` for 30 days per page and round (3 rounds, for "Try another quiz"), so most requests cost nothing.
- `QUIZ_DAILY_LIMIT` new quizzes per UTC day; Turnstile and the `ASK_LIMIT` rate limit apply as for questions.
- To regenerate a page's quizzes, delete its keys: `npx wrangler@4 kv key list --namespace-id f5aeb7b0e57d46bf9e5f80d816231cb5 --prefix "quiz:v1:" --remote`.

## Page feedback

`POST https://www.compilenrun.com/api/feedback` with `{path, vote: 1 | -1, comment?}` stores one vote per page and
reader in the D1 database `compilenrun-data` (table in `schema.sql`). Readers are told apart by a salted hash of
their IP (`IP_SALT` Worker secret); the IP itself is not stored. 20 votes per minute per IP (`FEEDBACK_LIMIT`).

Pages readers found least helpful, and their comments:

```sh
npx wrangler@4 d1 execute compilenrun-data --remote --command \
  "SELECT path, SUM(vote = 1) AS up, SUM(vote = -1) AS down FROM votes GROUP BY path ORDER BY down DESC, up LIMIT 30"
npx wrangler@4 d1 execute compilenrun-data --remote --command \
  "SELECT updated_at, path, comment FROM votes WHERE comment IS NOT NULL ORDER BY updated_at DESC LIMIT 50"
```

## Deploy

`cd worker/compilenrun-worker && npx wrangler@4 deploy` (needs `wrangler login` with Workers, Workers AI and D1 access).
Use wrangler 4: the repo's own wrangler 3 drops the `ratelimits` bindings, and the Worker then fails on every request.
Logs: `npx wrangler@4 tail compilenrun-worker`.

For the learning-record update, apply `accounts-learning-records-schema.sql` before deploying this Worker (see below).

Test the widget locally against production:
`HUGO_PARAMS_ASKAI_ENDPOINT=https://www.compilenrun.com/api/ask hugo server`

## Two deployments

The same code runs as two independent Workers, each with its own D1 database, KV namespace, OAuth apps and
secrets. Everything site-specific comes from `env`: `SITE_ORIGIN` (origin checks, CORS, OAuth redirect URIs,
redirects after login, email links, the page fetch for Ask AI), `SITE_NAME` (email subjects and sender name, the
Ask AI prompt, the title suffix stripped from pages) and `SITE_LANG` (`zh*` gives Chinese emails, Ask AI answers in
Simplified Chinese and Chinese quizzes). Unset, they fall back to the compilenrun values.

| | compilenrun-worker | echocool-worker |
| --- | --- | --- |
| Config | `wrangler.jsonc` | `wrangler.echocool.jsonc` |
| Site | https://www.compilenrun.com, `en`, "Compile N Run" | https://www.echo.cool, `zh-CN`, "代码酷" |
| D1 (`DB`) | `compilenrun-data` | `echocool-data` |
| KV (`ASK_KV`) | `f5aeb7b0e57d46bf9e5f80d816231cb5` | its own namespace |
| Rate-limit namespace ids | 1001-1003 | 2001-2003 |
| Google client id | `718000240736-hnrumls0f481uteljtu6779dpdnv9qrp.apps.googleusercontent.com` | `1072237482521-hqchdphppq230u5agnavq59kvhjnr4iu.apps.googleusercontent.com` |
| GitHub client id | `Ov23liduwQHgsDYpjinC` | `Ov23lio0cF8OkEi6J4gI` |
| OAuth callbacks | `/auth/google_oauth2/callback`, `/auth/github_oauth2/callback` on the site host | the same paths on www.echo.cool |
| WeChat 公众号 login | off (no `WECHAT_TOKEN`); `providers.wechat` is false | on once the `WECHAT_TOKEN` secret is set; see "WeChat Official Account login" |
| Email accounts | on | off (no `BREVO_API_KEY`); session discovery reports `email: false`, email routes return `503 email_not_configured` |

Deploy (from this folder, wrangler 4):

```sh
npx wrangler@4 deploy                                    # compilenrun-worker
npx wrangler@4 deploy --config wrangler.echocool.jsonc   # echocool-worker
```

A fresh database (replace `echocool-data` with the database name) needs these files in order; `accounts-github-schema.sql`
contains a non-repeatable `ALTER TABLE`, so apply it once:

```sh
npx wrangler@4 d1 execute echocool-data --remote --file schema.sql   # feedback votes
npx wrangler@4 d1 execute echocool-data --remote --file accounts-schema.sql
npx wrangler@4 d1 execute echocool-data --remote --file accounts-email-schema.sql
npx wrangler@4 d1 execute echocool-data --remote --file accounts-google-profile-schema.sql
npx wrangler@4 d1 execute echocool-data --remote --file accounts-github-schema.sql
npx wrangler@4 d1 execute echocool-data --remote --file accounts-learning-records-schema.sql
npx wrangler@4 d1 execute echocool-data --remote --file accounts-wechat-schema.sql
```

Secrets, set per Worker with `npx wrangler@4 secret put NAME` (add `--config wrangler.echocool.jsonc` for echo.cool):
`GOOGLE_CLIENT_SECRET`, `GITHUB_CLIENT_SECRET`, `PASSWORD_PEPPER`, `IP_SALT`, `TURNSTILE_SECRET` (the Turnstile widget
must allow the site's hostname). Only when email accounts are on: the `BREVO_API_KEY` secret plus the vars
`EMAIL_PASSWORD_ENABLED: "true"`, `BREVO_SENDER_EMAIL`, `BREVO_SENDER_NAME` (defaults to `SITE_NAME`) and
`ACCOUNT_EMAIL_DAILY_LIMIT`. Each OAuth app must list its own site's callback URL (and, for Google, the site origin
under "Authorized JavaScript origins").

## Source modules

`src/index.js` dispatches requests to `ai/ask.js`, `ai/quiz.js`, `feedback.js`, and `auth/routes.js`.
`auth/core.js` owns OAuth/session helpers; authenticated learning requests are delegated to `learning/routes.js`.
`learning/records.js` handles record conversion and accounting; `learning/snapshot.js` validates backup envelopes.
Email authentication, password hashing, and mail delivery retain their existing dedicated modules. `accounts.js`
re-exports the existing public imports for compatibility. Shared body, HTTP, and Turnstile helpers live in `lib/`.

Wrangler bundles these modules for upload, so Cloudflare's code editor can still show one generated script.
Inspect it without deploying with `npx wrangler@4 deploy --dry-run --outdir /tmp/cnr-worker-bundle`.

## Accounts and synchronized learning

Accounts are an independent optional feature. Ask AI, quizzes, Turnstile, and feedback keep their existing contracts. Google sign-in requests only `openid profile`; the Worker obtains identity from Google's authenticated UserInfo endpoint after a server-side authorization-code exchange. It identifies Google identities by the stable `sub`, never by email. Google-provided email addresses are not imported. An email address is stored only when a person explicitly registers or adds an email/password method. Google access/ID/refresh tokens are not stored, logged, or sent to the browser.

The flow uses a random state nonce bound to a separate HttpOnly cookie, S256 PKCE, and an expiring, atomically consumed D1 challenge. Sessions use random opaque `__Host-cnr_session` cookies with `Secure; HttpOnly; SameSite=Lax; Path=/`. Only session-token hashes are stored in D1. Sessions expire after 30 days; logout revokes the current session. Expired session/challenge rows are removed during later sign-in attempts.

### Setup

1. In Google Cloud, create an OAuth client of type **Web application**, configure its consent screen, and authorize this exact redirect URI:
   `https://www.compilenrun.com/auth/google_oauth2/callback`
2. `GOOGLE_CLIENT_ID` is a public identifier in `wrangler.jsonc`. Store the secret interactively, never in a source file or a shell argument:

   ```sh
   cd worker/compilenrun-worker
   npx wrangler@4 secret put GOOGLE_CLIENT_SECRET
   ```

3. Apply the additive migrations to the existing D1 database in order:

   ```sh
   npx wrangler@4 d1 execute compilenrun-data --remote --file accounts-schema.sql
   npx wrangler@4 d1 execute compilenrun-data --remote --file accounts-email-schema.sql
   npx wrangler@4 d1 execute compilenrun-data --remote --file accounts-google-profile-schema.sql
   npx wrangler@4 d1 execute compilenrun-data --remote --file accounts-github-schema.sql
   npx wrangler@4 d1 execute compilenrun-data --remote --file accounts-learning-records-schema.sql
   npx wrangler@4 d1 execute compilenrun-data --remote --file accounts-wechat-schema.sql
   ```

4. Deploy with Wrangler 4 after validating the migration, secret, and Worker changes. The configuration adds only the auth, learning, and Google callback routes (patterns end in `*`: Cloudflare skips the Worker for a wildcard-less pattern once a query string is present) plus the `AUTH_LIMIT` binding (60 account requests per minute per IP). It preserves existing AI/quiz/feedback routes and bindings.

Google and email/password availability are evaluated independently. Session discovery includes `providers: {google, github, wechat, email}`, `googleConfigured`, and `emailConfigured`; `configured` is true if either method is available. Missing Google credentials disable Google without disabling a configured email method. Missing all provider prerequisites disables account operations. Missing database tables return a safe service-unavailable response. Use `node --test tests/accounts-worker.test.mjs tests/auth-security.test.mjs` from the repository root for local validation with real SQLite and mocked Google/Brevo endpoints. These tests do not authenticate a real person or prove the deployed OAuth consent or mail-delivery configuration works. Account endpoints intentionally accept only the production site origin; they do not inherit the AI widget's localhost CORS exception.

### Browser/API contract

Every account response uses `Cache-Control: no-store, private`; redirects also use `Referrer-Policy: no-referrer`. No cross-origin account API access is enabled.

| Request | Result |
| --- | --- |
| `GET /api/auth/session` | `{configured, providers: {google,email}, googleConfigured, emailConfigured, user, csrfToken?}`. Signed-in user fields are `id`, `name`, `email`, `emailVerified`, `hasPassword`, and `googleLinked`; `id` is an opaque internal UUID and `name` is at most 100 characters. |
| `GET /api/auth/google` | Redirects to Google; successful callback redirects to `/learn/`, failures to `/learn/?auth=error`. |
| `GET /api/learning` | `{revision, data, updatedAt, syncProtocol: 2, incremental}`; an empty account starts with revision `0`, `data: null`, `updatedAt: null`. With `X-CNR-Revision` matching the current revision, returns `{revision, updatedAt, unchanged: true, syncProtocol: 2, incremental}` without reading the record collection. |
| `PUT /api/learning` | Compatible full-backup body `{revision, data}`; converts legacy storage on the first save. Later full saves compare records and write only changes. |
| `PATCH /api/learning` | After `incremental: true`, body `{revision, exportedAt, changes: [{kind, key, value}]}`; kinds are `read`, `course`, `lesson`, and `draft`. `value: null` deletes a record. Success `{revision, updatedAt, syncProtocol: 2, incremental: true}`. Identical saves keep the revision unchanged. |
| `POST /api/auth/logout` | `{ok: true}` and expires the session cookie. |
| `DELETE /api/auth/account` | `{ok: true}`; permanently deletes this account, its snapshot, and every associated session, then expires cookies. Local browser notes and unrelated feedback are untouched. |

All learning requests and logout/deletion require `X-CNR-User` equal to the user ID returned by session discovery. Mutations additionally require `Origin: https://www.compilenrun.com` and `X-CSRF-Token` from the current session response. This prevents a stale tab from reading or writing a different account after an account switch. Authentication and snapshot reads use the D1 primary; SQL mutations recheck the live session so concurrent revocation cannot recreate deleted data.

Imports, exports, and full API responses use the existing `cnr-learning-backup` version-1 JSON envelope. The server checks the envelope, bounded depth/entry counts, unsafe keys, and a **1,800,000-byte UTF-8 limit** (below D1's 2 MB row limit). Normalized storage also caps the sum of UTF-8 encoded `[kind,key,value]` records at 1,800,000 bytes; record overhead can make this slightly stricter than the old snapshot limit. The body is read incrementally with a byte limit; a missing or false Content-Length does not bypass it. Browser import validation still checks individual lesson and draft records before a user explicitly merges them.

Writes use an atomic compare-and-swap revision. `409 {error: "revision_conflict", revision}` means another device saved first; clients must retrieve that newer state, merge it against their last acknowledged state, and retry using the current revision. A stale whole-state overwrite is never accepted. `409 {error: "account_changed"}` means the expected identity no longer matches the session. Other errors include `401 authentication_required`, `403 csrf_failed`/`origin_not_allowed`, `400 invalid_snapshot`, `413 snapshot_too_large`, `415 json_required`, `429 rate_limited`, and `503 accounts_not_configured`/`accounts_unavailable`.

The website automatically synchronizes the signed-in learner’s state through these revision-checked endpoints; each browser keeps separate guest and account caches. Account deletion removes application data, not the user's Google account or local browser backup. To revoke the Google app authorization itself, the user can remove it in their Google account's third-party connections settings. Signing in again after application-account deletion creates a new internal account without restoring the deleted snapshot.

### Learning records and free-plan operation

For an existing deployment that already has the account migrations, run only this new migration from the Worker directory:

```sh
npx wrangler@4 d1 execute compilenrun-data --remote --file accounts-learning-records-schema.sql
```

This repeatable migration creates two tables and does not scan or backfill existing snapshots:

- `cnr_learning_state`: one revision/accounting row per converted account.
- `cnr_learning_records`: one row per read mark, course, lesson, or playground draft, keyed by `(user_id, kind, record_key)`. Nested notes and exercise results remain together in their lesson row to avoid writes for every field. `WITHOUT ROWID` primary keys avoid duplicate key indexes; no secondary indexes are added.

Roll out the additive schema first, publish the updated Hugo frontend, then deploy the updated Worker. The frontend understands the old Worker while deployment is in progress; existing open tabs can continue using full PUTs against the new Worker. Publishing the frontend is necessary to enable its reduced polling and PATCH requests.

Until the first successful full save, reads use the old `cnr_account_learning.data_json`. That save atomically inserts the records and new state and clears the legacy JSON. Later saves update the new tables only. Account deletion cascades to both tables. Keep the new schema and record-aware Worker together: an old snapshot-only Worker cannot read converted accounts. For rollback, restore a record-aware Worker version; returning to a snapshot-only version requires reconstructing snapshots from records first.

The browser negotiates the protocol, so it also works while an older Worker is deployed. After conversion, a normal edit sends one PATCH without a preliminary GET. A CAS conflict triggers a fresh read and the existing three-way merge, including preserved conflicting note/draft versions. A unique write nonce gates every SQL statement inside one transactional D1 batch, so a losing writer cannot change records. Session revocation is rechecked inside the batch.

For quota control:

- Saves wait for 10 seconds of inactivity and are spaced at least 30 seconds apart. Local edits remain durable immediately; explicit flushing before account changes bypasses the normal debounce.
- Fresh device caches suppress repeated reads on focus and page navigation. Visible tabs check for remote changes about every five minutes; unchanged revision checks read no learning records. Web Locks serialize tabs sharing the same device cache.
- A changed record plus its revision costs two SQLite row mutations; unchanged saves cost zero. Multiple changed records are sent in one request and one batch, but D1 still counts every changed row. Row storage alone does not reduce writes relative to the old single-row snapshot: batching and avoiding unchanged writes provide the savings.
- PATCH reads use the composite primary key to fetch only affected records. Full downloads and legacy full PUTs necessarily read the user's complete collection. Authentication checks still query the primary database so revocation remains immediate.
- D1 assembles the JSON for full downloads and the Worker forwards it directly, avoiding a full parse/rebuild/serialization pass in the Worker. Conditional reads skip that aggregation entirely.
- There are no new cron jobs, queues, KV counters, Workers, paid bindings, or background database migrations. The first conversion writes one row per existing record once; it happens on demand instead of for every account at deployment.

Cloudflare's [D1 pricing](https://developers.cloudflare.com/d1/platform/pricing/) lists the free daily allowance as 5 million rows read and 100,000 rows written; [Workers limits](https://developers.cloudflare.com/workers/platform/limits/) list 100,000 requests/day and 10 ms CPU/request. Actual D1 row metrics also include query scans and index work; inspect D1 Metrics rather than treating request/batch counts as usage. Existing AI and email budgets remain configured separately.

References: [Google OpenID Connect](https://developers.google.com/identity/openid-connect/openid-connect), [Google discovery endpoints and PKCE methods](https://accounts.google.com/.well-known/openid-configuration), [D1 primary/session behavior](https://developers.cloudflare.com/d1/worker-api/d1-database/), and [D1 limits](https://developers.cloudflare.com/d1/platform/limits/).

## Email/password, verification, recovery, and profile settings

The v4 `accounts-github-schema.sql` migration adds GitHub sign-in: `cnr_account_github_identities` (GitHub user id → account) and `cnr_account_github_profiles` (login, primary verified email, name), plus a `provider` column on the OAuth challenge table so a state can only be redeemed at the provider that issued it. GitHub uses the same PKCE/state/binding-cookie flow as Google (`GET /api/auth/github`, callback `/auth/github_oauth2/callback`, `POST/DELETE /api/auth/github/link`), needs the `GITHUB_CLIENT_ID` var and `GITHUB_CLIENT_SECRET` secret, and requests the `read:user user:email` scopes. Unlinking any provider is allowed while another usable sign-in method remains (a verified password with email configured, or another linked provider). Apply this migration once: its `ALTER TABLE` is not repeatable.

The v3 `accounts-google-profile-schema.sql` migration adds `cnr_account_google_profiles` (Google email, `email_verified`, and name, keyed by `google_sub`). Sign-in requests the `openid email profile` scopes and refreshes the row at every Google sign-in or link; the row is deleted on unlink and cascades away on account deletion. The Google email is informational only and is never used to authenticate or to match password accounts. Existing Google users get a row at their next Google sign-in.

The v2 `accounts-email-schema.sql` migration is additive and repeatable. It preserves existing user IDs, sessions, snapshots, and votes. Google identities move into `cnr_account_google_identities`; the original users table's NOT NULL `google_sub` column remains a deprecated compatibility field, with reserved `local:<UUID>` values for new users. Authentication never interprets those reserved values as Google subjects. A per-user migration marker allows one-time catch-up of a legacy Google row created by the old Worker during migration/deployment, while deliberately unlinked identities remain unlinked when the migration is reapplied.

### Durable secrets and verified sender

Store `BREVO_API_KEY` and `PASSWORD_PEPPER` as Worker secrets using `wrangler@4 secret put`. Never commit either value or pass it as a shell command argument. The pepper must be a cryptographically random secret of at least 32 characters, generated once and retained securely. **Do not regenerate it during normal deployment.** Losing or changing it invalidates existing password verification; recovery requires a planned password-reset migration. Salts are independent and stored with each hash; the pepper is not stored in D1.

`wrangler.jsonc` enables `nodejs_compat`, sets `EMAIL_PASSWORD_ENABLED=true`, and selects the verified Brevo sender `no-reply@compilenrun.com` / `Compile-N-Run`. Email availability also requires the Brevo key, password pepper, D1, and rate-limit binding. Setting `EMAIL_PASSWORD_ENABLED=false` disables email authentication without disabling configured Google sign-in; Google unlink is then refused if it would remove the only usable sign-in method.

Passwords use native `node:crypto` scrypt with `N=16384`, `r=8`, `p=5`, a random 128-bit salt and 256-bit result. This is OWASP's equivalent 16 MiB scrypt profile. HMAC-SHA256 with the separate pepper preprocesses the password, and the stored encoding records algorithm/version/parameters. At most two KDF operations run concurrently in an isolate; excess requests receive a retryable service-busy response rather than sharing cross-request promise queues. Native scrypt was separately checked in an actual Cloudflare runtime before enabling it; an ordinary Node test alone is not proof of Workers CPU/runtime compatibility.

Passwords must contain 15–128 Unicode code points and at most 1024 UTF-8 bytes. Spaces and Unicode are supported, without trimming or composition rules. Email identity comparison trims and lowercases the address; it does not collapse Gmail dots or plus aliases. The supported address syntax is a conventional ASCII mailbox and domain; the API reports invalid syntax without exposing account existence.

### Additional API

All these requests require the exact site Origin and JSON where a body is present. Authenticated settings also require the current `X-CNR-User` and `X-CSRF-Token` headers.

| Request | Body / behavior |
| --- | --- |
| `POST /api/auth/register` | `{name,email,password}` → generic `202 {ok,message}`; creates an unverified method and sends verification when eligible. Duplicate addresses get the same public response. |
| `POST /api/auth/login` | `{email,password}` → `200 {ok:true}` and a rotated session cookie; nonexistent, incorrect, and unverified methods all return `401 invalid_credentials`. Refresh session discovery afterward. |
| `POST /api/auth/resend-verification` | `{email}` → generic 202. Works while signed in too. |
| `POST /api/auth/verify-email` | `{token,password}` → explicit confirmation using the chosen registration/enrollment password; 200 on success, 400 `invalid_token_or_password` otherwise. |
| `POST /api/auth/forgot-password` | `{email}` → generic 202. Never activates another person's unverified pending email on a Google-owned account. |
| `POST /api/auth/reset-password` | `{token,password}` → 200; changes the password and revokes all sessions. Sign in again. An unverified email-only registration can recover through mailbox proof, but a Google-linked pending method must use its original verification flow. |
| `PATCH /api/auth/profile` | `{name}`; updates the signed-in user's display name. Later Google sign-ins preserve that chosen name. |
| `POST /api/auth/email` | Authenticated `{email,password}`; adds or replaces an unverified pending method, invalidating old tokens. It does not replace an already verified email. |
| `DELETE /api/auth/email` | Authenticated cancellation of a pending unverified method; a linked Google method must remain. |
| `POST /api/auth/password` | Authenticated `{currentPassword,newPassword}`; verifies the current password and revokes all sessions after the change. |
| `POST /api/auth/google/link` | Authenticated explicit linking; returns `{url}` for Google's authorization endpoint. The OAuth purpose binds to the initiating user/session and is rechecked at callback and mutation time. |
| `DELETE /api/auth/google/link` | Requires a verified, enabled email/password method. Removes Google, cancels pending link challenges, revokes sessions, and expires the cookie; sign in with email/password afterward. |

Google linking never merges accounts by matching email. A Google identity already attached to a different account cannot be moved by this operation. Google email claims do not count as verification of a local password address. Revocation/unlink races are guarded in the same SQL statements that create sessions or link identities.

Verification/reset messages use fixed HTTPS `/profile/#verify=TOKEN` and `/profile/#reset=TOKEN` links, so tokens are not sent in HTTP URL queries. Tokens have 256 bits of randomness; only hashes are stored, bound to purpose, credential version, and expiry. Verification is valid for up to 24 hours and reset for 30 minutes. Opening a link does not consume it. Explicit successful POST consumption and credential changes occur in one D1 transaction; reuse and concurrent redemption are rejected. Password changes/resets notify the verified address when the mail budget permits. Unverified address reservations expire after 24 hours to avoid permanent address squatting; Google-owned account data is retained when a pending reservation expires.

Brevo delivery is deferred through `ctx.waitUntil` so public registration/recovery responses do not wait on an existence-dependent mail request. HTTP 201 means Brevo accepted the message, not that it reached the inbox. Mail failures are logged without recipient addresses, token values, passwords, or provider bodies. All transactional sends—including change notifications—share an atomic D1 daily limit (`ACCOUNT_EMAIL_DAILY_LIMIT`, default 100). Per-recipient/per-purpose mail cooldown is 60 seconds. Credential requests also have persistent 30-per-15-minute IP limits and 10-per-15-minute recipient limits separated by login/enrollment/recovery family, so reset spam does not consume the login allowance. The existing 60-per-minute account-request limiter still applies.

References: [OWASP password storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html), [OWASP password recovery](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html), [Cloudflare native crypto support](https://developers.cloudflare.com/workers/runtime-apis/nodejs/crypto/), and [Brevo transactional email](https://developers.brevo.com/reference/send-transac-email).

Observability (invocation logs, traces, full sampling, persisted) is enabled and mirrors the dashboard settings in `wrangler.jsonc`. Invocation logs include query strings, so the OAuth callback's short-lived `state`/`code` parameters appear in logs: codes are single-use and exchanged immediately, but treat log access as sensitive. Explicit operational warnings omit recipients, passwords, tokens, and provider responses.

Provider requests use `redirect: "manual"` and reject redirects through explicit status checks. The deployed Workers runtime rejects `redirect: "error"`; do not replace manual handling with redirect following, which could forward provider credentials.

## Session checks and the signed-in hint cookie

`/api/auth/session` is only called by pages that may have a session: the Worker sets a readable `cnr_signed_in=1`
cookie (no secret, same lifetime) next to the HttpOnly `__Host-cnr_session` cookie on login and clears both on
logout, account deletion, or when a session check finds the session invalid. Guests never call the endpoint on page
load; the sign-in popup asks when it opens and remembers the configured providers in `localStorage`. This keeps the
request count on the free plan proportional to signed-in traffic, not page views.

Observability is sampled at 10% of requests (logs only, no traces) in `wrangler.jsonc`: the free plan allows
200,000 events a day and an unsampled day produced about two events per request.

## Google Identity Services (One Tap, automatic sign-in, the Google button)

`POST /api/auth/google/credential` with `{credential, nonce}` signs a reader in from a Google Identity Services
credential (an RS256 ID token). The Worker verifies the signature against Google's published keys
(`https://www.googleapis.com/oauth2/v3/certs`, cached per isolate for the advertised max-age and refreshed once
on an unknown key id), the issuer, the audience (`GOOGLE_CLIENT_ID`), the expiry and the nonce the page asked
Google to embed (a 43-character token the page generates per load), then finds or creates the account by Google
`sub` exactly like the redirect flow. Same-origin only (the `Origin` header must be the site). The page side lives in
`hugo/assets/js/auth-ui.js`; the client id comes from `googleClientId` in `hugo/hugo.toml`. In the Google Cloud
console the OAuth client must list `https://www.compilenrun.com` under "Authorized JavaScript origins" or the
prompts will not appear.

## WeChat Official Account login

echo.cool readers can sign in with the WeChat Official Account (公众号) instead of OAuth. Cloudflare Workers have no
fixed egress IP, so the Worker never calls the Official Account API (`access_token` requires an IP whitelist).
Everything the Worker does runs over message push (服务器配置), which only needs WeChat to reach the Worker. The code is
in `src/auth/wechat.js`; the provider entry (`wechat`, `oauth: false`) is in `src/auth/core.js`.

There are two modes. The default is **scan** (mode `scan`): the page shows a per-login parametric QR code and the
reader only scans it. Those QR codes come from a pool of temporary tickets that a job on a server with a fixed,
whitelisted IP creates and uploads (see "QR ticket pool" below). When the pool is empty or the job is not set up,
`start` falls back to **code** (mode `code`): the page shows the account's static QR and a 6-digit code to send.

1. The page calls `POST /api/auth/wechat/start` (same-origin). The Worker stores a pending login with a random
   6-digit code (unique among stored logins), the hash of a binding token sent as the `__Host-cnr_wx` cookie (HttpOnly,
   10 minutes), and a 10-minute expiry, and replies `{code, expiresAt, mode}` (ms). With a valid session the pending
   login is a link for that user and that session; otherwise it is a sign-in. Starting again drops the browser's
   previous code. It also assigns the login one pooled ticket (unassigned, at least 15 minutes left, soonest expiry
   first, atomically via `UPDATE ... WHERE login_code IS NULL RETURNING`); if one is assigned the reply has
   `mode: 'scan'` and `qr: 'https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=<urlencoded ticket>'`, otherwise
   `mode: 'code'`.
2. Scan mode: the page shows the `qr` image. A reader who does not follow the account yet follows it from the scan
   and WeChat pushes `subscribe` with `EventKey = qrscene_<scene>`; a follower gets `SCAN` with `EventKey = <scene>`.
   Code mode: the page shows the account's QR code (a static image) and the code; the reader follows the account and
   sends the 6 digits as a message. Both keep working at the same time (the code is returned in scan mode too, and
   `status` is polled with it).
3. WeChat posts the message to `POST /api/auth/wechat/events`. The Worker checks `signature` (sha1 of the sorted
   token, timestamp and nonce), rejects timestamps more than 5 minutes off, and confirms the unexpired pending login
   with that code, storing the sender's openid. It sends a passive text reply ("登录成功！回到网页即可继续。" or
   "验证码无效或已过期，请在网页上重新获取。"). One openid gets 10 wrong codes per hour, then it is refused for the rest
   of the hour, so nobody can guess another reader's pending code. A scan event looks the scene up in
   `cnr_account_wechat_qr` and confirms the pending login it is assigned to the same way (`openid = FromUserName`; a
   retried push by the same openid gets the same answer, any other openid cannot take over a confirmed login). Replies:
   `subscribe` + scene → "关注成功，网页已登录。" plus a line about the site; `SCAN` → "登录成功！回到网页即可继续。";
   unknown or expired scene → "二维码已过期，请刷新网页后重新扫码。" (after the welcome on `subscribe`). A plain
   `subscribe` (no scene) gets a neutral welcome with the site URL. Other text gets a short help text. Everything else
   gets `success`. No upstream calls are made, so replies are well inside WeChat's 5-second limit.
4. The page polls `GET /api/auth/wechat/status?code=NNNNNN` (every 2-3 s; it shares the 60/min `AUTH_LIMIT`) with the
   `__Host-cnr_wx` cookie (403 without it or with another browser's cookie). Replies: `{status:'pending'}`,
   `{status:'expired'}` (row deleted), `{status:'done'}` (sign-in: the account for that openid is found or created,
   the session and `cnr_signed_in` cookies are set, the binding cookie is cleared), `{status:'linked'}` or
   `{status:'conflict'}` (the openid already belongs to another account, or this account has a different WeChat
   linked). A link only completes if the request still carries the session that started it. A confirmed row is
   consumed exactly once (`DELETE ... RETURNING`); a second poll gets 404. A ticket is single-use: its row references
   the login (`ON DELETE CASCADE`), so it disappears when the login is consumed, expires, or is replaced by a new
   `start` in the same browser; `start` also sweeps expired tickets and orphans. Scanning an old QR code later only
   gets the "expired" reply.

Session discovery reports `providers.wechat`, and `user.wechatLinked`. `DELETE /api/auth/wechat/link` unlinks with
the same rule as the other providers: another usable sign-in method must remain. `POST` on that path returns 405;
linking goes through `start` while signed in. A WeChat identity counts as a sign-in method for the email rules
(forgot-password and pending-email cancel), like Google and GitHub. Message push carries no nickname or email: a new
account is named "微信用户" and `cnr_account_wechat_profiles` only records `updated_at`.

**Schema:** `accounts-wechat-schema.sql` (version 5) must be applied to **both** databases (`compilenrun-data` and
`echocool-data`) before deploying this code, even to the compilenrun Worker where WeChat stays off: `session()`
joins `cnr_account_wechat_identities` for every signed-in request. `accounts-wechat-qr-schema.sql` (version 6, the
ticket pool) goes to both databases too. Without it `start` still works in code mode, but apply it before deploying:

```sh
npx wrangler@4 d1 execute echocool-data --remote --file accounts-wechat-qr-schema.sql
npx wrangler@4 d1 execute compilenrun-data --remote --file accounts-wechat-qr-schema.sql
```

**Configuration** (echocool-worker only; compilenrun-worker has no WeChat settings, so `providers.wechat` is false
there):

- var `WECHAT_APP_ID` in `wrangler.echocool.jsonc`: the account's AppID (replace `REPLACE_ME_WECHAT_APPID`). When it
  is set, the AppID inside every encrypted push must match it.
- secret `WECHAT_TOKEN`: the 服务器配置 Token. WeChat login is enabled when this is set.
- secret `WECHAT_AES_KEY`: the EncodingAESKey (43 characters), needed only in 兼容模式 or 安全模式.
- secret `WECHAT_POOL_SECRET`: a long random string shared with the ticket generator (`openssl rand -base64 32`).
  Without it `/api/auth/wechat/pool` is 404 and every login uses code mode.

```sh
npx wrangler@4 secret put WECHAT_TOKEN --config wrangler.echocool.jsonc
npx wrangler@4 secret put WECHAT_AES_KEY --config wrangler.echocool.jsonc
npx wrangler@4 secret put WECHAT_POOL_SECRET --config wrangler.echocool.jsonc
```

**QR ticket pool.** Per-login QR codes (带参数二维码) need an `access_token`, and WeChat issues one only to servers whose
IP is on the account's whitelist (公众平台 → 设置与开发 → 基本配置 → IP白名单; error `40164` otherwise). The Worker has
no fixed IP, so `tools/wechat_qr_pool.py` runs on the home server (fixed IP, on the whitelist) every 6 hours from a
systemd timer (unit files and env layout in `tools/README.md`). It asks `GET /api/auth/wechat/pool` for
`{available, expiringSoon}`, and when `available - expiringSoon` is below `POOL_TARGET` (300) it fetches an
`access_token` with the AppSecret, creates the missing tickets (`POST /cgi-bin/qrcode/create`, `QR_STR_SCENE`, a
random 32-character `scene_str`, `expire_seconds` 2592000 = 30 days, the maximum) and uploads them in batches of 100.
Temporary QR codes cost nothing and have no total cap; the API's daily call quota is far above what this needs.

- `POST /api/auth/wechat/pool` with `Authorization: Bearer <WECHAT_POOL_SECRET>` (compared in constant time) and
  `{tickets: [{scene, ticket, expiresAt}]}` (at most 500; `scene` matches `^[A-Za-z0-9_-]{16,64}$`, `ticket` is
  printable ASCII up to 512 characters, `expiresAt` in seconds, in the future and at most ~31 days out). Rows are
  inserted with `INSERT OR IGNORE`, expired rows are deleted, and the reply is `{ok:true, inserted, available}`
  (`available` = unassigned tickets with at least 10 minutes left). 401 for a wrong or missing secret, 400 for a bad
  ticket (`{error:'invalid_ticket', index}`).
- `GET /api/auth/wechat/pool` (same auth) replies `{available, expiringSoon}` (`expiringSoon` = available tickets that
  expire within 24 hours).
- No Origin check and no `AUTH_LIMIT` (it is a server, not a page); the route is covered by `www.echo.cool/api/auth/*`.

Each login uses one ticket, so 300 covers 300 sign-ins per 6 hours; raise `POOL_TARGET` if logins outgrow it. If the
generator stops, logins quietly fall back to code mode once the pool runs dry.

**公众平台 settings** (设置与开发 → 基本配置 → 服务器配置): URL `https://www.echo.cool/api/auth/wechat/events`; Token: the
same value as `WECHAT_TOKEN` (3-32 letters or digits); EncodingAESKey: generate it and store it as `WECHAT_AES_KEY`;
消息加解密方式: 明文模式, 兼容模式 or 安全模式 (recommended) all work. Deploy the Worker with the secrets first: on 提交,
WeChat sends the `GET` verification and the Worker echoes `echostr` only for a valid signature. Then click 启用. The
existing `www.echo.cool/api/auth/*` route already covers the URL.

> **Warning:** enabling 服务器配置 turns off the console's own 自动回复 (subscribe reply, keyword replies) and the
> 自定义菜单 configured in the console. The Worker's replies (welcome, code confirmation, help text) replace them.
> Disabling 服务器配置 later brings the console's settings back, but WeChat login stops working.

Encrypted modes follow WeChat's WXBizMsgCrypt: AES-256-CBC with the IV set to the first 16 key bytes, plaintext =
16 random bytes + 4-byte big-endian length + XML + AppID, and PKCS#7 padding to a 32-byte block. WebCrypto only
handles 16-byte padding, so the Worker appends one block that decrypts to a full block of `0x10` before decrypting,
and drops the extra block after encrypting. Replies to encrypted pushes are encrypted and signed (`MsgSignature`).

## Behaviour events (first-party analytics)

`POST /api/events` (src/events/routes.js) stores page views and interaction events in the `cnr_events` table
(accounts-events-schema.sql) together with the account id, so activity can be joined to names and emails. The same
events go to Google Analytics 4 with the account id as `user_id` (hugo/assets/js/analytics.js). Two senders:

- the site: beacons from `analytics.js`; the session cookie identifies the reader. Origin must be SITE_ORIGIN (or a
  same-origin request without Origin, which browsers mark with `Sec-Fetch-Site: same-origin`).
- Moodle: the plugin `local_cnranalytics` (kept in ~/moodle-python-course/plugins, installed by
  install_cnranalytics.sh) ships a copy of `analytics.js` and a token `base64url(JSON{mu,su,em,nm,exp}).base64url(HMAC)`
  signed with the SSO client secret (SSO_CLIENT_SECRET). The Worker resolves the account from the SSO-linked id,
  else by verified email; unmatched Moodle users keep their name/email in `props`. Allowed origins: EVENTS_EXTRA_ORIGINS.

Limits: 25 events and 32 KB per request, EVENTS_LIMIT 120 requests per minute per IP, props up to 2000 characters.
Consent: EEA/UK/CH readers see a consent bar (timezone heuristic; GA Consent Mode uses the real region) and nothing is
sent before they accept; the profile page has an opt-out switch and Global Privacy Control is honoured. Retention: the
cron trigger (`17 3 * * *`) deletes rows older than 400 days; deleting an account sets its rows' user_id to NULL.

Reports: `python3 tools/events_report.py overview|users|user <id|email|name>|pages|events|funnel|moodle|sql|export`
(runs `npx wrangler@4 d1 execute --remote`; see the docstring). Export CSV for a spreadsheet or BigQuery when SQL is
not enough.
