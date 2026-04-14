"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, CalendarDays, Users, Share2, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'

const tabs = [
  { href: '/',             label: 'Home',      icon: Home },
  { href: '/bookings',     label: 'Bookings',  icon: CalendarDays },
  { href: '/customers',    label: 'Customers', icon: Users },
  { href: '/social',       label: 'Social',    icon: Share2 },
  { href: '/demographics', label: 'Area',      icon: MapPin },
]

export function BottomTabBar() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 h-16 bg-background border-t border-border"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="flex h-full">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href ||
            (href !== '/' && pathname.startsWith(href))

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-1 flex-col items-center justify-center gap-0.5 text-xs transition-colors',
                active
                  ? 'text-foreground font-medium'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              aria-current={active ? 'page' : undefined}
            >
              <Icon
                className={cn('h-5 w-5', active && 'stroke-[2.5px]')}
                aria-hidden="true"
              />
              <span>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
