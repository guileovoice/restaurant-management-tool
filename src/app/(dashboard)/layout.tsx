'use client'

import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'
import { usePathname, useRouter } from 'next/navigation'
import { useRestaurantStore } from '@/lib/stores/restaurantStore'
import { useEffect } from 'react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { isOnboarded, isAuthenticated, fetchTenantInfo } = useRestaurantStore()
  const isKitchen = pathname === '/kitchen'

  useEffect(() => {
    fetchTenantInfo()
  }, [fetchTenantInfo])

  useEffect(() => {
    // If not authenticated, force login (unless already on auth pages)
    if (!isAuthenticated && pathname !== '/login' && pathname !== '/signup') {
      router.push('/login')
      return
    }

    // If authenticated but not onboarded, force onboarding
    if (isAuthenticated && !isOnboarded && pathname !== '/onboarding' && pathname !== '/login' && pathname !== '/signup') {
      router.push('/onboarding')
    }
  }, [isAuthenticated, isOnboarded, pathname, router])

  // Prevent flash of content for protected routes
  if (!isAuthenticated && pathname !== '/login' && pathname !== '/signup') {
    return null
  }

  if (isAuthenticated && !isOnboarded && pathname !== '/onboarding' && pathname !== '/login' && pathname !== '/signup') {
    return null
  }

  if (isKitchen) {
    return (
      <div className="min-h-screen bg-black overflow-hidden">
        {children}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="pl-[240px]">
        <Topbar />
        <main className="p-6 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  )
}

