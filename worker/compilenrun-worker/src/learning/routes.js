import { limitedJSON } from '../lib/body.js';
import { record, validateSnapshot, SNAPSHOT_MAX_BYTES } from './snapshot.js';
import { decodeRows, toRecords, validateChanges, changesBetween, measureChanges } from './records.js';

// Both the head and its records are read in one SQL statement, so a concurrent
// save cannot pair a revision with records from another revision. PATCH joins
// the supplied keys against the composite primary key, never every lesson.
async function readHead(db, login, { keys = null, knownRevision = -1, expectedRevision = null, includeLegacy = true, asSnapshot = false } = {}) {
  const source = keys === null ? 'cnr_learning_records r' : 'json_each(?3) k CROSS JOIN cnr_learning_records r';
  const matching = keys === null ? '' : "AND r.kind = json_extract(k.value, '$[0]') AND r.record_key = json_extract(k.value, '$[1]')";
  const group = kind => `json((SELECT json_group_object(record_key, json(data_json)) FROM cnr_learning_records
    WHERE user_id = l.user_id AND kind = '${kind}'))`;
  // Let SQLite assemble downloads. Forwarding its JSON avoids parsing, walking,
  // and serializing thousands of records within the free Worker's CPU budget.
  const recordsSQL = asSnapshot ? `json_object('format', 'cnr-learning-backup', 'version', 1, 'exportedAt', h.exported_at,
    'progress', json_object('v', 1, 'done', ${group('read')}, 'tuts', ${group('course')}),
    'learning', json_object('v', 1, 'lessons', ${group('lesson')}),
    'playground', json_object('version', 1, 'drafts', ${group('draft')}))` :
    `(SELECT json_group_array(json_array(r.kind, r.record_key, json(r.data_json)))
       FROM ${source} WHERE r.user_id = l.user_id ${matching})`;
  return db.prepare(`SELECT COALESCE(h.revision, l.revision) AS revision,
    COALESCE(h.updated_at, l.updated_at) AS updated_at, h.user_id AS normalized,
    h.exported_at, h.record_bytes, h.record_counts,
    CASE WHEN ?7 AND h.user_id IS NULL AND l.revision != ?4 THEN l.data_json END AS legacy_json,
    CASE WHEN h.user_id IS NOT NULL AND h.revision != ?4 AND (?6 IS NULL OR h.revision = ?6) THEN
      ${recordsSQL} END AS rows_json
    FROM cnr_account_learning l LEFT JOIN cnr_learning_state h ON h.user_id = l.user_id
    JOIN cnr_account_sessions s ON s.user_id = l.user_id
    WHERE l.user_id = ?1 AND s.token_hash = ?2 AND s.expires_at > ?5`)
    .bind(login.user.id, login.tokenHash, keys === null ? null : JSON.stringify(keys), knownRevision,
      Math.floor(Date.now() / 1000), expectedRevision, includeLegacy ? 1 : 0).first();
}
const updatedAt = head => head.updated_at === null ? null : new Date(head.updated_at * 1000).toISOString();
const capabilities = head => ({ syncProtocol: 2, incremental: !!head.normalized });

export async function handleLearning(request, env, login, kit) {
  const reply = kit.reply;
  if (request.method === 'GET') {
    const supplied = request.headers.get('X-CNR-Revision');
    const knownRevision = supplied !== null && /^\d{1,16}$/.test(supplied) && Number.isSafeInteger(Number(supplied)) ? Number(supplied) : -1;
    const head = await readHead(env.DB, login, { knownRevision, asSnapshot: true });
    if (!head) return reply(401, { error: 'authentication_required' });
    const common = { revision: head.revision, updatedAt: updatedAt(head), ...capabilities(head) };
    if (head.revision === knownRevision) return reply(200, { ...common, unchanged: true });
    const dataJSON = head.normalized ? head.rows_json : head.legacy_json || 'null';
    return new Response(JSON.stringify(common).slice(0, -1) + ',"data":' + dataJSON + '}', { status: 200, headers: reply(200, {}).headers });
  }
  if (!(request.headers.get('content-type') || '').toLowerCase().startsWith('application/json')) return reply(415, { error: 'json_required' });
  let input, proposed;
  try {
    // A patch repeats each key once; allow envelope overhead without increasing
    // the per-account stored-data allowance.
    input = await limitedJSON(request, request.method === 'PATCH' ? SNAPSHOT_MAX_BYTES * 2 : SNAPSHOT_MAX_BYTES + 4096);
    if (!record(input) || !Number.isSafeInteger(input.revision) || input.revision < 0 || input.revision >= Number.MAX_SAFE_INTEGER) throw new TypeError('invalid_revision');
    if (request.method === 'PATCH') proposed = validateChanges(input);
    else { validateSnapshot(input.data); proposed = toRecords(input.data); }
  } catch (error) {
    return reply(error instanceof RangeError ? 413 : 400, { error: error instanceof RangeError ? 'snapshot_too_large' : 'invalid_snapshot' });
  }
  const head = await readHead(env.DB, login, { keys: request.method === 'PATCH' ? proposed.map(row => [row.kind, row.key]) : null,
    expectedRevision: input.revision, includeLegacy: false });
  if (!head) return reply(401, { error: 'authentication_required' });
  if (head.revision !== input.revision) return reply(409, { error: 'revision_conflict', revision: head.revision });
  if (request.method === 'PATCH' && !head.normalized) return reply(409, { error: 'storage_upgrade_required', revision: head.revision });
  const previous = decodeRows(head.rows_json);
  if (request.method === 'PUT') proposed = changesBetween(previous, proposed);
  let measured;
  try { measured = measureChanges(head, previous, proposed); }
  catch (error) { return reply(error instanceof RangeError ? 413 : 400, { error: error instanceof RangeError ? 'snapshot_too_large' : 'invalid_snapshot' }); }
  // An identical save incurs no writes, including exportedAt-only changes.
  if (head.normalized && !measured.changed.length) return reply(200, { revision: head.revision, updatedAt: updatedAt(head), ...capabilities(head) });
  const stamp = Math.floor(Date.now() / 1000), writeToken = crypto.randomUUID();
  const guard = `EXISTS (SELECT 1 FROM cnr_account_sessions WHERE token_hash = ?8 AND user_id = ?1 AND expires_at > ?4)`;
  const stateSQL = head.normalized ? `UPDATE cnr_learning_state SET revision = revision + 1, exported_at = ?3,
    updated_at = ?4, record_bytes = ?5, record_counts = ?6, write_token = ?7
    WHERE user_id = ?1 AND revision = ?2 AND ${guard}` :
    `INSERT INTO cnr_learning_state (user_id, revision, exported_at, updated_at, record_bytes, record_counts, write_token)
     SELECT ?1, ?2 + 1, ?3, ?4, ?5, ?6, ?7 FROM cnr_account_learning
     WHERE user_id = ?1 AND revision = ?2 AND ${guard} AND NOT EXISTS (SELECT 1 FROM cnr_learning_state WHERE user_id = ?1)`;
  const statements = [env.DB.prepare(stateSQL).bind(login.user.id, input.revision,
    request.method === 'PATCH' ? input.exportedAt : input.data.exportedAt, stamp, measured.bytes, JSON.stringify(measured.counts), writeToken, login.tokenHash)];
  // The nonce makes every following statement conditional on THIS batch winning
  // the CAS. Checking only revision+1 would let a losing concurrent batch write.
  const accepted = 'EXISTS (SELECT 1 FROM cnr_learning_state WHERE user_id = ?1 AND write_token = ?2)';
  const removed = measured.changed.filter(row => row.value === null).map(row => [row.kind, row.key]);
  const upserts = measured.changed.filter(row => row.value !== null).map(row => [row.kind, row.key, row.value]);
  if (removed.length) statements.push(env.DB.prepare(`DELETE FROM cnr_learning_records WHERE user_id = ?1 AND ${accepted}
    AND (kind, record_key) IN (SELECT json_extract(value, '$[0]'), json_extract(value, '$[1]') FROM json_each(?3))`)
    .bind(login.user.id, writeToken, JSON.stringify(removed)));
  if (upserts.length) statements.push(env.DB.prepare(`INSERT INTO cnr_learning_records (user_id, kind, record_key, data_json)
    SELECT ?1, json_extract(value, '$[0]'), json_extract(value, '$[1]'), value -> '$[2]' FROM json_each(?3) WHERE ${accepted}
    ON CONFLICT (user_id, kind, record_key) DO UPDATE SET data_json = excluded.data_json WHERE data_json != excluded.data_json`)
    .bind(login.user.id, writeToken, JSON.stringify(upserts)));
  if (!head.normalized) statements.push(env.DB.prepare(`UPDATE cnr_account_learning SET data_json = NULL WHERE user_id = ?1 AND ${accepted} AND data_json IS NOT NULL`)
    .bind(login.user.id, writeToken));
  const result = await env.DB.batch(statements);
  if (!result[0].meta.changes) {
    if (!await kit.session(request, env.DB)) return reply(401, { error: 'authentication_required' });
    const current = await readHead(env.DB, login, { knownRevision: -1, keys: [] });
    return reply(409, { error: 'revision_conflict', revision: current?.revision ?? 0 });
  }
  return reply(200, { revision: input.revision + 1, updatedAt: new Date(stamp * 1000).toISOString(), syncProtocol: 2, incremental: true });
}
