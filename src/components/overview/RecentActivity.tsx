'use client'

import { Phone, MessageSquare, CheckCircle, Globe, CreditCard, ShoppingBag } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Order } from '@/lib/types'
import { formatDistanceToNow } from 'date-fns'

interface RecentActivityProps {
  orders: Order[]
}

const channelIcons = {
  VOICE: { icon: Phone, color: 'text-violet-500 bg-violet-500/10' },
  WHATSAPP: { icon: MessageSquare, color: 'text-emerald-500 bg-emerald-500/10' },
  WEB: { icon: Globe, color: 'text-blue-500 bg-blue-500/10' },
  SMS: { icon: MessageSquare, color: 'text-amber-500 bg-amber-500/10' }
}

export function RecentActivity({ orders }: RecentActivityProps) {
  // Sort orders by most recent placed
  const sortedOrders = [...orders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  // Map top 5 most recent orders to activities
  const recentActivities = sortedOrders.slice(0, 5).map(o => {
    const channel = (o.channel || 'WEB').toUpperCase() as keyof typeof channelIcons
    const config = channelIcons[channel] || channelIcons.WEB
    
    let timeStr = 'Just now'
    try {
      timeStr = formatDistanceToNow(new Date(o.createdAt)) + ' ago'
    } catch (e) {}

    const itemsSummary = o.items.map(i => `${i.quantity}x ${i.name}`).join(', ')

    return {
      id: o.id,
      icon: config.icon,
      color: config.color,
      description: `${o.customerName} ordered ${itemsSummary}`,
      amount: `$${o.total.toFixed(2)}`,
      time: timeStr
    }
  })

  // Fallback visual data if no orders exist yet
  const displayActivities = recentActivities.length > 0 ? recentActivities : [
    {
      id: '1',
      icon: Phone,
      color: 'text-violet-500 bg-violet-500/10',
      description: 'João called and ordered Pão de Queijo x2',
      amount: '$17.00',
      time: '2m ago'
    },
    {
      id: '2',
      icon: MessageSquare,
      color: 'text-emerald-500 bg-emerald-500/10',
      description: 'WhatsApp order from Maria Silva',
      amount: '$24.50',
      time: '8m ago'
    },
    {
      id: '3',
      icon: CheckCircle,
      color: 'text-gray-500 bg-gray-500/10',
      description: 'Order #1044 delivered to 31st Ave',
      amount: undefined,
      time: '15m ago'
    }
  ]

  return (
    <Card className="p-6 bg-surface border-border h-full flex flex-col justify-between">
      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-6">Recent Activity</h3>
        <div className="space-y-4">
          {displayActivities.map((activity) => (
            <div key={activity.id} className="flex gap-3">
              <div className={`p-2 rounded-lg h-fit shrink-0 ${activity.color}`}>
                <activity.icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-text-primary leading-tight font-medium">
                  {activity.description} {activity.amount && <span className="font-black text-primary">— {activity.amount}</span>}
                </p>
                <p className="text-[10px] text-text-muted mt-1 font-mono">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
