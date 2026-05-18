export type OrderStatus = 
  'PENDING' | 'PAID' | 'PREPARING' | 'READY' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED'

export type Channel = 'VOICE' | 'WHATSAPP' | 'SMS' | 'WEB'

export type ConsentTier = 'ESSENTIAL' | 'MARKETING' | 'INTELLIGENCE'

export type OrderType = 'DELIVERY' | 'PICKUP'

export interface OrderItem {
  id: string
  name: string
  quantity: number
  price: number
  notes?: string
}

export interface Order {
  id: string
  orderNumber: string
  tenantId: string
  customerId: string
  customerName: string
  customerPhone: string
  items: OrderItem[]
  subtotal: number
  deliveryFee: number
  tax: number
  total: number
  status: OrderStatus
  type: OrderType
  channel: Channel
  address?: string
  notes?: string
  paymentStatus: 'UNPAID' | 'PAID' | 'REFUNDED'
  createdAt: string
  updatedAt: string
  estimatedReadyAt?: string
}

export interface Customer {
  id: string
  tenantId: string
  name: string
  phone: string
  email?: string
  preferredChannel: Channel
  consents: {
    essential: boolean
    marketing: boolean
    intelligence: boolean
  }
  totalOrders: number
  totalSpent: number
  averageOrderValue: number
  lastOrderAt: string
  firstOrderAt: string
  churnRisk: 'LOW' | 'MEDIUM' | 'HIGH'
  ltv: number
  rfmSegment: string
  orders: Order[]
  calls: CallLog[]
  createdAt: string
}

export interface CallLog {
  id: string
  started_at: string
  customer_phone: string
  customer_name: string
  duration_seconds: number
  status: string
  cost_usd: number
  source: string
  transcript: any // jsonb
  summary: string
  recording_url?: string
  created_at: string
  updated_at: string
  vapi_account: string
  assistantId: string
  type: string
  
  // Backward compatibility fields for Customer profile history mapping
  channel?: string
  duration?: number
  intent?: string
  orderCreated?: boolean
  sentiment?: string
  createdAt?: string
}

export interface MenuItem {
  id: string
  tenantId: string
  name: string
  description: string
  price: number
  category: string
  imageUrl?: string
  available: boolean
  popular: boolean
  allergens: string[]
  preparationTime: number
}

export interface Campaign {
  id: string
  tenantId: string
  name: string
  channel: Channel
  status: 'DRAFT' | 'SCHEDULED' | 'SENT' | 'FAILED'
  segment: string
  recipientCount: number
  sentCount: number
  openRate?: number
  conversionRate?: number
  revenue?: number
  message: string
  scheduledAt?: string
  sentAt?: string
  createdAt: string
}

export interface AdAudience {
  id: string
  tenantId: string
  platform: 'META' | 'GOOGLE' | 'TIKTOK'
  name: string
  size: number
  lastSyncAt: string
  status: 'SYNCED' | 'SYNCING' | 'ERROR' | 'PENDING'
  consentGated: boolean
}

export interface Tenant {
  id: string
  name: string
  slug: string
  vertical: 'RESTAURANT' | 'CLINIC' | 'SERVICES'
  phone: string
  address: string
  logoUrl?: string
  primaryColor?: string
  voicePersona: string
  plan: 'STARTER' | 'GROWTH' | 'SCALE'
  stripeConnectId: string
}

export interface DashboardStats {
  today: {
    revenue: number
    orders: number
    avgOrderValue: number
    missedCalls: number
    newCustomers: number
    repeatRate: number
  }
  thisWeek: {
    revenue: number
    orders: number
    revenueChange: number
    ordersChange: number
  }
  revenueChart: { date: string; revenue: number; orders: number }[]
  topItems: { name: string; count: number; revenue: number }[]
  channelBreakdown: { channel: Channel; count: number; percentage: number }[]
}
