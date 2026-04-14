# Phase 1 Research: Scaffold + Auth

> Research date: 2026-04-13
> Phase scope: Next.js 15 app scaffold, Supabase Auth (email/password, password reset, 2 accounts), home dashboard shell (stats cards, upcoming bookings, next-action prompt), bottom tab navigation, responsive at 375px.

---

## Next.js 15 + Supabase Auth Setup

### Recommended Project Structure

The canonical structure for a Next.js 15 App Router project with Supabase Auth separates concerns into auth-aware server components, a middleware layer, and a utility layer for Supabase client creation. The project tree should look like this:

```
src/
  app/
    (auth)/
      login/
        page.tsx
      reset-password/
        page.tsx
      update-password/
        page.tsx          ← handles the token from the reset email link
    (dashboard)/
      layout.tsx          ← protected shell with bottom tab nav
      page.tsx            ← home dashboard (stats + upcoming bookings)
      bookings/
        page.tsx
      customers/
        page.tsx
      social/
        page.tsx
      demographics/
        page.tsx
  components/
    ui/                   ← shadcn/ui copied components
    nav/
      BottomTabBar.tsx
    dashboard/
      StatsCard.tsx
      UpcomingBookings.tsx
      NextActionPrompt.tsx
  lib/
    supabase/
      client.ts           ← browser client (createBrowserClient)
      server.ts           ← server component client (createServerClient)
      middleware.ts        ← middleware client helper
  middleware.ts            ← root middleware (session refresh + route guard)
```

The route groups `(auth)` and `(dashboard)` use Next.js App Router's grouping syntax — they do not appear in the URL. The `(dashboard)/layout.tsx` is the protected shell that renders the bottom tab bar and confirms a valid session before rendering any child page. The `(auth)` routes are public.

### App Router + Supabase Auth: How It Works

Supabase Auth in a Next.js 15 App Router context uses cookie-based sessions managed by the `@supabase/ssr` package. The flow is:

1. User logs in — Supabase sets an `sb-<project-ref>-auth-token` cookie (split across multiple cookies if the token is large).
2. Every subsequent request carries that cookie.
3. The middleware reads the cookie, calls `supabase.auth.getUser()` to validate it, and refreshes the session if needed (rolling expiry).
4. Server Components create a read-only Supabase client using the cookie from the request headers.
5. Client Components use a browser-side Supabase client for any client-initiated auth calls (logout, etc.).

The critical design requirement from Supabase's own 2024/2025 documentation: **always use `getUser()` in middleware for validation, never `getSession()`**. `getSession()` reads the local cookie without validating against Supabase's server — it can return a stale or spoofed session. `getUser()` makes a network call to validate the JWT, which is the correct security boundary.

### Tailwind v4 Note

Tailwind v4 (included in the stack) changed its configuration model: there is no `tailwind.config.js` by default. Configuration lives in the CSS file using `@theme` directives. When running `npx shadcn@latest init`, select the v4 Tailwind option — it generates a `globals.css` with `@import "tailwindcss"` and `@theme` blocks instead of a JS config. Confirm the shadcn CLI version supports Tailwind v4 at scaffold time; as of mid-2025 it does.

---

## Session Handling + Middleware

### The Middleware Pattern (Required)

The root `middleware.ts` file is not optional — without it, session cookies are never refreshed and sessions expire without renewal. The correct pattern:

```typescript
// middleware.ts (root of project, not inside src/app)
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
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

  // IMPORTANT: must call getUser(), not getSession()
  const { data: { user } } = await supabase.auth.getUser()

  const isAuthRoute = request.nextUrl.pathname.startsWith('/login') ||
    request.nextUrl.pathname.startsWith('/reset-password') ||
    request.nextUrl.pathname.startsWith('/update-password')

  if (!user && !isAuthRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
```

Key points:
- The middleware must return the `supabaseResponse` object (not a new `NextResponse`) so the updated cookies flow back to the browser. This is the most common mistake — creating a new response object discards the refreshed session cookie.
- The `matcher` pattern excludes static assets to avoid running auth logic on every image request.
- Route protection is centralized here; the `(dashboard)/layout.tsx` can trust that any request reaching it has a valid user.

### Server Component Client

```typescript
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Components cannot set cookies; middleware handles refresh
          }
        },
      },
    }
  )
}
```

The `try/catch` on `setAll` is intentional — Server Components cannot set cookies, but this client may be called from both Server Components (read-only) and Server Actions (can set). The middleware handles all actual session refreshes.

### Seeding Two User Accounts (Without a Public Signup Flow)

There is no signup page in Phase 1 — accounts are seeded once. Three viable approaches:

**Option A — Supabase Dashboard (simplest):**
Go to `Authentication → Users → Invite user` in the Supabase project dashboard. Enter each owner's email. This sends an invite email that sets a temporary password. The owner sets their real password on first login. No code required.

**Option B — Supabase Admin API (scripted, repeatable):**
Create a `scripts/seed-auth.ts` file that uses the service role key (never committed to git, only in `.env.local`):
```typescript
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!  // admin key, not anon key
)
await supabase.auth.admin.createUser({
  email: 'owner1@littleroyaltyspa.com',
  password: 'temp-password-to-change',
  email_confirm: true,  // bypasses email verification
})
```
Run once with `npx tsx scripts/seed-auth.ts`. Delete or gitignore the script after use. The owners then use the password reset flow to set their own passwords.

**Option C — Supabase CLI (local dev):**
Run `supabase db seed` with a seed file for the local dev environment. Production accounts are created via Option A or B.

**Recommended:** Option B for initial setup, Option A for any future account adjustments. The service role key must never be in `NEXT_PUBLIC_*` variables — it belongs only in `.env.local` (gitignored) and Vercel environment variables (Production/Preview, server-only).

### Session Expiry Configuration

The architecture doc specifies 30-day rolling sessions with HttpOnly cookies. In Supabase Auth, this is configured in the Supabase project dashboard under `Authentication → Configuration → Session`:
- **JWT expiry:** Set to 3600 (1 hour) — this is the JWT token lifetime, not the session lifetime
- **Session inactivity timeout:** Disable or set to 30 days
- **Refresh token reuse interval:** Default is fine

The rolling refresh is handled automatically by the middleware calling `getUser()` on every request — this triggers a token refresh when the JWT is near expiry. No additional configuration is needed in Next.js.

---

## Bottom Tab Navigation

### Pattern: Fixed Bottom Bar via Root Layout

The bottom tab bar must be persistent across all dashboard pages. In Next.js App Router, this means placing it in the `(dashboard)/layout.tsx`:

```typescript
// app/(dashboard)/layout.tsx
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 pb-16 overflow-y-auto">
        {children}
      </main>
      <BottomTabBar />
    </div>
  )
}
```

The `pb-16` on `main` prevents content from being hidden behind the fixed tab bar. The tab bar itself is `fixed bottom-0 left-0 right-0`.

### BottomTabBar Component

shadcn/ui does not ship a bottom tab bar component, but it is straightforward to build with Tailwind and `lucide-react`. The component needs to:
1. Know the current route to highlight the active tab (use Next.js `usePathname()` hook)
2. Be a Client Component (requires `"use client"` due to `usePathname`)
3. Use `Link` from `next/link` for navigation (prefetches automatically)

```typescript
// components/nav/BottomTabBar.tsx
"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, CalendarDays, Users, Share2, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'

const tabs = [
  { href: '/',             label: 'Home',         icon: Home },
  { href: '/bookings',     label: 'Bookings',     icon: CalendarDays },
  { href: '/customers',    label: 'Customers',    icon: Users },
  { href: '/social',       label: 'Social',       icon: Share2 },
  { href: '/demographics', label: 'Area',         icon: MapPin },
]

export function BottomTabBar() {
  const pathname = usePathname()
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-16 bg-background border-t border-border">
      <div className="flex h-full">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href))
          return (
            <Link key={href} href={href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-0.5 text-xs",
                active ? "text-foreground" : "text-muted-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5", active && "stroke-[2.5px]")} />
              <span>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
```

### Desktop Responsive Behavior

At 375px the bottom tab bar is the primary nav. At larger viewports (Claude's discretion per the context doc), two clean options:

- **Option A (simplest):** Keep the bottom tab bar at all sizes. It looks slightly unusual on desktop but is familiar and functional. Good for Phase 1 where time is constrained.
- **Option B (better desktop UX):** Hide the bottom bar on `md:` and above; show a left sidebar using CSS only — no JavaScript needed. The sidebar and bottom bar share the same nav link data.

For Phase 1, Option A is recommended. The sidebar can be added in a later polish pass without touching page components.

### 375px Constraint

The tab bar at 375px must fit 5 tabs. At 375px ÷ 5 = 75px per tab. With `text-xs` (12px) and `h-5 w-5` icons (20px) this fits comfortably. If labels are too wide at 375px, abbreviate: "Demographics" → "Area", "Customers" → "Clients", "Bookings" → "Book".

---

## Dashboard Empty States

### Philosophy: Friendly, Not Alarming

Phase 1 has no booking data. The empty state must communicate "you're all set up — data will appear as you use the app" rather than implying something is broken. Per the context doc: "empty states must be friendly and non-alarming."

### Stats Cards Empty State

Use shadcn/ui `Card` components for the stats row. When no data exists, show the metric name and a neutral placeholder — not "0" (which looks like failure) and not "—" (which looks broken):

```typescript
// components/dashboard/StatsCard.tsx
interface StatsCardProps {
  title: string
  value: string | number | null
  description?: string
  icon?: React.ReactNode
}

export function StatsCard({ title, value, description, icon }: StatsCardProps) {
  const isEmpty = value === null || value === undefined
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {isEmpty ? (
          <div className="h-8 w-20 rounded bg-muted animate-pulse" />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  )
}
```

When data eventually loads and is genuinely `$0` or `0 bookings`, show the real value — the skeleton is only for the loading/no-data state. Pass `value={null}` when no data has been fetched yet, `value={0}` when the data is real.

### Upcoming Bookings Empty State

Below the stats cards, the upcoming bookings section shows a friendly prompt when the list is empty:

```typescript
// In the home page server component
{upcomingBookings.length === 0 && (
  <div className="rounded-lg border border-dashed p-6 text-center">
    <CalendarDays className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
    <p className="text-sm font-medium">No upcoming bookings yet</p>
    <p className="text-xs text-muted-foreground mt-1">
      Bookings you log will appear here
    </p>
  </div>
)}
```

The dashed border is a shadcn/ui convention for empty/droppable areas. It signals "this area will have content" without implying an error.

### Next-Action Prompt (Calendar-Aware)

This prompt is always visible — it is not an empty state, it is a computed message based on the current date relative to the booking window (opens 1st of each month at 9am CST):

```typescript
// lib/booking-window.ts
export function getNextActionPrompt(): { message: string; urgency: 'low' | 'medium' | 'high' } {
  const now = new Date()
  // Convert to CST (UTC-6, or UTC-5 during CDT)
  const cst = new Date(now.toLocaleString('en-US', { timeZone: 'America/Chicago' }))
  const dayOfMonth = cst.getDate()
  const daysUntilFirst = dayOfMonth === 1 ? 0 : 32 - dayOfMonth  // simplified; use date-fns for accuracy

  if (dayOfMonth === 1 && cst.getHours() < 9) {
    return { message: "Booking window opens today at 9am CST — get ready!", urgency: 'high' }
  }
  if (dayOfMonth === 1) {
    return { message: "Booking window is open now — check your inquiries", urgency: 'high' }
  }
  if (daysUntilFirst <= 5) {
    return { message: `Booking window opens in ${daysUntilFirst} days — plan your campaign`, urgency: 'medium' }
  }
  return { message: `Next booking window opens in ${daysUntilFirst} days`, urgency: 'low' }
}
```

Use `date-fns` or `date-fns-tz` for accurate timezone-aware date math. Do not compute CST offset manually — daylight saving time makes it wrong half the year. `date-fns-tz` is already well-supported in Next.js 15.

The prompt renders as a `Card` or alert-style component above or below the stats row. Color it based on urgency: `urgency: 'high'` gets a warm accent background, `'low'` is neutral/muted.

### Stat Card Loading Skeletons vs. Spinners

For the initial page load (server component fetching from Supabase), use the skeleton approach shown above — inline pulsing placeholder boxes. This avoids layout shift and feels more polished than a spinner. The shadcn/ui `Skeleton` component handles this:

```typescript
import { Skeleton } from '@/components/ui/skeleton'
// In the card: <Skeleton className="h-8 w-24" />
```

Use React `Suspense` with a skeleton fallback for the stats cards section if the data fetch is slow. The `(dashboard)/page.tsx` can be a Server Component that `await`s the Supabase query — no spinner needed at all when data is fast, and the skeleton shows via Suspense when it's slow.

---

## Password Reset with Resend

### How Supabase Auth Password Reset Works

Supabase Auth handles the password reset flow end-to-end:

1. Owner enters email at `/reset-password` → app calls `supabase.auth.resetPasswordForEmail(email, { redirectTo })`
2. Supabase sends a recovery email with a one-time link containing a token
3. Owner clicks link → browser lands on the `redirectTo` URL with `#access_token=...&type=recovery` in the hash
4. The page at `redirectTo` (e.g., `/update-password`) exchanges the token for a session and shows a "set new password" form
5. Owner submits new password → `supabase.auth.updateUser({ password: newPassword })`

### Resend as the SMTP Provider

Supabase supports custom SMTP. The integration with Resend:

**Step 1: Resend setup**
- Create a free Resend account at resend.com (free tier: 3,000 emails/month, 100/day — far more than needed for 2 users)
- Add and verify the sending domain (e.g., `littleroyaltyspa.com`) via DNS records
- Create an API key

**Step 2: Configure Supabase to use Resend SMTP**
In Supabase project dashboard → `Authentication → Email → SMTP Settings`:
- Enable custom SMTP
- SMTP host: `smtp.resend.com`
- Port: `465` (SSL) or `587` (TLS)
- Username: `resend`
- Password: (the Resend API key)
- Sender email: `noreply@littleroyaltyspa.com`
- Sender name: `Little Royalty Spa`

This is entirely configuration — no code changes required. Supabase will now send all auth emails (password reset, invite, email change) through Resend.

**Step 3: Configure the redirect URL**
When calling `resetPasswordForEmail`, pass the `redirectTo` URL:
```typescript
await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/update-password`,
})
```
`NEXT_PUBLIC_SITE_URL` should be `https://yourdomain.com` in production and `http://localhost:3000` in dev. Also add this URL to `Authentication → URL Configuration → Redirect URLs` in the Supabase dashboard.

**Step 4: The update-password page**
The `/update-password` route needs to handle the Supabase hash fragment on the client side. Use the `@supabase/ssr` browser client:

```typescript
// app/(auth)/update-password/page.tsx — simplified
"use client"
// On mount, Supabase's onAuthStateChange fires with event 'PASSWORD_RECOVERY'
// which establishes a temporary session from the token in the URL hash.
// Then the user can call supabase.auth.updateUser({ password }) to set the new password.
```

The token exchange from the URL hash fragment is handled automatically by the Supabase browser client when the page loads — no manual hash parsing needed.

### Supabase Auth Email Templates

Supabase provides default email templates for password reset. These can be customized in `Authentication → Email Templates → Reset Password`. For Phase 1, the defaults are fine. A branded template (Little Royalty Spa logo, pink accent) is a polish item for a later phase.

### Local Dev: Email Testing

In local development, Supabase's local instance (via `supabase start`) includes Inbucket — a local email capture server at `http://localhost:54324`. All auth emails sent during local dev appear there instead of being delivered. No Resend setup is needed for local dev.

---

## Key Decisions for Planner

- **Use `@supabase/ssr` (not the legacy `@supabase/auth-helpers-nextjs`)** — the auth-helpers package is deprecated. All new Next.js + Supabase integrations use `@supabase/ssr`.

- **Middleware is required and must return the `supabaseResponse` object** — not a new `NextResponse`. This is the single most common Supabase + Next.js bug. Document it as a code review checkpoint.

- **Always call `getUser()` in middleware, never `getSession()`** — `getSession()` does not validate the JWT server-side and is unsafe for route protection.

- **Seed accounts via Supabase Admin API script or Supabase Dashboard invite** — no signup page should exist in the deployed app.

- **Use `SUPABASE_SERVICE_ROLE_KEY` only in server-side scripts and Vercel environment variables; never in `NEXT_PUBLIC_*` variables** — the service role key bypasses Row Level Security.

- **Use `date-fns-tz` for the booking window prompt** — computing CST offset manually breaks on daylight saving transitions.

- **Bottom tab bar: 5 tabs at 375px is viable** — keep labels short. "Area" instead of "Demographics", "Book" or "Bookings" abbreviated if needed.

- **Stats cards: use `null` for no-data state (show skeleton), `0` for real zero data** — prevents misleading zero values before data is fetched.

- **Password reset redirect URL must be in Supabase's allowed redirect list** — add both `localhost:3000` and the production domain before testing.

- **Resend free tier (3,000/month) is more than sufficient** — no paid tier needed for 2 users. Domain verification DNS records need to be set before first send.

- **Use Tailwind `pb-16` on the main content area** to prevent content hiding behind the fixed bottom tab bar.

- **Use `(auth)` and `(dashboard)` route groups** — keeps auth pages outside the protected layout without extra URL segments.

- **The next-action prompt is always rendered (calendar-aware), not an empty state** — it should be the first thing visible even on Day 1 with no booking data.

---

## Pitfalls to Avoid

**Auth cookie not refreshing:** If the middleware returns a `new NextResponse(...)` instead of the `supabaseResponse` object, session cookies are silently dropped on every request. Sessions appear to expire after one hour even with rolling refresh configured.

**`getSession()` in middleware:** Using `getSession()` instead of `getUser()` for route protection returns a locally cached, unvalidated session. A tampered or expired token passes the guard.

**Service role key in client-side code:** If `SUPABASE_SERVICE_ROLE_KEY` ends up in a `NEXT_PUBLIC_*` variable, it is exposed to the browser and bypasses all Row Level Security. Verify this before first deploy.

**Supabase project for local dev vs. production:** Using the production Supabase project during development means seeding test data into the live database. Create a separate Supabase project for development (the free tier allows 2 projects) or use `supabase start` for a local instance.

**Tailwind v4 config mismatch with shadcn:** If the project was scaffolded with Tailwind v3 config but Tailwind v4 is installed, the CSS variable names and `@theme` syntax will not match. Run `npx shadcn@latest init` after installing Tailwind v4 — do not manually migrate a v3 config.

**Bottom tab bar hidden by soft keyboard on mobile:** On iOS/Android, when the soft keyboard opens, `position: fixed` elements sometimes scroll off-screen. Test the login form and any bottom-nav interaction with the keyboard open on a real device. The solution is usually `env(safe-area-inset-bottom)` padding on iOS.

**`redirectTo` URL not in Supabase's allowed list:** Password reset emails will send but the link will fail to redirect back to the app. Add all redirect URLs (localhost + production) to `Authentication → URL Configuration` before testing the reset flow.

**Booking window prompt using server time without timezone:** Computing "days until the 1st" using UTC `new Date()` on the server gives the wrong day for CST users. The booking window (9am CST on the 1st) must be computed in `America/Chicago` timezone. Use `date-fns-tz`'s `toZonedTime` function.

**Stats cards showing `$0 revenue` before any bookings are logged:** If `value={0}` is passed before data has been fetched (because a default value is set), it looks like the month has zero revenue. Initialize stats as `null` (not `0`) until a real server response confirms the value.

---

*Research compiled: 2026-04-13. Based on Supabase and Next.js ecosystem state as of mid-2025.*
