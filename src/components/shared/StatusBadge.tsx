import { OrderStatus } from '@/lib/types'
import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: OrderStatus
  className?: string
}

const statusConfig: Record<OrderStatus, { label: string; className: string }> = {
  PENDING: {
    label: 'Pending',
    className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20'
  },
  PAID: {
    label: 'Paid',
    className: 'bg-blue-500/20 text-blue-400 border-blue-500/20'
  },
  PREPARING: {
    label: 'Preparing',
    className: 'bg-violet-500/20 text-violet-400 border-violet-500/20'
  },
  READY: {
    label: 'Ready',
    className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20'
  },
  OUT_FOR_DELIVERY: {
    label: 'Out for Delivery',
    className: 'bg-sky-500/20 text-sky-400 border-sky-500/20'
  },
  DELIVERED: {
    label: 'Delivered',
    className: 'bg-gray-500/20 text-gray-400 border-gray-500/20'
  },
  CANCELLED: {
    label: 'Cancelled',
    className: 'bg-red-500/20 text-red-400 border-red-500/20'
  }
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]
  
  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
      config.className,
      className
    )}>
      {config.label}
    </span>
  )
}
