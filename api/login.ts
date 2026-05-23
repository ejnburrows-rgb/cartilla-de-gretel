import type { VercelRequest, VercelResponse } from '@vercel/node';

const PASSWORD = 'Ejn!79021';
const COOKIE_NAME = 'cg_auth';
const COOKIE_VALUE = 'granted';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  let body = '';
  if (typeof req.body === 'string') {
    body = req.body;
  } else if (req.body && typeof req.body === 'object') {
    body = new URLSearchParams(req.body as Record<string, string>).toString();
  }

  const params = new URLSearchParams(body);
  const password = params.get('password') || (req.body as Record<string, string>)?.password;

  if (password === PASSWORD) {
    const maxAge = 60 * 60 * 24 * 30; // 30 days
    res.setHeader(
      'Set-Cookie',
      `${COOKIE_NAME}=${COOKIE_VALUE}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}; Secure`
    );
    const redirect = (req.query.redirect as string) || '/';
    return res.redirect(302, redirect);
  } else {
    return res.redirect(302, '/login?error=1');
  }
}
