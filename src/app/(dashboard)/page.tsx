import { createClient } from '@/lib/supabase/server'
import { NextActionPrompt } from '@/components/dashboard/NextActionPrompt'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { UpcomingBookings } from '@/components/dashboard/UpcomingBookings'
import { DollarSign, CalendarCheck, Clock } from 'lucide-react'

/**
 * Home Dashboard — Phase 1
 *
 * Layout (top to bottom):
 *   1. Greeting with logged-in owner's email
 *   2. NextActionPrompt — calendar-aware booking window message
 *   3. Stats grid — Revenue, Bookings, Waitlist (all null/skeleton in Phase 1)
 *   4. UpcomingBookings — empty state in Phase 1
 *
 * Stats pass value={null} to show skeletons rather than misleading zeros.
 * Real values will be wired in Phase 2 when booking/CRM data exists.
 *
 * The pb-16 on the parent layout clears the fixed bottom tab bar.
 */
export default async function HomePage() {
  // Fetch the authenticated user's email for the greeting
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const greeting = user?.email ? `Welcome, ${user.email}` : 'Welcome'

  return (
    <div className="px-4 py-6 space-y-6 max-w-2xl mx-auto">
      {/* Greeting */}
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">
          Little Royalty Spa
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">{greeting}</p>
      </header>

      {/* Calendar-aware next-action prompt */}
      <NextActionPrompt />

      {/* Stats grid: 2 columns on mobile, 3 on sm+ */}
      <section aria-labelledby="stats-heading">
        <h2 id="stats-heading" className="text-base font-semibold mb-3">
          This Month
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <StatsCard
            title="Revenue"
            value={null}
            description="Current month"
            icon={<DollarSign className="h-4 w-4" />}
          />
          <StatsCard
            title="Bookings"
            value={null}
            description="Current month"
            icon={<CalendarCheck className="h-4 w-4" />}
          />
          <StatsCard
            title="Waitlist"
            value={null}
            description="Pending inquiries"
            icon={<Clock className="h-4 w-4" />}
          />
        </div>
      </section>

      {/* Upcoming bookings — empty state in Phase 1 */}
      <UpcomingBookings bookings={[]} />
    </div>
  )
}
