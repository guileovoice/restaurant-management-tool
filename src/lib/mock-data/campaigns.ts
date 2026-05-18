import { Campaign, AdAudience } from '../types'
import { subDays } from 'date-fns'

export const campaigns: Campaign[] = [
  {
    id: 'camp1',
    tenantId: 'nypdq',
    name: 'Birthday Special — May',
    channel: 'WHATSAPP',
    status: 'SENT',
    segment: 'Birthday this month',
    recipientCount: 47,
    sentCount: 47,
    openRate: 72,
    conversionRate: 28,
    revenue: 430,
    message: 'Feliz aniversário! 🎉 Get a free brigadeiro on your next visit at NYPDQ Astoria. Show this message at checkout!',
    sentAt: subDays(new Date(), 14).toISOString(),
    createdAt: subDays(new Date(), 20).toISOString()
  },
  {
    id: 'camp2',
    tenantId: 'nypdq',
    name: 'New Item Launch: Feijoada',
    channel: 'SMS',
    status: 'SCHEDULED',
    segment: 'All customers',
    recipientCount: 312,
    sentCount: 0,
    message: 'Our famous Feijoada is back this Saturday! Pre-order now to guarantee your bowl. Reply ORDER to start.',
    scheduledAt: subDays(new Date(), -1).toISOString(),
    createdAt: subDays(new Date(), 2).toISOString()
  }
]

export const adAudiences: AdAudience[] = [
  {
    id: 'aud1',
    tenantId: 'nypdq',
    platform: 'META',
    name: 'All Customers',
    size: 187,
    lastSyncAt: subDays(new Date(), 0).toISOString(),
    status: 'SYNCED',
    consentGated: true
  },
  {
    id: 'aud2',
    tenantId: 'nypdq',
    platform: 'META',
    name: 'High-Value Customers',
    size: 67,
    lastSyncAt: subDays(new Date(), 0).toISOString(),
    status: 'SYNCED',
    consentGated: true
  }
]
