import { Customer, CallLog } from '../types'
import { subDays, subHours } from 'date-fns'

export const mockCallLogs: any[] = [
  {
    id: 'cl1',
    customerId: 'c1',
    duration: 142,
    channel: 'VOICE',
    transcript: 'Customer: Hello, I would like to order two pão de queijo packs and a coffee. AI: Of course! Would you like that for pickup or delivery? Customer: Delivery please, to 31st Ave. AI: Great, your total is $24.50. It will be ready in 20 minutes.',
    intent: 'Placed order',
    orderCreated: true,
    orderId: 'o1',
    sentiment: 'POSITIVE',
    createdAt: subHours(new Date(), 2).toISOString()
  },
  {
    id: 'cl2',
    customerId: 'c2',
    duration: 85,
    channel: 'VOICE',
    transcript: 'Customer: Hi, do you have any vegan options? AI: Yes, our Acai bowl is vegan if you skip the honey. Customer: Okay, thanks! I will visit later.',
    intent: 'FAQ inquiry',
    orderCreated: false,
    sentiment: 'NEUTRAL',
    createdAt: subDays(new Date(), 1).toISOString()
  }
]

export const customers: any[] = [
  {
    id: 'c1',
    tenantId: 'nypdq',
    name: 'João Mendes',
    phone: '+1 718-555-0123',
    email: 'joao.mendes@email.com',
    preferredChannel: 'VOICE',
    consents: {
      essential: true,
      marketing: true,
      intelligence: true
    },
    totalOrders: 14,
    totalSpent: 312.00,
    averageOrderValue: 22.28,
    lastOrderAt: subHours(new Date(), 2).toISOString(),
    firstOrderAt: subDays(new Date(), 240).toISOString(),
    churnRisk: 'LOW',
    ltv: 680,
    rfmSegment: 'Champion',
    orders: [], // Will be populated or handled in view
    calls: [mockCallLogs[0]],
    createdAt: subDays(new Date(), 240).toISOString()
  },
  {
    id: 'c2',
    tenantId: 'nypdq',
    name: 'Maria Silva',
    phone: '+1 718-555-0124',
    email: 'maria.s@email.com',
    preferredChannel: 'WHATSAPP',
    consents: {
      essential: true,
      marketing: true,
      intelligence: false
    },
    totalOrders: 8,
    totalSpent: 156.50,
    averageOrderValue: 19.56,
    lastOrderAt: subDays(new Date(), 1).toISOString(),
    firstOrderAt: subDays(new Date(), 120).toISOString(),
    churnRisk: 'MEDIUM',
    ltv: 420,
    rfmSegment: 'Loyal',
    orders: [],
    calls: [mockCallLogs[1]],
    createdAt: subDays(new Date(), 120).toISOString()
  },
  {
    id: 'c3',
    tenantId: 'nypdq',
    name: 'Ricardo Oliveira',
    phone: '+1 718-555-0125',
    preferredChannel: 'WEB',
    consents: {
      essential: true,
      marketing: false,
      intelligence: false
    },
    totalOrders: 34,
    totalSpent: 845.00,
    averageOrderValue: 24.85,
    lastOrderAt: subHours(new Date(), 5).toISOString(),
    firstOrderAt: subDays(new Date(), 365).toISOString(),
    churnRisk: 'LOW',
    ltv: 1200,
    rfmSegment: 'Champion',
    orders: [],
    calls: [],
    createdAt: subDays(new Date(), 365).toISOString()
  },
  {
    id: 'c4',
    tenantId: 'nypdq',
    name: 'Ana Costa',
    phone: '+1 718-555-0126',
    preferredChannel: 'SMS',
    consents: {
      essential: true,
      marketing: true,
      intelligence: true
    },
    totalOrders: 2,
    totalSpent: 45.00,
    averageOrderValue: 22.50,
    lastOrderAt: subDays(new Date(), 45).toISOString(),
    firstOrderAt: subDays(new Date(), 60).toISOString(),
    churnRisk: 'HIGH',
    ltv: 150,
    rfmSegment: 'At Risk',
    orders: [],
    calls: [],
    createdAt: subDays(new Date(), 60).toISOString()
  },
  {
    id: 'c5',
    tenantId: 'nypdq',
    name: 'Carlos Santos',
    phone: '+1 718-555-0127',
    preferredChannel: 'VOICE',
    consents: {
      essential: true,
      marketing: true,
      intelligence: true
    },
    totalOrders: 1,
    totalSpent: 18.50,
    averageOrderValue: 18.50,
    lastOrderAt: subHours(new Date(), 1).toISOString(),
    firstOrderAt: subHours(new Date(), 1).toISOString(),
    churnRisk: 'LOW',
    ltv: 200,
    rfmSegment: 'New',
    orders: [],
    calls: [],
    createdAt: subHours(new Date(), 1).toISOString()
  }
]
