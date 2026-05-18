import { Order } from '../types'
import { subMinutes, subHours, subDays } from 'date-fns'

export const orders: Order[] = [
  {
    id: 'o1',
    orderNumber: '1047',
    tenantId: 'nypdq',
    customerId: 'c1',
    customerName: 'João Mendes',
    customerPhone: '+1 718-555-0123',
    items: [
      { id: 'i1', name: 'Pão de Queijo (3 pack)', quantity: 2, price: 8.50 },
      { id: 'i2', name: 'Brazilian Coffee', quantity: 1, price: 4.00 }
    ],
    subtotal: 21.00,
    deliveryFee: 2.50,
    tax: 1.00,
    total: 24.50,
    status: 'PAID',
    type: 'DELIVERY',
    channel: 'VOICE',
    address: '31st Ave, Astoria, NY',
    paymentStatus: 'PAID',
    createdAt: subMinutes(new Date(), 3).toISOString(),
    updatedAt: subMinutes(new Date(), 3).toISOString()
  },
  {
    id: 'o2',
    orderNumber: '1046',
    tenantId: 'nypdq',
    customerId: 'c2',
    customerName: 'Maria Silva',
    customerPhone: '+1 718-555-0124',
    items: [
      { id: 'i3', name: 'Acai Bowl', quantity: 1, price: 12.00 },
      { id: 'i4', name: 'Guaraná Antarctica', quantity: 1, price: 3.50 }
    ],
    subtotal: 15.50,
    deliveryFee: 0,
    tax: 1.00,
    total: 16.50,
    status: 'PREPARING',
    type: 'PICKUP',
    channel: 'WHATSAPP',
    paymentStatus: 'PAID',
    createdAt: subMinutes(new Date(), 15).toISOString(),
    updatedAt: subMinutes(new Date(), 10).toISOString(),
    estimatedReadyAt: subMinutes(new Date(), -10).toISOString()
  },
  {
    id: 'o3',
    orderNumber: '1045',
    tenantId: 'nypdq',
    customerId: 'c3',
    customerName: 'Ricardo Oliveira',
    customerPhone: '+1 718-555-0125',
    items: [
      { id: 'i5', name: 'Cheese Bread Combo', quantity: 1, price: 14.00 },
      { id: 'i6', name: 'Coxinha', quantity: 2, price: 4.50 }
    ],
    subtotal: 23.00,
    deliveryFee: 3.00,
    tax: 2.00,
    total: 28.00,
    status: 'READY',
    type: 'DELIVERY',
    channel: 'WEB',
    address: 'Broadway, Astoria, NY',
    paymentStatus: 'PAID',
    createdAt: subMinutes(new Date(), 45).toISOString(),
    updatedAt: subMinutes(new Date(), 20).toISOString()
  },
  {
    id: 'o4',
    orderNumber: '1044',
    tenantId: 'nypdq',
    customerId: 'c4',
    customerName: 'Ana Costa',
    customerPhone: '+1 718-555-0126',
    items: [
      { id: 'i7', name: 'Pastéis (2 pack)', quantity: 1, price: 7.50 },
      { id: 'i8', name: 'Suco de Maracujá', quantity: 1, price: 5.50 }
    ],
    subtotal: 13.00,
    deliveryFee: 0,
    tax: 1.00,
    total: 14.00,
    status: 'DELIVERED',
    type: 'PICKUP',
    channel: 'SMS',
    paymentStatus: 'PAID',
    createdAt: subHours(new Date(), 2).toISOString(),
    updatedAt: subHours(new Date(), 1).toISOString()
  },
  {
    id: 'o5',
    orderNumber: '1043',
    tenantId: 'nypdq',
    customerId: 'c5',
    customerName: 'Carlos Santos',
    customerPhone: '+1 718-555-0127',
    items: [
      { id: 'i9', name: 'Pão de Queijo (3 pack)', quantity: 1, price: 8.50 },
      { id: 'i10', name: 'Brigadeiro', quantity: 2, price: 3.00 }
    ],
    subtotal: 14.50,
    deliveryFee: 2.50,
    tax: 1.50,
    total: 18.50,
    status: 'PAID',
    type: 'DELIVERY',
    channel: 'VOICE',
    address: 'Steinway St, Astoria, NY',
    paymentStatus: 'PAID',
    createdAt: subMinutes(new Date(), 1).toISOString(),
    updatedAt: subMinutes(new Date(), 1).toISOString()
  }
  // ... more orders can be added as needed
]
