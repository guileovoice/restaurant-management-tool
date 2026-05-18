'use client'

import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts'
import { Card } from '@/components/ui/card'
import { Order } from '@/lib/types'

const COLORS = ['#6C3CE1', '#10B981', '#F59E0B', '#3B82F6']

interface ChannelBreakdownProps {
  orders: Order[]
}

export function ChannelBreakdown({ orders }: { orders: Order[] }) {
  // Aggregate orders count by channel
  const channelCounts = { VOICE: 0, WHATSAPP: 0, WEB: 0, SMS: 0 }
  
  orders.forEach(o => {
    const channel = (o.channel || 'WEB').toUpperCase() as keyof typeof channelCounts
    if (channelCounts[channel] !== undefined) {
      channelCounts[channel]++
    } else {
      channelCounts.WEB++
    }
  })

  // Format Recharts data
  const data = Object.entries(channelCounts)
    .map(([channel, count]) => ({
      channel,
      count
    }))
    .filter(d => d.count > 0) // Only plot active channels

  // Fallback visual data if no orders are loaded yet
  const displayData = data.length > 0 ? data : [
    { channel: 'VOICE', count: 18 },
    { channel: 'WHATSAPP', count: 14 },
    { channel: 'WEB', count: 12 },
    { channel: 'SMS', count: 3 }
  ]

  const totalOrders = displayData.reduce((sum, d) => sum + d.count, 0)

  return (
    <Card className="p-6 bg-surface border-border flex flex-col h-[400px]">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-text-primary">Channel Breakdown</h3>
        <p className="text-sm text-text-muted">Order distribution by source</p>
      </div>

      <div className="flex-1 w-full relative">
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-3xl font-bold text-text-primary">{totalOrders}</span>
          <span className="text-[9px] text-text-muted uppercase tracking-widest font-black">Total Orders</span>
        </div>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={displayData}
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={110}
              paddingAngle={5}
              dataKey="count"
              nameKey="channel"
              stroke="none"
            >
              {displayData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ backgroundColor: '#1A1A24', border: '1px solid #2E2E3F', borderRadius: '8px' }}
              itemStyle={{ color: '#F1F1F3', fontSize: '11px' }}
            />
            <Legend 
              verticalAlign="bottom" 
              align="center" 
              layout="horizontal"
              iconType="circle"
              formatter={(value) => <span className="text-text-muted text-[10px] font-bold uppercase tracking-wider pl-1">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
