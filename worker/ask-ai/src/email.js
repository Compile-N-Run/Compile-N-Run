// Transactional mail only: no marketing contact/list creation, no token logging.
export async function sendAccountEmail(env, email, purpose, token) {
  const site = 'https://www.compilenrun.com';
  const messages = {
    verify: {
      subject: 'Verify your Compile N Run email',
      text: `Confirm your email and enter the password you chose when registering or adding this login method. This link expires in 24 hours.\n\n${site}/profile/#verify=${token}\n\nIf you did not request this, ignore this email. Nothing is verified by opening the link alone.`,
    },
    reset: {
      subject: 'Reset your Compile N Run password',
      text: `Choose a new password using this link within 30 minutes:\n\n${site}/profile/#reset=${token}\n\nIf you did not request this, ignore this email. Your password does not change unless you submit the reset form.`,
    },
    changed: {
      subject: 'Your Compile N Run password changed',
      text: `Your password was changed and all account sessions were signed out. If this was not you, open ${site}/profile/ and request a password reset.`,
    },
  };
  const message = messages[purpose];
  if (!message) throw new Error('unknown_email_purpose');
  const result = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST', redirect: 'manual', signal: AbortSignal.timeout(10000),
    headers: { 'api-key': env.BREVO_API_KEY, 'content-type': 'application/json', accept: 'application/json', 'user-agent': 'CompileNRun-Accounts/1.0' },
    body: JSON.stringify({ sender: { email: env.BREVO_SENDER_EMAIL, name: env.BREVO_SENDER_NAME || 'Compile-N-Run' },
      to: [{ email }], subject: message.subject, textContent: message.text }),
  });
  if (result.status !== 201) {
    const error = new Error('email_delivery_not_accepted');
    error.status = result.status;
    // Retain only Brevo's short machine code, never response text or recipients.
    try {
      const body = await result.json();
      if (typeof body.message === 'string' && /unrecogn[iz]ed IP|IP address.*authori[sz]|authori[sz].*IP address/i.test(body.message)) error.providerCode = 'ip_not_authorized';
      if (!error.providerCode && typeof body.code === 'string' && /^[a-z_]{1,60}$/.test(body.code)) error.providerCode = body.code;
    } catch (_) {}
    throw error;
  }
}
