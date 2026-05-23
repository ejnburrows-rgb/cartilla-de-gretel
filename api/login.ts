import type { VercelRequest, VercelResponse } from '@vercel/node';

const PASSWORD = 'Ejn!79021';
const COOKIE_NAME = 'cg_auth';
const COOKIE_VALUE = 'granted';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const redirect = (req.query.redirect as string) || '/';
  const password =
    (req.body as Record<string, string>)?.password ||
    new URLSearchParams(typeof req.body === 'string' ? req.body : '').get('password');

  if (password === PASSWORD) {
    const maxAge = 60 * 60 * 24 * 30; // 30 days
    res.setHeader(
      'Set-Cookie',
      `${COOKIE_NAME}=${COOKIE_VALUE}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}; Secure`
    );
    return res.redirect(302, redirect);
  } else {
    return res.redirect(302, `/login.html?error=1&redirect=${encodeURIComponent(redirect)}`);
  }
}
