# Plan 2: Supabase Auth Integration

**Phase:** 1 — Scaffold + Auth
**Requirements covered:** AUTH-01, AUTH-02, AUTH-03
**Estimated complexity:** Medium

## Goal
Wire Supabase Auth into the scaffolded app: email/password login, route-protecting middleware, password reset via Resend SMTP, and a seed script that creates both owner accounts. After this plan, both owners can log in on their phones, stay logged in across sessions, and recover access via email.

## Prerequisites
- Plan 1 complete (Next.js scaffold, Supabase project, route groups, client helpers in place)
- Owner email addresses confirmed
- Access to DNS for domain verification (for Resend)

## Tasks

### Task 1: Root middleware with session refresh + route guard
**What:** Add `middleware.ts` at project root that validates sessions via `getUser()` and redirects unauthenticated users to `/login`.
**How:**
- Create `middleware.ts` at the repo root (not inside `src/app`)
- Use `createServerClient` from `@supabase/ssr` with the cookies adapter pattern from research
- Call `supabase.auth.getUser()` (NEVER `getSession()`)
- If no user and path is not `/login`, `/reset-password`, or `/update-password`, redirect to `/login`
- Return the `supabaseResponse` object — do NOT create a fresh `NextResponse`
- Export `config.matcher` excluding `_next/static`, `_next/image`, `favicon.ico`, and common image extensions
**Done when:** Unauthenticated access to `/` redirects to `/login`; `/login` is reachable without a session.

### Task 2: Login page (email + password)
**What:** Build `/login` with logo placeholder, email + password inputs, and a sign-in action.
**How:**
- Convert `src/app/(auth)/login/page.tsx` into a Client Component form using shadcn `Card`, `Input`, `Label`, `Button`
- Add a styled text logo `Little Royalty Spa` at top with a clearly labeled `{/* TODO: swap for logo image */}` comment and an `<Image>` stub that is easy to replace
- Submit handler: call `supabase.auth.signInWithPassword({ email, password })` via the browser client
- On success, `router.push('/')` and `router.refresh()`
- On error, show the message via `sonner` toast
- Add "Forgot password?" link to `/reset-password`
- Verify the form is readable and tappable at 375px
**Done when:** A user with a valid Supabase account can log in and land on `/`; a bad password shows a toast error.

### Task 3: Logout action
**What:** Add a sign-out button in the dashboard layout (temporary placement, e.g. header or home screen) that calls `signOut()`.
**How:**
- Create a small `<SignOutButton />` Client Component that calls `supabase.auth.signOut()` then `router.push('/login')` + `router.refresh()`
- Render it inside `(dashboard)/layout.tsx` (top-right corner or inside the home page for Phase 1)
**Done when:** Clicking sign out clears the session and returns the user to `/login`; back navigation does not restore the session.

### Task 4: Resend SMTP + Supabase Auth email config
**What:** Wire Resend as the SMTP provider for all Supabase Auth emails.
**How:**
- Create a Resend account, add and verify the sending domain (`littleroyaltyspaparties.com` or owner-provided) via DNS records
- Generate a Resend API key
- In Supabase dashboard → Authentication → Email → SMTP Settings:
  - Enable custom SMTP
  - Host `smtp.resend.com`, port `465`, username `resend`, password = Resend API key
  - Sender email `noreply@<verified-domain>`, sender name `Little Royalty Spa`
- In Supabase dashboard → Authentication → URL Configuration, add allowed redirect URLs: `http://localhost:3000/update-password` and `https://<vercel-prod-url>/update-password`
**Done when:** Sending a test reset email from the Supabase dashboard arrives via Resend (check Resend logs).

### Task 5: Password reset request page
**What:** Build `/reset-password` that asks for an email and triggers `resetPasswordForEmail`.
**How:**
- Create `src/app/(auth)/reset-password/page.tsx` as a Client Component form (email only)
- Call `supabase.auth.resetPasswordForEmail(email, { redirectTo: \`${process.env.NEXT_PUBLIC_SITE_URL}/update-password\` })`
- Show a confirmation message on success (don't leak whether the email exists)
**Done when:** Submitting a known owner email triggers delivery of a reset email via Resend.

### Task 6: Update-password page
**What:** Build `/update-password` which handles the recovery token and lets the user set a new password.
**How:**
- Create `src/app/(auth)/update-password/page.tsx` as a Client Component
- On mount, subscribe to `supabase.auth.onAuthStateChange`; when event is `PASSWORD_RECOVERY`, enable the form
- Form submits `supabase.auth.updateUser({ password })`
- On success, toast success and `router.push('/login')`
- Ensure the auth middleware allows `/update-password` as a public route (already covered in Task 1)
**Done when:** Clicking a recovery link from the email lands on `/update-password`, accepts a new password, and the user can then log in with it.

### Task 7: Seed script for two owner accounts
**What:** Provide a one-shot script that creates both owner accounts via the Supabase Admin API.
**How:**
- Install `tsx` as a dev dep
- Create `scripts/seed-auth.ts` using `@supabase/supabase-js` + `SUPABASE_SERVICE_ROLE_KEY` env var
- For each owner (owner1 + owner2 emails), call `supabase.auth.admin.createUser({ email, password: <temp>, email_confirm: true })`; skip if user already exists
- Add `pnpm seed:auth` script in `package.json` mapping to `tsx scripts/seed-auth.ts`
- Document in `README.md`: run once locally with service role key, then each owner uses the password-reset flow to set their own password
- Confirm `SUPABASE_SERVICE_ROLE_KEY` is only in `.env.local` (not `NEXT_PUBLIC_`)
**Done when:** Running `pnpm seed:auth` creates two users visible in Supabase dashboard → Authentication → Users; both can log in with the temp password and successfully reset it.

## Verification
- [ ] Unauthenticated visit to `/` redirects to `/login`
- [ ] Valid login redirects to `/` and session persists across full page reloads
- [ ] Session survives browser restart (rolling 30-day cookie)
- [ ] Both seeded owner accounts can log in independently
- [ ] Sign-out returns to `/login` and a refresh does not restore the session
- [ ] Reset email is delivered via Resend (verified in Resend logs)
- [ ] Reset link lands on `/update-password`, new password can be set, and the user can then log in
- [ ] `getUser()` (not `getSession()`) is used in middleware (code review)
- [ ] Middleware returns `supabaseResponse`, not a fresh `NextResponse` (code review)
- [ ] Tested at 375px width — login form has no horizontal scroll

## Files Created/Modified
- `middleware.ts` — root middleware, session refresh + route guard (calls `getUser()`)
- `src/app/(auth)/login/page.tsx` — email/password login with logo placeholder
- `src/app/(auth)/reset-password/page.tsx` — reset request form
- `src/app/(auth)/update-password/page.tsx` — new-password form, handles `PASSWORD_RECOVERY` event
- `src/components/auth/SignOutButton.tsx` — sign-out Client Component
- `src/app/(dashboard)/layout.tsx` — add `<SignOutButton />` placement
- `scripts/seed-auth.ts` — Admin API seed for 2 owners
- `package.json` — add `seed:auth` script, `tsx` devDep
- `README.md` — seed instructions
- Supabase dashboard config (not a file): SMTP + redirect URLs
