# Little Royalty Spa — Business Dashboard

Internal dashboard for Little Royalty Spa LLC. Built with Next.js 15 App Router, Supabase Auth, Tailwind v4, and shadcn/ui.

## Stack

- **Framework:** Next.js 15.5 (App Router, TypeScript)
- **Auth:** Supabase Auth (email/password, HttpOnly cookies, 30-day rolling sessions)
- **UI:** shadcn/ui + Tailwind v4
- **Email:** Resend (SMTP for Supabase Auth emails)

## Local Development

```bash
# Install dependencies
npm install

# Copy env template and fill in values
cp .env.example .env.local
# Edit .env.local with your Supabase project URL, anon key, and service role key

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Auth emails sent during local dev are captured by Supabase's local Inbucket at `http://localhost:54324` if using `supabase start`.

## Environment Variables

See `.env.example` for all required variables.

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API → anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Settings → API → service_role key (never expose publicly) |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` for dev; your Vercel URL for production |

## Seeding Owner Accounts

The app has no signup flow — accounts are created once via the Admin API.

**Step 1:** Edit `scripts/seed-auth.ts` and update the owner email addresses.

**Step 2:** Ensure `.env.local` is populated with `SUPABASE_SERVICE_ROLE_KEY`.

**Step 3:** Run the seed script:

```bash
npm run seed:auth
```

**Step 4:** Verify both accounts appear in Supabase Dashboard → Authentication → Users.

**Step 5:** Have each owner visit `/reset-password` to set their own password. The temp passwords in the script are not secure and should not be kept.

> The seed script is idempotent — it skips accounts that already exist. Safe to run multiple times.

## Resend SMTP Setup (required for password reset emails)

1. Create a free account at [resend.com](https://resend.com)
2. Add and verify your sending domain via DNS records
3. Generate an API key
4. In Supabase Dashboard → Authentication → Email → SMTP Settings:
   - Host: `smtp.resend.com`, Port: `465`
   - Username: `resend`
   - Password: your Resend API key
   - Sender: `noreply@yourdomain.com` / `Little Royalty Spa`
5. In Supabase Dashboard → Authentication → URL Configuration → Redirect URLs, add:
   - `http://localhost:3000/update-password`
   - `https://your-vercel-url.vercel.app/update-password`

## Deployment (Vercel)

1. Push to GitHub
2. Import repo at [vercel.com/new](https://vercel.com/new)
3. Add all environment variables (update `NEXT_PUBLIC_SITE_URL` to your Vercel URL)
4. Deploy

## Security Notes

- `SUPABASE_SERVICE_ROLE_KEY` bypasses Row Level Security — never put it in a `NEXT_PUBLIC_*` variable and never commit `.env.local`
- Auth middleware uses `getUser()` (not `getSession()`) for server-side JWT validation
- Middleware returns the `supabaseResponse` object to preserve rolling session cookies
