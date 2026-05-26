'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
  LayoutDashboard, 
  BarChart3,
  ShoppingBag, 
  ChefHat, 
  UtensilsCrossed, 
  Users, 
  Megaphone, 
  Target, 
  Phone, 
  MessageCircle,
  MessageSquare,
  Settings,
  LogOut
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { useRestaurantStore } from '@/lib/stores/restaurantStore'
import { supabase } from '@/lib/supabaseClient'
import { useDateFilterStore } from '@/lib/stores/dateFilterStore'

const navItems = [
  { label: 'Overview', icon: LayoutDashboard, href: '/overview' },
  { label: 'AI Analytics', icon: BarChart3, href: '/analytics', comingSoon: true },
  { label: 'Live Orders', icon: ShoppingBag, href: '/orders', badge: 5 },
  { label: 'Kitchen View', icon: ChefHat, href: '/kitchen' },
  { label: 'Menu', icon: UtensilsCrossed, href: '/menu' },
  { label: 'Customers', icon: Users, href: '/customers' },
  { label: 'Campaigns', icon: Megaphone, href: '/campaigns' },
  { label: 'Ad Audiences', icon: Target, href: '/audiences' },
  { label: 'Call Logs', icon: Phone, href: '/calls' },
  { label: 'WhatsApp', icon: MessageCircle, href: '/whatsapp' },
  { label: 'SMS', icon: MessageSquare, href: '/sms' },
  { label: 'Settings', icon: Settings, href: '/settings' },
]

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { info, profile, logout } = useRestaurantStore()

  const { dateFilter, customStartDate, customEndDate } = useDateFilterStore()
  const [liveOrdersCount, setLiveOrdersCount] = useState<number>(0)
  const [monthOrdersCount, setMonthOrdersCount] = useState<number>(0)

  useEffect(() => {
    const tenantId = info?.id || '395b50b9-9504-47ce-a8be-3b5c3ff22315'
    
    async function fetchCounts() {
      try {
        // 1. Fetch live orders count (excluding CANCELLED and DELIVERED statuses)
        // Note: OUT_FOR_DELIVERY orders are stored as READY status in the database
        let liveQuery = supabase
          .from('orders')
          .select('id', { count: 'exact', head: true })
          .eq('tenant_id', tenantId)
          .in('status', ['PENDING', 'PAID', 'PREPARING', 'READY'])

        const { startDate, endDate } = useDateFilterStore.getState().getDateRange()
        if (startDate) {
          liveQuery = liveQuery.gte('order_place_at', startDate.toISOString())
        }
        if (endDate) {
          liveQuery = liveQuery.lt('order_place_at', endDate.toISOString())
        }

        const { count: liveCount, error: liveError } = await liveQuery

        if (!liveError && liveCount !== null) {
          setLiveOrdersCount(liveCount)
        }

        // 2. Fetch monthly orders count
        const startOfMonth = new Date()
        startOfMonth.setDate(1)
        startOfMonth.setHours(0, 0, 0, 0)

        const { count: monthCount, error: monthError } = await supabase
          .from('orders')
          .select('id', { count: 'exact', head: true })
          .eq('tenant_id', tenantId)
          .gte('order_place_at', startOfMonth.toISOString())

        if (!monthError && monthCount !== null) {
          setMonthOrdersCount(monthCount)
        }
      } catch (err) {
        console.error("Error fetching sidebar counts:", err)
      }
    }

    fetchCounts()

    // Subscribe to changes in the orders table to update counts in real time
    const channel = supabase
      .channel('sidebar-orders-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          fetchCounts()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [info?.id, dateFilter, customStartDate, customEndDate])

  const initials = profile?.name 
    ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) 
    : 'AM'
  const displayName = profile?.name || 'Alex Mendes'
  const displayEmail = profile?.email || 'alex@nypdq.com'

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  return (
    <aside className={cn(
      "w-[240px] bg-[#13131A] border-r border-border fixed left-0 top-0 h-full flex flex-col z-50 transition-transform duration-300 ease-in-out md:translate-x-0",
      isOpen ? "translate-x-0" : "-translate-x-full"
    )}>
      <div className="p-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl font-bold text-text-primary tracking-tight">
            Guileo<span className="text-primary">AI</span>
          </span>
          <Badge variant="outline" className="text-[10px] px-1 py-0 border-primary/30 text-primary uppercase font-bold">
            Beta
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-xs text-text-muted mt-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="truncate">{info?.name || 'Loading...'}</span>
        </div>
      </div>


      <nav className="flex-1 px-3 space-y-1 mt-4 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const badgeValue = item.label === 'Live Orders' ? liveOrdersCount : item.badge
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-150 group",
                isActive 
                  ? "bg-primary/15 text-primary border-r-2 border-primary rounded-r-none" 
                  : "text-text-muted hover:bg-surface2 hover:text-text-primary"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className={cn("w-5 h-5", isActive ? "text-primary" : "group-hover:text-text-primary")} />
                <span className="text-sm font-medium">{item.label}</span>
              </div>
              {item.comingSoon && (
                <Badge className="bg-primary/20 text-primary border-none text-[8px] px-1.5 h-4.5 font-black tracking-widest animate-pulse">
                  SOON
                </Badge>
              )}
              {badgeValue !== undefined && badgeValue > 0 && (
                <Badge className="bg-primary text-white text-[10px] px-1.5 h-4 min-w-[16px] flex items-center justify-center">
                  {badgeValue}
                </Badge>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 mt-auto border-t border-border space-y-4">
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
          <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wider mb-1">Growth Plan</p>
          <div className="flex items-center justify-between text-xs text-text-primary">
            <span>Orders this month</span>
            <span className="font-semibold">{monthOrdersCount} / 2000</span>
          </div>
          <div className="w-full bg-surface2 h-1 rounded-full mt-2">
            <div 
              className="bg-amber-500 h-1 rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(100, Math.round((monthOrdersCount / 2000) * 100))}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
            {initials}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium text-text-primary truncate">{displayName}</p>
            <p className="text-[10px] text-text-muted truncate">{displayEmail}</p>
          </div>
          <button 
            suppressHydrationWarning 
            className="text-text-muted hover:text-danger transition-colors"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
