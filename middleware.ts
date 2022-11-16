// middleware.ts
import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // Check if a user session exists
  if (!request.cookies.get('token')) {
    if (request.nextUrl.pathname != '/login') {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  } else {
    // If a user session exists, do not permit to access login and register pages
    if (
      request.nextUrl.pathname.startsWith('/login') ||
      request.nextUrl.pathname.startsWith('/register')
    ) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }
}

// See "Matching Paths" below to learn more
export const config = {
  /*
   * Match all request paths except for the ones starting with:
   * - api (API routes)
   * - _next/static (static files)
   * - favicon.ico (favicon file)
   */
  matcher: '/((?!api|_next/static|favicon.ico).*)',
}
