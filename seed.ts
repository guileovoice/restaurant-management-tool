import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
dotenv.config({ path: join(__dirname, '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function seed() {
  console.log('Starting seed script...')

  // Fetch all orders
  const { data: orders, error: ordersErr } = await supabase.from('orders').select('*')
  if (ordersErr) {
    console.error('Error fetching orders:', ordersErr)
    return
  }

  console.log(`Found ${orders.length} orders. Migrating data...`)

  // Fetch all order_items from the old table
  const { data: allItems, error: itemsErr } = await supabase.from('order_items').select('*')
  if (itemsErr) {
    console.error('Error fetching old order items:', itemsErr)
    // We'll continue in case the table doesn't exist or is empty
  }

  for (const order of orders) {
    let updateNeeded = false
    const updateData: any = {}

    // Check if order_place_at is missing
    if (!order.order_place_at) {
      updateData.order_place_at = order.created_at
      updateNeeded = true
    }

    // Check if order_items column is empty
    if (!order.order_items || (typeof order.order_items === 'string' && order.order_items === '[]') || (Array.isArray(order.order_items) && order.order_items.length === 0)) {
      // Find items from old table
      const itemsForOrder = (allItems || []).filter(item => item.order_id === order.id)
      
      let finalItems = []
      if (itemsForOrder.length > 0) {
        finalItems = itemsForOrder.map(i => ({
          id: i.id,
          name: i.name,
          quantity: i.quantity,
          price: i.price,
          notes: i.notes || ''
        }))
      } else {
        // Generate some dummy items based on subtotal to make it look right
        const numItems = Math.max(1, Math.floor((order.subtotal || 15) / 10))
        const pricePerItem = (order.subtotal || 15) / numItems
        
        finalItems = Array.from({ length: numItems }).map((_, idx) => ({
          id: `dummy-${order.id}-${idx}`,
          name: idx === 0 ? 'Classic Pão de Queijo' : 'Guarana Antarctica',
          quantity: idx === 0 ? 3 : 1,
          price: pricePerItem,
          notes: ''
        }))
      }

      // Try saving as JSON string first, if column is JSONB Supabase handles JSON parsing, if text it saves string.
      updateData.order_items = JSON.stringify(finalItems)
      updateNeeded = true
    }

    if (updateNeeded) {
      const { error: updateErr } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', order.id)

      if (updateErr) {
        // If it failed because of string/JSON type mismatch, try sending as object
        if (updateErr.message.includes('invalid input syntax for type json')) {
          console.log(`Retrying order ${order.id} with object instead of string`)
          updateData.order_items = JSON.parse(updateData.order_items)
          await supabase.from('orders').update(updateData).eq('id', order.id)
        } else {
          console.error(`Error updating order ${order.id}:`, updateErr)
        }
      } else {
        console.log(`Migrated order ${order.id}`)
      }
    }
  }

  console.log('Seed/Migration complete!')
}

seed().catch(console.error)
