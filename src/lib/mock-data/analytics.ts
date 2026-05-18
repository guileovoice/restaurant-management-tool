import { DashboardStats } from '../types'
import { subDays, format } from 'date-fns'

export const analyticsData: DashboardStats = {
  today: {
    revenue: 1847,
    orders: 47,
    avgOrderValue: 26.50,
    missedCalls: 3,
    newCustomers: 8,
    repeatRate: 68
  },
  thisWeek: {
    revenue: 12450,
    orders: 312,
    revenueChange: 12,
    ordersChange: 8
  },
  revenueChart: Array.from({ length: 14 }).map((_, i) => ({
    date: format(subDays(new Date(), 13 - i), 'MMM d'),
    revenue: Math.floor(Math.random() * (2400 - 800) + 800),
    orders: Math.floor(Math.random() * (60 - 20) + 20)
  })),
  topItems: [
    { name: 'Pão de Queijo (3 pack)', count: 142, revenue: 1207.00 },
    { name: 'Coxinha', count: 85, revenue: 382.50 },
    { name: 'Acai Bowl', count: 64, revenue: 768.00 },
    { name: 'Brazilian Coffee', count: 120, revenue: 480.00 },
    { name: 'Brigadeiro', count: 95, revenue: 285.00 }
  ],
  channelBreakdown: [
    { channel: 'VOICE', count: 21, percentage: 45 },
    { channel: 'WHATSAPP', count: 14, percentage: 30 },
    { channel: 'WEB', count: 12, percentage: 25 }
  ]
}
