import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Root middleware: session refresh + route guard.
 *
 * CRITICAL: Returns supabaseResponse (not a fresh NextResponse) so that
 * refreshed session cookies flow back to the browser. Creating a new
 * NextResponse would silently drop the cookie, causing sessions to expire
 * after each request even with rolling refresh configured.
 *
 * CRITICAL: Uses getUser() for validation, not getSession(). getSession()
 * reads the local cookie without a server-side JWT validation call and is
 * unsafe for route protection.
 */
export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: getUser() — not getSession() — validates the JWT server-side.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  const isAuthRoute =
    pathname === '/login' ||
    pathname.startsWith('/login') ||
    pathname === '/reset-password' ||
    pathname.startsWith('/reset-password') ||
    pathname === '/update-password' ||
    pathname.startsWith('/update-password')

  if (!user && !isAuthRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Return supabaseResponse — NOT a new NextResponse — to preserve cookie updates.
  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
