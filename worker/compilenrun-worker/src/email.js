// Transactional mail only: no marketing contact/list creation, no token logging.
import { siteOrigin, siteName, siteIsChinese } from './lib/http.js';

function accountMessages(site, name, token, chinese) {
  if (chinese) return {
    verify: {
      subject: `验证你的${name}邮箱`,
      text: `请确认你的邮箱，并输入你在注册或添加此登录方式时设置的密码。此链接 24 小时内有效。\n\n${site}/profile/#verify=${token}\n\n如果这不是你本人的操作，请忽略此邮件。仅打开链接不会验证任何内容。`,
    },
    reset: {
      subject: `重置你的${name}密码`,
      text: `请在 30 分钟内通过此链接设置新密码：\n\n${site}/profile/#reset=${token}\n\n如果这不是你本人的操作，请忽略此邮件。除非你提交重置表单，否则密码不会改变。`,
    },
    changed: {
      subject: `你的${name}密码已更改`,
      text: `你的密码已更改，账号的所有登录会话均已退出。如果这不是你本人的操作，请打开 ${site}/profile/ 申请重置密码。`,
    },
  };
  return {
    verify: {
      subject: `Verify your ${name} email`,
      text: `Confirm your email and enter the password you chose when registering or adding this login method. This link expires in 24 hours.\n\n${site}/profile/#verify=${token}\n\nIf you did not request this, ignore this email. Nothing is verified by opening the link alone.`,
    },
    reset: {
      subject: `Reset your ${name} password`,
      text: `Choose a new password using this link within 30 minutes:\n\n${site}/profile/#reset=${token}\n\nIf you did not request this, ignore this email. Your password does not change unless you submit the reset form.`,
    },
    changed: {
      subject: `Your ${name} password changed`,
      text: `Your password was changed and all account sessions were signed out. If this was not you, open ${site}/profile/ and request a password reset.`,
    },
  };
}

export async function sendAccountEmail(env, email, purpose, token) {
  const messages = accountMessages(siteOrigin(env), siteName(env), token, siteIsChinese(env));
  const message = messages[purpose];
  if (!message) throw new Error('unknown_email_purpose');
  const result = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST', redirect: 'manual', signal: AbortSignal.timeout(10000),
    headers: { 'api-key': env.BREVO_API_KEY, 'content-type': 'application/json', accept: 'application/json', 'user-agent': 'CompileNRun-Accounts/1.0' },
    body: JSON.stringify({ sender: { email: env.BREVO_SENDER_EMAIL, name: env.BREVO_SENDER_NAME || siteName(env) },
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
