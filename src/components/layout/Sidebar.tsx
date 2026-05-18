'use client'

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
  Settings,
  LogOut
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { useRestaurantStore } from '@/lib/stores/restaurantStore'

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
  { label: 'Settings', icon: Settings, href: '/settings' },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { info, profile, logout } = useRestaurantStore()

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
    <aside className="w-[240px] bg-[#13131A] border-r border-border fixed left-0 top-0 h-full flex flex-col z-50">
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
              {item.badge && (
                <Badge className="bg-primary text-white text-[10px] px-1.5 h-4 min-w-[16px] flex items-center justify-center">
                  {item.badge}
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
            <span className="font-semibold">842 / 2000</span>
          </div>
          <div className="w-full bg-surface2 h-1 rounded-full mt-2">
            <div className="bg-amber-500 h-1 rounded-full w-[42%]" />
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
