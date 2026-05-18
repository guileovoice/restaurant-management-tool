'use client'

import { useState } from 'react'
import { 
  DndContext, 
  DragOverlay, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects
} from '@dnd-kit/core'
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy 
} from '@dnd-kit/sortable'
import { useOrdersStore } from '@/lib/stores/ordersStore'
import { OrderStatus, Order } from '@/lib/types'
import { KanbanColumn } from './KanbanColumn'
import { OrderCard } from './OrderCard'
import { OrderDetailModal } from './OrderDetailModal'
import { toast } from 'react-hot-toast'

const COLUMNS: OrderStatus[] = ['PAID', 'PENDING', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED']

interface KanbanBoardProps {
  searchQuery?: string
  activeChannel?: string
  activeType?: string
}

export function KanbanBoard({ searchQuery = '', activeChannel = 'all', activeType = 'all' }: KanbanBoardProps) {
  const { orders, updateOrderStatus } = useOrdersStore()
  const [activeId, setActiveId] = useState<string | null>(null)
  const [activeOrder, setActiveOrder] = useState<Order | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  // Filter orders according to active controls
  const filteredOrders = orders.filter(o => {
    const matchesSearch = (o.customerName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (o.orderNumber || '').toLowerCase().includes(searchQuery.toLowerCase())
    const matchesChannel = activeChannel === 'all' || (o.channel || '').toLowerCase() === activeChannel.toLowerCase()
    const matchesType = activeType === 'all' || (o.type || '').toLowerCase() === activeType.toLowerCase()
    return matchesSearch && matchesChannel && matchesType
  })

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    setActiveId(active.id as string)
    setActiveOrder(orders.find(o => o.id === active.id) || null)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    // Find the status of the item being dragged over
    const overColumn = COLUMNS.find(col => col === overId) || 
                       orders.find(o => o.id === overId)?.status

    if (overColumn && activeOrder && activeOrder.status !== overColumn) {
      // Logic to update status would go here if we want real-time drag-over updates
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)
    setActiveOrder(null)

    if (!over) return

    const activeOrderId = active.id as string
    const overId = over.id as string

    // Check if dropped over a column or another card
    const overColumn = COLUMNS.includes(overId as OrderStatus) 
      ? (overId as OrderStatus) 
      : orders.find(o => o.id === overId)?.status

    if (overColumn && activeOrderId) {
      updateOrderStatus(activeOrderId, overColumn)
      toast.success(`Order moved to ${overColumn}`)
    }
  }

  const handleMove = async (id: string, nextStatus: OrderStatus) => {
    await updateOrderStatus(id, nextStatus)
    toast.success(`Order status updated to ${nextStatus}`)
  }

  const handleCancel = async (id: string) => {
    await updateOrderStatus(id, 'CANCELLED')
    toast.error('Order marked as CANCELLED')
  }

  return (
    <>
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-6 overflow-x-auto pb-4 h-[calc(100vh-220px)] min-h-[500px]">
          {COLUMNS.map((status) => (
            <KanbanColumn 
              key={status} 
              status={status} 
              orders={filteredOrders.filter(o => o.status === status)} 
              onMove={handleMove}
              onCancel={handleCancel}
              onSelect={(order) => {
                setSelectedOrder(order)
                setIsDetailOpen(true)
              }}
            />
          ))}
        </div>

        <DragOverlay dropAnimation={{
          sideEffects: defaultDropAnimationSideEffects({
            styles: {
              active: {
                opacity: '0.5',
              },
            },
          }),
        }}>
          {activeId && activeOrder ? (
            <div className="rotate-3 shadow-2xl opacity-90 w-[280px]">
              <OrderCard order={activeOrder} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {selectedOrder && (
        <OrderDetailModal 
          order={selectedOrder} 
          isOpen={isDetailOpen} 
          onClose={() => setIsDetailOpen(false)} 
        />
      )}
    </>
  )
}
