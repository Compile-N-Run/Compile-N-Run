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

## Google accounts and optional learning snapshots

Accounts are an independent optional feature. Ask AI, quizzes, Turnstile, and feedback keep their existing contracts. Google sign-in requests only `openid profile`; the Worker obtains identity from Google's authenticated UserInfo endpoint after a server-side authorization-code exchange. It identifies Google identities by the stable `sub`, never by email. Google-provided email addresses are not imported. An email address is stored only when a person explicitly registers or adds an email/password method. Google access/ID/refresh tokens are not stored, logged, or sent to the browser.

The flow uses a random state nonce bound to a separate HttpOnly cookie, S256 PKCE, and an expiring, atomically consumed D1 challenge. Sessions use random opaque `__Host-cnr_session` cookies with `Secure; HttpOnly; SameSite=Lax; Path=/`. Only session-token hashes are stored in D1. Sessions expire after 30 days; logout revokes the current session. Expired session/challenge rows are removed during later sign-in attempts.

### Setup

1. In Google Cloud, create an OAuth client of type **Web application**, configure its consent screen, and authorize this exact redirect URI:
   `https://www.compilenrun.com/auth/google_oauth2/callback`
2. `GOOGLE_CLIENT_ID` is a public identifier in `wrangler.jsonc`. Store the secret interactively, never in a source file or a shell argument:

   ```sh
   cd worker/ask-ai
   npx wrangler@4 secret put GOOGLE_CLIENT_SECRET
   ```

3. Apply the additive migrations to the existing D1 database in order:

   ```sh
   npx wrangler@4 d1 execute compilenrun-feedback --remote --file accounts-schema.sql
   npx wrangler@4 d1 execute compilenrun-feedback --remote --file accounts-email-schema.sql
   ```

4. Deploy with Wrangler 4 after validating the migration, secret, and Worker changes. The configuration adds only the auth, learning, and exact Google callback routes plus the `AUTH_LIMIT` binding (60 account requests per minute per IP). It preserves existing AI/quiz/feedback routes and bindings.

Google and email/password availability are evaluated independently. Session discovery includes `providers: {google, email}`, `googleConfigured`, and `emailConfigured`; `configured` is true if either method is available. Missing Google credentials disable Google without disabling a configured email method. Missing all provider prerequisites disables account operations. Missing database tables return a safe service-unavailable response. Use `node --test tests/accounts-worker.test.mjs tests/auth-security.test.mjs` from the repository root for local validation with real SQLite and mocked Google/Brevo endpoints. These tests do not authenticate a real person or prove the deployed OAuth consent or mail-delivery configuration works. Account endpoints intentionally accept only the production site origin; they do not inherit the AI widget's localhost CORS exception.

### Browser/API contract

Every account response uses `Cache-Control: no-store, private`; redirects also use `Referrer-Policy: no-referrer`. No cross-origin account API access is enabled.

| Request | Result |
| --- | --- |
| `GET /api/auth/session` | `{configured, providers: {google,email}, googleConfigured, emailConfigured, user, csrfToken?}`. Signed-in user fields are `id`, `name`, `email`, `emailVerified`, `hasPassword`, and `googleLinked`; `id` is an opaque internal UUID and `name` is at most 100 characters. |
| `GET /api/auth/google` | Redirects to Google; successful callback redirects to `/learn/`, failures to `/learn/?auth=error`. |
| `GET /api/learning` | `{revision, data, updatedAt}`; an empty account starts with revision `0`, `data: null`, `updatedAt: null`. |
| `PUT /api/learning` | Body `{revision, data}`; success `{revision, updatedAt}`. |
| `POST /api/auth/logout` | `{ok: true}` and expires the session cookie. |
| `DELETE /api/auth/account` | `{ok: true}`; permanently deletes this account, its snapshot, and every associated session, then expires cookies. Local browser notes and unrelated feedback are untouched. |

All learning requests and logout/deletion require `X-CNR-User` equal to the user ID returned by session discovery. Mutations additionally require `Origin: https://www.compilenrun.com` and `X-CSRF-Token` from the current session response. This prevents a stale tab from reading or writing a different account after an account switch. Authentication and snapshot reads use the D1 primary; SQL mutations recheck the live session so concurrent revocation cannot recreate deleted data.

Snapshots use the existing `cnr-learning-backup` version-1 JSON envelope. The server checks the envelope, bounded depth/entry counts, unsafe keys, and a **1,800,000-byte UTF-8 limit** (below D1's 2 MB row limit). The body is read incrementally with a byte limit; a missing or false Content-Length does not bypass it. Browser import validation still checks individual lesson and draft records before a user explicitly merges them.

Writes use an atomic compare-and-swap revision. `409 {error: "revision_conflict", revision}` means another device saved first; clients must obtain and review that newer snapshot before retrying, rather than overwriting it automatically. `409 {error: "account_changed"}` means the expected identity no longer matches the session. Other errors include `401 authentication_required`, `403 csrf_failed`/`origin_not_allowed`, `400 invalid_snapshot`, `413 snapshot_too_large`, `415 json_required`, `429 rate_limited`, and `503 accounts_not_configured`/`accounts_unavailable`.

The application performs only explicit snapshot saves and loads. Account deletion removes application data, not the user's Google account or local browser backup. To revoke the Google app authorization itself, the user can remove it in their Google account's third-party connections settings. Signing in again after application-account deletion creates a new internal account without restoring the deleted snapshot.

References: [Google OpenID Connect](https://developers.google.com/identity/openid-connect/openid-connect), [Google discovery endpoints and PKCE methods](https://accounts.google.com/.well-known/openid-configuration), [D1 primary/session behavior](https://developers.cloudflare.com/d1/worker-api/d1-database/), and [D1 limits](https://developers.cloudflare.com/d1/platform/limits/).

## Email/password, verification, recovery, and profile settings

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

Automatic Worker invocation logs are disabled because callback URLs carry short-lived OAuth codes. Explicit operational warnings remain enabled and omit recipients, passwords, tokens, and provider responses. Avoid recording raw auth request URLs or headers when diagnosing a live login.

Provider requests use `redirect: "manual"` and reject redirects through explicit status checks. The deployed Workers runtime rejects `redirect: "error"`; do not replace manual handling with redirect following, which could forward provider credentials.
