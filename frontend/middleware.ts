/**
 * Lansy.ai — Next.js Middleware
 * Server-side route protection using Supabase session cookie.
 * Prevents flash of protected content for unauthenticated users.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_PATHS = ['/dashboard', '/generate', '/history', '/profile', '/tokens'];
const AUTH_PATHS = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  const isAuthPath = AUTH_PATHS.some((p) => pathname.startsWith(p));

  if (!isProtected && !isAuthPath) {
    return NextResponse.next();
  }

  // Supabase stores session in cookies with this naming pattern
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const projectRef = supabaseUrl.split('.')[0]?.split('//')[1] ?? '';
  const sessionCookieName = `sb-${projectRef}-auth-token`;

  // Check for auth token cookie
  const hasSession =
    request.cookies.has(sessionCookieName) ||
    request.cookies.has('sb-access-token') ||
    request.cookies.has('supabase-auth-token') ||
    // Supabase v2 stores in localStorage but also sets a cookie chunk
    Array.from(request.cookies.getAll()).some(
      (c) => c.name.startsWith('sb-') && c.name.endsWith('-auth-token')
    );

  // Redirect unauthenticated users away from protected routes
  if (isProtected && !hasSession) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from auth pages (optional UX improvement)
  if (isAuthPath && hasSession) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths EXCEPT static files and API routes
     */
    '/((?!_next/static|_next/image|favicon.ico|api/).*)',
  ],
};
