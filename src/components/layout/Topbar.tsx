'use client'

import { useState, useEffect } from 'react'
import { Search, Bell, Calendar, ChevronDown, User, Command } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'

import { useRestaurantStore } from '@/lib/stores/restaurantStore'

export function Topbar() {
  const [time, setTime] = useState(new Date())
  const [mounted, setMounted] = useState(false)
  const [notificationCount, setNotificationCount] = useState(3)
  const { info, profile, logout } = useRestaurantStore()
  const router = useRouter()

  const initials = profile?.name 
    ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) 
    : 'AM'

  useEffect(() => {
    setMounted(true)
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur border-b border-border h-16 flex items-center justify-between px-6">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative max-w-md w-full group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
          <Input 
            suppressHydrationWarning
            placeholder="Search anything... (Cmd + K)" 
            className="pl-10 bg-surface2 border-border focus:ring-1 focus:ring-primary h-9 w-full"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-0.5 px-1.5 py-0.5 bg-surface rounded border border-border text-[10px] text-text-muted">
            <Command className="w-2 h-2" /> K
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden xl:flex items-center gap-2 text-sm text-text-muted border-r border-border pr-4 mr-2">
          <Calendar className="w-4 h-4" />
          <span>{mounted ? format(time, 'EEE, MMM d · hh:mm:ss aa') : 'Loading time...'}</span>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger suppressHydrationWarning asChild>
            <button className="relative p-2 text-text-muted hover:text-text-primary transition-all active:scale-95 outline-none">
              <Bell className="w-5 h-5" />
              {notificationCount > 0 && (
                <Badge className="absolute top-1 right-1 w-4 h-4 p-0 flex items-center justify-center bg-danger text-[9px] border-2 border-background animate-pulse">
                  {notificationCount}
                </Badge>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 bg-surface border-border p-2 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between p-2">
              <span className="text-xs font-black uppercase tracking-wider text-text-primary">Notifications</span>
              {notificationCount > 0 && (
                <button 
                  onClick={() => setNotificationCount(0)}
                  className="text-[9px] font-black text-primary uppercase tracking-widest hover:underline"
                >
                  Clear All
                </button>
              )}
            </div>
            <DropdownMenuSeparator className="bg-border my-1" />
            
            {notificationCount > 0 ? (
              <div className="space-y-1">
                <DropdownMenuItem className="p-2.5 rounded-xl hover:bg-surface2 focus:bg-surface2 flex flex-col items-start gap-1 cursor-pointer">
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[9px] font-black uppercase text-violet-500 tracking-wider">AI Phone Order</span>
                    <span className="text-[8px] text-text-muted font-mono">2m ago</span>
                  </div>
                  <p className="text-xs text-text-primary leading-tight font-medium">
                    João placed an order for Pão de Queijo x2 ($17.00) via Voice AI.
                  </p>
                </DropdownMenuItem>
                
                <DropdownMenuItem className="p-2.5 rounded-xl hover:bg-surface2 focus:bg-surface2 flex flex-col items-start gap-1 cursor-pointer">
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[9px] font-black uppercase text-amber-500 tracking-wider">Stock Warning</span>
                    <span className="text-[8px] text-text-muted font-mono">15m ago</span>
                  </div>
                  <p className="text-xs text-text-primary leading-tight font-medium">
                    Pão de Queijo (3 pack) stock is currently below the safety threshold.
                  </p>
                </DropdownMenuItem>

                <DropdownMenuItem className="p-2.5 rounded-xl hover:bg-surface2 focus:bg-surface2 flex flex-col items-start gap-1 cursor-pointer">
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[9px] font-black uppercase text-emerald-500 tracking-wider">WhatsApp Lead</span>
                    <span className="text-[8px] text-text-muted font-mono">32m ago</span>
                  </div>
                  <p className="text-xs text-text-primary leading-tight font-medium">
                    Maria Silva sent an order request via WhatsApp. Awaiting review.
                  </p>
                </DropdownMenuItem>
              </div>
            ) : (
              <div className="p-6 text-center text-text-muted text-xs font-bold uppercase tracking-wider">
                🎉 No new notifications!
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger suppressHydrationWarning className="flex items-center gap-2 p-1 pl-2 pr-1 rounded-full border border-border hover:bg-surface2 transition-all outline-none">
            <span className="text-xs font-medium text-text-primary px-1">{info?.name || 'Loading...'}</span>
            <div className="w-7 h-7 rounded-full bg-surface2 flex items-center justify-center">
              <ChevronDown className="w-4 h-4 text-text-muted" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-surface border-border">
            <DropdownMenuLabel className="text-text-primary">Switch Restaurant</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem className="text-text-primary focus:bg-surface2 focus:text-primary cursor-pointer">
              {info?.name}
            </DropdownMenuItem>

            <DropdownMenuItem className="text-text-muted focus:bg-surface2 cursor-pointer">
              NYPDQ · Brooklyn (Coming Soon)
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem className="text-primary focus:bg-primary/10 cursor-pointer">
              + Add New Location
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger suppressHydrationWarning className="outline-none">
            <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold cursor-pointer hover:bg-primary/30 transition-all">
              {initials}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-surface border-border">
            <DropdownMenuLabel className="text-text-primary">My Account</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem className="text-text-primary focus:bg-surface2 cursor-pointer" onClick={() => router.push('/settings?tab=business')}>Profile</DropdownMenuItem>
            <DropdownMenuItem className="text-text-primary focus:bg-surface2 cursor-pointer" onClick={() => router.push('/settings?tab=billing')}>Billing</DropdownMenuItem>
            <DropdownMenuItem className="text-text-primary focus:bg-surface2 cursor-pointer" onClick={() => router.push('/settings?tab=team')}>Team</DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem 
              className="text-danger focus:bg-danger/10 cursor-pointer"
              onClick={async () => {
                await logout()
                router.push('/login')
              }}
            >
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
