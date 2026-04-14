import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface StatsCardProps {
  title: string
  value: string | number | null
  description?: string
  icon?: React.ReactNode
}

/**
 * Stats metric card for the dashboard.
 *
 * Pass `value={null}` when data has not yet been fetched — renders a pulsing skeleton
 * instead of a misleading zero. Pass `value={0}` only when the real value is zero.
 *
 * Renders correctly in a 2-column grid at 375px and 3-column at sm: and above.
 */
export function StatsCard({ title, value, description, icon }: StatsCardProps) {
  const isEmpty = value === null || value === undefined

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && (
          <span className="text-muted-foreground" aria-hidden="true">
            {icon}
          </span>
        )}
      </CardHeader>
      <CardContent>
        {isEmpty ? (
          <Skeleton className="h-8 w-24" aria-label={`${title} loading`} />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  )
}
