# Research Summary
## Little Royalty Spa — Business Dashboard

*Synthesized from STACK.md, FEATURES.md, ARCHITECTURE.md, PITFALLS.md — 2026-04-13*

---

## Recommended Stack

- **Next.js 15 (App Router) + TypeScript** — single repo for frontend and API routes; one deploy, one bill, one thing to debug. No separate backend server.
- **Supabase (Postgres) + Prisma ORM** — free tier covers this workload indefinitely; Prisma provides typed queries and the schema doubles as data-model documentation. Supabase Auth (email + password) handles login for two users with zero added infrastructure.
- **Tailwind CSS v4 + shadcn/ui + recharts** — responsive by default, accessible components owned in-repo (restyled for the pink/princess brand), and a simple charting API for revenue dashboards.
- **OpenAI GPT-4o via Vercel AI SDK** — best price-to-quality for creative marketing copy; streaming responses via `useCompletion`; ~$5/month at this usage level. Provider can be swapped in one line.
- **Vercel (Hobby → Pro at $20/mo) + GitHub** — zero-config Next.js deploys, HTTPS, CDN, and Cron Jobs (for demographics refresh). Total infrastructure cost: $20–45/month excluding demographics API.

**Not to use:** CRA, Gatsby, Express/Fastify (separate backend), MongoDB, Firebase, GraphQL, Redux/Zustand (not yet), native mobile apps.

---

## Table Stakes Features

*Without these the app is useless or embarrassing on day one.*

**CRM + Bookings (core data store)**
- Booking log: date, location, party size, services, add-ons (Spa in a Box), revenue — ≤8 fields, completable in under 60 seconds on a phone
- Customer profiles: name, contact, booking history, referral source, repeat flag
- Waitlist log with explicit status states (Waiting / Contacted / Converted / Removed)
- Monthly revenue summary with prior-period comparison and data-completeness indicator

**Social Planner**
- Content calendar: monthly grid of planned posts linked to booking open dates
- Post storage with platform tagging (FB / IG / TikTok) and campaign grouping
- AI caption generator with saved brand voice context — platform-specific output, not one generic post
- Hashtag suggestions (brand + niche + seasonal tiers) and one-click copy to clipboard

**Shell**
- Dashboard home screen: slots filled this month, next party in 7 days, waitlist count, upcoming campaign post, demographics alert — everything visible without navigating tabs
- Auth gate: email + password login, session cookie, both owners have individual accounts

**Demographics (Phase 1b / v2 if data source unresolved)**
- New resident / recent home purchase feed for Rockwall County ZIPs (75032, 75087, 75189, 75135)
- Service area ZIP filter and staleness indicator on every record

---

## Key Architecture Decisions

| Decision | Rationale |
|---|---|
| Single Next.js repo for frontend + API routes | No separate backend; one deployment surface; Next.js Route Handlers are sufficient at 2-user scale |
| All AI and demographics calls server-side only | API keys never reach the browser; single place to add caching and error handling |
| 24h server-side cache on demographics feed | Limits API cost; data does not change minute-to-minute |
| Supabase Auth, email + password, two individual accounts | Simplest viable auth; individual accounts give attributable audit trail; no OAuth, no 2FA, no roles in v1 |
| No auto-posting to social platforms (v1 and v2) | Eliminates Meta/TikTok OAuth complexity, token refresh, and wrong-time post risk; copy/paste is correct |
| No public-facing booking portal | Manual 1st-of-month window is a business-model feature, not a gap |
| Build Booking module first, Demographics last | Booking is the root dependency for revenue dashboard, social triggers, and AI context; demographics has an unresolved data-source cost |
| Demographics module loosely coupled | A data outage must not break the booking tracker or any other module |

**Component dependency map:**
```
Auth Shell → Navigation Shell
    ├── Booking + CRM  ← root of dependency tree
    │       └── Monthly Revenue View
    ├── Social Planner  ← reads booking dates
    │       └── AI Content Generator  (external: OpenAI API)
    └── Demographics Feed  ← independent  (external: data API + Census ACS)
```

---

## Critical Pitfalls to Avoid

1. **No free real-time new-resident API exists (D-1 — Critical):** Prototype the demographics data pipeline with actual Rockwall CAD records before writing any feed UI. Assume 30–90 day lag on public records; set a data budget ($50–150/month for ATTOM or Melissa Data). Do not build the UI against mocked data.

2. **CRM over-built = abandoned app (B-1 — Critical):** Booking entry form must have ≤8 fields and must be testable end-to-end on an actual phone with a soft keyboard open. No pipeline stages, no lead scoring, no multi-screen entry. Every "nice to have" field goes to a parking lot, not the form.

3. **Brand voice drift in AI output (C-1 — High):** Write the brand voice document (vocabulary to use/avoid, tone descriptors, 5–8 gold-standard example posts) before building the content generator. Inject it as the first section of every system prompt. Show 3 variants; let owners pick. Never show a single generic output.

4. **Forms not designed for phone entry (B-4 — High):** Design mobile-first (375px primary viewport), minimum 44px tap targets, no horizontal scroll in forms, submit button always reachable. Test on a real device before calling it done.

5. **Feature creep dilutes core value (O-3 — High):** PROJECT.md Active list is a hard contract. Every new idea goes to a parking lot backlog. Validate what ships before adding more. "Wouldn't it be cool if..." is data, not a mandate.

6. **Platform-specific content norms ignored (C-2 — High):** Force platform selection before generation. Facebook (1–3 sentences, 3–5 hashtags), Instagram (3–5 punchy lines + 10–20 hashtags), TikTok (hook in first 3 words, 1–2 sentences, 3–5 trending hashtags). One generic post copied to all three fails on all three.

7. **No graceful degradation when external services fail (O-5 — Medium):** Demographics and AI features must fail independently. A broken demographics pipeline must never affect the booking tracker. Show friendly degraded states ("Last updated [date] — will retry tonight") rather than blank screens or raw errors.

---

## Open Questions / Risks

- **Demographics data source (highest risk before Phase 3):** Which source actually returns usable Rockwall County data at an acceptable cost and lag?
  - Rockwall CAD public records: free, ~60-day lag, no official API — needs a parser
  - ATTOM Data: best-fit API, but pricing ($300–$2,000+/mo enterprise tiers) needs a trial to confirm a starter tier exists for this ZIP set
  - Melissa Data / Data Axle: per-record pricing, 2–4 week lag, terms of service constrain how contact info can be used
  - **Action required:** Run a manual prototype against Rockwall CAD before committing to any architecture for Phase 3. Set an explicit monthly data budget with the owners before building.

- **Property transfer ≠ family with young children (D-2):** Raw deed transfers include retirees, investors, and single households. Label the feed as "Recent Property Transfers," not "Qualified Leads." Demographic overlay filtering (children under 12 present) is a Phase 2 enhancement if the data source supports it.

- **Vercel Hobby vs. Pro:** Hobby plan ToS prohibits commercial use. Use Pro ($20/mo) from launch.

- **Supabase free tier 2-project limit:** One project for production, one for dev/staging. Do not create more or new environments will be blocked.

- **Prisma + Supabase serverless connection pooler:** Must configure PgBouncer at project init — one config line, but cannot be deferred.

- **OpenAI API key hygiene:** Key lives in server-side environment variables only. Set up GitHub secret scanning before the first push.

---

## Build Order Recommendation

### Phase 0 — Scaffold (1–2 days)
- Repo, GitHub, Vercel deploy pipeline live at a real URL
- Supabase project + Prisma schema initialized, PgBouncer configured
- Auth shell: login page, session handling, route protection
- Responsive navigation shell: sidebar (desktop) + bottom tab bar (mobile)

*Exit criteria: both owners can log in on their phones. Nothing else works yet.*

### Phase 1 — Booking + CRM (1–2 weeks)
- Booking tracker: create / list / edit — ≤8 fields, phone-first design, revenue required field
- Customer profiles: linked to bookings, auto-create or select existing
- Waitlist: intake form + status-managed list (Waiting / Contacted / Converted / Removed)
- Monthly revenue dashboard: aggregate from bookings, empty-state UX for first 4–6 weeks

*Exit criteria: owners can run the entire booking business from the app. Every later feature is an enhancement.*

### Phase 2 — Social Planner + AI Content (1 week)
- Brand voice document finalized (prerequisite — must precede any AI prompt code)
- Campaign calendar: create / list posts with platform tag, status, campaign grouping
- AI content generator: brand-voice system prompt + platform-specific output + 3-variant display + one-click copy
- Holiday/event prompt library and booking-linked campaign triggers

*Exit criteria: owners can plan a month of content and copy AI-generated captions in one session.*

### Phase 3 — Demographics Feed (1 week, after data source validated)
- Prerequisite: data pipeline prototype with real Rockwall CAD or trial API data — confirm format, lag, and useful fields before writing any UI
- Server-side fetch + 24h cache + last-updated timestamp displayed in UI
- Scrollable feed: address, transfer date, neighborhood, staleness indicator
- Service area ZIP filter
- Graceful degradation: feed failure must not affect Phases 1–2

*Exit criteria: owners can find new-mover records and copy contact info for outreach. Feed shows real data, not mocks.*

### Phase 4 — Polish + Iteration (based on validated daily use)
- Mobile UX refinement from real use
- Prospect notes on demographics records (mark "contacted," add note)
- Waitlist-to-booking single-action conversion button
- Neighborhood family density heatmap (Census ACS — free, no legal complexity)
- Revenue per booking type / upsell breakdown
- "Hot ZIP" alert when a ZIP shows a spike in new transfers

---

*Every line in this document should drive a build decision. If it does not, it does not belong here.*
