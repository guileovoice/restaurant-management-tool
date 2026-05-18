'use client'

import { useState, useEffect } from 'react'
import { Clock, Truck, MapPin, Play, CheckCircle, Package, ArrowRight, User } from 'lucide-react'
import { Order, OrderStatus } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

interface KitchenTicketProps {
  order: Order
  onStatusUpdate: (id: string, newStatus: OrderStatus) => void
  onClick?: () => void
}

const statusConfig: Record<OrderStatus, { label: string; border: string; bg: string; text: string }> = {
  PENDING: { label: 'Pending', border: 'border-l-amber-500', bg: 'bg-amber-500/10', text: 'text-amber-500' },
  PAID: { label: 'Paid', border: 'border-l-blue-500', bg: 'bg-blue-500/10', text: 'text-blue-500' },
  PREPARING: { label: 'Preparing', border: 'border-l-violet-500', bg: 'bg-violet-500/10', text: 'text-violet-500' },
  READY: { label: 'Ready', border: 'border-l-emerald-500', bg: 'bg-emerald-500/10', text: 'text-emerald-500' },
  OUT_FOR_DELIVERY: { label: 'On Route', border: 'border-l-sky-500', bg: 'bg-sky-500/10', text: 'text-sky-500' },
  DELIVERED: { label: 'Delivered', border: 'border-l-zinc-500', bg: 'bg-zinc-500/10', text: 'text-zinc-500' },
  CANCELLED: { label: 'Cancelled', border: 'border-l-red-500', bg: 'bg-red-500/10', text: 'text-red-500' }
}

export function KitchenTicket({ order, onStatusUpdate, onClick }: KitchenTicketProps) {
  const [elapsedTime, setElapsedTime] = useState(0)
  
  useEffect(() => {
    const start = new Date(order.createdAt).getTime()
    setElapsedTime(Math.floor((Date.now() - start) / 1000 / 60))

    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - start) / 1000 / 60))
    }, 30000)

    return () => clearInterval(timer)
  }, [order.createdAt])

  const formattedPlacedTime = order.createdAt ? format(new Date(order.createdAt), 'HH:mm') : '14:32'

  const getActionButton = () => {
    switch (order.status) {
      case 'PENDING':
      case 'PAID':
        return {
          label: 'Accept & Prep',
          icon: <Play className="w-3.5 h-3.5 mr-1 text-white" />,
          className: 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-950/20',
          nextStatus: 'PREPARING' as OrderStatus
        }
      case 'PREPARING':
        return {
          label: 'Mark Ready',
          icon: <CheckCircle className="w-3.5 h-3.5 mr-1 text-white" />,
          className: 'bg-violet-600 hover:bg-violet-500 text-white shadow-violet-950/20',
          nextStatus: 'READY' as OrderStatus
        }
      case 'READY':
        if (order.type === 'DELIVERY') {
          return {
            label: 'Dispatch Out',
            icon: <Truck className="w-3.5 h-3.5 mr-1 text-white" />,
            className: 'bg-sky-600 hover:bg-sky-500 text-white shadow-sky-950/20',
            nextStatus: 'OUT_FOR_DELIVERY' as OrderStatus
          }
        } else {
          return {
            label: 'Complete Order',
            icon: <Package className="w-3.5 h-3.5 mr-1 text-white" />,
            className: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/20',
            nextStatus: 'DELIVERED' as OrderStatus
          }
        }
      case 'OUT_FOR_DELIVERY':
        return {
          label: 'Mark Delivered',
          icon: <CheckCircle className="w-3.5 h-3.5 mr-1 text-white" />,
          className: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/20',
          nextStatus: 'DELIVERED' as OrderStatus
        }
      default:
        return null
    }
  }

  const action = getActionButton()
  const cfg = statusConfig[order.status] || statusConfig.PENDING
  const isOverdue = elapsedTime >= 15 && order.status !== 'DELIVERED'

  return (
    <Card 
      onClick={onClick}
      className={cn(
        "bg-[#111116] border border-zinc-800/80 rounded-2xl overflow-hidden flex flex-col justify-between h-[360px] shadow-lg relative group transition-all cursor-pointer hover:border-primary/45 hover:shadow-2xl hover:shadow-primary/5 active:scale-[0.99]",
        isOverdue ? "ring-1 ring-red-500/30 shadow-red-950/10" : ""
      )}
    >
      <div>
        {/* Ticket Top bar */}
        <div className={cn(
          "p-3 flex items-center justify-between text-white border-b border-zinc-800/60",
          isOverdue ? "bg-red-950/30" : "bg-zinc-900/40"
        )}>
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-base font-black font-mono tracking-tighter text-text-primary truncate">#{order.orderNumber}</span>
            <Badge className={cn("text-[8px] font-black uppercase tracking-wider border-none px-1.5 py-0 shrink-0", cfg.bg, cfg.text)}>
              {cfg.label}
            </Badge>
          </div>
          
          <div className="flex items-center gap-1 shrink-0">
            <Clock className={cn("w-3 h-3", isOverdue ? "text-red-500 animate-pulse" : "text-zinc-500")} />
            <span className={cn("text-[10px] font-bold font-mono", isOverdue ? "text-red-500 animate-pulse font-black" : "text-zinc-400")}>
              {elapsedTime}m
            </span>
          </div>
        </div>

        {/* Customer Header */}
        <div className="p-3 flex justify-between items-center text-[11px] border-b border-zinc-800/10">
          <div className="min-w-0 flex-1">
            <p className="font-black text-text-primary flex items-center gap-1 truncate text-xs">
              <User className="w-3 h-3 text-primary shrink-0" /> {order.customerName}
            </p>
            <p className="text-[9px] text-zinc-500 mt-0.5 tracking-wider uppercase flex items-center gap-1 font-semibold truncate">
              {order.type === 'DELIVERY' ? <Truck className="w-3 h-3 text-amber-500" /> : <MapPin className="w-3 h-3 text-blue-500" />}
              {order.type}
            </p>
          </div>
          <span className="text-[9px] text-zinc-500 font-mono tracking-tighter shrink-0 pl-1">Placed {formattedPlacedTime}</span>
        </div>

        {/* Order Items (Compact slice) */}
        <div className="p-3 space-y-1.5 overflow-hidden">
          {order.items.slice(0, 3).map((item) => (
            <div key={item.id} className="flex items-center gap-2 p-1.5 bg-zinc-900/30 border border-zinc-800/30 rounded-xl">
              <div className="bg-primary/10 text-primary w-5 h-5 rounded-md flex items-center justify-center text-xs font-black shrink-0 border border-primary/20">
                {item.quantity}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold text-text-primary uppercase leading-tight tracking-wider truncate">{item.name}</p>
                {item.notes && (
                  <p className="text-[9px] text-amber-500 font-black uppercase tracking-wider truncate">
                    ⚠️ {item.notes}
                  </p>
                )}
              </div>
            </div>
          ))}

          {order.items.length > 3 && (
            <p className="text-[9px] text-primary font-bold text-center mt-1 animate-pulse uppercase tracking-widest">
              + {order.items.length - 3} more items (Tap to open)
            </p>
          )}
        </div>
      </div>

      <div>
        {/* Address / Type footer info */}
        {order.type === 'DELIVERY' && order.address && (
          <div className="px-3 py-1.5 border-t border-zinc-800/30 bg-zinc-900/10 text-[9px] text-zinc-400 flex items-center gap-1.5 truncate">
            <MapPin className="w-3 h-3 text-sky-500 shrink-0" />
            <span className="truncate uppercase font-bold">{order.address}</span>
          </div>
        )}

        {/* Status Trigger Action Button at bottom */}
        {action && (
          <div className="p-2 border-t border-zinc-800/60 bg-[#121217]">
            <Button 
              className={cn(
                "w-full h-8 rounded-lg text-[10px] font-bold uppercase tracking-wider active:scale-95 transition-all shadow-md",
                action.className
              )}
              onClick={(e) => { 
                e.stopPropagation()
                onStatusUpdate(order.id, action.nextStatus) 
              }}
            >
              {action.icon}
              {action.label}
              <ArrowRight className="w-3 h-3 ml-0.5 text-white/80" />
            </Button>
          </div>
        )}
      </div>
    </Card>
  )
}
