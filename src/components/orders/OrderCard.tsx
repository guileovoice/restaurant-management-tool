'use client'

import { formatDistanceToNow } from 'date-fns'
import { Phone, MessageSquare, Globe, Truck, MapPin, ChevronRight, XCircle } from 'lucide-react'
import { Order, OrderStatus } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface OrderCardProps {
  order: Order
  onMove?: (id: string, nextStatus: OrderStatus) => void
  onCancel?: (id: string) => void
}

const statusColors: Record<OrderStatus, string> = {
  PENDING: 'border-l-amber-500',
  PAID: 'border-l-blue-500',
  PREPARING: 'border-l-violet-500',
  READY: 'border-l-emerald-500',
  OUT_FOR_DELIVERY: 'border-l-sky-500',
  DELIVERED: 'border-l-gray-500',
  CANCELLED: 'border-l-red-500'
}

const channelIcons = {
  VOICE: <Phone className="w-3 h-3 text-violet-400" />,
  WHATSAPP: <MessageSquare className="w-3 h-3 text-emerald-400" />,
  WEB: <Globe className="w-3 h-3 text-blue-400" />,
  SMS: <MessageSquare className="w-3 h-3 text-amber-400" />
}

export function OrderCard({ order, onMove, onCancel }: OrderCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: order.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const nextStatusMap: Partial<Record<OrderStatus, OrderStatus>> = {
    PENDING: 'PAID',
    PAID: 'PREPARING',
    PREPARING: 'READY',
    READY: 'OUT_FOR_DELIVERY',
    OUT_FOR_DELIVERY: 'DELIVERED'
  }

  const nextStatus = nextStatusMap[order.status]

  return (
    <Card 
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "bg-surface border-border border-l-4 mb-3 hover:shadow-lg transition-all cursor-pointer group",
        statusColors[order.status],
        isDragging && "opacity-30 pointer-events-none"
      )}
    >
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex flex-col min-w-0">
            <span className="font-mono text-[9px] text-text-muted">#{order.orderNumber}</span>
            <span className="font-bold text-sm text-text-primary truncate">{order.customerName}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-surface2 px-1.5 py-0.5 rounded text-[10px] font-bold text-text-muted shrink-0 ml-2">
            {channelIcons[order.channel]}
            {order.channel}
          </div>
        </div>

        <div className="space-y-1 mb-3">
          {order.items.slice(0, 2).map((item) => (
            <div key={item.id} className="flex justify-between text-xs text-text-primary">
              <span>{item.quantity}× {item.name}</span>
              <span className="text-text-muted">${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          {order.items.length > 2 && (
            <p className="text-[10px] text-primary font-medium">+{order.items.length - 2} more items</p>
          )}
        </div>

        <div className="flex items-center gap-2 mb-3 text-[10px] text-text-muted">
          <div className={cn(
            "flex items-center gap-1 px-1.5 py-0.5 rounded",
            order.type === 'DELIVERY' ? "bg-amber-500/10 text-amber-500" : "bg-blue-500/10 text-blue-500"
          )}>
            {order.type === 'DELIVERY' ? <Truck className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
            {order.type}
          </div>
          <span className="truncate flex-1">{order.address || 'Pickup at Counter'}</span>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="flex flex-col">
            <span className="text-[10px] text-text-muted font-bold uppercase tracking-widest">Total</span>
            <span className="text-sm font-bold text-text-primary">${order.total.toFixed(2)}</span>
          </div>
          <span className="text-[10px] text-text-muted">{formatDistanceToNow(new Date(order.createdAt))} ago</span>
        </div>

        <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex-1 h-7 text-[10px] text-text-muted hover:text-danger hover:bg-danger/10"
            onClick={(e) => { e.stopPropagation(); onCancel?.(order.id) }}
          >
            <XCircle className="w-3 h-3 mr-1" /> Cancel
          </Button>
          {nextStatus && (
            <Button 
              size="sm" 
              className="flex-1 h-7 text-[10px] bg-primary hover:bg-primary-dark text-white"
              onClick={(e) => { e.stopPropagation(); onMove?.(order.id, nextStatus) }}
            >
              {nextStatus} <ChevronRight className="w-3 h-3 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}
