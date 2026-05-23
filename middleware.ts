const COOKIE_NAME = 'cg_auth';
const COOKIE_VALUE = 'granted';

function getCookie(cookieHeader: string, name: string): string | undefined {
  const match = cookieHeader
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith(name + '='));
  return match ? match.slice(name.length + 1) : undefined;
}

export default async function middleware(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Always allow the login page and login API
  if (pathname === '/login' || pathname.startsWith('/api/login')) {
    return new Response(null, { status: 200 });
  }

  // Always allow static assets
  if (
    pathname.startsWith('/assets/') ||
    pathname.startsWith('/book/') ||
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt' ||
    pathname === '/manifest.webmanifest' ||
    pathname === '/sw.js'
  ) {
    return new Response(null, { status: 200 });
  }

  // Check auth cookie
  const cookieHeader = request.headers.get('cookie') || '';
  const auth = getCookie(cookieHeader, COOKIE_NAME);

  if (auth === COOKIE_VALUE) {
    return new Response(null, { status: 200 });
  }

  // Redirect unauthenticated visitors to /login
  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('redirect', pathname);
  return Response.redirect(loginUrl.toString(), 302);
}

export const config = {
  matcher: '/((?!assets/|book/|favicon\.ico|robots\.txt|manifest\.webmanifest|sw\.js).*)',
};
