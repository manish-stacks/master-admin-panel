import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('access_token')?.value

  // Sirf dashboard protect karo
  if (pathname.startsWith('/dashboard') && !token) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // Sirf auth page pe redirect karo agar already logged in
  if (pathname.startsWith('/auth/') && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Baaki sab allow karo — frontend pages, home, blog, contact sab
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/auth/:path*'],
}