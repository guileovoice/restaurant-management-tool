'use client'

import { useEffect, useState } from 'react'
import { Filter, RotateCw, Plus, Search } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { KanbanBoard } from '@/components/orders/KanbanBoard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useOrdersStore } from '@/lib/stores/ordersStore'

export default function OrdersPage() {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeChannel, setActiveChannel] = useState('all')
  const [activeType, setActiveType] = useState('all')
  const { fetchOrders } = useOrdersStore()

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchOrders()
    setIsRefreshing(false)
  }

  // Format a simple live timestamp
  const [lastUpdated, setLastUpdated] = useState('Just now')
  useEffect(() => {
    setLastUpdated(new Date().toLocaleTimeString())
  }, [isRefreshing])

  return (
    <div className="space-y-6 h-full flex flex-col">
      <PageHeader 
        title="Live Orders" 
        subtitle="Manage and track incoming orders in real-time."
        actions={
          <div className="flex gap-3">
            <div className="flex items-center gap-2 px-3 py-1 bg-surface2 border border-border rounded-lg mr-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Live</span>
            </div>
            <Button variant="outline" className="border-border bg-surface text-text-primary gap-2" onClick={handleRefresh}>
              <RotateCw className={isRefreshing ? "w-4 h-4 animate-spin" : "w-4 h-4"} />
              Refresh
            </Button>
            <Button className="bg-primary hover:bg-primary-dark text-white gap-2">
              <Plus className="w-4 h-4" />
              New Order
            </Button>
          </div>
        }
      />

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-surface p-4 rounded-xl border border-border">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <Input 
              placeholder="Search orders..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-surface2 border-border h-9 text-sm" 
            />
          </div>
          
          <Select value={activeChannel} onValueChange={setActiveChannel}>
            <SelectTrigger className="w-[140px] bg-surface2 border-border h-9 text-sm">
              <SelectValue placeholder="All Channels" />
            </SelectTrigger>
            <SelectContent className="bg-surface border-border">
              <SelectItem value="all">All Channels</SelectItem>
              <SelectItem value="voice">Voice</SelectItem>
              <SelectItem value="whatsapp">WhatsApp</SelectItem>
              <SelectItem value="web">Web</SelectItem>
            </SelectContent>
          </Select>

          <Select value={activeType} onValueChange={setActiveType}>
            <SelectTrigger className="w-[140px] bg-surface2 border-border h-9 text-sm">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent className="bg-surface border-border">
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="delivery">Delivery</SelectItem>
              <SelectItem value="pickup">Pickup</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 text-xs text-text-muted">
          <span>Last updated: {lastUpdated}</span>
        </div>
      </div>

      <KanbanBoard 
        searchQuery={searchQuery} 
        activeChannel={activeChannel} 
        activeType={activeType} 
      />
    </div>
  )
}
