---
phase: 01-scaffold-auth
fixed_at: 2026-04-14T00:00:00Z
review_path: .planning/phases/01-scaffold-auth/01-REVIEW.md
iteration: 1
findings_in_scope: 3
fixed: 3
skipped: 0
status: all_fixed
---

# Phase 01: Code Review Fix Report

**Fixed at:** 2026-04-14
**Source review:** .planning/phases/01-scaffold-auth/01-REVIEW.md
**Iteration:** 1

**Summary:**
- Findings in scope: 3
- Fixed: 3
- Skipped: 0

## Fixed Issues

### WR-01: Stale closure causes invalid-link screen to always fire after 5 seconds

**Files modified:** `src/app/(auth)/update-password/page.tsx`
**Commit:** 15150cd
**Applied fix:** Added `useRef` to the React import and introduced `recoveryReadyRef = useRef(false)`. The `onAuthStateChange` handler now sets both `recoveryReadyRef.current = true` and calls `setRecoveryReady(true)`. The `setTimeout` callback reads from `recoveryReadyRef.current` instead of the stale `recoveryReady` state variable. Removed the now-unnecessary `eslint-disable-next-line react-hooks/exhaustive-deps` comment since the dependency array is intentionally empty and the ref avoids the closure issue cleanly.

### WR-02: Password update does not sign out the current session before redirecting to login

**Files modified:** `src/app/(auth)/update-password/page.tsx`
**Commit:** 15150cd
**Applied fix:** Added `await supabase.auth.signOut()` immediately after the success toast and before `router.push('/login')` in the `handleSubmit` function. This ensures the recovery session is explicitly invalidated before the user is redirected to the login page.

### WR-03: `console.error` leaks auth error details to the browser console in production

**Files modified:** `src/app/(auth)/reset-password/page.tsx`
**Commit:** f5cd3ae
**Applied fix:** Wrapped the existing `console.error('Password reset error:', error.message)` call inside a `process.env.NODE_ENV !== 'production'` guard. The log is retained for local development convenience but is suppressed in production builds, preventing internal error details from being visible in browser DevTools during enumeration attempts.

---

_Fixed: 2026-04-14_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
