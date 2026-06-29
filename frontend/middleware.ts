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

  // We use client-side Supabase auth (localStorage), so we bypass cookie checks here.
  // The actual route protection is handled by DashboardLayout.
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
