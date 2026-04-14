'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function UpdatePasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  // Recovery session is established when Supabase fires PASSWORD_RECOVERY event
  const [recoveryReady, setRecoveryReady] = useState(false)
  const [invalidLink, setInvalidLink] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    // The Supabase browser client exchanges the recovery token in the URL hash
    // automatically. onAuthStateChange fires with PASSWORD_RECOVERY once it succeeds.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === 'PASSWORD_RECOVERY') {
          setRecoveryReady(true)
        }
      }
    )

    // Set a timeout — if no PASSWORD_RECOVERY fires within 5s, the link is
    // likely invalid or already used.
    const timeout = setTimeout(() => {
      if (!recoveryReady) {
        setInvalidLink(true)
      }
    }, 5000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (password !== confirm) {
      toast.error('Passwords do not match')
      return
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    toast.success('Password updated — please sign in with your new password')
    router.push('/login')
  }

  if (invalidLink && !recoveryReady) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4">
        <Card className="w-full max-w-sm">
          <CardContent className="pt-6 text-center space-y-3">
            <p className="text-sm font-medium">Link expired or invalid</p>
            <p className="text-sm text-muted-foreground">
              Password reset links can only be used once. Request a new one.
            </p>
            <Link
              href="/reset-password"
              className="block text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
            >
              Request new reset link
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!recoveryReady) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4">
        <p className="text-sm text-muted-foreground">Verifying reset link…</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Little Royalty Spa
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Set a new password</p>
      </div>

      <Card className="w-full max-w-sm">
        <CardHeader className="pb-2">
          <p className="text-sm text-muted-foreground text-center">
            Choose a strong password for your account.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="password">New password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                minLength={8}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirm">Confirm password</Label>
              <Input
                id="confirm"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Updating…' : 'Update password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
