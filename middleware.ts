import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

// Define protected routes
const protectedRoutes = ['/admin', '/dashboard', '/staff'];
const authRoutes = ['/login'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get token from cookie
  const token = request.cookies.get('token')?.value;
  
  // Check if the current path is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  // Check if the current path is an auth route
  const isAuthRoute = authRoutes.some(route => 
    pathname.startsWith(route)
  );

  // If accessing a protected route without a token, redirect to login
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If accessing auth routes with a valid token, redirect to appropriate dashboard
  if (isAuthRoute && token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-jwt-secret') as any;
      
      // Redirect based on user role (now normalized to uppercase in JWT)
      if (decoded.role === 'ADMIN') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      } else if (decoded.role === 'TBB_STAFF' || decoded.role === 'STAFF') {
        return NextResponse.redirect(new URL('/dashboard/staff', request.url));
      } else {
        return NextResponse.redirect(new URL('/dashboard/client', request.url));
      }
    } catch (error) {
      // Token is invalid, continue to login page
      console.error('Invalid token in middleware:', error);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
