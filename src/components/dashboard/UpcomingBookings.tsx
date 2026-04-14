import { CalendarDays } from 'lucide-react'

/**
 * Placeholder interface for a booking record.
 * Phase 2 will define the full Booking type from the database schema.
 */
export interface Booking {
  id: string
  date: string
  location?: string
  partySize?: number
  services?: string[]
  revenue?: number
}

interface UpcomingBookingsProps {
  bookings: Booking[]
}

/**
 * Upcoming bookings section for the dashboard home page.
 *
 * Phase 1: Only the empty state is exercised — no booking data exists yet.
 * Phase 2+: The non-empty branch will render a list of upcoming parties.
 *
 * Must render without horizontal scroll at 375px.
 */
export function UpcomingBookings({ bookings }: UpcomingBookingsProps) {
  return (
    <section aria-labelledby="upcoming-bookings-heading">
      <h2
        id="upcoming-bookings-heading"
        className="text-base font-semibold mb-3"
      >
        Upcoming Bookings
      </h2>

      {bookings.length === 0 ? (
        <div className="rounded-lg border border-dashed p-6 text-center">
          <CalendarDays
            className="mx-auto h-8 w-8 text-muted-foreground mb-2"
            aria-hidden="true"
          />
          <p className="text-sm font-medium">No upcoming bookings yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Bookings you log will appear here
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {bookings.map((booking) => (
            <li
              key={booking.id}
              className="rounded-lg border p-4 text-sm"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{booking.date}</span>
                {booking.partySize && (
                  <span className="text-muted-foreground text-xs">
                    {booking.partySize} guests
                  </span>
                )}
              </div>
              {booking.location && (
                <p className="text-muted-foreground text-xs mt-1">
                  {booking.location}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
