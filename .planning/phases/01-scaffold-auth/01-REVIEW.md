---
phase: 01-scaffold-auth
reviewed: 2026-04-14T00:00:00Z
depth: standard
files_reviewed: 24
files_reviewed_list:
  - .env.example
  - middleware.ts
  - package.json
  - README.md
  - scripts/seed-auth.ts
  - src/app/(auth)/login/page.tsx
  - src/app/(auth)/reset-password/page.tsx
  - src/app/(auth)/update-password/page.tsx
  - src/app/(dashboard)/bookings/page.tsx
  - src/app/(dashboard)/customers/page.tsx
  - src/app/(dashboard)/demographics/page.tsx
  - src/app/(dashboard)/layout.tsx
  - src/app/(dashboard)/page.tsx
  - src/app/(dashboard)/social/page.tsx
  - src/app/layout.tsx
  - src/components/auth/SignOutButton.tsx
  - src/components/dashboard/NextActionPrompt.tsx
  - src/components/dashboard/StatsCard.tsx
  - src/components/dashboard/UpcomingBookings.tsx
  - src/components/nav/BottomTabBar.tsx
  - src/lib/booking-window.test.ts
  - src/lib/booking-window.ts
  - src/lib/supabase/client.ts
  - src/lib/supabase/server.ts
findings:
  critical: 0
  warning: 3
  info: 3
  total: 6
status: issues_found
---

# Phase 01: Code Review Report

**Reviewed:** 2026-04-14
**Depth:** standard
**Files Reviewed:** 24
**Status:** issues_found

## Summary

Phase 1 delivers a clean Next.js 15 App Router scaffold with Supabase Auth (email/password, HttpOnly cookies), a protected dashboard shell, a bottom tab bar, and a timezone-aware booking-window prompt. The auth middleware correctly uses `getUser()` for server-side JWT validation and preserves session cookies by returning `supabaseResponse`. The password-reset flow applies the standard user-enumeration defense (always showing a success message regardless of whether the email exists). The `booking-window` logic is well-tested and DST-aware.

Three warnings were found. The most significant is a **stale closure bug** in `update-password/page.tsx` that causes the "link expired" screen to always appear after 5 seconds, even when the password-recovery event has already been received. Two additional warnings cover missing sign-out before login-redirect after password update, and a `console.error` in `reset-password` that leaks internal error details to the browser console in production. Three info-level items cover dead code in the middleware route guard, a package manager inconsistency in a seed-script comment, and a TODO comment in login.

## Warnings

### WR-01: Stale closure causes invalid-link screen to always fire after 5 seconds

**File:** `src/app/(auth)/update-password/page.tsx:37-40`

**Issue:** The `useEffect` captures `recoveryReady` from the initial render, where it is always `false`. The `setTimeout` callback therefore always evaluates `!recoveryReady` as `true` and calls `setInvalidLink(true)` after 5 seconds — even when the `PASSWORD_RECOVERY` event already fired and `recoveryReady` was set to `true`. React state updates do not propagate into already-captured closures.

The rendered condition at line 78 (`if (invalidLink && !recoveryReady)`) partially masks the problem: if `setRecoveryReady(true)` ran before the timeout fires the `invalidLink` flag is set but the error screen is hidden. However, if the `PASSWORD_RECOVERY` event arrives slightly after the 5-second mark (slow network, slow token exchange), the error screen appears incorrectly.

**Fix:** Use a `ref` to track recovery state so the timeout closure reads the latest value, or use the functional state updater pattern with `clearTimeout` guarded by the ref:

```typescript
// Add a ref to track recovery across closure boundaries
const recoveryReadyRef = useRef(false)

useEffect(() => {
  const supabase = createClient()

  const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
    if (event === 'PASSWORD_RECOVERY') {
      recoveryReadyRef.current = true
      setRecoveryReady(true)
    }
  })

  const timeout = setTimeout(() => {
    // Read from ref — always reflects the current value
    if (!recoveryReadyRef.current) {
      setInvalidLink(true)
    }
  }, 5000)

  return () => {
    subscription.unsubscribe()
    clearTimeout(timeout)
  }
}, [])
```

---

### WR-02: Password update does not sign out the current session before redirecting to login

**File:** `src/app/(auth)/update-password/page.tsx:73-75`

**Issue:** After a successful `supabase.auth.updateUser({ password })`, the code immediately calls `router.push('/login')` without signing out first. Supabase may or may not invalidate the recovery session on password update depending on configuration. If the session remains active, the user lands on `/login`, which then redirects back to `/` because middleware sees a valid session. The redirect loop resolves itself only if the middleware redirect fires, but the user experience is confusing (flash of the dashboard before landing on login). More importantly, if session invalidation is not enforced, the recovery token's session persists and could be reused.

**Fix:** Sign out explicitly before redirecting:

```typescript
const { error } = await supabase.auth.updateUser({ password })

if (error) {
  toast.error(error.message)
  setLoading(false)
  return
}

toast.success('Password updated — please sign in with your new password')
await supabase.auth.signOut()
router.push('/login')
```

---

### WR-03: `console.error` leaks auth error details to the browser console in production

**File:** `src/app/(auth)/reset-password/page.tsx:28`

**Issue:** The comment accurately states "log for debugging but show generic message to avoid leaking whether the email is registered." However, `console.error(error.message)` is still executed in production builds. Browser console output is visible to anyone with DevTools open and can reveal internal error types (e.g., network failure vs. rate-limit vs. unknown address) that inform enumeration attacks.

**Fix:** Either remove the log entirely (the user-facing message is already generic), or gate it behind a development check:

```typescript
// Option A: remove entirely — the toast fallback already shows nothing sensitive
// Option B: dev-only logging
if (process.env.NODE_ENV !== 'production') {
  console.error('Password reset error:', error.message)
}
```

---

## Info

### IN-01: Redundant exact-match + `startsWith` checks in middleware route guard

**File:** `middleware.ts:47-53`

**Issue:** Each auth route is checked twice — once with `===` and once with `startsWith` using the identical string. The `===` check is always a subset of `startsWith`, making it dead code. For example, `pathname === '/login'` is always `true` when `pathname.startsWith('/login')` is `true` and the path is exactly `/login`, but the `startsWith` check alone covers that case.

```typescript
// Current (redundant)
const isAuthRoute =
  pathname === '/login' ||
  pathname.startsWith('/login') ||
  pathname === '/reset-password' ||
  pathname.startsWith('/reset-password') ||
  pathname === '/update-password' ||
  pathname.startsWith('/update-password')
```

**Fix:** Remove the redundant exact-equality checks:

```typescript
const isAuthRoute =
  pathname.startsWith('/login') ||
  pathname.startsWith('/reset-password') ||
  pathname.startsWith('/update-password')
```

---

### IN-02: Seed script comment references `pnpm` but project uses `npm`

**File:** `scripts/seed-auth.ts:6`

**Issue:** The JSDoc comment on line 6 says `pnpm seed:auth` but `package.json` defines the script under `npm run seed:auth`. The README also uses `npm run seed:auth`. This is a minor inconsistency that could cause confusion during setup.

**Fix:** Update the comment to match the package manager in use:

```typescript
// Run once locally AFTER setting up your Supabase project:
//   npm run seed:auth
```

---

### IN-03: TODO comment left in login page

**File:** `src/app/(auth)/login/page.tsx:42`

**Issue:** A `TODO: swap for logo image` comment remains in the production source. This is a planned placeholder and acceptable for Phase 1, but it should be tracked as a known item.

**Fix:** No immediate action required — this is an expected Phase 1 placeholder. Remove when the logo asset is provided.

---

_Reviewed: 2026-04-14_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
