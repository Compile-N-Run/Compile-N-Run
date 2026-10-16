// Native Workers-compatible scrypt. OWASP's 16 MiB / p=5 alternative avoids
// consuming the isolate's entire 128 MiB limit for one password operation.
import { createHmac, randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { Buffer } from 'node:buffer';

const OPTIONS = Object.freeze({ N: 16384, r: 8, p: 5, maxmem: 32 * 1024 * 1024 });
let active = 0;

export function passwordAllowed(password) {
  return typeof password === 'string' && [...password].length >= 15 && [...password].length <= 128 &&
    new TextEncoder().encode(password).length <= 1024 && !password.includes('\0');
}
async function derive(password, salt, pepper) {
  if (typeof pepper !== 'string' || pepper.length < 32) throw new Error('password_service_unavailable');
  // No cross-request promise queue: a request must never depend on a resolver
  // owned by another Workers execution context that might be canceled.
  if (active >= 2) throw new Error('password_service_busy');
  active++;
  try {
    const input = createHmac('sha256', pepper).update(password, 'utf8').digest();
    return await new Promise((resolve, reject) => scrypt(input, salt, 32, OPTIONS, (error, result) => error ? reject(error) : resolve(result)));
  } finally {
    active--;
  }
}
export async function hashPassword(password, pepper) {
  if (!passwordAllowed(password)) throw new TypeError('password_policy');
  const salt = randomBytes(16);
  const digest = await derive(password, salt, pepper);
  return `scrypt-v1$16384$8$5$${salt.toString('base64url')}$${digest.toString('base64url')}`;
}
export async function verifyPassword(password, encoded, pepper) {
  // Unknown users still incur the same KDF work, without a shared real password.
  const match = typeof encoded === 'string' && /^scrypt-v1\$16384\$8\$5\$([A-Za-z0-9_-]{22})\$([A-Za-z0-9_-]{43})$/.exec(encoded);
  const salt = match ? Buffer.from(match[1], 'base64url') : Buffer.alloc(16, 0);
  const result = await derive(typeof password === 'string' ? password : '', salt, pepper);
  return !!match && timingSafeEqual(result, Buffer.from(match[2], 'base64url'));
}
