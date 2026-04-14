import { toZonedTime } from 'date-fns-tz'
import { differenceInCalendarDays, setDate, setHours, setMinutes, setSeconds, setMilliseconds, addMonths, startOfDay } from 'date-fns'

const TIMEZONE = 'America/Chicago'
const BOOKING_HOUR = 9 // 9am CST

export type Urgency = 'low' | 'medium' | 'high'

export interface NextActionPromptResult {
  message: string
  urgency: Urgency
}

/**
 * Returns the next-action prompt for the booking window.
 *
 * The booking window opens on the 1st of each month at 9:00am CST (America/Chicago).
 * This function is timezone-aware using date-fns-tz — it correctly handles
 * daylight saving time transitions (CDT is UTC-5, CST is UTC-6).
 *
 * @param now - The current date/time (defaults to new Date()). Inject for testing.
 * @returns A { message, urgency } object for display in the dashboard prompt.
 */
export function getNextActionPrompt(now: Date = new Date()): NextActionPromptResult {
  // Convert the current UTC time to CST/CDT (America/Chicago handles DST automatically)
  const zonedNow = toZonedTime(now, TIMEZONE)

  const dayOfMonth = zonedNow.getDate()
  const hourOfDay = zonedNow.getHours()

  // Determine the next booking window opening in CST
  let nextWindowCST: Date

  if (dayOfMonth === 1 && hourOfDay < BOOKING_HOUR) {
    // Today is the 1st AND it's before 9am CST — window opens today
    nextWindowCST = setMilliseconds(
      setSeconds(setMinutes(setHours(startOfDay(zonedNow), BOOKING_HOUR), 0), 0),
      0
    )
  } else if (dayOfMonth === 1 && hourOfDay >= BOOKING_HOUR) {
    // Today is the 1st and window is open right now
    // For daysUntil we won't need a future date, handle this case directly
    return {
      message: 'Booking window is open now — check your inquiries',
      urgency: 'high',
    }
  } else {
    // Not the 1st — next window is the 1st of next month at 9am CST
    const firstOfNextMonth = setDate(addMonths(zonedNow, 1), 1)
    nextWindowCST = setMilliseconds(
      setSeconds(setMinutes(setHours(startOfDay(firstOfNextMonth), BOOKING_HOUR), 0), 0),
      0
    )
  }

  // Compute calendar days until the window, using zoned "today" as the base
  const todayZoned = startOfDay(zonedNow)
  const windowDay = startOfDay(nextWindowCST)
  const daysUntil = differenceInCalendarDays(windowDay, todayZoned)

  if (daysUntil === 0) {
    // Today is the 1st and it's before 9am
    return {
      message: 'Booking window opens today at 9am CST — get ready!',
      urgency: 'high',
    }
  }

  if (daysUntil <= 5) {
    return {
      message: `Booking window opens in ${daysUntil} day${daysUntil === 1 ? '' : 's'} — plan your campaign`,
      urgency: 'medium',
    }
  }

  return {
    message: `Next booking window opens in ${daysUntil} days`,
    urgency: 'low',
  }
}
