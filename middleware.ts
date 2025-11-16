import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

// Routes that require authentication
const protectedRoutes = ['/', '/island'];

// Routes that should redirect to home if already logged in
const authRoutes = ['/login', '/register'];

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  const { pathname } = request.nextUrl;

  // Check if the current route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );

  // Check if the current route is an auth route
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  // Verify token if it exists
  let isValidToken = false;
  if (token) {
    try {
      await jwtVerify(token, secret);
      isValidToken = true;
    } catch (error) {
      // Token is invalid or expired
      isValidToken = false;
    }
  }

  // If on auth route and already logged in, redirect to home
  if (isAuthRoute && isValidToken) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If on protected route and not logged in, redirect to login
  if (isProtectedRoute && !isValidToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|help).*)',
  ],
};
