import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const COOKIE_NAME = 'steward_auth';

export function middleware(req: NextRequest) {
  const raw = req.cookies.get(COOKIE_NAME)?.value;
  let isAuthenticated = false;

  if (raw) {
    try {
      const state = JSON.parse(decodeURIComponent(raw));
      isAuthenticated = !!state?.token;
    } catch {
      isAuthenticated = false;
    }
  }

  if (!isAuthenticated) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/clients/:path*',
    '/portfolios/:path*',
    '/funds/:path*',
    '/fna/:path*',
    '/reports/:path*',
    '/compliance/:path*',
    '/settings/:path*',
    '/portal/:path*',
  ],
};
