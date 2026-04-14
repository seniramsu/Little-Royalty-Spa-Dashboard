# Phase 1: Scaffold + Auth — Context

**Gathered:** 2026-04-13
**Status:** Ready for planning
**Source:** discuss-phase (interactive)

<domain>
## Phase Boundary

Deployable web app with auth (login, password reset, two accounts) and home dashboard shell. Both owners can log in on phone and see at-a-glance stats, upcoming bookings, and contextual next-action prompt. No booking or CRM data exists yet — dashboard uses empty/placeholder states.

</domain>

<decisions>
## Implementation Decisions

### Navigation
- **Bottom tab bar** — Fixed tabs at the bottom of the screen. Thumb-friendly on mobile, familiar pattern. Tabs: Home, Bookings, Customers, Social, Demographics (or simplified grouping).
- Navigation should be consistent on phone. Desktop can keep bottom tabs or shift to a sidebar — Claude's discretion for responsive behavior.

### Brand / Visual Style
- **Functional first** — Minimal styling for Phase 1. No pink gradients, no crown icons, no heavy theming. Clean, readable UI. Brand polish (colors, accents, royalty theme) is deferred to a later phase.
- Exception: Logo on the login screen. Owner has a real logo file they will provide — use a styled text placeholder (`Little Royalty Spa`) for now; make it easy to swap in the real logo.

### Dashboard Layout
- **Stats cards at top** — Monthly revenue, booking count, and waitlist size are the first things visible on the home screen.
- Below stats: upcoming bookings list (next 1-3 parties) + booking window countdown/prompt.
- Contextual next-action prompt appears below or adjacent to stats — e.g., "Booking opens in 3 days — plan your campaign."
- Empty states must be friendly and non-alarming (this is Phase 1, there's no data yet).

### Auth
- Email + password only. No OAuth, no magic links, no 2FA.
- Two accounts: one per owner. No account creation flow needed (accounts seeded or created via setup).
- Password reset via email link (use Resend on free tier per research).
- Session: 30-day rolling expiry (per architecture research). HttpOnly cookies.

### Claude's Discretion
- Exact tab labels and icon choices
- Specific shadcn/ui component choices
- Loading skeleton vs spinner for dashboard stats
- Exact empty state copy
- Desktop responsive behavior for bottom nav
- Whether to use Supabase Auth session directly or wrap with middleware

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project context
- `.planning/PROJECT.md` — Business description, brand, constraints
- `.planning/REQUIREMENTS.md` — AUTH-01–03, DASH-01–03 (Phase 1 scope)
- `.planning/ROADMAP.md` — Phase 1 goal and success criteria

### Research
- `.planning/research/STACK.md` — Next.js 15, Supabase Auth, shadcn/ui, Tailwind, Vercel
- `.planning/research/ARCHITECTURE.md` — Auth approach, component boundaries, build order
- `.planning/research/PITFALLS.md` — Over-engineering risks, mobile-first requirements

</canonical_refs>

<specifics>
## Specific Details

- Owner will provide a logo file — use `Little Royalty Spa` styled text as placeholder, clearly marked for swap.
- Dashboard stats: revenue (current month), booking count (current month), waitlist size.
- Booking window: opens 1st of each month at 9am CST for the following month.
- Next-action prompt should be calendar-aware: compute days until next 1st, surface the right message.
- App must work at 375px width with no horizontal scroll.

</specifics>

<deferred>
## Deferred Ideas

- Brand theming (pink/rose palette, crown accents, princess feel) — deferred to later phase
- Logo swap (real logo file from owner) — placeholder in Phase 1, swap when file is provided
- Desktop sidebar nav — Phase 1 uses bottom tabs; desktop behavior is Claude's discretion for now

</deferred>

---

*Phase: 01-scaffold-auth*
*Context gathered: 2026-04-13 via discuss-phase*
