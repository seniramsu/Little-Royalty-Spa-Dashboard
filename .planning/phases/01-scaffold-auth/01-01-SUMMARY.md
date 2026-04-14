---
phase: 01-scaffold-auth
plan: "01"
subsystem: infra
tags: [nextjs, tailwind, shadcn, supabase, typescript, app-router]

requires: []
provides:
  - Next.js 15.5 App Router project with TypeScript, Tailwind v4, shadcn/ui
  - Route group structure: (auth) and (dashboard) with route guard ready
  - Bottom tab navigation shell (Home, Bookings, Customers, Social, Area)
  - Supabase browser and server client utilities (src/lib/supabase/)
  - .env.example with all required environment variable keys documented
  - Build-verified scaffold ready for auth implementation (Plan 02)
affects: [01-02-auth, 01-03-dashboard]

tech-stack:
  added:
    - next@15.5.15
    - react@19.1.0
    - tailwindcss@4
    - shadcn/ui (button, card, input, label, skeleton, sonner)
    - lucide-react
    - "@supabase/supabase-js"
    - "@supabase/ssr"
    - date-fns
    - date-fns-tz
  patterns:
    - Route groups (auth) and (dashboard) — no URL impact, isolates layouts
    - (dashboard)/layout.tsx as persistent shell with BottomTabBar
    - pb-16 on main content area to clear fixed bottom nav
    - createBrowserClient in client.ts for Client Components
    - async createServerClient in server.ts with try/catch setAll for Server Components

key-files:
  created:
    - src/app/(auth)/login/page.tsx
    - src/app/(auth)/reset-password/page.tsx
    - src/app/(auth)/update-password/page.tsx
    - src/app/(dashboard)/layout.tsx
    - src/app/(dashboard)/page.tsx
    - src/app/(dashboard)/bookings/page.tsx
    - src/app/(dashboard)/customers/page.tsx
    - src/app/(dashboard)/social/page.tsx
    - src/app/(dashboard)/demographics/page.tsx
    - src/components/nav/BottomTabBar.tsx
    - src/lib/supabase/client.ts
    - src/lib/supabase/server.ts
    - .env.example
  modified:
    - src/app/layout.tsx (title + metadata)
    - src/app/globals.css (shadcn @theme tokens)
    - package.json (all dependencies)
    - .gitignore (.env*.local specificity)

key-decisions:
  - "Used create-next-app@15 (not latest) to pin Next.js 15.x per research spec"
  - "shadcn auto-committed its own init — accepted the commit as part of task history"
  - "date-fns + date-fns-tz installed alongside Supabase (needed for booking window prompt in Plan 03)"
  - "Task 6 (Vercel deployment) is a human action gate — requires GitHub repo creation and Vercel account linking"

patterns-established:
  - "Route groups: (auth) routes are public, (dashboard) routes are protected via middleware (Plan 02)"
  - "Supabase clients: always import from src/lib/supabase/client.ts or server.ts — never instantiate directly"
  - "Auth safety: use getUser() in middleware never getSession() — documented in server.ts"
  - "Bottom nav: BottomTabBar is a Client Component; active tab via usePathname()"

requirements-completed: []

duration: 65min
completed: 2026-04-14
---

# Phase 1 Plan 1: Project Setup & App Shell Summary

**Next.js 15 App Router scaffold with Tailwind v4 + shadcn/ui, (auth)/(dashboard) route groups, 5-tab bottom nav shell, and Supabase client utilities — ready for auth and dashboard implementation**

## Performance

- **Duration:** ~65 min
- **Started:** 2026-04-14T10:12:27Z
- **Completed:** 2026-04-14T11:17:00Z
- **Tasks:** 5 of 6 complete (Task 6: Vercel deployment is a human action gate)
- **Files modified:** 18

## Accomplishments

- Next.js 15.5.15 scaffolded with TypeScript, ESLint, App Router, and Tailwind v4
- shadcn/ui initialized (v4 CSS vars mode) with Button, Card, Input, Label, Skeleton, Sonner
- Route group structure: `(auth)` (public) and `(dashboard)` (protected shell) with correct layout isolation
- BottomTabBar Client Component: 5 tabs, fixed bottom, active-state highlighting via `usePathname`
- Supabase client utilities at stable import paths with documented getUser() safety requirement
- `pnpm build` verified: 9 routes generated, 0 errors

## Task Commits

Each task was committed atomically:

1. **Task 1: Repo init and Next.js 15 scaffold** - `191f1d1` (chore)
2. **Task 2: Tailwind v4 + shadcn/ui setup** - `6dc097f` (shadcn auto-commit) + `e07f2e5` (feat)
3. **Task 3: Supabase project and env vars** - `7d4220c` (chore)
4. **Task 4: Route groups and app shell layout** - `c52f137` (feat)
5. **Task 5: Supabase client utilities** - `fcab7f5` (feat)
6. **Task 6: Vercel deployment** — PENDING: human action required (see User Setup Required section)

## Files Created/Modified

- `src/app/(auth)/login/page.tsx` — Login placeholder (logo text + "form in Plan 2")
- `src/app/(auth)/reset-password/page.tsx` — Reset password placeholder
- `src/app/(auth)/update-password/page.tsx` — Update password placeholder
- `src/app/(dashboard)/layout.tsx` — Protected shell: flex-col, pb-16 main, BottomTabBar
- `src/app/(dashboard)/page.tsx` — Home stub
- `src/app/(dashboard)/bookings/page.tsx` — Bookings stub
- `src/app/(dashboard)/customers/page.tsx` — Customers stub
- `src/app/(dashboard)/social/page.tsx` — Social stub
- `src/app/(dashboard)/demographics/page.tsx` — Area/Demographics stub
- `src/components/nav/BottomTabBar.tsx` — 5-tab fixed bottom nav, Client Component
- `src/lib/supabase/client.ts` — createBrowserClient wrapper
- `src/lib/supabase/server.ts` — async createServerClient with try/catch setAll
- `.env.example` — Env var template with instructions
- `src/app/layout.tsx` — Updated metadata (title, description)
- `src/app/globals.css` — shadcn @theme CSS vars + Tailwind v4 imports
- `package.json` — All project dependencies
- `.gitignore` — .env*.local specificity (allows .env.example to be committed)
- `components.json` — shadcn configuration

## Decisions Made

- **Next.js 15.x pinned** — Used `create-next-app@15` to stay on 15.5.x per research spec rather than defaulting to 16.x.
- **date-fns-tz installed in Task 3** — Added alongside Supabase packages since it's needed for the booking window prompt (Plan 03 work). Avoids another install step later.
- **shadcn auto-commit accepted** — shadcn init ran `git commit` automatically during Task 2. The commit (`6dc097f`) contains the init output. Accepted as part of the task history.
- **Root src/app/page.tsx removed** — The scaffold creates a default page.tsx that conflicts with `(dashboard)/page.tsx` for the `/` route. Removed the scaffold default.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] pnpm not installed — used npm install and prefix fallback**
- **Found during:** Task 1 setup
- **Issue:** `pnpm` not in PATH; plan references `pnpm dev` and `pnpm build`
- **Fix:** Installed pnpm via `npm install --prefix ~/.local`; used `npm run build` for verification commands
- **Files modified:** None (tooling only)
- **Verification:** Build succeeds with `npm run build`; `pnpm` available at `~/.local/bin/pnpm`
- **Committed in:** Not applicable (tooling only)

**2. [Rule 3 - Blocking] Scaffold created conflicting src/app/page.tsx**
- **Found during:** Task 4 (route groups)
- **Issue:** Next.js scaffold created `src/app/page.tsx` which conflicts with `(dashboard)/page.tsx` for the `/` route
- **Fix:** Deleted `src/app/page.tsx`; `(dashboard)/page.tsx` is the correct home route handler
- **Files modified:** src/app/page.tsx (deleted)
- **Verification:** `npm run build` shows only one handler for `/`
- **Committed in:** `c52f137` (Task 4 commit)

---

**Total deviations:** 2 auto-fixed (both Rule 3 — blocking issues)
**Impact on plan:** Both fixes necessary for task completion. No scope creep.

## Known Stubs

The following stub pages are intentional — Plan 01-01 establishes the shell only. Real UI comes in later plans:

| File | Stub Content | Resolved By |
|------|-------------|-------------|
| `src/app/(auth)/login/page.tsx` | "Login form coming in Plan 2" | Plan 01-02 (auth) |
| `src/app/(auth)/reset-password/page.tsx` | "Password reset form coming in Plan 2" | Plan 01-02 (auth) |
| `src/app/(auth)/update-password/page.tsx` | "Update password form coming in Plan 2" | Plan 01-02 (auth) |
| `src/app/(dashboard)/page.tsx` | "Dashboard coming soon" | Plan 01-03 (dashboard) |
| `src/app/(dashboard)/bookings/page.tsx` | "Coming in Phase 2" | Phase 2 |
| `src/app/(dashboard)/customers/page.tsx` | "Coming in Phase 2" | Phase 2 |
| `src/app/(dashboard)/social/page.tsx` | "Coming in Phase 3" | Phase 3 |
| `src/app/(dashboard)/demographics/page.tsx` | "Coming in Phase 4" | Phase 4 |

These stubs do not block Plan 01-01's goal (build-passing scaffold with nav shell). They are explicitly scoped out per the plan.

## Issues Encountered

- `create-next-app` latest (v16) was installed instead of v15 on first attempt. Re-ran with `create-next-app@15` to pin the correct version.
- shadcn init auto-ran `git commit` — the commit message `feat: initial commit` is not in the project format. Accepted as-is since it cannot be undone without disrupting history.

## User Setup Required

**Task 6 (Vercel deployment) requires manual steps:**

### Step 1: Create Supabase project
1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Create new project: name `little-royalty-spa`, region `US East (N. Virginia)` or nearest
3. Copy from Settings → API:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon/public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role key → `SUPABASE_SERVICE_ROLE_KEY` (never share this)
4. Create `.env.local` from `.env.example` with your real values

### Step 2: Create GitHub repo and push
```bash
gh repo create little-royalty-spa --private --source=. --push
# OR manually via github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/little-royalty-spa.git
git push -u origin main
```

### Step 3: Deploy to Vercel
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import the GitHub repo
3. Add environment variables (from `.env.local`):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SITE_URL` → set to your Vercel deployment URL (e.g. `https://little-royalty-spa.vercel.app`)
4. Deploy

### Step 4: Add Supabase redirect URL
In Supabase Dashboard → Authentication → URL Configuration → Redirect URLs:
- Add `http://localhost:3000/**`
- Add `https://your-vercel-url.vercel.app/**`

### Verification
- Production URL renders `/` with bottom tab bar
- No runtime errors in Vercel logs
- `SUPABASE_SERVICE_ROLE_KEY` does NOT appear in any `NEXT_PUBLIC_*` variable

## Next Phase Readiness

Plan 01-02 (auth) can begin immediately:
- Import paths `@/lib/supabase/client` and `@/lib/supabase/server` are stable
- Route group structure ready: `(auth)/login`, `(auth)/reset-password`, `(auth)/update-password` pages are stubs awaiting real forms
- Middleware (not yet created) goes at project root `middleware.ts`
- Supabase project setup (Task 3/6 above) must be completed before auth testing

Concern: Vercel deployment (Task 6) should ideally complete before Plan 02 testing. Auth flows require the `redirectTo` URL for password reset — local dev works, but production URL needs to be configured in Supabase before end-to-end testing.

## Self-Check: PASSED

All files verified present. All commits verified in git history.

| Item | Status |
|------|--------|
| src/app/(auth)/login/page.tsx | FOUND |
| src/app/(dashboard)/layout.tsx | FOUND |
| src/app/(dashboard)/page.tsx | FOUND |
| src/components/nav/BottomTabBar.tsx | FOUND |
| src/lib/supabase/client.ts | FOUND |
| src/lib/supabase/server.ts | FOUND |
| .env.example | FOUND |
| 01-01-SUMMARY.md | FOUND |
| commit 191f1d1 (Task 1) | FOUND |
| commit e07f2e5 (Task 2) | FOUND |
| commit 7d4220c (Task 3) | FOUND |
| commit c52f137 (Task 4) | FOUND |
| commit fcab7f5 (Task 5) | FOUND |

---
*Phase: 01-scaffold-auth*
*Completed: 2026-04-14*
