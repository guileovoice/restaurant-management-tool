'use client'

import { useDroppable } from '@dnd-kit/core'
import { 
  SortableContext, 
  verticalListSortingStrategy 
} from '@dnd-kit/sortable'
import { Order, OrderStatus } from '@/lib/types'
import { OrderCard } from './OrderCard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface KanbanColumnProps {
  status: OrderStatus
  orders: Order[]
  onMove: (id: string, nextStatus: OrderStatus) => void
  onCancel: (id: string) => void
  onSelect: (order: Order) => void
}

const statusConfig: Record<OrderStatus, { label: string; color: string }> = {
  PENDING: { label: 'Pending', color: 'bg-amber-500' },
  PAID: { label: 'Paid', color: 'bg-blue-500' },
  PREPARING: { label: 'Preparing', color: 'bg-violet-500' },
  READY: { label: 'Ready', color: 'bg-emerald-500' },
  OUT_FOR_DELIVERY: { label: 'Out For Delivery', color: 'bg-sky-500' },
  DELIVERED: { label: 'Delivered', color: 'bg-gray-500' },
  CANCELLED: { label: 'Cancelled', color: 'bg-red-500' }
}

export function KanbanColumn({ status, orders, onMove, onCancel, onSelect }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  })

  const config = statusConfig[status]

  return (
    <div className="flex flex-col w-[300px] shrink-0">
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <div className={cn("w-2 h-2 rounded-full", config.color)} />
          <h3 className="font-semibold text-text-primary uppercase tracking-wider text-xs">{config.label}</h3>
          <Badge variant="outline" className="bg-surface2 text-text-muted border-border text-[10px] py-0 h-4 min-w-[18px] flex items-center justify-center">
            {orders.length}
          </Badge>
        </div>
        {status === 'PAID' && (
          <button className="p-1 hover:bg-surface2 rounded text-text-muted hover:text-primary transition-colors">
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>

      <div 
        ref={setNodeRef}
        className={cn(
          "flex-1 rounded-xl p-2 transition-colors duration-200 min-h-[150px] overflow-y-auto scrollbar-hide",
          isOver ? "bg-primary/5 border-2 border-dashed border-primary/20" : "bg-surface/30 border border-transparent"
        )}
      >
        <SortableContext items={orders.map(o => o.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {orders.map((order) => (
              <div key={order.id} onClick={() => onSelect(order)}>
                <OrderCard 
                  order={order} 
                  onMove={onMove} 
                  onCancel={onCancel} 
                />
              </div>
            ))}
            {orders.length === 0 && (
              <div className="flex flex-col items-center justify-center h-32 text-center">
                <p className="text-[10px] text-text-muted font-medium italic">No orders in {config.label}</p>
              </div>
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  )
}
