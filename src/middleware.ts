import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

// Comma-separated allowlist of admin login emails, e.g.
// ADMIN_EMAILS=owner@example.com,dev@example.com
function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip Supabase session refresh if credentials aren't configured
  // (demo mode: everything stays reachable, nothing can be written anyway)
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')
  ) {
    const response = NextResponse.next();
    response.headers.set('x-pathname', pathname);
    return response;
  }

  const { response, user } = await updateSession(request);

  // Set pathname header for admin layout detection
  response.headers.set('x-pathname', pathname);

  // --- Admin gate: /admin pages and /api/admin routes ---
  // Requires a logged-in user whose email is on the ADMIN_EMAILS allowlist.
  // Secure default: if the allowlist is empty, no one gets in.
  const isAdminPage = pathname.startsWith('/admin');
  const isAdminApi = pathname.startsWith('/api/admin');
  if (isAdminPage || isAdminApi) {
    const adminEmails = getAdminEmails();
    const isAdmin = !!user?.email && adminEmails.includes(user.email.toLowerCase());

    if (!isAdmin) {
      if (isAdminApi) {
        return NextResponse.json(
          { error: user ? 'Forbidden: not an admin account' : 'Unauthorized: login required' },
          { status: user ? 403 : 401 }
        );
      }
      if (!user) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('next', pathname);
        return NextResponse.redirect(loginUrl);
      }
      // Logged in but not an admin - send back to the public site.
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // --- Protect account and checkout routes (real session, not just a cookie) ---
  const protectedPaths = ['/account', '/checkout'];
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));
  if (isProtected && !user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|images/).*)'],
};
