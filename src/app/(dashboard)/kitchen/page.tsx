'use client'

import { useState, useEffect } from 'react'
import { Maximize, Volume2, Type, ChevronLeft, RefreshCw } from 'lucide-react'
import { useOrdersStore } from '@/lib/stores/ordersStore'
import { KitchenTicket } from '@/components/kitchen/KitchenTicket'
import { OrderDetailModal } from '@/components/orders/OrderDetailModal'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { format } from 'date-fns'
import { Order } from '@/lib/types'

export default function KitchenPage() {
  const { orders, updateOrderStatus, fetchOrders } = useOrdersStore()
  const [time, setTime] = useState(new Date())
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Load all active order statuses that need kitchen attention or dispatch tracking
  const kitchenOrders = orders.filter(o => 
    o.status === 'PENDING' || 
    o.status === 'PAID' || 
    o.status === 'PREPARING' || 
    o.status === 'READY' ||
    o.status === 'OUT_FOR_DELIVERY'
  )

  useEffect(() => {
    setMounted(true)
    fetchOrders()
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [fetchOrders])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchOrders()
    setIsRefreshing(false)
  }

  const handleStatusUpdate = async (id: string, newStatus: any) => {
    await updateOrderStatus(id, newStatus)
  }

  return (
    <div className="h-screen flex flex-col bg-[#08080C] text-white p-6 overflow-hidden select-none animate-in fade-in duration-500">
      {/* Kitchen HUD Header */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 shrink-0 bg-surface/35 border border-border/40 p-4 rounded-2xl backdrop-blur-md gap-4">
        <div className="flex items-center justify-between md:justify-start gap-4 w-full md:w-auto">
          <Link href="/overview">
            <Button variant="ghost" className="text-zinc-400 hover:text-white hover:bg-white/5 gap-2 text-xs font-bold uppercase tracking-wider h-8 px-2 sm:px-4">
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back Dashboard</span>
              <span className="sm:hidden">Back</span>
            </Button>
          </Link>
          <div className="h-6 w-px bg-zinc-800 hidden sm:block" />
          <div>
            <h1 className="text-lg sm:text-xl font-black uppercase tracking-widest text-text-primary flex items-center gap-2">
              Guileo<span className="text-primary font-bold">KITCHEN</span>
              <span className="text-[9px] bg-red-600/20 text-red-500 px-1.5 py-0.5 rounded font-black border border-red-500/30 animate-pulse uppercase shrink-0">
                Live HUD
              </span>
            </h1>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">
              Active Queue: <span className="text-primary font-black">{kitchenOrders.length} orders</span>
            </p>
          </div>
        </div>

        <div className="text-center w-full md:w-auto py-1 md:py-0 border-y border-zinc-800/40 md:border-none">
          <div className="text-xl sm:text-2xl font-black font-mono tracking-tighter text-text-primary">
            {mounted ? format(time, 'HH:mm:ss') : '--:--:--'}
          </div>
          <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">
            {mounted ? format(time, 'EEEE, MMMM d') : 'LOADING...'}
          </div>
        </div>

        <div className="flex items-center justify-center md:justify-end gap-2 w-full md:w-auto">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleRefresh}
            className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-white w-8 h-8"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Button variant="outline" size="icon" className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-white w-8 h-8">
            <Type className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-white w-8 h-8">
            <Volume2 className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-white w-8 h-8">
            <Maximize className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Ticket Grid Area */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
        <div className="flex gap-6 h-full items-start">
          {kitchenOrders.map((order) => (
            <div key={order.id} className="w-[240px] shrink-0 h-full">
              <KitchenTicket 
                order={order} 
                onStatusUpdate={handleStatusUpdate} 
                onClick={() => {
                  setSelectedOrder(order)
                  setIsDetailOpen(true)
                }}
              />
            </div>
          ))}
          
          {kitchenOrders.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-zinc-800/80 rounded-3xl opacity-35 bg-surface/5 py-32">
              <span className="text-4xl font-black uppercase tracking-widest mb-2 text-zinc-500">NO ACTIVE TICKETS</span>
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-600">All orders are cleared and delivered</span>
            </div>
          )}
        </div>
      </div>

      {/* Order Detail centered dialog popup */}
      {selectedOrder && (
        <OrderDetailModal 
          order={selectedOrder} 
          isOpen={isDetailOpen} 
          onClose={() => {
            setIsDetailOpen(false)
            setSelectedOrder(null)
          }} 
        />
      )}
    </div>
  )
}
