import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('erp_auth_token')?.value;

  const isLoginPage = request.nextUrl.pathname.startsWith('/login');

  // Allow access to login page if no token
  if (isLoginPage) {
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Redirect to login if no token for protected routes
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Here, we can also extract role from JWT payload using base64 decoding 
  // (without verification, as middleware runs on Edge) to do RBAC for main paths.
  // But for now, just requiring token is enough. Layouts will handle RBAC UI.
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/pos/:path*', '/login'],
};
