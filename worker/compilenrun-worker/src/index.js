// One deployed Worker; each feature owns its handler and helpers.
import { handleAccounts } from './auth/routes.js';
import { corsFor, json } from './lib/http.js';
import { ask } from './ai/ask.js';
import { quiz } from './ai/quiz.js';
import { feedback } from './feedback.js';

// Preserve the helper imports used by existing integrations.
export { pageText } from './ai/page-content.js';
export { questionSplitter } from './ai/quiz.js';

const handlers = { '/api/ask': ask, '/api/quiz': quiz, '/api/feedback': feedback };
export default {
  async fetch(request, env, ctx) {
    const accountResponse = await handleAccounts(request, env, ctx);
    if (accountResponse) return accountResponse;
    const cors = corsFor(request.headers.get('Origin') || '');
    if (request.method === 'OPTIONS') return new Response(null, { status: cors ? 204 : 403, headers: cors || {} });
    if (request.method !== 'POST') return json(405, { error: 'Use POST.' }, cors || {});
    if (!cors) return json(403, { error: 'Not allowed from this origin.' }, {});
    const handler = handlers[new URL(request.url).pathname];
    if (!handler) return json(404, { error: 'not_found' }, cors);
    return handler(request, env, ctx, cors, request.headers.get('CF-Connecting-IP') || 'unknown');
  },
};
