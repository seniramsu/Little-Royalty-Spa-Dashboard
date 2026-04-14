---
phase: 01-scaffold-auth
plan: "02"
subsystem: auth
tags: [supabase-auth, middleware, nextjs, email-password, password-reset, seed]

requires:
  - 01-01 (Next.js scaffold, route groups, Supabase client utilities)
provides:
  - Root middleware with getUser() session refresh and route guard
  - Email/password login page (shadcn Card form, sonner toast errors)
  - SignOutButton Client Component wired into dashboard layout
  - Password reset request page (/reset-password)
  - Password update page (/update-password) with PASSWORD_RECOVERY event handling
  - Owner account seed script (Supabase Admin API, idempotent)
affects: [01-03-dashboard]

tech-stack:
  added:
    - tsx@4.21.0 (devDependency for seed script)
  patterns:
    - Middleware uses getUser() not getSession() — server-side JWT validation
    - Middleware returns supabaseResponse (not new NextResponse) — preserves cookie refresh
    - Auth routes (/login, /reset-password, /update-password) excluded from route guard
    - Browser client (createClient from lib/supabase/client.ts) for all Client Component auth calls
    - onAuthStateChange PASSWORD_RECOVERY event drives update-password form activation
    - Seed script uses service role key server-side only — never NEXT_PUBLIC_

key-files:
  created:
    - middleware.ts
    - src/components/auth/SignOutButton.tsx
    - scripts/seed-auth.ts
  modified:
    - src/app/(auth)/login/page.tsx
    - src/app/(auth)/reset-password/page.tsx
    - src/app/(auth)/update-password/page.tsx
    - src/app/(dashboard)/layout.tsx
    - src/app/layout.tsx
    - package.json
    - README.md

key-decisions:
  - "Middleware returns supabaseResponse not a new NextResponse — critical for rolling session cookie refresh"
  - "update-password page uses onAuthStateChange (not manual hash parsing) — Supabase browser client handles token exchange automatically"
  - "Password reset shows same confirmation regardless of email existence — avoids user enumeration"
  - "Task 4 (Resend SMTP) is a human action gate — documented in README and User Setup Required section"
  - "SignOutButton placed in dashboard layout header — minimal but functional for Phase 1"

requirements-completed: [AUTH-01, AUTH-02, AUTH-03]

duration: ~55min
completed: 2026-04-14
---

# Phase 1 Plan 2: Supabase Auth Integration Summary

**Email/password auth wired end-to-end: middleware route guard with getUser() session refresh, login/reset/update-password pages, SignOutButton, and an idempotent Admin API seed script for two owner accounts**

## Performance

- **Duration:** ~55 min
- **Completed:** 2026-04-14T22:28:00Z
- **Tasks:** 6 of 7 complete (Task 4: Resend SMTP is a human action gate)
- **Files modified:** 10

## Accomplishments

- `middleware.ts` at repo root: `getUser()` JWT validation, rolling session refresh, route guard redirecting unauthenticated requests to `/login`, static asset exclusion in matcher
- Login page: shadcn Card with email/password inputs, `signInWithPassword`, sonner toast on error, Forgot password link, router.push('/') + router.refresh() on success
- `SignOutButton` Client Component: `signOut()` + router.push('/login') + router.refresh() — prevents back-navigation restoring the session; rendered in dashboard layout header
- Password reset request page: email form, `resetPasswordForEmail` with `NEXT_PUBLIC_SITE_URL/update-password` redirectTo, same confirmation message for known/unknown emails
- Update-password page: `onAuthStateChange` subscription for `PASSWORD_RECOVERY` event, 5s invalid-link timeout, password match + min-length validation, `updateUser({ password })`
- Seed script: `supabase.auth.admin.createUser` for 2 owners with `email_confirm: true`, skips existing accounts, `npm run seed:auth` via tsx
- Toaster added to root layout so sonner toasts render app-wide
- README fully updated: stack, env vars, seed instructions, Resend setup steps, security notes

## Task Commits

1. **Task 1: Root middleware** — `d4db676`
2. **Task 2: Login page** — `bc41d86`
3. **Task 3: SignOutButton + dashboard layout** — `24f32a5`
4. **Task 4: Resend SMTP config** — PENDING: human action required (see User Setup Required)
5. **Task 5: Password reset request page** — `c7098c7`
6. **Task 6: Update-password page** — `759333a`
7. **Task 7: Seed script** — `9c047d7`
   - Lock file update: `8e8cd65`

## Files Created/Modified

- `middleware.ts` — Root middleware: getUser() guard, supabaseResponse return, matcher config
- `src/app/(auth)/login/page.tsx` — Full login form with logo placeholder, shadcn components, sonner errors
- `src/app/(auth)/reset-password/page.tsx` — Reset request form; no user enumeration leak
- `src/app/(auth)/update-password/page.tsx` — Recovery token handling via onAuthStateChange
- `src/components/auth/SignOutButton.tsx` — Client Component sign-out with session clear
- `src/app/(dashboard)/layout.tsx` — Added header with SignOutButton
- `src/app/layout.tsx` — Added Toaster for app-wide sonner toast support
- `scripts/seed-auth.ts` — Idempotent Admin API seed for 2 owner accounts
- `package.json` — Added seed:auth script and tsx devDependency
- `README.md` — Comprehensive setup docs: seed, Resend SMTP, deployment, security notes

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing] Toaster not in root layout**
- **Found during:** Task 2
- **Issue:** Login page uses sonner toasts but `<Toaster />` was absent from root layout — toasts would silently not render
- **Fix:** Added `import { Toaster }` and `<Toaster />` to `src/app/layout.tsx`
- **Files modified:** `src/app/layout.tsx`
- **Commit:** `bc41d86`

**2. [Rule 1 - Bug] ESLint errors in reset-password page**
- **Found during:** Task 5 build verification
- **Issue:** Unused `toast` import and unescaped apostrophes in JSX (`you'll`, `we'll`) caused `npm run build` to fail lint step
- **Fix:** Removed unused import; replaced apostrophes with `&apos;`
- **Files modified:** `src/app/(auth)/reset-password/page.tsx`
- **Commit:** `c7098c7` (fixed before commit)

## Known Stubs

None introduced by this plan. Auth pages previously stubbed (login, reset-password, update-password) are now fully implemented.

The following from Plan 01-01 remain but are not this plan's responsibility:

| File | Stub | Resolved By |
|------|------|-------------|
| `src/app/(dashboard)/page.tsx` | "Dashboard coming soon" | Plan 01-03 (dashboard) |

## User Setup Required (Task 4: Resend SMTP)

Task 4 requires dashboard configuration — no code can automate this:

### Step 1: Create Resend account
1. Sign up at [resend.com](https://resend.com) (free tier: 3,000 emails/month)
2. Add your sending domain (e.g. `littleroyaltyspa.com`) and verify via DNS records
3. Generate an API key

### Step 2: Configure Supabase SMTP
In Supabase Dashboard → Authentication → Email → SMTP Settings:
- Enable custom SMTP
- Host: `smtp.resend.com`, Port: `465`
- Username: `resend`
- Password: (your Resend API key)
- Sender email: `noreply@littleroyaltyspa.com`
- Sender name: `Little Royalty Spa`

### Step 3: Add redirect URLs
In Supabase Dashboard → Authentication → URL Configuration → Redirect URLs:
- `http://localhost:3000/update-password`
- `https://<your-vercel-url>/update-password`

### Verification
- Send a test password reset email from Supabase dashboard
- Confirm it arrives via Resend (check Resend logs at resend.com/emails)

## Threat Flags

| Flag | File | Description |
|------|------|-------------|
| threat_flag: server-side-key | scripts/seed-auth.ts | Uses SUPABASE_SERVICE_ROLE_KEY — documented as server-only, gitignored via .env.local. Script is intentionally not auto-run and requires explicit `npm run seed:auth`. |

## Self-Check: PASSED

| Item | Status |
|------|--------|
| middleware.ts | FOUND |
| src/app/(auth)/login/page.tsx | FOUND |
| src/app/(auth)/reset-password/page.tsx | FOUND |
| src/app/(auth)/update-password/page.tsx | FOUND |
| src/components/auth/SignOutButton.tsx | FOUND |
| src/app/(dashboard)/layout.tsx | FOUND |
| scripts/seed-auth.ts | FOUND |
| commit d4db676 (Task 1) | FOUND |
| commit bc41d86 (Task 2) | FOUND |
| commit 24f32a5 (Task 3) | FOUND |
| commit c7098c7 (Task 5) | FOUND |
| commit 759333a (Task 6) | FOUND |
| commit 9c047d7 (Task 7) | FOUND |

---
*Phase: 01-scaffold-auth*
*Completed: 2026-04-14*
