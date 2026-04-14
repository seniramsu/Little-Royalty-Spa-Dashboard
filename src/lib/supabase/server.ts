import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Server-side Supabase client for Server Components and Server Actions.
 *
 * IMPORTANT: Use getUser() for auth validation — never getSession().
 * getSession() reads a local, unvalidated cookie and is unsafe for route protection.
 * getUser() makes a network call to validate the JWT server-side.
 *
 * The try/catch on setAll is intentional:
 * - Server Components cannot set cookies (read-only) — this is expected.
 * - Server Actions CAN set cookies — setAll will succeed there.
 * - The middleware handles all session refreshes.
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Components cannot set cookies — middleware handles refresh.
            // This catch prevents errors when called from read-only server contexts.
          }
        },
      },
    }
  )
}
