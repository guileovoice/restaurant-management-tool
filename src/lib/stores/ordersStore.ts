import { create } from 'zustand'
import { Order, OrderStatus } from '../types'
import { supabase } from '../supabaseClient'

interface OrdersState {
  orders: Order[]
  isLoading: boolean
  fetchOrders: () => Promise<void>
  updateOrderStatus: (orderId: string, newStatus: OrderStatus) => Promise<void>
  addOrder: (order: Order) => Promise<void>
}

export const useOrdersStore = create<OrdersState>((set) => ({
  orders: [],
  isLoading: false,

  fetchOrders: async () => {
    set({ isLoading: true })
    try {
      console.log("[useOrdersStore] Triggering supabase select with joined order_items...");
      
      // Fetch all orders and join their order_items in a single fast query
      const { data: dbOrders, error: ordersErr } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false })

      if (ordersErr) {
        console.error("[useOrdersStore] Error fetching orders joined with items:", ordersErr)
        set({ isLoading: false })
        return
      }

      console.log(`[useOrdersStore] Successfully loaded ${dbOrders?.length || 0} orders from Supabase:`, dbOrders)

      // Map db orders directly to the frontend Order interface
      const mappedOrders: Order[] = (dbOrders || []).map(o => {
        let orderStatus = o.status as OrderStatus
        let orderNotes = o.notes || ''

        if (orderNotes.includes('[STATUS:OUT_FOR_DELIVERY]')) {
          orderStatus = 'OUT_FOR_DELIVERY'
          orderNotes = orderNotes.replace(/\[STATUS:OUT_FOR_DELIVERY\]/g, '').trim()
        }

        return {
          id: o.id,
          orderNumber: o.order_number || '',
          tenantId: o.tenant_id || '',
          customerId: o.customer_id || '',
          customerName: o.customer_name || '',
          customerPhone: o.customer_phone || '',
          items: (o.order_items || []).map((item: any) => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: Number(item.price),
            notes: item.notes || ''
          })),
          subtotal: Number(o.subtotal || 0),
          deliveryFee: Number(o.delivery_fee || 0),
          tax: Number(o.tax || 0),
          total: Number(o.total || 0),
          status: orderStatus,
          type: o.type as any,
          channel: o.channel as any,
          address: o.address || '',
          notes: orderNotes,
          paymentStatus: o.payment_status as any,
          createdAt: o.created_at,
          updatedAt: o.updated_at,
          estimatedReadyAt: o.estimated_ready_at || undefined
        }
      })

      set({ orders: mappedOrders, isLoading: false })
    } catch (e) {
      console.error("[useOrdersStore] Catastrophic catch in fetchOrders:", e)
      set({ isLoading: false })
    }
  },

  updateOrderStatus: async (orderId, newStatus) => {
    try {
      const updatedTime = new Date().toISOString()
      
      let dbStatus = newStatus
      let dbNotesUpdate: string | undefined = undefined

      if (newStatus === 'OUT_FOR_DELIVERY') {
        dbStatus = 'READY'
        const localOrder = useOrdersStore.getState().orders.find(o => o.id === orderId)
        const baseNotes = localOrder?.notes || ''
        const cleanedNotes = baseNotes.replace(/\[STATUS:\w+\]/g, '').trim()
        dbNotesUpdate = `${cleanedNotes} [STATUS:OUT_FOR_DELIVERY]`.trim()
      } else {
        const localOrder = useOrdersStore.getState().orders.find(o => o.id === orderId)
        if (localOrder?.notes?.includes('[STATUS:')) {
          dbNotesUpdate = localOrder.notes.replace(/\[STATUS:\w+\]/g, '').trim()
        }
      }

      const updatePayload: any = {
        status: dbStatus,
        updated_at: updatedTime
      }
      if (dbNotesUpdate !== undefined) {
        updatePayload.notes = dbNotesUpdate
      }

      const { error } = await supabase
        .from('orders')
        .update(updatePayload)
        .eq('id', orderId)

      if (error) {
        console.error("Error updating order status in Supabase:", error)
        return
      }

      // Update local state for rapid UI feedback
      set((state) => ({
        orders: state.orders.map((order) => 
          order.id === orderId 
            ? { 
                ...order, 
                status: newStatus, 
                notes: dbNotesUpdate !== undefined ? dbNotesUpdate.replace(/\[STATUS:OUT_FOR_DELIVERY\]/g, '').trim() : order.notes,
                updatedAt: updatedTime 
              } 
            : order
        )
      }))
    } catch (e) {
      console.error("Catch in updateOrderStatus:", e)
    }
  },

  addOrder: async (order) => {
    try {
      let dbStatus = order.status
      let dbNotes = order.notes || ''
      if (order.status === 'OUT_FOR_DELIVERY') {
        dbStatus = 'READY'
        dbNotes = `${dbNotes} [STATUS:OUT_FOR_DELIVERY]`.trim()
      }

      const dbOrder = {
        id: order.id,
        order_number: order.orderNumber,
        tenant_id: order.tenantId || '395b50b9-9504-47ce-a8be-3b5c3ff22315',
        customer_id: order.customerId || null,
        customer_name: order.customerName,
        customer_phone: order.customerPhone,
        subtotal: order.subtotal,
        delivery_fee: order.deliveryFee,
        tax: order.tax,
        total: order.total,
        status: dbStatus,
        type: order.type,
        channel: order.channel,
        address: order.address,
        notes: dbNotes,
        payment_status: order.paymentStatus,
        estimated_ready_at: order.estimatedReadyAt,
        created_at: order.createdAt || new Date().toISOString(),
        updated_at: order.updatedAt || new Date().toISOString()
      }

      const { error: orderErr } = await supabase.from('orders').insert([dbOrder])
      if (orderErr) {
        console.error("Error adding order in Supabase:", orderErr)
        return
      }

      if (order.items && order.items.length > 0) {
        const dbItems = order.items.map(item => ({
          order_id: order.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          notes: item.notes || ''
        }))

        const { error: itemsErr } = await supabase.from('order_items').insert(dbItems)
        if (itemsErr) {
          console.error("Error adding order items in Supabase:", itemsErr)
        }
      }

      // Update local state
      set((state) => ({
        orders: [order, ...state.orders]
      }))
    } catch (e) {
      console.error("Catch in addOrder:", e)
    }
  }
}))
