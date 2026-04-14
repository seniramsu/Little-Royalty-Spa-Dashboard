/**
 * One-shot seed script: creates both owner accounts via the Supabase Admin API.
 *
 * Run once locally AFTER setting up your Supabase project:
 *   pnpm seed:auth
 *
 * Prerequisites:
 *   - .env.local with SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY set
 *   - Supabase project created and accessible
 *
 * After running this script:
 *   - Each owner should use the /reset-password flow to set their own password.
 *   - The temp password below is intentionally not secure — reset it immediately.
 *
 * SECURITY: SUPABASE_SERVICE_ROLE_KEY bypasses Row Level Security.
 *   - Never put it in a NEXT_PUBLIC_* variable.
 *   - Never commit .env.local to git.
 *   - Only use it here (server-side script) and in Vercel environment variables.
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing required environment variables:')
  if (!supabaseUrl) console.error('  - SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL)')
  if (!serviceRoleKey) console.error('  - SUPABASE_SERVICE_ROLE_KEY')
  console.error('\nEnsure .env.local is populated before running this script.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// Owner accounts. Update these emails to the real owner emails before running.
// Passwords are temporary — owners should reset via /reset-password immediately.
const owners = [
  {
    email: 'owner1@littleroyaltyspa.com',
    password: 'ChangeMe-Owner1!',
    label: 'Owner 1',
  },
  {
    email: 'owner2@littleroyaltyspa.com',
    password: 'ChangeMe-Owner2!',
    label: 'Owner 2',
  },
]

async function seedOwners() {
  console.log('Seeding owner accounts...\n')

  for (const owner of owners) {
    console.log(`Creating ${owner.label} (${owner.email})...`)

    const { data, error } = await supabase.auth.admin.createUser({
      email: owner.email,
      password: owner.password,
      email_confirm: true, // bypass email verification for admin-created accounts
    })

    if (error) {
      if (error.message.includes('already been registered') || error.message.includes('already exists')) {
        console.log(`  [SKIPPED] ${owner.email} already exists — no changes made.`)
      } else {
        console.error(`  [ERROR] ${owner.email}: ${error.message}`)
      }
      continue
    }

    console.log(`  [OK] Created: ${data.user.email} (id: ${data.user.id})`)
  }

  console.log('\nDone. Next steps:')
  console.log('  1. Verify both accounts appear in Supabase Dashboard → Authentication → Users')
  console.log('  2. Have each owner visit /reset-password to set their own password')
  console.log('  3. Delete or gitignore this script after initial setup (optional)')
}

seedOwners().catch((err) => {
  console.error('Unexpected error:', err)
  process.exit(1)
})
