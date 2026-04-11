import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  const response = await updateSession(request);

  // Set pathname header for admin layout detection
  response.headers.set('x-pathname', request.nextUrl.pathname);

  // Protect account and checkout routes
  const protectedPaths = ['/account', '/checkout'];
  const isProtected = protectedPaths.some((p) => request.nextUrl.pathname.startsWith(p));

  if (isProtected) {
    const supabaseResponse = response;
    // Check for auth cookie presence (session refresh already happened in updateSession)
    const hasAuthCookie = request.cookies.getAll().some((c) => c.name.startsWith('sb-'));
    if (!hasAuthCookie) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('next', request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|images/).*)'],
};
