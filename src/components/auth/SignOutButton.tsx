'use client'

import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

/**
 * Sign-out button for the dashboard layout.
 * Calls supabase.auth.signOut(), then redirects to /login.
 * router.refresh() forces the server components to re-evaluate
 * with the cleared session, preventing back-navigation restoring the session.
 */
export function SignOutButton() {
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleSignOut}
      className="gap-1.5 text-muted-foreground hover:text-foreground"
    >
      <LogOut className="h-4 w-4" />
      <span className="text-xs">Sign out</span>
    </Button>
  )
}
