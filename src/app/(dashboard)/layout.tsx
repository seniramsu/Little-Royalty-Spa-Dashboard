import { BottomTabBar } from '@/components/nav/BottomTabBar'
import { SignOutButton } from '@/components/auth/SignOutButton'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Minimal header: sign-out button top-right (Phase 1 placement) */}
      <header className="flex justify-end px-4 py-2 border-b border-border">
        <SignOutButton />
      </header>

      {/* pb-16 prevents content from hiding behind the fixed bottom tab bar */}
      <main className="flex-1 pb-16 overflow-y-auto">
        {children}
      </main>

      <BottomTabBar />
    </div>
  )
}
