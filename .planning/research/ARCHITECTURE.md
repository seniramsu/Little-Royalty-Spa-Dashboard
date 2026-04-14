# Architecture — Little Royalty Spa Dashboard

*Research document. Written 2026-04-13. Covers component boundaries, data flow,
build order, and auth approach for the v1 greenfield app.*

---

## Guiding Principle

Two non-technical owners. Demand exceeds supply. The app exists to help them fill
booking slots and grow their customer list — not to showcase technology. Every
architectural decision is filtered through: **"Is this the simplest thing that
works reliably on a phone and a laptop?"**

---

## System Boundary (What This App Is and Is Not)

```
┌──────────────────────────────────────────────────────────────┐
│                  Little Royalty Spa Dashboard                │
│                                                              │
│   Social Planner │ CRM + Bookings │ Demographics Feed        │
│                                                              │
│   ← reads/writes to a single shared database →              │
│   ← calls two external services: AI API + Demographics API → │
└──────────────────────────────────────────────────────────────┘
         │                                   │
         ▼                                   ▼
   AI content API                   Public records /
   (e.g. Claude API)                real-estate data API
   [write only — content            [read only — no PII written
    is copied out manually]          back to provider]
```

The app never auto-posts to social media and never exposes a public booking
portal. Those boundaries keep v1 achievable.

---

## Major Components

### 1. Auth Shell
Single-user gate. Both owners share one account (or each has their own — see Auth
section). Wraps every other component; nothing renders without a valid session.

### 2. Navigation / Shell Layout
Persistent sidebar (desktop) or bottom tab bar (mobile). Houses links to the four
main sections. Handles responsive breakpoints. Every feature lives inside this
shell.

### 3. Booking + CRM Module
- **Booking Tracker** — log a party: date, location, party size, services,
  add-ons (Spa in a Box), revenue.
- **Customer Profiles** — name, contact, booking history, referral source, repeat
  flag. One customer can have many bookings.
- **Waitlist** — capture inquiries from families who missed the booking window.
- **Monthly Revenue Dashboard** — derived view; reads from bookings table.

This is the core data store. Every other module either reads from it (Social
Planner can pull "upcoming slots") or is independent of it (Demographics Feed).

### 4. Social Media Planner
- **Campaign Calendar** — plan post sequences around booking openings, holidays,
  local events. Stores planned posts with date, platform, status (draft / ready /
  posted).
- **AI Content Generator** — form that collects context (campaign type, target
  date, platform, tone notes) and calls the AI API to return caption + hashtags.
  Output is displayed in a copyable text box — owner copies it into the real
  social app manually.

The planner writes and reads its own posts table. It reads upcoming booking dates
from the Booking module to pre-populate campaign prompts.

### 5. Demographics / New Resident Feed
- Pulls new homeowner and move-in data for the Rockwall County ZIP codes
  (Heath 75032, Rockwall 75032/75087, Fate 75087, Royse City 75189,
  Caddo Mills 75135).
- Displays a scrollable feed: address, estimated move-in date, neighborhood.
- Owners use this as a warm outreach list — no automated contact; they copy and
  reach out manually.
- Data is read-only; nothing from this feed is written back to any provider.
- This module is loosely coupled — it does not depend on any other module.

### 6. Shared Data Layer
A single relational database (see Tech Stack section). All modules read/write
through a server-side API layer (not direct browser-to-database calls). This
keeps credentials out of the browser and makes future changes easier.

---

## Component Dependency Map

```
Auth Shell
    └── Navigation Shell
            ├── Booking + CRM Module          ← core data store
            │       └── Monthly Revenue View  (derived from bookings)
            │
            ├── Social Planner                ← reads booking dates
            │       └── AI Content Generator  (calls external AI API)
            │
            └── Demographics Feed             ← independent; calls external data API
```

**Key dependency:** Social Planner reads upcoming booking open dates from the
Booking module to pre-fill AI prompts like "We have 3 spots open for June —
generate a post." All other cross-module dependencies are one-way and weak
(display only).

---

## Data Flow

### Booking Entry Flow
```
Owner fills booking form
    → POST /api/bookings
    → Server validates + writes to bookings table
    → Server writes/updates customer record (new or existing)
    → Monthly revenue view re-queries on next page load
```

### AI Content Generation Flow
```
Owner opens Content Generator
    → App optionally pre-fills "next open booking date" from bookings table
    → Owner adjusts inputs (platform, campaign type, notes)
    → POST /api/ai/generate  [server-side call — API key never leaves server]
    → AI API (Claude) returns caption + hashtags
    → App displays result in copyable text box
    → Owner copies text → pastes into Facebook / Instagram / TikTok manually
    → Owner optionally saves post to Campaign Calendar with status "ready"
```

### Demographics Feed Flow
```
Owner opens Demographics page
    → GET /api/demographics?zips=75032,75087,...
    → Server calls external data API (USPS / county records / Redfin-style API)
    → Server caches results (e.g. 24-hour TTL) to avoid repeated API calls
    → App renders scrollable feed
    → Owner copies address / contact info manually for outreach
```

### Auth Flow
```
Owner visits app
    → Redirected to login page if no session cookie
    → Enters email + password (or magic link)
    → Server sets signed session cookie (HttpOnly, Secure)
    → All subsequent API calls include session cookie
    → Session expires after N days of inactivity
```

---

## Suggested Build Order

Dependencies dictate order. Build the foundation first; decorative/AI features
last.

### Phase 0 — Scaffold (1–2 days)
1. Project repo and deployment pipeline (e.g. Vercel + GitHub)
2. Database provisioned (e.g. Supabase or PlanetScale free tier)
3. Auth shell — login page, session handling, route protection
4. Navigation shell — responsive layout, tab bar (mobile) + sidebar (desktop)

*Nothing works yet, but the skeleton is live at a real URL. Owners can log in.*

### Phase 1 — Booking + CRM (core value, 1–2 weeks)
5. Booking Tracker — create / list / edit bookings
6. Customer Profiles — linked to bookings; auto-create or pick existing customer
7. Waitlist — simple form + list view
8. Monthly Revenue Dashboard — aggregate query over bookings table

*Owners can now run the business from the app. Everything else is enhancement.*

### Phase 2 — Social Planner (1 week)
9. Campaign Calendar — create / list planned posts, set platform + status
10. AI Content Generator — form → server → AI API → display output
    - Keep the AI prompt server-side; expose only a thin `/api/ai/generate` endpoint

*Owners can plan content and copy AI-generated captions. No OAuth to social
platforms.*

### Phase 3 — Demographics Feed (1 week)
11. Research and select data source (USPS NCOA, county property records, or a
    real-estate API like Melissa Data or Smarty Streets)
12. Server-side fetch + 24h cache
13. Feed UI — scrollable list, address + move-in date, optional neighborhood tag

*Phase 3 is intentionally last because the data source decision (and its cost)
needs validation before building.*

### Phase 4 — Polish + Iteration (ongoing)
- Mobile UX refinement based on actual daily use
- Bookmark / save entries from demographics feed to a prospecting list in CRM
- Repeat customer detection and reminders
- Notification for next booking-open date (simple reminder)

---

## Auth Approach

**Recommendation: Email + password with a simple session cookie. No magic links,
no OAuth, no SSO for v1.**

### Rationale
- Two users. No public-facing accounts. Simplest possible system.
- Magic links require reliable email delivery infrastructure; adds complexity.
- Social login (Google) adds an OAuth dependency for a two-person internal tool.
- A hard-coded allowlist of two email addresses is an acceptable and auditable
  security model at this scale.

### Implementation
- Use an off-the-shelf auth library that handles password hashing and sessions:
  - **Next.js + NextAuth.js (Auth.js)** — if the stack is Next.js
  - **Supabase Auth** — if using Supabase as the database (built-in, free)
  - **Lucia** — lightweight, framework-agnostic alternative
- Both owners get individual email+password accounts (not a shared login) so
  activity is attributable and passwords can be changed independently.
- Session cookie: HttpOnly, Secure, SameSite=Lax, 30-day expiry with rolling
  refresh on activity.
- No role-based access control in v1 — both owners see everything.
- Password reset via email (one-time link). This requires a transactional email
  service (Resend or SendGrid free tier — both have generous free tiers).

### What to Avoid
- Do not store session tokens in localStorage (XSS risk).
- Do not build a custom password hasher — use bcrypt via the chosen auth library.
- Do not implement 2FA in v1 — adds friction for no real benefit at two users.

---

## Recommended Tech Stack (Simplicity-Weighted)

These are recommendations, not requirements. The architecture above is
stack-agnostic; these choices minimize operational complexity for a two-person
non-technical team.

| Layer | Recommendation | Why |
|---|---|---|
| Frontend framework | Next.js (React) | One repo for frontend + API routes; large community; Vercel deploy is one click |
| Styling | Tailwind CSS + shadcn/ui | Responsive by default; pre-built components; no custom CSS needed for core UI |
| Database | Supabase (Postgres) | Free tier covers this workload; built-in auth; web UI so owners can see data directly |
| Auth | Supabase Auth | Already included; email+password out of the box; no extra service |
| AI content | Claude API (Anthropic) | High-quality creative output for brand-voice captions; simple REST API |
| Demographics data | TBD — evaluate Melissa Data, Smarty Streets, or county public records scrape | Needs cost/availability validation before committing |
| Hosting | Vercel | Free tier; auto-deploys from GitHub; zero server management |
| Email (password reset) | Resend | Free tier; simple API; works well with Next.js |

---

## What Talks to What (Summary Table)

| Component | Reads From | Writes To | Calls External |
|---|---|---|---|
| Auth Shell | sessions table | sessions table | — |
| Booking Tracker | bookings, customers | bookings, customers | — |
| Customer Profiles | customers, bookings | customers | — |
| Waitlist | waitlist table | waitlist table | — |
| Revenue Dashboard | bookings | — | — |
| Campaign Calendar | posts, bookings (dates only) | posts | — |
| AI Content Generator | bookings (context hint) | posts (optional save) | Claude API |
| Demographics Feed | cache table | cache table | Demographics API |

---

## Key Architectural Decisions

| Decision | Rationale |
|---|---|
| Single shared database, all modules | Avoids sync complexity; acceptable at this scale |
| Server-side API calls for AI and demographics | Keeps API keys out of the browser; single place to add caching |
| 24h cache on demographics feed | Limits API costs; data doesn't change minute-to-minute |
| No auto-posting to social platforms | Eliminates OAuth complexity with FB/IG/TikTok in v1 |
| No public-facing booking portal | Out of scope; manual booking process is intentional |
| Build Booking first, Demographics last | Booking is core value; Demographics has an unresolved data-source dependency |
| Two individual owner accounts, not one shared login | Cleaner audit trail; independent password management |

---

*This document should be revisited when Phase 1 ships to validate the data model
assumptions before building Phase 2 and Phase 3.*
