# Plan 3: Home Dashboard Shell

**Phase:** 1 — Scaffold + Auth
**Requirements covered:** DASH-01, DASH-02, DASH-03
**Estimated complexity:** Low

## Goal
Build the home dashboard page with stats cards (revenue, booking count, waitlist — all empty states), an upcoming bookings section (empty state), and a calendar-aware next-action prompt computed in `America/Chicago` using `date-fns-tz`. This closes out Phase 1 success criteria: both owners can log in and see the at-a-glance summary on their phones.

## Prerequisites
- Plan 1 complete (app shell, bottom tab bar, shadcn components available)
- Plan 2 complete (auth + middleware protects `/`)

## Tasks

### Task 1: Install date utilities
**What:** Add `date-fns` and `date-fns-tz` for timezone-aware date math.
**How:**
- `pnpm add date-fns date-fns-tz`
- Confirm both work in Server Components (they should — pure JS)
**Done when:** Imports work in a server-rendered page without runtime errors.

### Task 2: Booking window / next-action utility
**What:** Create a pure function that, given a `Date`, returns the next booking window state (days until the next 1st-of-month 9am CST) plus a message + urgency tier.
**How:**
- Create `src/lib/booking-window.ts` exporting `getNextActionPrompt(now: Date = new Date())`
- Use `date-fns-tz` `toZonedTime` to convert `now` to `America/Chicago`
- Compute the next occurrence of the 1st of next month at 09:00 CST; if today is the 1st and current CST hour < 9, target today 09:00
- Compute `daysUntil` via `differenceInCalendarDays` against the zoned "today"
- Return `{ message, urgency }` matching the research doc's tiers:
  - Day 1, before 9am CST: "Booking window opens today at 9am CST — get ready!" (high)
  - Day 1, after 9am CST: "Booking window is open now — check your inquiries" (high)
  - `daysUntil <= 5`: "Booking window opens in N days — plan your campaign" (medium)
  - else: "Next booking window opens in N days" (low)
- Add a small unit test (or a one-off Node script) exercising a few fixed dates including a DST transition to confirm the CST math
**Done when:** Calling the function with mocked dates returns expected messages; DST boundary dates do not drift.

### Task 3: StatsCard component with skeleton empty state
**What:** Reusable card that shows a metric; when `value === null`, renders a pulsing skeleton instead of the number.
**How:**
- Create `src/components/dashboard/StatsCard.tsx` taking `{ title, value, description?, icon? }`
- Use shadcn `Card`, `CardHeader`, `CardTitle`, `CardContent`
- When `value == null`, render `<Skeleton className="h-8 w-24" />`; otherwise render the formatted value (string or number)
- Ensure the card renders correctly in a 2-column grid at 375px and a 3-column grid at `sm:` and above
**Done when:** Rendering `<StatsCard title="Revenue" value={null} />` shows a skeleton; `value={1234}` shows the number.

### Task 4: UpcomingBookings section (empty state)
**What:** Component that renders either a list of bookings or a friendly empty state.
**How:**
- Create `src/components/dashboard/UpcomingBookings.tsx` taking `{ bookings: Array<{...}> }` (type is a placeholder interface for now)
- When `bookings.length === 0`, render a dashed-border card with `CalendarDays` icon, "No upcoming bookings yet" heading, and muted sub-copy "Bookings you log will appear here"
- When non-empty (Phase 2+), render a simple list — but for Phase 1 we only exercise the empty branch
**Done when:** Component renders the empty state inside the home page at 375px without horizontal scroll.

### Task 5: NextActionPrompt component
**What:** Card-style component that displays the message from `getNextActionPrompt()` with urgency-based styling.
**How:**
- Create `src/components/dashboard/NextActionPrompt.tsx` as a Server Component that calls `getNextActionPrompt()` directly
- Render a shadcn `Card` with different background accents per urgency (`high` → accent, `medium` → muted accent, `low` → neutral) — keep styling minimal per "functional first" context decision
- Include a short label like "Next action" above the message
**Done when:** Component renders the correct message for today's date in CST.

### Task 6: Assemble the home page
**What:** Wire all pieces into `(dashboard)/page.tsx` so the route shows prompt + stats + upcoming bookings.
**How:**
- Convert `src/app/(dashboard)/page.tsx` to an async Server Component
- Layout top-to-bottom: `<NextActionPrompt />`, stats grid (`<StatsCard>` x3 — Revenue, Bookings, Waitlist — all with `value={null}` for Phase 1), `<UpcomingBookings bookings={[]} />`
- Add a simple greeting header with the logged-in owner's email (fetch via server Supabase client + `getUser()`)
- Confirm vertical scroll works and nothing is hidden behind the bottom tab bar (rely on `pb-16` from the dashboard layout)
- Test at 375px width: stats stack into 2 columns, no horizontal scroll
**Done when:** Visiting `/` shows all three sections cleanly on a 375px viewport for an authenticated user.

### Task 7: Accessibility + responsive polish
**What:** Quick pass for semantic HTML and keyboard accessibility.
**How:**
- Ensure headings use proper hierarchy (h1 greeting, h2 section headings)
- Ensure the next-action prompt has a descriptive accessible label
- Confirm focus outlines are visible on interactive elements (shadcn defaults are fine)
- Test one full flow on a real phone or Chrome device emulation
**Done when:** No obvious a11y regressions; layout holds on 375px and desktop.

## Verification
- [ ] `/` shows the next-action prompt with today's correct days-until-next-1st message
- [ ] Stats cards render skeletons (not `$0` or `—`) before any real data exists
- [ ] Upcoming bookings section shows the dashed-border empty state
- [ ] Logged-in owner sees their email/greeting
- [ ] Home screen works at 375px width with no horizontal scroll and nothing hidden behind the bottom tab bar
- [ ] Manually tested `getNextActionPrompt` on a DST-transition date (e.g. 2026-03-08 and 2026-11-01) — messages are still correct
- [ ] Deployed version renders the same on the Vercel URL

## Files Created/Modified
- `package.json` — add `date-fns`, `date-fns-tz`
- `src/lib/booking-window.ts` — `getNextActionPrompt()` utility
- `src/components/dashboard/StatsCard.tsx` — stats card with skeleton empty state
- `src/components/dashboard/UpcomingBookings.tsx` — list + empty state
- `src/components/dashboard/NextActionPrompt.tsx` — calendar-aware prompt
- `src/app/(dashboard)/page.tsx` — home page assembling prompt, stats, upcoming bookings, greeting
- (optional) `src/lib/booking-window.test.ts` — unit tests for DST + day-of-month edge cases
