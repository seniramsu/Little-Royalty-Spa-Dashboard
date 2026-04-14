# Plan 1: Project Setup & App Shell

**Phase:** 1 — Scaffold + Auth
**Requirements covered:** (foundation for AUTH-01–03, DASH-01–03)
**Estimated complexity:** Medium

## Goal
Stand up a deployable Next.js 15 project with Tailwind v4 + shadcn/ui, a Supabase project wired via env vars, a bottom-tab navigation shell, and a first successful Vercel deployment. At the end of this plan the app builds, deploys, and renders a placeholder home screen behind the nav shell.

## Prerequisites
- Node.js 20+ and pnpm (or npm) installed locally
- GitHub account for repo + Vercel linking
- Supabase account
- Vercel account

## Tasks

### Task 1: Repo init and Next.js 15 scaffold
**What:** Create a git repo and scaffold a Next.js 15 App Router project with TypeScript at `/home/jerrelle/claude-2`.
**How:**
- Run `npx create-next-app@latest` with flags: TypeScript yes, ESLint yes, Tailwind yes, `src/` dir yes, App Router yes, import alias `@/*`
- Confirm Next.js 15.x in `package.json`; upgrade if the scaffold pins an older version
- Initialize git, create `.gitignore` entries for `.env*.local`, `.vercel`, `node_modules`
- First commit: `chore: scaffold next.js 15 app`
**Done when:** `pnpm dev` serves the default Next.js page at `http://localhost:3000` and the repo has an initial commit.

### Task 2: Tailwind v4 + shadcn/ui setup
**What:** Ensure Tailwind v4 is installed and initialize shadcn/ui with the v4 config style.
**How:**
- Verify `tailwindcss@^4` is in `package.json` (install if scaffold used v3)
- Replace `src/app/globals.css` with `@import "tailwindcss";` plus a `@theme` block (no `tailwind.config.js`)
- Run `npx shadcn@latest init` — pick Tailwind v4, CSS variables, base color neutral, import alias `@/components`
- Install baseline components: `npx shadcn@latest add button card input label skeleton sonner`
- Add `lucide-react` for icons
- Verify a sample `<Button>` renders with styles on a test page
**Done when:** shadcn components render with Tailwind styles and the project builds with `pnpm build`.

### Task 3: Create Supabase project and wire env vars
**What:** Create a Supabase project and store credentials for local + deployed environments.
**How:**
- In Supabase dashboard, create a new project named `little-royalty-spa` (Dallas/US region)
- Copy Project URL, `anon` public key, and `service_role` key
- Create `.env.local` with:
  - `NEXT_PUBLIC_SUPABASE_URL=...`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY=...`
  - `SUPABASE_SERVICE_ROLE_KEY=...` (server-only, never `NEXT_PUBLIC_`)
  - `NEXT_PUBLIC_SITE_URL=http://localhost:3000`
- Create `.env.example` with the same keys but empty values, commit it
- Confirm `.env.local` is gitignored
**Done when:** Env vars load in `pnpm dev` (add a temporary `console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)` in a server component to verify, then remove).

### Task 4: Route groups and app shell layout
**What:** Create `(auth)` and `(dashboard)` route groups with placeholder pages and a dashboard layout that renders a bottom tab bar.
**How:**
- Create directory structure under `src/app/`:
  - `(auth)/login/page.tsx` — placeholder "Login" heading
  - `(dashboard)/layout.tsx` — flex column shell with `main` (pb-16) + `<BottomTabBar />`
  - `(dashboard)/page.tsx` — placeholder home heading
  - `(dashboard)/bookings/page.tsx`, `customers/page.tsx`, `social/page.tsx`, `demographics/page.tsx` — stub pages
- Create `src/components/nav/BottomTabBar.tsx` as a Client Component using `usePathname`, `next/link`, and `lucide-react` icons; 5 tabs (Home, Bookings, Customers, Social, Area), fixed bottom, h-16, border-t
- Verify layout works at 375px viewport (Chrome devtools) — no horizontal scroll, tabs evenly distributed
**Done when:** Visiting `/`, `/bookings`, `/customers`, `/social`, `/demographics` shows the correct placeholder page with the bottom nav highlighting the active tab. Visiting `/login` shows the auth placeholder without the bottom nav.

### Task 5: Supabase client utilities (skeleton)
**What:** Create browser + server Supabase client helpers so later plans have a stable import surface.
**How:**
- Install `@supabase/supabase-js` and `@supabase/ssr`
- Create `src/lib/supabase/client.ts` — exports `createClient()` using `createBrowserClient`
- Create `src/lib/supabase/server.ts` — exports async `createClient()` using `createServerClient` with `next/headers` cookies adapter and try/catch around `setAll`
- Do not yet create middleware (handled in Plan 2)
**Done when:** Files exist, typecheck passes (`pnpm tsc --noEmit`).

### Task 6: Vercel deployment
**What:** Push to GitHub and deploy to Vercel with env vars configured.
**How:**
- Create a GitHub repo, push `main`
- Import the repo into Vercel
- Add all `.env.local` vars to Vercel project (Production + Preview), updating `NEXT_PUBLIC_SITE_URL` to the Vercel URL
- Trigger a production deploy
- Verify the placeholder home screen loads at the deployed URL
**Done when:** Production URL renders `/` with the bottom tab bar and no runtime errors in Vercel logs.

## Verification
- [ ] `pnpm dev` starts without errors and renders the dashboard shell at `/`
- [ ] Bottom tab bar visible at 375px width with no horizontal scroll
- [ ] Active tab highlights correctly when navigating between tabs
- [ ] `pnpm build` succeeds
- [ ] Vercel production URL is live and loads the home shell
- [ ] `.env.local` is gitignored; `SUPABASE_SERVICE_ROLE_KEY` is not in any `NEXT_PUBLIC_*` variable

## Files Created/Modified
- `package.json` — Next.js 15, Tailwind v4, shadcn deps, `@supabase/ssr`, `@supabase/supabase-js`, `lucide-react`
- `src/app/globals.css` — Tailwind v4 `@import` + `@theme`
- `src/app/layout.tsx` — root layout
- `src/app/(auth)/login/page.tsx` — placeholder
- `src/app/(dashboard)/layout.tsx` — protected shell with bottom tab bar
- `src/app/(dashboard)/page.tsx` — home placeholder
- `src/app/(dashboard)/bookings/page.tsx`, `customers/page.tsx`, `social/page.tsx`, `demographics/page.tsx` — stubs
- `src/components/nav/BottomTabBar.tsx` — fixed bottom nav with active-tab highlighting
- `src/components/ui/*` — shadcn Button, Card, Input, Label, Skeleton, Sonner
- `src/lib/supabase/client.ts` — browser client helper
- `src/lib/supabase/server.ts` — server client helper
- `src/lib/utils.ts` — shadcn `cn` helper
- `.env.local` (gitignored) — Supabase + site URL
- `.env.example` — template
- `.gitignore` — standard + `.env*.local`, `.vercel`
- `README.md` — minimal stack + dev instructions (only if not already created by scaffold)
