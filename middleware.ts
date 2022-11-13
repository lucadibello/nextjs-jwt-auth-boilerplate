// middleware.ts
import { NextRequest, NextResponse } from 'next/server'

// Limit the middleware to paths starting with `/api/`
export const config = {
  matcher: '/api/:function*',
}

export function middleware(request: NextRequest) {
  // Extract the `token` from Authorization header
  const token = request.headers.get('Authorization')?.replace('Bearer ', '')

  // If the token is not present, return a 401 response
  if (!token) {
    // Redirect to login page
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  } else {
    // If the token is valid, continue to the route handler
    return NextResponse.next()
  }
}
