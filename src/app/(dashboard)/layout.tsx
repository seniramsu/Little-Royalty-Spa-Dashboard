import { BottomTabBar } from '@/components/nav/BottomTabBar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* pb-16 prevents content from hiding behind the fixed bottom tab bar */}
      <main className="flex-1 pb-16 overflow-y-auto">
        {children}
      </main>
      <BottomTabBar />
    </div>
  )
}
