import { getNextActionPrompt, type Urgency } from '@/lib/booking-window'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

/**
 * Returns Tailwind classes for the card background based on urgency level.
 * Minimal styling per the Phase 1 "functional first" context decision.
 * Brand colors (pink/rose) are deferred to a later phase.
 */
function urgencyClasses(urgency: Urgency): string {
  switch (urgency) {
    case 'high':
      return 'border-orange-300 bg-orange-50 dark:border-orange-800 dark:bg-orange-950'
    case 'medium':
      return 'border-yellow-300 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950'
    case 'low':
    default:
      return 'border-border bg-muted/40'
  }
}

/**
 * Server Component: displays the calendar-aware booking window prompt.
 *
 * Calls getNextActionPrompt() with the current server time to determine how many
 * days until the next booking window (1st of month, 9am CST).
 *
 * Styled with urgency-based background accents; no brand theming yet (Phase 1).
 */
export function NextActionPrompt() {
  const { message, urgency } = getNextActionPrompt()

  return (
    <section aria-label="Next action prompt">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
        Next action
      </p>
      <Card className={cn('transition-colors', urgencyClasses(urgency))}>
        <CardContent className="py-4 px-4">
          <p className="text-sm font-medium leading-snug">{message}</p>
        </CardContent>
      </Card>
    </section>
  )
}
