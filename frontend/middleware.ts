import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  const session = request.cookies.get('session')?.value

  // Protected routes
  const isProtectedRoute = path.startsWith('/orders') || path.startsWith('/checkout') || path.startsWith('/security')
  // Public-only routes
  const isPublicOnlyRoute = path === '/login' || path === '/register'

  if (isProtectedRoute && !session) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (isPublicOnlyRoute && session) {
    const url = request.nextUrl.clone()
    url.pathname = '/products'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/orders/:path*',
    '/checkout/:path*',
    '/security/:path*',
    '/login',
    '/register',
  ],
}
