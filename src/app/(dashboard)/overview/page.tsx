'use client'

import { 
  DollarSign, 
  ShoppingBag, 
  TrendingUp, 
  PhoneMissed, 
  UserPlus, 
  RefreshCw,
  ChefHat,
  Plus,
  Megaphone,
  AlertTriangle,
  Download
} from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatCard } from '@/components/overview/StatCard'
import { RevenueChart } from '@/components/overview/RevenueChart'
import { ChannelBreakdown } from '@/components/overview/ChannelBreakdown'
import { TopItems } from '@/components/overview/TopItems'
import { RecentActivity } from '@/components/overview/RecentActivity'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { useRestaurantStore } from '@/lib/stores/restaurantStore'
import { useOrdersStore } from '@/lib/stores/ordersStore'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'react-hot-toast'

export default function OverviewPage() {
  const { info, customers, fetchCustomers } = useRestaurantStore()
  const { orders, fetchOrders } = useOrdersStore()
  const [missedCallsCount, setMissedCallsCount] = useState(0)
  const [dateFilter, setDateFilter] = useState<'today' | 'yesterday' | '7d' | '30d' | 'all'>('all')

  useEffect(() => {
    fetchCustomers()
    fetchOrders()
    
    // Fetch count of missed calls from Supabase
    async function getMissedCalls() {
      try {
        const { data, error } = await supabase
          .from('vapi_call_logs')
          .select('id')
          .eq('status', 'missed')
        if (data) {
          setMissedCallsCount(data.length)
        }
      } catch (e) {
        console.error(e)
      }
    }
    getMissedCalls()
  }, [fetchCustomers, fetchOrders])

  // Filter orders dynamically based on selected date filter
  const filteredOrders = orders.filter(o => {
    if (!o.createdAt) return true
    const orderDate = new Date(o.createdAt)
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const yesterdayStart = new Date(todayStart)
    yesterdayStart.setDate(yesterdayStart.getDate() - 1)
    const yesterdayEnd = new Date(todayStart)

    const sevenDaysAgo = new Date(todayStart)
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const thirtyDaysAgo = new Date(todayStart)
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    switch (dateFilter) {
      case 'today':
        return orderDate >= todayStart
      case 'yesterday':
        return orderDate >= yesterdayStart && orderDate < yesterdayEnd
      case '7d':
        return orderDate >= sevenDaysAgo
      case '30d':
        return orderDate >= thirtyDaysAgo
      case 'all':
      default:
        return true
    }
  })

  // Dynamic calculations based on filtered subset
  const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.total, 0)
  const totalOrders = filteredOrders.length
  const avgOrderValue = totalOrders ? (totalRevenue / totalOrders) : 0
  const totalCustomers = customers.length

  // Dynamically count repeat customers from live orders
  const customerOrderCounts: Record<string, number> = {}
  filteredOrders.forEach(o => {
    const custId = o.customerId || o.customerName || 'anonymous'
    customerOrderCounts[custId] = (customerOrderCounts[custId] || 0) + 1
  })
  const repeatCount = Object.values(customerOrderCounts).filter(c => c > 1).length
  const uniqueBuyersCount = Object.keys(customerOrderCounts).length
  const repeatRate = uniqueBuyersCount ? Math.round((repeatCount / uniqueBuyersCount) * 100) : 0

  // Download filtered orders report as real CSV file
  const handleDownloadReport = () => {
    if (filteredOrders.length === 0) {
      toast.error("No data available to download in the selected period!")
      return
    }

    // CSV Headers
    const headers = [
      "Order ID", 
      "Order Number", 
      "Customer Name", 
      "Phone", 
      "Channel", 
      "Type", 
      "Status", 
      "Subtotal", 
      "Total", 
      "Placed At", 
      "Items"
    ]
    
    // CSV Rows
    const rows = filteredOrders.map(o => [
      `"${o.id}"`,
      `"${o.orderNumber}"`,
      `"${o.customerName}"`,
      `"${o.customerPhone}"`,
      `"${o.channel}"`,
      `"${o.type}"`,
      `"${o.status}"`,
      o.subtotal.toFixed(2),
      o.total.toFixed(2),
      `"${new Date(o.createdAt).toLocaleString()}"`,
      `"${o.items.map(i => `${i.quantity}x ${i.name}`).join('; ')}"`
    ])

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n")
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `guileo_analytics_${dateFilter}_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success("CSV Report compiled and downloaded successfully!")
  }

  return (
    <div suppressHydrationWarning className="space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="Dashboard Overview" 
        subtitle={`Welcome back. Here's what's happening at ${info?.name || 'your restaurant'} today.`}
        actions={
          <div className="flex flex-wrap gap-3 items-center">
            {/* Elegant Button Group Date Selector */}
            <div className="flex bg-surface2 border border-border p-1 rounded-xl items-center gap-1 shadow-inner mr-2">
              {[
                { label: 'Today', value: 'today' },
                { label: 'Yesterday', value: 'yesterday' },
                { label: '7 Days', value: '7d' },
                { label: '30 Days', value: '30d' },
                { label: 'All Time', value: 'all' }
              ].map(opt => (
                <Button 
                  suppressHydrationWarning
                  key={opt.value}
                  variant="ghost" 
                  size="sm"
                  onClick={() => setDateFilter(opt.value as any)}
                  className={`text-[10px] uppercase font-black tracking-wider px-3.5 py-1.5 h-8 rounded-lg transition-all ${
                    dateFilter === opt.value 
                      ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.03]' 
                      : 'text-text-muted hover:text-white hover:bg-white/5'
                  }`}
                >
                  {opt.label}
                </Button>
              ))}
            </div>

            <Button 
              suppressHydrationWarning
              onClick={handleDownloadReport}
              variant="outline" 
              className="border-border bg-surface hover:bg-surface2 text-text-primary gap-2 text-xs font-bold uppercase tracking-wider h-9"
            >
              <Download className="w-4 h-4 text-primary" />
              Download Report
            </Button>
            
          </div>
        }
      />

      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard 
          icon={DollarSign} 
          label="Total Revenue" 
          value={`$${totalRevenue.toFixed(2)}`} 
          change={12} 
          trend="up" 
          color="emerald" 
        />
        <StatCard 
          icon={ShoppingBag} 
          label="Total Orders" 
          value={totalOrders.toString()} 
          change={8} 
          trend="up" 
          color="violet" 
        />
        <StatCard 
          icon={TrendingUp} 
          label="Avg Order Value" 
          value={`$${avgOrderValue.toFixed(2)}`} 
          change={3} 
          trend="up" 
          color="amber" 
        />
        <StatCard 
          icon={PhoneMissed} 
          label="Missed Calls" 
          value={missedCallsCount.toString()} 
          change={40} 
          trend="down" 
          color="red" 
        />
        <StatCard 
          icon={UserPlus} 
          label="Total Customers" 
          value={totalCustomers.toString()} 
          change={33} 
          trend="up" 
          color="blue" 
        />
        <StatCard 
          icon={RefreshCw} 
          label="Repeat Rate" 
          value={`${repeatRate}%`} 
          change={5} 
          trend="up" 
          color="emerald" 
        />
      </div>

      {/* Middle Row - Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <RevenueChart orders={filteredOrders} />
        </div>
        <div className="lg:col-span-4">
          <ChannelBreakdown orders={filteredOrders} />
        </div>
      </div>

      {/* Bottom Row - Activity & More */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-8">
        <div className="lg:col-span-4">
          <TopItems orders={filteredOrders} />
        </div>
        <div className="lg:col-span-4">
          <RecentActivity orders={filteredOrders} />
        </div>
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-6 bg-surface border-border">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 gap-3">
              <Link href="/kitchen">
                <Button suppressHydrationWarning variant="outline" className="w-full justify-start gap-3 border-border bg-surface2 text-text-primary hover:bg-border">
                  <ChefHat className="w-4 h-4 text-violet-500" />
                  View Kitchen HUD
                </Button>
              </Link>
              <Link href="/menu">
                <Button suppressHydrationWarning variant="outline" className="w-full justify-start gap-3 border-border bg-surface2 text-text-primary hover:bg-border">
                  <Plus className="w-4 h-4 text-emerald-500" />
                  Manage Menu Items
                </Button>
              </Link>
              <Link href="/campaigns">
                <Button suppressHydrationWarning variant="outline" className="w-full justify-start gap-3 border-border bg-surface2 text-text-primary hover:bg-border">
                  <Megaphone className="w-4 h-4 text-amber-500" />
                  Send Campaign
                </Button>
              </Link>
            </div>
          </Card>

          <Card className="p-6 bg-surface border-border">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Needs Attention</h3>
            <div className="space-y-3">
              <div className="flex gap-3 p-3 bg-amber-500/10 border-l-4 border-amber-500 rounded-r-lg">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                <p className="text-xs text-text-primary leading-tight">
                  Active orders waiting in Kitchen Prep queues
                </p>
              </div>
              <div className="flex gap-3 p-3 bg-red-500/10 border-l-4 border-red-500 rounded-r-lg">
                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                <p className="text-xs text-text-primary leading-tight">
                  Pão de Queijo (3 pack) — low stock flagged
                </p>
              </div>
              <div className="flex gap-3 p-3 bg-violet-500/10 border-l-4 border-violet-500 rounded-r-lg">
                <AlertTriangle className="w-4 h-4 text-violet-500 shrink-0" />
                <p className="text-xs text-text-primary leading-tight">
                  Inbound customer calls awaiting AI assistance
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
