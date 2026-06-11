import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const publicRoutes = ['/login', '/register', '/forgot-password', '/callback']

const protectedRoutes = [
  '/dashboard',
  '/profile',
  '/projects',
  '/api-keys',
  '/history',
  '/usage',
]

function isPublicRoute(pathname: string) {
  return publicRoutes.some((route) => pathname.startsWith(route))
}

function isProtectedRoute(pathname: string) {
  return protectedRoutes.some((route) => pathname.startsWith(route))
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key',
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          )
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Root → redirect to dashboard or login
  if (pathname === '/') {
    const target = user ? '/dashboard' : '/login'
    return NextResponse.redirect(new URL(target, request.url))
  }

  // Authenticated user on auth pages → redirect to dashboard
  if (user && isPublicRoute(pathname)) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Unauthenticated user on protected pages → redirect to login
  if (!user && isProtectedRoute(pathname)) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Onboarding: user without profile name → redirect to /profile
  if (user && isProtectedRoute(pathname) && pathname !== '/profile') {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()

    if (!profile?.full_name) {
      return NextResponse.redirect(new URL('/profile', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/',
    '/dashboard/:path*',
    '/profile/:path*',
    '/projects/:path*',
    '/api-keys/:path*',
    '/history/:path*',
    '/usage/:path*',
    '/login',
    '/register',
    '/forgot-password',
    '/callback',
  ],
}
