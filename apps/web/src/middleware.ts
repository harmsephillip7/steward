export { default } from 'next-auth/middleware';

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
  ],
};
