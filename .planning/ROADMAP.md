# Roadmap: Little Royalty Spa — Business Dashboard

## Phase 1: Scaffold + Auth
**Goal:** Deployable app with auth shell and home dashboard — both owners can log in on their phones and see the core at-a-glance summary before any other feature is built
**Requirements:** AUTH-01, AUTH-02, AUTH-03, DASH-01, DASH-02, DASH-03
**Success Criteria:**
- [ ] Both owners can log in with separate accounts from their phones and stay logged in across sessions
- [ ] Either owner can recover access via a password-reset email link
- [ ] The home screen shows upcoming bookings, next booking window date, and quick stats (revenue, count, waitlist size) without navigating to any other tab
- [ ] The home screen shows a contextual prompt (e.g. "Booking opens in 3 days — plan your campaign") that reflects the current calendar state
- [ ] The responsive navigation shell works on a 375px phone screen with no horizontal scroll

## Phase 2: Bookings + CRM + Revenue
**Goal:** Owners can run the full booking business from the app — log parties, manage customers, track the waitlist, and see monthly revenue — making every later feature an enhancement rather than a dependency
**Requirements:** BOOK-01, BOOK-02, BOOK-03, CUST-01, CUST-02, CUST-03, CUST-04, REV-01, REV-02, REV-03
**Success Criteria:**
- [ ] Owner can log a new party booking (≤8 fields) in under 60 seconds on a phone with the soft keyboard open
- [ ] Owner can view all bookings for any month in a calendar view and edit or cancel a booking without leaving the app
- [ ] Customer profiles are linked to bookings; repeat customers are automatically flagged after their second booking; referral source is recorded
- [ ] Waitlist families can be added and moved through Waiting → Contacted → Converted → Removed without extra navigation steps
- [ ] The revenue screen shows the current month's total and party count plus a month-over-month chart and a breakdown by referral source

## Phase 3: Social Planner + AI Content
**Goal:** Owners can plan a full month of social content and copy AI-generated, brand-accurate captions for each platform in a single session
**Requirements:** SOCL-01, SOCL-02, SOCL-03, SOCL-04
**Success Criteria:**
- [ ] Brand voice profile is saved and automatically injected into every AI generation — outputs feel unmistakably like Little Royalty Spa, not a generic spa
- [ ] Owner can generate 3 platform-specific caption variants (FB / IG / TikTok) for any post and copy any variant to the clipboard in one tap
- [ ] Owner can create a named campaign with multiple posts, each tagged with a date, platform, and content notes
- [ ] The pre-built booking window campaign template is available and pre-populated with the correct first-of-month framing — ready to use with minimal editing

## Phase 4: Demographics Feed
**Goal:** Owners can browse recent home purchases and new-mover records in the Rockwall County service area and import their own lists — giving them a warm outreach list without leaving the app

> **Gate:** Data pipeline must be validated with real Rockwall CAD records or a trial API before any Phase 4 UI work begins. Set a monthly data budget with the owners first.

**Requirements:** DEMO-01, DEMO-02, DEMO-03
**Success Criteria:**
- [ ] Owner can view a neighborhood heatmap of family density and income by ZIP code (Census ACS data) across the service area ZIPs
- [ ] Owner can browse a scrollable feed of recent home purchases / move-ins filtered by service area ZIP, with a staleness indicator on every record
- [ ] Owner can import a new-residents list via CSV upload when the live feed is unavailable or supplementary data is needed
- [ ] A feed outage or stale data state shows a friendly degraded message ("Last updated [date] — will retry tonight") and does not affect any Phase 1–3 functionality

---

*Roadmap created: 2026-04-13*
*Phases: 4 | v1 Requirements mapped: 23 / 23*
