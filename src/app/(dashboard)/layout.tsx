'use client'

import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'
import { usePathname, useRouter } from 'next/navigation'
import { useRestaurantStore } from '@/lib/stores/restaurantStore'
import { useEffect, useState } from 'react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { isOnboarded, isAuthenticated, checkSession, fetchTenantInfo, initializeSession } = useRestaurantStore()
  const isKitchen = pathname === '/kitchen'
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const init = async () => {
      checkSession()
      await initializeSession()
      await fetchTenantInfo()
    }
    init()
  }, [checkSession, initializeSession, fetchTenantInfo])

  // Check session expiry every minute
  useEffect(() => {
    const interval = setInterval(() => {
      checkSession()
    }, 60000)
    return () => clearInterval(interval)
  }, [checkSession])

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

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

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
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 md:hidden backdrop-blur-sm transition-opacity duration-300" 
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <div className="md:pl-[240px] pl-0 transition-all duration-300 ease-in-out">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="p-6 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  )
}

