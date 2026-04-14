# Stack Research

> Project: Little Royalty Spa — Business Dashboard
> Audience: Two non-technical owners (husband + wife), phone + desktop daily use
> Priority: Simplicity, low maintenance, fast time-to-value, small-business scale

---

## Recommended Stack

### Frontend

**Next.js 15 (App Router) + TypeScript + Tailwind CSS v4 + shadcn/ui**

| Package | Version | Role |
|---------|---------|------|
| `next` | 15.x | Full-stack React framework (frontend + API routes in one project) |
| `react` | 19.x | UI rendering (bundled with Next.js 15) |
| `typescript` | 5.x | Type safety; catches bugs early with zero runtime cost |
| `tailwindcss` | 4.x | Utility-first CSS; no separate stylesheet to maintain |
| `shadcn/ui` | latest (2025) | Pre-built accessible component library built on Radix UI — copy-paste, owns the code |
| `lucide-react` | 0.4xx | Icon set that ships with shadcn/ui |
| `recharts` | 2.x | Charts and data visualization (bar, line, pie); simple React-native API |

**Rationale:**
- Next.js 15 App Router gives you frontend + backend API routes in a single codebase and a single `npm run dev`. No separate server repo to manage.
- shadcn/ui gives polished, accessible UI components (tables, forms, dialogs, calendars) that are pasted into your project rather than imported — you own the code and can restyle for the pink/princess brand without fighting a theming system.
- Tailwind v4 eliminates a separate CSS file entirely; all styling is inline class names, which is fast to iterate on.
- recharts is the simplest React-native charting library with the most community examples — ideal for a monthly revenue dashboard and demographics charts.
- TypeScript at the project level catches integration bugs (API mismatches, missing fields) before they reach the owners' screens.

**Confidence: High**

---

### Backend

**Next.js 15 Route Handlers (built-in) + Zod for validation**

| Package | Version | Role |
|---------|---------|------|
| `next` | 15.x | API route handlers live in `app/api/` — no separate Express/Fastify server needed |
| `zod` | 3.x | Schema validation for form inputs and API payloads |

**Rationale:**
- At this scale (2 users, ~50–200 bookings/year), there is no need for a separate backend service. Next.js Route Handlers handle all API logic: saving bookings, calling OpenAI, proxying demographics data.
- Zod validates all form submissions server-side with near-zero boilerplate.
- Eliminating a separate backend means one repo, one deployment, one bill, and one thing to debug.

**Confidence: High**

---

### Database

**Supabase (PostgreSQL) + Prisma ORM**

| Package/Service | Version | Role |
|-----------------|---------|------|
| Supabase | — (hosted service) | Managed Postgres with built-in auth, storage, and dashboard |
| `@supabase/supabase-js` | 2.x | Supabase JS client (used for auth and storage) |
| `prisma` | 5.x | Type-safe ORM for all DB queries; generates TypeScript types from schema |
| `@prisma/client` | 5.x | Auto-generated query client |

**Rationale:**
- Supabase's free tier (500MB DB, 1GB storage, 2 project limit) comfortably covers Little Royalty Spa forever — a small business CRM with ~200 bookings and a few hundred customer records is tiny.
- Supabase provides built-in authentication (email+password is sufficient for 2 owners), a web-based table editor they can use to spot-check data, and Row Level Security as a safety net.
- Prisma sits on top of Supabase's Postgres connection and provides fully-typed queries — `prisma.booking.findMany()` returns a typed object. No raw SQL needed, no runtime type mismatches.
- The Prisma schema file doubles as living documentation of the data model.
- Supabase Storage handles any file uploads (e.g., party photos, brand assets for content generation context) if needed later.

**Alternative considered:** Firebase/Firestore — rejected because Firestore's NoSQL model makes relational queries (customer → bookings → revenue rollups) awkward and expensive to implement without joins.

**Confidence: High**

---

### Authentication

**Supabase Auth (built-in)**

| Service | Role |
|---------|------|
| Supabase Auth | Email + password login for 2 owners; JWT sessions managed automatically |
| `@supabase/ssr` | 0.x | Supabase SSR helpers for Next.js App Router (server-side session handling) |

**Rationale:**
- For exactly 2 known users, Supabase Auth with email + password is fully sufficient and requires zero additional infrastructure.
- No OAuth, no social login, no role-based access needed for v1.
- `@supabase/ssr` handles the cookie/session plumbing for Next.js App Router with minimal configuration.

**Confidence: High**

---

### AI / Content Generation

**OpenAI API (GPT-4o) via Vercel AI SDK**

| Package/Service | Version | Role |
|-----------------|---------|------|
| `ai` (Vercel AI SDK) | 3.x | Streaming AI responses, unified provider interface, React hooks (`useCompletion`) |
| `openai` | 4.x | OpenAI Node SDK (peer dependency of Vercel AI SDK) |
| OpenAI GPT-4o | — | Model for caption generation, hashtag suggestions, campaign planning prompts |

**Rationale:**
- GPT-4o is the best price-to-quality model for creative marketing copy as of 2025. At ~$0.005 per generation call (short prompts for captions), cost for this use case is negligible — likely under $5/month.
- The Vercel AI SDK provides `useCompletion` and `streamText` helpers that give streaming responses (text appears word-by-word in the UI), which feels fast and modern without extra work.
- The AI SDK abstracts the provider — if switching to Claude or Gemini later makes sense, it's a one-line change.
- For the content generation workflow (captions, hashtags, post ideas for @littleroyaltyspa): a system prompt is set once with brand context (pink/princess theme, age 3–10, Rockwall TX, services list), then owners fill in a short prompt ("Valentine's Day post, 3 openings left") and get ready-to-copy output.

**Confidence: High**

---

### Demographics / Data

**U.S. Census Bureau API + ATTOM Data API (or Redfin/Zillow data)**

| Source | Role | Cost |
|--------|------|------|
| U.S. Census Bureau API (`api.census.gov`) | Family demographics, income ranges, age distribution by ZIP code (ACS 5-Year estimates) | Free |
| ATTOM Property Data API | Recent home sales/purchases by ZIP code; new resident identification | ~$50–150/month (starter tier) or pay-per-call |
| USPS National Change of Address (NCOA) | Move-in data by ZIP | Requires reseller license — complex; defer to v2 |

**Rationale:**
- The Census ACS (American Community Survey) 5-Year estimates provide ZIP-level data on: household size, children under 10, median household income, and housing tenure — exactly the demographic signals relevant to Little Royalty Spa. It is free, stable, and updated annually.
- ATTOM is the most accessible paid API for property transaction data (new purchases = new families = warm prospects). Their API covers Rockwall County ZIP codes (75032, 75087, 75189, 75160, 75101) reliably.
- For v1, a nightly or weekly background job (Next.js cron via Vercel Cron Jobs, or a simple scheduled function) fetches new sales data and surfaces them as a "New Residents" feed.
- USPS NCOA requires a licensed mailer relationship — too complex for v1. Defer.

**Alternative considered:** Smarty (formerly SmartyStreets) for address/move data — viable but adds cost; ATTOM is more purpose-built for property transaction data.

**Confidence: Medium** — ATTOM pricing and data coverage for Rockwall County ZIP codes should be confirmed before committing. Census API is High confidence.

---

### Hosting & Infrastructure

**Vercel (frontend + API) + Supabase (database)**

| Service | Role | Cost |
|---------|------|------|
| Vercel (Hobby/Pro) | Hosts the Next.js app; handles deploys, CDN, serverless functions, cron jobs | Free (Hobby) or $20/mo (Pro) |
| Supabase Free Tier | Hosted Postgres, auth, storage | Free |
| GitHub | Source control + Vercel auto-deploy on push | Free |

**Rationale:**
- Vercel is the canonical hosting platform for Next.js — zero-config deploys, automatic HTTPS, edge CDN, and built-in support for Next.js features (Route Handlers, Server Components, Cron Jobs).
- `git push` to GitHub automatically triggers a deploy — no DevOps work needed.
- The Vercel Hobby plan is free for non-commercial use; the Pro plan at $20/month covers commercial use with team members, custom domains, and cron jobs — appropriate once this goes live.
- Supabase free tier is sufficient for this data volume indefinitely; Pro tier ($25/month) adds daily backups if desired later.
- Total infrastructure cost at launch: $20–45/month (Vercel Pro + Supabase Free + domain ~$15/year). Excluding ATTOM demographics data if used.

**Confidence: High**

---

### Package Manager & Tooling

| Tool | Version | Role |
|------|---------|------|
| `pnpm` | 9.x | Fast, disk-efficient package manager; standard in Next.js ecosystem 2025 |
| ESLint + `eslint-config-next` | bundled | Linting with Next.js rules pre-configured |
| Prettier | 3.x | Code formatting — run on save, no style debates |

---

## What NOT to Use

### Do NOT use: Create React App (CRA)
CRA is unmaintained as of 2023 and has been officially deprecated. No new projects should use it.

### Do NOT use: Gatsby
Gatsby's build model is optimized for static content sites (blogs, marketing pages). This project needs dynamic data (live bookings, real-time customer records). Gatsby adds complexity with no benefit here.

### Do NOT use: Express.js or Fastify as a separate backend
A standalone Node.js API server doubles the deployment surface (two repos, two deployments, CORS configuration, separate environment variables). Next.js Route Handlers provide everything needed at this scale. Introduce a separate backend only if worker processes, WebSockets, or heavy compute are required — none of which apply here.

### Do NOT use: MongoDB / Mongoose
The data model for this app is inherently relational: customers have bookings, bookings have line items, campaigns have posts. Relational queries (e.g., "revenue by month," "repeat customers," "bookings by service type") are trivial in PostgreSQL and painful in MongoDB. Postgres + Prisma is strictly better for this use case.

### Do NOT use: Firebase / Firestore
Firestore's NoSQL model makes aggregation queries (monthly revenue roll-ups, customer booking counts) expensive and complex. Firebase Auth is fine but Supabase Auth is already included. Firebase adds cost and complexity without compensating benefit.

### Do NOT use: GraphQL (Apollo, etc.)
GraphQL is appropriate for large teams with many frontend consumers sharing one API. For a two-person internal tool with one frontend and one backend in the same Next.js project, REST-style Route Handlers are simpler, faster to build, and easier to debug.

### Do NOT use: Redux / Zustand for state management (yet)
shadcn/ui + React 19's built-in `useState`/`useContext` covers all UI state needs for a dashboard of this size. Adding a global state manager before it's needed creates boilerplate with no payoff. Add Zustand later only if prop-drilling becomes genuinely painful.

### Do NOT use: Planetscale
PlanetScale ended their free tier in 2024 and removed branching for MySQL in their restructure. Supabase (Postgres) is cheaper, more feature-rich for this use case, and has a genuine free tier.

### Do NOT use: Vercel's AI SDK with a self-hosted LLM (Ollama, etc.)
Running a local LLM requires a server with GPU resources, ongoing maintenance, and model management. For a small business app where AI runs only on demand, the OpenAI API costs pennies per session. Self-hosting is not worth the operational complexity.

### Do NOT use: Native mobile apps (React Native / Flutter)
The project correctly decided on a responsive web app. A native app would require App Store/Play Store publishing, separate codebases or additional RN/Flutter tooling, and ongoing platform updates. A well-built Next.js + Tailwind responsive app works on iPhone, Android, and desktop without any of that.

---

## Confidence Summary

| Decision | Confidence | Key Risk |
|----------|------------|----------|
| Next.js 15 as the framework | High | None — mature, well-supported, right fit |
| shadcn/ui + Tailwind v4 for UI | High | Tailwind v4 has minor config changes from v3; check migration guide |
| Supabase (Postgres) as database | High | Free tier has 2-project limit; create 1 project for prod + 1 for dev |
| Prisma as ORM | High | Prisma + Supabase requires using Supabase's connection pooler (PgBouncer) for serverless — one config line, well-documented |
| Supabase Auth for login | High | None — trivial for 2 users |
| OpenAI GPT-4o via Vercel AI SDK | High | API key must be kept secret in environment variables; not committed to git |
| Vercel for hosting | High | Hobby plan is free but ToS says non-commercial only; use Pro ($20/mo) for a live business app |
| recharts for data visualization | High | None — simple bar/line/pie charts are well within recharts' capability |
| Census API for demographics | High | Data is 1–5 years lagged (ACS survey cadence); fine for market insights, not real-time |
| ATTOM API for property/resident data | Medium | Confirm Rockwall County ZIP coverage and pricing before build; could substitute with manual research or Zillow data in v1 |
| pnpm as package manager | High | None — standard in 2025 Next.js ecosystem |

---

## Minimal Viable Stack (If Simplifying Further)

If the build needs to start in a single afternoon, the MVP stack is:

```
Next.js 15 + Tailwind + shadcn/ui
Supabase (auth + database)
OpenAI API (GPT-4o)
Vercel
```

This four-piece stack covers: login, CRUD for bookings/customers, AI content generation, basic charts, and mobile-responsive UI. Demographics features (ATTOM) can be layered on in a subsequent phase.

---

*Research compiled: 2026-04-13. Based on ecosystem state as of mid-2025. Verify ATTOM pricing and Vercel Pro terms before committing.*
