---
phase: 01-scaffold-auth
plan: "03"
subsystem: dashboard
tags: [dashboard, date-fns-tz, stats-cards, empty-state, booking-window, a11y, nextjs]

requires:
  - 01-01 (Next.js scaffold, route groups, shadcn/ui, date-fns + date-fns-tz already installed)
  - 01-02 (Auth + middleware: server Supabase client, getUser(), route guard)
provides:
  - getNextActionPrompt() — DST-aware CST booking window utility (date-fns-tz)
  - StatsCard component with null=skeleton / value=real-data pattern
  - UpcomingBookings component with friendly dashed-border empty state
  - NextActionPrompt server component with urgency-based card styling
  - Assembled home dashboard page (greeting, prompt, stats grid, bookings)
affects: [02-bookings-crm]

tech-stack:
  added: []
  patterns:
    - date-fns-tz toZonedTime for America/Chicago timezone math (DST-safe)
    - null vs 0 distinction for stats cards — null=skeleton, 0=real zero
    - Server Component calling getNextActionPrompt() directly (pure function, no client needed)
    - Urgency tier pattern: high/medium/low drives styling without brand colors
    - aria-labelledby on sections with visible h2 headings
    - aria-current="page" on active BottomTabBar link

key-files:
  created:
    - src/lib/booking-window.ts
    - src/lib/booking-window.test.ts
    - src/components/dashboard/StatsCard.tsx
    - src/components/dashboard/UpcomingBookings.tsx
    - src/components/dashboard/NextActionPrompt.tsx
  modified:
    - src/app/(dashboard)/page.tsx

key-decisions:
  - "Task 1 (install date-fns/date-fns-tz) skipped — Plan 01 already installed both packages"
  - "NextActionPrompt is a pure Server Component — no client state needed; getNextActionPrompt() is a pure function"
  - "Stats cards use value=null for all Phase 1 slots — no misleading zeros before data exists"
  - "Urgency styling uses orange/yellow/muted — minimal, functional; pink/rose brand colors deferred to later phase"
  - "UpcomingBookings includes a non-empty list branch — wired in Phase 2, exercised only as empty state in Phase 1"

requirements-completed: [DASH-01, DASH-02, DASH-03]

duration: ~20min
completed: 2026-04-14
---

# Phase 1 Plan 3: Home Dashboard Shell Summary

**DST-aware booking window utility, stats cards with null-skeleton pattern, and fully assembled home dashboard page with greeting, next-action prompt, stats grid, and empty bookings section**

## Performance

- **Duration:** ~20 min
- **Completed:** 2026-04-14
- **Tasks:** 7 of 7 complete (Task 1 pre-completed by Plan 01)
- **Files:** 5 created, 1 modified

## Accomplishments

- `src/lib/booking-window.ts`: `getNextActionPrompt(now?)` uses `date-fns-tz` `toZonedTime` to convert to `America/Chicago`, handles CDT/CST automatically. Returns `{ message, urgency }` for 4 tiers: window open, opens today, opens in ≤5 days, opens in N days. Singular/plural "day/days" handled.
- `src/lib/booking-window.test.ts`: 9 test cases including DST spring-forward (March 1, March 8) and fall-back (Nov 1) boundaries — all passing via `npx tsx`.
- `src/components/dashboard/StatsCard.tsx`: Accepts `value: string | number | null`. `null` renders `<Skeleton className="h-8 w-24" />` with `aria-label`. Real values render at `text-2xl font-bold`. Optional `description` and `icon` props.
- `src/components/dashboard/UpcomingBookings.tsx`: Empty state renders dashed-border card with `CalendarDays` icon and "No upcoming bookings yet" copy. Non-empty branch renders a list (Phase 2+). Placeholder `Booking` interface ready for schema.
- `src/components/dashboard/NextActionPrompt.tsx`: Server Component, calls `getNextActionPrompt()` on render. Card background: orange (high), yellow (medium), muted (low). Minimal styling — brand colors deferred.
- `src/app/(dashboard)/page.tsx`: Async Server Component. Fetches `user.email` via `createClient().auth.getUser()` for greeting. Layout: h1 greeting → NextActionPrompt → stats grid (2-col mobile / 3-col sm+, all `value={null}`) → UpcomingBookings empty state.
- Build: `next build` passes cleanly. TypeScript: `tsc --noEmit` clean.
- A11y: h1 (page) → h2 (section) hierarchy; `aria-labelledby` on stats and bookings sections; `aria-current="page"` on active nav link; `aria-hidden` on decorative icons; skeleton has `aria-label`.

## Task Commits

1. **Task 1: Install date utilities** — Pre-completed by Plan 01 (skipped)
2. **Task 2: Booking window utility** — `10463e1`
3. **Task 3: StatsCard component** — `8e3bf5f`
4. **Task 4: UpcomingBookings component** — `d2b0bb3`
5. **Task 5: NextActionPrompt component** — `4a50dc2`
6. **Task 6: Assemble home page** — `2b0c792`
7. **Task 7: A11y + responsive polish** — No code changes required (built correctly in Tasks 3-6)

## Deviations from Plan

### Skipped Tasks (Pre-completed)

**Task 1 — Install date utilities:** `date-fns` and `date-fns-tz` were already installed in Plan 01 (`date-fns@^4.1.0`, `date-fns-tz@^3.2.0` in package.json). No re-install needed.

**Task 7 — A11y + responsive polish:** No separate code commit required. All components were built with proper heading hierarchy (h1/h2), aria attributes, and shadcn focus defaults from the start. Verified with grep across all modified files.

### Auto-fixed Issues

**[Rule 1 - Bug] Fixed UTC offset in test case for May (CDT, not CST)**
- **Found during:** Task 2 test run
- **Issue:** Test case for "1st of month at 8am before window" used UTC-6 offset (CST), but May 1 is in CDT (UTC-5), so 14:00 UTC = 9am CDT, triggering "open now" instead of "opens today"
- **Fix:** Corrected test to use 13:00 UTC (8am CDT = UTC-5) — function behavior was correct, test had wrong UTC offset
- **Files modified:** `src/lib/booking-window.test.ts`

## Known Stubs

| Stub | File | Line | Reason |
|------|------|------|--------|
| `value={null}` for Revenue | `src/app/(dashboard)/page.tsx` | 55 | No booking data in Phase 1; Phase 2 will wire real Supabase queries |
| `value={null}` for Bookings | `src/app/(dashboard)/page.tsx` | 61 | Same — Phase 2 |
| `value={null}` for Waitlist | `src/app/(dashboard)/page.tsx` | 67 | Same — Phase 2 |
| `bookings={[]}` | `src/app/(dashboard)/page.tsx` | 73 | No booking table in Phase 1; Phase 2 will fetch and pass real bookings |
| `Booking` interface (placeholder) | `src/components/dashboard/UpcomingBookings.tsx` | 13 | Phase 2 will replace with DB-derived type |

These stubs are intentional for Phase 1 and do not prevent the plan's goal (at-a-glance dashboard shell visible to authenticated owners). Phase 2 (Bookings + CRM) resolves all of them.

## Self-Check: PASSED

All 6 files confirmed present on disk. All 5 commits confirmed in git history.

| Item | Status |
|------|--------|
| src/lib/booking-window.ts | FOUND |
| src/lib/booking-window.test.ts | FOUND |
| src/components/dashboard/StatsCard.tsx | FOUND |
| src/components/dashboard/UpcomingBookings.tsx | FOUND |
| src/components/dashboard/NextActionPrompt.tsx | FOUND |
| src/app/(dashboard)/page.tsx | FOUND |
| commit 10463e1 | FOUND |
| commit 8e3bf5f | FOUND |
| commit d2b0bb3 | FOUND |
| commit 4a50dc2 | FOUND |
| commit 2b0c792 | FOUND |
