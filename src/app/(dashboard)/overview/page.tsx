'use client'

import { 
  DollarSign, 
  ShoppingBag, 
  TrendingUp, 
  PhoneCall, 
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
import { GlobalDateFilter } from '@/components/shared/GlobalDateFilter'
import { useDateFilterStore } from '@/lib/stores/dateFilterStore'

export default function OverviewPage() {
  const { info, customers, fetchCustomers } = useRestaurantStore()
  const { orders, fetchOrders } = useOrdersStore()
  const [totalCallsCount, setTotalCallsCount] = useState(0)
  const { dateFilter, customStartDate, customEndDate, getDateRange } = useDateFilterStore()

  useEffect(() => {
    fetchCustomers()
    fetchOrders()
    
    // Fetch count of total calls from Supabase based on date
    async function getTotalCalls() {
      try {
        let query = supabase
          .from('vapi_call_logs')
          .select('id', { count: 'exact' })
        
        const { startDate, endDate } = getDateRange()
        
        if (startDate) {
          query = query.gte('started_at', startDate.toISOString())
        }
        if (endDate) {
          query = query.lt('started_at', endDate.toISOString())
        }

        const { data, count, error } = await query

        if (error) {
          console.error("Error fetching calls:", error)
        } else {
          setTotalCallsCount(count || (data ? data.length : 0))
        }
      } catch (e) {
        console.error(e)
      }
    }
    getTotalCalls()
  }, [fetchCustomers, fetchOrders, dateFilter, customStartDate, customEndDate])

  // Orders are already filtered by the ordersStore based on date filter, so no local filter needed
  const filteredOrders = orders

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
            <GlobalDateFilter />

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
          icon={PhoneCall} 
          label="Total Calls" 
          value={totalCallsCount.toString()} 
          change={15} 
          trend="up" 
          color="blue" 
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
